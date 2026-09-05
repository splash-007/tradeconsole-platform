'use client';
import React, { useState } from 'react';
import { Users, TrendingUp, TrendingDown, Star, StarOff, Copy, Search, Filter, ChevronRight, Zap, Award, Clock, DollarSign, Percent, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Trader {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  badge: 'Elite' | 'Pro' | 'Verified' | null;
  followers: number;
  copiers: number;
  aum: number;
  pnl30d: number;
  pnlPct30d: number;
  pnlTotal: number;
  pnlPctTotal: number;
  winRate: number;
  maxDrawdown: number;
  avgTrade: number;
  markets: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  description: string;
  joined: string;
  isFavorite: boolean;
}

interface CopyPosition {
  id: string;
  traderId: string;
  traderName: string;
  allocated: number;
  currentValue: number;
  pnl: number;
  pnlPct: number;
  status: 'active' | 'paused' | 'stopped';
  since: string;
  trades: number;
}

const MOCK_TRADERS: Trader[] = [
  {
    id: 't1', name: 'Marcus Chen', initials: 'MC', avatarColor: '#D4A800',
    badge: 'Elite', followers: 12840, copiers: 3241, aum: 4200000,
    pnl30d: 18420, pnlPct30d: 12.4, pnlTotal: 284000, pnlPctTotal: 187.3,
    winRate: 74.2, maxDrawdown: 8.1, avgTrade: 2.3,
    markets: ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'],
    riskLevel: 'Medium', joined: '2021-03-12',
    description: 'Systematic momentum trader with 5+ years in crypto. Focuses on high-liquidity pairs with strict risk controls.',
    isFavorite: true,
  },
  {
    id: 't2', name: 'Sofia Reyes', initials: 'SR', avatarColor: '#8b5cf6',
    badge: 'Pro', followers: 7320, copiers: 1890, aum: 1800000,
    pnl30d: 9100, pnlPct30d: 8.7, pnlTotal: 142000, pnlPctTotal: 134.6,
    winRate: 68.5, maxDrawdown: 11.4, avgTrade: 1.8,
    markets: ['EUR/USD', 'GBP/USD', 'XAU/USD'],
    riskLevel: 'Low', joined: '2022-01-08',
    description: 'Forex specialist with a conservative approach. Prioritises capital preservation with consistent monthly returns.',
    isFavorite: false,
  },
  {
    id: 't3', name: 'James Okafor', initials: 'JO', avatarColor: '#22c55e',
    badge: 'Verified', followers: 4210, copiers: 980, aum: 920000,
    pnl30d: 22800, pnlPct30d: 21.3, pnlTotal: 98000, pnlPctTotal: 91.4,
    winRate: 61.0, maxDrawdown: 18.7, avgTrade: 4.1,
    markets: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'SOL/USDT'],
    riskLevel: 'High', joined: '2022-09-15',
    description: 'Aggressive growth strategy using technical breakouts. High reward potential with elevated drawdown tolerance.',
    isFavorite: false,
  },
  {
    id: 't4', name: 'Priya Nair', initials: 'PN', avatarColor: '#f59e0b',
    badge: 'Pro', followers: 5680, copiers: 1420, aum: 2100000,
    pnl30d: 7340, pnlPct30d: 6.2, pnlTotal: 176000, pnlPctTotal: 148.9,
    winRate: 71.8, maxDrawdown: 9.3, avgTrade: 1.5,
    markets: ['XAU/USD', 'BTC/USDT', 'ETH/USDT'],
    riskLevel: 'Low', joined: '2021-11-20',
    description: 'Multi-asset portfolio manager blending crypto and commodities. Consistent low-volatility returns.',
    isFavorite: true,
  },
  {
    id: 't5', name: 'Luca Ferretti', initials: 'LF', avatarColor: '#ef4444',
    badge: 'Elite', followers: 9100, copiers: 2640, aum: 3400000,
    pnl30d: 14200, pnlPct30d: 10.8, pnlTotal: 312000, pnlPctTotal: 241.5,
    winRate: 69.4, maxDrawdown: 13.2, avgTrade: 2.9,
    markets: ['BTC/USDT', 'ETH/USDT', 'XRP/USDT'],
    riskLevel: 'Medium', joined: '2020-07-04',
    description: 'Veteran algorithmic trader. Combines on-chain analytics with technical signals for high-conviction entries.',
    isFavorite: false,
  },
  {
    id: 't6', name: 'Aisha Kamara', initials: 'AK', avatarColor: '#06b6d4',
    badge: 'Verified', followers: 3120, copiers: 640, aum: 580000,
    pnl30d: 5800, pnlPct30d: 7.9, pnlTotal: 64000, pnlPctTotal: 87.2,
    winRate: 65.3, maxDrawdown: 10.8, avgTrade: 1.9,
    markets: ['EUR/USD', 'GBP/USD', 'BTC/USDT'],
    riskLevel: 'Low', joined: '2023-02-14',
    description: 'Rising star in FX and crypto. Disciplined risk management with a focus on trending markets.',
    isFavorite: false,
  },
];

const MOCK_POSITIONS: CopyPosition[] = [
  {
    id: 'cp1', traderId: 't1', traderName: 'Marcus Chen',
    allocated: 5000, currentValue: 5620, pnl: 620, pnlPct: 12.4,
    status: 'active', since: '2026-07-15', trades: 38,
  },
  {
    id: 'cp2', traderId: 't4', traderName: 'Priya Nair',
    allocated: 3000, currentValue: 3186, pnl: 186, pnlPct: 6.2,
    status: 'active', since: '2026-08-01', trades: 14,
  },
];

const BADGE_STYLES: Record<string, { bg: string; color: string; icon: React.ElementType }> = {
  Elite: { bg: 'rgba(212,168,0,0.15)', color: '#D4A800', icon: Award },
  Pro: { bg: 'rgba(139,92,246,0.15)', color: '#8b5cf6', icon: Zap },
  Verified: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', icon: CheckCircle },
};

const RISK_COLORS: Record<string, string> = { Low: '#22c55e', Medium: '#f59e0b', High: '#ef4444' };

type TabKey = 'discover' | 'copying' | 'favorites';
type SortKey = 'pnl30d' | 'winRate' | 'copiers' | 'maxDrawdown';
type RiskFilter = 'all' | 'Low' | 'Medium' | 'High';

function formatAUM(n: number) {
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n}`;
}

function TraderCard({
  trader,
  onToggleFavorite,
  onCopy,
}: {
  trader: Trader;
  onToggleFavorite: (id: string) => void;
  onCopy: (trader: Trader) => void;
}) {
  const isPos = trader.pnlPct30d >= 0;
  const badge = trader.badge ? BADGE_STYLES[trader.badge] : null;
  const BadgeIcon = badge?.icon;

  return (
    <div
      className="rounded-2xl border p-5 flex flex-col gap-4 transition-all hover:shadow-lg"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0"
            style={{ background: `linear-gradient(135deg, ${trader.avatarColor}cc, ${trader.avatarColor}66)`, color: '#fff', boxShadow: `0 2px 8px ${trader.avatarColor}40` }}
          >
            {trader.initials}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{trader.name}</span>
              {badge && BadgeIcon && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: badge.bg, color: badge.color }}>
                  <BadgeIcon size={10} /> {trader.badge}
                </span>
              )}
            </div>
            <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--muted-foreground)' }}>
              {trader.copiers.toLocaleString()} copiers · {formatAUM(trader.aum)} AUM
            </p>
          </div>
        </div>
        <button
          onClick={() => onToggleFavorite(trader.id)}
          className="p-1.5 rounded-lg hover:bg-muted transition-all shrink-0"
          style={{ color: trader.isFavorite ? '#D4A800' : 'var(--muted-foreground)' }}
        >
          {trader.isFavorite ? <Star size={14} fill="currentColor" /> : <StarOff size={14} />}
        </button>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--muted)' }}>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>30D Return</p>
          <p className="text-base font-bold tabular-nums font-mono" style={{ color: isPos ? '#22c55e' : '#ef4444' }}>
            {isPos ? '+' : ''}{trader.pnlPct30d.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--muted)' }}>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Win Rate</p>
          <p className="text-base font-bold tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>{trader.winRate.toFixed(1)}%</p>
        </div>
        <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--muted)' }}>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Max Drawdown</p>
          <p className="text-base font-bold tabular-nums font-mono" style={{ color: '#ef4444' }}>-{trader.maxDrawdown.toFixed(1)}%</p>
        </div>
        <div className="rounded-xl p-3" style={{ backgroundColor: 'var(--muted)' }}>
          <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>Risk Level</p>
          <p className="text-base font-bold capitalize" style={{ color: RISK_COLORS[trader.riskLevel] }}>{trader.riskLevel}</p>
        </div>
      </div>

      {/* Markets */}
      <div className="flex flex-wrap gap-1.5">
        {trader.markets.map(m => (
          <span key={m} className="px-2 py-0.5 rounded-lg text-xs font-mono font-semibold" style={{ backgroundColor: 'rgba(212,168,0,0.10)', color: 'var(--primary)' }}>{m}</span>
        ))}
      </div>

      {/* Description */}
      <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{trader.description}</p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
          <Clock size={11} />
          <span>Since {new Date(trader.joined).getFullYear()}</span>
        </div>
        <button
          onClick={() => onCopy(trader)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all hover:opacity-90 active:scale-95"
          style={{ background: 'linear-gradient(135deg, #D4A800 0%, #B88E00 100%)', color: '#000', boxShadow: '0 2px 8px rgba(212,168,0,0.30)' }}
        >
          <Copy size={11} /> Copy Trader
        </button>
      </div>
    </div>
  );
}

function CopyModal({ trader, onClose, onConfirm }: { trader: Trader; onClose: () => void; onConfirm: (amount: number) => void }) {
  const [amount, setAmount] = useState('1000');
  const [stopLoss, setStopLoss] = useState('20');
  const parsed = parseFloat(amount) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }} />
      <div
        className="relative w-full max-w-md rounded-2xl border p-6 space-y-5 animate-fade-in"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>Copy {trader.name}</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Set your copy parameters</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted" style={{ color: 'var(--muted-foreground)' }}>
            <XCircle size={16} />
          </button>
        </div>

        <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: 'var(--muted)' }}>
          <div className="flex justify-between text-xs">
            <span style={{ color: 'var(--muted-foreground)' }}>30D Return</span>
            <span className="font-bold font-mono" style={{ color: '#22c55e' }}>+{trader.pnlPct30d.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: 'var(--muted-foreground)' }}>Win Rate</span>
            <span className="font-bold font-mono" style={{ color: 'var(--foreground)' }}>{trader.winRate.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between text-xs">
            <span style={{ color: 'var(--muted-foreground)' }}>Max Drawdown</span>
            <span className="font-bold font-mono" style={{ color: '#ef4444' }}>-{trader.maxDrawdown.toFixed(1)}%</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--foreground)' }}>Copy Amount (USD)</label>
            <div className="relative">
              <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border text-sm font-mono focus:outline-none focus:ring-2"
                style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)', focusRingColor: 'var(--primary)' }}
                min="100"
              />
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Minimum $100</p>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--foreground)' }}>Stop Loss (%)</label>
            <div className="relative">
              <Percent size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="number"
                value={stopLoss}
                onChange={e => setStopLoss(e.target.value)}
                className="w-full pl-8 pr-4 py-2.5 rounded-xl border text-sm font-mono focus:outline-none"
                style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                min="5"
                max="50"
              />
            </div>
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Auto-stop if copy loses {stopLoss}% of allocated amount</p>
          </div>
        </div>

        <div className="rounded-xl p-3 flex items-start gap-2.5" style={{ backgroundColor: 'rgba(212,168,0,0.08)', border: '1px solid rgba(212,168,0,0.2)' }}>
          <AlertCircle size={13} className="shrink-0 mt-0.5" style={{ color: '#D4A800' }} />
          <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
            Copy trading involves risk. Past performance does not guarantee future results. Only invest what you can afford to lose.
          </p>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-muted" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
            Cancel
          </button>
          <button
            onClick={() => onConfirm(parsed)}
            disabled={parsed < 100}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #D4A800 0%, #B88E00 100%)', color: '#000', boxShadow: '0 2px 8px rgba(212,168,0,0.30)' }}
          >
            Start Copying
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CopyTradingContent() {
  const [tab, setTab] = useState<TabKey>('discover');
  const [traders, setTraders] = useState<Trader[]>(MOCK_TRADERS);
  const [positions, setPositions] = useState<CopyPosition[]>(MOCK_POSITIONS);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<SortKey>('pnl30d');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('all');
  const [copyTarget, setCopyTarget] = useState<Trader | null>(null);

  const handleToggleFavorite = (id: string) => {
    setTraders(prev => prev.map(t => t.id === id ? { ...t, isFavorite: !t.isFavorite } : t));
  };

  const handleCopyConfirm = (amount: number) => {
    if (!copyTarget) return;
    const newPos: CopyPosition = {
      id: `cp${Date.now()}`,
      traderId: copyTarget.id,
      traderName: copyTarget.name,
      allocated: amount,
      currentValue: amount,
      pnl: 0,
      pnlPct: 0,
      status: 'active',
      since: new Date().toISOString().split('T')[0],
      trades: 0,
    };
    setPositions(prev => [...prev, newPos]);
    setCopyTarget(null);
    setTab('copying');
  };

  const handleStopCopy = (id: string) => {
    setPositions(prev => prev.map(p => p.id === id ? { ...p, status: 'stopped' as const } : p));
  };

  const filteredTraders = traders
    .filter(t => {
      if (tab === 'favorites') return t.isFavorite;
      return true;
    })
    .filter(t => {
      if (!search) return true;
      return t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.markets.some(m => m.toLowerCase().includes(search.toLowerCase()));
    })
    .filter(t => riskFilter === 'all' || t.riskLevel === riskFilter)
    .sort((a, b) => {
      if (sortBy === 'pnl30d') return b.pnlPct30d - a.pnlPct30d;
      if (sortBy === 'winRate') return b.winRate - a.winRate;
      if (sortBy === 'copiers') return b.copiers - a.copiers;
      if (sortBy === 'maxDrawdown') return a.maxDrawdown - b.maxDrawdown;
      return 0;
    });

  const totalAllocated = positions.filter(p => p.status === 'active').reduce((s, p) => s + p.allocated, 0);
  const totalPnl = positions.filter(p => p.status === 'active').reduce((s, p) => s + p.pnl, 0);
  const activeCopies = positions.filter(p => p.status === 'active').length;

  return (
    <div className="py-6 space-y-6">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Copy Trading</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-foreground)' }}>Mirror top traders automatically and grow your portfolio</p>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Active Copies', value: activeCopies.toString(), icon: Copy, color: '#D4A800' },
          { label: 'Total Allocated', value: `$${totalAllocated.toLocaleString()}`, icon: DollarSign, color: '#3b82f6' },
          { label: 'Total P&L', value: totalPnl >= 0 ? `+$${totalPnl.toFixed(2)}` : `-$${Math.abs(totalPnl).toFixed(2)}`, icon: totalPnl >= 0 ? TrendingUp : TrendingDown, color: totalPnl >= 0 ? '#22c55e' : '#ef4444' },
          { label: 'Top Traders', value: traders.filter(t => t.badge === 'Elite').length.toString(), icon: Award, color: '#f59e0b' },
        ].map(kpi => (
          <div key={kpi.label} className="rounded-2xl border p-4 flex items-center gap-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${kpi.color}18` }}>
              <kpi.icon size={18} style={{ color: kpi.color }} />
            </div>
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{kpi.label}</p>
              <p className="text-base font-bold tabular-nums font-mono mt-0.5" style={{ color: 'var(--foreground)' }}>{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ backgroundColor: 'var(--muted)' }}>
        {([
          { key: 'discover', label: 'Discover Traders' },
          { key: 'copying', label: `Copying (${activeCopies})` },
          { key: 'favorites', label: 'Favorites' },
        ] as { key: TabKey; label: string }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              backgroundColor: tab === t.key ? 'var(--card)' : 'transparent',
              color: tab === t.key ? 'var(--primary)' : 'var(--muted-foreground)',
              boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Discover / Favorites tab content */}
      {(tab === 'discover' || tab === 'favorites') && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-48">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                placeholder="Search traders or markets…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-8 pr-4 py-2 rounded-xl border text-sm focus:outline-none"
                style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={13} style={{ color: 'var(--muted-foreground)' }} />
              <select
                value={riskFilter}
                onChange={e => setRiskFilter(e.target.value as RiskFilter)}
                className="text-xs rounded-xl border px-3 py-2 focus:outline-none"
                style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                <option value="all">All Risk Levels</option>
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
              </select>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortKey)}
                className="text-xs rounded-xl border px-3 py-2 focus:outline-none"
                style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                <option value="pnl30d">Sort: 30D Return</option>
                <option value="winRate">Sort: Win Rate</option>
                <option value="copiers">Sort: Copiers</option>
                <option value="maxDrawdown">Sort: Low Drawdown</option>
              </select>
            </div>
          </div>

          {filteredTraders.length === 0 ? (
            <div className="rounded-2xl border py-16 text-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <Users size={32} className="mx-auto mb-3" style={{ color: 'var(--muted-foreground)' }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>No traders found</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Try adjusting your filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredTraders.map(trader => (
                <TraderCard
                  key={trader.id}
                  trader={trader}
                  onToggleFavorite={handleToggleFavorite}
                  onCopy={setCopyTarget}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Copying tab */}
      {tab === 'copying' && (
        <div className="space-y-4">
          {positions.length === 0 ? (
            <div className="rounded-2xl border py-16 text-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <Copy size={32} className="mx-auto mb-3" style={{ color: 'var(--muted-foreground)' }} />
              <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>No active copies</p>
              <p className="text-xs mt-1 mb-4" style={{ color: 'var(--muted-foreground)' }}>Discover top traders and start copying</p>
              <button
                onClick={() => setTab('discover')}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #D4A800 0%, #B88E00 100%)', color: '#000' }}
              >
                <Users size={13} /> Discover Traders <ChevronRight size={13} />
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {positions.map(pos => {
                const isPos = pos.pnl >= 0;
                const isStopped = pos.status === 'stopped';
                return (
                  <div
                    key={pos.id}
                    className="rounded-2xl border p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                    style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', opacity: isStopped ? 0.6 : 1 }}
                  >
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{pos.traderName}</span>
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
                          style={{
                            backgroundColor: pos.status === 'active' ? 'rgba(34,197,94,0.12)' : 'rgba(107,114,128,0.12)',
                            color: pos.status === 'active' ? '#22c55e' : '#6b7280',
                          }}
                        >
                          {pos.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {[
                          { label: 'Allocated', value: `$${pos.allocated.toLocaleString()}` },
                          { label: 'Current Value', value: `$${pos.currentValue.toLocaleString()}` },
                          { label: 'P&L', value: `${isPos ? '+' : ''}$${pos.pnl.toFixed(2)} (${isPos ? '+' : ''}${pos.pnlPct.toFixed(2)}%)`, color: isPos ? '#22c55e' : '#ef4444' },
                          { label: 'Trades Copied', value: pos.trades.toString() },
                        ].map(item => (
                          <div key={item.label}>
                            <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{item.label}</p>
                            <p className="text-sm font-bold tabular-nums font-mono mt-0.5" style={{ color: item.color ?? 'var(--foreground)' }}>{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    {!isStopped && (
                      <button
                        onClick={() => handleStopCopy(pos.id)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all hover:opacity-90 shrink-0"
                        style={{ backgroundColor: 'rgba(239,68,68,0.10)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}
                      >
                        <XCircle size={12} /> Stop Copying
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Copy modal */}
      {copyTarget && (
        <CopyModal
          trader={copyTarget}
          onClose={() => setCopyTarget(null)}
          onConfirm={handleCopyConfirm}
        />
      )}
    </div>
  );
}
