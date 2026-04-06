import { db } from '../server/db';
import { marketPairs, exchangeRates, apiProviders } from '../shared/schema';
import { eq, and, or as drizzleOr } from 'drizzle-orm';

async function debugPairs() {
  console.log('🔍 Debugging currency pairs...');
  
  try {
    // Check for USD/EUR pair
    const usdEurPair = await db
      .select()
      .from(marketPairs)
      .where(eq(marketPairs.pairCode, 'USD/EUR'))
      .limit(1);

    console.log(`📊 USD/EUR pair exists: ${usdEurPair.length > 0}`);
    if (usdEurPair.length > 0) {
      console.log(`   Pair ID: ${usdEurPair[0].id}, Active: ${usdEurPair[0].isActive}`);
    }

    // Check for EUR/USD pair
    const eurUsdPair = await db
      .select()
      .from(marketPairs)
      .where(eq(marketPairs.pairCode, 'EUR/USD'))
      .limit(1);

    console.log(`📊 EUR/USD pair exists: ${eurUsdPair.length > 0}`);
    if (eurUsdPair.length > 0) {
      console.log(`   Pair ID: ${eurUsdPair[0].id}, Active: ${eurUsdPair[0].isActive}`);
    }

    // Check for USD rates
    const usdRates = await db
      .select({
        pairCode: marketPairs.pairCode,
        rate: exchangeRates.rate,
        providerName: apiProviders.providerName,
      })
      .from(exchangeRates)
      .innerJoin(marketPairs, eq(exchangeRates.pairId, marketPairs.id))
      .innerJoin(apiProviders, eq(exchangeRates.providerId, apiProviders.id))
      .where(eq(marketPairs.baseCurrencyCode, 'USD'))
      .limit(10);

    console.log(`📊 USD as base currency rates: ${usdRates.length}`);
    usdRates.forEach((rate, index) => {
      console.log(`   ${index + 1}. ${rate.pairCode}: ${rate.rate} (${rate.providerName})`);
    });

    // Check for EUR rates
    const eurRates = await db
      .select({
        pairCode: marketPairs.pairCode,
        rate: exchangeRates.rate,
        providerName: apiProviders.providerName,
      })
      .from(exchangeRates)
      .innerJoin(marketPairs, eq(exchangeRates.pairId, marketPairs.id))
      .innerJoin(apiProviders, eq(exchangeRates.providerId, apiProviders.id))
      .where(eq(marketPairs.baseCurrencyCode, 'EUR'))
      .limit(10);

    console.log(`📊 EUR as base currency rates: ${eurRates.length}`);
    eurRates.forEach((rate, index) => {
      console.log(`   ${index + 1}. ${rate.pairCode}: ${rate.rate} (${rate.providerName})`);
    });

    // Check for any USD/EUR or EUR/USD rates
    const directRates = await db
      .select({
        pairCode: marketPairs.pairCode,
        rate: exchangeRates.rate,
        providerName: apiProviders.providerName,
        baseCurrency: marketPairs.baseCurrencyCode,
        quoteCurrency: marketPairs.quoteCurrencyCode,
      })
      .from(exchangeRates)
      .innerJoin(marketPairs, eq(exchangeRates.pairId, marketPairs.id))
      .innerJoin(apiProviders, eq(exchangeRates.providerId, apiProviders.id))
      .where(and(
        eq(marketPairs.isActive, true),
        drizzleOr(
          eq(marketPairs.pairCode, 'USD/EUR'),
          eq(marketPairs.pairCode, 'EUR/USD')
        )
      ))
      .limit(10);

    console.log(`📊 Direct USD/EUR rates: ${directRates.length}`);
    directRates.forEach((rate, index) => {
      console.log(`   ${index + 1}. ${rate.pairCode}: ${rate.rate} (${rate.providerName})`);
    });

  } catch (error) {
    console.error('❌ Debug pairs failed:', error);
  }
}

debugPairs().catch(console.error);
