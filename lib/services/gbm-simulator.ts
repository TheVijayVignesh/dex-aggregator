import "dotenv/config";
import { db } from "../../server/db";
import { cryptoAssets, exchangeProviders, simulatedRates } from "../../shared/schema";
import { eq, lt, and } from "drizzle-orm";

type Asset = {
  symbol: string;
  volatility: number;
  drift: number;
};

type Provider = {
  id: number;
  name: string;
  fee_percentage: number;
};

type RateRecord = {
  fromAsset: string;
  toAsset: string;
  providerId: number;
  rate: string;
  inverseRate: string;
  simulatedAt: Date;
};

function simulateNextPrice(currentPrice: number, mu: number, sigma: number, dt: number): number {
  // Generate standard normal random variable using Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  const Z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  
  // GBM formula: S(t+dt) = S(t) * exp((mu - 0.5 * sigma^2) * dt + sigma * sqrt(dt) * Z)
  const result = currentPrice * Math.exp((mu - 0.5 * sigma * sigma) * dt + sigma * Math.sqrt(dt) * Z);
  
  // Never return a value <= 0
  if (result <= 0) {
    return currentPrice * 0.0001;
  }
  
  return result;
}

function generateAllRates(
  assets: Asset[], 
  providers: Provider[], 
  currentPrices: Map<string, number>, 
  dt: number
): RateRecord[] {
  const rateRecords: RateRecord[] = [];
  const newPrices = new Map<string, number>();
  
  // Simulate next prices for all assets
  for (const asset of assets) {
    const currentPrice = currentPrices.get(asset.symbol);
    if (currentPrice !== undefined) {
      const newPrice = simulateNextPrice(currentPrice, asset.drift, asset.volatility, dt);
      newPrices.set(asset.symbol, newPrice);
    }
  }
  
  // Update currentPrices in-place with new simulated prices
  for (const [symbol, price] of Array.from(newPrices.entries())) {
    currentPrices.set(symbol, price);
  }
  
  // Generate rates for all ordered pairs (fromAsset, toAsset) where fromAsset !== toAsset
  for (const fromAsset of assets) {
    for (const toAsset of assets) {
      if (fromAsset.symbol === toAsset.symbol) continue;
      
      const fromPrice = newPrices.get(fromAsset.symbol);
      const toPrice = newPrices.get(toAsset.symbol);
      
      if (fromPrice && toPrice && fromPrice > 0) {
        for (const provider of providers) {
          const rawRate = toPrice / fromPrice;
          const providerRate = rawRate * (1 - provider.fee_percentage);
          const inverseRate = 1 / providerRate;
          
          rateRecords.push({
            fromAsset: fromAsset.symbol,
            toAsset: toAsset.symbol,
            providerId: provider.id,
            rate: providerRate.toString(),
            inverseRate: inverseRate.toString(),
            simulatedAt: new Date()
          });
        }
      }
    }
  }
  
  return rateRecords;
}

class GBMScheduler {
  private currentPrices: Map<string, number> = new Map();
  private intervalHandle: NodeJS.Timeout | null = null;
  private assets: Asset[] = [];
  private providers: Provider[] = [];

  async initialize(): Promise<void> {
    console.log("🔄 Initializing GBM scheduler...");
    
    // Fetch all active assets from crypto_assets table
    const assetsData = await db.select().from(cryptoAssets).where(eq(cryptoAssets.isActive, true));
    this.assets = assetsData.map(asset => ({
      symbol: asset.symbol,
      volatility: Number(asset.volatility),
      drift: Number(asset.drift)
    }));
    
    // Fetch all active providers from exchange_providers table
    const providersData = await db.select().from(exchangeProviders).where(eq(exchangeProviders.isActive, true));
    this.providers = providersData.map(provider => ({
      id: provider.id,
      name: provider.name,
      fee_percentage: Number(provider.feePercentage)
    }));
    
    // Populate currentPrices using base_price_usd as starting prices
    for (const asset of assetsData) {
      this.currentPrices.set(asset.symbol, Number(asset.basePriceUsd));
    }
    
    console.log(`✅ Initialized with ${this.assets.length} assets and ${this.providers.length} providers`);
  }

  async runOnce(): Promise<void> {
    console.log("⚡ Running GBM simulation...");
    
    const dt = 1 / 365 / 24; // One hour in years
    const rateRecords = generateAllRates(this.assets, this.providers, this.currentPrices, dt);
    
    // Batch insert all generated RateRecords into simulated_rates table
    if (rateRecords.length > 0) {
      // Insert in batches of 1000 to avoid stack overflow
      const batchSize = 1000;
      for (let i = 0; i < rateRecords.length; i += batchSize) {
        const batch = rateRecords.slice(i, i + batchSize);
        await db.insert(simulatedRates).values(batch);
      }
    }
    
    // Delete records from simulated_rates older than 2 hours
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    await db.delete(simulatedRates).where(lt(simulatedRates.simulatedAt, twoHoursAgo));
    
    console.log(`📊 Simulated ${rateRecords.length} rates for ${this.assets.length} assets across ${this.providers.length} providers at ${new Date().toISOString()}`);
  }

  start(intervalMs: number): void {
    if (this.intervalHandle) {
      console.log("⚠️ GBM scheduler is already running");
      return;
    }
    
    console.log(`🚀 Starting GBM scheduler with ${intervalMs}ms interval`);
    
    // Run once immediately
    this.runOnce().catch(error => {
      console.error("❌ Error in initial GBM simulation:", error);
    });
    
    // Set repeating interval
    this.intervalHandle = setInterval(() => {
      this.runOnce().catch(error => {
        console.error("❌ Error in GBM simulation:", error);
      });
    }, intervalMs);
  }

  stop(): void {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
      console.log("⏹️ GBM scheduler stopped");
    } else {
      console.log("⚠️ GBM scheduler is not running");
    }
  }

  // Getter for current prices (useful for testing or external queries)
  getCurrentPrices(): Map<string, number> {
    return new Map(this.currentPrices);
  }
}

// Export singleton instance
const gbmScheduler = new GBMScheduler();
export default gbmScheduler;
