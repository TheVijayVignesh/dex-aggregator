import { runIngestion, cleanupOldRates } from '../lib/services/ingestion';

async function main() {
  console.log('🚀 Starting currency exchange rate ingestion...');
  
  try {
    // Run the main ingestion
    await runIngestion();
    
    // Clean up old rates (keep last 24 hours)
    await cleanupOldRates();
    
    console.log('✅ Ingestion completed successfully!');
    
  } catch (error) {
    console.error('❌ Ingestion failed:', error);
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
