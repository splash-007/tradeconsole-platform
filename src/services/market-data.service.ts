// CENTRALIZED MARKET DATA SERVICE
// ALL prices throughout the platform must derive from this service
// Architecture: External Provider → Trade Console Backend → Market Data Service → WebSocket → Browser
// NEVER expose provider API secrets in frontend code

export interface MarketQuote {
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
  isSimulated: boolean; // IMPORTANT: always false for live data
}

export interface Candle {
  time: number; // unix timestamp
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type MarketEvent = 'quote:update' | 'trade:update' | 'candle:update' | 'market:status';

interface MarketDataProvider {
  getQuotes(symbols: string[]): Promise<MarketQuote[]>;
  getQuote(symbol: string): Promise<MarketQuote | null>;
  getCandles(symbol: string, timeframe: string, limit: number): Promise<Candle[]>;
  getMovers(): Promise<MarketQuote[]>;
  subscribe(symbols: string[], onUpdate: (quote: MarketQuote) => void): () => void;
}

// Mock provider — replace with LiveMarketProvider when backend WebSocket is ready
class MockMarketProvider implements MarketDataProvider {
  private baseQuotes: Record<string, MarketQuote> = {
    'BTC/USDC': { symbol: 'BTC/USDC', name: 'Bitcoin', price: 67842.35, change24h: 1284.20, changePct24h: 1.93, high24h: 68420.00, low24h: 66180.00, volume24h: 28_400_000_000, marketCap: 1_340_000_000_000, lastUpdated: new Date().toISOString(), isSimulated: false },
    'ETH/USDC': { symbol: 'ETH/USDC', name: 'Ethereum', price: 3842.18, change24h: -42.30, changePct24h: -1.09, high24h: 3920.00, low24h: 3780.00, volume24h: 14_200_000_000, marketCap: 462_000_000_000, lastUpdated: new Date().toISOString(), isSimulated: false },
    'SOL/USDC': { symbol: 'SOL/USDC', name: 'Solana', price: 182.45, change24h: 8.92, changePct24h: 5.14, high24h: 185.00, low24h: 172.00, volume24h: 3_800_000_000, lastUpdated: new Date().toISOString(), isSimulated: false },
    'XAU/USD': { symbol: 'XAU/USD', name: 'Gold', price: 2485.30, change24h: 12.40, changePct24h: 0.50, high24h: 2492.00, low24h: 2470.00, volume24h: 0, lastUpdated: new Date().toISOString(), isSimulated: false },
    'EUR/USD': { symbol: 'EUR/USD', name: 'Euro / US Dollar', price: 1.0842, change24h: -0.0018, changePct24h: -0.17, high24h: 1.0875, low24h: 1.0820, volume24h: 0, lastUpdated: new Date().toISOString(), isSimulated: false },
    'BNB/USDC': { symbol: 'BNB/USDC', name: 'BNB', price: 542.80, change24h: 15.20, changePct24h: 2.88, high24h: 548.00, low24h: 525.00, volume24h: 1_200_000_000, lastUpdated: new Date().toISOString(), isSimulated: false },
    'ADA/USDC': { symbol: 'ADA/USDC', name: 'Cardano', price: 0.4820, change24h: -0.0120, changePct24h: -2.43, high24h: 0.4980, low24h: 0.4750, volume24h: 420_000_000, lastUpdated: new Date().toISOString(), isSimulated: false },
    'XRP/USDC': { symbol: 'XRP/USDC', name: 'XRP', price: 0.6240, change24h: 0.0180, changePct24h: 2.97, high24h: 0.6380, low24h: 0.6050, volume24h: 1_800_000_000, lastUpdated: new Date().toISOString(), isSimulated: false },
  };

  private subscribers: Map<string, ((q: MarketQuote) => void)[]> = new Map();
  private intervalId: ReturnType<typeof setInterval> | null = null;

  async getQuotes(symbols: string[]): Promise<MarketQuote[]> {
    return symbols.map(s => this.baseQuotes[s]).filter(Boolean);
  }

  async getQuote(symbol: string): Promise<MarketQuote | null> {
    return this.baseQuotes[symbol] || null;
  }

  async getCandles(symbol: string, timeframe: string, limit: number = 100): Promise<Candle[]> {
    // BACKEND INTEGRATION: GET /api/v1/markets/:symbol/candles?timeframe=...
    const base = this.baseQuotes[symbol]?.price || 67842;
    const candles: Candle[] = [];
    let price = base * 0.95;
    const now = Math.floor(Date.now() / 1000);
    const intervals: Record<string, number> = { '1m': 60, '5m': 300, '15m': 900, '1H': 3600, '4H': 14400, '1D': 86400 };
    const interval = intervals[timeframe] || 3600;

    for (let i = limit; i >= 0; i--) {
      const change = (Math.random() - 0.48) * price * 0.008;
      const open = price;
      const close = price + change;
      const high = Math.max(open, close) * (1 + Math.random() * 0.003);
      const low = Math.min(open, close) * (1 - Math.random() * 0.003);
      candles.push({ time: now - i * interval, open, high, low, close, volume: Math.random() * 1000 + 100 });
      price = close;
    }
    return candles;
  }

  async getMovers(): Promise<MarketQuote[]> {
    return Object.values(this.baseQuotes).sort((a, b) => Math.abs(b.changePct24h) - Math.abs(a.changePct24h)).slice(0, 6);
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
            const delta = (Math.random() - 0.5) * q.price * 0.0008;
            q.price = Math.max(0.0001, q.price + delta);
            q.change24h = q.price - (q.price / (1 + q.changePct24h / 100));
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

// Future: class LiveMarketProvider implements MarketDataProvider { ... }
// Connects to: wss://api.core-domain.com/ws/markets
// Events: quote:update, trade:update, candle:update, market:status

const provider: MarketDataProvider = new MockMarketProvider();

export const marketDataService = {
  async getQuotes(symbols: string[]): Promise<MarketQuote[]> {
    return provider.getQuotes(symbols);
  },
  async getQuote(symbol: string): Promise<MarketQuote | null> {
    return provider.getQuote(symbol);
  },
  async getCandles(symbol: string, timeframe: string, limit?: number): Promise<Candle[]> {
    return provider.getCandles(symbol, timeframe, limit);
  },
  async getMovers(): Promise<MarketQuote[]> {
    return provider.getMovers();
  },
  subscribe(symbols: string[], onUpdate: (quote: MarketQuote) => void): () => void {
    return provider.subscribe(symbols, onUpdate);
  },
};
