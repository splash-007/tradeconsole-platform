'use client';
import React, { useState, useEffect } from 'react';
import { tradingService, Order } from '@/services/trading.service';

import { RefreshCw, X, TrendingUp, TrendingDown } from 'lucide-react';

interface LiveOrdersProps {
  symbol?: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#F5C400',
  filled: '#22c55e',
  partially_filled: '#3b82f6',
  cancelled: '#6b7280',
};

export default function LiveOrdersPanel({ symbol }: LiveOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    const data = await tradingService.getOpenOrders(symbol);
    setOrders(data);
    setLastUpdated(new Date());
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, [symbol]);

  const handleCancel = async (orderId: string) => {
    setCancellingId(orderId);
    // BACKEND INTEGRATION: DELETE /api/v1/orders/:id
    await new Promise(r => setTimeout(r, 600));
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
    setCancellingId(null);
  };

  const formatTime = (ts: string) => {
    try {
      return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch { return ts; }
  };

  return (
    <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
      <div className="flex items-center justify-between px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Live Orders</h3>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#22c55e' }} />
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Updated {formatTime(lastUpdated.toISOString())}
            </span>
          )}
          <button onClick={fetchOrders} className="p-1 rounded hover:bg-white/5 transition-colors">
            <RefreshCw size={11} style={{ color: 'var(--muted-foreground)' }} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-4 space-y-2">
          {[1, 2].map(i => <div key={i} className="h-10 rounded animate-pulse" style={{ backgroundColor: 'var(--background)' }} />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="p-6 text-center text-xs" style={{ color: 'var(--muted-foreground)' }}>No open orders</div>
      ) : (
        <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
          {orders.map(order => {
            const fillPct = order.amount > 0 ? (order.filled / order.amount) * 100 : 0;
            return (
              <div key={order.id} className="px-3 py-2.5 flex items-center gap-3">
                {/* Side indicator */}
                <div className="shrink-0">
                  {order.side === 'buy'
                    ? <TrendingUp size={12} style={{ color: '#22c55e' }} />
                    : <TrendingDown size={12} style={{ color: '#ef4444' }} />}
                </div>

                {/* Order info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{order.symbol}</span>
                    <span className="text-xs uppercase font-semibold" style={{ color: order.side === 'buy' ? '#22c55e' : '#ef4444' }}>{order.side}</span>
                    <span className="text-xs capitalize" style={{ color: 'var(--muted-foreground)' }}>{order.type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <span>${order.price.toLocaleString()}</span>
                    <span>{order.filled}/{order.amount} filled</span>
                    <span>{formatTime(order.createdAt)}</span>
                  </div>
                  {/* Fill progress bar */}
                  {order.status === 'partially_filled' && (
                    <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${fillPct}%`, backgroundColor: '#3b82f6' }} />
                    </div>
                  )}
                </div>

                {/* Status + cancel */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[order.status] || '#6b7280' }} />
                    <span className="text-xs capitalize" style={{ color: 'var(--muted-foreground)' }}>{order.status.replace('_', ' ')}</span>
                  </div>
                  {(order.status === 'pending' || order.status === 'partially_filled') && (
                    <button
                      onClick={() => handleCancel(order.id)}
                      disabled={cancellingId === order.id}
                      className="p-1 rounded hover:bg-red-500/10 transition-colors disabled:opacity-50"
                      title="Cancel order"
                    >
                      <X size={11} style={{ color: '#ef4444' }} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
