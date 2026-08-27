'use client';
import React, { useState } from 'react';
import { MarketInstrument } from '@/services/markets.service';
import { ChevronDown, Star, Bell } from 'lucide-react';

interface Props {
  instrument?: MarketInstrument;
  instruments: MarketInstrument[];
  selectedSymbol: string;
  onSelectSymbol: (s: string) => void;
}

export default function InstrumentBar({ instrument, instruments, selectedSymbol, onSelectSymbol }: Props) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isPos = (instrument?.changePct24h || 0) >= 0;

  return (
    <div className="flex items-center gap-4 px-4 py-2 border-b shrink-0 overflow-x-auto no-scrollbar"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', height: '44px' }}>
      {/* Symbol selector */}
      <div className="relative shrink-0">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2 hover:bg-muted px-2 py-1 rounded transition-colors"
        >
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}>
            {selectedSymbol.slice(0, 1)}
          </div>
          <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{selectedSymbol}</span>
          <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>Spot</span>
          <ChevronDown size={12} style={{ color: 'var(--muted-foreground)' }} />
        </button>
        {dropdownOpen && (
          <div className="absolute top-full left-0 mt-1 w-48 rounded-lg border shadow-xl z-50 overflow-hidden animate-fade-in"
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
            <p className="text-base font-bold tabular-nums font-mono" style={{ color: isPos ? 'var(--positive)' : 'var(--negative)' }}>
              ${instrument.lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>24h Change</p>
            <p className={`text-xs font-semibold tabular-nums ${isPos ? 'text-positive' : 'text-negative'}`}>
              {isPos ? '+' : ''}{instrument.changePct24h.toFixed(2)}%
            </p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>24h High</p>
            <p className="text-xs font-semibold tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>
              ${instrument.high24h.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>24h Low</p>
            <p className="text-xs font-semibold tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>
              ${instrument.low24h.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>24h Volume</p>
            <p className="text-xs font-semibold tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>
              ${(instrument.volume24h / 1e9).toFixed(2)}B
            </p>
          </div>
        </div>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-1 shrink-0">
        <button className="p-1.5 rounded hover:bg-muted transition-colors" style={{ color: 'var(--muted-foreground)' }}>
          <Star size={14} />
        </button>
        <button className="p-1.5 rounded hover:bg-muted transition-colors" style={{ color: 'var(--muted-foreground)' }}>
          <Bell size={14} />
        </button>
      </div>
    </div>
  );
}