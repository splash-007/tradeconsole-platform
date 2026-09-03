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

export default function WatchlistPanel({ instruments, selectedSymbol, onSelectSymbol }: Props) {
  const [activeCategory, setActiveCategory] = useState<string>('Crypto');
  const [favorites, setFavorites] = useState<string[]>(['inst-btc', 'inst-eth', 'inst-sol']);

  const filtered = instruments.filter(i => {
    if (activeCategory === 'Crypto') return i.category === 'crypto';
    if (activeCategory === 'Forex') return i.category === 'forex';
    if (activeCategory === 'Indices') return i.category === 'indices';
    if (activeCategory === 'Commodities') return i.category === 'commodities';
    return true;
  });

  const toggleFav = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  // Map category to AssetType for AssetIcon
  const getAssetType = (category: string) => {
    if (category === 'Crypto') return 'crypto' as const;
    if (category === 'Forex') return 'forex' as const;
    if (category === 'Indices') return 'index' as const;
    if (category === 'Commodities') return 'commodity' as const;
    return 'crypto' as const;
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--card)' }}>
      {/* Header + tabs */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
        <span className="text-xs font-semibold mr-2" style={{ color: 'var(--foreground)' }}>Watchlist</span>
        {CATEGORIES.map(cat => (
          <button
            key={`wl-cat-${cat}`}
            onClick={() => setActiveCategory(cat)}
            className={`px-2 py-1 text-xs rounded transition-all ${activeCategory === cat ? 'bg-primary-subtle text-gold font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Column headers */}
      <div className="grid px-3 py-1 shrink-0" style={{ gridTemplateColumns: '1.5rem 1.5rem 1fr 5rem 5rem', borderBottom: '1px solid var(--border)' }}>
        <span />
        <span />
        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Symbol</span>
        <span className="text-xs text-right" style={{ color: 'var(--muted-foreground)' }}>Price</span>
        <span className="text-xs text-right" style={{ color: 'var(--muted-foreground)' }}>24h %</span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto no-scrollbar">
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>No instruments in this category</p>
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
                className={`grid items-center px-3 py-1.5 cursor-pointer transition-colors hover:bg-muted ${isSelected ? 'bg-primary-subtle' : ''}`}
                style={{ gridTemplateColumns: '1.5rem 1.5rem 1fr 5rem 5rem' }}
              >
                <button onClick={(e) => toggleFav(inst.id, e)} className="p-0.5 rounded" style={{ color: isFav ? 'var(--primary)' : 'var(--muted-foreground)' }}>
                  <Star size={11} fill={isFav ? 'var(--primary)' : 'none'} />
                </button>
                <AssetIcon symbol={inst.symbol} assetType={getAssetType(activeCategory)} size={18} />
                <div className="min-w-0 pl-1">
                  <p className="text-xs font-semibold truncate" style={{ color: isSelected ? 'var(--primary)' : 'var(--foreground)' }}>{inst.symbol}</p>
                </div>
                <p className="text-xs tabular-nums font-mono text-right" style={{ color: 'var(--foreground)' }}>
                  {inst.lastPrice < 10 ? inst.lastPrice.toFixed(4) : inst.lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className={`text-xs tabular-nums font-mono text-right font-semibold ${isPos ? 'text-positive' : 'text-negative'}`}>
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