// BACKEND INTEGRATION: GET /api/v1/dashboard/overview


export interface DashboardOverview {
  portfolioValue: number;
  portfolioChange24h: number;
  portfolioChangePct24h: number;
  pnl24h: number;
  pnlPct24h: number;
  availableBalance: number;
  openPositions: number;
  btcPrice: number;
  btcChangePct: number;
  totalDeposited: number;
  portfolioHistory: { date: string; value: number }[];
  recentActivity: {
    id: string;
    type: 'buy' | 'sell' | 'deposit' | 'withdrawal';
    symbol: string;
    amount: number;
    price: number;
    time: string;
    status: 'filled' | 'pending' | 'cancelled';
  }[];
}

export const dashboardService = {
  async getOverview(): Promise<DashboardOverview> {
    // BACKEND INTEGRATION: GET /api/v1/dashboard/overview
    return {
      portfolioValue: 48_234.82,
      portfolioChange24h: 1_842.30,
      portfolioChangePct24h: 3.97,
      pnl24h: 1_842.30,
      pnlPct24h: 3.97,
      availableBalance: 12_480.00,
      openPositions: 4,
      btcPrice: 67842.35,
      btcChangePct: 1.86,
      totalDeposited: 40_000.00,
      portfolioHistory: [
        { date: '2026-08-01', value: 38200 },
        { date: '2026-08-05', value: 40100 },
        { date: '2026-08-09', value: 39400 },
        { date: '2026-08-12', value: 41800 },
        { date: '2026-08-15', value: 43200 },
        { date: '2026-08-18', value: 42100 },
        { date: '2026-08-21', value: 44900 },
        { date: '2026-08-24', value: 46200 },
        { date: '2026-08-27', value: 48234 },
      ],
      recentActivity: [
        { id: 'act-001', type: 'buy', symbol: 'BTC/USDC', amount: 0.125, price: 67210.00, time: '14:32:08', status: 'filled' },
        { id: 'act-002', type: 'sell', symbol: 'ETH/USDC', amount: 2.4, price: 3562.40, time: '13:18:45', status: 'filled' },
        { id: 'act-003', type: 'buy', symbol: 'SOL/USDC', amount: 15, price: 178.90, time: '11:44:22', status: 'filled' },
        { id: 'act-004', type: 'deposit', symbol: 'USDC', amount: 5000, price: 1, time: '09:15:00', status: 'filled' },
        { id: 'act-005', type: 'buy', symbol: 'BNB/USDC', amount: 8, price: 408.20, time: '08:02:33', status: 'filled' },
        { id: 'act-006', type: 'sell', symbol: 'BTC/USDC', amount: 0.05, price: 66980.00, time: 'Aug 26', status: 'filled' },
      ],
    };
  },
};