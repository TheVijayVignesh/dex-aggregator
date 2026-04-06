import { 
  pgTable, 
  varchar, 
  boolean, 
  timestamp, 
  integer, 
  decimal, 
  text, 
  index,
  primaryKey
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==================== INDEPENDENT ENTITIES ====================

/**
 * Users table - Direct integration with Clerk
 * Primary key stores Clerk user_id (e.g., "user_2...")
 * No authentication fields - handled by Clerk
 */
export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).primaryKey(), // Clerk user_id
  email: varchar("email", { length: 255 }).unique().notNull(),
  username: varchar("username", { length: 100 }), // Nullable
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
}, (table) => ({
  emailIdx: index("users_email_idx").on(table.email),
  clerkIdIdx: index("users_clerk_id_idx").on(table.id),
}));

/**
 * Market pairs for currency exchange
 * Defines which currency pairs can be traded
 */
export const marketPairs = pgTable("market_pairs", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  baseCurrencyCode: varchar("base_currency_code", { length: 10 }).notNull(),
  quoteCurrencyCode: varchar("quote_currency_code", { length: 10 }).notNull(),
  pairCode: varchar("pair_code", { length: 20 }).unique().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  pairCodeIdx: index("market_pairs_pair_code_idx").on(table.pairCode),
  currencyPairIdx: index("market_pairs_currency_pair_idx").on(table.baseCurrencyCode, table.quoteCurrencyCode),
}));

/**
 * API providers for exchange rate data
 * External services that provide currency exchange rates
 */
export const apiProviders = pgTable("api_providers", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  providerName: varchar("provider_name", { length: 100 }).unique().notNull(),
  apiUrl: varchar("api_url", { length: 500 }).notNull(),
  providerType: varchar("provider_type", { length: 50 }).notNull(), // "open/free", "premium", etc.
  status: varchar("status", { length: 20 }).default("active").notNull(), // "active", "inactive", "maintenance"
}, (table) => ({
  providerNameIdx: index("api_providers_provider_name_idx").on(table.providerName),
  statusIdx: index("api_providers_status_idx").on(table.status),
}));

// ==================== FIRST-LEVEL DEPENDENT ENTITIES ====================

/**
 * User session tracking (optional - for analytics only)
 * Tracks user sessions beyond Clerk's default tracking
 */
export const userSessions = pgTable("user_sessions", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  loginTime: timestamp("login_time", { withTimezone: true }).defaultNow().notNull(),
  logoutTime: timestamp("logout_time", { withTimezone: true }), // Nullable
  ipAddress: varchar("ip_address", { length: 45 }), // IPv6 compatible
  userAgent: text("user_agent"),
}, (table) => ({
  userIdIdx: index("user_sessions_user_id_idx").on(table.userId),
  loginTimeIdx: index("user_sessions_login_time_idx").on(table.loginTime),
}));

/**
 * Exchange rates from different providers
 * Stores historical exchange rate data
 */
export const exchangeRates = pgTable("exchange_rates", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  pairId: integer("pair_id").notNull().references(() => marketPairs.id, { onDelete: "cascade" }),
  providerId: integer("provider_id").notNull().references(() => apiProviders.id, { onDelete: "cascade" }),
  rate: decimal("rate", { precision: 19, scale: 10 }).notNull(), // High precision for financial calculations
  fetchedTime: timestamp("fetched_time", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  pairProviderIdx: index("exchange_rates_pair_provider_idx").on(table.pairId, table.providerId),
  fetchedTimeIdx: index("exchange_rates_fetched_time_idx").on(table.fetchedTime),
  rateIdx: index("exchange_rates_rate_idx").on(table.rate),
}));

/**
 * User transactions
 * Records all currency exchange transactions
 */
export const transactions = pgTable("transactions", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  userId: varchar("user_id", { length: 255 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  pairId: integer("pair_id").notNull().references(() => marketPairs.id, { onDelete: "restrict" }),
  conversionType: varchar("conversion_type", { length: 20 }).notNull(), // "Direct", "Indirect"
  requestedAmount: decimal("requested_amount", { precision: 19, scale: 10 }).notNull(),
  resultAmount: decimal("result_amount", { precision: 19, scale: 10 }).notNull(),
  transactionTime: timestamp("transaction_time", { withTimezone: true }).defaultNow().notNull(),
  status: varchar("status", { length: 20 }).default("pending").notNull(), // "pending", "completed", "failed"
}, (table) => ({
  userIdIdx: index("transactions_user_id_idx").on(table.userId),
  pairIdIdx: index("transactions_pair_id_idx").on(table.pairId),
  transactionTimeIdx: index("transactions_transaction_time_idx").on(table.transactionTime),
  statusIdx: index("transactions_status_idx").on(table.status),
}));

/**
 * API request logs
 * Tracks all API calls to external providers
 */
export const apiRequestLogs = pgTable("api_request_logs", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  providerId: integer("provider_id").notNull().references(() => apiProviders.id, { onDelete: "cascade" }),
  requestTime: timestamp("request_time", { withTimezone: true }).defaultNow().notNull(),
  endpoint: varchar("endpoint", { length: 500 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(), // "success", "error", "timeout"
  responseTimeMs: decimal("response_time_ms", { precision: 10, scale: 3 }), // Nullable
}, (table) => ({
  providerIdIdx: index("api_request_logs_provider_id_idx").on(table.providerId),
  requestTimeIdx: index("api_request_logs_request_time_idx").on(table.requestTime),
  statusIdx: index("api_request_logs_status_idx").on(table.status),
}));

// ==================== SECOND-LEVEL DEPENDENT ENTITIES ====================

/**
 * Transaction paths
 * For indirect conversions, tracks each step in the conversion path
 */
export const transactionPaths = pgTable("transaction_paths", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  transactionId: integer("transaction_id").notNull().references(() => transactions.id, { onDelete: "cascade" }),
  pairId: integer("pair_id").notNull().references(() => marketPairs.id, { onDelete: "restrict" }),
  stepOrder: integer("step_order").notNull(),
  stepRate: decimal("step_rate", { precision: 19, scale: 10 }).notNull(),
}, (table) => ({
  transactionIdIdx: index("transaction_paths_transaction_id_idx").on(table.transactionId),
  transactionStepIdx: index("transaction_paths_transaction_step_idx").on(table.transactionId, table.stepOrder),
}));

/**
 * Best rates for transactions
 * Stores the calculated best rate for each transaction
 */
export const bestRates = pgTable("best_rates", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  transactionId: integer("transaction_id").notNull().references(() => transactions.id, { onDelete: "cascade" }),
  finalRate: decimal("final_rate", { precision: 19, scale: 10 }).notNull(),
  providerId: integer("provider_id").references(() => apiProviders.id, { onDelete: "set null" }), // Nullable
  conversionType: varchar("conversion_type", { length: 20 }).notNull(),
  calculatedTime: timestamp("calculated_time", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  transactionIdIdx: index("best_rates_transaction_id_idx").on(table.transactionId),
  calculatedTimeIdx: index("best_rates_calculated_time_idx").on(table.calculatedTime),
}));

/**
 * API error logs
 * Detailed error tracking for API requests
 */
export const apiErrorLogs = pgTable("api_error_logs", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  providerId: integer("provider_id").notNull().references(() => apiProviders.id, { onDelete: "cascade" }),
  requestId: integer("request_id").references(() => apiRequestLogs.id, { onDelete: "set null" }), // Nullable
  errorMessage: text("error_message").notNull(),
  errorCode: varchar("error_code", { length: 50 }), // Nullable
  loggedTime: timestamp("logged_time", { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  providerIdIdx: index("api_error_logs_provider_id_idx").on(table.providerId),
  requestIdIdx: index("api_error_logs_request_id_idx").on(table.requestId),
  loggedTimeIdx: index("api_error_logs_logged_time_idx").on(table.loggedTime),
}));

// ==================== RELATIONS ====================

export const usersRelations = relations(users, ({ many }) => ({
  userSessions: many(userSessions),
  transactions: many(transactions),
}));

export const marketPairsRelations = relations(marketPairs, ({ many }) => ({
  exchangeRates: many(exchangeRates),
  transactions: many(transactions),
  transactionPaths: many(transactionPaths),
}));

export const apiProvidersRelations = relations(apiProviders, ({ many }) => ({
  exchangeRates: many(exchangeRates),
  apiRequestLogs: many(apiRequestLogs),
  apiErrorLogs: many(apiErrorLogs),
  bestRates: many(bestRates),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  user: one(users, {
    fields: [userSessions.userId],
    references: [users.id],
  }),
}));

export const exchangeRatesRelations = relations(exchangeRates, ({ one }) => ({
  pair: one(marketPairs, {
    fields: [exchangeRates.pairId],
    references: [marketPairs.id],
  }),
  provider: one(apiProviders, {
    fields: [exchangeRates.providerId],
    references: [apiProviders.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
  pair: one(marketPairs, {
    fields: [transactions.pairId],
    references: [marketPairs.id],
  }),
  transactionPaths: many(transactionPaths),
}));

export const bestRatesRelations = relations(bestRates, ({ one }) => ({
  transaction: one(transactions, {
    fields: [bestRates.transactionId],
    references: [transactions.id],
  }),
  provider: one(apiProviders, {
    fields: [bestRates.providerId],
    references: [apiProviders.id],
  }),
}));

export const apiRequestLogsRelations = relations(apiRequestLogs, ({ one, many }) => ({
  provider: one(apiProviders, {
    fields: [apiRequestLogs.providerId],
    references: [apiProviders.id],
  }),
  apiErrorLogs: many(apiErrorLogs),
}));

export const transactionPathsRelations = relations(transactionPaths, ({ one }) => ({
  transaction: one(transactions, {
    fields: [transactionPaths.transactionId],
    references: [transactions.id],
  }),
  pair: one(marketPairs, {
    fields: [transactionPaths.pairId],
    references: [marketPairs.id],
  }),
}));

export const apiErrorLogsRelations = relations(apiErrorLogs, ({ one }) => ({
  provider: one(apiProviders, {
    fields: [apiErrorLogs.providerId],
    references: [apiProviders.id],
  }),
  request: one(apiRequestLogs, {
    fields: [apiErrorLogs.requestId],
    references: [apiRequestLogs.id],
  }),
}));

// ==================== TYPESCRIPT TYPES ====================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type MarketPair = typeof marketPairs.$inferSelect;
export type NewMarketPair = typeof marketPairs.$inferInsert;

export type ApiProvider = typeof apiProviders.$inferSelect;
export type NewApiProvider = typeof apiProviders.$inferInsert;

export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;

export type ExchangeRate = typeof exchangeRates.$inferSelect;
export type NewExchangeRate = typeof exchangeRates.$inferInsert;

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;

export type ApiRequestLog = typeof apiRequestLogs.$inferSelect;
export type NewApiRequestLog = typeof apiRequestLogs.$inferInsert;

export type TransactionPath = typeof transactionPaths.$inferSelect;
export type NewTransactionPath = typeof transactionPaths.$inferInsert;

export type BestRate = typeof bestRates.$inferSelect;
export type NewBestRate = typeof bestRates.$inferInsert;

export type ApiErrorLog = typeof apiErrorLogs.$inferSelect;
export type NewApiErrorLog = typeof apiErrorLogs.$inferInsert;

// ==================== COMPOSITE TYPES ====================

export type TransactionWithDetails = Transaction & {
  user: User;
  pair: MarketPair;
  transactionPaths: (TransactionPath & { pair: MarketPair })[];
  bestRate?: (BestRate & { provider?: ApiProvider });
};

export type ExchangeRateWithDetails = ExchangeRate & {
  pair: MarketPair;
  provider: ApiProvider;
};

export type UserWithSessions = User & {
  userSessions: UserSession[];
};

export type ApiProviderWithStats = ApiProvider & {
  _count: {
    exchangeRates: number;
    apiRequestLogs: number;
    apiErrorLogs: number;
  };
};

// ==================== ENUMS ====================

export const TransactionStatus = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export type TransactionStatus = typeof TransactionStatus[keyof typeof TransactionStatus];

export const ConversionType = {
  DIRECT: 'Direct',
  INDIRECT: 'Indirect',
} as const;

export type ConversionType = typeof ConversionType[keyof typeof ConversionType];

export const ApiProviderStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  MAINTENANCE: 'maintenance',
} as const;

export type ApiProviderStatus = typeof ApiProviderStatus[keyof typeof ApiProviderStatus];

export const ApiRequestStatus = {
  SUCCESS: 'success',
  ERROR: 'error',
  TIMEOUT: 'timeout',
} as const;

export type ApiRequestStatus = typeof ApiRequestStatus[keyof typeof ApiRequestStatus];

export const ProviderType = {
  OPEN_FREE: 'open/free',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise',
} as const;

export type ProviderType = typeof ProviderType[keyof typeof ProviderType];
