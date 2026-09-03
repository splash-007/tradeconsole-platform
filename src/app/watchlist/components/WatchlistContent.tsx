'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { watchlistService } from '@/services/watchlist.service';
import { marketsService, MarketInstrument } from '@/services/markets.service';
import { useMarketQuotes } from '@/hooks/useMarketQuotes';
import { Star, Search, TrendingUp, TrendingDown, ExternalLink, BarChart2 } from 'lucide-react';
import Link from 'next/link';

type SortField = 'name' | 'lastPrice' | 'changePct24h';
type SortDir = 'asc' | 'desc';

// Map watchlist instrument symbols to real data symbols
const REAL_SYMBOL_MAP: Record<string, string> = {
  'BTC/USDT': 'BTC/USD',
  'ETH/USDT': 'ETH/USD',
  'SOL/USDT': 'SOL/USD',
  'XRP/USDT': 'XRP/USD',
  'EUR/USD': 'EUR/USD',
  'GBP/USD': 'GBP/USD',
  'USD/JPY': 'USD/JPY',
  'USD/CHF': 'USD/CHF',
  'AUD/USD': 'AUD/USD',
  'AAPL': 'AAPL',
  'NVDA': 'NVDA',
  'MSFT': 'MSFT',
  'TSLA': 'TSLA',
  'AMZN': 'AMZN',
};

const ALL_REAL_SYMBOLS = Object.values(REAL_SYMBOL_MAP).filter((v, i, a) => a.indexOf(v) === i);

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

  // Real market data
  const { quotes: realQuotes } = useMarketQuotes(ALL_REAL_SYMBOLS);

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
      const getRealPrice = (inst: MarketInstrument) => {
        const realSym = REAL_SYMBOL_MAP[inst.symbol];
        const state = realSym ? realQuotes[realSym] : undefined;
        return (state?.available && state.quote?.price != null) ? state.quote.price : inst.lastPrice;
      };
      const getRealChangePct = (inst: MarketInstrument) => {
        const realSym = REAL_SYMBOL_MAP[inst.symbol];
        const state = realSym ? realQuotes[realSym] : undefined;
        return (state?.available && state.quote?.changePercent != null) ? state.quote.changePercent : inst.changePct24h;
      };
      let av: number | string = 0, bv: number | string = 0;
      if (sortField === 'name') { av = a.name; bv = b.name; }
      else if (sortField === 'lastPrice') { av = getRealPrice(a); bv = getRealPrice(b); }
      else { av = getRealChangePct(a); bv = getRealChangePct(b); }
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return data;
  }, [watchedInstruments, search, sortField, sortDir, realQuotes]);

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
                  const realSym = REAL_SYMBOL_MAP[inst.symbol];
                  const realState = realSym ? realQuotes[realSym] : undefined;
                  const isReal = realState?.available && realState.quote?.price != null;
                  const q = realState?.quote;

                  const price = isReal && q?.price != null ? q.price : inst.lastPrice;
                  const changePct = isReal && q?.changePercent != null ? q.changePercent : inst.changePct24h;
                  const high = isReal && q?.high != null ? q.high : inst.high24h;
                  const low = isReal && q?.low != null ? q.low : inst.low24h;
                  const bid = isReal && q?.bid != null ? q.bid : inst.bid;
                  const ask = isReal && q?.ask != null ? q.ask : inst.ask;
                  const isPos = changePct >= 0;
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
                            <div className="flex items-center gap-1">
                              <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{inst.name}</p>
                              {isReal && <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" title="Live data" />}
                            </div>
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
                          {formatPrice(price)}
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
                          {isPos ? '+' : ''}{changePct.toFixed(2)}%
                        </div>
                      </td>
                      {/* Bid */}
                      <td className="px-3 py-3 text-right hidden md:table-cell">
                        <span className="text-xs tabular-nums font-mono" style={{ color: '#22c55e' }}>{formatPrice(bid)}</span>
                      </td>
                      {/* Ask */}
                      <td className="px-3 py-3 text-right hidden md:table-cell">
                        <span className="text-xs tabular-nums font-mono" style={{ color: '#ef4444' }}>{formatPrice(ask)}</span>
                      </td>
                      {/* High */}
                      <td className="px-3 py-3 text-right hidden lg:table-cell">
                        <span className="text-xs tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>{formatPrice(high)}</span>
                      </td>
                      {/* Low */}
                      <td className="px-3 py-3 text-right hidden lg:table-cell">
                        <span className="text-xs tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>{formatPrice(low)}</span>
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
