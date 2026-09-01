'use client';
import React, { useEffect, useState } from 'react';
import { portfolioService, Position, PortfolioAllocation } from '@/services/portfolio.service';
import PortfolioKpis from './PortfolioKpis';
import AllocationChart from './AllocationChart';
import PositionsTable from './PositionsTable';
import TradeHistoryTable from './TradeHistoryTable';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Activity, BarChart2, Clock } from 'lucide-react';

// Mock portfolio performance data
const PERFORMANCE_DATA = [
  { date: 'Aug 1', value: 40000 },
  { date: 'Aug 5', value: 41200 },
  { date: 'Aug 8', value: 39800 },
  { date: 'Aug 11', value: 42500 },
  { date: 'Aug 14', value: 44100 },
  { date: 'Aug 17', value: 43200 },
  { date: 'Aug 20', value: 45800 },
  { date: 'Aug 22', value: 47200 },
  { date: 'Aug 24', value: 46100 },
  { date: 'Aug 27', value: 48284 },
];

const RISK_METRICS = [
  { label: 'Sharpe Ratio', value: '1.84', sub: 'Risk-adjusted return', positive: true },
  { label: 'Max Drawdown', value: '-8.2%', sub: 'Peak to trough', positive: false },
  { label: 'Win Rate', value: '68%', sub: 'Profitable trades', positive: true },
  { label: 'Avg Hold Time', value: '4.2d', sub: 'Per position', positive: null },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded border shadow-lg text-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <p className="font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
      <p className="font-bold tabular-nums" style={{ color: 'var(--primary)' }}>
        ${payload[0]?.value?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
};

export default function PortfolioContent() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [allocation, setAllocation] = useState<PortfolioAllocation[]>([]);
  const [history, setHistory] = useState<Awaited<ReturnType<typeof portfolioService.getTradeHistory>>>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'analytics' | 'history'>('overview');

  useEffect(() => {
    Promise.all([
      portfolioService.getPositions(),
      portfolioService.getAllocation(),
      portfolioService.getTradeHistory(),
    ]).then(([pos, alloc, hist]) => {
      setPositions(pos);
      setAllocation(alloc);
      setHistory(hist);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="py-4 space-y-4 animate-pulse">
        <div className="h-8 w-40 rounded" style={{ backgroundColor: 'var(--muted)' }} />
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }, (_, i) => <div key={`pf-sk-${i}`} className="h-24 rounded-lg" style={{ backgroundColor: 'var(--card)' }} />)}
        </div>
        <div className="grid xl:grid-cols-3 gap-4">
          <div className="h-72 rounded-lg" style={{ backgroundColor: 'var(--card)' }} />
          <div className="xl:col-span-2 h-72 rounded-lg" style={{ backgroundColor: 'var(--card)' }} />
        </div>
      </div>
    );
  }

  const totalValue = positions.reduce((a, b) => a + b.value, 0) + 12480;
  const totalPnl = positions.reduce((a, b) => a + b.pnl, 0);
  const totalPnlPct = (totalPnl / (totalValue - totalPnl)) * 100;
  const totalDeposited = 40000;
  const totalRoi = ((totalValue - totalDeposited) / totalDeposited) * 100;

  const TABS = [
    { id: 'overview' as const, label: 'Overview', icon: BarChart2 },
    { id: 'analytics' as const, label: 'Analytics', icon: Activity },
    { id: 'history' as const, label: 'Trade History', icon: Clock },
  ];

  return (
    <div className="py-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Portfolio</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Account overview · Aug 27, 2026</p>
        </div>
        {/* Tab switcher */}
        <div className="flex items-center gap-1 p-1 rounded-lg border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-all"
              style={{
                backgroundColor: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                color: activeTab === tab.id ? '#000' : 'var(--muted-foreground)',
              }}
            >
              <tab.icon size={12} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <PortfolioKpis
        totalValue={totalValue}
        pnl24h={totalPnl}
        pnlPct24h={totalPnlPct}
        totalRoi={totalRoi}
        openPositions={positions.length}
      />

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <AllocationChart allocation={allocation} totalValue={totalValue} />
            <div className="xl:col-span-2">
              <PositionsTable positions={positions} />
            </div>
          </div>

          {/* Portfolio value chart */}
          <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Portfolio Value</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Aug 2026 performance</p>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp size={14} style={{ color: 'var(--positive)' }} />
                <span className="text-sm font-bold text-positive">+20.7%</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={PERFORMANCE_DATA} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="pfGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--muted-foreground)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}K`}
                  width={44}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} fill="url(#pfGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* Analytics tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-4">
          {/* Portfolio value chart */}
          <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Portfolio Performance</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Equity curve — Aug 2026</p>
              </div>
              <span className="text-xs px-2 py-1 rounded font-medium" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: 'var(--positive)' }}>
                +$8,284 this month
              </span>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={PERFORMANCE_DATA} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="pfGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--muted-foreground)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}K`}
                  width={44}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} fill="url(#pfGrad2)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Risk metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {RISK_METRICS.map(m => (
              <div key={m.label} className="rounded-lg border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <p className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>{m.label}</p>
                <p className="text-xl font-bold tabular-nums" style={{
                  color: m.positive === true ? 'var(--positive)' : m.positive === false ? 'var(--negative)' : 'var(--foreground)'
                }}>
                  {m.value}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{m.sub}</p>
              </div>
            ))}
          </div>

          {/* Asset performance breakdown */}
          <div className="rounded-lg border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Position Performance</h3>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {positions.map(pos => {
                const isPos = pos.pnl >= 0;
                const barWidth = Math.min(Math.abs(pos.pnlPct) * 4, 100);
                return (
                  <div key={pos.id} className="px-4 py-3 flex items-center gap-4">
                    <div className="w-20 shrink-0">
                      <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{pos.symbol.split('/')[0]}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{pos.side.toUpperCase()}</p>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          Entry ${pos.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        <span className={`text-xs font-semibold ${isPos ? 'text-positive' : 'text-negative'}`}>
                          {isPos ? '+' : ''}${pos.pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({isPos ? '+' : ''}{pos.pnlPct.toFixed(2)}%)
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--muted)' }}>
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${barWidth}%`,
                            backgroundColor: isPos ? 'var(--positive)' : 'var(--negative)',
                          }}
                        />
                      </div>
                    </div>
                    <div className="w-24 text-right shrink-0">
                      <p className="text-xs font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>
                        ${pos.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{pos.size} units</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trade stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Trade Statistics</h3>
              <div className="space-y-2.5">
                {[
                  { label: 'Total Trades', value: history.length.toString() },
                  { label: 'Profitable', value: `${history.filter(h => h.side === 'sell').length} (${Math.round(history.filter(h => h.side === 'sell').length / history.length * 100)}%)` },
                  { label: 'Total Volume', value: `$${history.reduce((s, h) => s + h.total, 0).toLocaleString('en-US', { maximumFractionDigits: 0 })}` },
                  { label: 'Total Fees', value: `$${history.reduce((s, h) => s + h.fee, 0).toFixed(2)}` },
                  { label: 'Avg Trade Size', value: `$${(history.reduce((s, h) => s + h.total, 0) / history.length).toLocaleString('en-US', { maximumFractionDigits: 0 })}` },
                ].map(stat => (
                  <div key={stat.label} className="flex items-center justify-between">
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{stat.label}</span>
                    <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Asset Exposure</h3>
              <div className="space-y-2.5">
                {allocation.map(item => (
                  <div key={item.symbol} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-medium w-10" style={{ color: 'var(--foreground)' }}>{item.symbol}</span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--muted)' }}>
                      <div className="h-full rounded-full" style={{ width: `${item.pct}%`, backgroundColor: item.color }} />
                    </div>
                    <span className="text-xs tabular-nums w-10 text-right" style={{ color: 'var(--muted-foreground)' }}>{item.pct.toFixed(1)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Trade History tab */}
      {activeTab === 'history' && (
        <TradeHistoryTable history={history} />
      )}
    </div>
  );
}