'use client';
import React, { useState, useEffect } from 'react';
import { useRealTimeMarket } from '@/hooks/useRealTimeMarket';
import { Star, Search, TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';
import MiniCandleChart from '@/components/trading/MiniCandleChart';
import Link from 'next/link';

interface WatchlistAsset {
  symbol: string;
  name: string;
  category: 'Crypto' | 'DeFi' | 'Layer1';
  basePrice: number;
  starred: boolean;
}

const DEFAULT_ASSETS: WatchlistAsset[] = [
  { symbol: 'BTC/USDC', name: 'Bitcoin', category: 'Crypto', basePrice: 67842, starred: true },
  { symbol: 'ETH/USDC', name: 'Ethereum', category: 'Crypto', basePrice: 3542, starred: true },
  { symbol: 'SOL/USDC', name: 'Solana', category: 'Crypto', basePrice: 182, starred: true },
  { symbol: 'BNB/USDC', name: 'BNB', category: 'Crypto', basePrice: 612, starred: false },
  { symbol: 'XRP/USDC', name: 'XRP', category: 'Crypto', basePrice: 0.62, starred: false },
  { symbol: 'ADA/USDC', name: 'Cardano', category: 'Layer1', basePrice: 0.48, starred: false },
  { symbol: 'AVAX/USDC', name: 'Avalanche', category: 'Layer1', basePrice: 38.4, starred: false },
  { symbol: 'DOT/USDC', name: 'Polkadot', category: 'Layer1', basePrice: 7.82, starred: false },
];

const LIVE_SYMBOLS = ['BTC/USDC', 'ETH/USDC', 'SOL/USDC', 'BNB/USDC', 'XRP/USDC', 'ADA/USDC', 'AVAX/USDC', 'DOT/USDC'];
const CATEGORIES = ['All', 'Starred', 'Crypto', 'Layer1', 'DeFi'] as const;
type Category = typeof CATEGORIES[number];

const STORAGE_KEY = 'cv-watchlist-starred';

export default function WatchlistContent() {
  const { quotes, candles } = useRealTimeMarket(LIVE_SYMBOLS);
  const [assets, setAssets] = useState<WatchlistAsset[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const starredSymbols: string[] = JSON.parse(saved);
          return DEFAULT_ASSETS.map(a => ({ ...a, starred: starredSymbols.includes(a.symbol) }));
        }
      } catch {}
    }
    return DEFAULT_ASSETS;
  });
  const [activeCategory, setActiveCategory] = useState<Category>('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'change'>('change');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const isLive = Object.keys(quotes).length > 0;

  const toggleStar = (symbol: string) => {
    setAssets(prev => {
      const next = prev.map(a => a.symbol === symbol ? { ...a, starred: !a.starred } : a);
      if (typeof localStorage !== 'undefined') {
        const starred = next.filter(a => a.starred).map(a => a.symbol);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(starred));
      }
      return next;
    });
  };

  const handleSort = (col: 'name' | 'price' | 'change') => {
    if (sortBy === col) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortDir('desc');
    }
  };

  const filtered = assets
    .filter(a => {
      if (activeCategory === 'Starred') return a.starred;
      if (activeCategory !== 'All') return a.category === activeCategory;
      return true;
    })
    .filter(a =>
      a.symbol.toLowerCase().includes(search.toLowerCase()) ||
      a.name.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const qa = quotes[a.symbol];
      const qb = quotes[b.symbol];
      let valA = 0, valB = 0;
      if (sortBy === 'name') { valA = a.name.charCodeAt(0); valB = b.name.charCodeAt(0); }
      else if (sortBy === 'price') { valA = qa?.price ?? a.basePrice; valB = qb?.price ?? b.basePrice; }
      else { valA = qa?.changePct24h ?? 0; valB = qb?.changePct24h ?? 0; }
      return sortDir === 'desc' ? valB - valA : valA - valB;
    });

  const starredCount = assets.filter(a => a.starred).length;

  return (
    <div className="py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Watchlist</h1>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {starredCount} starred · {assets.length} total assets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs" style={{
            backgroundColor: isLive ? 'rgba(34,197,94,0.1)' : 'rgba(245,196,0,0.08)',
            color: isLive ? '#22c55e' : 'var(--muted-foreground)',
          }}>
            <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-pulse'}`} />
            {isLive ? 'Live Prices' : 'Connecting…'}
          </div>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search assets…"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border outline-none transition-colors"
            style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
        </div>
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="px-3 py-2 text-xs rounded-lg font-medium transition-all shrink-0"
              style={{
                backgroundColor: activeCategory === cat ? 'rgba(245,196,0,0.15)' : 'var(--card)',
                color: activeCategory === cat ? 'var(--primary)' : 'var(--muted-foreground)',
                border: `1px solid ${activeCategory === cat ? 'var(--primary)' : 'var(--border)'}`,
              }}
            >
              {cat === 'Starred' ? `★ ${cat}` : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        {/* Table header */}
        <div className="grid px-4 py-2.5 border-b text-xs font-semibold uppercase tracking-wider"
          style={{ gridTemplateColumns: '2rem 1fr 7rem 7rem 8rem 7rem 6rem', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
          <span />
          <button className="text-left hover:text-foreground transition-colors" onClick={() => handleSort('name')}>
            Asset {sortBy === 'name' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
          </button>
          <button className="text-right hover:text-foreground transition-colors" onClick={() => handleSort('price')}>
            Price {sortBy === 'price' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
          </button>
          <button className="text-right hover:text-foreground transition-colors" onClick={() => handleSort('change')}>
            24h % {sortBy === 'change' ? (sortDir === 'desc' ? '↓' : '↑') : ''}
          </button>
          <span className="text-right hidden md:block">24h High/Low</span>
          <span className="text-right hidden lg:block">Chart</span>
          <span className="text-right">Action</span>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <BarChart2 size={32} style={{ color: 'var(--muted-foreground)', opacity: 0.4 }} />
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No assets found</p>
          </div>
        ) : (
          filtered.map((asset, idx) => {
            const q = quotes[asset.symbol];
            const liveCandles = candles[asset.symbol];
            const price = q?.price ?? asset.basePrice;
            const changePct = q?.changePct24h ?? 0;
            const change24h = q?.change24h ?? 0;
            const high24h = q?.high24h ?? price * 1.02;
            const low24h = q?.low24h ?? price * 0.98;
            const isPos = changePct >= 0;
            const hasCandles = liveCandles && liveCandles.length >= 2;

            return (
              <div
                key={asset.symbol}
                className="grid items-center px-4 py-3 border-b transition-colors hover:bg-white/[0.02] group"
                style={{
                  gridTemplateColumns: '2rem 1fr 7rem 7rem 8rem 7rem 6rem',
                  borderColor: idx < filtered.length - 1 ? 'var(--border)' : 'transparent',
                }}
              >
                {/* Star */}
                <button
                  onClick={() => toggleStar(asset.symbol)}
                  className="p-1 rounded transition-colors hover:bg-white/10"
                  style={{ color: asset.starred ? 'var(--primary)' : 'var(--muted-foreground)' }}
                >
                  <Star size={13} fill={asset.starred ? 'var(--primary)' : 'none'} />
                </button>

                {/* Asset name */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ backgroundColor: 'var(--muted)', color: 'var(--primary)' }}>
                      {asset.symbol.split('/')[0].slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{asset.symbol.split('/')[0]}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{asset.name}</p>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right">
                  <p className="text-sm font-bold tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>
                    ${price >= 1 ? price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : price.toFixed(5)}
                  </p>
                  {q && (
                    <p className="text-xs tabular-nums font-mono" style={{ color: isPos ? '#22c55e' : '#ef4444' }}>
                      {isPos ? '+' : ''}${Math.abs(change24h).toFixed(2)}
                    </p>
                  )}
                </div>

                {/* 24h % */}
                <div className="text-right">
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold tabular-nums`}
                    style={{
                      backgroundColor: isPos ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      color: isPos ? '#22c55e' : '#ef4444',
                    }}>
                    {isPos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {isPos ? '+' : ''}{changePct.toFixed(2)}%
                  </div>
                </div>

                {/* 24h High/Low */}
                <div className="text-right hidden md:block">
                  <p className="text-xs tabular-nums font-mono text-positive">
                    H: ${high24h >= 1 ? high24h.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : high24h.toFixed(5)}
                  </p>
                  <p className="text-xs tabular-nums font-mono text-negative">
                    L: ${low24h >= 1 ? low24h.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : low24h.toFixed(5)}
                  </p>
                </div>

                {/* Mini chart */}
                <div className="hidden lg:flex justify-end">
                  <div className="w-20 h-10">
                    {hasCandles ? (
                      <MiniCandleChart candles={liveCandles} width={80} height={40} />
                    ) : (
                      <div className="flex items-end gap-px w-full h-full">
                        {Array.from({ length: 10 }, (_, i) => (
                          <div
                            key={`sk-${asset.symbol}-${i}`}
                            className="flex-1 rounded-sm animate-pulse"
                            style={{
                              height: `${35 + Math.sin(i * 1.5) * 25}%`,
                              backgroundColor: isPos ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Trade button */}
                <div className="flex justify-end">
                  <Link
                    href="/trade-trading-workspace"
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all hover:opacity-90"
                    style={{ backgroundColor: 'rgba(245,196,0,0.15)', color: 'var(--primary)', border: '1px solid rgba(245,196,0,0.3)' }}
                  >
                    Trade
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Summary stats */}
      {isLive && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['BTC/USDC', 'ETH/USDC', 'SOL/USDC', 'BNB/USDC'].map(sym => {
            const q = quotes[sym];
            if (!q) return null;
            const isPos = q.changePct24h >= 0;
            return (
              <div key={sym} className="rounded-lg border p-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{sym.split('/')[0]}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                </div>
                <p className="text-sm font-bold tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>
                  ${q.price >= 1000 ? q.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : q.price.toFixed(4)}
                </p>
                <p className="text-xs font-semibold tabular-nums mt-0.5" style={{ color: isPos ? '#22c55e' : '#ef4444' }}>
                  {isPos ? '+' : ''}{q.changePct24h.toFixed(2)}%
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
