// BACKEND INTEGRATION: GET /api/v1/portfolio/positions, /api/v1/portfolio/history


export interface Position {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  currentPrice: number;
  size: number;
  value: number;
  pnl: number;
  pnlPct: number;
  openedAt: string;
}

export interface PortfolioAllocation {
  symbol: string;
  value: number;
  pct: number;
  color: string;
}

export const portfolioService = {
  async getPositions(): Promise<Position[]> {
    // BACKEND INTEGRATION: GET /api/v1/portfolio/positions
    return [
      { id: 'pos-001', symbol: 'BTC/USDC', side: 'long', entryPrice: 63200.00, currentPrice: 67842.35, size: 0.35, value: 23744.82, pnl: 1624.82, pnlPct: 7.34, openedAt: '2026-08-15T08:22:00Z' },
      { id: 'pos-002', symbol: 'ETH/USDC', side: 'long', entryPrice: 3680.00, currentPrice: 3542.80, size: 2.4, value: 8502.72, pnl: -329.28, pnlPct: -3.73, openedAt: '2026-08-20T14:10:00Z' },
      { id: 'pos-003', symbol: 'SOL/USDC', side: 'long', entryPrice: 168.50, currentPrice: 182.45, size: 15, value: 2736.75, pnl: 209.25, pnlPct: 8.28, openedAt: '2026-08-22T11:45:00Z' },
      { id: 'pos-004', symbol: 'BNB/USDC', side: 'long', entryPrice: 400.00, currentPrice: 412.60, size: 8, value: 3300.80, pnl: 100.80, pnlPct: 3.15, openedAt: '2026-08-25T09:30:00Z' },
    ];
  },

  async getAllocation(): Promise<PortfolioAllocation[]> {
    // BACKEND INTEGRATION: GET /api/v1/portfolio/allocation
    return [
      { symbol: 'BTC', value: 23744.82, pct: 49.2, color: '#F5C400' },
      { symbol: 'ETH', value: 8502.72, pct: 17.6, color: '#627EEA' },
      { symbol: 'USDC', value: 12480.00, pct: 25.9, color: '#22C55E' },
      { symbol: 'SOL', value: 2736.75, pct: 5.7, color: '#9945FF' },
      { symbol: 'BNB', value: 3300.80, pct: 6.8, color: '#F0B90B' },
    ];
  },

  async getTradeHistory(): Promise<{
    id: string; symbol: string; side: 'buy' | 'sell'; price: number;
    amount: number; total: number; fee: number; time: string; status: string;
  }[]> {
    // BACKEND INTEGRATION: GET /api/v1/portfolio/trades
    return [
      { id: 'th-001', symbol: 'BTC/USDC', side: 'buy', price: 63200.00, amount: 0.35, total: 22120.00, fee: 22.12, time: '2026-08-15 08:22', status: 'filled' },
      { id: 'th-002', symbol: 'ETH/USDC', side: 'sell', price: 3780.00, amount: 1.2, total: 4536.00, fee: 4.54, time: '2026-08-18 16:10', status: 'filled' },
      { id: 'th-003', symbol: 'SOL/USDC', side: 'buy', price: 168.50, amount: 15, total: 2527.50, fee: 2.53, time: '2026-08-22 11:45', status: 'filled' },
      { id: 'th-004', symbol: 'BNB/USDC', side: 'buy', price: 400.00, amount: 8, total: 3200.00, fee: 3.20, time: '2026-08-25 09:30', status: 'filled' },
      { id: 'th-005', symbol: 'BTC/USDC', side: 'buy', price: 64800.00, amount: 0.08, total: 5184.00, fee: 5.18, time: '2026-08-19 13:22', status: 'filled' },
      { id: 'th-006', symbol: 'ETH/USDC', side: 'buy', price: 3520.00, amount: 2.4, total: 8448.00, fee: 8.45, time: '2026-08-20 14:10', status: 'filled' },
    ];
  },
};