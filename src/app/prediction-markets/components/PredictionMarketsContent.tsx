'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { predictionMarketsService, PredictionMarket, PredictionCategory } from '@/services/prediction-markets.service';
import { TrendingUp, Clock, Users, Search } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES: { key: 'all' | PredictionCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'finance', label: 'Finance' },
  { key: 'crypto', label: 'Crypto' },
  { key: 'economy', label: 'Economy' },
  { key: 'technology', label: 'Technology' },
  { key: 'sports', label: 'Sports' },
  { key: 'world', label: 'World Events' },
];

function timeRemaining(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return 'Ended';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 30) return `${Math.floor(days / 30)}mo`;
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h`;
}

function formatVolume(v: number): string {
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v}`;
}

function MarketCard({ market }: { market: PredictionMarket }) {
  const isOpen = market.status === 'open';
  const yesWidth = market.yesProbability;
  const noWidth = market.noProbability;

  return (
    <Link
      href={`/prediction-markets/${market.id}`}
      className="block rounded border overflow-hidden transition-all hover:border-primary/40 hover:shadow-sm group"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', textDecoration: 'none' }}
    >
      {/* Image */}
      <div className="relative h-28 overflow-hidden">
        <img
          src={market.imageUrl}
          alt={market.imageAlt}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.65))' }} />
        <div className="absolute top-2 left-2">
          <span
            className="px-1.5 py-0.5 rounded text-xs font-semibold capitalize"
            style={{ backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff', backdropFilter: 'blur(4px)', fontSize: '10px' }}
          >
            {market.category}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <span
            className="px-1.5 py-0.5 rounded text-xs font-semibold"
            style={{
              backgroundColor: isOpen ? 'rgba(34,197,94,0.75)' : 'rgba(107,114,128,0.75)',
              color: '#fff',
              fontSize: '10px',
            }}
          >
            {isOpen ? 'LIVE' : 'CLOSED'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <p className="text-xs font-semibold leading-snug line-clamp-2 mb-2.5" style={{ color: 'var(--foreground)', minHeight: '2.5rem' }}>
          {market.title}
        </p>

        {/* Probability bar */}
        <div className="mb-2">
          <div className="w-full h-1 rounded-full overflow-hidden flex mb-1.5" style={{ backgroundColor: 'var(--muted)' }}>
            <div className="h-full transition-all" style={{ width: `${yesWidth}%`, backgroundColor: '#16a34a' }} />
            <div className="h-full transition-all" style={{ width: `${noWidth}%`, backgroundColor: '#dc2626' }} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold tabular-nums" style={{ color: '#16a34a' }}>YES</span>
              <span className="text-xs font-bold tabular-nums" style={{ color: '#16a34a' }}>{market.yesProbability}%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold tabular-nums" style={{ color: '#dc2626' }}>{market.noProbability}%</span>
              <span className="text-xs font-bold tabular-nums" style={{ color: '#dc2626' }}>NO</span>
            </div>
          </div>
        </div>

        {/* YES/NO price buttons */}
        <div className="flex gap-1.5 mb-2.5">
          <div
            className="flex-1 py-1.5 rounded text-center text-xs font-bold"
            style={{ backgroundColor: 'rgba(22,163,74,0.1)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.2)' }}
          >
            YES ${market.yesPrice.toFixed(2)}
          </div>
          <div
            className="flex-1 py-1.5 rounded text-center text-xs font-bold"
            style={{ backgroundColor: 'rgba(220,38,38,0.08)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.18)' }}
          >
            NO ${market.noPrice.toFixed(2)}
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--muted-foreground)' }}>
          <div className="flex items-center gap-1">
            <TrendingUp size={9} />
            <span className="tabular-nums">{formatVolume(market.volume)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={9} />
            <span className="tabular-nums">{market.totalPositions.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={9} />
            <span>{timeRemaining(market.endsAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function PredictionMarketsContent() {
  const [markets, setMarkets] = useState<PredictionMarket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<'all' | PredictionCategory>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    predictionMarketsService.getMarkets().then(data => {
      setMarkets(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let data = [...markets];
    if (activeCategory !== 'all') data = data.filter(m => m.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(m => m.title.toLowerCase().includes(q) || m.category.toLowerCase().includes(q));
    }
    return data;
  }, [markets, activeCategory, search]);

  return (
    <div className="py-4 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Prediction Markets</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            {markets.length} open markets · Participate using your account balance
          </p>
        </div>
        <div className="relative">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search markets…"
            className="pl-8 pr-3 py-1.5 rounded text-xs border focus:outline-none w-44"
            style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
        </div>
      </div>

      {/* Category filter bar — compact horizontal pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className="px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-all shrink-0"
            style={{
              backgroundColor: activeCategory === cat.key ? 'var(--primary)' : 'transparent',
              color: activeCategory === cat.key ? '#000' : 'var(--muted-foreground)',
              border: `1px solid ${activeCategory === cat.key ? 'var(--primary)' : 'var(--border)'}`,
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Disclaimer */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded text-xs"
        style={{ backgroundColor: 'rgba(245,196,0,0.04)', border: '1px solid rgba(245,196,0,0.12)', color: 'var(--muted-foreground)' }}
      >
        <span style={{ color: 'var(--primary)', fontSize: '11px' }}>⚠</span>
        Prediction markets involve risk. Eligibility subject to jurisdiction and compliance checks. Settlements are server-authoritative.
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="rounded border overflow-hidden animate-pulse" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="h-28" style={{ backgroundColor: 'var(--muted)' }} />
              <div className="p-3 space-y-2">
                <div className="h-3 rounded" style={{ backgroundColor: 'var(--muted)' }} />
                <div className="h-3 rounded w-3/4" style={{ backgroundColor: 'var(--muted)' }} />
                <div className="h-1.5 rounded" style={{ backgroundColor: 'var(--muted)' }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded border flex flex-col items-center justify-center py-16 gap-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <Search size={24} style={{ color: 'var(--muted-foreground)', opacity: 0.4 }} />
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No markets found</p>
          {search && (
            <button onClick={() => setSearch('')} className="text-xs" style={{ color: 'var(--primary)' }}>Clear search</button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(market => <MarketCard key={market.id} market={market} />)}
        </div>
      )}
    </div>
  );
}
