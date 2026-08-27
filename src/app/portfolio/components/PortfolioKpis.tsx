import React from 'react';
import { TrendingUp, TrendingDown, Wallet, BarChart2, Activity } from 'lucide-react';

interface Props {
  totalValue: number;
  pnl24h: number;
  pnlPct24h: number;
  totalRoi: number;
  openPositions: number;
}

export default function PortfolioKpis({ totalValue, pnl24h, pnlPct24h, totalRoi, openPositions }: Props) {
  const isPnlPos = pnl24h >= 0;
  const isRoiPos = totalRoi >= 0;

  const cards = [
    {
      id: 'total-value',
      label: 'Total Portfolio Value',
      value: `$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: 'Positions + Cash',
      icon: Wallet,
      color: 'var(--primary)',
      bgColor: 'rgba(245,196,0,0.08)',
      hero: true,
    },
    {
      id: 'unrealized-pnl',
      label: 'Unrealized P&L',
      value: `${isPnlPos ? '+' : ''}$${Math.abs(pnl24h).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      sub: `${isPnlPos ? '+' : ''}${pnlPct24h.toFixed(2)}% on open positions`,
      icon: isPnlPos ? TrendingUp : TrendingDown,
      color: isPnlPos ? 'var(--positive)' : 'var(--negative)',
      bgColor: isPnlPos ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
      hero: false,
    },
    {
      id: 'total-roi',
      label: 'Total ROI',
      value: `${isRoiPos ? '+' : ''}${totalRoi.toFixed(2)}%`,
      sub: 'Since first deposit',
      icon: BarChart2,
      color: isRoiPos ? 'var(--positive)' : 'var(--negative)',
      bgColor: 'var(--card)',
      hero: false,
    },
    {
      id: 'open-positions',
      label: 'Open Positions',
      value: openPositions.toString(),
      sub: 'Active trades',
      icon: Activity,
      color: 'var(--primary)',
      bgColor: 'var(--card)',
      hero: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
      {cards.map(card => (
        <div
          key={`pfkpi-${card.id}`}
          className="rounded-lg p-4 border"
          style={{ backgroundColor: card.bgColor === 'var(--card)' ? 'var(--card)' : card.bgColor, borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>{card.label}</p>
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ backgroundColor: `${card.color}20` }}>
              <card.icon size={14} style={{ color: card.color }} />
            </div>
          </div>
          <p className="text-2xl font-bold tabular-nums" style={{ color: card.hero ? 'var(--foreground)' : card.color }}>
            {card.value}
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{card.sub}</p>
        </div>
      ))}
    </div>
  );
}