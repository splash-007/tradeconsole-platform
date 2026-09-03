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
  { displaySymbol: 'BTC/USD', twelveDataSymbol: 'BTC/USD', tiingoSymbol: 'btcusd', request: { symbol: 'BTC/USD', displaySymbol: 'BTC/USD', assetType: 'crypto' } },
  { displaySymbol: 'ETH/USD', twelveDataSymbol: 'ETH/USD', tiingoSymbol: 'ethusd', request: { symbol: 'ETH/USD', displaySymbol: 'ETH/USD', assetType: 'crypto' } },
  { displaySymbol: 'SOL/USD', twelveDataSymbol: 'SOL/USD', tiingoSymbol: 'solusd', request: { symbol: 'SOL/USD', displaySymbol: 'SOL/USD', assetType: 'crypto' } },
  { displaySymbol: 'XRP/USD', twelveDataSymbol: 'XRP/USD', tiingoSymbol: 'xrpusd', request: { symbol: 'XRP/USD', displaySymbol: 'XRP/USD', assetType: 'crypto' } },
  { displaySymbol: 'BNB/USD', twelveDataSymbol: 'BNB/USD', tiingoSymbol: 'bnbusd', request: { symbol: 'BNB/USD', displaySymbol: 'BNB/USD', assetType: 'crypto' } },
  { displaySymbol: 'ADA/USD', twelveDataSymbol: 'ADA/USD', tiingoSymbol: 'adausd', request: { symbol: 'ADA/USD', displaySymbol: 'ADA/USD', assetType: 'crypto' } },
  { displaySymbol: 'AVAX/USD', twelveDataSymbol: 'AVAX/USD', tiingoSymbol: 'avaxusd', request: { symbol: 'AVAX/USD', displaySymbol: 'AVAX/USD', assetType: 'crypto' } },
  { displaySymbol: 'DOT/USD', twelveDataSymbol: 'DOT/USD', tiingoSymbol: 'dotusd', request: { symbol: 'DOT/USD', displaySymbol: 'DOT/USD', assetType: 'crypto' } },
  { displaySymbol: 'LINK/USD', twelveDataSymbol: 'LINK/USD', tiingoSymbol: 'linkusd', request: { symbol: 'LINK/USD', displaySymbol: 'LINK/USD', assetType: 'crypto' } },
  { displaySymbol: 'UNI/USD', twelveDataSymbol: 'UNI/USD', tiingoSymbol: 'uniusd', request: { symbol: 'UNI/USD', displaySymbol: 'UNI/USD', assetType: 'crypto' } },
  // ── Forex ────────────────────────────────────────────────────
  { displaySymbol: 'EUR/USD', twelveDataSymbol: 'EUR/USD', tiingoSymbol: 'eurusd', request: { symbol: 'EUR/USD', displaySymbol: 'EUR/USD', assetType: 'forex' } },
  { displaySymbol: 'GBP/USD', twelveDataSymbol: 'GBP/USD', tiingoSymbol: 'gbpusd', request: { symbol: 'GBP/USD', displaySymbol: 'GBP/USD', assetType: 'forex' } },
  { displaySymbol: 'USD/JPY', twelveDataSymbol: 'USD/JPY', tiingoSymbol: 'usdjpy', request: { symbol: 'USD/JPY', displaySymbol: 'USD/JPY', assetType: 'forex' } },
  { displaySymbol: 'USD/CHF', twelveDataSymbol: 'USD/CHF', tiingoSymbol: 'usdchf', request: { symbol: 'USD/CHF', displaySymbol: 'USD/CHF', assetType: 'forex' } },
  { displaySymbol: 'AUD/USD', twelveDataSymbol: 'AUD/USD', tiingoSymbol: 'audusd', request: { symbol: 'AUD/USD', displaySymbol: 'AUD/USD', assetType: 'forex' } },
  { displaySymbol: 'USD/CAD', twelveDataSymbol: 'USD/CAD', tiingoSymbol: 'usdcad', request: { symbol: 'USD/CAD', displaySymbol: 'USD/CAD', assetType: 'forex' } },
  { displaySymbol: 'NZD/USD', twelveDataSymbol: 'NZD/USD', tiingoSymbol: 'nzdusd', request: { symbol: 'NZD/USD', displaySymbol: 'NZD/USD', assetType: 'forex' } },
  { displaySymbol: 'EUR/GBP', twelveDataSymbol: 'EUR/GBP', tiingoSymbol: 'eurgbp', request: { symbol: 'EUR/GBP', displaySymbol: 'EUR/GBP', assetType: 'forex' } },
  { displaySymbol: 'EUR/JPY', twelveDataSymbol: 'EUR/JPY', tiingoSymbol: 'eurjpy', request: { symbol: 'EUR/JPY', displaySymbol: 'EUR/JPY', assetType: 'forex' } },
  { displaySymbol: 'GBP/JPY', twelveDataSymbol: 'GBP/JPY', tiingoSymbol: 'gbpjpy', request: { symbol: 'GBP/JPY', displaySymbol: 'GBP/JPY', assetType: 'forex' } },
  // ── Stocks ───────────────────────────────────────────────────
  { displaySymbol: 'AAPL', twelveDataSymbol: 'AAPL', tiingoSymbol: 'aapl', request: { symbol: 'AAPL', displaySymbol: 'AAPL', assetType: 'stock' } },
  { displaySymbol: 'NVDA', twelveDataSymbol: 'NVDA', tiingoSymbol: 'nvda', request: { symbol: 'NVDA', displaySymbol: 'NVDA', assetType: 'stock' } },
  { displaySymbol: 'MSFT', twelveDataSymbol: 'MSFT', tiingoSymbol: 'msft', request: { symbol: 'MSFT', displaySymbol: 'MSFT', assetType: 'stock' } },
  { displaySymbol: 'TSLA', twelveDataSymbol: 'TSLA', tiingoSymbol: 'tsla', request: { symbol: 'TSLA', displaySymbol: 'TSLA', assetType: 'stock' } },
  { displaySymbol: 'AMZN', twelveDataSymbol: 'AMZN', tiingoSymbol: 'amzn', request: { symbol: 'AMZN', displaySymbol: 'AMZN', assetType: 'stock' } },
  { displaySymbol: 'GOOGL', twelveDataSymbol: 'GOOGL', tiingoSymbol: 'googl', request: { symbol: 'GOOGL', displaySymbol: 'GOOGL', assetType: 'stock' } },
  { displaySymbol: 'META', twelveDataSymbol: 'META', tiingoSymbol: 'meta', request: { symbol: 'META', displaySymbol: 'META', assetType: 'stock' } },
  { displaySymbol: 'NFLX', twelveDataSymbol: 'NFLX', tiingoSymbol: 'nflx', request: { symbol: 'NFLX', displaySymbol: 'NFLX', assetType: 'stock' } },
  { displaySymbol: 'AMD', twelveDataSymbol: 'AMD', tiingoSymbol: 'amd', request: { symbol: 'AMD', displaySymbol: 'AMD', assetType: 'stock' } },
  { displaySymbol: 'INTC', twelveDataSymbol: 'INTC', tiingoSymbol: 'intc', request: { symbol: 'INTC', displaySymbol: 'INTC', assetType: 'stock' } },
  // ── ETFs ─────────────────────────────────────────────────────
  { displaySymbol: 'SPY', twelveDataSymbol: 'SPY', tiingoSymbol: 'spy', request: { symbol: 'SPY', displaySymbol: 'SPY', assetType: 'etf' } },
  { displaySymbol: 'QQQ', twelveDataSymbol: 'QQQ', tiingoSymbol: 'qqq', request: { symbol: 'QQQ', displaySymbol: 'QQQ', assetType: 'etf' } },
  { displaySymbol: 'IWM', twelveDataSymbol: 'IWM', tiingoSymbol: 'iwm', request: { symbol: 'IWM', displaySymbol: 'IWM', assetType: 'etf' } },
  { displaySymbol: 'DIA', twelveDataSymbol: 'DIA', tiingoSymbol: 'dia', request: { symbol: 'DIA', displaySymbol: 'DIA', assetType: 'etf' } },
];

/** Look up a mapping by display symbol (case-insensitive). */
export function getMapping(displaySymbol: string): SymbolMapping | undefined {
  return SYMBOL_REGISTRY.find(
    m => m.displaySymbol.toLowerCase() === displaySymbol.toLowerCase()
  );
}

/** All display symbols supported by at least one provider. */
export const SUPPORTED_SYMBOLS = SYMBOL_REGISTRY.map(m => m.displaySymbol);
