import { useState } from "react";
import { AuthLayout } from "@/components/AuthLayout";
import { ArrowDown } from "lucide-react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

// Simplified swap page that redirects users to the new Crypto Exchange
export default function Swap() {
  const [amount, setAmount] = useState<string>("1");

  return (
    <AuthLayout>
      <div className="max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-display font-bold mb-2">Swap Tokens</h1>
          <p className="text-muted-foreground">Get the best rates with our new Crypto Exchange Router</p>
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
              <select className="bg-card border border-border rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-1 focus:ring-primary min-w-[120px]">
                <option value="">BTC</option>
              </select>
            </div>
          </div>

          {/* Swap Direction Indicator */}
          <div className="flex justify-center -my-3 relative z-10">
            <div className="bg-card border-4 border-background rounded-xl p-2 shadow-lg">
              <ArrowDown className="w-5 h-5 text-muted-foreground" />
            </div>
          </div>

          {/* To Input */}
          <div className="bg-secondary/50 p-4 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground font-medium">To (Estimated)</span>
              <span className="text-sm text-muted-foreground">Balance: 0.00</span>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="text"
                readOnly
                className="bg-transparent text-3xl font-mono font-bold focus:outline-none w-full placeholder:text-muted-foreground/50 text-primary"
                placeholder="0.0"
              />
              <select className="bg-card border border-border rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-1 focus:ring-primary min-w-[120px]">
                <option value="">ETH</option>
              </select>
            </div>
          </div>

          {/* Upgrade Notice */}
          <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm text-center">
            <p className="text-muted-foreground mb-2">
              Try our new multi-path crypto exchange for better rates!
            </p>
            <Link href="/exchange">
              <button className={cn(
                "w-full py-3 rounded-xl font-bold transition-all duration-200",
                "bg-primary text-primary-foreground hover:bg-primary/90"
              )}>
                Go to Crypto Exchange
              </button>
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
