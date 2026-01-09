import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type Exchange, type Token, type PriceWithDetails } from "@shared/schema";

// Exchanges
export function useExchanges() {
  return useQuery({
    queryKey: [api.exchanges.list.path],
    queryFn: async () => {
      const res = await fetch(api.exchanges.list.path);
      if (!res.ok) throw new Error("Failed to fetch exchanges");
      return api.exchanges.list.responses[200].parse(await res.json());
    },
  });
}

// Tokens
export function useTokens() {
  return useQuery({
    queryKey: [api.tokens.list.path],
    queryFn: async () => {
      const res = await fetch(api.tokens.list.path);
      if (!res.ok) throw new Error("Failed to fetch tokens");
      return api.tokens.list.responses[200].parse(await res.json());
    },
  });
}

// Prices
export function usePrices() {
  return useQuery({
    queryKey: [api.prices.list.path],
    queryFn: async () => {
      const res = await fetch(api.prices.list.path);
      if (!res.ok) throw new Error("Failed to fetch prices");
      return api.prices.list.responses[200].parse(await res.json());
    },
    refetchInterval: 10000, // Refresh every 10s for live feel
  });
}

// Best Rate Calculation
export function useBestRate(fromTokenId?: string, toTokenId?: string, amount?: string) {
  return useQuery({
    queryKey: [api.prices.getBestRate.path, fromTokenId, toTokenId, amount],
    queryFn: async () => {
      if (!fromTokenId || !toTokenId || !amount) return null;
      
      const url = buildUrl(api.prices.getBestRate.path);
      const params = new URLSearchParams({
        fromTokenId,
        toTokenId,
        amount
      });
      
      const res = await fetch(`${url}?${params}`);
      if (!res.ok) throw new Error("Failed to calculate best rate");
      return api.prices.getBestRate.responses[200].parse(await res.json());
    },
    enabled: !!fromTokenId && !!toTokenId && !!amount && Number(amount) > 0,
  });
}
