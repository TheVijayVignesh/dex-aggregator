import { useQuery } from "@tanstack/react-query";

// Simple health check hook for the crypto exchange system
export function useExchangeHealth() {
  return useQuery({
    queryKey: ["/api/exchange/health"],
    queryFn: async () => {
      const res = await fetch("/api/exchange/health");
      if (!res.ok) throw new Error("Failed to fetch health");
      return res.json();
    },
    refetchInterval: 30000, // Refresh every 30s
  });
}
