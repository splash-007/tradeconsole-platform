'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MarketInstrument } from '@/services/markets.service';
import type { QuoteState } from '@/hooks/useMarketQuotes';
import AssetIcon from '@/components/ui/AssetIcon';
import { ChevronDown, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight } from 'lucide-react';

interface Props {
  instrument?: MarketInstrument;
  instruments: MarketInstrument[];
  selectedSymbol: string;
  onSelectSymbol: (s: string) => void;
  liveQuotes?: Record<string, QuoteState>;
}

const WORKSPACE_TO_REAL: Record<string, string> = {
  'BTC/USDC': 'BTC/USD',
  'ETH/USDC': 'ETH/USD',
  'SOL/USDC': 'SOL/USD',
  'XRP/USDC': 'XRP/USD',
  'BNB/USDC': 'BNB/USD',
  'ADA/USDC': 'ADA/USD',
};

const MARKET_TYPES = ['Spot', 'Futures', 'Options'] as const;
type MarketType = typeof MARKET_TYPES[number];

export default function InstrumentBar({ instrument, instruments, selectedSymbol, onSelectSymbol, liveQuotes }: Props) {
  const [symbolDropdownOpen, setSymbolDropdownOpen] = useState(false);
  const [marketTypeOpen, setMarketTypeOpen] = useState(false);
  const [selectedMarketType, setSelectedMarketType] = useState<MarketType>('Spot');
  const symbolDropdownRef = useRef<HTMLDivElement>(null);
  const marketTypeRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const realSym = WORKSPACE_TO_REAL[selectedSymbol];
  const realState = realSym && liveQuotes ? liveQuotes[realSym] : undefined;
  const realAvailable = !!(realState?.available && realState.quote?.price != null);
  const realQuote = realState?.quote ?? null;

  const baseSymbol = selectedSymbol.split('/')[0];

  const price = realAvailable && realQuote?.price != null ? realQuote.price : (instrument?.lastPrice ?? 0);
  const changePct = realAvailable && realQuote?.changePercent != null ? realQuote.changePercent : (instrument?.changePct24h ?? 0);
  const high = realAvailable && realQuote?.high != null ? realQuote.high : (instrument?.high24h ?? 0);
  const low = realAvailable && realQuote?.low != null ? realQuote.low : (instrument?.low24h ?? 0);
  const bid = realAvailable && realQuote?.bid != null ? realQuote.bid : null;
  const ask = realAvailable && realQuote?.ask != null ? realQuote.ask : null;
  const volume = instrument?.volume24h ?? 0;
  const isPos = changePct >= 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (symbolDropdownRef.current && !symbolDropdownRef.current.contains(e.target as Node)) {
        setSymbolDropdownOpen(false);
      }
      if (marketTypeRef.current && !marketTypeRef.current.contains(e.target as Node)) {
        setMarketTypeOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      className="flex items-center gap-3 px-3 border-b shrink-0 overflow-x-auto no-scrollbar"
      style={{ backgroundColor: 'var(--tc-surface)', borderColor: 'var(--tc-border)', height: '54px' }}
    >
      {/* Symbol selector */}
      <div className="relative shrink-0" ref={symbolDropdownRef}>
        <button
          onClick={() => { setSymbolDropdownOpen(!symbolDropdownOpen); setMarketTypeOpen(false); }}
          className="flex items-center gap-2 px-2 py-1 rounded transition-colors"
          style={{ backgroundColor: symbolDropdownOpen ? 'rgba(201,160,0,0.08)' : 'transparent' }}
        >
          <AssetIcon symbol={selectedSymbol} assetType="crypto" size={28} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold" style={{ color: 'var(--tc-text-primary)' }}>{selectedSymbol}</span>
              {realAvailable && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-500">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                  Live
                </span>
              )}
              <ChevronDown size={11} className={`transition-transform ${symbolDropdownOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--tc-text-muted)' }} />
            </div>
          </div>
        </button>
        {symbolDropdownOpen && (
          <div
            className="absolute top-full left-0 mt-1 w-56 rounded-xl shadow-2xl overflow-hidden animate-fade-in"
            style={{ backgroundColor: 'var(--tc-surface)', border: '1px solid var(--tc-border)', zIndex: 200 }}
          >
            <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--tc-border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--tc-text-muted)' }}>Select Instrument</p>
            </div>
            <div className="max-h-64 overflow-y-auto no-scrollbar">
              {instruments.filter(i => i.category === 'crypto').map(inst => (
                <button
                  key={`ib-drop-${inst.id}`}
                  onClick={() => { onSelectSymbol(inst.symbol); setSymbolDropdownOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors"
                  style={{ backgroundColor: inst.symbol === selectedSymbol ? 'rgba(201,160,0,0.08)' : 'transparent' }}
                >
                  <AssetIcon symbol={inst.symbol} assetType="crypto" size={18} />
                  <span
                    className="font-semibold flex-1 text-left"
                    style={{ color: inst.symbol === selectedSymbol ? 'var(--primary)' : 'var(--tc-text-primary)' }}
                  >
                    {inst.symbol}
                  </span>
                  <span className={`font-mono text-xs ${inst.changePct24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {inst.changePct24h >= 0 ? '+' : ''}{inst.changePct24h.toFixed(2)}%
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Market Type (Spot) dropdown */}
      <div className="relative shrink-0" ref={marketTypeRef}>
        <button
          onClick={() => { setMarketTypeOpen(!marketTypeOpen); setSymbolDropdownOpen(false); }}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all"
          style={{
            backgroundColor: marketTypeOpen ? 'rgba(201,160,0,0.08)' : 'var(--tc-panel)',
            border: `1px solid ${marketTypeOpen ? 'rgba(201,160,0,0.4)' : 'var(--tc-border)'}`,
            color: marketTypeOpen ? 'var(--primary)' : 'var(--tc-text-secondary)',
          }}
        >
          {selectedMarketType}
          <ChevronDown size={10} className={`transition-transform ${marketTypeOpen ? 'rotate-180' : ''}`} />
        </button>
        {marketTypeOpen && (
          <div
            className="absolute top-full left-0 mt-1 w-32 rounded-xl shadow-2xl overflow-hidden animate-fade-in"
            style={{ backgroundColor: 'var(--tc-surface)', border: '1px solid var(--tc-border)', zIndex: 200 }}
          >
            {MARKET_TYPES.map(mt => (
              <button
                key={`mt-${mt}`}
                onClick={() => { setSelectedMarketType(mt); setMarketTypeOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2 text-sm transition-colors"
                style={{ color: selectedMarketType === mt ? 'var(--primary)' : 'var(--tc-text-primary)' }}
              >
                {mt}
                {selectedMarketType === mt && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: 'var(--primary)' }} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-5 shrink-0" style={{ backgroundColor: 'var(--tc-border)' }} />

      {/* Price metrics */}
      {instrument && (
        <div className="flex items-center gap-5 shrink-0">
          <div>
            <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--tc-text-muted)' }}>Last Price</p>
            <p className="text-sm font-bold tabular-nums font-mono leading-tight" style={{ color: isPos ? '#16a34a' : '#dc2626' }}>
              {price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs tabular-nums font-mono" style={{ color: 'var(--tc-text-muted)' }}>
              ≈ {price.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
            </p>
          </div>
          <div>
            <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--tc-text-muted)' }}>24h Change</p>
            <p className={`text-sm font-semibold tabular-nums ${isPos ? 'text-green-600' : 'text-red-600'}`}>
              {isPos ? '+' : ''}{((changePct / 100) * price).toFixed(2)}
            </p>
            <p className={`text-xs font-semibold tabular-nums ${isPos ? 'text-green-600' : 'text-red-600'}`}>
              {isPos ? '+' : ''}{changePct.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--tc-text-muted)' }}>24h High</p>
            <p className="text-sm font-semibold tabular-nums font-mono" style={{ color: 'var(--tc-text-primary)' }}>
              {high > 0 ? high.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--tc-text-muted)' }}>24h Low</p>
            <p className="text-sm font-semibold tabular-nums font-mono" style={{ color: 'var(--tc-text-primary)' }}>
              {low > 0 ? low.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}
            </p>
          </div>
          {bid != null && (
            <div>
              <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--tc-text-muted)' }}>Bid</p>
              <p className="text-sm font-semibold tabular-nums font-mono text-green-600">
                {bid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}
          {ask != null && (
            <div>
              <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--tc-text-muted)' }}>Ask</p>
              <p className="text-sm font-semibold tabular-nums font-mono text-red-600">
                {ask.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs font-medium mb-0.5" style={{ color: 'var(--tc-text-muted)' }}>24h Volume ({baseSymbol})</p>
            <p className="text-sm font-semibold tabular-nums font-mono" style={{ color: 'var(--tc-text-primary)' }}>
              {volume > 0 ? `${(volume / 1e6).toFixed(3)}M` : '—'}
            </p>
          </div>
        </div>
      )}

      <div className="flex-1" />

      {/* Action buttons */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => router.push('/finance?tab=deposit')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95"
          style={{ backgroundColor: 'var(--primary)', color: '#000', boxShadow: '0 2px 8px rgba(201,160,0,0.3)' }}
        >
          <ArrowDownToLine size={11} />
          Deposit
        </button>
        <button
          onClick={() => router.push('/finance?tab=withdraw')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
          style={{ borderColor: 'var(--tc-border)', color: 'var(--tc-text-primary)', backgroundColor: 'transparent' }}
        >
          <ArrowUpFromLine size={11} />
          Withdraw
        </button>
        <button
          onClick={() => router.push('/finance?tab=transfer')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
          style={{ borderColor: 'var(--tc-border)', color: 'var(--tc-text-primary)', backgroundColor: 'transparent' }}
        >
          <ArrowLeftRight size={11} />
          Transfer
        </button>
      </div>
    </div>
  );
}