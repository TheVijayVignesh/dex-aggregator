import { ArrowUpRight } from "lucide-react";

// Simplified market ticker showing crypto assets
const cryptoAssets = [
  { symbol: "BTC", price: 43250.00 },
  { symbol: "ETH", price: 2280.50 },
  { symbol: "USDT", price: 1.00 },
  { symbol: "BNB", price: 315.20 },
  { symbol: "SOL", price: 98.75 },
];

export function MarketTicker() {
  return (
    <div className="w-full bg-secondary/30 border-y border-white/5 overflow-hidden py-2 backdrop-blur-sm">
      <div className="flex gap-8 animate-marquee whitespace-nowrap">
        {[...cryptoAssets, ...cryptoAssets].map((asset, i) => (
          <div key={`${asset.symbol}-${i}`} className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm text-muted-foreground">
              {asset.symbol}
            </span>
            <span className="font-mono text-sm text-foreground">
              ${asset.price.toFixed(2)}
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
