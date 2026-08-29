'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { marketsService, MarketInstrument } from '@/services/markets.service';
import { Search, TrendingUp, TrendingDown, ArrowUpDown, ArrowUp, ArrowDown, Wifi } from 'lucide-react';
import Link from 'next/link';
import { useRealTimeMarket } from '@/hooks/useRealTimeMarket';
import MiniCandleChart from '@/components/trading/MiniCandleChart';

const CATEGORIES = ['All', 'Crypto', 'Forex', 'Indices', 'Commodities'] as const;
type SortField = 'symbol' | 'lastPrice' | 'changePct24h' | 'volume24h' | 'marketCap';
type SortDir = 'asc' | 'desc';

// Symbols that have Binance live feed
const LIVE_SYMBOLS = ['BTC/USDC', 'ETH/USDC', 'SOL/USDC', 'BNB/USDC', 'XRP/USDC', 'ADA/USDC', 'AVAX/USDC', 'DOT/USDC'];

export default function MarketsContent() {
  const [instruments, setInstruments] = useState<MarketInstrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('volume24h');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Real-time market feed
  const { quotes, candles } = useRealTimeMarket(LIVE_SYMBOLS);
  const isLive = Object.keys(quotes).length > 0;

  useEffect(() => {
    marketsService.getInstruments().then(data => {
      setInstruments(data);
      setLoading(false);
    });
  }, []);

  // Merge live quotes into instruments
  const mergedInstruments = useMemo(() => {
    return instruments.map(inst => {
      const live = quotes[inst.symbol];
      if (!live) return inst;
      return {
        ...inst,
        lastPrice: live.price,
        change24h: live.change24h,
        changePct24h: live.changePct24h,
        high24h: live.high24h,
        low24h: live.low24h,
        volume24h: live.volume24h,
      };
    });
  }, [instruments, quotes]);

  const filtered = useMemo(() => {
    let data = [...mergedInstruments];
    if (category !== 'All') data = data.filter(i => i.category === category.toLowerCase());
    if (search) data = data.filter(i => i.symbol.toLowerCase().includes(search.toLowerCase()));
    data.sort((a, b) => {
      const av = a[sortField] as number | string;
      const bv = b[sortField] as number | string;
      if (typeof av === 'string') return sortDir === 'asc' ? av.localeCompare(bv as string) : (bv as string).localeCompare(av);
      return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number);
    });
    return data;
  }, [mergedInstruments, category, search, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown size={11} style={{ color: 'var(--muted-foreground)' }} />;
    return sortDir === 'asc' ? <ArrowUp size={11} style={{ color: 'var(--primary)' }} /> : <ArrowDown size={11} style={{ color: 'var(--primary)' }} />;
  };

  return (
    <div className="py-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Markets</h1>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{instruments.length} instruments · Updated live</p>
        </div>
        {/* Live feed indicator */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: isLive ? 'rgba(34,197,94,0.1)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${isLive ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.1)'}`,
            color: isLive ? '#22c55e' : 'var(--muted-foreground)',
          }}>
          <Wifi size={11} />
          <span>{isLive ? 'Live Feed' : 'Connecting…'}</span>
          {isLive && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Category tabs */}
        <div className="flex items-center gap-1 p-1 rounded-lg" style={{ backgroundColor: 'var(--muted)' }}>
          {CATEGORIES.map(cat => (
            <button
              key={`mkt-cat-${cat}`}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 text-xs rounded-md font-medium transition-all ${category === cat ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search symbol..."
            className="w-full pl-8 pr-3 py-2 rounded-md text-xs border focus:outline-none"
            style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {[
                  { label: '#', field: null, align: 'left' },
                  { label: 'Symbol', field: 'symbol' as SortField, align: 'left' },
                  { label: 'Last Price', field: 'lastPrice' as SortField, align: 'right' },
                  { label: '24h Change', field: 'changePct24h' as SortField, align: 'right' },
                  { label: '24h High', field: null, align: 'right' },
                  { label: '24h Low', field: null, align: 'right' },
                  { label: '24h Volume', field: 'volume24h' as SortField, align: 'right' },
                  { label: 'Market Cap', field: 'marketCap' as SortField, align: 'right' },
                  { label: 'Live Chart', field: null, align: 'center' },
                  { label: 'Action', field: null, align: 'center' },
                ].map(({ label, field, align }) => (
                  <th
                    key={`mkt-th-${label}`}
                    onClick={field ? () => handleSort(field) : undefined}
                    className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider whitespace-nowrap ${field ? 'cursor-pointer hover:bg-muted select-none' : ''} text-${align}`}
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : ''}`}>
                      {label}
                      {field && <SortIcon field={field} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }, (_, i) => (
                  <tr key={`mkt-sk-${i}`} className="animate-pulse" style={{ borderBottom: '1px solid var(--border)' }}>
                    {Array.from({ length: 10 }, (_, j) => (
                      <td key={`mkt-sk-cell-${i}-${j}`} className="px-4 py-3">
                        <div className="h-4 rounded" style={{ backgroundColor: 'var(--muted)', width: j === 0 ? '24px' : '80px' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center">
                    <Search size={24} className="mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
                    <p className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>No instruments found</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Try adjusting your search or filter</p>
                  </td>
                </tr>
              ) : (
                filtered.map((inst, idx) => {
                  const isPos = inst.changePct24h >= 0;
                  const liveCandles = candles[inst.symbol];
                  const hasLiveFeed = LIVE_SYMBOLS.includes(inst.symbol);

                  return (
                    <tr
                      key={`mkt-row-${inst.id}`}
                      className="hover:bg-muted transition-colors"
                      style={{ borderBottom: '1px solid var(--border)' }}
                    >
                      <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                            style={{ backgroundColor: 'var(--muted)', color: 'var(--primary)' }}>
                            {inst.baseCurrency.slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1">
                              <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{inst.symbol}</p>
                              {hasLiveFeed && (
                                <div className="w-1.5 h-1.5 rounded-full shrink-0"
                                  style={{ backgroundColor: isLive ? '#22c55e' : 'var(--muted-foreground)', opacity: isLive ? 1 : 0.4 }} />
                              )}
                            </div>
                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{inst.baseCurrency}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs font-semibold tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>
                          ${inst.lastPrice < 10 ? inst.lastPrice.toFixed(4) : inst.lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold tabular-nums ${isPos ? 'bg-positive-subtle text-positive' : 'bg-negative-subtle text-negative'}`}>
                          {isPos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {isPos ? '+' : ''}{inst.changePct24h.toFixed(2)}%
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>
                          ${inst.high24h.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>
                          ${inst.low24h.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>
                          {inst.volume24h >= 1e9 ? `$${(inst.volume24h / 1e9).toFixed(2)}B` : inst.volume24h >= 1e6 ? `$${(inst.volume24h / 1e6).toFixed(0)}M` : `$${inst.volume24h.toLocaleString()}`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-xs tabular-nums font-mono" style={{ color: 'var(--muted-foreground)' }}>
                          {inst.marketCap > 0 ? (inst.marketCap >= 1e12 ? `$${(inst.marketCap / 1e12).toFixed(2)}T` : inst.marketCap >= 1e9 ? `$${(inst.marketCap / 1e9).toFixed(1)}B` : '—') : '—'}
                        </span>
                      </td>
                      {/* Live Candlestick Chart Column */}
                      <td className="px-2 py-2">
                        <div className="flex items-center justify-center" style={{ width: 88, height: 40 }}>
                          {hasLiveFeed && liveCandles && liveCandles.length >= 2 ? (
                            <MiniCandleChart
                              candles={liveCandles}
                              width={88}
                              height={40}
                              showTooltip
                            />
                          ) : hasLiveFeed ? (
                            // Loading skeleton for live symbols
                            <div className="flex items-end gap-px w-full h-full px-1">
                              {Array.from({ length: 10 }, (_, i) => (
                                <div
                                  key={`ld-${inst.id}-${i}`}
                                  className="flex-1 rounded-sm animate-pulse"
                                  style={{
                                    height: `${40 + Math.sin(i * 1.3) * 30}%`,
                                    backgroundColor: isPos ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
                                  }}
                                />
                              ))}
                            </div>
                          ) : (
                            // Non-crypto instruments: static sparkline fallback
                            <div className="flex items-end gap-px w-full h-full px-1">
                              {inst.sparkline.map((v, i, arr) => {
                                const min = Math.min(...arr);
                                const max = Math.max(...arr);
                                const pct = max === min ? 50 : ((v - min) / (max - min)) * 80 + 10;
                                const barIsUp = i > 0 ? v >= arr[i - 1] : true;
                                return (
                                  <div
                                    key={`sp-${inst.id}-${i}`}
                                    className="flex-1 rounded-sm"
                                    style={{
                                      height: `${pct}%`,
                                      backgroundColor: barIsUp ? 'rgba(34,197,94,0.6)' : 'rgba(239,68,68,0.6)',
                                    }}
                                  />
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Link
                          href="/trade-trading-workspace"
                          className="px-3 py-1.5 rounded text-xs font-semibold transition-all hover:opacity-80 active:scale-95 inline-block"
                          style={{ backgroundColor: 'var(--primary)', color: 'var(--primary-foreground)' }}
                        >
                          Trade
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