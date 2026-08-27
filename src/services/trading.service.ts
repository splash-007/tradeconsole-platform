// BACKEND INTEGRATION: POST /api/v1/orders, GET /api/v1/orders, GET /api/v1/positions
import { DATA_MODE } from '@/lib/api-client';

export interface PlaceOrderDTO {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop_limit';
  price?: number;
  amount: number;
  total?: number;
  takeProfitPrice?: number;
  stopLossPrice?: number;
  postOnly?: boolean;
}

export interface Order {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop_limit';
  price: number;
  amount: number;
  filled: number;
  status: 'pending' | 'filled' | 'partially_filled' | 'cancelled';
  createdAt: string;
}

export const tradingService = {
  async placeOrder(dto: PlaceOrderDTO): Promise<{ orderId: string | null; error: string | null }> {
    // BACKEND INTEGRATION: POST /api/v1/orders
    if (DATA_MODE === 'mock') {
      return { orderId: `order-${Date.now()}`, error: null };
    }
    return { orderId: null, error: 'Not implemented' };
  },

  async getOpenOrders(symbol?: string): Promise<Order[]> {
    // BACKEND INTEGRATION: GET /api/v1/orders?status=open&symbol=:symbol
    return [
      { id: 'order-001', symbol: 'BTC/USDC', side: 'buy', type: 'limit', price: 66500.00, amount: 0.1, filled: 0, status: 'pending', createdAt: '2026-08-27T10:00:00Z' },
      { id: 'order-002', symbol: 'ETH/USDC', side: 'sell', type: 'limit', price: 3650.00, amount: 1.5, filled: 0.8, status: 'partially_filled', createdAt: '2026-08-27T09:30:00Z' },
    ];
  },
};