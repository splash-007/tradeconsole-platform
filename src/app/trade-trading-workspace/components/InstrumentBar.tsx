'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MarketInstrument } from '@/services/markets.service';
import type { QuoteState } from '@/hooks/useMarketQuotes';
import AssetIcon from '@/components/ui/AssetIcon';
import { ChevronDown, Star, Bell, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight } from 'lucide-react';

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

const termBg = '#000000';
const termSurface = '#080808';
const termBorder = '#1a1a1a';

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

  // Close dropdowns on outside click
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
      style={{ backgroundColor: termSurface, borderColor: termBorder, height: '50px' }}
    >
      {/* Symbol selector */}
      <div className="relative shrink-0" ref={symbolDropdownRef}>
        <button
          onClick={() => { setSymbolDropdownOpen(!symbolDropdownOpen); setMarketTypeOpen(false); }}
          className="flex items-center gap-2 px-2 py-1 rounded transition-colors hover:bg-white/5"
        >
          <AssetIcon symbol={selectedSymbol} assetType="crypto" size={26} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white">{selectedSymbol}</span>
              {realAvailable && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                  Live
                </span>
              )}
              <ChevronDown size={11} className={`text-gray-500 transition-transform ${symbolDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
          </div>
        </button>
        {symbolDropdownOpen && (
          <div
            className="absolute top-full left-0 mt-1 w-56 rounded-xl border shadow-2xl z-50 overflow-hidden animate-fade-in"
            style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a' }}
          >
            <div className="px-3 py-2 border-b" style={{ borderColor: '#1a1a1a' }}>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Select Instrument</p>
            </div>
            <div className="max-h-64 overflow-y-auto no-scrollbar">
              {instruments.filter(i => i.category === 'crypto').map(inst => (
                <button
                  key={`ib-drop-${inst.id}`}
                  onClick={() => { onSelectSymbol(inst.symbol); setSymbolDropdownOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-white/5"
                  style={{ backgroundColor: inst.symbol === selectedSymbol ? 'rgba(245,196,0,0.08)' : 'transparent' }}
                >
                  <AssetIcon symbol={inst.symbol} assetType="crypto" size={18} />
                  <span
                    className="font-semibold flex-1 text-left"
                    style={{ color: inst.symbol === selectedSymbol ? 'var(--primary)' : '#ffffff' }}
                  >
                    {inst.symbol}
                  </span>
                  <span className={`font-mono text-xs ${inst.changePct24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
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
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all hover:bg-white/5"
          style={{
            backgroundColor: marketTypeOpen ? 'rgba(245,196,0,0.08)' : '#111111',
            border: `1px solid ${marketTypeOpen ? 'rgba(245,196,0,0.3)' : '#2a2a2a'}`,
            color: marketTypeOpen ? 'var(--primary)' : '#9ca3af',
          }}
        >
          {selectedMarketType}
          <ChevronDown size={10} className={`transition-transform ${marketTypeOpen ? 'rotate-180' : ''}`} />
        </button>
        {marketTypeOpen && (
          <div
            className="absolute top-full left-0 mt-1 w-32 rounded-xl border shadow-2xl z-50 overflow-hidden animate-fade-in"
            style={{ backgroundColor: '#0d0d0d', borderColor: '#2a2a2a' }}
          >
            {MARKET_TYPES.map(mt => (
              <button
                key={`mt-${mt}`}
                onClick={() => { setSelectedMarketType(mt); setMarketTypeOpen(false); }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs transition-colors hover:bg-white/5"
                style={{ color: selectedMarketType === mt ? 'var(--primary)' : '#ffffff' }}
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

      <div className="w-px h-5 shrink-0" style={{ backgroundColor: termBorder }} />

      {/* Price metrics */}
      {instrument && (
        <div className="flex items-center gap-4 shrink-0">
          <div>
            <p className="text-xs text-gray-600">Last Price</p>
            <p className="text-sm font-bold tabular-nums font-mono leading-tight" style={{ color: isPos ? '#22c55e' : '#ef4444' }}>
              {price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs tabular-nums font-mono text-gray-600">
              ≈ {price.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">24h Change</p>
            <p className={`text-xs font-semibold tabular-nums ${isPos ? 'text-green-400' : 'text-red-400'}`}>
              {isPos ? '+' : ''}{((changePct / 100) * price).toFixed(2)}
            </p>
            <p className={`text-xs font-semibold tabular-nums ${isPos ? 'text-green-400' : 'text-red-400'}`}>
              {isPos ? '+' : ''}{changePct.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">24h High</p>
            <p className="text-xs font-semibold tabular-nums font-mono text-white">
              {high > 0 ? high.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600">24h Low</p>
            <p className="text-xs font-semibold tabular-nums font-mono text-white">
              {low > 0 ? low.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '—'}
            </p>
          </div>
          {bid != null && (
            <div>
              <p className="text-xs text-gray-600">Bid</p>
              <p className="text-xs font-semibold tabular-nums font-mono text-green-400">
                {bid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}
          {ask != null && (
            <div>
              <p className="text-xs text-gray-600">Ask</p>
              <p className="text-xs font-semibold tabular-nums font-mono text-red-400">
                {ask.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}
          <div>
            <p className="text-xs text-gray-600">24h Volume ({baseSymbol})</p>
            <p className="text-xs font-semibold tabular-nums font-mono text-white">
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
          style={{ backgroundColor: 'var(--primary)', color: '#000', boxShadow: '0 2px 8px rgba(212,168,0,0.3)' }}
        >
          <ArrowDownToLine size={11} />
          Deposit
        </button>
        <button
          onClick={() => router.push('/finance?tab=withdraw')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:bg-white/5"
          style={{ borderColor: '#2a2a2a', color: '#ffffff' }}
        >
          <ArrowUpFromLine size={11} />
          Withdraw
        </button>
        <button
          onClick={() => router.push('/finance?tab=transfer')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:bg-white/5"
          style={{ borderColor: '#2a2a2a', color: '#ffffff' }}
        >
          <ArrowLeftRight size={11} />
          Transfer
        </button>
        <button className="p-1.5 rounded-lg transition-colors ml-1 text-gray-600 hover:text-white">
          <Star size={13} />
        </button>
        <button className="p-1.5 rounded-lg transition-colors text-gray-600 hover:text-white">
          <Bell size={13} />
        </button>
      </div>
    </div>
  );
}