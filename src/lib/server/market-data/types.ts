/**
 * Server-only market data types.
 * These types are shared between server-side providers and API routes.
 * Never import this file in client components directly — use the API routes instead.
 */

export type AssetType =
  | 'crypto' |'forex' |'stock' |'etf' |'index' |'commodity' |'metal' |'energy';

export type ProviderName = 'twelve_data' | 'tiingo';

export interface MarketQuote {
  symbol: string;
  displaySymbol: string;
  assetType: AssetType;

  price: number | null;
  bid?: number | null;
  ask?: number | null;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  previousClose?: number | null;
  change?: number | null;
  changePercent?: number | null;
  volume?: number | null;
  timestamp: string;
  provider: ProviderName;
  delayed?: boolean;
}

export interface QuoteRequest {
  symbol: string;
  displaySymbol: string;
  assetType: AssetType;
}

export interface MarketDataError {
  symbol: string;
  provider: ProviderName | 'none';
  reason: string;
}

export interface QuoteResult {
  quote: MarketQuote | null;
  error?: MarketDataError;
}
