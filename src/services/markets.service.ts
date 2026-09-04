// BACKEND INTEGRATION: GET /api/v1/markets, /api/v1/markets/:symbol/orderbook, /api/v1/markets/:symbol/trades

export interface MarketInstrument {
  id: string;
  symbol: string;
  name: string;
  baseCurrency: string;
  quoteCurrency: string;
  lastPrice: number;
  bid: number;
  ask: number;
  change24h: number;
  changePct24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap: number;
  category: 'forex' | 'indices' | 'commodities' | 'metals' | 'energy' | 'shares' | 'crypto';
  status: 'open' | 'closed' | 'pre-market' | 'after-hours';
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
  // FOREX
  { id: 'inst-eurusd', symbol: 'EUR/USD', name: 'Euro / US Dollar', baseCurrency: 'EUR', quoteCurrency: 'USD', lastPrice: 1.0842, bid: 1.0841, ask: 1.0843, change24h: 0.0031, changePct24h: 0.29, high24h: 1.0878, low24h: 1.0801, volume24h: 8200000000, marketCap: 0, category: 'forex', status: 'open', sparkline: [1.081, 1.082, 1.083, 1.084, 1.0838, 1.0840, 1.0842] },
  { id: 'inst-gbpusd', symbol: 'GBP/USD', name: 'British Pound / US Dollar', baseCurrency: 'GBP', quoteCurrency: 'USD', lastPrice: 1.2648, bid: 1.2647, ask: 1.2649, change24h: -0.0042, changePct24h: -0.33, high24h: 1.2710, low24h: 1.2620, volume24h: 5100000000, marketCap: 0, category: 'forex', status: 'open', sparkline: [1.270, 1.268, 1.267, 1.266, 1.265, 1.2648, 1.2648] },
  { id: 'inst-usdjpy', symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', baseCurrency: 'USD', quoteCurrency: 'JPY', lastPrice: 149.82, bid: 149.81, ask: 149.83, change24h: 0.48, changePct24h: 0.32, high24h: 150.20, low24h: 149.30, volume24h: 6800000000, marketCap: 0, category: 'forex', status: 'open', sparkline: [149.3, 149.4, 149.5, 149.6, 149.7, 149.8, 149.82] },
  { id: 'inst-audusd', symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', baseCurrency: 'AUD', quoteCurrency: 'USD', lastPrice: 0.6521, bid: 0.6520, ask: 0.6522, change24h: -0.0018, changePct24h: -0.28, high24h: 0.6558, low24h: 0.6498, volume24h: 2900000000, marketCap: 0, category: 'forex', status: 'open', sparkline: [0.655, 0.654, 0.653, 0.652, 0.6522, 0.6521, 0.6521] },
  { id: 'inst-usdchf', symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', baseCurrency: 'USD', quoteCurrency: 'CHF', lastPrice: 0.8942, bid: 0.8941, ask: 0.8943, change24h: 0.0012, changePct24h: 0.13, high24h: 0.8968, low24h: 0.8920, volume24h: 1800000000, marketCap: 0, category: 'forex', status: 'open', sparkline: [0.892, 0.893, 0.8935, 0.8940, 0.8941, 0.8942, 0.8942] },
  // INDICES
  { id: 'inst-sp500', symbol: 'SPX500', name: 'S&P 500', baseCurrency: 'SPX', quoteCurrency: 'USD', lastPrice: 5482.30, bid: 5481.80, ask: 5482.80, change24h: -28.40, changePct24h: -0.52, high24h: 5520.00, low24h: 5460.00, volume24h: 0, marketCap: 0, category: 'indices', status: 'closed', sparkline: [5520, 5510, 5500, 5495, 5488, 5484, 5482] },
  { id: 'inst-nas100', symbol: 'NAS100', name: 'NASDAQ 100', baseCurrency: 'NAS', quoteCurrency: 'USD', lastPrice: 19284.50, bid: 19283.00, ask: 19286.00, change24h: 142.80, changePct24h: 0.75, high24h: 19350.00, low24h: 19100.00, volume24h: 0, marketCap: 0, category: 'indices', status: 'closed', sparkline: [19100, 19150, 19200, 19240, 19260, 19280, 19284] },
  { id: 'inst-dji', symbol: 'DJI30', name: 'Dow Jones Industrial', baseCurrency: 'DJI', quoteCurrency: 'USD', lastPrice: 41284.00, bid: 41280.00, ask: 41288.00, change24h: -182.50, changePct24h: -0.44, high24h: 41520.00, low24h: 41200.00, volume24h: 0, marketCap: 0, category: 'indices', status: 'closed', sparkline: [41500, 41450, 41400, 41350, 41300, 41285, 41284] },
  { id: 'inst-dax', symbol: 'DAX40', name: 'DAX 40', baseCurrency: 'DAX', quoteCurrency: 'EUR', lastPrice: 18842.00, bid: 18840.00, ask: 18844.00, change24h: 98.20, changePct24h: 0.52, high24h: 18900.00, low24h: 18720.00, volume24h: 0, marketCap: 0, category: 'indices', status: 'open', sparkline: [18720, 18760, 18790, 18810, 18830, 18840, 18842] },
  { id: 'inst-ftse', symbol: 'FTSE100', name: 'FTSE 100', baseCurrency: 'FTSE', quoteCurrency: 'GBP', lastPrice: 8284.50, bid: 8283.00, ask: 8286.00, change24h: -42.30, changePct24h: -0.51, high24h: 8340.00, low24h: 8260.00, volume24h: 0, marketCap: 0, category: 'indices', status: 'open', sparkline: [8340, 8320, 8310, 8295, 8285, 8284, 8284] },
  // COMMODITIES
  { id: 'inst-wheat', symbol: 'WHEAT', name: 'Wheat', baseCurrency: 'WHEAT', quoteCurrency: 'USD', lastPrice: 548.25, bid: 547.75, ask: 548.75, change24h: 4.50, changePct24h: 0.83, high24h: 552.00, low24h: 542.00, volume24h: 0, marketCap: 0, category: 'commodities', status: 'open', sparkline: [542, 544, 545, 546, 547, 548, 548.25] },
  { id: 'inst-coffee', symbol: 'COFFEE', name: 'Coffee', baseCurrency: 'COFFEE', quoteCurrency: 'USD', lastPrice: 184.20, bid: 183.90, ask: 184.50, change24h: -2.80, changePct24h: -1.50, high24h: 188.00, low24h: 183.00, volume24h: 0, marketCap: 0, category: 'commodities', status: 'open', sparkline: [188, 187, 186, 185, 184.5, 184.2, 184.2] },
  { id: 'inst-sugar', symbol: 'SUGAR', name: 'Sugar', baseCurrency: 'SUGAR', quoteCurrency: 'USD', lastPrice: 19.84, bid: 19.82, ask: 19.86, change24h: 0.24, changePct24h: 1.22, high24h: 20.10, low24h: 19.55, volume24h: 0, marketCap: 0, category: 'commodities', status: 'open', sparkline: [19.55, 19.6, 19.7, 19.75, 19.8, 19.83, 19.84] },
  { id: 'inst-cotton', symbol: 'COTTON', name: 'Cotton', baseCurrency: 'COTTON', quoteCurrency: 'USD', lastPrice: 72.45, bid: 72.30, ask: 72.60, change24h: -0.85, changePct24h: -1.16, high24h: 73.80, low24h: 72.00, volume24h: 0, marketCap: 0, category: 'commodities', status: 'open', sparkline: [73.8, 73.5, 73.2, 72.9, 72.6, 72.5, 72.45] },
  { id: 'inst-corn', symbol: 'CORN', name: 'Corn', baseCurrency: 'CORN', quoteCurrency: 'USD', lastPrice: 428.50, bid: 428.00, ask: 429.00, change24h: 3.25, changePct24h: 0.76, high24h: 432.00, low24h: 424.00, volume24h: 0, marketCap: 0, category: 'commodities', status: 'open', sparkline: [424, 425, 426, 427, 428, 428.3, 428.5] },
  // METALS
  { id: 'inst-xauusd', symbol: 'XAU/USD', name: 'Gold', baseCurrency: 'XAU', quoteCurrency: 'USD', lastPrice: 2418.50, bid: 2418.00, ask: 2419.00, change24h: 12.30, changePct24h: 0.51, high24h: 2430.00, low24h: 2400.00, volume24h: 92000000000, marketCap: 0, category: 'metals', status: 'open', sparkline: [2400, 2405, 2408, 2412, 2415, 2417, 2418] },
  { id: 'inst-xagusd', symbol: 'XAG/USD', name: 'Silver', baseCurrency: 'XAG', quoteCurrency: 'USD', lastPrice: 29.84, bid: 29.82, ask: 29.86, change24h: 0.42, changePct24h: 1.43, high24h: 30.20, low24h: 29.40, volume24h: 0, marketCap: 0, category: 'metals', status: 'open', sparkline: [29.4, 29.5, 29.6, 29.7, 29.78, 29.82, 29.84] },
  { id: 'inst-xptusd', symbol: 'XPT/USD', name: 'Platinum', baseCurrency: 'XPT', quoteCurrency: 'USD', lastPrice: 984.20, bid: 983.50, ask: 984.90, change24h: -8.40, changePct24h: -0.85, high24h: 996.00, low24h: 980.00, volume24h: 0, marketCap: 0, category: 'metals', status: 'open', sparkline: [996, 993, 990, 988, 986, 984.5, 984.2] },
  { id: 'inst-xpdusd', symbol: 'XPD/USD', name: 'Palladium', baseCurrency: 'XPD', quoteCurrency: 'USD', lastPrice: 1042.80, bid: 1041.50, ask: 1044.10, change24h: 18.60, changePct24h: 1.82, high24h: 1058.00, low24h: 1020.00, volume24h: 0, marketCap: 0, category: 'metals', status: 'open', sparkline: [1020, 1025, 1030, 1035, 1040, 1042, 1042.8] },
  // ENERGY
  { id: 'inst-wti', symbol: 'WTI/USD', name: 'WTI Crude Oil', baseCurrency: 'WTI', quoteCurrency: 'USD', lastPrice: 78.42, bid: 78.38, ask: 78.46, change24h: -0.84, changePct24h: -1.06, high24h: 79.80, low24h: 77.90, volume24h: 0, marketCap: 0, category: 'energy', status: 'open', sparkline: [79.8, 79.5, 79.2, 78.9, 78.6, 78.5, 78.42] },
  { id: 'inst-brent', symbol: 'BRENT/USD', name: 'Brent Crude Oil', baseCurrency: 'BRENT', quoteCurrency: 'USD', lastPrice: 82.18, bid: 82.14, ask: 82.22, change24h: -0.92, changePct24h: -1.11, high24h: 83.50, low24h: 81.80, volume24h: 0, marketCap: 0, category: 'energy', status: 'open', sparkline: [83.5, 83.2, 82.9, 82.6, 82.3, 82.2, 82.18] },
  { id: 'inst-natgas', symbol: 'NATGAS', name: 'Natural Gas', baseCurrency: 'NATGAS', quoteCurrency: 'USD', lastPrice: 2.284, bid: 2.282, ask: 2.286, change24h: 0.048, changePct24h: 2.15, high24h: 2.320, low24h: 2.220, volume24h: 0, marketCap: 0, category: 'energy', status: 'open', sparkline: [2.22, 2.24, 2.25, 2.26, 2.27, 2.28, 2.284] },
  // SHARES
  { id: 'inst-aapl', symbol: 'AAPL', name: 'Apple Inc.', baseCurrency: 'AAPL', quoteCurrency: 'USD', lastPrice: 228.42, bid: 228.38, ask: 228.46, change24h: 3.18, changePct24h: 1.41, high24h: 229.80, low24h: 224.90, volume24h: 0, marketCap: 3480000000000, category: 'shares', status: 'closed', sparkline: [224.9, 225.5, 226.2, 227.0, 227.8, 228.2, 228.42] },
  { id: 'inst-msft', symbol: 'MSFT', name: 'Microsoft Corp.', baseCurrency: 'MSFT', quoteCurrency: 'USD', lastPrice: 442.18, bid: 442.10, ask: 442.26, change24h: -2.84, changePct24h: -0.64, high24h: 446.50, low24h: 440.20, volume24h: 0, marketCap: 3290000000000, category: 'shares', status: 'closed', sparkline: [446.5, 445.8, 445.0, 444.0, 443.0, 442.5, 442.18] },
  { id: 'inst-nvda', symbol: 'NVDA', name: 'NVIDIA Corp.', baseCurrency: 'NVDA', quoteCurrency: 'USD', lastPrice: 128.84, bid: 128.78, ask: 128.90, change24h: 4.24, changePct24h: 3.41, high24h: 130.20, low24h: 124.40, volume24h: 0, marketCap: 3160000000000, category: 'shares', status: 'closed', sparkline: [124.4, 125.2, 126.0, 127.0, 128.0, 128.5, 128.84] },
  { id: 'inst-tsla', symbol: 'TSLA', name: 'Tesla Inc.', baseCurrency: 'TSLA', quoteCurrency: 'USD', lastPrice: 248.50, bid: 248.40, ask: 248.60, change24h: -6.82, changePct24h: -2.67, high24h: 258.40, low24h: 246.80, volume24h: 0, marketCap: 792000000000, category: 'shares', status: 'closed', sparkline: [258.4, 256.0, 254.0, 252.0, 250.0, 249.0, 248.5] },
  { id: 'inst-amzn', symbol: 'AMZN', name: 'Amazon.com Inc.', baseCurrency: 'AMZN', quoteCurrency: 'USD', lastPrice: 198.42, bid: 198.36, ask: 198.48, change24h: 2.84, changePct24h: 1.45, high24h: 199.80, low24h: 195.20, volume24h: 0, marketCap: 2090000000000, category: 'shares', status: 'closed', sparkline: [195.2, 196.0, 196.8, 197.5, 198.0, 198.3, 198.42] },
  { id: 'inst-googl', symbol: 'GOOGL', name: 'Alphabet Inc.', baseCurrency: 'GOOGL', quoteCurrency: 'USD', lastPrice: 182.84, bid: 182.78, ask: 182.90, change24h: 1.42, changePct24h: 0.78, high24h: 184.20, low24h: 180.80, volume24h: 0, marketCap: 2240000000000, category: 'shares', status: 'closed', sparkline: [180.8, 181.2, 181.6, 182.0, 182.4, 182.7, 182.84] },
  // CRYPTO
  { id: 'inst-btc', symbol: 'BTC/USDT', name: 'Bitcoin', baseCurrency: 'BTC', quoteCurrency: 'USDT', lastPrice: 67842.35, bid: 67840.00, ask: 67844.70, change24h: 1243.50, changePct24h: 1.86, high24h: 68900.00, low24h: 66100.00, volume24h: 2841567000, marketCap: 1334000000000, category: 'crypto', status: 'open', sparkline: [64200, 65100, 64800, 66200, 67100, 66800, 67842] },
  { id: 'inst-eth', symbol: 'ETH/USDT', name: 'Ethereum', baseCurrency: 'ETH', quoteCurrency: 'USDT', lastPrice: 3542.80, bid: 3542.20, ask: 3543.40, change24h: -87.20, changePct24h: -2.40, high24h: 3680.00, low24h: 3490.00, volume24h: 1240000000, marketCap: 425000000000, category: 'crypto', status: 'open', sparkline: [3700, 3650, 3620, 3580, 3550, 3560, 3542] },
  { id: 'inst-sol', symbol: 'SOL/USDT', name: 'Solana', baseCurrency: 'SOL', quoteCurrency: 'USDT', lastPrice: 182.45, bid: 182.38, ask: 182.52, change24h: 8.30, changePct24h: 4.77, high24h: 186.00, low24h: 172.00, volume24h: 890000000, marketCap: 86000000000, category: 'crypto', status: 'open', sparkline: [168, 172, 175, 178, 180, 181, 182] },
  { id: 'inst-xrp', symbol: 'XRP/USDT', name: 'XRP', baseCurrency: 'XRP', quoteCurrency: 'USDT', lastPrice: 0.6284, bid: 0.6283, ask: 0.6285, change24h: -0.0142, changePct24h: -2.21, high24h: 0.6520, low24h: 0.6180, volume24h: 450000000, marketCap: 35000000000, category: 'crypto', status: 'open', sparkline: [0.65, 0.648, 0.642, 0.635, 0.630, 0.628, 0.628] },
  { id: 'inst-bnb', symbol: 'BNB/USDT', name: 'BNB', baseCurrency: 'BNB', quoteCurrency: 'USDT', lastPrice: 412.60, bid: 412.50, ask: 412.70, change24h: 5.80, changePct24h: 1.43, high24h: 418.00, low24h: 404.00, volume24h: 320000000, marketCap: 61000000000, category: 'crypto', status: 'open', sparkline: [405, 407, 409, 410, 411, 412, 412] },
  { id: 'inst-doge', symbol: 'DOGE/USDT', name: 'Dogecoin', baseCurrency: 'DOGE', quoteCurrency: 'USDT', lastPrice: 0.1624, bid: 0.1623, ask: 0.1625, change24h: 0.0068, changePct24h: 4.32, high24h: 0.1680, low24h: 0.1540, volume24h: 980000000, marketCap: 23000000000, category: 'crypto', status: 'open', sparkline: [0.154, 0.156, 0.158, 0.160, 0.161, 0.162, 0.162] },
  { id: 'inst-ada', symbol: 'ADA/USDT', name: 'Cardano', baseCurrency: 'ADA', quoteCurrency: 'USDT', lastPrice: 0.4820, bid: 0.4819, ask: 0.4821, change24h: 0.0050, changePct24h: 1.05, high24h: 0.4920, low24h: 0.4680, volume24h: 380000000, marketCap: 17000000000, category: 'crypto', status: 'open', sparkline: [0.468, 0.472, 0.476, 0.479, 0.481, 0.482, 0.482] },
  { id: 'inst-avax', symbol: 'AVAX/USDT', name: 'Avalanche', baseCurrency: 'AVAX', quoteCurrency: 'USDT', lastPrice: 38.42, bid: 38.40, ask: 38.44, change24h: -0.30, changePct24h: -0.78, high24h: 39.80, low24h: 37.60, volume24h: 210000000, marketCap: 15700000000, category: 'crypto', status: 'open', sparkline: [39.8, 39.4, 39.0, 38.8, 38.6, 38.5, 38.42] },
  { id: 'inst-dot', symbol: 'DOT/USDT', name: 'Polkadot', baseCurrency: 'DOT', quoteCurrency: 'USDT', lastPrice: 7.824, bid: 7.820, ask: 7.828, change24h: 0.026, changePct24h: 0.34, high24h: 8.10, low24h: 7.60, volume24h: 145000000, marketCap: 11200000000, category: 'crypto', status: 'open', sparkline: [7.6, 7.65, 7.70, 7.75, 7.79, 7.82, 7.824] },
  { id: 'inst-link', symbol: 'LINK/USDT', name: 'Chainlink', baseCurrency: 'LINK', quoteCurrency: 'USDT', lastPrice: 18.24, bid: 18.22, ask: 18.26, change24h: 0.44, changePct24h: 2.45, high24h: 18.80, low24h: 17.60, volume24h: 320000000, marketCap: 10800000000, category: 'crypto', status: 'open', sparkline: [17.6, 17.8, 18.0, 18.1, 18.2, 18.22, 18.24] },
  { id: 'inst-atom', symbol: 'ATOM/USDT', name: 'Cosmos', baseCurrency: 'ATOM', quoteCurrency: 'USDT', lastPrice: 9.142, bid: 9.138, ask: 9.146, change24h: 0.172, changePct24h: 1.92, high24h: 9.40, low24h: 8.80, volume24h: 98000000, marketCap: 3500000000, category: 'crypto', status: 'open', sparkline: [8.8, 8.9, 9.0, 9.05, 9.10, 9.13, 9.142] },
  { id: 'inst-uni', symbol: 'UNI/USDT', name: 'Uniswap', baseCurrency: 'UNI', quoteCurrency: 'USDT', lastPrice: 12.42, bid: 12.40, ask: 12.44, change24h: -0.15, changePct24h: -1.20, high24h: 12.90, low24h: 12.10, volume24h: 87000000, marketCap: 7400000000, category: 'crypto', status: 'open', sparkline: [12.9, 12.7, 12.6, 12.5, 12.45, 12.42, 12.42] },
  { id: 'inst-aave', symbol: 'AAVE/USDT', name: 'Aave', baseCurrency: 'AAVE', quoteCurrency: 'USDT', lastPrice: 184.20, bid: 184.10, ask: 184.30, change24h: 1.60, changePct24h: 0.87, high24h: 188.00, low24h: 180.00, volume24h: 62000000, marketCap: 2700000000, category: 'crypto', status: 'open', sparkline: [180, 181, 182, 183, 183.5, 184, 184.2] },
  { id: 'inst-shib', symbol: 'SHIB/USDT', name: 'Shiba Inu', baseCurrency: 'SHIB', quoteCurrency: 'USDT', lastPrice: 0.00002482, bid: 0.00002480, ask: 0.00002484, change24h: 0.00000144, changePct24h: 6.14, high24h: 0.00002600, low24h: 0.00002280, volume24h: 420000000, marketCap: 14600000000, category: 'crypto', status: 'open', sparkline: [0.0000228, 0.0000235, 0.0000240, 0.0000245, 0.0000248, 0.0000248, 0.0000248] },
  { id: 'inst-pepe', symbol: 'PEPE/USDT', name: 'Pepe', baseCurrency: 'PEPE', quoteCurrency: 'USDT', lastPrice: 0.00001424, bid: 0.00001422, ask: 0.00001426, change24h: -0.00000042, changePct24h: -2.87, high24h: 0.00001520, low24h: 0.00001380, volume24h: 280000000, marketCap: 5900000000, category: 'crypto', status: 'open', sparkline: [0.0000152, 0.0000148, 0.0000145, 0.0000143, 0.0000142, 0.0000142, 0.0000142] },
  { id: 'inst-floki', symbol: 'FLOKI/USDT', name: 'Floki', baseCurrency: 'FLOKI', quoteCurrency: 'USDT', lastPrice: 0.0001982, bid: 0.0001980, ask: 0.0001984, change24h: 0.0000151, changePct24h: 8.21, high24h: 0.0002100, low24h: 0.0001820, volume24h: 190000000, marketCap: 1900000000, category: 'crypto', status: 'open', sparkline: [0.000182, 0.000186, 0.000190, 0.000194, 0.000197, 0.000198, 0.0001982] },
  { id: 'inst-crv', symbol: 'CRV/USDT', name: 'Curve DAO', baseCurrency: 'CRV', quoteCurrency: 'USDT', lastPrice: 0.5224, bid: 0.5220, ask: 0.5228, change24h: -0.0166, changePct24h: -3.10, high24h: 0.5500, low24h: 0.5100, volume24h: 45000000, marketCap: 680000000, category: 'crypto', status: 'open', sparkline: [0.55, 0.545, 0.540, 0.535, 0.528, 0.523, 0.5224] },
];

export const marketsService = {
  async getInstruments(): Promise<MarketInstrument[]> {
    // BACKEND INTEGRATION: GET /api/v1/markets
    return MOCK_INSTRUMENTS;
  },

  async getOrderBook(symbol: string): Promise<OrderBook> {
    // BACKEND INTEGRATION: GET /api/v1/markets/:symbol/orderbook
    const basePrice = symbol.startsWith('BTC') ? 67842.35 : 3542.80;
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