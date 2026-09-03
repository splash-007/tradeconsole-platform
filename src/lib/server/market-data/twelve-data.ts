/**
 * Twelve Data provider — server-only.
 * Reads TWELVE_DATA_API_KEY from process.env.
 * Never import this file in client components.
 */

import type { MarketQuote, AssetType } from './types';

const BASE_URL = 'https://api.twelvedata.com';
const TIMEOUT_MS = 8000;

function getApiKey(): string | null {
  return process.env.TWELVE_DATA_API_KEY ?? null;
}

/** Fetch with timeout */
async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal, cache: 'no-store' });
  } finally {
    clearTimeout(timer);
  }
}

interface TwelveQuoteRaw {
  symbol?: string;
  name?: string;
  exchange?: string;
  currency?: string;
  datetime?: string;
  timestamp?: number;
  open?: string;
  high?: string;
  low?: string;
  close?: string;
  volume?: string;
  previous_close?: string;
  change?: string;
  percent_change?: string;
  is_market_open?: boolean;
  fifty_two_week?: {
    low?: string;
    high?: string;
  };
  status?: string;
  code?: number;
  message?: string;
}

function parseNum(v: string | undefined | null): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = parseFloat(v);
  return isNaN(n) ? null : n;
}

function normalizeQuote(
  raw: TwelveQuoteRaw,
  displaySymbol: string,
  assetType: AssetType
): MarketQuote | null {
  // Twelve Data returns status:"error" on bad symbol/key
  if (raw.status === 'error' || raw.code !== undefined) {
    return null;
  }

  const price = parseNum(raw.close);
  if (price === null) return null;

  return {
    symbol: displaySymbol,
    displaySymbol,
    assetType,
    price,
    open: parseNum(raw.open),
    high: parseNum(raw.high),
    low: parseNum(raw.low),
    previousClose: parseNum(raw.previous_close),
    change: parseNum(raw.change),
    changePercent: parseNum(raw.percent_change),
    volume: parseNum(raw.volume),
    timestamp: raw.datetime
      ? new Date(raw.datetime).toISOString()
      : new Date().toISOString(),
    provider: 'twelve_data',
    delayed: false,
  };
}

/**
 * Fetch a single quote from Twelve Data.
 * Returns null if key is missing, symbol unsupported, or request fails.
 */
export async function fetchTwelveDataQuote(
  twelveSymbol: string,
  displaySymbol: string,
  assetType: AssetType
): Promise<MarketQuote | null> {
  const key = getApiKey();
  if (!key) {
    // Key not available in this environment — graceful degradation
    return null;
  }

  try {
    const url = `${BASE_URL}/quote?symbol=${encodeURIComponent(twelveSymbol)}&apikey=${key}`;
    const res = await fetchWithTimeout(url, TIMEOUT_MS);

    if (!res.ok) {
      console.error(`[TwelveData] HTTP ${res.status} for ${twelveSymbol}`);
      return null;
    }

    const data: TwelveQuoteRaw = await res.json();
    return normalizeQuote(data, displaySymbol, assetType);
  } catch (err: unknown) {
    if (err instanceof Error && err.name === 'AbortError') {
      console.error(`[TwelveData] Timeout for ${twelveSymbol}`);
    } else {
      console.error(`[TwelveData] Error for ${twelveSymbol}:`, err instanceof Error ? err.message : 'unknown');
    }
    return null;
  }
}

/**
 * Batch-fetch multiple quotes from Twelve Data in a single API call.
 * Twelve Data supports comma-separated symbols in /quote.
 * Returns a map of displaySymbol → MarketQuote | null.
 */
export async function fetchTwelveDataBatch(
  requests: Array<{ twelveSymbol: string; displaySymbol: string; assetType: AssetType }>
): Promise<Map<string, MarketQuote | null>> {
  const result = new Map<string, MarketQuote | null>();

  const key = getApiKey();
  if (!key) {
    requests.forEach(r => result.set(r.displaySymbol, null));
    return result;
  }

  if (requests.length === 0) return result;

  // Twelve Data supports batching via comma-separated symbols
  const symbols = requests.map(r => r.twelveSymbol).join(',');

  try {
    const url = `${BASE_URL}/quote?symbol=${encodeURIComponent(symbols)}&apikey=${key}`;
    const res = await fetchWithTimeout(url, TIMEOUT_MS);

    if (!res.ok) {
      console.error(`[TwelveData] Batch HTTP ${res.status}`);
      requests.forEach(r => result.set(r.displaySymbol, null));
      return result;
    }

    const data: Record<string, TwelveQuoteRaw> | TwelveQuoteRaw = await res.json();

    // Single symbol returns object directly; multiple returns keyed object
    if (requests.length === 1) {
      const single = data as TwelveQuoteRaw;
      const r = requests[0];
      result.set(r.displaySymbol, normalizeQuote(single, r.displaySymbol, r.assetType));
    } else {
      const multi = data as Record<string, TwelveQuoteRaw>;
      for (const r of requests) {
        const raw = multi[r.twelveSymbol];
        result.set(r.displaySymbol, raw ? normalizeQuote(raw, r.displaySymbol, r.assetType) : null);
      }
    }
  } catch (err: unknown) {
    console.error('[TwelveData] Batch error:', err instanceof Error ? err.message : 'unknown');
    requests.forEach(r => result.set(r.displaySymbol, null));
  }

  return result;
}
