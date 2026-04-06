import "dotenv/config";
import { db } from "../server/db";
import { cryptoAssets, exchangeProviders } from "../shared/schema";

async function seed() {
  console.log("🌱 Starting database seeding...");

  // Insert exchange providers
  console.log("📊 Inserting exchange providers...");
  const providers = [
    { name: "Binance", feePercentage: "0.001" },
    { name: "Coinbase", feePercentage: "0.0015" },
    { name: "Kraken", feePercentage: "0.0016" },
    { name: "KuCoin", feePercentage: "0.001" },
    { name: "OKX", feePercentage: "0.001" },
    { name: "Bybit", feePercentage: "0.001" },
    { name: "Gate.io", feePercentage: "0.0018" },
    { name: "Huobi", feePercentage: "0.002" }
  ];

  for (const provider of providers) {
    await db.insert(exchangeProviders).values(provider).onConflictDoNothing();
  }
  console.log(`✅ Inserted ${providers.length} exchange providers`);

  // Insert crypto assets
  console.log("🪙 Inserting crypto assets...");
  const assets = [
    // Major cryptocurrencies
    { symbol: "BTC", name: "Bitcoin", basePriceUsd: "65000", volatility: "0.02", drift: "0.0001" },
    { symbol: "ETH", name: "Ethereum", basePriceUsd: "3500", volatility: "0.025", drift: "0.00015" },
    { symbol: "BNB", name: "Binance Coin", basePriceUsd: "580", volatility: "0.03", drift: "0.0002" },
    { symbol: "SOL", name: "Solana", basePriceUsd: "180", volatility: "0.04", drift: "0.00025" },
    { symbol: "XRP", name: "Ripple", basePriceUsd: "0.52", volatility: "0.035", drift: "-0.0001" },
    { symbol: "ADA", name: "Cardano", basePriceUsd: "0.38", volatility: "0.04", drift: "0.0001" },
    { symbol: "DOGE", name: "Dogecoin", basePriceUsd: "0.085", volatility: "0.08", drift: "0.0003" },
    { symbol: "AVAX", name: "Avalanche", basePriceUsd: "36", volatility: "0.045", drift: "0.0002" },
    { symbol: "DOT", name: "Polkadot", basePriceUsd: "7.2", volatility: "0.04", drift: "0.0001" },
    { symbol: "LINK", name: "Chainlink", basePriceUsd: "14.5", volatility: "0.038", drift: "0.00015" },
    
    // Mid-tier cryptocurrencies
    { symbol: "MATIC", name: "Polygon", basePriceUsd: "0.92", volatility: "0.05", drift: "0.0002" },
    { symbol: "UNI", name: "Uniswap", basePriceUsd: "6.8", volatility: "0.042", drift: "0.0001" },
    { symbol: "ATOM", name: "Cosmos", basePriceUsd: "9.5", volatility: "0.045", drift: "-0.00005" },
    { symbol: "LTC", name: "Litecoin", basePriceUsd: "72", volatility: "0.032", drift: "0.0001" },
    { symbol: "ETC", name: "Ethereum Classic", basePriceUsd: "28", volatility: "0.038", drift: "-0.0001" },
    { symbol: "XLM", name: "Stellar", basePriceUsd: "0.12", volatility: "0.055", drift: "0.0001" },
    { symbol: "ALGO", name: "Algorand", basePriceUsd: "0.18", volatility: "0.048", drift: "0.00015" },
    { symbol: "VET", name: "VeChain", basePriceUsd: "0.025", volatility: "0.06", drift: "0.0002" },
    { symbol: "ICP", name: "Internet Computer", basePriceUsd: "12.5", volatility: "0.05", drift: "-0.0001" },
    { symbol: "FIL", name: "Filecoin", basePriceUsd: "5.8", volatility: "0.055", drift: "0.0001" },
    
    // Lower tier cryptocurrencies
    { symbol: "THETA", name: "Theta Network", basePriceUsd: "1.2", volatility: "0.06", drift: "0.0002" },
    { symbol: "EOS", name: "EOS", basePriceUsd: "0.58", volatility: "0.058", drift: "-0.00005" },
    { symbol: "AAVE", name: "Aave", basePriceUsd: "95", volatility: "0.04", drift: "0.0001" },
    { symbol: "MKR", name: "Maker", basePriceUsd: "1850", volatility: "0.035", drift: "0.00015" },
    { symbol: "COMP", name: "Compound", basePriceUsd: "48", volatility: "0.042", drift: "0.0001" },
    { symbol: "SNX", name: "Synthetix", basePriceUsd: "2.8", volatility: "0.065", drift: "0.0002" },
    { symbol: "YFI", name: "yearn.finance", basePriceUsd: "7200", volatility: "0.045", drift: "0.0001" },
    { symbol: "SUSHI", name: "SushiSwap", basePriceUsd: "1.5", volatility: "0.058", drift: "0.0001" },
    { symbol: "CRV", name: "Curve DAO Token", basePriceUsd: "0.85", volatility: "0.062", drift: "0.00015" },
    { symbol: "BAL", name: "Balancer", basePriceUsd: "4.2", volatility: "0.055", drift: "0.0001" },
    
    // DeFi tokens
    { symbol: "1INCH", name: "1inch", basePriceUsd: "0.38", volatility: "0.06", drift: "0.0001" },
    { symbol: "RUNE", name: "THORChain", basePriceUsd: "5.5", volatility: "0.065", drift: "0.0002" },
    { symbol: "FTM", name: "Fantom", basePriceUsd: "0.42", volatility: "0.07", drift: "0.00015" },
    { symbol: "NEAR", name: "NEAR Protocol", basePriceUsd: "1.8", volatility: "0.058", drift: "0.0001" },
    { symbol: "ONE", name: "Harmony", basePriceUsd: "0.015", volatility: "0.08", drift: "0.0002" },
    { symbol: "HBAR", name: "Hedera", basePriceUsd: "0.085", volatility: "0.055", drift: "0.0001" },
    { symbol: "EGLD", name: "MultiversX", basePriceUsd: "35", volatility: "0.06", drift: "0.0002" },
    { symbol: "KSM", name: "Kusama", basePriceUsd: "22", volatility: "0.065", drift: "0.0001" },
    { symbol: "ZEC", name: "Zcash", basePriceUsd: "28", volatility: "0.045", drift: "-0.00005" },
    { symbol: "DASH", name: "Dash", basePriceUsd: "32", volatility: "0.042", drift: "0.0001" },
    
    // Privacy coins
    { symbol: "DCR", name: "Decred", basePriceUsd: "18", volatility: "0.048", drift: "0.0001" },
    { symbol: "XMR", name: "Monero", basePriceUsd: "165", volatility: "0.038", drift: "0.0001" },
    { symbol: "WAVES", name: "Waves", basePriceUsd: "2.2", volatility: "0.062", drift: "0.00015" },
    { symbol: "ICX", name: "ICON", basePriceUsd: "0.28", volatility: "0.068", drift: "0.0001" },
    { symbol: "QTUM", name: "Qtum", basePriceUsd: "3.8", volatility: "0.058", drift: "0.0001" },
    { symbol: "ZIL", name: "Zilliqa", basePriceUsd: "0.022", volatility: "0.075", drift: "0.0002" },
    { symbol: "ONT", name: "Ontology", basePriceUsd: "0.18", volatility: "0.07", drift: "0.0001" },
    
    // Gaming & NFT tokens
    { symbol: "BAT", name: "Basic Attention Token", basePriceUsd: "0.25", volatility: "0.065", drift: "0.0001" },
    { symbol: "ZRX", name: "0x", basePriceUsd: "0.32", volatility: "0.06", drift: "0.0001" },
    { symbol: "ENJ", name: "Enjin Coin", basePriceUsd: "0.42", volatility: "0.07", drift: "0.00015" },
    { symbol: "MANA", name: "Decentraland", basePriceUsd: "0.58", volatility: "0.075", drift: "0.0002" },
    { symbol: "SAND", name: "The Sandbox", basePriceUsd: "0.65", volatility: "0.072", drift: "0.00015" },
    { symbol: "AXS", name: "Axie Infinity", basePriceUsd: "7.5", volatility: "0.08", drift: "0.0002" },
    { symbol: "GALA", name: "Gala", basePriceUsd: "0.025", volatility: "0.09", drift: "0.00025" },
    { symbol: "CHZ", name: "Chiliz", basePriceUsd: "0.12", volatility: "0.085", drift: "0.0002" },
    { symbol: "FLOW", name: "Flow", basePriceUsd: "0.85", volatility: "0.068", drift: "0.0001" },
    { symbol: "IMX", name: "Immutable X", basePriceUsd: "1.2", volatility: "0.075", drift: "0.00015" },
    
    // Newer popular tokens
    { symbol: "APE", name: "ApeCoin", basePriceUsd: "1.5", volatility: "0.08", drift: "0.0002" },
    { symbol: "GMT", name: "StepN", basePriceUsd: "0.18", volatility: "0.09", drift: "0.00025" },
    { symbol: "BLUR", name: "Blur", basePriceUsd: "0.42", volatility: "0.085", drift: "0.0002" },
    { symbol: "ARB", name: "Arbitrum", basePriceUsd: "1.2", volatility: "0.065", drift: "0.0001" },
    { symbol: "OP", name: "Optimism", basePriceUsd: "2.5", volatility: "0.07", drift: "0.00015" },
    { symbol: "LDO", name: "Lido DAO", basePriceUsd: "2.8", volatility: "0.068", drift: "0.0001" },
    { symbol: "RPL", name: "Rocket Pool", basePriceUsd: "18", volatility: "0.062", drift: "0.0001" },
    { symbol: "FXS", name: "Frax Share", basePriceUsd: "6.5", volatility: "0.058", drift: "0.0001" },
    
    // Stablecoins (low volatility)
    { symbol: "FRAX", name: "Frax", basePriceUsd: "1.0", volatility: "0.005", drift: "0.00001" },
    { symbol: "TUSD", name: "TrueUSD", basePriceUsd: "1.0", volatility: "0.005", drift: "0.00001" },
    { symbol: "USDP", name: "Pax Dollar", basePriceUsd: "1.0", volatility: "0.005", drift: "0.00001" },
    { symbol: "DAI", name: "Dai", basePriceUsd: "1.0", volatility: "0.008", drift: "0.00001" },
    
    // Solana ecosystem
    { symbol: "RAY", name: "Raydium", basePriceUsd: "0.25", volatility: "0.09", drift: "0.00025" },
    { symbol: "SRM", name: "Serum", basePriceUsd: "0.035", volatility: "0.095", drift: "0.0003" },
    { symbol: "ORCA", name: "Orca", basePriceUsd: "3.5", volatility: "0.085", drift: "0.0002" },
    { symbol: "JTO", name: "Jito", basePriceUsd: "2.8", volatility: "0.08", drift: "0.0002" },
    { symbol: "PYTH", name: "Pyth Network", basePriceUsd: "0.42", volatility: "0.082", drift: "0.0002" },
    
    // Meme coins
    { symbol: "WIF", name: "dogwifhat", basePriceUsd: "1.5", volatility: "0.12", drift: "0.0003" },
    { symbol: "BOME", name: "BOOK OF MEME", basePriceUsd: "0.0085", volatility: "0.15", drift: "0.0004" },
    { symbol: "POPCAT", name: "Popcat", basePriceUsd: "0.35", volatility: "0.11", drift: "0.0003" },
    { symbol: "MOG", name: "Mog Coin", basePriceUsd: "0.0000012", volatility: "0.14", drift: "0.0004" },
    { symbol: "PEPE", name: "Pepe", basePriceUsd: "0.0000085", volatility: "0.13", drift: "0.00035" },
    { symbol: "FLOKI", name: "FLOKI", basePriceUsd: "0.00012", volatility: "0.12", drift: "0.0003" },
    { symbol: "SHIB", name: "Shiba Inu", basePriceUsd: "0.0000095", volatility: "0.11", drift: "0.00025" },
    { symbol: "BABYDOGE", name: "Baby Doge Coin", basePriceUsd: "0.000000025", volatility: "0.14", drift: "0.0004" },
    
    // AI & Other emerging tokens
    { symbol: "WLD", name: "Worldcoin", basePriceUsd: "2.2", volatility: "0.085", drift: "0.0002" },
    { symbol: "CFG", name: "Centrifuge", basePriceUsd: "0.45", volatility: "0.075", drift: "0.00015" },
    { symbol: "CELO", name: "Celo", basePriceUsd: "0.68", volatility: "0.07", drift: "0.00015" },
    { symbol: "GLMR", name: "Moonbeam", basePriceUsd: "0.22", volatility: "0.08", drift: "0.0002" },
    { symbol: "MOVR", name: "Moonriver", basePriceUsd: "8.5", volatility: "0.075", drift: "0.00015" },
    
    // Polkadot ecosystem
    { symbol: "ACA", name: "Acala", basePriceUsd: "0.085", volatility: "0.085", drift: "0.0002" },
    { symbol: "KAR", name: "Karura", basePriceUsd: "0.32", volatility: "0.08", drift: "0.0002" },
    { symbol: "BSX", name: "Basilisk", basePriceUsd: "0.012", volatility: "0.09", drift: "0.00025" },
    { symbol: "HDX", name: "Hydration", basePriceUsd: "0.028", volatility: "0.088", drift: "0.00022" },
    { symbol: "PHA", name: "Phala Network", basePriceUsd: "0.15", volatility: "0.082", drift: "0.00018" },
    
    // Other layer 1s and infrastructure
    { symbol: "CFX", name: "Conflux", basePriceUsd: "0.18", volatility: "0.078", drift: "0.00015" },
    { symbol: "KAVA", name: "Kava", basePriceUsd: "0.85", volatility: "0.072", drift: "0.00015" },
    { symbol: "ROSE", name: "Oasis Network", basePriceUsd: "0.088", volatility: "0.075", drift: "0.00015" },
    { symbol: "SKL", name: "Skale", basePriceUsd: "0.045", volatility: "0.085", drift: "0.0002" },
    { symbol: "NMR", name: "Numeraire", basePriceUsd: "12.5", volatility: "0.065", drift: "0.00012" },
    { symbol: "STORJ", name: "Storj", basePriceUsd: "0.42", volatility: "0.07", drift: "0.00015" },
    { symbol: "ANKR", name: "Ankr", basePriceUsd: "0.025", volatility: "0.08", drift: "0.0002" },
    { symbol: "OCEAN", name: "Ocean Protocol", basePriceUsd: "0.38", volatility: "0.075", drift: "0.00015" }
  ];

  for (const asset of assets) {
    await db.insert(cryptoAssets).values(asset).onConflictDoNothing();
  }
  console.log(`✅ Inserted ${assets.length} crypto assets`);

  console.log("🎉 Database seeding completed successfully!");
}

seed().catch((error) => {
  console.error("❌ Error seeding database:", error);
  process.exit(1);
});
