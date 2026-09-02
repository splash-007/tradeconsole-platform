// TRADING BOT SERVICE
// Frontend abstraction for customer trading bot management.
//
// IMPORTANT DESIGN PRINCIPLES:
// - Browsing/selecting/configuring a bot MUST NOT automatically persist a bot record.
// - Bot builder state is LOCAL TEMPORARY form state only (botBuilderState).
// - A bot is ONLY persisted when the customer performs an explicit Deploy/Activate action.
// - Frontend must NOT display bots as active until backend confirms deployment.
// - Bot status transitions are controlled by the backend — not the frontend.
// - If the customer has never deployed a bot, show: "No trading bots have been deployed yet."
//
// Bot Lifecycle (backend-controlled):
//   draft → pending_activation → active → paused → stopping → stopped → completed | failed
//
// Future API:
//   POST /api/v1/bots/analyze
//   POST /api/v1/bots              (Deploy Bot — creates persistent record)
//   GET  /api/v1/bots
//   GET  /api/v1/bots/:id
//   POST /api/v1/bots/:id/start
//   POST /api/v1/bots/:id/pause
//   POST /api/v1/bots/:id/stop

export type MarketType = 'SPOT' | 'PERPETUAL_FUTURES' | 'OPTIONS';

/**
 * Full bot lifecycle — backend controls all transitions.
 * Frontend must NOT change status without backend confirmation.
 */
export type BotLifecycleStatus =
  | 'draft' |'pending_activation' |'active' |'paused' |'stopping' |'stopped' |'completed' |'failed';

/** Legacy alias — kept for backward compatibility */
export type BotStatus = BotLifecycleStatus;

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
  status: BotLifecycleStatus;
  createdAt: string;
  startedAt: string | null;
  stoppedAt: string | null;
  pnl: number;
  pnlPct: number;
  risk: 'low' | 'medium' | 'high';
  config: BotConfig;
  // Legacy aliases
  created?: string;
  started?: string | null;
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

export interface DeployBotResult {
  id: string;
  status: BotLifecycleStatus;
}

export const tradingBotService = {
  /**
   * Analyze market and get strategy recommendation.
   * This is a READ-ONLY analysis — it does NOT create any bot record.
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
   * Deploy a new bot — creates a PERSISTENT bot record on the backend.
   *
   * IMPORTANT: This is the ONLY action that creates a persistent bot record.
   * Browsing, selecting market type, selecting pair, running analysis,
   * and configuring parameters do NOT create any bot record.
   *
   * Only call this after the customer explicitly confirms deployment.
   *
   * On success:
   *   - Add bot to Active Bots list
   *   - Create BOT_CREATED / BOT_ACTIVATED notification
   *
   * On failure:
   *   - Do NOT display the bot as active
   *   - Show meaningful error to customer
   *
   * BACKEND: POST /api/v1/bots  body: BotConfig
   */
  async deployBot(_config: BotConfig): Promise<DeployBotResult> {
    // BACKEND INTEGRATION REQUIRED
    // Replace with:
    // const res = await apiClient.post('/api/v1/bots', _config);
    // return { id: res.data.id, status: res.data.status };
    await new Promise(r => setTimeout(r, 1000));
    return { id: `bot-${Date.now()}`, status: 'pending_activation' };
  },

  /**
   * Get all bots for the current authenticated customer.
   * Returns empty array when customer has never deployed a bot.
   * BACKEND: GET /api/v1/bots
   *
   * Frontend must NOT substitute fake bot records.
   * Empty state: "No trading bots have been deployed yet."
   */
  async getBots(): Promise<Bot[]> {
    // BACKEND INTEGRATION REQUIRED
    // Replace with:
    // const res = await apiClient.get('/api/v1/bots');
    // return res.data.bots;
    return [];
  },

  /**
   * Start/resume a bot.
   * Backend controls whether this transition is valid.
   * BACKEND: POST /api/v1/bots/:id/start
   */
  async startBot(id: string): Promise<void> {
    // BACKEND INTEGRATION REQUIRED
    void id;
    await new Promise(r => setTimeout(r, 500));
  },

  /**
   * Pause a bot.
   * Backend controls whether this transition is valid.
   * BACKEND: POST /api/v1/bots/:id/pause
   */
  async pauseBot(id: string): Promise<void> {
    // BACKEND INTEGRATION REQUIRED
    void id;
    await new Promise(r => setTimeout(r, 500));
  },

  /**
   * Stop a bot.
   * Backend controls whether this transition is valid.
   * BACKEND: POST /api/v1/bots/:id/stop
   */
  async stopBot(id: string): Promise<void> {
    // BACKEND INTEGRATION REQUIRED
    void id;
    await new Promise(r => setTimeout(r, 500));
  },
};
