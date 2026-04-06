import { db } from "./db";
import {
  cryptoAssets, exchangeProviders, simulatedRates, conversionHistory,
  type CryptoAsset, type InsertCryptoAsset,
  type ExchangeProvider, type InsertExchangeProvider,
  type SimulatedRate, type InsertSimulatedRate,
  type ConversionHistory, type InsertConversionHistory
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { authStorage } from "./replit_integrations/auth/storage";

export interface IStorage {
  // Auth
  getUser(id: string): Promise<any>;
  upsertUser(user: any): Promise<any>;

  // Crypto Assets
  getCryptoAssets(): Promise<CryptoAsset[]>;
  createCryptoAsset(asset: InsertCryptoAsset): Promise<CryptoAsset>;

  // Exchange Providers
  getExchangeProviders(): Promise<ExchangeProvider[]>;
  createExchangeProvider(provider: InsertExchangeProvider): Promise<ExchangeProvider>;

  // Simulated Rates
  getSimulatedRates(): Promise<SimulatedRate[]>;
  createSimulatedRate(rate: InsertSimulatedRate): Promise<SimulatedRate>;

  // Conversion History
  getConversionHistory(userId: string): Promise<ConversionHistory[]>;
  createConversion(history: InsertConversionHistory): Promise<ConversionHistory>;
}

export class DatabaseStorage implements IStorage {
  // Reuse auth storage implementation
  async getUser(id: string) { return authStorage.getUser(id); }
  async upsertUser(user: any) { return authStorage.upsertUser(user); }

  // Crypto Assets
  async getCryptoAssets(): Promise<CryptoAsset[]> {
    return await db.select().from(cryptoAssets);
  }

  async createCryptoAsset(asset: InsertCryptoAsset): Promise<CryptoAsset> {
    const [newAsset] = await db.insert(cryptoAssets).values(asset).returning();
    return newAsset;
  }

  // Exchange Providers
  async getExchangeProviders(): Promise<ExchangeProvider[]> {
    return await db.select().from(exchangeProviders);
  }

  async createExchangeProvider(provider: InsertExchangeProvider): Promise<ExchangeProvider> {
    const [newProvider] = await db.insert(exchangeProviders).values(provider).returning();
    return newProvider;
  }

  // Simulated Rates
  async getSimulatedRates(): Promise<SimulatedRate[]> {
    return await db.select().from(simulatedRates).orderBy(desc(simulatedRates.simulatedAt));
  }

  async createSimulatedRate(rate: InsertSimulatedRate): Promise<SimulatedRate> {
    const [newRate] = await db.insert(simulatedRates).values(rate).returning();
    return newRate;
  }

  // Conversion History
  async getConversionHistory(userId: string): Promise<ConversionHistory[]> {
    return await db.select().from(conversionHistory).where(eq(conversionHistory.userId, userId)).orderBy(desc(conversionHistory.id));
  }

  async createConversion(history: InsertConversionHistory): Promise<ConversionHistory> {
    const [newConversion] = await db.insert(conversionHistory).values(history).returning();
    return newConversion;
  }
}

export const storage = new DatabaseStorage();
