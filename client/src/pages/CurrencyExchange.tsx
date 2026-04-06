import { useState, useEffect } from "react";
import { ArrowUpDown, TrendingUp, TrendingDown, Globe, Activity } from "lucide-react";

interface MarketPair {
  id: number;
  baseCurrencyCode: string;
  quoteCurrencyCode: string;
  pairCode: string;
  isActive: boolean;
  createdAt: string;
}

interface ExchangeRate {
  id: number;
  pairId: number;
  providerId: number;
  rate: string;
  fetchedTime: string;
  provider: {
    id: number;
    providerName: string;
    apiUrl: string;
    providerType: string;
    status: string;
  };
}

interface RateData {
  pair: MarketPair;
  rates: ExchangeRate[];
  bestRate: ExchangeRate;
}

export default function CurrencyExchange() {
  const [pairs, setPairs] = useState<MarketPair[]>([]);
  const [selectedPair, setSelectedPair] = useState<string>("USD/INR");
  const [rateData, setRateData] = useState<RateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch market pairs
  useEffect(() => {
    const fetchPairs = async () => {
      try {
        const response = await fetch("/api/currency/pairs");
        if (!response.ok) throw new Error("Failed to fetch pairs");
        const data = await response.json();
        setPairs(data);
      } catch (err) {
        setError("Failed to load market pairs");
        console.error(err);
      }
    };

    fetchPairs();
  }, []);

  // Fetch rates for selected pair
  useEffect(() => {
    const fetchRates = async () => {
      if (!selectedPair) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/currency/rates/${encodeURIComponent(selectedPair)}`);
        if (!response.ok) throw new Error("Failed to fetch rates");
        const data = await response.json();
        setRateData(data);
      } catch (err) {
        setError("Failed to load exchange rates");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
  }, [selectedPair]);

  const formatRate = (rate: string) => {
    const num = parseFloat(rate);
    return num.toLocaleString('en-US', {
      minimumFractionDigits: 4,
      maximumFractionDigits: 6,
    });
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Currency Exchange</h1>
          <p className="text-muted-foreground mt-1">Real-time exchange rates from multiple providers</p>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            {pairs.length} Active Pairs
          </span>
        </div>
      </div>

      {/* Pair Selector */}
      <div className="glass-panel rounded-2xl p-6">
        <label className="block text-sm font-medium mb-3">Select Currency Pair</label>
        <select
          value={selectedPair}
          onChange={(e) => setSelectedPair(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        >
          {pairs.map((pair) => (
            <option key={pair.id} value={pair.pairCode}>
              {pair.pairCode} - {pair.baseCurrencyCode} to {pair.quoteCurrencyCode}
            </option>
          ))}
        </select>
      </div>

      {/* Main Rate Display */}
      {rateData && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Best Rate Card */}
          <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">{rateData.pair.pairCode}</h2>
                <p className="text-muted-foreground">Best Available Rate</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  {formatRate(rateData.bestRate.rate)}
                </div>
                <p className="text-sm text-muted-foreground">
                  via {rateData.bestRate.provider.providerName}
                </p>
              </div>
            </div>

            {/* Rate Comparison */}
            <div className="space-y-3">
              <h3 className="font-semibold text-lg">All Provider Rates</h3>
              <div className="grid gap-3">
                {rateData.rates.map((rate) => (
                  <div
                    key={rate.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      rate.id === rateData.bestRate.id
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${
                        rate.id === rateData.bestRate.id
                          ? "bg-primary"
                          : "bg-muted-foreground"
                      }`} />
                      <div>
                        <div className="font-medium">{rate.provider.providerName}</div>
                        <div className="text-sm text-muted-foreground">
                          {rate.provider.providerType} • {formatTime(rate.fetchedTime)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-semibold">
                        {formatRate(rate.rate)}
                      </div>
                      {rate.id === rateData.bestRate.id && (
                        <div className="text-xs text-primary font-medium">Best Rate</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Card */}
          <div className="space-y-6">
            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Activity className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Market Stats</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground">Providers</div>
                  <div className="text-2xl font-bold">{rateData.rates.length}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Rate Range</div>
                  <div className="text-lg font-mono">
                    {formatRate(
                      Math.min(...rateData.rates.map(r => parseFloat(r.rate))).toString()
                    )} - {formatRate(
                      Math.max(...rateData.rates.map(r => parseFloat(r.rate))).toString()
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Last Updated</div>
                  <div className="text-sm">{formatTime(rateData.bestRate.fetchedTime)}</div>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <ArrowUpDown className="w-5 h-5 text-primary" />
                <h3 className="font-semibold">Quick Convert</h3>
              </div>
              <div className="space-y-3">
                <input
                  type="number"
                  placeholder="Amount"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="text-center text-sm text-muted-foreground">
                  ={" "}
                  <span className="font-mono font-semibold">
                    {(parseFloat(rateData.bestRate.rate) * 100).toFixed(2)}
                  </span>{" "}
                  {rateData.pair.quoteCurrencyCode}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="glass-panel rounded-2xl p-12 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading exchange rates...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="glass-panel rounded-2xl p-12 text-center border border-destructive/20">
          <p className="text-destructive">{error}</p>
        </div>
      )}
    </div>
  );
}
