import "dotenv/config";
import { db } from "../../server/db";
import { simulatedRates, cryptoAssets, exchangeProviders } from "../../shared/schema";
import { sql, eq, desc, gt, and } from "drizzle-orm";

export type LatestRate = {
  from_asset: string;
  to_asset: string;
  provider_id: number;
  provider_name: string;
  fee_percentage: number;
  rate: string;
  inverse_rate: string;
  simulated_at: Date;
};

export type ProviderRate = {
  provider_id: number;
  provider_name: string;
  rate: string;
  fee_percentage: number;
};

export async function getLatestRates(): Promise<LatestRate[]> {
  // Use a window function to get the most recent rate for each combination
  const result = await db.execute(sql`
    WITH ranked_rates AS (
      SELECT 
        sr.from_asset,
        sr.to_asset,
        sr.provider_id,
        sr.rate,
        sr.inverse_rate,
        sr.simulated_at,
        ep.name as provider_name,
        ep.fee_percentage,
        ROW_NUMBER() OVER (
          PARTITION BY sr.from_asset, sr.to_asset, sr.provider_id 
          ORDER BY sr.simulated_at DESC
        ) as rn
      FROM simulated_rates sr
      JOIN exchange_providers ep ON sr.provider_id = ep.id
      WHERE ep.is_active = true
    )
    SELECT 
      from_asset,
      to_asset,
      provider_id,
      provider_name,
      fee_percentage,
      rate,
      inverse_rate,
      simulated_at
    FROM ranked_rates
    WHERE rn = 1
    ORDER BY from_asset, to_asset, provider_id
  `);

  return result.rows as LatestRate[];
}

export async function getAvailableAssets(): Promise<string[]> {
  const result = await db
    .select({ symbol: cryptoAssets.symbol })
    .from(cryptoAssets)
    .where(eq(cryptoAssets.isActive, true))
    .orderBy(cryptoAssets.symbol);

  return result.map(row => row.symbol);
}

export async function getRatesBetween(fromAsset: string, toAsset: string): Promise<ProviderRate[]> {
  // Get the latest rate for the given pair from every active provider
  const result = await db.execute(sql`
    WITH ranked_rates AS (
      SELECT 
        sr.provider_id,
        sr.rate,
        sr.simulated_at,
        ep.name as provider_name,
        ep.fee_percentage,
        ROW_NUMBER() OVER (
          PARTITION BY sr.provider_id 
          ORDER BY sr.simulated_at DESC
        ) as rn
      FROM simulated_rates sr
      JOIN exchange_providers ep ON sr.provider_id = ep.id
      WHERE sr.from_asset = ${fromAsset}
        AND sr.to_asset = ${toAsset}
        AND ep.is_active = true
    )
    SELECT 
      provider_id,
      provider_name,
      rate,
      fee_percentage
    FROM ranked_rates
    WHERE rn = 1
    ORDER BY provider_name
  `);

  return result.rows as ProviderRate[];
}

export async function getRecentRateCount(): Promise<number> {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
  
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(simulatedRates)
    .where(gt(simulatedRates.simulatedAt, tenMinutesAgo));

  return Number(result[0]?.count || 0);
}
