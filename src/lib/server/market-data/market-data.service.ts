/**
 * Server-only market data service.
 * Orchestrates Twelve Data (primary) → Tiingo (fallback).
 * Never import this file in client components.
 *
 * Fallback chain:
 *   Twelve Data → valid? return
 *               → Tiingo → valid? return
 *                        → null (data unavailable)
 */

import type { MarketQuote, QuoteResult } from './types';
import { getMapping, SYMBOL_REGISTRY } from './symbols';
import { fetchTwelveDataBatch } from './twelve-data';
import {
  fetchTiingoStockQuote,
  fetchTiingoCryptoQuote,
  fetchTiingoForexQuote,
} from './tiingo';

// ── Simple in-process cache ───────────────────────────────────
// Prevents duplicate simultaneous requests and reduces provider quota usage.
// Cache TTL: 25 seconds (within the 20–30s polling window).

const CACHE_TTL_MS = 25_000;

interface CacheEntry {
  quote: MarketQuote | null;
  fetchedAt: number;
}

const cache = new Map<string, CacheEntry>();

function getCached(displaySymbol: string): MarketQuote | null | undefined {
  const entry = cache.get(displaySymbol);
  if (!entry) return undefined;
  if (Date.now() - entry.fetchedAt > CACHE_TTL_MS) {
    cache.delete(displaySymbol);
    return undefined;
  }
  return entry.quote;
}

function setCache(displaySymbol: string, quote: MarketQuote | null): void {
  cache.set(displaySymbol, { quote, fetchedAt: Date.now() });
}

// ── In-flight deduplication ───────────────────────────────────
const inFlight = new Map<string, Promise<MarketQuote | null>>();

// ── Tiingo fallback per asset type ────────────────────────────

async function fetchTiingoFallback(displaySymbol: string): Promise<MarketQuote | null> {
  const mapping = getMapping(displaySymbol);
  if (!mapping) return null;

  const { tiingoSymbol, request } = mapping;

  switch (request.assetType) {
    case 'crypto':
      return fetchTiingoCryptoQuote(tiingoSymbol, displaySymbol);
    case 'forex':
      return fetchTiingoForexQuote(tiingoSymbol, displaySymbol);
    case 'stock': case'etf':
      return fetchTiingoStockQuote(tiingoSymbol, displaySymbol, request.assetType);
    default:
      // Indices, commodities, metals, energy — not yet supported by these providers
      return null;
  }
}

// ── Core single-quote fetch ───────────────────────────────────

async function fetchQuoteUncached(displaySymbol: string): Promise<MarketQuote | null> {
  const mapping = getMapping(displaySymbol);
  if (!mapping) return null;

  // 1. Try Twelve Data
  const tdResults = await fetchTwelveDataBatch([
    {
      twelveSymbol: mapping.twelveDataSymbol,
      displaySymbol: mapping.displaySymbol,
      assetType: mapping.request.assetType,
    },
  ]);
  const tdQuote = tdResults.get(displaySymbol) ?? null;
  if (tdQuote !== null) return tdQuote;

  // 2. Fallback to Tiingo
  const tiingoQuote = await fetchTiingoFallback(displaySymbol);
  return tiingoQuote;
}

// ── Public API ────────────────────────────────────────────────

/**
 * Fetch a single quote with caching and in-flight deduplication.
 */
export async function getQuote(displaySymbol: string): Promise<QuoteResult> {
  const cached = getCached(displaySymbol);
  if (cached !== undefined) {
    return { quote: cached };
  }

  // Deduplicate concurrent requests for the same symbol
  let pending = inFlight.get(displaySymbol);
  if (!pending) {
    pending = fetchQuoteUncached(displaySymbol).then(q => {
      setCache(displaySymbol, q);
      inFlight.delete(displaySymbol);
      return q;
    }).catch(err => {
      inFlight.delete(displaySymbol);
      console.error(`[MarketDataService] Unhandled error for ${displaySymbol}:`, err);
      return null;
    });
    inFlight.set(displaySymbol, pending);
  }

  const quote = await pending;
  return { quote };
}

/**
 * Batch-fetch multiple quotes efficiently.
 * Groups by provider to minimize API calls.
 */
export async function getQuotes(displaySymbols: string[]): Promise<Map<string, QuoteResult>> {
  const results = new Map<string, QuoteResult>();
  const toFetch: string[] = [];

  // Serve from cache first
  for (const sym of displaySymbols) {
    const cached = getCached(sym);
    if (cached !== undefined) {
      results.set(sym, { quote: cached });
    } else {
      toFetch.push(sym);
    }
  }

  if (toFetch.length === 0) return results;

  // Build Twelve Data batch request
  const tdRequests = toFetch
    .map(sym => {
      const mapping = getMapping(sym);
      if (!mapping) return null;
      return {
        twelveSymbol: mapping.twelveDataSymbol,
        displaySymbol: mapping.displaySymbol,
        assetType: mapping.request.assetType,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);

  // Fetch all from Twelve Data in one batch call
  const tdResults = await fetchTwelveDataBatch(tdRequests).catch(() => new Map<string, MarketQuote | null>());

  // For symbols where Twelve Data returned null, try Tiingo
  const tiingoFallbacks: Promise<void>[] = [];

  for (const sym of toFetch) {
    const tdQuote = tdResults.get(sym) ?? null;
    if (tdQuote !== null) {
      setCache(sym, tdQuote);
      results.set(sym, { quote: tdQuote });
    } else {
      // Schedule Tiingo fallback
      tiingoFallbacks.push(
        fetchTiingoFallback(sym).then(q => {
          setCache(sym, q);
          results.set(sym, { quote: q });
        }).catch(() => {
          setCache(sym, null);
          results.set(sym, { quote: null });
        })
      );
    }
  }

  await Promise.all(tiingoFallbacks);

  return results;
}

/**
 * Returns all supported display symbols.
 */
export function getSupportedSymbols(): string[] {
  return SYMBOL_REGISTRY.map(m => m.displaySymbol);
}
