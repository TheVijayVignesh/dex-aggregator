import { z } from "zod";
import { 
  insertExchangeSchema, 
  insertTokenSchema, 
  insertPriceSchema, 
  insertTransactionSchema,
  exchanges,
  tokens,
  prices,
  transactions
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
  exchanges: {
    list: {
      method: "GET" as const,
      path: "/api/exchanges",
      responses: {
        200: z.array(z.custom<typeof exchanges.$inferSelect>()),
      },
    },
  },
  tokens: {
    list: {
      method: "GET" as const,
      path: "/api/tokens",
      responses: {
        200: z.array(z.custom<typeof tokens.$inferSelect>()),
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
          exchange: z.custom<typeof exchanges.$inferSelect>(),
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
      input: insertTransactionSchema.omit({ userId: true }), // UserId comes from session
      responses: {
        201: z.custom<typeof transactions.$inferSelect>(),
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
