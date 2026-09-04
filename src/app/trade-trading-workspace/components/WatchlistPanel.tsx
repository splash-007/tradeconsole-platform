'use client';
import React, { useState } from 'react';
import { MarketInstrument } from '@/services/markets.service';
import AssetIcon from '@/components/ui/AssetIcon';
import { Star } from 'lucide-react';

interface Props {
  instruments: MarketInstrument[];
  selectedSymbol: string;
  onSelectSymbol: (s: string) => void;
}

const CATEGORIES = ['Crypto', 'Forex', 'Indices', 'Commodities'] as const;

const termBg = '#000000';
const termSurface = '#080808';
const termBorder = '#1a1a1a';

export default function WatchlistPanel({ instruments, selectedSymbol, onSelectSymbol }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('Crypto');
  const [favorites, setFavorites] = useState<string[]>(['inst-btc', 'inst-eth', 'inst-sol']);

  // Show ALL instruments for each category (not just a few)
  const filtered = instruments.filter(i => {
    if (activeCategory === 'Crypto') return i.category === 'crypto';
    if (activeCategory === 'Forex') return i.category === 'forex';
    if (activeCategory === 'Indices') return i.category === 'indices';
    if (activeCategory === 'Commodities') return i.category === 'commodities' || i.category === 'metals' || i.category === 'energy';
    return true;
  });

  const toggleFav = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const getAssetType = (category: string) => {
    if (category === 'Crypto') return 'crypto' as const;
    if (category === 'Forex') return 'forex' as const;
    if (category === 'Indices') return 'index' as const;
    if (category === 'Commodities') return 'commodity' as const;
    return 'crypto' as const;
  };

  return (
    <div
      className="flex flex-col h-full rounded-xl overflow-hidden"
      style={{ backgroundColor: termBg, border: `1px solid ${termBorder}` }}
    >
      {/* Header + tabs */}
      <div
        className="flex items-center gap-1 px-3 py-2 border-b shrink-0"
        style={{ borderColor: termBorder, backgroundColor: termSurface }}
      >
        <span className="text-xs font-semibold text-white mr-2 tracking-wide uppercase">Watchlist</span>
        {CATEGORIES.map(cat => (
          <button
            key={`wl-cat-${cat}`}
            onClick={() => setActiveCategory(cat)}
            className="px-2 py-0.5 text-xs rounded transition-all"
            style={{
              backgroundColor: activeCategory === cat ? 'rgba(245,196,0,0.12)' : 'transparent',
              color: activeCategory === cat ? 'var(--primary)' : '#6b7280',
              fontWeight: activeCategory === cat ? 600 : 400,
              border: activeCategory === cat ? '1px solid rgba(245,196,0,0.3)' : '1px solid transparent',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Column headers */}
      <div
        className="grid px-3 py-1 shrink-0"
        style={{ gridTemplateColumns: '1.5rem 1.5rem 1fr 5rem 5rem', borderBottom: `1px solid ${termBorder}`, backgroundColor: termSurface }}
      >
        <span />
        <span />
        <span className="text-xs text-gray-600">Symbol</span>
        <span className="text-xs text-right text-gray-600">Price</span>
        <span className="text-xs text-right text-gray-600">24h %</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-gray-600">No instruments in this category</p>
          </div>
        ) : (
          filtered.map(inst => {
            const isPos = inst.changePct24h >= 0;
            const isSelected = inst.symbol === selectedSymbol;
            const isFav = favorites.includes(inst.id);
            return (
              <div
                key={`wl-${inst.id}`}
                onClick={() => onSelectSymbol(inst.symbol)}
                className="grid items-center px-3 py-1.5 cursor-pointer transition-colors hover:bg-white/5"
                style={{
                  gridTemplateColumns: '1.5rem 1.5rem 1fr 5rem 5rem',
                  backgroundColor: isSelected ? 'rgba(245,196,0,0.06)' : 'transparent',
                  borderBottom: `1px solid ${termBorder}`,
                }}
              >
                <button onClick={(e) => toggleFav(inst.id, e)} className="p-0.5 rounded" style={{ color: isFav ? 'var(--primary)' : '#333333' }}>
                  <Star size={11} fill={isFav ? 'var(--primary)' : 'none'} />
                </button>
                <AssetIcon symbol={inst.symbol} assetType={getAssetType(activeCategory)} size={16} />
                <div className="min-w-0 pl-1">
                  <p className="text-xs font-semibold truncate" style={{ color: isSelected ? 'var(--primary)' : '#ffffff' }}>{inst.symbol}</p>
                </div>
                <p className="text-xs tabular-nums font-mono text-right text-white">
                  {inst.lastPrice < 0.01 ? inst.lastPrice.toFixed(7) : inst.lastPrice < 10 ? inst.lastPrice.toFixed(4) : inst.lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className={`text-xs tabular-nums font-mono text-right font-semibold ${isPos ? 'text-green-400' : 'text-red-400'}`}>
                  {isPos ? '+' : ''}{inst.changePct24h.toFixed(2)}%
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}