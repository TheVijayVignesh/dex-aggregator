import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // Exchanges
  app.get(api.exchanges.list.path, async (req, res) => {
    const exchanges = await storage.getExchanges();
    res.json(exchanges);
  });

  // Tokens
  app.get(api.tokens.list.path, async (req, res) => {
    const tokens = await storage.getTokens();
    res.json(tokens);
  });

  // Prices
  app.get(api.prices.list.path, async (req, res) => {
    const prices = await storage.getPrices();
    res.json(prices);
  });

  app.get(api.prices.getBestRate.path, async (req, res) => {
    // Simple logic: Find lowest price for fromToken and highest for toToken? 
    // Wait, price is usually "Value of 1 Token in USD".
    // Rate = Price(From) / Price(To)
    // We want to maximize Output = Amount * Rate.
    // We need to find the exchange that gives the best rate for this PAIR.
    // For simplicity, we'll assume we buy/sell at the USD price listed.
    // Best Route: Sell FromToken at Max Price, Buy ToToken at Min Price?
    // Aggregator logic: Usually you swap on ONE exchange. 
    // So we calculate Output for each exchange: Amount * (PriceFrom / PriceTo) on that exchange.
    
    const { fromTokenId, toTokenId, amount } = req.query;
    if (!fromTokenId || !toTokenId || !amount) {
      return res.status(400).json({ message: "Missing params" });
    }

    const prices = await storage.getPrices();
    const exchanges = await storage.getExchanges();
    
    let bestExchange = null;
    let maxOutput = -1;
    let bestRate = 0;

    const amountNum = parseFloat(amount as string);

    for (const exchange of exchanges) {
      const fromPrice = prices.find(p => p.exchangeId === exchange.id && p.tokenId === parseInt(fromTokenId as string));
      const toPrice = prices.find(p => p.exchangeId === exchange.id && p.tokenId === parseInt(toTokenId as string));

      if (fromPrice && toPrice) {
        // Calculate output
        const rate = parseFloat(fromPrice.price) / parseFloat(toPrice.price);
        const output = amountNum * rate;
        
        if (output > maxOutput) {
          maxOutput = output;
          bestExchange = exchange;
          bestRate = rate;
        }
      }
    }

    if (!bestExchange) {
      return res.status(404).json({ message: "No route found" });
    }

    res.json({
      exchange: bestExchange,
      rate: bestRate.toFixed(6),
      estimatedOutput: maxOutput.toFixed(6),
    });
  });

  // Transactions
  app.get(api.transactions.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const txs = await storage.getTransactions(userId);
    res.json(txs);
  });

  app.post(api.transactions.create.path, isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.transactions.create.input.parse(req.body);
      
      const tx = await storage.createTransaction({
        ...input,
        userId,
      });
      
      res.status(201).json(tx);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Seed Data (if empty)
  await seedData();

  return httpServer;
}

async function seedData() {
  const exchanges = await storage.getExchanges();
  if (exchanges.length === 0) {
    console.log("Seeding data...");
    const dex1 = await storage.createExchange({ name: "Uniswap", url: "https://uniswap.org", logoUrl: "" });
    const dex2 = await storage.createExchange({ name: "SushiSwap", url: "https://sushi.com", logoUrl: "" });
    const dex3 = await storage.createExchange({ name: "Curve", url: "https://curve.fi", logoUrl: "" });

    const eth = await storage.createToken({ symbol: "ETH", name: "Ethereum", decimals: 18 });
    const btc = await storage.createToken({ symbol: "WBTC", name: "Wrapped Bitcoin", decimals: 8 });
    const usdc = await storage.createToken({ symbol: "USDC", name: "USD Coin", decimals: 6 });

    // Seed Prices (random variations)
    const basePrices = {
      [eth.id]: 2500,
      [btc.id]: 65000,
      [usdc.id]: 1,
    };

    const dexs = [dex1, dex2, dex3];
    const tokens = [eth, btc, usdc];

    for (const dex of dexs) {
      for (const token of tokens) {
        const variance = 0.99 + Math.random() * 0.02; // +/- 1%
        const price = (basePrices[token.id] * variance).toFixed(4);
        await storage.createPrice({
          exchangeId: dex.id,
          tokenId: token.id,
          price: price,
        });
      }
    }
    console.log("Seeding complete.");
  }
}
