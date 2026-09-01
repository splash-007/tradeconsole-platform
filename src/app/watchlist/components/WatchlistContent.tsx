'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { watchlistService } from '@/services/watchlist.service';
import { marketsService, MarketInstrument } from '@/services/markets.service';
import { Star, Search, TrendingUp, TrendingDown, ExternalLink, BarChart2 } from 'lucide-react';
import Link from 'next/link';

type SortField = 'name' | 'lastPrice' | 'changePct24h';
type SortDir = 'asc' | 'desc';

function formatPrice(price: number): string {
  if (price >= 10000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(3);
  return price.toFixed(5);
}

export default function WatchlistContent() {
  const [allInstruments, setAllInstruments] = useState<MarketInstrument[]>([]);
  const [watchedSymbols, setWatchedSymbols] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('changePct24h');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  useEffect(() => {
    marketsService.getInstruments().then(setAllInstruments);
    setWatchedSymbols(watchlistService.getWatchlist());
  }, []);

  const removeFromWatchlist = (symbol: string) => {
    watchlistService.removeInstrument(symbol);
    setWatchedSymbols(watchlistService.getWatchlist());
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const watchedInstruments = useMemo(() => {
    return allInstruments.filter(i => watchedSymbols.includes(i.symbol));
  }, [allInstruments, watchedSymbols]);

  const filtered = useMemo(() => {
    let data = [...watchedInstruments];
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(i => i.symbol.toLowerCase().includes(q) || i.name.toLowerCase().includes(q));
    }
    data.sort((a, b) => {
      let av: number | string = 0, bv: number | string = 0;
      if (sortField === 'name') { av = a.name; bv = b.name; }
      else if (sortField === 'lastPrice') { av = a.lastPrice; bv = b.lastPrice; }
      else { av = a.changePct24h; bv = b.changePct24h; }
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return data;
  }, [watchedInstruments, search, sortField, sortDir]);

  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span style={{ color: 'var(--muted-foreground)', opacity: 0.4 }}>↕</span>;
    return <span style={{ color: 'var(--primary)' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Watchlist</h1>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {watchedSymbols.length} instrument{watchedSymbols.length !== 1 ? 's' : ''} saved
          </p>
        </div>
        {watchedSymbols.length > 0 && (
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search watchlist…"
              className="pl-8 pr-3 py-2 rounded-md text-xs border focus:outline-none w-48"
              style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
          </div>
        )}
      </div>

      {/* Empty state */}
      {watchedSymbols.length === 0 ? (
        <div className="rounded-lg border flex flex-col items-center justify-center py-20 gap-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(245,196,0,0.08)', border: '1px solid rgba(245,196,0,0.2)' }}>
            <Star size={24} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Your watchlist is empty</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Star instruments from Markets to monitor them here.</p>
          </div>
          <Link
            href="/markets"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: 'rgba(245,196,0,0.15)', color: 'var(--primary)', border: '1px solid rgba(245,196,0,0.3)' }}
          >
            <BarChart2 size={13} />
            Explore Markets
          </Link>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--muted)' }}>
                  <th className="px-3 py-2.5 w-8" />
                  <th
                    className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-foreground select-none"
                    style={{ color: 'var(--muted-foreground)' }}
                    onClick={() => handleSort('name')}
                  >
                    Instrument <SortIndicator field="name" />
                  </th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider hidden sm:table-cell" style={{ color: 'var(--muted-foreground)' }}>Symbol</th>
                  <th
                    className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-foreground select-none"
                    style={{ color: 'var(--muted-foreground)' }}
                    onClick={() => handleSort('lastPrice')}
                  >
                    Price <SortIndicator field="lastPrice" />
                  </th>
                  <th
                    className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-foreground select-none"
                    style={{ color: 'var(--muted-foreground)' }}
                    onClick={() => handleSort('changePct24h')}
                  >
                    24h % <SortIndicator field="changePct24h" />
                  </th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: 'var(--muted-foreground)' }}>Bid</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: 'var(--muted-foreground)' }}>Ask</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider hidden lg:table-cell" style={{ color: 'var(--muted-foreground)' }}>High</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider hidden lg:table-cell" style={{ color: 'var(--muted-foreground)' }}>Low</th>
                  <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-10 text-center">
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>No results for "{search}"</p>
                    </td>
                  </tr>
                ) : filtered.map(inst => {
                  const isPos = inst.changePct24h >= 0;
                  return (
                    <tr
                      key={inst.id}
                      className="hover:bg-white/[0.02] transition-colors"
                      style={{ borderBottom: '1px solid var(--border)' }}
                    >
                      {/* Remove star */}
                      <td className="px-3 py-3">
                        <button
                          onClick={() => removeFromWatchlist(inst.symbol)}
                          className="p-1 rounded transition-colors hover:bg-white/10"
                          title="Remove from watchlist"
                        >
                          <Star size={13} fill="var(--primary)" style={{ color: 'var(--primary)' }} />
                        </button>
                      </td>
                      {/* Instrument */}
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                            style={{ backgroundColor: 'rgba(245,196,0,0.1)', color: 'var(--primary)', border: '1px solid rgba(245,196,0,0.2)' }}>
                            {inst.baseCurrency.slice(0, 3)}
                          </div>
                          <div>
                            <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{inst.name}</p>
                            <p className="text-xs capitalize" style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>{inst.category}</p>
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
                          {formatPrice(inst.lastPrice)}
                        </span>
                      </td>
                      {/* 24h % */}
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
                        <span className="text-xs tabular-nums font-mono" style={{ color: '#22c55e' }}>{formatPrice(inst.bid)}</span>
                      </td>
                      {/* Ask */}
                      <td className="px-3 py-3 text-right hidden md:table-cell">
                        <span className="text-xs tabular-nums font-mono" style={{ color: '#ef4444' }}>{formatPrice(inst.ask)}</span>
                      </td>
                      {/* High */}
                      <td className="px-3 py-3 text-right hidden lg:table-cell">
                        <span className="text-xs tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>{formatPrice(inst.high24h)}</span>
                      </td>
                      {/* Low */}
                      <td className="px-3 py-3 text-right hidden lg:table-cell">
                        <span className="text-xs tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>{formatPrice(inst.low24h)}</span>
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
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
