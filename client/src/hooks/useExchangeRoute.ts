import { useState, useCallback, useEffect } from 'react';

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

interface MultiPathResult {
  fromAsset: string;
  toAsset: string;
  inputAmount: number;
  paths: RoutePath[];
  bestPath: RoutePath;
  bestOutputAmount: number;
  timestamp: string;
}

interface UseExchangeRouteState {
  assets: string[];
  loading: boolean;
  error: string | null;
  result: MultiPathResult | null;
}

interface UseExchangeRouteReturn extends UseExchangeRouteState {
  calculate: (fromAsset: string, toAsset: string, amount: number) => Promise<void>;
  clear: () => void;
}

export function useExchangeRoute(): UseExchangeRouteReturn {
  const [state, setState] = useState<UseExchangeRouteState>({
    assets: [],
    loading: false,
    error: null,
    result: null,
  });

  // Fetch assets on mount
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await fetch('/api/exchange/assets');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch assets');
        }

        if (!data.success || !data.data?.assets) {
          throw new Error('Invalid response format');
        }

        setState(prev => ({
          ...prev,
          assets: data.data.assets,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Unknown error occurred',
        }));
      }
    };

    fetchAssets();
  }, []);

  const calculate = useCallback(async (
    fromAsset: string,
    toAsset: string,
    amount: number
  ) => {
    // Reset state and start loading
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      // Input validation
      if (!fromAsset || !toAsset) {
        throw new Error('From and to assets are required');
      }

      if (fromAsset === toAsset) {
        throw new Error('From and to assets must be different');
      }

      if (amount <= 0 || amount > 1e12) {
        throw new Error('Amount must be between 0.00000001 and 1,000,000,000,000');
      }

      // Make API request
      const response = await fetch('/api/exchange/calculate-route', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromAsset: fromAsset.toUpperCase(),
          toAsset: toAsset.toUpperCase(),
          amount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle different error types
        if (response.status === 400) {
          throw new Error(data.error || 'Invalid input parameters');
        } else if (response.status === 404) {
          throw new Error(data.error || 'No route found');
        } else {
          throw new Error(data.error || 'Request failed');
        }
      }

      if (!data.success || !data.data) {
        throw new Error('Invalid response format');
      }

      // Update state with successful result
      setState(prev => ({
        ...prev,
        result: data.data,
        loading: false,
        error: null,
      }));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        result: null,
      }));
    }
  }, []);

  const clear = useCallback(() => {
    setState({
      assets: state.assets, // Keep assets
      loading: false,
      error: null,
      result: null,
    });
  }, [state.assets]);

  return {
    ...state,
    calculate,
    clear,
  };
}
