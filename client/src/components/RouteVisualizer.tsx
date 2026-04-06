import React from 'react';
import { ArrowRight, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RouteStep {
  from: string;
  to: string;
  rate: number;
  provider: string;
}

interface RouteVisualizerProps {
  route: {
    optimalPath: string[];
    finalRate: number;
    estimatedAmount: number;
    steps: RouteStep[];
    totalWeight: number;
  } | null;
  loading?: boolean;
  error?: string | null;
  fromCurrency?: string;
  toCurrency?: string;
  amount?: number;
}

export function RouteVisualizer({ 
  route, 
  loading, 
  error, 
  fromCurrency, 
  toCurrency, 
  amount 
}: RouteVisualizerProps) {
  // Loading state
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-3">
            <div className="animate-spin w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
            <span className="text-gray-600 dark:text-gray-400">Calculating optimal route...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-800 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900 dark:text-red-100">Route Calculation Failed</h3>
            <p className="text-red-700 dark:text-red-300 mt-1">{error}</p>
            <div className="mt-3 text-sm text-red-600 dark:text-red-400">
              Try different currencies or check if they're available in our market.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No route calculated yet
  if (!route) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Ready to Calculate Exchange Route</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Enter currencies and amount above to find the optimal exchange path.
          </p>
        </div>
      </div>
    );
  }

  // Success state with route visualization
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header with summary */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">Optimal Route Found</h3>
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {amount} {fromCurrency} → {route.estimatedAmount.toFixed(6)} {toCurrency}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Final Rate: {route.finalRate.toFixed(6)} • {route.steps.length} steps
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">Efficiency</div>
            <div className="text-lg font-semibold text-green-600 dark:text-green-400">
              {((1 / route.finalRate) * 100).toFixed(2)}%
            </div>
          </div>
        </div>
      </div>

      {/* Route path visualization */}
      <div className="p-6">
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Exchange Path</h4>
          <div className="flex items-center flex-wrap gap-2">
            {route.optimalPath.map((currency, index) => (
              <React.Fragment key={currency}>
                <div className={cn(
                  "px-4 py-2 rounded-lg font-mono font-semibold text-sm border",
                  index === 0 
                    ? "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800"
                    : index === route.optimalPath.length - 1
                    ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800"
                    : "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
                )}>
                  {currency}
                </div>
                {index < route.optimalPath.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Detailed steps */}
        <div>
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Step-by-Step Breakdown</h4>
          <div className="space-y-3">
            {route.steps.map((step, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                      {step.from} → {step.to}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      via {step.provider}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-semibold text-gray-900 dark:text-gray-100">
                    {step.rate.toFixed(6)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {((step.rate - 1) * 100).toFixed(3)}% spread
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional info */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Steps</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {route.steps.length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">Path Weight</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {route.totalWeight.toFixed(6)}
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">Est. Time</div>
              <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                <div className="flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>~{route.steps.length * 2}s</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact version for sidebar or small spaces
export function RouteVisualizerCompact({ 
  route, 
  loading, 
  error 
}: Pick<RouteVisualizerProps, 'route' | 'loading' | 'error'>) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full" />
        Calculating...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
        <AlertCircle className="w-3 h-3" />
        {error}
      </div>
    );
  }

  if (!route) {
    return null;
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm">
        <TrendingUp className="w-4 h-4 text-green-500" />
        <span className="font-semibold text-green-600 dark:text-green-400">
          Optimal Route Found
        </span>
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
        {route.optimalPath.map((currency, index) => (
          <React.Fragment key={currency}>
            <span className="font-mono">{currency}</span>
            {index < route.optimalPath.length - 1 && <ArrowRight className="w-3 h-3" />}
          </React.Fragment>
        ))}
      </div>
      <div className="text-xs text-gray-500 dark:text-gray-400">
        Rate: {route.finalRate.toFixed(6)} • {route.steps.length} steps
      </div>
    </div>
  );
}
