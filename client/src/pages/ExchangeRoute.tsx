import React, { useState } from 'react';
import { ArrowRight, TrendingUp, AlertCircle, Calculator } from 'lucide-react';
import { useExchangeRoute } from '@/hooks/useExchangeRoute';

interface RouteStep {
  from: string;
  to: string;
  rate: number;
  providerId: number;
  providerName: string;
  feePercentage: number;
}

interface RoutePath {
  steps: RouteStep[];
  totalRate: number;
  totalWeight: number;
  pathString: string;
}

interface MultiPathDisplayProps {
  result: any;
  inputAmount: number;
}

function MultiPathDisplay({ result, inputAmount }: MultiPathDisplayProps) {
  if (!result) return null;

  const { paths, bestPath } = result;

  return (
    <div className="space-y-4">
      {paths.length === 1 ? (
        <div className="glass-panel rounded-xl p-6 border-2 border-green-500/20 bg-green-50/50 dark:bg-green-950/20 dark:border-green-400/30">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">Optimal Route</h3>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Path:</span>
              <span className="font-mono text-sm font-semibold">{bestPath.pathString}</span>
            </div>
            
            <div className="space-y-2">
              {bestPath.steps.map((step: RouteStep, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-medium">{step.from}</span>
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    <span className="font-mono text-sm font-medium">{step.to}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">{step.providerName}</div>
                    <div className="text-sm font-mono font-semibold">
                      {step.rate.toFixed(8)}
                    </div>
                    <div className="text-xs text-amber-600 dark:text-amber-400">
                      Fee: {(step.feePercentage * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Rate:</span>
                <span className="font-mono text-lg font-bold text-green-600 dark:text-green-400">
                  {bestPath.totalRate.toFixed(8)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Estimated Output:</span>
                <span className="font-mono text-lg font-bold text-green-600 dark:text-green-400">
                  {(inputAmount * bestPath.totalRate).toFixed(8)} {result.toAsset}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calculator className="w-5 h-5" />
            Available Routes ({paths.length})
          </h3>
          
          {paths.map((path: RoutePath, index: number) => (
            <div 
              key={index} 
              className={`glass-panel rounded-xl p-6 transition-all ${
                index === 0 
                  ? 'border-2 border-green-500/20 bg-green-50/50 dark:bg-green-950/20 dark:border-green-400/30' 
                  : 'border border-border bg-card'
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                {index === 0 && (
                  <div className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded">Best Rate</div>
                )}
                <h4 className="text-base font-semibold">
                  Path {index + 1}
                </h4>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Path:</span>
                  <span className="font-mono text-sm">{path.pathString}</span>
                </div>
                
                <div className="space-y-2">
                  {path.steps.map((step: RouteStep, stepIndex: number) => (
                    <div key={stepIndex} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium">{step.from}</span>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <span className="font-mono text-sm font-medium">{step.to}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">{step.providerName}</div>
                        <div className="text-sm font-mono font-semibold">
                          {step.rate.toFixed(8)}
                        </div>
                        <div className="text-xs text-amber-600 dark:text-amber-400">
                          Fee: {(step.feePercentage * 100).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Rate:</span>
                    <span className="font-mono text-base font-bold">
                      {path.totalRate.toFixed(8)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Estimated Output:</span>
                    <span className="font-mono text-base font-bold">
                      {(inputAmount * path.totalRate).toFixed(8)} {result.toAsset}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExchangeRoute() {
  const [fromAsset, setFromAsset] = useState('');
  const [toAsset, setToAsset] = useState('');
  const [amount, setAmount] = useState('');
  
  const { assets, loading, error, result, calculate, clear } = useExchangeRoute();

  const handleCalculate = () => {
    const amountNum = parseFloat(amount);
    if (fromAsset && toAsset && amountNum > 0) {
      calculate(fromAsset, toAsset, amountNum);
    }
  };

  const handleSwap = () => {
    setFromAsset(toAsset);
    setToAsset(fromAsset);
    clear();
  };

  const isValidAmount = amount && parseFloat(amount) > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Crypto Exchange Router</h1>
          <p className="text-muted-foreground mt-1">
            Find optimal multi-path routes for cryptocurrency exchanges using advanced algorithms
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          <span className="text-sm text-muted-foreground">
            {assets.length} Available Assets
          </span>
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-6">Exchange Calculator</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-3">
            <label className="block text-sm font-medium">From Asset</label>
            <select
              value={fromAsset}
              onChange={(e) => {
                setFromAsset(e.target.value);
                clear();
              }}
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select asset...</option>
              {assets.map((asset: string) => (
                <option key={asset} value={asset}>
                  {asset}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium">Amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                clear();
              }}
              placeholder="Amount"
              min="0.000001"
              step="any"
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
            />
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium">To Asset</label>
            <select
              value={toAsset}
              onChange={(e) => {
                setToAsset(e.target.value);
                clear();
              }}
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Select asset...</option>
              {assets.map((asset: string) => (
                <option key={asset} value={asset}>
                  {asset}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <button
            onClick={handleSwap}
            className="p-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            title="Swap assets"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleCalculate}
            disabled={!fromAsset || !toAsset || !isValidAmount || loading}
            className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-current border-t-transparent rounded-full" />
                Finding Best Route
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4" />
                Find Best Route
              </>
            )}
          </button>
        </div>

        {!isValidAmount && amount && (
          <div className="mt-4 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-4 h-4" />
            Please enter a valid amount greater than 0
          </div>
        )}

        {fromAsset && toAsset && fromAsset === toAsset && (
          <div className="mt-4 flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-4 h-4" />
            Please select different assets for exchange
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-6 h-6 border-2 border-current border-t-transparent rounded-full" />
          <span className="ml-3 text-muted-foreground">Calculating optimal routes...</span>
        </div>
      )}

      {error && (
        <div className="mt-6">
          <div className="glass-panel rounded-xl p-6 border-2 border-red-500/20 bg-red-50/50 dark:bg-red-950/20 dark:border-red-400/30">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">Calculation Error</h3>
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {result && !loading && !error && (
        <MultiPathDisplay result={result} inputAmount={parseFloat(amount) || 0} />
      )}
    </div>
  );
}
