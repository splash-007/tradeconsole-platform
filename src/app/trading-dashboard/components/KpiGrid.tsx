import React from 'react';
import { DashboardOverview } from '@/services/dashboard.service';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface Props { overview: DashboardOverview; }

function formatCurrency(n: number) {
  if (n >= 1000) return `$${(n / 1000).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

function formatLarge(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(2)}K`;
  return `$${n.toFixed(2)}`;
}

export default function KpiGrid({ overview }: Props) {
  const isPositive = overview.portfolioChangePct24h >= 0;
  const isPnlPositive = overview.pnlPct24h >= 0;

  // Grid plan: 5 cards → hero spans 2 cols on xl (col-span-2) + 4 regular
  // xl: grid-cols-4 → row 1: hero(2) + 2 regular; row 2: 2 regular (but we do 1 row with hero+4 = 6 slots, hero takes 2)
  // Better: hero takes 2 cols, 4 regular take 1 each = 6 total in a 4-col grid → 2 rows
  // Row 1: hero(span-2) + 2 regular; Row 2: 2 regular → orphan issue
  // Fix: Use 3-col grid with hero span-2 + 1 regular in row 1, then 3 regular in row 2

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
      {/* Hero: Portfolio Value — spans 2 cols */}
      <div className="col-span-2 rounded-lg p-5 border relative overflow-hidden"
        style={{ backgroundColor: 'var(--card)', borderColor: isPositive ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)' }}>
        <div className="absolute inset-0 opacity-5" style={{
          background: isPositive
            ? 'radial-gradient(circle at 80% 50%, var(--positive), transparent 70%)'
            : 'radial-gradient(circle at 80% 50%, var(--negative), transparent 70%)'
        }} />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Portfolio Value</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)', opacity: 0.6 }}>Development data — not live account balance</p>
            </div>
            <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ backgroundColor: isPositive ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)' }}>
              <Wallet size={16} style={{ color: isPositive ? 'var(--positive)' : 'var(--negative)' }} />
            </div>
          </div>
          <p className="text-3xl font-bold tabular-nums mb-1" style={{ color: 'var(--foreground)' }}>
            ${overview.portfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-2">
            {isPositive ? <TrendingUp size={13} style={{ color: 'var(--positive)' }} /> : <TrendingDown size={13} style={{ color: 'var(--negative)' }} />}
            <span className="text-sm font-semibold tabular-nums" style={{ color: isPositive ? 'var(--positive)' : 'var(--negative)' }}>
              +${overview.portfolioChange24h.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({isPositive ? '+' : ''}{overview.portfolioChangePct24h.toFixed(2)}%)
            </span>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>24h</span>
          </div>
        </div>
      </div>

      {/* 24h P&L */}
      <div className="col-span-1 rounded-lg p-4 border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)' }}>24h P&L</p>
        <p className={`text-xl font-bold tabular-nums ${isPnlPositive ? 'text-positive' : 'text-negative'}`}>
          {isPnlPositive ? '+' : ''}${overview.pnl24h.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-xs mt-1 font-medium tabular-nums" style={{ color: isPnlPositive ? 'var(--positive)' : 'var(--negative)' }}>
          {isPnlPositive ? '+' : ''}{overview.pnlPct24h.toFixed(2)}%
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)', opacity: 0.6 }}>Development data</p>
      </div>

      {/* BTC Price */}
      <div className="col-span-1 rounded-lg p-4 border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)' }}>BTC/USDC</p>
        <p className="text-xl font-bold tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>
          ${overview.btcPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-xs mt-1 font-medium tabular-nums text-positive">+{overview.btcChangePct.toFixed(2)}%</p>
      </div>

      {/* Available Balance */}
      <div className="col-span-1 rounded-lg p-4 border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)' }}>Available</p>
        <p className="text-xl font-bold tabular-nums" style={{ color: 'var(--foreground)' }}>
          ${overview.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 0 })}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Development data</p>
      </div>

      {/* Open Positions */}
      <div className="col-span-1 rounded-lg p-4 border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)' }}>Open Positions</p>
        <p className="text-xl font-bold tabular-nums" style={{ color: 'var(--primary)' }}>{overview.openPositions}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Active trades</p>
      </div>
    </div>
  );
}