'use client';
import React, { useEffect, useState } from 'react';
import { portfolioService, Position, PortfolioAllocation } from '@/services/portfolio.service';
import { dashboardService, DashboardOverview } from '@/services/dashboard.service';
import { kycService, KYCStatus } from '@/services/kyc.service';
import { useMarketQuotes } from '@/hooks/useMarketQuotes';
import AllocationChart from './AllocationChart';
import PositionsTable from './PositionsTable';
import TradeHistoryTable from './TradeHistoryTable';
import AssetIcon from '@/components/ui/AssetIcon';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import {
  TrendingUp, Activity, BarChart2, Clock, Wallet, AlertTriangle,
  CheckCircle2, ArrowUpRight, ArrowDownLeft, Star, Zap, DollarSign,
  Database, RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

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

const REAL_DATA_SYMBOLS = [
  'BTC/USD', 'ETH/USD', 'SOL/USD', 'XRP/USD',
  'EUR/USD', 'GBP/USD', 'USD/JPY',
  'AAPL', 'NVDA', 'MSFT', 'TSLA', 'AMZN',
  'SPY', 'QQQ',
];

const MARKET_SNAPSHOT = [
  { symbol: 'BTC/USD', name: 'Bitcoin', assetType: 'crypto' as const, realKey: 'BTC/USD' },
  { symbol: 'ETH/USD', name: 'Ethereum', assetType: 'crypto' as const, realKey: 'ETH/USD' },
  { symbol: 'EUR/USD', name: 'Euro / Dollar', assetType: 'forex' as const, realKey: 'EUR/USD' },
  { symbol: 'GBP/USD', name: 'Pound / Dollar', assetType: 'forex' as const, realKey: 'GBP/USD' },
  { symbol: 'AAPL', name: 'Apple Inc.', assetType: 'stock' as const, realKey: 'AAPL' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', assetType: 'stock' as const, realKey: 'NVDA' },
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

type PortfolioTab = 'overview' | 'performance' | 'history';

// Dev state badge — shown wherever backend data is not yet connected
function DevBadge({ label = 'Dev data' }: { label?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium"
      style={{ backgroundColor: 'rgba(107,114,128,0.1)', color: 'var(--muted-foreground)', fontSize: '10px' }}
    >
      <Database size={9} />
      {label}
    </span>
  );
}

export default function PortfolioContent() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [allocation, setAllocation] = useState<PortfolioAllocation[]>([]);
  const [history, setHistory] = useState<Awaited<ReturnType<typeof portfolioService.getTradeHistory>>>([]);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [kycStatus, setKycStatus] = useState<KYCStatus>('not_started');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<PortfolioTab>('overview');

  const { quotes: realQuotes, loading: realLoading } = useMarketQuotes(REAL_DATA_SYMBOLS);
  const isLive = Object.values(realQuotes).some(q => q.available);

  useEffect(() => {
    Promise.all([
      portfolioService.getPositions(),
      portfolioService.getAllocation(),
      portfolioService.getTradeHistory(),
      dashboardService.getOverview(),
      kycService.getKYCStatus('cust-001'),
    ]).then(([pos, alloc, hist, ov, kyc]) => {
      setPositions(pos);
      setAllocation(alloc);
      setHistory(hist);
      setOverview(ov);
      setKycStatus(kyc.status);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="py-4 space-y-4 animate-pulse">
        <div className="h-8 w-40 rounded" style={{ backgroundColor: 'var(--muted)' }} />
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {Array.from({ length: 4 }, (_, i) => <div key={i} className="h-24 rounded-lg" style={{ backgroundColor: 'var(--card)' }} />)}
        </div>
        <div className="grid xl:grid-cols-3 gap-4">
          <div className="h-72 rounded-lg" style={{ backgroundColor: 'var(--card)' }} />
          <div className="xl:col-span-2 h-72 rounded-lg" style={{ backgroundColor: 'var(--card)' }} />
        </div>
      </div>
    );
  }

  // Portfolio value — dev data, clearly labeled
  const totalValue = positions.reduce((a, b) => a + b.value, 0) + 12480;
  const totalPnl = positions.reduce((a, b) => a + b.pnl, 0);
  const availableBalance = overview?.availableBalance ?? 12480;

  // BTC price — real when available
  const btcReal = realQuotes['BTC/USD'];
  const btcPrice = btcReal?.available && btcReal.quote?.price != null
    ? btcReal.quote.price
    : null;
  const btcChangePct = btcReal?.available && btcReal.quote?.changePercent != null
    ? btcReal.quote.changePercent
    : null;

  const TABS: { id: PortfolioTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart2 },
    { id: 'performance', label: 'Performance', icon: Activity },
    { id: 'history', label: 'Trade History', icon: Clock },
  ];

  return (
    <div className="py-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>Portfolio</h1>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <p className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>Account overview</p>
            <span style={{ color: 'var(--border)' }}>·</span>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: isLive ? '#22c55e' : '#6b7280' }} />
              <span className="text-sm font-medium" style={{ color: isLive ? '#22c55e' : 'var(--muted-foreground)' }}>
                {isLive ? 'Market data live' : realLoading ? 'Connecting…' : 'Market data unavailable'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/finance?tab=deposit"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90"
            style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}
          >
            <ArrowDownLeft size={14} /> Deposit
          </Link>
          <Link
            href="/finance?tab=withdraw"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90"
            style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <ArrowUpRight size={14} /> Withdraw
          </Link>
          <Link
            href="/trade-trading-workspace"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90"
            style={{ backgroundColor: 'var(--primary)', color: '#000' }}
          >
            <TrendingUp size={14} /> Trade
          </Link>
        </div>
      </div>

      {/* KYC notice */}
      {kycStatus !== 'verified' && kycStatus !== 'submitted' && kycStatus !== 'under_review' && (
        <div className="flex items-center gap-3 px-4 py-3 rounded border" style={{ backgroundColor: 'rgba(245,158,11,0.05)', borderColor: 'rgba(245,158,11,0.2)' }}>
          <AlertTriangle size={13} className="shrink-0" style={{ color: '#f59e0b' }} />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold" style={{ color: '#f59e0b' }}>Identity verification required</span>
            <span className="text-xs ml-2" style={{ color: 'var(--muted-foreground)' }}>Complete your verification to unlock all account functionality.</span>
          </div>
          <Link href="/settings?tab=kyc" className="text-xs px-3 py-1.5 rounded font-semibold shrink-0 transition-all hover:opacity-90" style={{ backgroundColor: '#f59e0b', color: '#000' }}>
            Complete Verification
          </Link>
        </div>
      )}

      {/* Backend data notice */}
      <div className="flex items-center gap-2 px-3 py-2 rounded border text-xs" style={{ backgroundColor: 'rgba(107,114,128,0.05)', borderColor: 'var(--border)' }}>
        <Database size={11} style={{ color: 'var(--muted-foreground)' }} />
        <span style={{ color: 'var(--muted-foreground)' }}>
          Portfolio balances, positions, and P&amp;L are <strong>development data</strong> — not connected to a live account. Market prices marked <span className="inline-flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" /></span> are live.
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
        {/* Portfolio Value — hero, dev data */}
        <div className="col-span-2 rounded-lg p-4 border relative overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'rgba(212,168,0,0.2)' }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Portfolio Value</p>
              <DevBadge />
            </div>
            <div className="w-7 h-7 rounded flex items-center justify-center" style={{ backgroundColor: 'rgba(212,168,0,0.1)' }}>
              <Wallet size={13} style={{ color: 'var(--primary)' }} />
            </div>
          </div>
          <p className="text-2xl font-bold tabular-nums font-mono mb-1" style={{ color: 'var(--foreground)' }}>
            ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1.5">
            <TrendingUp size={11} style={{ color: 'var(--positive)' }} />
            <span className="text-xs font-medium tabular-nums text-positive">+20.7% this month</span>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)', opacity: 0.5 }}>(dev)</span>
          </div>
        </div>

        {/* Available Balance — dev data */}
        <div className="col-span-1 rounded-lg p-4 border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Available</p>
            <DevBadge />
          </div>
          <p className="text-xl font-bold tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>
            ${availableBalance.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Cash balance</p>
        </div>

        {/* 24h P&L — dev data */}
        <div className="col-span-1 rounded-lg p-4 border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>24h P&amp;L</p>
            <DevBadge />
          </div>
          <p className={`text-xl font-bold tabular-nums font-mono ${totalPnl >= 0 ? 'text-positive' : 'text-negative'}`}>
            {totalPnl >= 0 ? '+' : ''}${Math.abs(totalPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Unrealized</p>
        </div>

        {/* BTC Price — live when available */}
        <div className="col-span-1 rounded-lg p-4 border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-1.5 mb-2">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>BTC/USD</p>
            {btcPrice != null && <div className="w-1.5 h-1.5 rounded-full bg-green-500" title="Live" />}
          </div>
          {btcPrice != null ? (
            <>
              <p className="text-xl font-bold tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>
                ${btcPrice.toLocaleString('en-US', { minimumFractionDigits: 0 })}
              </p>
              {btcChangePct != null && (
                <p className={`text-xs mt-1 font-medium tabular-nums ${btcChangePct >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {btcChangePct >= 0 ? '+' : ''}{btcChangePct.toFixed(2)}%
                </p>
              )}
            </>
          ) : (
            <>
              <p className="text-xl font-bold tabular-nums font-mono" style={{ color: 'var(--muted-foreground)' }}>—</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
                {realLoading ? 'Loading…' : 'Unavailable'}
              </p>
            </>
          )}
        </div>

        {/* Account Status */}
        <div className="col-span-1 rounded-lg p-4 border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--muted-foreground)' }}>Account</p>
          <div className="flex items-center gap-1.5">
            {kycStatus === 'verified' ? (
              <CheckCircle2 size={14} style={{ color: '#22c55e' }} />
            ) : (
              <AlertTriangle size={14} style={{ color: '#f59e0b' }} />
            )}
            <span className="text-sm font-semibold" style={{ color: kycStatus === 'verified' ? '#22c55e' : '#f59e0b' }}>
              {kycStatus === 'verified' ? 'Verified' : 'Pending KYC'}
            </span>
          </div>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{positions.length} positions (dev)</p>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex items-center gap-1 p-1 rounded border w-fit" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
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

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <>
          {/* Market Snapshot — live prices */}
          <div className="rounded-lg border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--foreground)' }}>Market Snapshot</h3>
                {isLive && (
                  <div className="flex items-center gap-1 text-xs" style={{ color: '#22c55e' }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span>Live</span>
                  </div>
                )}
              </div>
              <Link href="/markets" className="text-xs font-medium hover:underline" style={{ color: 'var(--primary)' }}>All markets</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x" style={{ borderColor: 'var(--border)' }}>
              {MARKET_SNAPSHOT.map(item => {
                const q = realQuotes[item.realKey];
                const isReal = q?.available && q.quote?.price != null;
                const price = isReal ? q.quote!.price! : null;
                const changePct = isReal && q.quote?.changePercent != null ? q.quote.changePercent : null;
                const isPos = (changePct ?? 0) >= 0;
                return (
                  <div key={item.symbol} className="px-4 py-3">
                    <div className="flex items-center gap-2 mb-2">
                      <AssetIcon symbol={item.symbol} assetType={item.assetType} size={20} />
                      <div>
                        <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{item.symbol}</p>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>{item.name}</p>
                      </div>
                    </div>
                    {price != null ? (
                      <>
                        <p className="text-sm font-bold tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>
                          {item.assetType === 'forex' ? price.toFixed(4) : price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </p>
                        {changePct != null && (
                          <p className={`text-xs font-semibold tabular-nums ${isPos ? 'text-positive' : 'text-negative'}`}>
                            {isPos ? '+' : ''}{changePct.toFixed(2)}%
                          </p>
                        )}
                      </>
                    ) : (
                      <div>
                        <p className="text-sm font-mono" style={{ color: 'var(--muted-foreground)' }}>—</p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>
                          {realLoading ? 'Loading…' : 'Unavailable'}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Allocation + Positions */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <AllocationChart allocation={allocation} totalValue={totalValue} />
            <div className="xl:col-span-2">
              <PositionsTable positions={positions} />
            </div>
          </div>

          {/* Portfolio chart — dev data */}
          <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--foreground)' }}>Portfolio Value</h3>
                  <DevBadge label="Dev chart" />
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Aug 2026 — not connected to live account</p>
              </div>
              <div className="flex items-center gap-1.5">
                <TrendingUp size={13} style={{ color: 'var(--positive)' }} />
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
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--muted-foreground)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} width={44} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} fill="url(#pfGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Programs preview */}
          <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--foreground)' }}>Available Programs</h3>
              <Link href="/programs" className="text-xs font-medium hover:underline" style={{ color: 'var(--primary)' }}>View all</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { icon: Star, label: 'Loyalty Rewards', desc: 'Earn points on every trade', color: '#f59e0b' },
                { icon: Zap, label: 'Trading Boost', desc: 'Enhanced leverage for verified accounts', color: '#8b5cf6' },
                { icon: DollarSign, label: 'Referral Bonus', desc: 'Earn for every referral', color: '#22c55e' },
              ].map(p => (
                <div key={p.label} className="flex items-start gap-3 p-3 rounded border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
                  <div className="w-7 h-7 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: `${p.color}15` }}>
                    <p.icon size={13} style={{ color: p.color }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{p.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Performance tab */}
      {activeTab === 'performance' && (
        <div className="space-y-4">
          {/* Dev state notice */}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded border text-xs" style={{ backgroundColor: 'rgba(107,114,128,0.05)', borderColor: 'var(--border)' }}>
            <RefreshCw size={11} style={{ color: 'var(--muted-foreground)' }} />
            <span style={{ color: 'var(--muted-foreground)' }}>
              Performance metrics below are <strong>development data</strong>. Connect backend account API to show real equity curve and statistics.
            </span>
          </div>

          <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--foreground)' }}>Portfolio Performance</h3>
                  <DevBadge label="Dev chart" />
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Equity curve · Aug 2026</p>
              </div>
              <span className="text-xs px-2 py-1 rounded font-medium" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: 'var(--positive)' }}>
                +$8,284 (dev)
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
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(0,0,0,0.04)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--muted-foreground)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--muted-foreground)', fontSize: 9 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} width={44} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} fill="url(#pfGrad2)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Sharpe Ratio', value: '1.84', sub: 'Risk-adjusted return', positive: true },
              { label: 'Max Drawdown', value: '-8.2%', sub: 'Peak to trough', positive: false },
              { label: 'Win Rate', value: '68%', sub: 'Profitable trades', positive: true },
              { label: 'Avg Hold Time', value: '4.2d', sub: 'Per position', positive: null },
            ].map(m => (
              <div key={m.label} className="rounded-lg border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>{m.label}</p>
                  <DevBadge />
                </div>
                <p className="text-xl font-bold tabular-nums font-mono" style={{ color: m.positive === true ? 'var(--positive)' : m.positive === false ? 'var(--negative)' : 'var(--foreground)' }}>
                  {m.value}
                </p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{m.sub}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--foreground)' }}>Position Performance</h3>
              <DevBadge label="Dev positions" />
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {positions.map(pos => {
                const isPos = pos.pnl >= 0;
                const barWidth = Math.min(Math.abs(pos.pnlPct) * 4, 100);
                const base = pos.symbol.split('/')[0];
                return (
                  <div key={pos.id} className="px-4 py-3 flex items-center gap-4">
                    <div className="flex items-center gap-2 w-24 shrink-0">
                      <AssetIcon symbol={pos.symbol} assetType="crypto" size={24} />
                      <div>
                        <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{base}</p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{pos.side.toUpperCase()}</p>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>Entry ${pos.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                        <span className={`text-xs font-semibold tabular-nums ${isPos ? 'text-positive' : 'text-negative'}`}>
                          {isPos ? '+' : ''}${pos.pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({isPos ? '+' : ''}{pos.pnlPct.toFixed(2)}%)
                        </span>
                      </div>
                      <div className="h-1 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--muted)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${barWidth}%`, backgroundColor: isPos ? 'var(--positive)' : 'var(--negative)' }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* History tab */}
      {activeTab === 'history' && (
        <TradeHistoryTable history={history} />
      )}
    </div>
  );
}