/**
 * Tiingo provider — server-only fallback.
 * Reads TIINGO_API_TOKEN from process.env.
 * Never import this file in client components.
 */

import type { MarketQuote, AssetType } from './types';

const BASE_URL = 'https://api.tiingo.com';
const TIMEOUT_MS = 8000;

function getToken(): string | null {
  return process.env.TIINGO_API_TOKEN ?? null;
}

async function fetchWithTimeout(url: string, ms: number, token: string): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        Authorization: `Token ${token}`,
        'Content-Type': 'application/json',
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

// ── Tiingo response shapes ────────────────────────────────────

interface TiingoTickerQuote {
  ticker?: string;
  timestamp?: string;
  lastSalePrice?: number;
  lastPrice?: number;
  open?: number;
  high?: number;
  low?: number;
  prevClose?: number;
  mid?: number;
  bidPrice?: number;
  askPrice?: number;
  bidSize?: number;
  askSize?: number;
  volume?: number;
}

interface TiingoEodQuote {
  date?: string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  adjClose?: number;
}

interface TiingoCryptoQuote {
  ticker?: string;
  baseCurrency?: string;
  quoteCurrency?: string;
  priceData?: Array<{
    date?: string;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    volume?: number;
    tradesDone?: number;
  }>;
}

interface TiingoForexQuote {
  ticker?: string;
  timestamp?: string;
  midPrice?: number;
  bidPrice?: number;
  askPrice?: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
}

// ── Normalizers ───────────────────────────────────────────────

function normalizeTiingoStock(
  raw: TiingoTickerQuote | TiingoEodQuote,
  displaySymbol: string,
  assetType: AssetType
): MarketQuote | null {
  const ticker = raw as TiingoTickerQuote;
  const eod = raw as TiingoEodQuote;

  const price = ticker.lastSalePrice ?? ticker.lastPrice ?? eod.close ?? null;
  if (price === null || price === undefined) return null;

  const timestamp = ticker.timestamp ?? eod.date ?? new Date().toISOString();

  return {
    symbol: displaySymbol,
    displaySymbol,
    assetType,
    price,
    bid: ticker.bidPrice ?? null,
    ask: ticker.askPrice ?? null,
    open: ticker.open ?? eod.open ?? null,
    high: ticker.high ?? eod.high ?? null,
    low: ticker.low ?? eod.low ?? null,
    previousClose: ticker.prevClose ?? null,
    change: null, // Tiingo stock ticker doesn't return change directly
    changePercent: null,
    volume: ticker.volume ?? eod.volume ?? null,
    timestamp: new Date(timestamp).toISOString(),
    provider: 'tiingo',
    delayed: true, // Tiingo free plan is delayed for stocks
  };
}

function normalizeTiingoCrypto(
  raw: TiingoCryptoQuote,
  displaySymbol: string
): MarketQuote | null {
  const latest = raw.priceData?.[raw.priceData.length - 1];
  if (!latest) return null;

  const price = latest.close ?? null;
  if (price === null) return null;

  return {
    symbol: displaySymbol,
    displaySymbol,
    assetType: 'crypto',
    price,
    open: latest.open ?? null,
    high: latest.high ?? null,
    low: latest.low ?? null,
    volume: latest.volume ?? null,
    timestamp: latest.date ? new Date(latest.date).toISOString() : new Date().toISOString(),
    provider: 'tiingo',
    delayed: false,
  };
}

function normalizeTiingoForex(
  raw: TiingoForexQuote,
  displaySymbol: string
): MarketQuote | null {
  const price = raw.midPrice ?? raw.close ?? null;
  if (price === null) return null;

  return {
    symbol: displaySymbol,
    displaySymbol,
    assetType: 'forex',
    price,
    bid: raw.bidPrice ?? null,
    ask: raw.askPrice ?? null,
    open: raw.open ?? null,
    high: raw.high ?? null,
    low: raw.low ?? null,
    timestamp: raw.timestamp ? new Date(raw.timestamp).toISOString() : new Date().toISOString(),
    provider: 'tiingo',
    delayed: false,
  };
}

// ── Public API ────────────────────────────────────────────────

/**
 * Fetch a stock/ETF quote from Tiingo.
 */
export async function fetchTiingoStockQuote(
  tiingoSymbol: string,
  displaySymbol: string,
  assetType: AssetType
): Promise<MarketQuote | null> {
  const token = getToken();
  if (!token) return null;

  try {
    // Try real-time IEX endpoint first, fall back to EOD
    const url = `${BASE_URL}/iex/${encodeURIComponent(tiingoSymbol)}`;
    const res = await fetchWithTimeout(url, TIMEOUT_MS, token);

    if (!res.ok) {
      console.error(`[Tiingo] Stock HTTP ${res.status} for ${tiingoSymbol}`);
      return null;
    }

    const data: TiingoTickerQuote[] = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    return normalizeTiingoStock(data[0], displaySymbol, assetType);
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.error(`[Tiingo] Timeout for ${tiingoSymbol}`);
    } else {
      console.error(`[Tiingo] Error for ${tiingoSymbol}:`, err instanceof Error ? err.message : 'unknown');
    }
    return null;
  }
}

/**
 * Fetch a crypto quote from Tiingo.
 * Tiingo crypto uses a different endpoint and symbol format (e.g. btcusd).
 */
export async function fetchTiingoCryptoQuote(
  tiingoSymbol: string,
  displaySymbol: string
): Promise<MarketQuote | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const url = `${BASE_URL}/tiingo/crypto/prices?tickers=${encodeURIComponent(tiingoSymbol)}&resampleFreq=1min`;
    const res = await fetchWithTimeout(url, TIMEOUT_MS, token);

    if (!res.ok) {
      console.error(`[Tiingo] Crypto HTTP ${res.status} for ${tiingoSymbol}`);
      return null;
    }

    const data: TiingoCryptoQuote[] = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    return normalizeTiingoCrypto(data[0], displaySymbol);
  } catch (err: unknown) {
    console.error(`[Tiingo] Crypto error for ${tiingoSymbol}:`, err instanceof Error ? err.message : 'unknown');
    return null;
  }
}

/**
 * Fetch a forex quote from Tiingo.
 */
export async function fetchTiingoForexQuote(
  tiingoSymbol: string,
  displaySymbol: string
): Promise<MarketQuote | null> {
  const token = getToken();
  if (!token) return null;

  try {
    const url = `${BASE_URL}/tiingo/fx/${encodeURIComponent(tiingoSymbol)}/top`;
    const res = await fetchWithTimeout(url, TIMEOUT_MS, token);

    if (!res.ok) {
      console.error(`[Tiingo] Forex HTTP ${res.status} for ${tiingoSymbol}`);
      return null;
    }

    const data: TiingoForexQuote[] = await res.json();
    if (!Array.isArray(data) || data.length === 0) return null;

    return normalizeTiingoForex(data[0], displaySymbol);
  } catch (err: unknown) {
    console.error(`[Tiingo] Forex error for ${tiingoSymbol}:`, err instanceof Error ? err.message : 'unknown');
    return null;
  }
}
