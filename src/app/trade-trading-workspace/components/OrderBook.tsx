'use client';
import React, { useState } from 'react';
import { OrderBook as OrderBookType } from '@/services/markets.service';
import { ChevronDown } from 'lucide-react';

interface Props {
  orderBook: OrderBookType;
  currentPrice: number;
}

const PRECISION_OPTIONS = ['0.01', '0.1', '1'];

export default function OrderBook({ orderBook, currentPrice }: Props) {
  const [precisionIdx, setPrecisionIdx] = useState(0);

  const maxTotal = Math.max(
    ...orderBook.asks.map(a => a.total),
    ...orderBook.bids.map(b => b.total)
  );

  const precision = precisionIdx === 0 ? 2 : precisionIdx === 1 ? 1 : 0;

  // Bid/ask ratio
  const totalBids = orderBook.bids.reduce((s, b) => s + b.total, 0);
  const totalAsks = orderBook.asks.reduce((s, a) => s + a.total, 0);
  const bidPct = Math.round((totalBids / (totalBids + totalAsks)) * 100);
  const askPct = 100 - bidPct;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--card)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
        <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>Order Book</span>
        <button
          onClick={() => setPrecisionIdx((precisionIdx + 1) % PRECISION_OPTIONS.length)}
          className="flex items-center gap-1 px-1.5 py-0.5 text-xs rounded border transition-all hover:bg-muted"
          style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
        >
          {PRECISION_OPTIONS[precisionIdx]}
          <ChevronDown size={10} />
        </button>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-3 px-3 py-1 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Price (USDC)</span>
        <span className="text-xs text-right" style={{ color: 'var(--muted-foreground)' }}>Amount (BTC)</span>
        <span className="text-xs text-right" style={{ color: 'var(--muted-foreground)' }}>Total (USDC)</span>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {/* Asks (sell) — red, shown top to bottom reversed */}
        <div className="flex-1 overflow-hidden flex flex-col justify-end min-h-0">
          {[...orderBook.asks].reverse().map((ask, idx) => {
            const depthPct = (ask.total / maxTotal) * 100;
            return (
              <div key={`ask-${idx}`} className="relative grid grid-cols-3 px-3 py-0.5 hover:bg-negative-subtle transition-colors cursor-pointer">
                <div className="absolute right-0 top-0 h-full opacity-15" style={{ width: `${depthPct}%`, backgroundColor: 'var(--negative)' }} />
                <span className="text-xs font-mono tabular-nums text-negative z-10">{ask.price.toFixed(precision)}</span>
                <span className="text-xs font-mono tabular-nums text-right z-10" style={{ color: 'var(--foreground)' }}>{ask.amount.toFixed(6)}</span>
                <span className="text-xs font-mono tabular-nums text-right z-10" style={{ color: 'var(--muted-foreground)' }}>{ask.total.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
              </div>
            );
          })}
        </div>

        {/* Current price */}
        <div className="flex items-center justify-between px-3 py-2 border-y shrink-0" style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(255,255,255,0.03)' }}>
          <div>
            <p className="text-sm font-bold tabular-nums font-mono" style={{ color: 'var(--positive)' }}>
              {currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs tabular-nums font-mono" style={{ color: 'var(--muted-foreground)' }}>
              ≈ {currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
            </p>
          </div>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3L13 8L8 13" stroke="var(--positive)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 8H13" stroke="var(--positive)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>

        {/* Bids (buy) — green */}
        <div className="flex-1 overflow-hidden min-h-0">
          {orderBook.bids.map((bid, idx) => {
            const depthPct = (bid.total / maxTotal) * 100;
            return (
              <div key={`bid-${idx}`} className="relative grid grid-cols-3 px-3 py-0.5 hover:bg-positive-subtle transition-colors cursor-pointer">
                <div className="absolute right-0 top-0 h-full opacity-15" style={{ width: `${depthPct}%`, backgroundColor: 'var(--positive)' }} />
                <span className="text-xs font-mono tabular-nums text-positive z-10">{bid.price.toFixed(precision)}</span>
                <span className="text-xs font-mono tabular-nums text-right z-10" style={{ color: 'var(--foreground)' }}>{bid.amount.toFixed(6)}</span>
                <span className="text-xs font-mono tabular-nums text-right z-10" style={{ color: 'var(--muted-foreground)' }}>{bid.total.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bid/Ask ratio bar */}
      <div className="px-3 py-2 border-t shrink-0" style={{ borderColor: 'var(--border)' }}>
        <div className="flex rounded-full overflow-hidden h-1.5">
          <div style={{ width: `${bidPct}%`, backgroundColor: 'var(--positive)' }} />
          <div style={{ width: `${askPct}%`, backgroundColor: 'var(--negative)' }} />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs font-semibold text-positive">{bidPct}%</span>
          <span className="text-xs font-semibold text-negative">{askPct}% %</span>
        </div>
      </div>
    </div>
  );
}