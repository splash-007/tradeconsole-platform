'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MarketInstrument } from '@/services/markets.service';
import type { QuoteState } from '@/hooks/useMarketQuotes';
import { ChevronDown, Star, Bell, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight } from 'lucide-react';

interface Props {
  instrument?: MarketInstrument;
  instruments: MarketInstrument[];
  selectedSymbol: string;
  onSelectSymbol: (s: string) => void;
  liveQuotes?: Record<string, QuoteState>;
}

// Map workspace display symbols to real data symbols
const WORKSPACE_TO_REAL: Record<string, string> = {
  'BTC/USDC': 'BTC/USD',
  'ETH/USDC': 'ETH/USD',
  'SOL/USDC': 'SOL/USD',
  'XRP/USDC': 'XRP/USD',
  'BNB/USDC': 'BTC/USD',
  'ADA/USDC': 'BTC/USD',
};

export default function InstrumentBar({ instrument, instruments, selectedSymbol, onSelectSymbol, liveQuotes }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();

  // Resolve live quote from passed-in quotes (no duplicate hook)
  const realSym = WORKSPACE_TO_REAL[selectedSymbol];
  const realState = realSym && liveQuotes ? liveQuotes[realSym] : undefined;
  const realAvailable = !!(realState?.available && realState.quote?.price != null);
  const realQuote = realState?.quote ?? null;

  const baseSymbol = selectedSymbol.split('/')[0];

  // Prefer real data
  const price = realAvailable && realQuote?.price != null ? realQuote.price : (instrument?.lastPrice ?? 0);
  const changePct = realAvailable && realQuote?.changePercent != null ? realQuote.changePercent : (instrument?.changePct24h ?? 0);
  const high = realAvailable && realQuote?.high != null ? realQuote.high : (instrument?.high24h ?? 0);
  const low = realAvailable && realQuote?.low != null ? realQuote.low : (instrument?.low24h ?? 0);
  const bid = realAvailable && realQuote?.bid != null ? realQuote.bid : null;
  const ask = realAvailable && realQuote?.ask != null ? realQuote.ask : null;
  const volume = instrument?.volume24h ?? 0;
  const isPos = changePct >= 0;

  return (
    <div className="flex items-center gap-3 px-4 border-b shrink-0 overflow-x-auto no-scrollbar"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', height: '52px' }}>
      {/* Symbol selector */}
      <div className="relative shrink-0">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 hover:bg-muted px-2 py-1.5 rounded transition-colors"
        >
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
            {baseSymbol.slice(0, 1)}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{selectedSymbol}</span>
              <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>Spot</span>
              {realAvailable && (
                <span className="inline-flex items-center gap-1 text-xs font-medium" style={{ color: '#22c55e' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                  Live
                </span>
              )}
              <ChevronDown size={12} style={{ color: 'var(--muted-foreground)' }} />
            </div>
          </div>
        </button>
        {dropdownOpen && (
          <div className="absolute top-full left-0 mt-1 w-52 rounded-lg border shadow-xl z-50 overflow-hidden animate-fade-in"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            {instruments.slice(0, 8).map(inst => (
              <button
                key={`ib-drop-${inst.id}`}
                onClick={() => { onSelectSymbol(inst.symbol); setDropdownOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-muted transition-colors ${inst.symbol === selectedSymbol ? 'bg-primary-subtle' : ''}`}
              >
                <span className="font-semibold" style={{ color: inst.symbol === selectedSymbol ? 'var(--primary)' : 'var(--foreground)' }}>{inst.symbol}</span>
                <span className={`font-mono ${inst.changePct24h >= 0 ? 'text-positive' : 'text-negative'}`}>
                  {inst.changePct24h >= 0 ? '+' : ''}{inst.changePct24h.toFixed(2)}%
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-6 shrink-0" style={{ backgroundColor: 'var(--border)' }} />

      {/* Price metrics */}
      {instrument && (
        <div className="flex items-center gap-5 shrink-0">
          <div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Last Price</p>
            <p className="text-base font-bold tabular-nums font-mono leading-tight" style={{ color: isPos ? 'var(--positive)' : 'var(--negative)' }}>
              {price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs tabular-nums font-mono" style={{ color: 'var(--muted-foreground)' }}>
              ≈ {price.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
            </p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>24h Change</p>
            <p className={`text-sm font-semibold tabular-nums ${isPos ? 'text-positive' : 'text-negative'}`}>
              {isPos ? '+' : ''}{((changePct / 100) * price).toFixed(2)}
            </p>
            <p className={`text-xs font-semibold tabular-nums ${isPos ? 'text-positive' : 'text-negative'}`}>
              {isPos ? '+' : ''}{changePct.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>24h High</p>
            <p className="text-sm font-semibold tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>
              {high > 0 ? high.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>24h Low</p>
            <p className="text-sm font-semibold tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>
              {low > 0 ? low.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}
            </p>
          </div>
          {bid != null && (
            <div>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Bid</p>
              <p className="text-sm font-semibold tabular-nums font-mono" style={{ color: '#22c55e' }}>
                {bid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}
          {ask != null && (
            <div>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Ask</p>
              <p className="text-sm font-semibold tabular-nums font-mono" style={{ color: '#ef4444' }}>
                {ask.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>24h Volume ({baseSymbol})</p>
            <p className="text-sm font-semibold tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>
              {volume > 0 ? `${(volume / 1e6).toFixed(3)}M` : '—'}
            </p>
          </div>
        </div>
      )}

      <div className="flex-1" />

      {/* Action buttons — navigate to Funds Center */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => router.push('/finance?tab=deposit')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all active:scale-95"
          style={{ backgroundColor: 'var(--primary)', color: '#000' }}
        >
          <ArrowDownToLine size={12} />
          Deposit
        </button>
        <button
          onClick={() => router.push('/finance?tab=withdraw')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-all hover:bg-muted"
          style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
        >
          <ArrowUpFromLine size={12} />
          Withdraw
        </button>
        <button
          onClick={() => router.push('/finance?tab=transfer')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-all hover:bg-muted"
          style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
        >
          <ArrowLeftRight size={12} />
          Transfer
        </button>
        <button className="p-1.5 rounded hover:bg-muted transition-colors ml-1" style={{ color: 'var(--muted-foreground)' }}>
          <Star size={14} />
        </button>
        <button className="p-1.5 rounded hover:bg-muted transition-colors" style={{ color: 'var(--muted-foreground)' }}>
          <Bell size={14} />
        </button>
      </div>
    </div>
  );
}