import { pgTable, text, serial, integer, numeric, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export * from "./models/auth";
import { users } from "./models/auth";

export const exchanges = pgTable("exchanges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  logoUrl: text("logo_url"),
  isActive: boolean("is_active").default(true),
});

export const tokens = pgTable("tokens", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull(),
  name: text("name").notNull(),
  decimals: integer("decimals").default(18),
  iconUrl: text("icon_url"),
});

export const prices = pgTable("prices", {
  id: serial("id").primaryKey(),
  exchangeId: integer("exchange_id").notNull(),
  tokenId: integer("token_id").notNull(),
  price: numeric("price").notNull(), // Price in USD
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // References auth.users.id (varchar)
  exchangeId: integer("exchange_id").notNull(),
  fromTokenId: integer("from_token_id").notNull(),
  toTokenId: integer("to_token_id").notNull(),
  amountIn: numeric("amount_in").notNull(),
  amountOut: numeric("amount_out").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Relations
export const pricesRelations = relations(prices, ({ one }) => ({
  exchange: one(exchanges, {
    fields: [prices.exchangeId],
    references: [exchanges.id],
  }),
  token: one(tokens, {
    fields: [prices.tokenId],
    references: [tokens.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  exchange: one(exchanges, {
    fields: [transactions.exchangeId],
    references: [exchanges.id],
  }),
  fromToken: one(tokens, {
    fields: [transactions.fromTokenId],
    references: [tokens.id],
  }),
  toToken: one(tokens, {
    fields: [transactions.toTokenId],
    references: [tokens.id],
  }),
}));

// Schemas
export const insertExchangeSchema = createInsertSchema(exchanges).omit({ id: true });
export const insertTokenSchema = createInsertSchema(tokens).omit({ id: true });
export const insertPriceSchema = createInsertSchema(prices).omit({ id: true, updatedAt: true });
export const insertTransactionSchema = createInsertSchema(transactions).omit({ id: true, timestamp: true });

// Types
export type Exchange = typeof exchanges.$inferSelect;
export type InsertExchange = z.infer<typeof insertExchangeSchema>;
export type Token = typeof tokens.$inferSelect;
export type InsertToken = z.infer<typeof insertTokenSchema>;
export type Price = typeof prices.$inferSelect;
export type InsertPrice = z.infer<typeof insertPriceSchema>;
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

// Joined types for API responses
export type PriceWithDetails = Price & {
  exchange: Exchange;
  token: Token;
};

export type TransactionWithDetails = Transaction & {
  exchange: Exchange;
  fromToken: Token;
  toToken: Token;
};
