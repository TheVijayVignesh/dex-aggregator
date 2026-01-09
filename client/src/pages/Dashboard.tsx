import { AuthLayout } from "@/components/AuthLayout";
import { usePrices, useExchanges, useTokens } from "@/hooks/use-market-data";
import { StatCard } from "@/components/StatCard";
import { 
  TrendingUp, 
  Activity, 
  Wallet, 
  ArrowUpRight, 
  Search,
  ArrowRight
} from "lucide-react";
import { Link } from "wouter";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

// Mock data for chart
const data = [
  { name: 'Mon', value: 4000 },
  { name: 'Tue', value: 3000 },
  { name: 'Wed', value: 2000 },
  { name: 'Thu', value: 2780 },
  { name: 'Fri', value: 1890 },
  { name: 'Sat', value: 2390 },
  { name: 'Sun', value: 3490 },
];

export default function Dashboard() {
  const { data: prices, isLoading: isLoadingPrices } = usePrices();
  const { data: exchanges } = useExchanges();
  const { data: tokens } = useTokens();

  return (
    <AuthLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Market Overview</h1>
            <p className="text-muted-foreground mt-1">Real-time prices across DEXs</p>
          </div>
          <Link href="/swap">
            <button className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all flex items-center gap-2">
              Swap Tokens <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Total Volume (24h)"
            value="$12.4M"
            trend="+12.5%"
            trendUp={true}
            icon={<Activity className="w-32 h-32" />}
          />
          <StatCard
            title="Active Exchanges"
            value={exchanges?.length.toString() || "0"}
            icon={<TrendingUp className="w-32 h-32" />}
          />
          <StatCard
            title="Tracked Tokens"
            value={tokens?.length.toString() || "0"}
            trend="+2 New"
            trendUp={true}
            icon={<Wallet className="w-32 h-32" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Price Table */}
          <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display font-bold text-xl">Live Prices</h3>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search token..." 
                  className="bg-secondary/50 border border-white/5 rounded-lg pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary w-48"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs uppercase text-muted-foreground font-medium border-b border-white/5">
                    <th className="pb-4 pl-4">Token</th>
                    <th className="pb-4">Exchange</th>
                    <th className="pb-4">Price</th>
                    <th className="pb-4 pr-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {isLoadingPrices ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-muted-foreground">
                        Loading market data...
                      </td>
                    </tr>
                  ) : prices?.slice(0, 5).map((price) => (
                    <tr key={price.id} className="group hover:bg-white/5 transition-colors">
                      <td className="py-4 pl-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                            {price.token.symbol[0]}
                          </div>
                          <div>
                            <div className="font-semibold">{price.token.name}</div>
                            <div className="text-xs text-muted-foreground">{price.token.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="text-sm font-medium">{price.exchange.name}</span>
                        </div>
                      </td>
                      <td className="py-4 font-mono">
                        ${Number(price.price).toFixed(2)}
                      </td>
                      <td className="py-4 pr-4 text-right">
                        <Link href={`/swap?from=${price.token.id}`}>
                          <button className="text-xs font-medium text-primary hover:text-primary/80 transition-colors border border-primary/20 px-3 py-1.5 rounded-lg hover:bg-primary/10">
                            Trade
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mini Chart */}
          <div className="glass-panel rounded-2xl p-6 flex flex-col">
            <h3 className="font-display font-bold text-xl mb-2">Market Trend</h3>
            <p className="text-sm text-muted-foreground mb-6">Global volume over last 7 days</p>
            
            <div className="h-[200px] w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
