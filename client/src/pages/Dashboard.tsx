import { AuthLayout } from "@/components/AuthLayout";
import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  Activity, 
  Wallet, 
  ArrowUpRight, 
  Search,
  ArrowRight,
  Activity as ActivityIcon
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

interface HealthStatus {
  status: string;
  simulationActive: boolean;
  recentRateCount: number;
  timestamp: string;
}

export default function Dashboard() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);

  // Fetch health status every 30 seconds
  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch('/api/exchange/health');
        const data = await response.json();
        setHealthStatus(data);
      } catch (error) {
        console.error('Failed to fetch health status:', error);
      } finally {
        setHealthLoading(false);
      }
    };

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AuthLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold">Crypto Exchange Dashboard</h1>
            <p className="text-muted-foreground mt-1">Real-time crypto exchange system status</p>
          </div>
          <Link href="/exchange">
            <button className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 transition-all flex items-center gap-2">
              Crypto Exchange <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </div>

        {/* Health Status Card */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-xl mb-2">Exchange System Status</h3>
              {healthLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                  <span className="text-sm text-muted-foreground">Checking status...</span>
                </div>
              ) : healthStatus ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${healthStatus.simulationActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <span className="text-sm font-medium">
                      {healthStatus.simulationActive ? 'Simulation active' : 'Simulation inactive'}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    [{healthStatus.recentRateCount} rates in last 10 min]
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm font-medium">Status unavailable</span>
                </div>
              )}
            </div>
            <ActivityIcon className="w-8 h-8 text-primary opacity-50" />
          </div>
        </div>

        {/* Simple Chart */}
        <div className="glass-panel rounded-2xl p-6 flex flex-col">
          <h3 className="font-display font-bold text-xl mb-2">System Activity</h3>
          <p className="text-sm text-muted-foreground mb-6">Exchange rate generation over last 7 days</p>
          
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
    </AuthLayout>
  );
}
