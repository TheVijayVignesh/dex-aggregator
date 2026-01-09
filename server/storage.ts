import { db } from "./db";
import {
  exchanges, tokens, prices, transactions,
  type Exchange, type InsertExchange,
  type Token, type InsertToken,
  type Price, type InsertPrice,
  type Transaction, type InsertTransaction,
  type PriceWithDetails, type TransactionWithDetails
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { authStorage } from "./replit_integrations/auth/storage";

export interface IStorage {
  // Auth
  getUser(id: string): Promise<any>;
  upsertUser(user: any): Promise<any>;

  // Exchanges
  getExchanges(): Promise<Exchange[]>;
  createExchange(exchange: InsertExchange): Promise<Exchange>;

  // Tokens
  getTokens(): Promise<Token[]>;
  createToken(token: InsertToken): Promise<Token>;

  // Prices
  getPrices(): Promise<PriceWithDetails[]>;
  createPrice(price: InsertPrice): Promise<Price>;
  updatePrice(id: number, price: Partial<InsertPrice>): Promise<Price>;

  // Transactions
  getTransactions(userId: string): Promise<TransactionWithDetails[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
}

export class DatabaseStorage implements IStorage {
  // Reuse auth storage implementation
  async getUser(id: string) { return authStorage.getUser(id); }
  async upsertUser(user: any) { return authStorage.upsertUser(user); }

  async getExchanges(): Promise<Exchange[]> {
    return await db.select().from(exchanges);
  }

  async createExchange(exchange: InsertExchange): Promise<Exchange> {
    const [newExchange] = await db.insert(exchanges).values(exchange).returning();
    return newExchange;
  }

  async getTokens(): Promise<Token[]> {
    return await db.select().from(tokens);
  }

  async createToken(token: InsertToken): Promise<Token> {
    const [newToken] = await db.insert(tokens).values(token).returning();
    return newToken;
  }

  async getPrices(): Promise<PriceWithDetails[]> {
    return await db.query.prices.findMany({
      with: {
        exchange: true,
        token: true,
      },
      orderBy: desc(prices.updatedAt),
    });
  }

  async createPrice(price: InsertPrice): Promise<Price> {
    const [newPrice] = await db.insert(prices).values(price).returning();
    return newPrice;
  }

  async updatePrice(id: number, price: Partial<InsertPrice>): Promise<Price> {
    const [updated] = await db.update(prices).set(price).where(eq(prices.id, id)).returning();
    return updated;
  }

  async getTransactions(userId: string): Promise<TransactionWithDetails[]> {
    return await db.query.transactions.findMany({
      where: eq(transactions.userId, userId),
      with: {
        exchange: true,
        fromToken: true,
        toToken: true,
      },
      orderBy: desc(transactions.timestamp),
    });
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(transaction).returning();
    return newTransaction;
  }
}

export const storage = new DatabaseStorage();
