'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { predictionMarketsService, PredictionMarket, PredictionCategory } from '@/services/prediction-markets.service';
import { TrendingUp, Clock, Users, Search, BarChart2 } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES: { key: 'all' | PredictionCategory; label: string }[] = [
  { key: 'all', label: 'All Markets' },
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
      className="block rounded-xl border overflow-hidden transition-all hover:shadow-lg hover:border-primary/30 group"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
        textDecoration: 'none',
      }}
    >
      {/* Image */}
      <div className="relative h-28 overflow-hidden">
        <img
          src={market.imageUrl}
          alt={market.imageAlt}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 20%, rgba(0,0,0,0.75))' }} />
        <div className="absolute top-2 left-2">
          <span
            className="px-2 py-0.5 rounded-full text-xs font-bold capitalize"
            style={{ backgroundColor: 'rgba(0,0,0,0.65)', color: '#fff', backdropFilter: 'blur(4px)', letterSpacing: '0.03em' }}
          >
            {market.category}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <span
            className="px-2 py-0.5 rounded-full text-xs font-bold"
            style={{
              backgroundColor: isOpen ? 'rgba(34,197,94,0.85)' : 'rgba(107,114,128,0.85)',
              color: '#fff',
              letterSpacing: '0.05em',
            }}
          >
            {isOpen ? '● LIVE' : 'CLOSED'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <p className="text-sm font-semibold leading-snug line-clamp-2 mb-3" style={{ color: 'var(--foreground)', minHeight: '2.75rem' }}>
          {market.title}
        </p>

        {/* Probability bar */}
        <div className="mb-3">
          <div className="w-full h-2 rounded-full overflow-hidden flex mb-2" style={{ backgroundColor: 'var(--muted)' }}>
            <div className="h-full transition-all rounded-l-full" style={{ width: `${yesWidth}%`, backgroundColor: '#16a34a' }} />
            <div className="h-full transition-all rounded-r-full" style={{ width: `${noWidth}%`, backgroundColor: '#dc2626' }} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold" style={{ color: '#16a34a' }}>YES</span>
              <span className="text-sm font-bold tabular-nums" style={{ color: '#16a34a' }}>{market.yesProbability}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold tabular-nums" style={{ color: '#dc2626' }}>{market.noProbability}%</span>
              <span className="text-xs font-bold" style={{ color: '#dc2626' }}>NO</span>
            </div>
          </div>
        </div>

        {/* YES/NO price buttons */}
        <div className="flex gap-2 mb-3">
          <div
            className="flex-1 py-2 rounded-lg text-center font-bold text-sm"
            style={{ backgroundColor: 'rgba(22,163,74,0.1)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.25)' }}
          >
            YES ${market.yesPrice.toFixed(2)}
          </div>
          <div
            className="flex-1 py-2 rounded-lg text-center font-bold text-sm"
            style={{ backgroundColor: 'rgba(220,38,38,0.08)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.2)' }}
          >
            NO ${market.noPrice.toFixed(2)}
          </div>
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
          <div className="flex items-center gap-1.5">
            <TrendingUp size={11} />
            <span className="text-xs font-semibold tabular-nums">{formatVolume(market.volume)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={11} />
            <span className="text-xs font-semibold tabular-nums">{market.totalPositions.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={11} />
            <span className="text-xs font-semibold">{timeRemaining(market.endsAt)}</span>
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

  const openCount = markets.filter(m => m.status === 'open').length;

  return (
    <div className="py-4 space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>Prediction Markets</h1>
          <p className="text-sm mt-0.5 font-medium" style={{ color: 'var(--muted-foreground)' }}>
            <span className="inline-flex items-center gap-1.5 mr-2">
              <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
              {openCount} live markets
            </span>
            · Participate using your account balance
          </p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search markets…"
            className="pl-9 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-yellow-500/20 w-52 text-sm"
            style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
        </div>
      </div>

      {/* Category filter bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className="px-3.5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all shrink-0"
            style={{
              backgroundColor: activeCategory === cat.key ? 'var(--primary)' : 'var(--card)',
              color: activeCategory === cat.key ? '#000' : 'var(--muted-foreground)',
              border: `1.5px solid ${activeCategory === cat.key ? 'var(--primary)' : 'var(--border)'}`,
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Disclaimer */}
      <div
        className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm"
        style={{ backgroundColor: 'rgba(245,196,0,0.04)', border: '1px solid rgba(245,196,0,0.15)', color: 'var(--muted-foreground)' }}
      >
        <span style={{ color: 'var(--primary)', fontSize: '14px' }}>⚠</span>
        <span className="font-medium">Prediction markets involve risk. Eligibility subject to jurisdiction and compliance checks. Settlements are server-authoritative.</span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="rounded-xl border overflow-hidden animate-pulse" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="h-28" style={{ backgroundColor: 'var(--muted)' }} />
              <div className="p-4 space-y-3">
                <div className="h-4 rounded-lg" style={{ backgroundColor: 'var(--muted)' }} />
                <div className="h-4 rounded-lg w-3/4" style={{ backgroundColor: 'var(--muted)' }} />
                <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--muted)' }} />
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-8 rounded-lg" style={{ backgroundColor: 'var(--muted)' }} />
                  <div className="h-8 rounded-lg" style={{ backgroundColor: 'var(--muted)' }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border flex flex-col items-center justify-center py-20 gap-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(107,114,128,0.1)' }}>
            <BarChart2 size={28} style={{ color: 'var(--muted-foreground)', opacity: 0.5 }} />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold mb-1" style={{ color: 'var(--foreground)' }}>No markets found</p>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {search ? `No results for "${search}"` : 'No markets in this category'}
            </p>
          </div>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ backgroundColor: 'rgba(212,168,0,0.15)', color: 'var(--primary)', border: '1px solid rgba(212,168,0,0.3)' }}
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(market => <MarketCard key={market.id} market={market} />)}
        </div>
      )}
    </div>
  );
}
