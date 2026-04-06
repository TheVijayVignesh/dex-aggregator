import { AuthLayout } from "@/components/AuthLayout";
import { useTransactions } from "@/hooks/use-transactions";
import { ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function History() {
  const { data: transactions, isLoading } = useTransactions();

  // Handle null/undefined transactions
  const txList = transactions || [];

  return (
    <AuthLayout>
      <div className="space-y-6 animate-in fade-in duration-500">
        <div>
          <h1 className="text-3xl font-display font-bold">Transaction History</h1>
          <p className="text-muted-foreground mt-1">View your crypto exchange history</p>
        </div>

        <div className="glass-panel rounded-2xl p-8 text-center">
          <p className="text-muted-foreground mb-4">
            Transaction history is being migrated to the new crypto exchange system.
          </p>
          <Link href="/exchange">
            <button className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:bg-primary/90 transition-colors">
              Go to Crypto Exchange
            </button>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
