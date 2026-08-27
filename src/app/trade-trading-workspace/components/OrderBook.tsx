'use client';
import React, { useState } from 'react';
import { OrderBook as OrderBookType } from '@/services/markets.service';

interface Props {
  orderBook: OrderBookType;
  currentPrice: number;
}

export default function OrderBook({ orderBook, currentPrice }: Props) {
  const [precision, setPrecision] = useState(2);

  const maxTotal = Math.max(
    ...orderBook.asks.map(a => a.total),
    ...orderBook.bids.map(b => b.total)
  );

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--card)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
        <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Order Book</span>
        <div className="flex items-center gap-1">
          {[1, 2].map(p => (
            <button
              key={`prec-${p}`}
              onClick={() => setPrecision(p)}
              className={`px-1.5 py-0.5 text-xs rounded transition-all ${precision === p ? 'bg-primary-subtle text-gold' : 'text-muted-foreground hover:bg-muted'}`}
            >
              .{p === 1 ? '0' : '00'}
            </button>
          ))}
        </div>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-3 px-3 py-1 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        {['Price', 'Amount', 'Total'].map(h => (
          <span key={`ob-hdr-${h}`} className="text-xs text-right last:text-right first:text-left" style={{ color: 'var(--muted-foreground)' }}>{h}</span>
        ))}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {/* Asks (sell) — red, shown top to bottom reversed */}
        <div className="flex-1 overflow-hidden flex flex-col justify-end min-h-0">
          {[...orderBook.asks].reverse().map((ask, idx) => {
            const depthPct = (ask.total / maxTotal) * 100;
            return (
              <div key={`ask-${idx}`} className="relative grid grid-cols-3 px-3 py-0.5 hover:bg-negative-subtle transition-colors cursor-pointer group">
                <div className="absolute right-0 top-0 h-full opacity-20" style={{ width: `${depthPct}%`, backgroundColor: 'var(--negative)' }} />
                <span className="text-xs font-mono tabular-nums text-negative z-10">{ask.price.toFixed(precision)}</span>
                <span className="text-xs font-mono tabular-nums text-right z-10" style={{ color: 'var(--foreground)' }}>{ask.amount.toFixed(4)}</span>
                <span className="text-xs font-mono tabular-nums text-right z-10" style={{ color: 'var(--muted-foreground)' }}>{(ask.total / 1000).toFixed(1)}K</span>
              </div>
            );
          })}
        </div>

        {/* Spread / current price */}
        <div className="flex items-center justify-between px-3 py-1.5 border-y shrink-0" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
          <span className="text-sm font-bold tabular-nums font-mono" style={{ color: 'var(--positive)' }}>
            {currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <div className="text-right">
            <p className="text-xs tabular-nums" style={{ color: 'var(--muted-foreground)' }}>
              Spread: {orderBook.spread.toFixed(2)}
            </p>
            <p className="text-xs tabular-nums" style={{ color: 'var(--muted-foreground)' }}>
              ({(orderBook.spreadPct * 100).toFixed(3)}%)
            </p>
          </div>
        </div>

        {/* Bids (buy) — green */}
        <div className="flex-1 overflow-hidden min-h-0">
          {orderBook.bids.map((bid, idx) => {
            const depthPct = (bid.total / maxTotal) * 100;
            return (
              <div key={`bid-${idx}`} className="relative grid grid-cols-3 px-3 py-0.5 hover:bg-positive-subtle transition-colors cursor-pointer">
                <div className="absolute right-0 top-0 h-full opacity-20" style={{ width: `${depthPct}%`, backgroundColor: 'var(--positive)' }} />
                <span className="text-xs font-mono tabular-nums text-positive z-10">{bid.price.toFixed(precision)}</span>
                <span className="text-xs font-mono tabular-nums text-right z-10" style={{ color: 'var(--foreground)' }}>{bid.amount.toFixed(4)}</span>
                <span className="text-xs font-mono tabular-nums text-right z-10" style={{ color: 'var(--muted-foreground)' }}>{(bid.total / 1000).toFixed(1)}K</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}