import { db } from "../../server/db";
import { marketPairs, apiProviders, exchangeRates } from "../../shared/schema";
import { eq, and, gt } from "drizzle-orm";

// Provider configurations
const PROVIDERS = {
  EXCHANGE_RATE_API: {
    name: "ExchangeRate-API",
    url: `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/USD`,
    type: "fiat",
  },
  BINANCE: {
    name: "Binance",
    url: process.env.BINANCE_API_URL || "https://api.binance.com/api/v3/ticker/bookTicker",
    type: "crypto",
  },
  FRANKFURTER: {
    name: "Frankfurter",
    url: process.env.FRANKFURTER_API_URL || "https://api.frankfurter.app/latest",
    type: "fiat",
  },
  COINGECKO: {
    name: "CoinGecko",
    url: process.env.COINGECKO_API_URL || "https://api.coingecko.com/api/v3/simple/price",
    type: "crypto",
  },
} as const;

// Major crypto pairs to filter from Binance (avoid database bloat)
const MAJOR_CRYPTO_PAIRS = [
  'BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'ADAUSDT', 'SOLUSDT', 'XRPUSDT',
  'DOTUSDT', 'DOGEUSDT', 'AVAXUSDT', 'MATICUSDT', 'LINKUSDT', 'UNIUSDT',
  'LTCUSDT', 'BCHUSDT', 'ATOMUSDT', 'FILUSDT', 'ETCUSDT', 'XLMUSDT',
  'BTCBUSD', 'ETHBUSD', 'BNBBUSD', 'ADABUSD', 'SOLBUSD', 'XRPHUSD',
  'BTCETH', 'ETHBNB', 'BTCBNB', 'ETHBTC', 'BNBBTC', 'SOLBTC'
];

interface ExchangeRateData {
  pairCode: string;
  baseCurrency: string;
  quoteCurrency: string;
  rate: string;
  providerId: number;
}

interface ApiResponse {
  success: boolean;
  data?: ExchangeRateData[];
  error?: string;
}

// Helper function to upsert market pair
async function upsertMarketPair(baseCurrency: string, quoteCurrency: string): Promise<number> {
  const pairCode = `${baseCurrency}/${quoteCurrency}`;
  
  const existing = await db.select().from(marketPairs)
    .where(eq(marketPairs.pairCode, pairCode))
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  const result = await db.insert(marketPairs).values({
    baseCurrencyCode: baseCurrency,
    quoteCurrencyCode: quoteCurrency,
    pairCode,
    isActive: true,
  }).returning({ id: marketPairs.id });

  return result[0].id;
}

// Helper function to get or create provider
async function getProviderId(providerName: string): Promise<number> {
  const provider = await db.select().from(apiProviders)
    .where(eq(apiProviders.providerName, providerName))
    .limit(1);

  if (provider.length > 0) {
    return provider[0].id;
  }

  const result = await db.insert(apiProviders).values({
    providerName,
    apiUrl: PROVIDERS[providerName as keyof typeof PROVIDERS]?.url || '',
    providerType: PROVIDERS[providerName as keyof typeof PROVIDERS]?.type || 'unknown',
    status: 'active',
  }).returning({ id: apiProviders.id });

  return result[0].id;
}

// ExchangeRate-API ingestion
async function ingestExchangeRateAPI(): Promise<ApiResponse> {
  try {
    const response = await fetch(PROVIDERS.EXCHANGE_RATE_API.url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    if (data.result !== 'success') throw new Error('API returned error');

    const rates: ExchangeRateData[] = [];
    const providerId = await getProviderId(PROVIDERS.EXCHANGE_RATE_API.name);

    // Extract conversion rates (base is USD)
    for (const [quoteCurrency, rate] of Object.entries(data.conversion_rates)) {
      if (quoteCurrency === 'USD') continue; // Skip USD/USD
      
      const rateValue = typeof rate === 'number' ? rate : parseFloat(rate as string);
      if (isNaN(rateValue) || rateValue <= 0) continue;
      
      const pairId = await upsertMarketPair('USD', quoteCurrency);
      rates.push({
        pairCode: `USD/${quoteCurrency}`,
        baseCurrency: 'USD',
        quoteCurrency,
        rate: rateValue.toString(),
        providerId,
      });
    }

    return { success: true, data: rates };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Binance ingestion
async function ingestBinance(): Promise<ApiResponse> {
  try {
    const response = await fetch(PROVIDERS.BINANCE.url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error('Invalid response format');

    const rates: ExchangeRateData[] = [];
    const providerId = await getProviderId(PROVIDERS.BINANCE.name);

    // Filter for major pairs and extract rates
    for (const ticker of data) {
      if (!MAJOR_CRYPTO_PAIRS.includes(ticker.symbol)) continue;
      
      const symbol = ticker.symbol;
      const askPrice = parseFloat(ticker.askPrice);
      if (!askPrice || askPrice <= 0) continue;

      // Parse symbol to get base and quote currencies
      let baseCurrency: string, quoteCurrency: string;
      
      // Handle common stablecoins and fiat pairs
      if (symbol.endsWith('USDT')) {
        baseCurrency = symbol.slice(0, -4);
        quoteCurrency = 'USDT';
      } else if (symbol.endsWith('BUSD')) {
        baseCurrency = symbol.slice(0, -4);
        quoteCurrency = 'BUSD';
      } else if (symbol.endsWith('BTC')) {
        baseCurrency = symbol.slice(0, -3);
        quoteCurrency = 'BTC';
      } else if (symbol.endsWith('ETH')) {
        baseCurrency = symbol.slice(0, -3);
        quoteCurrency = 'ETH';
      } else {
        continue; // Skip unrecognized patterns
      }

      const pairId = await upsertMarketPair(baseCurrency, quoteCurrency);
      rates.push({
        pairCode: `${baseCurrency}/${quoteCurrency}`,
        baseCurrency,
        quoteCurrency,
        rate: askPrice.toString(),
        providerId,
      });
    }

    return { success: true, data: rates };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Frankfurter API ingestion
async function ingestFrankfurter(): Promise<ApiResponse> {
  try {
    const response = await fetch(PROVIDERS.FRANKFURTER.url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    if (!data.rates) throw new Error('Invalid response format');

    const rates: ExchangeRateData[] = [];
    const providerId = await getProviderId(PROVIDERS.FRANKFURTER.name);

    // Extract rates (base is EUR)
    for (const [quoteCurrency, rate] of Object.entries(data.rates)) {
      if (quoteCurrency === 'EUR') continue; // Skip EUR/EUR
      
      const rateValue = typeof rate === 'number' ? rate : parseFloat(rate as string);
      if (isNaN(rateValue) || rateValue <= 0) continue;
      
      const pairId = await upsertMarketPair('EUR', quoteCurrency);
      rates.push({
        pairCode: `EUR/${quoteCurrency}`,
        baseCurrency: 'EUR',
        quoteCurrency,
        rate: rateValue.toString(),
        providerId,
      });
    }

    return { success: true, data: rates };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// CoinGecko ingestion
async function ingestCoinGecko(): Promise<ApiResponse> {
  try {
    const url = `${PROVIDERS.COINGECKO.url}?ids=bitcoin,ethereum,solana&vs_currencies=usd,eur,inr`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const data = await response.json();
    if (!data) throw new Error('Invalid response format');

    const rates: ExchangeRateData[] = [];
    const providerId = await getProviderId(PROVIDERS.COINGECKO.name);

    // Map CoinGecko IDs to standard symbols
    const symbolMap: Record<string, string> = {
      bitcoin: 'BTC',
      ethereum: 'ETH',
      solana: 'SOL',
    };

    // Extract crypto/fiat rates
    for (const [cryptoId, fiatData] of Object.entries(data)) {
      const baseCurrency = symbolMap[cryptoId];
      if (!baseCurrency) continue;

      const fiatRates = fiatData as Record<string, number>;
      for (const [fiatCurrency, rate] of Object.entries(fiatRates)) {
        if (typeof rate !== 'number' || rate <= 0) continue;
        
        const pairId = await upsertMarketPair(baseCurrency, fiatCurrency.toUpperCase());
        rates.push({
          pairCode: `${baseCurrency}/${fiatCurrency.toUpperCase()}`,
          baseCurrency,
          quoteCurrency: fiatCurrency.toUpperCase(),
          rate: rate.toString(),
          providerId,
        });
      }
    }

    return { success: true, data: rates };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Store rates in database
async function storeRates(rates: ExchangeRateData[]): Promise<void> {
  const insertPromises = rates.map(async (rateData) => {
    await db.insert(exchangeRates).values({
      pairId: await upsertMarketPair(rateData.baseCurrency, rateData.quoteCurrency),
      providerId: rateData.providerId,
      rate: rateData.rate,
      fetchedTime: new Date(),
    });
  });

  await Promise.all(insertPromises);
}

// Main ingestion function
export async function runIngestion(): Promise<void> {
  console.log('🔄 Starting currency exchange rate ingestion...');
  
  const providers = [
    { name: 'ExchangeRate-API', fn: ingestExchangeRateAPI },
    { name: 'Binance', fn: ingestBinance },
    { name: 'Frankfurter', fn: ingestFrankfurter },
    { name: 'CoinGecko', fn: ingestCoinGecko },
  ];

  const results = await Promise.allSettled(
    providers.map(async (provider) => {
      console.log(`📡 Fetching data from ${provider.name}...`);
      const result = await provider.fn();
      
      if (result.success && result.data) {
        await storeRates(result.data);
        console.log(`✅ ${provider.name}: ${result.data.length} rates stored`);
      } else {
        console.error(`❌ ${provider.name}: ${result.error}`);
      }
      
      return result;
    })
  );

  const successful = results.filter(r => r.status === 'fulfilled').length;
  const failed = results.filter(r => r.status === 'rejected').length;
  
  console.log(`🎉 Ingestion complete: ${successful} successful, ${failed} failed`);
}

// Cleanup old rates (keep last 24 hours)
export async function cleanupOldRates(): Promise<void> {
  const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
  
  const deleted = await db.delete(exchangeRates)
    .where(gt(exchangeRates.fetchedTime, cutoffTime));
  
  console.log(`🧹 Cleaned up old exchange rates`);
}

// Export individual ingestion functions for testing
export {
  ingestExchangeRateAPI,
  ingestBinance,
  ingestFrankfurter,
  ingestCoinGecko,
};
