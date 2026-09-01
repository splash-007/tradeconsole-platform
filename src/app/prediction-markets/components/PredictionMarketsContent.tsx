'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { predictionMarketsService, PredictionMarket, PredictionCategory } from '@/services/prediction-markets.service';
import { TrendingUp, Clock, Users, Search, Flame } from 'lucide-react';
import Link from 'next/link';

const CATEGORIES: { key: 'all' | PredictionCategory; label: string; icon: string }[] = [
  { key: 'all', label: 'Trending', icon: '🔥' },
  { key: 'finance', label: 'Finance', icon: '💹' },
  { key: 'crypto', label: 'Crypto', icon: '₿' },
  { key: 'economy', label: 'Economy', icon: '🌐' },
  { key: 'technology', label: 'Technology', icon: '🤖' },
  { key: 'sports', label: 'Sports', icon: '⚽' },
  { key: 'world', label: 'World Events', icon: '🌍' },
];

function timeRemaining(endsAt: string): string {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return 'Ended';
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  if (days > 30) return `${Math.floor(days / 30)}mo remaining`;
  if (days > 0) return `${days}d ${hours}h remaining`;
  return `${hours}h remaining`;
}

function formatVolume(v: number): string {
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`;
  if (v >= 1e3) return `$${(v / 1e3).toFixed(0)}K`;
  return `$${v}`;
}

function ProbabilityBar({ yes, no }: { yes: number; no: number }) {
  return (
    <div className="w-full h-1.5 rounded-full overflow-hidden flex" style={{ backgroundColor: 'var(--muted)' }}>
      <div className="h-full rounded-l-full transition-all" style={{ width: `${yes}%`, backgroundColor: '#22c55e' }} />
      <div className="h-full rounded-r-full transition-all" style={{ width: `${no}%`, backgroundColor: '#ef4444' }} />
    </div>
  );
}

function MarketCard({ market }: { market: PredictionMarket }) {
  return (
    <Link href={`/prediction-markets/${market.id}`} className="block rounded-lg border overflow-hidden transition-all hover:border-primary/40 hover:shadow-lg group" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      {/* Image */}
      <div className="relative h-32 overflow-hidden">
        <img
          src={market.imageUrl}
          alt={market.imageAlt}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.7))' }} />
        <div className="absolute top-2 left-2">
          <span className="px-2 py-0.5 rounded text-xs font-medium capitalize" style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: '#fff', backdropFilter: 'blur(4px)' }}>
            {market.category}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <span className="px-2 py-0.5 rounded text-xs font-medium" style={{
            backgroundColor: market.status === 'open' ? 'rgba(34,197,94,0.8)' : 'rgba(107,114,128,0.8)',
            color: '#fff',
          }}>
            {market.status === 'open' ? 'Open' : 'Closed'}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-2.5">
        <p className="text-xs font-semibold leading-snug line-clamp-2" style={{ color: 'var(--foreground)' }}>{market.title}</p>

        {/* Probability */}
        <div>
          <ProbabilityBar yes={market.yesProbability} no={market.noProbability} />
          <div className="flex items-center justify-between mt-1.5">
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold" style={{ color: '#22c55e' }}>YES {market.yesProbability}%</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-bold" style={{ color: '#ef4444' }}>NO {market.noProbability}%</span>
            </div>
          </div>
        </div>

        {/* Meta */}
        <div className="flex items-center justify-between text-xs" style={{ color: 'var(--muted-foreground)' }}>
          <div className="flex items-center gap-1">
            <TrendingUp size={10} />
            <span>{formatVolume(market.volume)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={10} />
            <span>{market.totalPositions.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={10} />
            <span>{timeRemaining(market.endsAt)}</span>
          </div>
        </div>

        {/* CTA */}
        <div className="flex gap-2 pt-1">
          <div className="flex-1 py-1.5 rounded text-center text-xs font-semibold" style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
            YES ${market.yesPrice.toFixed(2)}
          </div>
          <div className="flex-1 py-1.5 rounded text-center text-xs font-semibold" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            NO ${market.noPrice.toFixed(2)}
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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--foreground)' }}>
            <Flame size={18} style={{ color: 'var(--primary)' }} />
            Prediction Markets
          </h1>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {markets.length} open markets · Participate using your account balance
          </p>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search markets…"
            className="pl-8 pr-3 py-2 rounded-md text-xs border focus:outline-none w-48"
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
          </button>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: 'rgba(245,196,0,0.05)', border: '1px solid rgba(245,196,0,0.15)', color: 'var(--muted-foreground)' }}>
        ⚠️ Prediction markets involve risk. Eligibility subject to jurisdiction and compliance checks. Participation uses account balance — settlements are server-authoritative.
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="rounded-lg border overflow-hidden animate-pulse" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="h-32" style={{ backgroundColor: 'var(--muted)' }} />
              <div className="p-3 space-y-2">
                <div className="h-4 rounded" style={{ backgroundColor: 'var(--muted)' }} />
                <div className="h-3 rounded w-3/4" style={{ backgroundColor: 'var(--muted)' }} />
                <div className="h-2 rounded" style={{ backgroundColor: 'var(--muted)' }} />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border flex flex-col items-center justify-center py-16 gap-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <Search size={28} style={{ color: 'var(--muted-foreground)', opacity: 0.4 }} />
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No markets found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(market => <MarketCard key={market.id} market={market} />)}
        </div>
      )}
    </div>
  );
}
