// BACKEND INTEGRATION: GET /api/v1/markets, /api/v1/markets/:symbol/orderbook, /api/v1/markets/:symbol/trades


export interface MarketInstrument {
  id: string;
  symbol: string;
  baseCurrency: string;
  quoteCurrency: string;
  lastPrice: number;
  change24h: number;
  changePct24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap: number;
  category: 'crypto' | 'forex' | 'indices' | 'commodities';
  sparkline: number[];
}

export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

export interface OrderBook {
  asks: OrderBookEntry[];
  bids: OrderBookEntry[];
  spread: number;
  spreadPct: number;
}

export interface RecentTrade {
  id: string;
  price: number;
  amount: number;
  side: 'buy' | 'sell';
  timestamp: string;
}

const MOCK_INSTRUMENTS: MarketInstrument[] = [
  { id: 'inst-btc', symbol: 'BTC/USDC', baseCurrency: 'BTC', quoteCurrency: 'USDC', lastPrice: 67842.35, change24h: 1243.50, changePct24h: 1.86, high24h: 68900.00, low24h: 66100.00, volume24h: 2841567000, marketCap: 1334000000000, category: 'crypto', sparkline: [64200, 65100, 64800, 66200, 67100, 66800, 67842] },
  { id: 'inst-eth', symbol: 'ETH/USDC', baseCurrency: 'ETH', quoteCurrency: 'USDC', lastPrice: 3542.80, change24h: -87.20, changePct24h: -2.40, high24h: 3680.00, low24h: 3490.00, volume24h: 1240000000, marketCap: 425000000000, category: 'crypto', sparkline: [3700, 3650, 3620, 3580, 3550, 3560, 3542] },
  { id: 'inst-sol', symbol: 'SOL/USDC', baseCurrency: 'SOL', quoteCurrency: 'USDC', lastPrice: 182.45, change24h: 8.30, changePct24h: 4.77, high24h: 186.00, low24h: 172.00, volume24h: 890000000, marketCap: 86000000000, category: 'crypto', sparkline: [168, 172, 175, 178, 180, 181, 182] },
  { id: 'inst-xrp', symbol: 'XRP/USDC', baseCurrency: 'XRP', quoteCurrency: 'USDC', lastPrice: 0.6284, change24h: -0.0142, changePct24h: -2.21, high24h: 0.6520, low24h: 0.6180, volume24h: 450000000, marketCap: 35000000000, category: 'crypto', sparkline: [0.65, 0.648, 0.642, 0.635, 0.630, 0.628, 0.628] },
  { id: 'inst-bnb', symbol: 'BNB/USDC', baseCurrency: 'BNB', quoteCurrency: 'USDC', lastPrice: 412.60, change24h: 5.80, changePct24h: 1.43, high24h: 418.00, low24h: 404.00, volume24h: 320000000, marketCap: 61000000000, category: 'crypto', sparkline: [405, 407, 409, 410, 411, 412, 412] },
  { id: 'inst-ada', symbol: 'ADA/USDC', baseCurrency: 'ADA', quoteCurrency: 'USDC', lastPrice: 0.4821, change24h: 0.0183, changePct24h: 3.95, high24h: 0.4940, low24h: 0.4600, volume24h: 185000000, marketCap: 17000000000, category: 'crypto', sparkline: [0.46, 0.465, 0.470, 0.475, 0.479, 0.481, 0.482] },
  { id: 'inst-avax', symbol: 'AVAX/USDC', baseCurrency: 'AVAX', quoteCurrency: 'USDC', lastPrice: 38.72, change24h: -1.28, changePct24h: -3.20, high24h: 40.80, low24h: 37.90, volume24h: 142000000, marketCap: 16000000000, category: 'crypto', sparkline: [41, 40.5, 40, 39.5, 39, 38.9, 38.7] },
  { id: 'inst-dot', symbol: 'DOT/USDC', baseCurrency: 'DOT', quoteCurrency: 'USDC', lastPrice: 7.84, change24h: 0.22, changePct24h: 2.89, high24h: 8.10, low24h: 7.60, volume24h: 98000000, marketCap: 11000000000, category: 'crypto', sparkline: [7.6, 7.65, 7.70, 7.75, 7.80, 7.82, 7.84] },
  { id: 'inst-eurusd', symbol: 'EUR/USD', baseCurrency: 'EUR', quoteCurrency: 'USD', lastPrice: 1.0842, change24h: 0.0031, changePct24h: 0.29, high24h: 1.0878, low24h: 1.0801, volume24h: 8200000000, marketCap: 0, category: 'forex', sparkline: [1.081, 1.082, 1.083, 1.084, 1.0838, 1.0840, 1.0842] },
  { id: 'inst-gbpusd', symbol: 'GBP/USD', baseCurrency: 'GBP', quoteCurrency: 'USD', lastPrice: 1.2648, change24h: -0.0042, changePct24h: -0.33, high24h: 1.2710, low24h: 1.2620, volume24h: 5100000000, marketCap: 0, category: 'forex', sparkline: [1.270, 1.268, 1.267, 1.266, 1.265, 1.2648, 1.2648] },
  { id: 'inst-xauusd', symbol: 'XAU/USD', baseCurrency: 'XAU', quoteCurrency: 'USD', lastPrice: 2418.50, change24h: 12.30, changePct24h: 0.51, high24h: 2430.00, low24h: 2400.00, volume24h: 92000000000, marketCap: 0, category: 'commodities', sparkline: [2400, 2405, 2408, 2412, 2415, 2417, 2418] },
  { id: 'inst-sp500', symbol: 'SPX500', baseCurrency: 'SPX', quoteCurrency: 'USD', lastPrice: 5482.30, change24h: -28.40, changePct24h: -0.52, high24h: 5520.00, low24h: 5460.00, volume24h: 0, marketCap: 0, category: 'indices', sparkline: [5520, 5510, 5500, 5495, 5488, 5484, 5482] },
];

export const marketsService = {
  async getInstruments(): Promise<MarketInstrument[]> {
    // BACKEND INTEGRATION: GET /api/v1/markets
    return MOCK_INSTRUMENTS;
  },

  async getOrderBook(symbol: string): Promise<OrderBook> {
    // BACKEND INTEGRATION: GET /api/v1/markets/:symbol/orderbook
    const basePrice = symbol === 'BTC/USDC' ? 67842.35 : 3542.80;
    const asks: OrderBookEntry[] = Array.from({ length: 12 }, (_, i) => {
      const price = basePrice + (i + 1) * 1.2;
      const amount = parseFloat((Math.random() * 2 + 0.05).toFixed(4));
      return { price, amount, total: parseFloat((price * amount).toFixed(2)) };
    });
    const bids: OrderBookEntry[] = Array.from({ length: 12 }, (_, i) => {
      const price = basePrice - (i + 1) * 1.2;
      const amount = parseFloat((Math.random() * 2 + 0.05).toFixed(4));
      return { price, amount, total: parseFloat((price * amount).toFixed(2)) };
    });
    return { asks, bids, spread: 1.20, spreadPct: 0.0018 };
  },

  async getRecentTrades(symbol: string): Promise<RecentTrade[]> {
    // BACKEND INTEGRATION: GET /api/v1/markets/:symbol/trades
    const basePrice = 67842.35;
    return Array.from({ length: 20 }, (_, i) => ({
      id: `trade-${i + 1}`,
      price: basePrice + (Math.random() - 0.5) * 40,
      amount: parseFloat((Math.random() * 1.5 + 0.001).toFixed(4)),
      side: Math.random() > 0.5 ? 'buy' : 'sell',
      timestamp: new Date(Date.now() - i * 8000).toISOString(),
    }));
  },
};