// BACKEND INTEGRATION:
// GET  /api/v1/prediction-markets
// GET  /api/v1/prediction-markets/:id
// POST /api/v1/prediction-markets/:id/positions
// GET  /api/v1/prediction-markets/positions
// GET  /api/v1/prediction-markets/history

export type PredictionCategory = 'trending' | 'finance' | 'crypto' | 'economy' | 'technology' | 'sports' | 'world';
export type MarketStatus = 'open' | 'closed' | 'resolved' | 'pending';
export type PositionSide = 'YES' | 'NO';

export interface PredictionMarket {
  id: string;
  title: string;
  description: string;
  category: PredictionCategory;
  imageUrl: string;
  imageAlt: string;
  yesProbability: number;
  noProbability: number;
  volume: number;
  endsAt: string;
  status: MarketStatus;
  resolutionCriteria: string;
  yesPrice: number;
  noPrice: number;
  totalPositions: number;
  recentActivity: {user: string;side: PositionSide;amount: number;time: string;}[];
}

export interface UserPosition {
  marketId: string;
  side: PositionSide;
  amount: number;
  shares: number;
  avgPrice: number;
  createdAt: string;
}

const MOCK_MARKETS: PredictionMarket[] = [
{
  id: 'pm-001',
  title: 'Will Bitcoin exceed $100,000 by end of Q4 2026?',
  description: 'This market resolves YES if Bitcoin (BTC) closes above $100,000 USD on any major exchange on or before December 31, 2026.',
  category: 'crypto',
  imageUrl: "https://images.unsplash.com/photo-1628498643518-0552fa82b979",
  imageAlt: 'Bitcoin gold coin on dark background representing cryptocurrency market prediction',
  yesProbability: 68,
  noProbability: 32,
  volume: 2840000,
  endsAt: '2026-12-31T23:59:00Z',
  status: 'open',
  resolutionCriteria: 'Resolves YES if BTC/USD closing price exceeds $100,000 on Coinbase, Binance, or Kraken on or before December 31, 2026 23:59 UTC.',
  yesPrice: 0.68,
  noPrice: 0.32,
  totalPositions: 4821,
  recentActivity: [
  { user: 'Trader_0x4f', side: 'YES', amount: 500, time: '2 min ago' },
  { user: 'Anon_7k2', side: 'NO', amount: 200, time: '5 min ago' },
  { user: 'CryptoHedge', side: 'YES', amount: 1200, time: '12 min ago' }]

},
{
  id: 'pm-002',
  title: 'Will the US Federal Reserve cut rates in September 2026?',
  description: 'Resolves YES if the FOMC announces a rate cut of 25bps or more at the September 2026 meeting.',
  category: 'finance',
  imageUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_1130f62cf-1772310232175.png",
  imageAlt: 'Federal Reserve building exterior representing US monetary policy decision',
  yesProbability: 54,
  noProbability: 46,
  volume: 1920000,
  endsAt: '2026-09-20T18:00:00Z',
  status: 'open',
  resolutionCriteria: 'Resolves YES if the FOMC statement released at the September 2026 meeting announces a reduction in the federal funds rate target range.',
  yesPrice: 0.54,
  noPrice: 0.46,
  totalPositions: 3204,
  recentActivity: [
  { user: 'MacroTrader', side: 'YES', amount: 800, time: '8 min ago' },
  { user: 'RateWatcher', side: 'NO', amount: 350, time: '15 min ago' }]

},
{
  id: 'pm-003',
  title: 'Will Ethereum complete its next major upgrade in 2026?',
  description: 'Resolves YES if Ethereum mainnet deploys a major protocol upgrade (EIP bundle) before December 31, 2026.',
  category: 'crypto',
  imageUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_1730bb67c-1788295994703.png",
  imageAlt: 'Ethereum logo glowing blue representing blockchain protocol upgrade prediction',
  yesProbability: 82,
  noProbability: 18,
  volume: 980000,
  endsAt: '2026-12-31T23:59:00Z',
  status: 'open',
  resolutionCriteria: 'Resolves YES if Ethereum mainnet activates a hard fork or major upgrade as announced by the Ethereum Foundation before December 31, 2026.',
  yesPrice: 0.82,
  noPrice: 0.18,
  totalPositions: 1842,
  recentActivity: [
  { user: 'ETH_Dev_Fan', side: 'YES', amount: 300, time: '20 min ago' }]

},
{
  id: 'pm-004',
  title: 'Will global inflation (CPI) fall below 3% by end of 2026?',
  description: 'Resolves YES if the IMF reports global average CPI inflation below 3% for calendar year 2026.',
  category: 'economy',
  imageUrl: "https://images.unsplash.com/photo-1629695004567-22f2ff9609e7",
  imageAlt: 'Rising price chart and coins representing global inflation economic prediction',
  yesProbability: 41,
  noProbability: 59,
  volume: 1480000,
  endsAt: '2027-01-31T23:59:00Z',
  status: 'open',
  resolutionCriteria: 'Resolves YES if the IMF World Economic Outlook (January 2027 update) reports global CPI inflation below 3% for 2026.',
  yesPrice: 0.41,
  noPrice: 0.59,
  totalPositions: 2640,
  recentActivity: [
  { user: 'EconWatch', side: 'NO', amount: 600, time: '1 hr ago' },
  { user: 'Macro_Bull', side: 'YES', amount: 250, time: '2 hrs ago' }]

},
{
  id: 'pm-005',
  title: 'Will a major AI company release AGI by end of 2027?',
  description: 'Resolves YES if any major AI lab publicly claims and demonstrates AGI-level capability by December 31, 2027.',
  category: 'technology',
  imageUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_128fd8bea-1769057432011.png",
  imageAlt: 'Artificial intelligence neural network visualization representing AGI technology prediction',
  yesProbability: 23,
  noProbability: 77,
  volume: 3200000,
  endsAt: '2027-12-31T23:59:00Z',
  status: 'open',
  resolutionCriteria: 'Resolves YES if a recognized AI research organization publicly demonstrates and claims AGI-level performance on a standardized benchmark suite before December 31, 2027.',
  yesPrice: 0.23,
  noPrice: 0.77,
  totalPositions: 5820,
  recentActivity: [
  { user: 'TechSkeptic', side: 'NO', amount: 1000, time: '30 min ago' },
  { user: 'AIOptimist', side: 'YES', amount: 400, time: '45 min ago' }]

},
{
  id: 'pm-006',
  title: 'Will S&P 500 reach 6,500 before end of 2026?',
  description: 'Resolves YES if the S&P 500 index closes at or above 6,500 on any trading day before December 31, 2026.',
  category: 'finance',
  imageUrl: "https://img.rocket.new/generatedImages/rocket_gen_img_1f1e8871f-1772729899117.png",
  imageAlt: 'Stock market trading floor with screens showing S&P 500 index performance',
  yesProbability: 61,
  noProbability: 39,
  volume: 2100000,
  endsAt: '2026-12-31T23:59:00Z',
  status: 'open',
  resolutionCriteria: 'Resolves YES if the S&P 500 index (SPX) closing price is at or above 6,500 on any NYSE trading day on or before December 31, 2026.',
  yesPrice: 0.61,
  noPrice: 0.39,
  totalPositions: 3980,
  recentActivity: [
  { user: 'EquityBull', side: 'YES', amount: 750, time: '10 min ago' },
  { user: 'BearCase_99', side: 'NO', amount: 500, time: '25 min ago' }]

}];


export const predictionMarketsService = {
  /**
   * Get all prediction markets.
   * BACKEND: GET /api/v1/prediction-markets
   */
  async getMarkets(category?: PredictionCategory): Promise<PredictionMarket[]> {
    if (category) return MOCK_MARKETS.filter((m) => m.category === category);
    return MOCK_MARKETS;
  },

  /**
   * Get a single prediction market by ID.
   * BACKEND: GET /api/v1/prediction-markets/:id
   */
  async getMarket(id: string): Promise<PredictionMarket | null> {
    return MOCK_MARKETS.find((m) => m.id === id) || null;
  },

  /**
   * Submit a position (YES or NO).
   * BACKEND: POST /api/v1/prediction-markets/:id/positions
   * NOTE: Actual balance debit, locking, settlement and winnings MUST be server-authoritative.
   * This frontend call is for UI flow only — no real balance changes occur here.
   */
  async submitPosition(_marketId: string, _side: PositionSide, _amount: number): Promise<{success: boolean;shares: number;}> {
    await new Promise((r) => setTimeout(r, 800));
    return { success: true, shares: _amount };
  },

  /**
   * Get user's open positions.
   * BACKEND: GET /api/v1/prediction-markets/positions
   */
  async getPositions(): Promise<UserPosition[]> {
    return [];
  },

  /**
   * Get user's position history.
   * BACKEND: GET /api/v1/prediction-markets/history
   */
  async getHistory(): Promise<UserPosition[]> {
    return [];
  }
};