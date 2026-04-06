# Currency Exchange Platform Database Schema

## Overview

This database schema is designed for a comprehensive currency exchange platform with **Clerk authentication integration**. The schema follows a three-tier entity relationship model with proper foreign key relationships, cascading deletes, and performance optimizations.

## 🚨 CRITICAL: CLERK INTEGRATION REQUIREMENTS

### User Authentication Architecture
- **NO authentication handling in database** - All auth managed by Clerk
- **User table primary key** stores Clerk `user_id` (e.g., `user_2a4f5b6c7d8e9f0g1h2i3j4k5l6m7n8o9p0q1r2s3t4u5v6w7x8y9z0`)
- **Webhook-based user management** - User records created/updated via Clerk webhooks
- **No password fields** - Clerk handles all security

### Clerk Webhook Integration
```typescript
// Example webhook handler for user creation
app.post('/webhooks/clerk', async (req, res) => {
  const { type, data } = req.body;
  
  if (type === 'user.created') {
    await db.insert(users).values({
      id: data.id, // Clerk user_id
      email: data.email_addresses[0].email_address,
      username: data.username || null,
      createdAt: new Date(data.created_at),
      isActive: true,
    });
  }
  
  // Handle other webhook events...
});
```

## 📊 Schema Architecture

### Independent Entities (Tier 1)

#### `users` - Clerk Integration Table
```sql
- id: VARCHAR(255) PRIMARY KEY  -- Clerk user_id
- email: VARCHAR(255) UNIQUE   -- From Clerk
- username: VARCHAR(100) NULL  -- Optional display name
- created_at: TIMESTAMP        -- Account creation
- is_active: BOOLEAN           -- Account status
```

#### `market_pairs` - Currency Pairs
```sql
- id: INTEGER PRIMARY KEY
- base_currency_code: VARCHAR(10)  -- "USD", "EUR", etc.
- quote_currency_code: VARCHAR(10) -- "INR", "GBP", etc.
- pair_code: VARCHAR(20) UNIQUE     -- "USD/INR"
- is_active: BOOLEAN
- created_at: TIMESTAMP
```

#### `api_providers` - External Rate Providers
```sql
- id: INTEGER PRIMARY KEY
- provider_name: VARCHAR(100) UNIQUE -- "OpenExchangeRates", "Fixer"
- api_url: VARCHAR(500)              -- API endpoint
- provider_type: VARCHAR(50)         -- "open/free", "premium"
- status: VARCHAR(20)                -- "active", "inactive"
```

### First-Level Dependent Entities (Tier 2)

#### `user_sessions` - Session Analytics
```sql
- user_id: VARCHAR(255) FOREIGN KEY → users.id (CASCADE)
- login_time: TIMESTAMP
- logout_time: TIMESTAMP NULL
- ip_address: VARCHAR(45)  -- IPv6 compatible
- user_agent: TEXT
```

#### `exchange_rates` - Historical Rate Data
```sql
- pair_id: INTEGER FOREIGN KEY → market_pairs.id (CASCADE)
- provider_id: INTEGER FOREIGN KEY → api_providers.id (CASCADE)
- rate: DECIMAL(19,10)  -- High precision for financial data
- fetched_time: TIMESTAMP
```

#### `transactions` - User Exchange Transactions
```sql
- user_id: VARCHAR(255) FOREIGN KEY → users.id (CASCADE)
- pair_id: INTEGER FOREIGN KEY → market_pairs.id (RESTRICT)
- conversion_type: VARCHAR(20)  -- "Direct", "Indirect"
- requested_amount: DECIMAL(19,10)
- result_amount: DECIMAL(19,10)
- transaction_time: TIMESTAMP
- status: VARCHAR(20)  -- "pending", "completed", "failed"
```

#### `api_request_logs` - API Call Tracking
```sql
- provider_id: INTEGER FOREIGN KEY → api_providers.id (CASCADE)
- request_time: TIMESTAMP
- endpoint: VARCHAR(500)
- status: VARCHAR(20)  -- "success", "error", "timeout"
- response_time_ms: DECIMAL(10,3)
```

### Second-Level Dependent Entities (Tier 3)

#### `transaction_paths` - Multi-Step Conversions
```sql
- transaction_id: INTEGER FOREIGN KEY → transactions.id (CASCADE)
- pair_id: INTEGER FOREIGN KEY → market_pairs.id (RESTRICT)
- step_order: INTEGER  -- Order in conversion path
- step_rate: DECIMAL(19,10)
```

#### `best_rates` - Optimized Rate Calculations
```sql
- transaction_id: INTEGER FOREIGN KEY → transactions.id (CASCADE)
- final_rate: DECIMAL(19,10)
- provider_id: INTEGER FOREIGN KEY → api_providers.id (SET NULL)
- conversion_type: VARCHAR(20)
- calculated_time: TIMESTAMP
```

#### `api_error_logs` - Detailed Error Tracking
```sql
- provider_id: INTEGER FOREIGN KEY → api_providers.id (CASCADE)
- request_id: INTEGER FOREIGN KEY → api_request_logs.id (SET NULL)
- error_message: TEXT
- error_code: VARCHAR(50) NULL
- logged_time: TIMESTAMP
```

## 🔧 Database Optimizations

### Performance Indexes
```sql
-- User queries
CREATE INDEX users_email_idx ON users(email);
CREATE INDEX users_clerk_id_idx ON users(id);

-- Market pair lookups
CREATE INDEX market_pairs_pair_code_idx ON market_pairs(pair_code);
CREATE INDEX market_pairs_currency_pair_idx ON market_pairs(base_currency_code, quote_currency_code);

-- Transaction queries
CREATE INDEX transactions_user_id_idx ON transactions(user_id);
CREATE INDEX transactions_pair_id_idx ON transactions(pair_id);
CREATE INDEX transactions_transaction_time_idx ON transactions(transaction_time);
CREATE INDEX transactions_status_idx ON transactions(status);

-- Exchange rate queries
CREATE INDEX exchange_rates_pair_provider_idx ON exchange_rates(pair_id, provider_id);
CREATE INDEX exchange_rates_fetched_time_idx ON exchange_rates(fetched_time);

-- API monitoring
CREATE INDEX api_request_logs_provider_id_idx ON api_request_logs(provider_id);
CREATE INDEX api_request_logs_request_time_idx ON api_request_logs(request_time);
```

### Cascading Delete Strategy
- **Users**: CASCADE delete → user_sessions, transactions
- **MarketPairs**: CASCADE delete → exchange_rates, transaction_paths
- **ApiProviders**: CASCADE delete → exchange_rates, api_request_logs, api_error_logs
- **Transactions**: CASCADE delete → transaction_paths, best_rates

### Financial Precision
- **Currency amounts**: `DECIMAL(19,10)` for maximum precision
- **Exchange rates**: `DECIMAL(19,10)` for accurate calculations
- **Response times**: `DECIMAL(10,3)` for millisecond precision

## 📝 TypeScript Types

### Basic Entity Types
```typescript
export type User = {
  id: string;           // Clerk user_id
  email: string;
  username?: string;
  createdAt: Date;
  isActive: boolean;
};

export type Transaction = {
  id: number;
  userId: string;       // Clerk user_id
  pairId: number;
  conversionType: 'Direct' | 'Indirect';
  requestedAmount: string;  // Decimal as string
  resultAmount: string;     // Decimal as string
  transactionTime: Date;
  status: 'pending' | 'completed' | 'failed';
};
```

### Composite Types
```typescript
export type TransactionWithDetails = Transaction & {
  user: User;
  pair: MarketPair;
  transactionPaths: (TransactionPath & { pair: MarketPair })[];
  bestRate?: BestRate & { provider?: ApiProvider };
};

export type ExchangeRateWithDetails = ExchangeRate & {
  pair: MarketPair;
  provider: ApiProvider;
};
```

## 🔄 Clerk Webhook Events

### Required Webhook Handlers

#### User Events
```typescript
// user.created
// user.updated  
// user.deleted
app.post('/webhooks/clerk', async (req, res) => {
  const { type, data } = req.body;
  
  switch (type) {
    case 'user.created':
      await createUser(data);
      break;
    case 'user.updated':
      await updateUser(data);
      break;
    case 'user.deleted':
      await deleteUser(data.id); // CASCADE handles cleanup
      break;
  }
});
```

#### Session Events (Optional Analytics)
```typescript
// session.created
// session.ended
case 'session.created':
  await trackUserSession(data);
  break;
case 'session.ended':
  await endUserSession(data);
  break;
```

## 🛡️ Security & Compliance

### Data Protection
- **No PII in database** beyond what Clerk provides
- **Clerk handles** all authentication and session management
- **Webhook verification** required for Clerk events
- **Audit trail** through transaction and API logs

### Privacy Considerations
- **User deletion** via Clerk webhook triggers CASCADE delete
- **Session analytics** optional and anonymized
- **IP addresses** stored only for analytics, not authentication
- **User agents** logged for security monitoring

## 📈 Usage Examples

### Creating a Transaction
```typescript
const newTransaction = await db.insert(transactions).values({
  userId: 'user_2a4f5b6c7d8e9f0g1h2i3j4k5l6m7n8o9p0q1r2s3t4u5v6w7x8y9z0', // Clerk ID
  pairId: 1, // USD/INR pair
  conversionType: 'Direct',
  requestedAmount: '1000.00',
  resultAmount: '83123.45',
  status: 'pending',
}).returning();
```

### Querying User Transactions
```typescript
const userTransactions = await db.query.transactions.findMany({
  where: eq(transactions.userId, clerkUserId),
  with: {
    pair: true,
    transactionPaths: {
      with: {
        pair: true,
      },
    },
    bestRate: {
      with: {
        provider: true,
      },
    },
  },
  orderBy: desc(transactions.transactionTime),
});
```

### Getting Latest Exchange Rates
```typescript
const latestRates = await db.query.exchangeRates.findMany({
  where: eq(marketPairs.isActive, true),
  with: {
    pair: true,
    provider: true,
  },
  orderBy: desc(exchangeRates.fetchedTime),
  limit: 100,
});
```

## 🚀 Migration Strategy

### Step 1: Schema Setup
```bash
# For Drizzle
npm run db:generate
npm run db:migrate

# For Prisma  
npx prisma migrate dev
npx prisma generate
```

### Step 2: Clerk Integration
1. Set up Clerk webhooks in your Clerk dashboard
2. Implement webhook endpoints
3. Test user creation/deletion flows
4. Verify cascade deletes work properly

### Step 3: Data Seeding
```typescript
// Seed market pairs
await db.insert(marketPairs).values([
  { baseCurrencyCode: 'USD', quoteCurrencyCode: 'INR', pairCode: 'USD/INR' },
  { baseCurrencyCode: 'EUR', quoteCurrencyCode: 'USD', pairCode: 'EUR/USD' },
  // ... more pairs
]);

// Seed API providers
await db.insert(apiProviders).values([
  { providerName: 'OpenExchangeRates', apiUrl: 'https://openexchangerates.org/api', providerType: 'open/free' },
  { providerName: 'Fixer', apiUrl: 'https://api.fixer.io', providerType: 'premium' },
]);
```

## 📋 Schema Files

- **`currency-schema.ts`** - Drizzle ORM schema (recommended)
- **`currency-schema-fixed.ts`** - Drizzle schema with fixed relations
- **`schema.prisma`** - Prisma schema alternative
- **This README** - Complete documentation

## 🎯 Key Benefits

1. **Clerk Integration** - Seamless auth with webhooks
2. **Financial Precision** - Decimal types for accurate calculations
3. **Performance Optimized** - Strategic indexing
4. **Scalable Architecture** - Three-tier entity model
5. **Audit Ready** - Comprehensive logging
6. **Type Safe** - Full TypeScript support
7. **Cascading Deletes** - Automatic cleanup on user deletion

This schema provides a robust foundation for a production-ready currency exchange platform with modern authentication and comprehensive tracking capabilities.
