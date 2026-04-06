import { runIngestion } from '../lib/services/ingestion';

async function debugIngestion() {
  console.log('🔍 Debugging ingestion process...');
  
  try {
    await runIngestion();
    
    // Check the results
    const { db } = await import('../server/db');
    const { exchangeRates } = await import('../shared/schema');
    
    const totalRates = await db.select().from(exchangeRates);
    console.log(`📊 Total exchange rates in database: ${totalRates.length}`);
    
    if (totalRates.length > 0) {
      console.log('📋 Sample rates:');
      totalRates.slice(0, 5).forEach((rate, index) => {
        console.log(`  ${index + 1}. Rate: ${rate.rate}, Pair ID: ${rate.pairId}, Provider ID: ${rate.providerId}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Debug ingestion failed:', error);
  }
}

debugIngestion().catch(console.error);
