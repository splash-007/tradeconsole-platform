'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { marketsService, MarketInstrument } from '@/services/markets.service';
import { watchlistService } from '@/services/watchlist.service';
import { Search, TrendingUp, TrendingDown, Star, ExternalLink } from 'lucide-react';
import Link from 'next/link';

type CategoryKey = 'forex' | 'indices' | 'commodities' | 'metals' | 'energy' | 'shares' | 'crypto';

const CATEGORIES: { key: CategoryKey; label: string; icon: string }[] = [
  { key: 'forex', label: 'Forex', icon: '💱' },
  { key: 'indices', label: 'Indices', icon: '📊' },
  { key: 'commodities', label: 'Commodities', icon: '🌾' },
  { key: 'metals', label: 'Metals', icon: '🥇' },
  { key: 'energy', label: 'Energy', icon: '⚡' },
  { key: 'shares', label: 'Shares', icon: '🏢' },
  { key: 'crypto', label: 'Cryptocurrencies', icon: '₿' },
];

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: 'Open', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  closed: { label: 'Closed', color: '#6b7280', bg: 'rgba(107,114,128,0.12)' },
  'pre-market': { label: 'Pre-Market', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  'after-hours': { label: 'After Hours', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
};

// Asset icon mapping — recognizable logos/symbols per instrument
const ASSET_ICONS: Record<string, { type: 'img' | 'text' | 'flag'; value: string; bg?: string; color?: string }> = {
  // Crypto — CoinGecko-style icons via public CDN
  'BTC/USDT': { type: 'img', value: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png' },
  'ETH/USDT': { type: 'img', value: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png' },
  'SOL/USDT': { type: 'img', value: 'https://assets.coingecko.com/coins/images/4128/small/solana.png' },
  'XRP/USDT': { type: 'img', value: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png' },
  'BNB/USDT': { type: 'img', value: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png' },
  // Shares — company logos
  'AAPL': { type: 'text', value: '🍎', bg: '#f3f4f6', color: '#111' },
  'MSFT': { type: 'text', value: '⊞', bg: '#e8f0fe', color: '#0078d4' },
  'NVDA': { type: 'text', value: 'N', bg: '#76b900', color: '#fff' },
  'TSLA': { type: 'text', value: 'T', bg: '#cc0000', color: '#fff' },
  'AMZN': { type: 'text', value: 'a', bg: '#ff9900', color: '#000' },
  'GOOGL': { type: 'text', value: 'G', bg: '#4285f4', color: '#fff' },
  // Forex — flag emoji pairs
  'EUR/USD': { type: 'flag', value: '🇪🇺' },
  'GBP/USD': { type: 'flag', value: '🇬🇧' },
  'USD/JPY': { type: 'flag', value: '🇯🇵' },
  'AUD/USD': { type: 'flag', value: '🇦🇺' },
  'USD/CHF': { type: 'flag', value: '🇨🇭' },
  // Metals
  'XAU/USD': { type: 'text', value: 'Au', bg: '#fbbf24', color: '#000' },
  'XAG/USD': { type: 'text', value: 'Ag', bg: '#9ca3af', color: '#fff' },
  'XPT/USD': { type: 'text', value: 'Pt', bg: '#e5e7eb', color: '#374151' },
  'XPD/USD': { type: 'text', value: 'Pd', bg: '#d1d5db', color: '#374151' },
  // Energy
  'WTI/USD': { type: 'text', value: '🛢', bg: '#1f2937', color: '#f59e0b' },
  'BRENT/USD': { type: 'text', value: '⛽', bg: '#1f2937', color: '#f59e0b' },
  'NATGAS': { type: 'text', value: '🔥', bg: '#fef3c7', color: '#d97706' },
  // Indices
  'SPX500': { type: 'text', value: 'S&P', bg: '#1d4ed8', color: '#fff' },
  'NAS100': { type: 'text', value: 'NDX', bg: '#7c3aed', color: '#fff' },
  'DJI30': { type: 'text', value: 'DJI', bg: '#0369a1', color: '#fff' },
  'DAX40': { type: 'text', value: 'DAX', bg: '#000', color: '#f59e0b' },
  'FTSE100': { type: 'text', value: 'FT', bg: '#dc2626', color: '#fff' },
  // Commodities
  'WHEAT': { type: 'text', value: '🌾', bg: '#fef9c3', color: '#854d0e' },
  'COFFEE': { type: 'text', value: '☕', bg: '#78350f', color: '#fef3c7' },
  'SUGAR': { type: 'text', value: '🍬', bg: '#fce7f3', color: '#9d174d' },
  'COTTON': { type: 'text', value: '🌿', bg: '#f0fdf4', color: '#166534' },
  'CORN': { type: 'text', value: '🌽', bg: '#fef9c3', color: '#854d0e' },
};

function AssetIcon({ symbol, category }: { symbol: string; category: CategoryKey }) {
  const icon = ASSET_ICONS[symbol];
  const categoryColors: Record<CategoryKey, { bg: string; color: string }> = {
    forex: { bg: '#eff6ff', color: '#1d4ed8' },
    indices: { bg: '#f5f3ff', color: '#7c3aed' },
    commodities: { bg: '#fefce8', color: '#854d0e' },
    metals: { bg: '#fef9c3', color: '#854d0e' },
    energy: { bg: '#fff7ed', color: '#c2410c' },
    shares: { bg: '#f0fdf4', color: '#166534' },
    crypto: { bg: '#fffbeb', color: '#b45309' },
  };

  if (icon?.type === 'img') {
    return (
      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
        <img
          src={icon.value}
          alt={symbol}
          className="w-6 h-6 object-contain"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            if (target.parentElement) {
              target.parentElement.innerHTML = `<span style="font-size:11px;font-weight:700;color:#b45309">${symbol.split('/')[0].slice(0,3)}</span>`;
            }
          }}
        />
      </div>
    );
  }

  if (icon?.type === 'flag') {
    return (
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-lg" style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e7eb' }}>
        {icon.value}
      </div>
    );
  }

  if (icon?.type === 'text') {
    const isEmoji = icon.value.length <= 2 && /\p{Emoji}/u.test(icon.value);
    return (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: icon.bg || '#f3f4f6', border: '1px solid rgba(0,0,0,0.08)' }}
      >
        <span style={{ fontSize: isEmoji ? '16px' : '10px', fontWeight: 700, color: icon.color || '#374151', lineHeight: 1 }}>
          {icon.value}
        </span>
      </div>
    );
  }

  // Fallback: category-colored abbreviation
  const fallback = categoryColors[category];
  const abbr = symbol.split('/')[0].slice(0, 3).toUpperCase();
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
      style={{ backgroundColor: fallback.bg, color: fallback.color, border: `1px solid ${fallback.color}30` }}
    >
      {abbr}
    </div>
  );
}

function formatPrice(price: number, category: CategoryKey): string {
  if (category === 'forex') return price.toFixed(4);
  if (price >= 10000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 100) return price.toFixed(2);
  if (price >= 1) return price.toFixed(3);
  return price.toFixed(5);
}

function formatVolume(v: number): string {
  if (v === 0) return '—';
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
  if (v >= 1e6) return `$${(v / 1e6).toFixed(0)}M`;
  return `$${v.toLocaleString()}`;
}

export default function MarketsContent() {
  const [instruments, setInstruments] = useState<MarketInstrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('forex');
  const [search, setSearch] = useState('');
  const [watchedSymbols, setWatchedSymbols] = useState<string[]>([]);

  useEffect(() => {
    marketsService.getInstruments().then(data => {
      setInstruments(data);
      setLoading(false);
    });
    setWatchedSymbols(watchlistService.getWatchlist());
  }, []);

  const toggleWatch = (symbol: string) => {
    watchlistService.toggle(symbol);
    setWatchedSymbols(watchlistService.getWatchlist());
  };

  const filtered = useMemo(() => {
    let data = instruments.filter(i => i.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(i => i.symbol.toLowerCase().includes(q) || i.name.toLowerCase().includes(q));
    }
    return data;
  }, [instruments, activeCategory, search]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    instruments.forEach(i => { counts[i.category] = (counts[i.category] || 0) + 1; });
    return counts;
  }, [instruments]);

  return (
    <div className="py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Markets</h1>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {instruments.length} instruments across {CATEGORIES.length} asset classes
          </p>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search instruments…"
            className="pl-8 pr-3 py-2 rounded-md text-xs border focus:outline-none w-52"
            style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0"
            style={{
              backgroundColor: activeCategory === cat.key ? 'rgba(245,196,0,0.15)' : 'var(--card)',
              color: activeCategory === cat.key ? 'var(--primary)' : 'var(--muted-foreground)',
              border: `1px solid ${activeCategory === cat.key ? 'rgba(245,196,0,0.4)' : 'var(--border)'}`,
            }}
          >
            <span>{cat.icon}</span>
            <span>{cat.label}</span>
            {categoryCounts[cat.key] && (
              <span className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)', fontSize: '10px' }}>
                {categoryCounts[cat.key]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--muted)' }}>
                <th className="px-3 py-2.5 text-left w-8" style={{ color: 'var(--muted-foreground)', fontSize: '11px' }}>★</th>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Instrument</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider hidden sm:table-cell" style={{ color: 'var(--muted-foreground)' }}>Symbol</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Price</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>24h Change</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: 'var(--muted-foreground)' }}>Bid</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: 'var(--muted-foreground)' }}>Ask</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider hidden lg:table-cell" style={{ color: 'var(--muted-foreground)' }}>High</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider hidden lg:table-cell" style={{ color: 'var(--muted-foreground)' }}>Low</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider hidden xl:table-cell" style={{ color: 'var(--muted-foreground)' }}>Volume</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: 'var(--muted-foreground)' }}>Status</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }, (_, i) => (
                  <tr key={`sk-${i}`} className="animate-pulse" style={{ borderBottom: '1px solid var(--border)' }}>
                    {Array.from({ length: 12 }, (_, j) => (
                      <td key={j} className="px-3 py-3">
                        <div className="h-3.5 rounded" style={{ backgroundColor: 'var(--muted)', width: j === 1 ? '120px' : '60px' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center">
                    <Search size={24} className="mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
                    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>No instruments found</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Try adjusting your search</p>
                  </td>
                </tr>
              ) : (
                filtered.map(inst => {
                  const isPos = inst.changePct24h >= 0;
                  const isWatched = watchedSymbols.includes(inst.symbol);
                  const statusStyle = STATUS_STYLES[inst.status] || STATUS_STYLES.closed;
                  return (
                    <tr
                      key={inst.id}
                      className="transition-colors"
                      style={{ borderBottom: '1px solid var(--border)' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--muted)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      {/* Star */}
                      <td className="px-3 py-3">
                        <button
                          onClick={() => toggleWatch(inst.symbol)}
                          className="p-1 rounded transition-colors"
                          title={isWatched ? 'Remove from watchlist' : 'Add to watchlist'}
                        >
                          <Star
                            size={13}
                            fill={isWatched ? 'var(--primary)' : 'none'}
                            style={{ color: isWatched ? 'var(--primary)' : 'var(--muted-foreground)' }}
                          />
                        </button>
                      </td>
                      {/* Instrument */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <AssetIcon symbol={inst.symbol} category={inst.category} />
                          <div>
                            <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{inst.name}</p>
                            <p className="text-xs" style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>{inst.baseCurrency}</p>
                          </div>
                        </div>
                      </td>
                      {/* Symbol */}
                      <td className="px-3 py-3 text-right hidden sm:table-cell">
                        <span className="text-xs font-mono font-semibold" style={{ color: 'var(--foreground)' }}>{inst.symbol}</span>
                      </td>
                      {/* Price */}
                      <td className="px-3 py-3 text-right">
                        <span className="text-xs font-bold tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>
                          {formatPrice(inst.lastPrice, inst.category)}
                        </span>
                      </td>
                      {/* 24h Change */}
                      <td className="px-3 py-3 text-right">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold tabular-nums"
                          style={{
                            backgroundColor: isPos ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                            color: isPos ? '#22c55e' : '#ef4444',
                          }}>
                          {isPos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {isPos ? '+' : ''}{inst.changePct24h.toFixed(2)}%
                        </div>
                      </td>
                      {/* Bid */}
                      <td className="px-3 py-3 text-right hidden md:table-cell">
                        <span className="text-xs tabular-nums font-mono" style={{ color: '#22c55e' }}>
                          {formatPrice(inst.bid, inst.category)}
                        </span>
                      </td>
                      {/* Ask */}
                      <td className="px-3 py-3 text-right hidden md:table-cell">
                        <span className="text-xs tabular-nums font-mono" style={{ color: '#ef4444' }}>
                          {formatPrice(inst.ask, inst.category)}
                        </span>
                      </td>
                      {/* High */}
                      <td className="px-3 py-3 text-right hidden lg:table-cell">
                        <span className="text-xs tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>
                          {formatPrice(inst.high24h, inst.category)}
                        </span>
                      </td>
                      {/* Low */}
                      <td className="px-3 py-3 text-right hidden lg:table-cell">
                        <span className="text-xs tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>
                          {formatPrice(inst.low24h, inst.category)}
                        </span>
                      </td>
                      {/* Volume */}
                      <td className="px-3 py-3 text-right hidden xl:table-cell">
                        <span className="text-xs tabular-nums" style={{ color: 'var(--muted-foreground)' }}>
                          {formatVolume(inst.volume24h)}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="px-3 py-3 text-center hidden md:table-cell">
                        <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                          {statusStyle.label}
                        </span>
                      </td>
                      {/* Action */}
                      <td className="px-3 py-3 text-center">
                        <Link
                          href="/trade-trading-workspace"
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold transition-all hover:opacity-90"
                          style={{ backgroundColor: 'rgba(245,196,0,0.12)', color: 'var(--primary)', border: '1px solid rgba(245,196,0,0.25)' }}
                        >
                          Trade
                          <ExternalLink size={9} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}