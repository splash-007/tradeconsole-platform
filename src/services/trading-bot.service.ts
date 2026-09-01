// BACKEND INTEGRATION:
// POST /api/v1/bots/analyze
// POST /api/v1/bots
// GET  /api/v1/bots
// GET  /api/v1/bots/:id
// POST /api/v1/bots/:id/start
// POST /api/v1/bots/:id/pause
// POST /api/v1/bots/:id/stop

export type MarketType = 'SPOT' | 'PERPETUAL_FUTURES' | 'OPTIONS';
export type BotStatus = 'active' | 'paused' | 'completed' | 'error';
export type BotStrategy = 'GRID' | 'DCA' | 'MOMENTUM' | 'TECHNICAL' | 'ARBITRAGE';

export interface BotConfig {
  market_type: MarketType;
  symbol: string;
  bot_type: BotStrategy;
  parameters: {
    leverage?: number;
    lower_bound?: number;
    upper_bound?: number;
    grid_count?: number;
    investment_amount_usdt?: number;
    stop_loss_percentage?: number;
    take_profit_percentage?: number;
    dca_interval?: string;
    dca_amount?: number;
  };
}

export interface Bot {
  id: string;
  name: string;
  market: MarketType;
  symbol: string;
  strategy: BotStrategy;
  allocation: number;
  status: BotStatus;
  created: string;
  started: string | null;
  pnl: number;
  pnlPct: number;
  risk: 'low' | 'medium' | 'high';
  config: BotConfig;
}

export interface AnalysisResult {
  symbol: string;
  trend: 'bullish' | 'bearish' | 'sideways';
  volatility: 'low' | 'medium' | 'high';
  support: number;
  resistance: number;
  atr: number;
  fundingRate?: number;
  recommendedStrategy: BotStrategy;
  recommendedMarketType: MarketType;
  rationale: string;
  riskLevel: 'low' | 'medium' | 'high';
  suggestedConfig: BotConfig;
  dataSources: string[];
}

const MOCK_BOTS: Bot[] = [
  {
    id: 'bot-001',
    name: 'BTC Grid Alpha',
    market: 'PERPETUAL_FUTURES',
    symbol: 'BTC/USDT',
    strategy: 'GRID',
    allocation: 2500,
    status: 'active',
    created: '2026-08-15T10:00:00Z',
    started: '2026-08-15T10:05:00Z',
    pnl: 142.80,
    pnlPct: 5.71,
    risk: 'medium',
    config: {
      market_type: 'PERPETUAL_FUTURES',
      symbol: 'BTCUSDT',
      bot_type: 'GRID',
      parameters: { leverage: 5, lower_bound: 62000, upper_bound: 72000, grid_count: 50, investment_amount_usdt: 2500, stop_loss_percentage: 3.5 },
    },
  },
  {
    id: 'bot-002',
    name: 'ETH DCA Accumulator',
    market: 'SPOT',
    symbol: 'ETH/USDT',
    strategy: 'DCA',
    allocation: 1000,
    status: 'active',
    created: '2026-08-20T14:00:00Z',
    started: '2026-08-20T14:02:00Z',
    pnl: 38.40,
    pnlPct: 3.84,
    risk: 'low',
    config: {
      market_type: 'SPOT',
      symbol: 'ETHUSDT',
      bot_type: 'DCA',
      parameters: { investment_amount_usdt: 1000, dca_interval: '4h', dca_amount: 50 },
    },
  },
  {
    id: 'bot-003',
    name: 'SOL Momentum',
    market: 'PERPETUAL_FUTURES',
    symbol: 'SOL/USDT',
    strategy: 'MOMENTUM',
    allocation: 800,
    status: 'paused',
    created: '2026-08-10T08:00:00Z',
    started: '2026-08-10T08:10:00Z',
    pnl: -22.40,
    pnlPct: -2.80,
    risk: 'high',
    config: {
      market_type: 'PERPETUAL_FUTURES',
      symbol: 'SOLUSDT',
      bot_type: 'MOMENTUM',
      parameters: { leverage: 3, investment_amount_usdt: 800, stop_loss_percentage: 5 },
    },
  },
];

export const tradingBotService = {
  /**
   * Analyze market and get strategy recommendation.
   * BACKEND: POST /api/v1/bots/analyze  body: { symbol, market_type }
   */
  async analyzeMarket(symbol: string, marketType: MarketType): Promise<AnalysisResult> {
    // Mock analysis — replace with real API call
    await new Promise(r => setTimeout(r, 2000));
    const isFutures = marketType === 'PERPETUAL_FUTURES';
    return {
      symbol,
      trend: 'sideways',
      volatility: 'medium',
      support: 64200,
      resistance: 70800,
      atr: 1842,
      fundingRate: isFutures ? 0.0082 : undefined,
      recommendedStrategy: 'GRID',
      recommendedMarketType: marketType,
      rationale: 'Price action shows range-bound consolidation between key support/resistance levels. Order book depth indicates balanced liquidity. ATR suggests moderate volatility suitable for grid strategy.',
      riskLevel: 'medium',
      dataSources: ['OHLCV — 4H / 1H', 'Order Book Depth', 'ATR / Volatility', ...(isFutures ? ['Funding Rate'] : [])],
      suggestedConfig: {
        market_type: marketType,
        symbol: symbol.replace('/', ''),
        bot_type: 'GRID',
        parameters: {
          leverage: isFutures ? 5 : undefined,
          lower_bound: 64200,
          upper_bound: 70800,
          grid_count: 50,
          investment_amount_usdt: 1000,
          stop_loss_percentage: 3.5,
        },
      },
    };
  },

  /**
   * Deploy a new bot.
   * BACKEND: POST /api/v1/bots  body: BotConfig
   */
  async deployBot(_config: BotConfig): Promise<{ id: string; status: string }> {
    // FRONTEND ONLY — no real deployment
    await new Promise(r => setTimeout(r, 1000));
    return { id: `bot-${Date.now()}`, status: 'active' };
  },

  /**
   * Get all bots.
   * BACKEND: GET /api/v1/bots
   */
  async getBots(): Promise<Bot[]> {
    return MOCK_BOTS;
  },

  /**
   * Start a bot.
   * BACKEND: POST /api/v1/bots/:id/start
   */
  async startBot(_id: string): Promise<void> {
    await new Promise(r => setTimeout(r, 500));
  },

  /**
   * Pause a bot.
   * BACKEND: POST /api/v1/bots/:id/pause
   */
  async pauseBot(_id: string): Promise<void> {
    await new Promise(r => setTimeout(r, 500));
  },

  /**
   * Stop a bot.
   * BACKEND: POST /api/v1/bots/:id/stop
   */
  async stopBot(_id: string): Promise<void> {
    await new Promise(r => setTimeout(r, 500));
  },
};
