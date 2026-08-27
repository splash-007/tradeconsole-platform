'use client';
import React from 'react';
import Link from 'next/link';
import { Position } from '@/services/portfolio.service';
import { TrendingUp, TrendingDown, ExternalLink } from 'lucide-react';

interface Props { positions: Position[]; }

export default function PositionsTable({ positions }: Props) {
  return (
    <div className="rounded-lg border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Open Positions</h3>
        <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
          {positions.length}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Symbol', 'Side', 'Entry Price', 'Current', 'Size', 'Value', 'P&L', 'ROI%', 'Action'].map(h => (
                <th key={`pos-th-${h}`} className={`px-4 py-2.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${h === 'Symbol' || h === 'Side' ? 'text-left' : 'text-right'} last:text-center`}
                  style={{ color: 'var(--muted-foreground)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {positions.map(pos => {
              const isPnlPos = pos.pnl >= 0;
              return (
                <tr key={`pos-row-${pos.id}`} className="hover:bg-muted transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--muted)', color: 'var(--primary)' }}>
                        {pos.symbol.slice(0, 1)}
                      </div>
                      <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{pos.symbol}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${pos.side === 'long' ? 'bg-positive-subtle text-positive' : 'bg-negative-subtle text-negative'}`}>
                      {pos.side.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>
                      ${pos.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>
                      ${pos.currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>{pos.size}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>
                      ${pos.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-xs tabular-nums font-mono font-semibold ${isPnlPos ? 'text-positive' : 'text-negative'}`}>
                      {isPnlPos ? '+' : ''}${pos.pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className={`inline-flex items-center gap-1 text-xs font-semibold tabular-nums ${isPnlPos ? 'text-positive' : 'text-negative'}`}>
                      {isPnlPos ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                      {isPnlPos ? '+' : ''}{pos.pnlPct.toFixed(2)}%
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link href="/trade-trading-workspace" className="p-1.5 rounded hover:bg-muted transition-colors inline-flex" style={{ color: 'var(--muted-foreground)' }}>
                      <ExternalLink size={13} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}