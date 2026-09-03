import type { QuoteRequest } from './types';

/**
 * Canonical symbol registry for Trade Console.
 * Maps Trade Console display symbols to provider-specific formats.
 * UI components only ever see displaySymbol — provider formats are internal.
 */

export interface SymbolMapping {
  displaySymbol: string;
  twelveDataSymbol: string;
  tiingoSymbol: string;
  request: QuoteRequest;
}

export const SYMBOL_REGISTRY: SymbolMapping[] = [
  // ── Crypto ──────────────────────────────────────────────────
  {
    displaySymbol: 'BTC/USD',
    twelveDataSymbol: 'BTC/USD',
    tiingoSymbol: 'btcusd',
    request: { symbol: 'BTC/USD', displaySymbol: 'BTC/USD', assetType: 'crypto' },
  },
  {
    displaySymbol: 'ETH/USD',
    twelveDataSymbol: 'ETH/USD',
    tiingoSymbol: 'ethusd',
    request: { symbol: 'ETH/USD', displaySymbol: 'ETH/USD', assetType: 'crypto' },
  },
  {
    displaySymbol: 'SOL/USD',
    twelveDataSymbol: 'SOL/USD',
    tiingoSymbol: 'solusd',
    request: { symbol: 'SOL/USD', displaySymbol: 'SOL/USD', assetType: 'crypto' },
  },
  {
    displaySymbol: 'XRP/USD',
    twelveDataSymbol: 'XRP/USD',
    tiingoSymbol: 'xrpusd',
    request: { symbol: 'XRP/USD', displaySymbol: 'XRP/USD', assetType: 'crypto' },
  },
  // ── Forex ────────────────────────────────────────────────────
  {
    displaySymbol: 'EUR/USD',
    twelveDataSymbol: 'EUR/USD',
    tiingoSymbol: 'eurusd',
    request: { symbol: 'EUR/USD', displaySymbol: 'EUR/USD', assetType: 'forex' },
  },
  {
    displaySymbol: 'GBP/USD',
    twelveDataSymbol: 'GBP/USD',
    tiingoSymbol: 'gbpusd',
    request: { symbol: 'GBP/USD', displaySymbol: 'GBP/USD', assetType: 'forex' },
  },
  {
    displaySymbol: 'USD/JPY',
    twelveDataSymbol: 'USD/JPY',
    tiingoSymbol: 'usdjpy',
    request: { symbol: 'USD/JPY', displaySymbol: 'USD/JPY', assetType: 'forex' },
  },
  {
    displaySymbol: 'USD/CHF',
    twelveDataSymbol: 'USD/CHF',
    tiingoSymbol: 'usdchf',
    request: { symbol: 'USD/CHF', displaySymbol: 'USD/CHF', assetType: 'forex' },
  },
  {
    displaySymbol: 'AUD/USD',
    twelveDataSymbol: 'AUD/USD',
    tiingoSymbol: 'audusd',
    request: { symbol: 'AUD/USD', displaySymbol: 'AUD/USD', assetType: 'forex' },
  },
  // ── Stocks ───────────────────────────────────────────────────
  {
    displaySymbol: 'AAPL',
    twelveDataSymbol: 'AAPL',
    tiingoSymbol: 'aapl',
    request: { symbol: 'AAPL', displaySymbol: 'AAPL', assetType: 'stock' },
  },
  {
    displaySymbol: 'NVDA',
    twelveDataSymbol: 'NVDA',
    tiingoSymbol: 'nvda',
    request: { symbol: 'NVDA', displaySymbol: 'NVDA', assetType: 'stock' },
  },
  {
    displaySymbol: 'MSFT',
    twelveDataSymbol: 'MSFT',
    tiingoSymbol: 'msft',
    request: { symbol: 'MSFT', displaySymbol: 'MSFT', assetType: 'stock' },
  },
  {
    displaySymbol: 'TSLA',
    twelveDataSymbol: 'TSLA',
    tiingoSymbol: 'tsla',
    request: { symbol: 'TSLA', displaySymbol: 'TSLA', assetType: 'stock' },
  },
  {
    displaySymbol: 'AMZN',
    twelveDataSymbol: 'AMZN',
    tiingoSymbol: 'amzn',
    request: { symbol: 'AMZN', displaySymbol: 'AMZN', assetType: 'stock' },
  },
  // ── ETFs ─────────────────────────────────────────────────────
  {
    displaySymbol: 'SPY',
    twelveDataSymbol: 'SPY',
    tiingoSymbol: 'spy',
    request: { symbol: 'SPY', displaySymbol: 'SPY', assetType: 'etf' },
  },
  {
    displaySymbol: 'QQQ',
    twelveDataSymbol: 'QQQ',
    tiingoSymbol: 'qqq',
    request: { symbol: 'QQQ', displaySymbol: 'QQQ', assetType: 'etf' },
  },
];

/** Look up a mapping by display symbol (case-insensitive). */
export function getMapping(displaySymbol: string): SymbolMapping | undefined {
  return SYMBOL_REGISTRY.find(
    m => m.displaySymbol.toLowerCase() === displaySymbol.toLowerCase()
  );
}

/** All display symbols supported by at least one provider. */
export const SUPPORTED_SYMBOLS = SYMBOL_REGISTRY.map(m => m.displaySymbol);
