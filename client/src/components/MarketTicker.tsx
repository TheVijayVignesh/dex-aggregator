import { usePrices } from "@/hooks/use-market-data";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { motion } from "framer-motion";

export function MarketTicker() {
  const { data: prices } = usePrices();

  // Deduplicate tokens for ticker
  const uniqueTokenPrices = prices?.reduce((acc, curr) => {
    if (!acc.find(p => p.token.symbol === curr.token.symbol)) {
      acc.push(curr);
    }
    return acc;
  }, [] as typeof prices);

  if (!uniqueTokenPrices) return null;

  return (
    <div className="w-full bg-secondary/30 border-y border-white/5 overflow-hidden py-2 backdrop-blur-sm">
      <div className="flex gap-8 animate-marquee whitespace-nowrap">
        {[...uniqueTokenPrices, ...uniqueTokenPrices].map((price, i) => (
          <div key={`${price.token.symbol}-${i}`} className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm text-muted-foreground">
              {price.token.symbol}
            </span>
            <span className="font-mono text-sm text-foreground">
              ${Number(price.price).toFixed(2)}
            </span>
            <span className="text-xs flex items-center text-primary">
              <ArrowUpRight className="w-3 h-3" />
              2.4%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
