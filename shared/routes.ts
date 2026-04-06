import { z } from "zod";
import { 
  insertCryptoAssetSchema, 
  insertExchangeProviderSchema, 
  insertSimulatedRateSchema, 
  insertConversionHistorySchema,
  cryptoAssets,
  exchangeProviders,
  simulatedRates,
  conversionHistory
} from "./schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  cryptoAssets: {
    list: {
      method: "GET" as const,
      path: "/api/crypto-assets",
      responses: {
        200: z.array(z.custom<typeof cryptoAssets.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/crypto-assets",
      input: insertCryptoAssetSchema,
      responses: {
        201: z.custom<typeof cryptoAssets.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  exchangeProviders: {
    list: {
      method: "GET" as const,
      path: "/api/exchange-providers",
      responses: {
        200: z.array(z.custom<typeof exchangeProviders.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/exchange-providers",
      input: insertExchangeProviderSchema,
      responses: {
        201: z.custom<typeof exchangeProviders.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  simulatedRates: {
    list: {
      method: "GET" as const,
      path: "/api/simulated-rates",
      responses: {
        200: z.array(z.custom<typeof simulatedRates.$inferSelect>()),
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/simulated-rates",
      input: insertSimulatedRateSchema,
      responses: {
        201: z.custom<typeof simulatedRates.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  conversionHistory: {
    list: {
      method: "GET" as const,
      path: "/api/conversion-history",
      responses: {
        200: z.array(z.custom<typeof conversionHistory.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/conversion-history",
      input: insertConversionHistorySchema.omit({ userId: true }), // UserId comes from session
      responses: {
        201: z.custom<typeof conversionHistory.$inferSelect>(),
        401: errorSchemas.unauthorized,
        400: errorSchemas.validation,
      },
    },
  },
  prices: {
    list: {
      method: "GET" as const,
      path: "/api/prices", // Get all current prices
      responses: {
        200: z.array(z.custom<any>()), // Typed as PriceWithDetails in frontend
      },
    },
    getBestRate: {
      method: "GET" as const,
      path: "/api/prices/best",
      input: z.object({
        fromTokenId: z.string(),
        toTokenId: z.string(),
        amount: z.string(),
      }),
      responses: {
        200: z.object({
          exchange: z.custom<typeof exchangeProviders.$inferSelect>(),
          rate: z.string(),
          estimatedOutput: z.string(),
        }),
      },
    },
  },
  transactions: {
    list: {
      method: "GET" as const,
      path: "/api/transactions",
      responses: {
        200: z.array(z.custom<any>()), // TransactionWithDetails
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/transactions",
      input: insertConversionHistorySchema.omit({ userId: true }), // UserId comes from session
      responses: {
        201: z.custom<typeof conversionHistory.$inferSelect>(),
        401: errorSchemas.unauthorized,
        400: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
