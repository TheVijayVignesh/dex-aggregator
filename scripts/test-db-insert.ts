import { db } from '../server/db';
import { marketPairs, exchangeRates, apiProviders } from '../shared/schema';

async function testDatabaseInsert() {
  console.log('🧪 Testing database insert...');
  
  try {
    // Test 1: Check existing data
    const existingPairs = await db.select().from(marketPairs).limit(5);
    console.log(`📊 Existing market pairs: ${existingPairs.length}`);
    
    const existingRates = await db.select().from(exchangeRates).limit(5);
    console.log(`📊 Existing exchange rates: ${existingRates.length}`);
    
    const existingProviders = await db.select().from(apiProviders).limit(5);
    console.log(`📊 Existing providers: ${existingProviders.length}`);
    
    // Test 2: Use existing pair and provider
    const existingPair = existingPairs[0];
    const existingProvider = existingProviders[0];
    
    console.log(`📋 Using existing pair: ${existingPair.pairCode} (ID: ${existingPair.id})`);
    console.log(`📋 Using existing provider: ${existingProvider.providerName} (ID: ${existingProvider.id})`);
    
    // Test 3: Insert a test exchange rate
    const testRate = await db.insert(exchangeRates).values({
      pairId: existingPair.id,
      providerId: existingProvider.id,
      rate: '0.921234',
      fetchedTime: new Date(),
    }).returning({ id: exchangeRates.id });
    
    console.log(`✅ Created test exchange rate with ID: ${testRate[0].id}`);
    
    // Test 4: Query back the data
    const allRates = await db.select().from(exchangeRates);
    console.log(`📊 Total exchange rates after test: ${allRates.length}`);
    
    console.log('✅ Database insert test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  }
}

testDatabaseInsert().catch(console.error);
