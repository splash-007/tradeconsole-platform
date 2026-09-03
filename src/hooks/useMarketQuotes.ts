'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import type { MarketQuote } from '@/lib/server/market-data/types';

export type { MarketQuote };

export interface QuoteState {
  quote: MarketQuote | null;
  available: boolean;
  message?: string;
}

export interface UseMarketQuotesResult {
  quotes: Record<string, QuoteState>;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isStale: boolean;
}

const POLL_INTERVAL_MS = 25_000; // 25-second polling — within 20–30s target range

async function fetchQuotes(symbols: string[]): Promise<Record<string, QuoteState>> {
  if (symbols.length === 0) return {};

  const params = symbols.join(',');
  const res = await fetch(`/api/market/quotes?symbols=${encodeURIComponent(params)}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error(`Market API error: ${res.status}`);
  }

  const data: { quotes: Record<string, { available: boolean; quote?: MarketQuote; message?: string }> } = await res.json();

  const result: Record<string, QuoteState> = {};
  for (const [sym, entry] of Object.entries(data.quotes)) {
    result[sym] = {
      quote: entry.quote ?? null,
      available: entry.available,
      message: entry.message,
    };
  }
  return result;
}

/**
 * Client hook for polling real market quotes via internal API routes.
 *
 * Features:
 * - Initial snapshot on mount
 * - Periodic refresh (25s default)
 * - Preserves previous valid values while refreshing (no flash)
 * - Prevents overlapping requests
 * - Cleans up timers on unmount
 * - Pauses when document is hidden (saves quota)
 */
export function useMarketQuotes(symbols: string[]): UseMarketQuotesResult {
  const [quotes, setQuotes] = useState<Record<string, QuoteState>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isStale, setIsStale] = useState(false);

  const symbolsKey = symbols.slice().sort().join(',');
  const inFlightRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const doFetch = useCallback(
    async (isInitial: boolean) => {
      if (inFlightRef.current) return;
      if (symbols.length === 0) {
        if (isInitial) setLoading(false);
        return;
      }

      inFlightRef.current = true;
      if (!isInitial) setIsStale(true);

      try {
        const result = await fetchQuotes(symbols);
        if (!mountedRef.current) return;

        // Merge: preserve previous valid quote if new fetch returned null
        setQuotes(prev => {
          const merged: Record<string, QuoteState> = { ...prev };
          for (const [sym, state] of Object.entries(result)) {
            if (state.available && state.quote !== null) {
              merged[sym] = state;
            } else if (!prev[sym]?.available) {
              // Only overwrite if we didn't have a valid quote before
              merged[sym] = state;
            }
            // else: keep previous valid quote, don't replace with unavailable
          }
          return merged;
        });

        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        if (!mountedRef.current) return;
        setError(err instanceof Error ? err.message : 'Failed to fetch market data');
      } finally {
        if (mountedRef.current) {
          inFlightRef.current = false;
          setIsStale(false);
          if (isInitial) setLoading(false);
        }
      }
    },
    [symbolsKey] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Schedule next poll
  const schedulePoll = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!mountedRef.current) return;
      // Skip if tab is hidden — resume on visibility change
      if (typeof document !== 'undefined' && document.hidden) {
        schedulePoll();
        return;
      }
      doFetch(false).then(schedulePoll);
    }, POLL_INTERVAL_MS);
  }, [doFetch]);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);

    // Initial fetch
    doFetch(true).then(schedulePoll);

    // Resume polling when tab becomes visible
    const handleVisibility = () => {
      if (!document.hidden) {
        doFetch(false).then(schedulePoll);
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibility);
    }

    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibility);
      }
    };
  }, [symbolsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  return { quotes, loading, error, lastUpdated, isStale };
}

/**
 * Convenience: fetch a single symbol.
 */
export function useMarketQuote(symbol: string): {
  quote: MarketQuote | null;
  available: boolean;
  loading: boolean;
  error: string | null;
} {
  const { quotes, loading, error } = useMarketQuotes(symbol ? [symbol] : []);
  const state = quotes[symbol];
  return {
    quote: state?.quote ?? null,
    available: state?.available ?? false,
    loading,
    error,
  };
}
