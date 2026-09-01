// ============================================================
// CENTRALIZED MARKET DATA SERVICE — Trade Console
// ============================================================
// Architecture:
//   Market Provider (Coinbase / Kraken / etc.)
//     ↓ Trade Console Backend API
//     ↓ Valkey cache / realtime
//     ↓ Trade Console WebSocket/API
//     ↓ market-data.service (this file)
//     ↓ Trading UI
//
// NEVER expose provider API secrets in frontend code.
// NEVER spread fetch/WebSocket logic across components.
// ALL market data must flow through this service.
// ============================================================

// ── Normalized contracts ──────────────────────────────────────

/**
 * Normalized candlestick data.
 * Provider-agnostic — maps from Coinbase, Kraken, or any future source.
 */
export interface MarketCandle {
  timestamp: number; // unix seconds
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Normalized quote / ticker data.
 * Provider-agnostic — maps from any exchange feed.
 *
 * Field naming follows the normalized contract.
 * Legacy aliases (price, changePct24h) are kept for backward compatibility
 * with existing components until they are migrated.
 */
export interface MarketQuote {
  symbol: string;        // e.g. "BTC-USD" as supplied by provider (do NOT silently remap)
  displaySymbol?: string; // e.g. "BTC/USD" — UI display label
  name: string;
  // Normalized fields
  lastPrice: number;
  change24h: number;
  change24hPct: number;
  // Legacy aliases — kept for backward compatibility
  /** @deprecated Use lastPrice */
  price: number;
  /** @deprecated Use change24hPct */
  changePct24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  bid?: number;
  ask?: number;
  marketCap?: number;
  lastUpdated: string;
  isMock: boolean;    // true = mock/fallback data, false = live data
  /** @deprecated Use isMock */
  isSimulated: boolean;
}

/**
 * Normalized order book level.
 */
export interface OrderBookLevel {
  price: number;
  amount: number;
  total: number;
}

/**
 * Normalized order book.
 */
export interface NormalizedOrderBook {
  symbol: string;
  asks: OrderBookLevel[]; // ascending price
  bids: OrderBookLevel[]; // descending price
  timestamp: number;
}

/**
 * Normalized recent trade.
 */
export interface NormalizedTrade {
  id: string;
  price: number;
  size: number;
  side: 'buy' | 'sell';
  timestamp: number; // unix ms
}

// ── Future backend API endpoints ─────────────────────────────
// GET  /api/v1/markets
// GET  /api/v1/markets/:symbol/quote
// GET  /api/v1/markets/:symbol/candles?timeframe=1H&limit=100
// GET  /api/v1/markets/:symbol/order-book
// GET  /api/v1/markets/:symbol/trades
//
// WebSocket events:
//   market.quote.updated
//   market.candle.updated
//   market.orderbook.updated
//   market.trade.created

// ── Legacy alias (kept for backward compatibility) ────────────
/** @deprecated Use MarketQuote instead */
export interface MarketQuoteLegacy {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  changePct24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap?: number;
  lastUpdated: string;
  isSimulated: boolean;
}

/** @deprecated Use MarketCandle instead */
export interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ── Provider interface ────────────────────────────────────────

interface MarketDataProvider {
  getQuotes(symbols: string[]): Promise<MarketQuote[]>;
  getQuote(symbol: string): Promise<MarketQuote | null>;
  getCandles(symbol: string, timeframe: string, limit: number): Promise<MarketCandle[]>;
  getMovers(): Promise<MarketQuote[]>;
  getOrderBook(symbol: string): Promise<NormalizedOrderBook>;
  getRecentTrades(symbol: string): Promise<NormalizedTrade[]>;
  subscribe(symbols: string[], onUpdate: (quote: MarketQuote) => void): () => void;
}

// ── Mock provider ─────────────────────────────────────────────
// Replace with LiveMarketProvider when backend WebSocket is ready.
// Connects to: wss://${NEXT_PUBLIC_WS_URL}/ws/markets
// Events: market.quote.updated, market.candle.updated, etc.

class MockMarketProvider implements MarketDataProvider {
  private baseQuotes: Record<string, MarketQuote> = {
    'BTC-USD': {
      symbol: 'BTC-USD', displaySymbol: 'BTC/USD', name: 'Bitcoin',
      lastPrice: 67842.35, price: 67842.35,
      change24h: 1284.20, change24hPct: 1.93, changePct24h: 1.93,
      high24h: 68420.00, low24h: 66180.00, volume24h: 28_400_000_000,
      marketCap: 1_340_000_000_000, lastUpdated: new Date().toISOString(), isMock: true, isSimulated: false,
    },
    'ETH-USD': {
      symbol: 'ETH-USD', displaySymbol: 'ETH/USD', name: 'Ethereum',
      lastPrice: 3842.18, price: 3842.18,
      change24h: -42.30, change24hPct: -1.09, changePct24h: -1.09,
      high24h: 3920.00, low24h: 3780.00, volume24h: 14_200_000_000,
      marketCap: 462_000_000_000, lastUpdated: new Date().toISOString(), isMock: true, isSimulated: false,
    },
    'SOL-USD': {
      symbol: 'SOL-USD', displaySymbol: 'SOL/USD', name: 'Solana',
      lastPrice: 182.45, price: 182.45,
      change24h: 8.92, change24hPct: 5.14, changePct24h: 5.14,
      high24h: 185.00, low24h: 172.00, volume24h: 3_800_000_000,
      lastUpdated: new Date().toISOString(), isMock: true, isSimulated: false,
    },
    'BNB-USD': {
      symbol: 'BNB-USD', displaySymbol: 'BNB/USD', name: 'BNB',
      lastPrice: 542.80, price: 542.80,
      change24h: 15.20, change24hPct: 2.88, changePct24h: 2.88,
      high24h: 548.00, low24h: 525.00, volume24h: 1_200_000_000,
      lastUpdated: new Date().toISOString(), isMock: true, isSimulated: false,
    },
    'ADA-USD': {
      symbol: 'ADA-USD', displaySymbol: 'ADA/USD', name: 'Cardano',
      lastPrice: 0.4820, price: 0.4820,
      change24h: -0.0120, change24hPct: -2.43, changePct24h: -2.43,
      high24h: 0.4980, low24h: 0.4750, volume24h: 420_000_000,
      lastUpdated: new Date().toISOString(), isMock: true, isSimulated: false,
    },
    'XRP-USD': {
      symbol: 'XRP-USD', displaySymbol: 'XRP/USD', name: 'XRP',
      lastPrice: 0.6240, price: 0.6240,
      change24h: 0.0180, change24hPct: 2.97, changePct24h: 2.97,
      high24h: 0.6380, low24h: 0.6050, volume24h: 1_800_000_000,
      lastUpdated: new Date().toISOString(), isMock: true, isSimulated: false,
    },
    'XAU-USD': {
      symbol: 'XAU-USD', displaySymbol: 'XAU/USD', name: 'Gold',
      lastPrice: 2485.30, price: 2485.30,
      change24h: 12.40, change24hPct: 0.50, changePct24h: 0.50,
      high24h: 2492.00, low24h: 2470.00, volume24h: 0,
      lastUpdated: new Date().toISOString(), isMock: true, isSimulated: false,
    },
    'EUR-USD': {
      symbol: 'EUR-USD', displaySymbol: 'EUR/USD', name: 'Euro / US Dollar',
      lastPrice: 1.0842, price: 1.0842,
      change24h: -0.0018, change24hPct: -0.17, changePct24h: -0.17,
      high24h: 1.0875, low24h: 1.0820, volume24h: 0,
      lastUpdated: new Date().toISOString(), isMock: true, isSimulated: false,
    },
  };

  private subscribers: Map<string, ((q: MarketQuote) => void)[]> = new Map();
  private intervalId: ReturnType<typeof setInterval> | null = null;

  async getQuotes(symbols: string[]): Promise<MarketQuote[]> {
    return symbols.map(s => this.baseQuotes[s]).filter(Boolean);
  }

  async getQuote(symbol: string): Promise<MarketQuote | null> {
    return this.baseQuotes[symbol] || null;
  }

  async getCandles(symbol: string, timeframe: string, limit: number = 100): Promise<MarketCandle[]> {
    // BACKEND INTEGRATION: GET /api/v1/markets/:symbol/candles?timeframe=...&limit=...
    const base = this.baseQuotes[symbol]?.lastPrice || 67842;
    const candles: MarketCandle[] = [];
    let price = base * 0.95;
    const now = Math.floor(Date.now() / 1000);
    const intervals: Record<string, number> = {
      '1m': 60, '5m': 300, '15m': 900, '1H': 3600, '4H': 14400, '1D': 86400, '1W': 604800,
    };
    const interval = intervals[timeframe] || 3600;

    for (let i = limit; i >= 0; i--) {
      const change = (Math.random() - 0.48) * price * 0.008;
      const open = price;
      const close = price + change;
      const high = Math.max(open, close) * (1 + Math.random() * 0.003);
      const low = Math.min(open, close) * (1 - Math.random() * 0.003);
      candles.push({
        timestamp: now - i * interval,
        open,
        high,
        low,
        close,
        volume: Math.random() * 1000 + 100,
      });
      price = close;
    }
    return candles;
  }

  async getMovers(): Promise<MarketQuote[]> {
    return Object.values(this.baseQuotes)
      .sort((a, b) => Math.abs(b.change24hPct) - Math.abs(a.change24hPct))
      .slice(0, 6);
  }

  async getOrderBook(symbol: string): Promise<NormalizedOrderBook> {
    // BACKEND INTEGRATION: GET /api/v1/markets/:symbol/order-book
    // WebSocket: market.orderbook.updated
    const base = this.baseQuotes[symbol]?.lastPrice || 67842;
    const asks: OrderBookLevel[] = [];
    const bids: OrderBookLevel[] = [];
    let askTotal = 0;
    let bidTotal = 0;
    for (let i = 0; i < 12; i++) {
      const askPrice = base * (1 + (i + 1) * 0.0002);
      const askAmt = Math.random() * 0.8 + 0.05;
      askTotal += askPrice * askAmt;
      asks.push({ price: askPrice, amount: askAmt, total: askTotal });

      const bidPrice = base * (1 - (i + 1) * 0.0002);
      const bidAmt = Math.random() * 0.8 + 0.05;
      bidTotal += bidPrice * bidAmt;
      bids.push({ price: bidPrice, amount: bidAmt, total: bidTotal });
    }
    return { symbol, asks, bids, timestamp: Date.now() };
  }

  async getRecentTrades(symbol: string): Promise<NormalizedTrade[]> {
    // BACKEND INTEGRATION: GET /api/v1/markets/:symbol/trades
    // WebSocket: market.trade.created
    const base = this.baseQuotes[symbol]?.lastPrice || 67842;
    const now = Date.now();
    return Array.from({ length: 20 }, (_, i) => ({
      id: `mock-trade-${i}`,
      price: base * (1 + (Math.random() - 0.5) * 0.001),
      size: Math.random() * 0.5 + 0.001,
      side: (Math.random() > 0.5 ? 'buy' : 'sell') as 'buy' | 'sell',
      timestamp: now - i * 8000,
    }));
  }

  subscribe(symbols: string[], onUpdate: (quote: MarketQuote) => void): () => void {
    symbols.forEach(s => {
      if (!this.subscribers.has(s)) this.subscribers.set(s, []);
      this.subscribers.get(s)!.push(onUpdate);
    });

    if (!this.intervalId) {
      this.intervalId = setInterval(() => {
        this.subscribers.forEach((cbs, symbol) => {
          if (this.baseQuotes[symbol]) {
            const q = this.baseQuotes[symbol];
            const delta = (Math.random() - 0.5) * q.lastPrice * 0.0008;
            q.lastPrice = Math.max(0.0001, q.lastPrice + delta);
            q.price = q.lastPrice; // keep legacy alias in sync
            q.lastUpdated = new Date().toISOString();
            cbs.forEach(cb => cb({ ...q }));
          }
        });
      }, 2000);
    }

    return () => {
      symbols.forEach(s => {
        const cbs = this.subscribers.get(s) || [];
        this.subscribers.set(s, cbs.filter(cb => cb !== onUpdate));
      });
    };
  }
}

// ── Service singleton ─────────────────────────────────────────

const provider: MarketDataProvider = new MockMarketProvider();

export const marketDataService = {
  /** Get quotes for multiple symbols */
  async getQuotes(symbols: string[]): Promise<MarketQuote[]> {
    return provider.getQuotes(symbols);
  },
  /** Get a single quote */
  async getQuote(symbol: string): Promise<MarketQuote | null> {
    return provider.getQuote(symbol);
  },
  /** Get OHLCV candles — normalized MarketCandle[] */
  async getCandles(symbol: string, timeframe: string, limit?: number): Promise<MarketCandle[]> {
    return provider.getCandles(symbol, timeframe, limit ?? 100);
  },
  /** Get top movers */
  async getMovers(): Promise<MarketQuote[]> {
    return provider.getMovers();
  },
  /** Get normalized order book */
  async getOrderBook(symbol: string): Promise<NormalizedOrderBook> {
    return provider.getOrderBook(symbol);
  },
  /** Get normalized recent trades */
  async getRecentTrades(symbol: string): Promise<NormalizedTrade[]> {
    return provider.getRecentTrades(symbol);
  },
  /** Subscribe to live quote updates */
  subscribe(symbols: string[], onUpdate: (quote: MarketQuote) => void): () => void {
    return provider.subscribe(symbols, onUpdate);
  },
};
