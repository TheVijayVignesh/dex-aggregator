import { AuthLayout } from "@/components/AuthLayout";
import { useTransactions } from "@/hooks/use-transactions";
import { format } from "date-fns";
import { ArrowRight, ExternalLink } from "lucide-react";

export default function History() {
  const { data: transactions, isLoading } = useTransactions();

  return (
    <AuthLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-display font-bold">Transaction History</h1>
          <p className="text-muted-foreground mt-1">View all your past swaps and trades</p>
        </div>

        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs uppercase text-muted-foreground font-medium border-b border-white/5 bg-secondary/30">
                  <th className="py-4 pl-6">Date</th>
                  <th className="py-4">Pair</th>
                  <th className="py-4">Exchange</th>
                  <th className="py-4 text-right">Amount In</th>
                  <th className="py-4 text-right">Amount Out</th>
                  <th className="py-4 pr-6 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      Loading history...
                    </td>
                  </tr>
                ) : transactions?.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      No transactions found.
                    </td>
                  </tr>
                ) : (
                  transactions?.map((tx: any) => (
                    <tr key={tx.id} className="group hover:bg-white/5 transition-colors">
                      <td className="py-4 pl-6 text-sm text-muted-foreground font-mono">
                        {format(new Date(tx.timestamp), "MMM dd, HH:mm")}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2 font-medium">
                          <span>{tx.fromToken.symbol}</span>
                          <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          <span>{tx.toToken.symbol}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm bg-secondary px-2 py-1 rounded text-muted-foreground">
                            {tx.exchange.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 text-right font-mono">
                        {Number(tx.amountIn).toFixed(4)} {tx.fromToken.symbol}
                      </td>
                      <td className="py-4 text-right font-mono text-primary font-bold">
                        {Number(tx.amountOut).toFixed(4)} {tx.toToken.symbol}
                      </td>
                      <td className="py-4 pr-6 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-green-500 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                          Completed
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
