import { db } from "./db";
import { marketPairs, apiProviders, exchangeRates } from "@shared/schema";

async function seedCurrencyData() {
  console.log("🌱 Seeding currency exchange data...");

  try {
    // 1. Seed Market Pairs
    console.log("Creating market pairs...");
    const marketPairsData = [
      { baseCurrencyCode: "USD", quoteCurrencyCode: "INR", pairCode: "USD/INR", isActive: true },
      { baseCurrencyCode: "EUR", quoteCurrencyCode: "USD", pairCode: "EUR/USD", isActive: true },
      { baseCurrencyCode: "GBP", quoteCurrencyCode: "USD", pairCode: "GBP/USD", isActive: true },
      { baseCurrencyCode: "USD", quoteCurrencyCode: "EUR", pairCode: "USD/EUR", isActive: true },
      { baseCurrencyCode: "USD", quoteCurrencyCode: "GBP", pairCode: "USD/GBP", isActive: true },
      { baseCurrencyCode: "EUR", quoteCurrencyCode: "GBP", pairCode: "EUR/GBP", isActive: true },
      { baseCurrencyCode: "JPY", quoteCurrencyCode: "USD", pairCode: "JPY/USD", isActive: true },
      { baseCurrencyCode: "USD", quoteCurrencyCode: "JPY", pairCode: "USD/JPY", isActive: true },
      { baseCurrencyCode: "AUD", quoteCurrencyCode: "USD", pairCode: "AUD/USD", isActive: true },
      { baseCurrencyCode: "USD", quoteCurrencyCode: "AUD", pairCode: "USD/AUD", isActive: true },
      { baseCurrencyCode: "CAD", quoteCurrencyCode: "USD", pairCode: "CAD/USD", isActive: true },
      { baseCurrencyCode: "USD", quoteCurrencyCode: "CAD", pairCode: "USD/CAD", isActive: true },
      { baseCurrencyCode: "CHF", quoteCurrencyCode: "USD", pairCode: "CHF/USD", isActive: true },
      { baseCurrencyCode: "USD", quoteCurrencyCode: "CHF", pairCode: "USD/CHF", isActive: true },
      { baseCurrencyCode: "CNY", quoteCurrencyCode: "USD", pairCode: "CNY/USD", isActive: true },
      { baseCurrencyCode: "USD", quoteCurrencyCode: "CNY", pairCode: "USD/CNY", isActive: true },
    ];

    const insertedPairs = await db.insert(marketPairs).values(marketPairsData).returning();
    console.log(`✅ Created ${insertedPairs.length} market pairs`);

    // 2. Seed API Providers
    console.log("Creating API providers...");
    const apiProvidersData = [
      {
        providerName: "OpenExchangeRates",
        apiUrl: "https://openexchangerates.org/api/latest.json",
        providerType: "open/free",
        status: "active",
      },
      {
        providerName: "Fixer",
        apiUrl: "https://api.fixer.io/latest",
        providerType: "premium",
        status: "active",
      },
      {
        providerName: "CurrencyLayer",
        apiUrl: "https://api.currencylayer.com/live",
        providerType: "premium",
        status: "active",
      },
      {
        providerName: "ExchangeRate-API",
        apiUrl: "https://v6.exchangerate-api.com/v6/latest",
        providerType: "open/free",
        status: "active",
      },
      {
        providerName: "CurrencyAPI",
        apiUrl: "https://currencyapi.com/api/v1/latest",
        providerType: "open/free",
        status: "maintenance",
      },
    ];

    const insertedProviders = await db.insert(apiProviders).values(apiProvidersData).returning();
    console.log(`✅ Created ${insertedProviders.length} API providers`);

    // 3. Seed Sample Exchange Rates
    console.log("Creating sample exchange rates...");
    const sampleRates = [
      // USD/INR rates
      { pairId: 1, providerId: 1, rate: "83.1234567890" }, // OpenExchangeRates
      { pairId: 1, providerId: 2, rate: "83.1456789012" }, // Fixer
      { pairId: 1, providerId: 3, rate: "83.0987654321" }, // CurrencyLayer
      { pairId: 1, providerId: 4, rate: "83.1111111111" }, // ExchangeRate-API

      // EUR/USD rates
      { pairId: 2, providerId: 1, rate: "1.0856789012" },
      { pairId: 2, providerId: 2, rate: "1.0878901234" },
      { pairId: 2, providerId: 3, rate: "1.0834567890" },
      { pairId: 2, providerId: 4, rate: "1.0861234567" },

      // GBP/USD rates
      { pairId: 3, providerId: 1, rate: "1.2745678901" },
      { pairId: 3, providerId: 2, rate: "1.2767890123" },
      { pairId: 3, providerId: 3, rate: "1.2723456789" },
      { pairId: 3, providerId: 4, rate: "1.2750123456" },

      // USD/EUR rates
      { pairId: 4, providerId: 1, rate: "0.9212345678" },
      { pairId: 4, providerId: 2, rate: "0.9194567890" },
      { pairId: 4, providerId: 3, rate: "0.9237890123" },
      { pairId: 4, providerId: 4, rate: "0.9205678901" },

      // USD/GBP rates
      { pairId: 5, providerId: 1, rate: "0.7845678901" },
      { pairId: 5, providerId: 2, rate: "0.7827890123" },
      { pairId: 5, providerId: 3, rate: "0.7861234567" },
      { pairId: 5, providerId: 4, rate: "0.7838901234" },

      // EUR/GBP rates
      { pairId: 6, providerId: 1, rate: "0.8523456789" },
      { pairId: 6, providerId: 2, rate: "0.8505678901" },
      { pairId: 6, providerId: 3, rate: "0.8549012345" },
      { pairId: 6, providerId: 4, rate: "0.8516789012" },

      // JPY/USD rates
      { pairId: 7, providerId: 1, rate: "0.0064567890" },
      { pairId: 7, providerId: 2, rate: "0.0064789012" },
      { pairId: 7, providerId: 3, rate: "0.0064345678" },
      { pairId: 7, providerId: 4, rate: "0.0064678901" },

      // USD/JPY rates
      { pairId: 8, providerId: 1, rate: "154.8765432109" },
      { pairId: 8, providerId: 2, rate: "154.9876543210" },
      { pairId: 8, providerId: 3, rate: "154.7654321098" },
      { pairId: 8, providerId: 4, rate: "154.8901234567" },

      // AUD/USD rates
      { pairId: 9, providerId: 1, rate: "0.6567890123" },
      { pairId: 9, providerId: 2, rate: "0.6589012345" },
      { pairId: 9, providerId: 3, rate: "0.6545678901" },
      { pairId: 9, providerId: 4, rate: "0.6572345678" },

      // USD/AUD rates
      { pairId: 10, providerId: 1, rate: "1.5234567890" },
      { pairId: 10, providerId: 2, rate: "1.5216789012" },
      { pairId: 10, providerId: 3, rate: "1.5259012345" },
      { pairId: 10, providerId: 4, rate: "1.5226789012" },

      // CAD/USD rates
      { pairId: 11, providerId: 1, rate: "0.7345678901" },
      { pairId: 11, providerId: 2, rate: "0.7367890123" },
      { pairId: 11, providerId: 3, rate: "0.7323456789" },
      { pairId: 11, providerId: 4, rate: "0.7350123456" },

      // USD/CAD rates
      { pairId: 12, providerId: 1, rate: "1.3612345678" },
      { pairId: 12, providerId: 2, rate: "1.3594567890" },
      { pairId: 12, providerId: 3, rate: "1.3637890123" },
      { pairId: 12, providerId: 4, rate: "1.3605678901" },

      // CHF/USD rates
      { pairId: 13, providerId: 1, rate: "1.1234567890" },
      { pairId: 13, providerId: 2, rate: "1.1256789012" },
      { pairId: 13, providerId: 3, rate: "1.1212345678" },
      { pairId: 13, providerId: 4, rate: "1.1245678901" },

      // USD/CHF rates
      { pairId: 14, providerId: 1, rate: "0.8898765432" },
      { pairId: 14, providerId: 2, rate: "0.8876543210" },
      { pairId: 14, providerId: 3, rate: "0.8920987654" },
      { pairId: 14, providerId: 4, rate: "0.8891234567" },

      // CNY/USD rates
      { pairId: 15, providerId: 1, rate: "0.1378901234" },
      { pairId: 15, providerId: 2, rate: "0.1390123456" },
      { pairId: 15, providerId: 3, rate: "0.1356789012" },
      { pairId: 15, providerId: 4, rate: "0.1383456789" },

      // USD/CNY rates
      { pairId: 16, providerId: 1, rate: "7.2523456789" },
      { pairId: 16, providerId: 2, rate: "7.2505678901" },
      { pairId: 16, providerId: 3, rate: "7.2549012345" },
      { pairId: 16, providerId: 4, rate: "7.2516789012" },
    ];

    const insertedRates = await db.insert(exchangeRates).values(sampleRates).returning();
    console.log(`✅ Created ${insertedRates.length} exchange rates`);

    console.log("🎉 Currency exchange data seeded successfully!");
    console.log("\n📊 Summary:");
    console.log(`   - Market Pairs: ${insertedPairs.length}`);
    console.log(`   - API Providers: ${insertedProviders.length}`);
    console.log(`   - Exchange Rates: ${insertedRates.length}`);
    console.log("\n💡 Your currency exchange platform is now ready with sample data!");

  } catch (error) {
    console.error("❌ Error seeding currency data:", error);
    process.exit(1);
  }
}

// Run the seed function
seedCurrencyData()
  .then(() => {
    console.log("✅ Seeding completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });
