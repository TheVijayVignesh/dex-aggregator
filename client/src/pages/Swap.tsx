import { useState } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { useTokens, useBestRate } from "@/hooks/use-market-data";
import { useCreateTransaction } from "@/hooks/use-transactions";
import { ArrowDown, Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Swap() {
  const [fromTokenId, setFromTokenId] = useState<string>("");
  const [toTokenId, setToTokenId] = useState<string>("");
  const [amount, setAmount] = useState<string>("1");
  
  const { data: tokens } = useTokens();
  const { data: quote, isLoading: isQuoteLoading } = useBestRate(fromTokenId, toTokenId, amount);
  const { mutate: swap, isPending: isSwapping } = useCreateTransaction();

  const handleSwap = () => {
    if (!quote || !amount || !fromTokenId || !toTokenId) return;

    swap({
      exchangeId: quote.exchange.id,
      fromTokenId: Number(fromTokenId),
      toTokenId: Number(toTokenId),
      amountIn: amount,
      amountOut: quote.estimatedOutput,
    });
  };

  const isReady = fromTokenId && toTokenId && amount && quote;

  return (
    <AuthLayout>
      <div className="max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">Swap Tokens</h1>
          <p className="text-muted-foreground">Get the best rates across all decentralized exchanges</p>
        </div>

        <div className="glass-panel p-6 rounded-3xl relative">
          {/* From Input */}
          <div className="bg-secondary/50 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground font-medium">From</span>
              <span className="text-sm text-muted-foreground">Balance: 0.00</span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-transparent text-3xl font-mono font-bold focus:outline-none w-full placeholder:text-muted-foreground/50"
                placeholder="0.0"
              />
              <select
                value={fromTokenId}
                onChange={(e) => setFromTokenId(e.target.value)}
                className="bg-card border border-border rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-1 focus:ring-primary min-w-[120px]"
              >
                <option value="">Select</option>
                {tokens?.map((t) => (
                  <option key={t.id} value={t.id}>{t.symbol}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Direction Indicator */}
          <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="bg-card border-4 border-background rounded-xl p-2 shadow-lg">
              <ArrowDown className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>

          {/* To Input */}
          <div className="bg-secondary/50 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors mt-2">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground font-medium">To (Estimated)</span>
              <span className="text-sm text-muted-foreground">Balance: 0.00</span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="text"
                readOnly
                value={quote?.estimatedOutput || ""}
                className="bg-transparent text-3xl font-mono font-bold focus:outline-none w-full placeholder:text-muted-foreground/50 text-primary"
                placeholder="0.0"
              />
              <select
                value={toTokenId}
                onChange={(e) => setToTokenId(e.target.value)}
                className="bg-card border border-border rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-1 focus:ring-primary min-w-[120px]"
              >
                <option value="">Select</option>
                {tokens?.map((t) => (
                  <option key={t.id} value={t.id}>{t.symbol}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Route Info */}
          {quote && (
            <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground">Best route via</span>
                <span className="font-bold text-foreground">{quote.exchange.name}</span>
              </div>
              <div className="text-primary font-mono">
                1 {tokens?.find(t => t.id === Number(fromTokenId))?.symbol} ≈ {Number(quote.rate).toFixed(4)} {tokens?.find(t => t.id === Number(toTokenId))?.symbol}
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            disabled={!isReady || isSwapping}
            onClick={handleSwap}
            className={cn(
              "w-full mt-6 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg",
              isReady && !isSwapping
                ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-primary/25 hover:-translate-y-0.5"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {isSwapping ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" /> Swapping...
              </span>
            ) : !fromTokenId || !toTokenId ? (
              "Select Tokens"
            ) : (
              "Swap Now"
            )}
          </button>
        </div>
      </div>
    </AuthLayout>
  );
}
