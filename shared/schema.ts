import { pgTable, serial, varchar, numeric, timestamp, boolean, integer, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// ==================== CRYPTOCURRENCY TRADING SCHEMA ====================

// Crypto assets table
export const cryptoAssets = pgTable("crypto_assets", {
  id: serial("id").primaryKey(),
  symbol: varchar("symbol", { length: 20 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  basePriceUsd: numeric("base_price_usd", { precision: 30, scale: 10 }).notNull(),
  volatility: numeric("volatility", { precision: 10, scale: 6 }).notNull().default("0.02"),
  drift: numeric("drift", { precision: 10, scale: 6 }).notNull().default("0.0001"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  symbolIdx: index("crypto_assets_symbol_idx").on(table.symbol),
}));

// Exchange providers table
export const exchangeProviders = pgTable("exchange_providers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  feePercentage: numeric("fee_percentage", { precision: 6, scale: 4 }).notNull().default("0.001"),
  isActive: boolean("is_active").notNull().default(true),
}, (table) => ({
  nameIdx: index("exchange_providers_name_idx").on(table.name),
}));

// Simulated rates table
export const simulatedRates = pgTable("simulated_rates", {
  id: serial("id").primaryKey(),
  fromAsset: varchar("from_asset", { length: 20 }).notNull().references(() => cryptoAssets.symbol),
  toAsset: varchar("to_asset", { length: 20 }).notNull().references(() => cryptoAssets.symbol),
  providerId: integer("provider_id").notNull().references(() => exchangeProviders.id),
  rate: numeric("rate", { precision: 30, scale: 10 }).notNull(),
  inverseRate: numeric("inverse_rate", { precision: 30, scale: 10 }).notNull(),
  simulatedAt: timestamp("simulated_at").notNull().defaultNow(),
}, (table) => ({
  fromToAssetSimulatedAtIdx: index("simulated_rates_from_to_asset_simulated_at_idx").on(table.fromAsset, table.toAsset, table.simulatedAt),
}));

// Conversion history table
export const conversionHistory = pgTable("conversion_history", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 200 }),
  fromAsset: varchar("from_asset", { length: 20 }).notNull(),
  toAsset: varchar("to_asset", { length: 20 }).notNull(),
  amount: numeric("amount", { precision: 30, scale: 10 }).notNull(),
  paths: jsonb("paths").notNull(),
  bestRate: numeric("best_rate", { precision: 30, scale: 10 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdIdx: index("conversion_history_user_id_idx").on(table.userId),
  fromToAssetIdx: index("conversion_history_from_to_asset_idx").on(table.fromAsset, table.toAsset),
  createdAtIdx: index("conversion_history_created_at_idx").on(table.createdAt),
}));

// ==================== RELATIONS ====================

export const cryptoAssetsRelations = relations(cryptoAssets, ({ many }) => ({
  fromRates: many(simulatedRates),
  toRates: many(simulatedRates),
}));

export const exchangeProvidersRelations = relations(exchangeProviders, ({ many }) => ({
  simulatedRates: many(simulatedRates),
}));

export const simulatedRatesRelations = relations(simulatedRates, ({ one }) => ({
  fromAsset: one(cryptoAssets, {
    fields: [simulatedRates.fromAsset],
    references: [cryptoAssets.symbol],
  }),
  toAsset: one(cryptoAssets, {
    fields: [simulatedRates.toAsset],
    references: [cryptoAssets.symbol],
  }),
  provider: one(exchangeProviders, {
    fields: [simulatedRates.providerId],
    references: [exchangeProviders.id],
  }),
}));

// ==================== SCHEMAS ====================

export const insertCryptoAssetSchema = createInsertSchema(cryptoAssets).omit({ id: true, createdAt: true });
export const insertExchangeProviderSchema = createInsertSchema(exchangeProviders).omit({ id: true });
export const insertSimulatedRateSchema = createInsertSchema(simulatedRates).omit({ id: true, simulatedAt: true });
export const insertConversionHistorySchema = createInsertSchema(conversionHistory).omit({ id: true, createdAt: true });

// ==================== TYPES ====================

export type CryptoAsset = typeof cryptoAssets.$inferSelect;
export type InsertCryptoAsset = z.infer<typeof insertCryptoAssetSchema>;
export type ExchangeProvider = typeof exchangeProviders.$inferSelect;
export type InsertExchangeProvider = z.infer<typeof insertExchangeProviderSchema>;
export type SimulatedRate = typeof simulatedRates.$inferSelect;
export type InsertSimulatedRate = z.infer<typeof insertSimulatedRateSchema>;
export type ConversionHistory = typeof conversionHistory.$inferSelect;
export type InsertConversionHistory = z.infer<typeof insertConversionHistorySchema>;

// ==================== COMPOSITE TYPES ====================

export type SimulatedRateWithDetails = SimulatedRate & {
  fromAsset: CryptoAsset;
  toAsset: CryptoAsset;
  provider: ExchangeProvider;
};
