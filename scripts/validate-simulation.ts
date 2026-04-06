import "dotenv/config";
import gbmScheduler from "../lib/services/gbm-simulator";
import { getLatestRates, getRecentRateCount } from "../lib/services/rates-repository";

async function validateSimulation() {
  console.log("🔍 Starting simulation validation...");
  
  try {
    // Run simulation once
    console.log("📊 Running GBM simulation...");
    await gbmScheduler.initialize();
    await gbmScheduler.runOnce();
    
    // Wait 2 seconds
    console.log("⏳ Waiting 2 seconds...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get validation data
    console.log("📈 Fetching rates and counts...");
    const latestRates = await getLatestRates();
    const rateCount = await getRecentRateCount();
    
    // Get unique from_asset values
    const uniqueAssets = new Set(latestRates.map(rate => rate.from_asset));
    
    // Assertions
    console.log("✅ Running assertions...");
    
    if (rateCount <= 0) {
      throw new Error(`Rate count validation failed: expected > 0, got ${rateCount}`);
    }
    
    if (uniqueAssets.size < 50) {
      throw new Error(`Unique assets validation failed: expected >= 50, got ${uniqueAssets.size}`);
    }
    
    // Success
    console.log(`✅ PASS: ${rateCount} rates found, ${uniqueAssets.size} unique assets`);
    process.exit(0);
    
  } catch (error) {
    console.error("❌ Validation failed:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

validateSimulation();
