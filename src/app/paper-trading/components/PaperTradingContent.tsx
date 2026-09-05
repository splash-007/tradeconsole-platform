'use client';
import React, { useState } from 'react';
import { FlaskConical, TrendingUp, TrendingDown, DollarSign, BarChart2, Plus, Minus, ChevronDown, Clock, Target, ShieldCheck, Zap, BookOpen, RotateCcw, ArrowUpRight, ArrowDownRight, Activity,  } from 'lucide-react';

interface PaperPosition {
  id: string;
  symbol: string;
  side: 'Long' | 'Short';
  qty: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPct: number;
  openedAt: string;
}

interface PaperTrade {
  id: string;
  symbol: string;
  side: 'Buy' | 'Sell';
  qty: number;
  price: number;
  total: number;
  executedAt: string;
  status: 'Filled' | 'Cancelled';
}

const MOCK_POSITIONS: PaperPosition[] = [
  { id: 'p1', symbol: 'BTC/USDT', side: 'Long', qty: 0.25, entryPrice: 62400, currentPrice: 65180, pnl: 695, pnlPct: 4.46, openedAt: '2026-08-28T09:14:00Z' },
  { id: 'p2', symbol: 'ETH/USDT', side: 'Long', qty: 2.5, entryPrice: 3280, currentPrice: 3410, pnl: 325, pnlPct: 3.96, openedAt: '2026-09-01T14:32:00Z' },
  { id: 'p3', symbol: 'SOL/USDT', side: 'Short', qty: 10, entryPrice: 178.4, currentPrice: 171.2, pnl: 72, pnlPct: 4.04, openedAt: '2026-09-03T11:08:00Z' },
  { id: 'p4', symbol: 'XAU/USD', side: 'Long', qty: 1, entryPrice: 2340, currentPrice: 2298, pnl: -42, pnlPct: -1.79, openedAt: '2026-09-04T08:55:00Z' },
];

const MOCK_TRADES: PaperTrade[] = [
  { id: 'tr1', symbol: 'BTC/USDT', side: 'Buy', qty: 0.25, price: 62400, total: 15600, executedAt: '2026-08-28T09:14:00Z', status: 'Filled' },
  { id: 'tr2', symbol: 'ETH/USDT', side: 'Buy', qty: 2.5, price: 3280, total: 8200, executedAt: '2026-09-01T14:32:00Z', status: 'Filled' },
  { id: 'tr3', symbol: 'SOL/USDT', side: 'Sell', qty: 10, price: 178.4, total: 1784, executedAt: '2026-09-03T11:08:00Z', status: 'Filled' },
  { id: 'tr4', symbol: 'XAU/USD', side: 'Buy', qty: 1, price: 2340, total: 2340, executedAt: '2026-09-04T08:55:00Z', status: 'Filled' },
  { id: 'tr5', symbol: 'BNB/USDT', side: 'Buy', qty: 5, price: 412, total: 2060, executedAt: '2026-09-02T16:20:00Z', status: 'Cancelled' },
];

const INSTRUMENTS = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'BNB/USDT', 'XRP/USDT', 'XAU/USD', 'EUR/USD', 'GBP/USD'];
const MOCK_PRICES: Record<string, number> = {
  'BTC/USDT': 65180, 'ETH/USDT': 3410, 'SOL/USDT': 171.2,
  'BNB/USDT': 418.5, 'XRP/USDT': 0.624, 'XAU/USD': 2298,
  'EUR/USD': 1.0842, 'GBP/USD': 1.2714,
};

type TabKey = 'positions' | 'history';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function PaperTradingContent() {
  const [activeTab, setActiveTab] = useState<TabKey>('positions');
  const [selectedInstrument, setSelectedInstrument] = useState('BTC/USDT');
  const [orderSide, setOrderSide] = useState<'Buy' | 'Sell'>('Buy');
  const [orderQty, setOrderQty] = useState('0.1');
  const [orderType, setOrderType] = useState<'Market' | 'Limit'>('Market');
  const [limitPrice, setLimitPrice] = useState('');
  const [positions, setPositions] = useState<PaperPosition[]>(MOCK_POSITIONS);
  const [trades, setTrades] = useState<PaperTrade[]>(MOCK_TRADES);
  const [balance, setBalance] = useState(100000);
  const [showReset, setShowReset] = useState(false);

  const currentPrice = MOCK_PRICES[selectedInstrument] || 0;
  const qty = parseFloat(orderQty) || 0;
  const execPrice = orderType === 'Market' ? currentPrice : (parseFloat(limitPrice) || currentPrice);
  const orderTotal = qty * execPrice;

  const totalPnl = positions.reduce((s, p) => s + p.pnl, 0);
  const totalValue = positions.reduce((s, p) => s + p.qty * p.currentPrice, 0);
  const winPositions = positions.filter(p => p.pnl > 0).length;

  const handlePlaceOrder = () => {
    if (!qty || qty <= 0) return;
    const newTrade: PaperTrade = {
      id: `tr${Date.now()}`,
      symbol: selectedInstrument,
      side: orderSide,
      qty,
      price: execPrice,
      total: orderTotal,
      executedAt: new Date().toISOString(),
      status: 'Filled',
    };
    setTrades(prev => [newTrade, ...prev]);
    if (orderSide === 'Buy') {
      setBalance(prev => prev - orderTotal);
      const existing = positions.find(p => p.symbol === selectedInstrument && p.side === 'Long');
      if (existing) {
        setPositions(prev => prev.map(p =>
          p.id === existing.id
            ? { ...p, qty: p.qty + qty, entryPrice: (p.entryPrice * p.qty + execPrice * qty) / (p.qty + qty) }
            : p
        ));
      } else {
        const newPos: PaperPosition = {
          id: `pos${Date.now()}`,
          symbol: selectedInstrument,
          side: 'Long',
          qty,
          entryPrice: execPrice,
          currentPrice: execPrice,
          pnl: 0,
          pnlPct: 0,
          openedAt: new Date().toISOString(),
        };
        setPositions(prev => [...prev, newPos]);
      }
    } else {
      setBalance(prev => prev + orderTotal);
    }
  };

  const handleClosePosition = (id: string) => {
    const pos = positions.find(p => p.id === id);
    if (!pos) return;
    setBalance(prev => prev + pos.qty * pos.currentPrice);
    setPositions(prev => prev.filter(p => p.id !== id));
  };

  const handleReset = () => {
    setBalance(100000);
    setPositions(MOCK_POSITIONS);
    setTrades(MOCK_TRADES);
    setShowReset(false);
  };

  return (
    <div className="min-h-screen pt-14" style={{ backgroundColor: 'var(--background)' }}>
      <div className="w-full px-4 md:px-6 py-6 space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(212,168,0,0.20) 0%, rgba(212,168,0,0.08) 100%)', border: '1px solid rgba(212,168,0,0.25)' }}
            >
              <FlaskConical size={20} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Paper Trading</h1>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Practice with virtual funds — zero risk, real market data</p>
            </div>
          </div>
          <button
            onClick={() => setShowReset(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all hover:opacity-80"
            style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', backgroundColor: 'var(--card)' }}
          >
            <RotateCcw size={14} /> Reset Account
          </button>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Virtual Balance', value: `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, color: 'var(--primary)', sub: 'Available cash' },
            { label: 'Open P&L', value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`, icon: Activity, color: totalPnl >= 0 ? '#22c55e' : '#ef4444', sub: `${positions.length} open positions` },
            { label: 'Portfolio Value', value: `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: BarChart2, color: '#3b82f6', sub: 'Across all assets' },
            { label: 'Win Rate', value: positions.length ? `${Math.round((winPositions / positions.length) * 100)}%` : '—', icon: Target, color: '#8b5cf6', sub: `${winPositions}/${positions.length} profitable` },
          ].map(kpi => (
            <div key={kpi.label} className="rounded-2xl border p-4 flex flex-col gap-2" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{kpi.label}</span>
                <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${kpi.color}18` }}>
                  <kpi.icon size={13} style={{ color: kpi.color }} />
                </div>
              </div>
              <p className="text-lg font-bold tabular-nums font-mono" style={{ color: kpi.color }}>{kpi.value}</p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{kpi.sub}</p>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

          {/* Order Form */}
          <div className="xl:col-span-1 rounded-2xl border p-5 space-y-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2">
              <Zap size={15} style={{ color: 'var(--primary)' }} />
              <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Place Order</h2>
              <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: 'rgba(212,168,0,0.12)', color: 'var(--primary)' }}>Virtual</span>
            </div>

            {/* Instrument selector */}
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Instrument</label>
              <div className="relative">
                <select
                  value={selectedInstrument}
                  onChange={e => setSelectedInstrument(e.target.value)}
                  className="w-full appearance-none rounded-xl border px-3 py-2.5 text-sm font-semibold pr-8 focus:outline-none"
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                >
                  {INSTRUMENTS.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--muted-foreground)' }} />
              </div>
              <p className="text-xs mt-1.5 font-mono font-semibold" style={{ color: 'var(--muted-foreground)' }}>
                Market: <span style={{ color: 'var(--foreground)' }}>${currentPrice.toLocaleString()}</span>
              </p>
            </div>

            {/* Buy / Sell toggle */}
            <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border)' }}>
              {(['Buy', 'Sell'] as const).map(side => (
                <button
                  key={side}
                  onClick={() => setOrderSide(side)}
                  className="flex-1 py-2.5 text-sm font-bold transition-all"
                  style={{
                    backgroundColor: orderSide === side ? (side === 'Buy' ? '#22c55e' : '#ef4444') : 'var(--muted)',
                    color: orderSide === side ? '#fff' : 'var(--muted-foreground)',
                  }}
                >
                  {side === 'Buy' ? <span className="flex items-center justify-center gap-1"><ArrowUpRight size={13} />{side}</span> : <span className="flex items-center justify-center gap-1"><ArrowDownRight size={13} />{side}</span>}
                </button>
              ))}
            </div>

            {/* Order type */}
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Order Type</label>
              <div className="flex gap-2">
                {(['Market', 'Limit'] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => setOrderType(t)}
                    className="flex-1 py-2 rounded-xl text-xs font-semibold border transition-all"
                    style={{
                      backgroundColor: orderType === t ? 'rgba(212,168,0,0.12)' : 'var(--muted)',
                      borderColor: orderType === t ? 'rgba(212,168,0,0.4)' : 'var(--border)',
                      color: orderType === t ? 'var(--primary)' : 'var(--muted-foreground)',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Quantity</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOrderQty(v => Math.max(0, parseFloat(v) - 0.1).toFixed(2))}
                  className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all hover:opacity-70"
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                >
                  <Minus size={13} />
                </button>
                <input
                  type="number"
                  value={orderQty}
                  onChange={e => setOrderQty(e.target.value)}
                  className="flex-1 rounded-xl border px-3 py-2 text-sm font-mono text-center focus:outline-none"
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  min="0"
                  step="0.01"
                />
                <button
                  onClick={() => setOrderQty(v => (parseFloat(v) + 0.1).toFixed(2))}
                  className="w-9 h-9 rounded-xl flex items-center justify-center border transition-all hover:opacity-70"
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Limit price */}
            {orderType === 'Limit' && (
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Limit Price</label>
                <input
                  type="number"
                  value={limitPrice}
                  onChange={e => setLimitPrice(e.target.value)}
                  placeholder={currentPrice.toString()}
                  className="w-full rounded-xl border px-3 py-2.5 text-sm font-mono focus:outline-none"
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              </div>
            )}

            {/* Order summary */}
            <div className="rounded-xl p-3 space-y-1.5" style={{ backgroundColor: 'var(--muted)' }}>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--muted-foreground)' }}>Est. Total</span>
                <span className="font-mono font-semibold" style={{ color: 'var(--foreground)' }}>${orderTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={{ color: 'var(--muted-foreground)' }}>Available</span>
                <span className="font-mono font-semibold" style={{ color: balance >= orderTotal ? '#22c55e' : '#ef4444' }}>${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={!qty || qty <= 0}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: orderSide === 'Buy' ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#fff',
                boxShadow: orderSide === 'Buy' ? '0 2px 12px rgba(34,197,94,0.30)' : '0 2px 12px rgba(239,68,68,0.30)',
              }}
            >
              {orderSide === 'Buy' ? 'Buy' : 'Sell'} {selectedInstrument}
            </button>

            {/* Info note */}
            <div className="flex items-start gap-2 p-3 rounded-xl" style={{ backgroundColor: 'rgba(212,168,0,0.07)', border: '1px solid rgba(212,168,0,0.15)' }}>
              <BookOpen size={13} className="mt-0.5 shrink-0" style={{ color: 'var(--primary)' }} />
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                Paper trading uses virtual funds. No real money is at risk. Practice strategies before going live.
              </p>
            </div>
          </div>

          {/* Positions / History */}
          <div className="xl:col-span-2 rounded-2xl border flex flex-col" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            {/* Tabs */}
            <div className="flex border-b px-5 pt-4 gap-1" style={{ borderColor: 'var(--border)' }}>
              {([
                { key: 'positions', label: 'Open Positions', count: positions.length },
                { key: 'history', label: 'Trade History', count: trades.length },
              ] as const).map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all border-b-2 -mb-px"
                  style={{
                    borderBottomColor: activeTab === tab.key ? 'var(--primary)' : 'transparent',
                    color: activeTab === tab.key ? 'var(--primary)' : 'var(--muted-foreground)',
                    backgroundColor: 'transparent',
                  }}
                >
                  {tab.label}
                  <span className="px-1.5 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: activeTab === tab.key ? 'rgba(212,168,0,0.15)' : 'var(--muted)', color: activeTab === tab.key ? 'var(--primary)' : 'var(--muted-foreground)' }}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-auto p-5">
              {activeTab === 'positions' && (
                <div className="space-y-3">
                  {positions.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'var(--muted)' }}>
                        <BarChart2 size={22} style={{ color: 'var(--muted-foreground)' }} />
                      </div>
                      <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>No open positions</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Place an order to get started</p>
                    </div>
                  )}
                  {positions.map(pos => {
                    const isPos = pos.pnl >= 0;
                    return (
                      <div key={pos.id} className="rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center gap-4" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0"
                            style={{ backgroundColor: pos.side === 'Long' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: pos.side === 'Long' ? '#22c55e' : '#ef4444' }}
                          >
                            {pos.side === 'Long' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold font-mono" style={{ color: 'var(--foreground)' }}>{pos.symbol}</span>
                              <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: pos.side === 'Long' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: pos.side === 'Long' ? '#22c55e' : '#ef4444' }}>
                                {pos.side}
                              </span>
                            </div>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                              {pos.qty} @ ${pos.entryPrice.toLocaleString()} · <Clock size={10} className="inline" /> {formatDate(pos.openedAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 flex-wrap">
                          <div className="text-right">
                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Current</p>
                            <p className="text-sm font-mono font-semibold" style={{ color: 'var(--foreground)' }}>${pos.currentPrice.toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>P&L</p>
                            <p className="text-sm font-mono font-bold" style={{ color: isPos ? '#22c55e' : '#ef4444' }}>
                              {isPos ? '+' : ''}${pos.pnl.toFixed(2)} ({isPos ? '+' : ''}{pos.pnlPct.toFixed(2)}%)
                            </p>
                          </div>
                          <button
                            onClick={() => handleClosePosition(pos.id)}
                            className="px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all hover:opacity-80"
                            style={{ borderColor: '#ef4444', color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.08)' }}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border)' }}>
                        {['Symbol', 'Side', 'Qty', 'Price', 'Total', 'Date', 'Status'].map(h => (
                          <th key={h} className="text-left pb-3 pr-4 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {trades.map(tr => (
                        <tr key={tr.id} className="border-b" style={{ borderColor: 'var(--border)' }}>
                          <td className="py-3 pr-4 font-mono font-semibold text-xs" style={{ color: 'var(--foreground)' }}>{tr.symbol}</td>
                          <td className="py-3 pr-4">
                            <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: tr.side === 'Buy' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)', color: tr.side === 'Buy' ? '#22c55e' : '#ef4444' }}>
                              {tr.side}
                            </span>
                          </td>
                          <td className="py-3 pr-4 font-mono text-xs" style={{ color: 'var(--foreground)' }}>{tr.qty}</td>
                          <td className="py-3 pr-4 font-mono text-xs" style={{ color: 'var(--foreground)' }}>${tr.price.toLocaleString()}</td>
                          <td className="py-3 pr-4 font-mono text-xs font-semibold" style={{ color: 'var(--foreground)' }}>${tr.total.toLocaleString()}</td>
                          <td className="py-3 pr-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>{formatDate(tr.executedAt)}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: tr.status === 'Filled' ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.15)', color: tr.status === 'Filled' ? '#22c55e' : '#6b7280' }}>
                              {tr.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Risk disclaimer */}
        <div className="flex items-start gap-3 p-4 rounded-2xl border" style={{ backgroundColor: 'rgba(212,168,0,0.05)', borderColor: 'rgba(212,168,0,0.20)' }}>
          <ShieldCheck size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--primary)' }} />
          <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            <span className="font-semibold" style={{ color: 'var(--foreground)' }}>Paper Trading Mode — </span>
            All trades are simulated using virtual funds. Prices reflect live market data but no real capital is involved. Use this environment to test strategies, understand order mechanics, and build confidence before trading with real money.
          </p>
        </div>
      </div>

      {/* Reset confirmation modal */}
      {showReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowReset(false)}>
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }} />
          <div
            className="relative w-full max-w-sm rounded-2xl border p-6 space-y-4"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(239,68,68,0.12)' }}>
                <RotateCcw size={18} style={{ color: '#ef4444' }} />
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>Reset Paper Account</h3>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>This will clear all positions and trades</p>
              </div>
            </div>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Your virtual balance will be reset to <span className="font-bold" style={{ color: 'var(--foreground)' }}>$100,000</span> and all open positions will be closed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowReset(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:opacity-80"
                style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', backgroundColor: 'var(--muted)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                style={{ backgroundColor: '#ef4444', color: '#fff' }}
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
