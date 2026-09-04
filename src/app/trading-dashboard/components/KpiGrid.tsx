import React from 'react';
import { DashboardOverview } from '@/services/dashboard.service';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';

interface Props { overview: DashboardOverview; }


export default function KpiGrid({ overview }: Props) {
  const isPositive = overview.portfolioChangePct24h >= 0;
  const isPnlPositive = overview.pnlPct24h >= 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-3">
      {/* Hero: Portfolio Value — spans 2 cols */}
      <div
        className="col-span-2 rounded-2xl p-5 border relative overflow-hidden"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: isPositive ? 'rgba(34,197,94,0.20)' : 'rgba(239,68,68,0.20)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)',
        }}
      >
        <div className="absolute inset-0 opacity-[0.06]" style={{
          background: isPositive
            ? 'radial-gradient(circle at 85% 50%, var(--positive), transparent 65%)'
            : 'radial-gradient(circle at 85% 50%, var(--negative), transparent 65%)'
        }} />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>Portfolio Value</p>
            </div>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: isPositive ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)' }}>
              <Wallet size={16} style={{ color: isPositive ? 'var(--positive)' : 'var(--negative)' }} />
            </div>
          </div>
          <p className="text-3xl font-bold tabular-nums mb-1.5" style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
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
      <div className="col-span-1 rounded-2xl p-4 border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)' }}>24h P&L</p>
        <p className={`text-xl font-bold tabular-nums ${isPnlPositive ? 'text-positive' : 'text-negative'}`} style={{ letterSpacing: '-0.02em' }}>
          {isPnlPositive ? '+' : ''}${overview.pnl24h.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-xs mt-1 font-medium tabular-nums" style={{ color: isPnlPositive ? 'var(--positive)' : 'var(--negative)' }}>
          {isPnlPositive ? '+' : ''}{overview.pnlPct24h.toFixed(2)}%
        </p>
      </div>

      {/* BTC Price */}
      <div className="col-span-1 rounded-2xl p-4 border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)' }}>BTC/USDC</p>
        <p className="text-xl font-bold tabular-nums font-mono" style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
          ${overview.btcPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </p>
        <p className="text-xs mt-1 font-medium tabular-nums text-positive">+{overview.btcChangePct.toFixed(2)}%</p>
      </div>

      {/* Available Balance */}
      <div className="col-span-1 rounded-2xl p-4 border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)' }}>Available</p>
        <p className="text-xl font-bold tabular-nums" style={{ color: 'var(--foreground)', letterSpacing: '-0.02em' }}>
          ${overview.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 0 })}
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Cash balance</p>
      </div>

      {/* Open Positions */}
      <div className="col-span-1 rounded-2xl p-4 border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.04)' }}>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--muted-foreground)' }}>Open Positions</p>
        <p className="text-xl font-bold tabular-nums" style={{ color: 'var(--primary)', letterSpacing: '-0.02em' }}>{overview.openPositions}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Active trades</p>
      </div>
    </div>
  );
}