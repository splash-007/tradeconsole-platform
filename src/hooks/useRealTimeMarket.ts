'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface LiveQuote {
  symbol: string;
  price: number;
  change24h: number;
  changePct24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

// Map our internal symbols to Binance stream symbols
const BINANCE_SYMBOL_MAP: Record<string, string> = {
  'BTC/USDC': 'btcusdt',
  'ETH/USDC': 'ethusdt',
  'SOL/USDC': 'solusdt',
  'BNB/USDC': 'bnbusdt',
  'XRP/USDC': 'xrpusdt',
  'ADA/USDC': 'adausdt',
  'AVAX/USDC': 'avaxusdt',
  'DOT/USDC': 'dotusdt',
};

// Map our internal symbols to CoinGecko IDs
const COINGECKO_ID_MAP: Record<string, string> = {
  'BTC/USDC': 'bitcoin',
  'ETH/USDC': 'ethereum',
  'SOL/USDC': 'solana',
  'BNB/USDC': 'binancecoin',
  'XRP/USDC': 'ripple',
  'ADA/USDC': 'cardano',
  'AVAX/USDC': 'avalanche-2',
  'DOT/USDC': 'polkadot',
};

const CANDLE_HISTORY_SIZE = 20;

/**
 * Fetches recent OHLC candles from CoinGecko public API (no key needed).
 * Returns last N 1-hour candles for a given coin.
 */
async function fetchCoinGeckoCandles(coinId: string): Promise<CandleData[]> {
  try {
    // CoinGecko /coins/{id}/ohlc — 1 day = hourly candles (24 candles)
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=1`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const raw: [number, number, number, number, number][] = await res.json();
    // raw: [timestamp_ms, open, high, low, close]
    return raw.slice(-CANDLE_HISTORY_SIZE).map(([t, o, h, l, c]) => ({
      time: Math.floor(t / 1000),
      open: o,
      high: h,
      low: l,
      close: c,
    }));
  } catch {
    return [];
  }
}

/**
 * Hook: subscribes to Binance WebSocket for real-time ticker data for a list of symbols.
 * Falls back gracefully if WebSocket is unavailable.
 */
export function useRealTimeMarket(symbols: string[]) {
  const [quotes, setQuotes] = useState<Record<string, LiveQuote>>({});
  const [candles, setCandles] = useState<Record<string, CandleData[]>>({});
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  // Fetch initial candle data from CoinGecko
  const loadCandles = useCallback(async () => {
    const results: Record<string, CandleData[]> = {};
    await Promise.all(
      symbols.map(async (sym) => {
        const coinId = COINGECKO_ID_MAP[sym];
        if (!coinId) return;
        const data = await fetchCoinGeckoCandles(coinId);
        if (data.length > 0) results[sym] = data;
      })
    );
    if (mountedRef.current) {
      setCandles(prev => ({ ...prev, ...results }));
    }
  }, [symbols.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  // Connect to Binance WebSocket combined stream
  const connectWS = useCallback(() => {
    const binanceSymbols = symbols
      .map(s => BINANCE_SYMBOL_MAP[s])
      .filter(Boolean);

    if (binanceSymbols.length === 0) return;

    // Combined stream: multiple tickers in one connection
    const streams = binanceSymbols.map(s => `${s}@ticker`).join('/');
    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        // WebSocket connected
      };

      ws.onmessage = (event) => {
        if (!mountedRef.current) return;
        try {
          const msg = JSON.parse(event.data);
          const data = msg.data;
          if (!data || data.e !== '24hrTicker') return;

          // Find our internal symbol from Binance stream symbol
          const binanceSym = data.s?.toLowerCase();
          const internalSym = Object.entries(BINANCE_SYMBOL_MAP).find(
            ([, v]) => v === binanceSym
          )?.[0];

          if (!internalSym) return;

          const price = parseFloat(data.c);
          const open = parseFloat(data.o);
          const change24h = price - open;
          const changePct24h = open > 0 ? ((price - open) / open) * 100 : 0;

          setQuotes(prev => ({
            ...prev,
            [internalSym]: {
              symbol: internalSym,
              price,
              change24h,
              changePct24h,
              high24h: parseFloat(data.h),
              low24h: parseFloat(data.l),
              volume24h: parseFloat(data.q), // quote asset volume in USDT
            },
          }));

          // Append a new candle tick to the candle series (1-min live candle)
          setCandles(prev => {
            const existing = prev[internalSym] ?? [];
            if (existing.length === 0) return prev;

            const now = Math.floor(Date.now() / 1000);
            const last = existing[existing.length - 1];
            const bucketSize = 3600; // 1-hour buckets to match CoinGecko
            const currentBucket = Math.floor(now / bucketSize) * bucketSize;

            let updated: CandleData[];
            if (last.time === currentBucket) {
              // Update current candle
              updated = [
                ...existing.slice(0, -1),
                {
                  ...last,
                  high: Math.max(last.high, price),
                  low: Math.min(last.low, price),
                  close: price,
                },
              ];
            } else {
              // New candle
              const newCandle: CandleData = {
                time: currentBucket,
                open: last.close,
                high: Math.max(last.close, price),
                low: Math.min(last.close, price),
                close: price,
              };
              updated = [...existing.slice(-(CANDLE_HISTORY_SIZE - 1)), newCandle];
            }

            return { ...prev, [internalSym]: updated };
          });
        } catch {
          // ignore parse errors
        }
      };

      ws.onerror = () => {
        ws.close();
      };

      ws.onclose = () => {
        if (!mountedRef.current) return;
        // Reconnect after 5 seconds
        reconnectTimer.current = setTimeout(() => {
          if (mountedRef.current) connectWS();
        }, 5000);
      };
    } catch {
      // WebSocket not available (SSR or blocked)
    }
  }, [symbols.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    mountedRef.current = true;
    loadCandles();
    connectWS();

    return () => {
      mountedRef.current = false;
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on intentional close
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
    };
  }, [loadCandles, connectWS]);

  return { quotes, candles };
}
