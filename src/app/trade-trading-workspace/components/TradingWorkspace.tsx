'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import InstrumentBar from './InstrumentBar';
import ChartPanel from './ChartPanel';
import ChartToolbar from './ChartToolbar';
import OrderBook from './OrderBook';
import OrderForm from './OrderForm';
import WatchlistPanel from './WatchlistPanel';
import RecentTradesPanel from './RecentTradesPanel';
import MarketOverviewPanel from './MarketOverviewPanel';
import TopMoversPanel from './TopMoversPanel';
import LiveOrdersPanel from '@/components/trading/LiveOrdersPanel';
import { marketsService, MarketInstrument, OrderBook as OrderBookType, RecentTrade } from '@/services/markets.service';
import { LayoutGrid, ChevronDown, ChevronUp, Search } from 'lucide-react';

interface AssetCategory {
  label: string;
  symbols: string[];
}

const ASSET_CATEGORIES: AssetCategory[] = [
  { label: 'Major', symbols: ['BTC/USDC', 'ETH/USDC', 'BNB/USDC', 'SOL/USDC'] },
  { label: 'DeFi', symbols: ['UNI/USDC', 'AAVE/USDC', 'LINK/USDC', 'CRV/USDC'] },
  { label: 'Layer 1', symbols: ['ADA/USDC', 'AVAX/USDC', 'DOT/USDC', 'ATOM/USDC'] },
  { label: 'Meme', symbols: ['DOGE/USDC', 'SHIB/USDC', 'PEPE/USDC', 'FLOKI/USDC'] },
];

const MOCK_PRICES: Record<string, { price: number; change: number }> = {
  'BTC/USDC': { price: 67842, change: 2.14 },
  'ETH/USDC': { price: 3542, change: 1.87 },
  'BNB/USDC': { price: 612, change: -0.43 },
  'SOL/USDC': { price: 182, change: 3.21 },
  'UNI/USDC': { price: 12.4, change: -1.2 },
  'AAVE/USDC': { price: 184, change: 0.87 },
  'LINK/USDC': { price: 18.2, change: 2.45 },
  'CRV/USDC': { price: 0.52, change: -3.1 },
  'ADA/USDC': { price: 0.48, change: 1.05 },
  'AVAX/USDC': { price: 38.4, change: -0.78 },
  'DOT/USDC': { price: 7.82, change: 0.34 },
  'ATOM/USDC': { price: 9.14, change: 1.92 },
  'DOGE/USDC': { price: 0.162, change: 4.32 },
  'SHIB/USDC': { price: 0.0000248, change: 6.14 },
  'PEPE/USDC': { price: 0.0000142, change: -2.87 },
  'FLOKI/USDC': { price: 0.000198, change: 8.21 },
};

export default function TradingWorkspace() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDC');
  const [instruments, setInstruments] = useState<MarketInstrument[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBookType | null>(null);
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([]);
  const [selectedTool, setSelectedTool] = useState('cursor');
  const [timeframe, setTimeframe] = useState('1H');
  const [showLiveOrders, setShowLiveOrders] = useState(true);
  const [showAssetSelector, setShowAssetSelector] = useState(false);
  const [assetSearch, setAssetSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('Major');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    marketsService.getInstruments().then(setInstruments);
  }, []);

  useEffect(() => {
    marketsService.getOrderBook(selectedSymbol).then(setOrderBook);
    marketsService.getRecentTrades(selectedSymbol).then(setRecentTrades);
    const interval = setInterval(async () => {
      const [ob, rt] = await Promise.all([
        marketsService.getOrderBook(selectedSymbol),
        marketsService.getRecentTrades(selectedSymbol),
      ]);
      setOrderBook(ob);
      setRecentTrades(rt);
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedSymbol]);

  // Fullscreen handler
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      workspaceRef.current?.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const currentInstrument = instruments.find(i => i.symbol === selectedSymbol);

  const filteredSymbols = ASSET_CATEGORIES
    .find(c => c.label === activeCategory)?.symbols
    .filter(s => s.toLowerCase().includes(assetSearch.toLowerCase())) ?? [];

  const handleSelectSymbol = (symbol: string) => {
    setSelectedSymbol(symbol);
    setShowAssetSelector(false);
    setAssetSearch('');
  };

  return (
    <div
      ref={workspaceRef}
      className="flex flex-col overflow-hidden"
      style={{ height: isFullscreen ? '100vh' : 'calc(100vh - 48px)', backgroundColor: 'var(--background)' }}
    >
      {/* Asset Selector Bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b shrink-0" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <button
          onClick={() => setShowAssetSelector(!showAssetSelector)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all hover:bg-white/5"
          style={{ borderColor: showAssetSelector ? 'var(--primary)' : 'var(--border)', color: 'var(--foreground)', backgroundColor: showAssetSelector ? 'rgba(245,196,0,0.08)' : 'transparent' }}
        >
          <LayoutGrid size={13} style={{ color: 'var(--primary)' }} />
          All Assets
          {showAssetSelector ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
        </button>

        {/* Quick symbol chips */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {['BTC/USDC', 'ETH/USDC', 'BNB/USDC', 'SOL/USDC', 'DOGE/USDC', 'ADA/USDC'].map(sym => {
            const info = MOCK_PRICES[sym];
            return (
              <button
                key={sym}
                onClick={() => handleSelectSymbol(sym)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded text-xs whitespace-nowrap transition-all"
                style={{
                  backgroundColor: selectedSymbol === sym ? 'rgba(245,196,0,0.12)' : 'transparent',
                  color: selectedSymbol === sym ? 'var(--primary)' : 'var(--muted-foreground)',
                  border: `1px solid ${selectedSymbol === sym ? 'var(--primary)' : 'var(--border)'}`,
                }}
              >
                <span className="font-semibold">{sym.split('/')[0]}</span>
                {info && (
                  <span className={info.change >= 0 ? 'text-positive' : 'text-negative'}>
                    {info.change >= 0 ? '+' : ''}{info.change.toFixed(2)}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Asset Selector Dropdown */}
      {showAssetSelector && (
        <div className="shrink-0 border-b animate-fade-in" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="p-3">
            {/* Search */}
            <div className="relative mb-3">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="text"
                value={assetSearch}
                onChange={e => setAssetSearch(e.target.value)}
                placeholder="Search assets..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded border outline-none"
                style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>

            {/* Category tabs */}
            <div className="flex gap-1 mb-3">
              {ASSET_CATEGORIES.map(cat => (
                <button
                  key={cat.label}
                  onClick={() => setActiveCategory(cat.label)}
                  className="px-3 py-1 text-xs rounded transition-all"
                  style={{
                    backgroundColor: activeCategory === cat.label ? 'var(--primary)' : 'transparent',
                    color: activeCategory === cat.label ? '#000' : 'var(--muted-foreground)',
                    border: `1px solid ${activeCategory === cat.label ? 'var(--primary)' : 'var(--border)'}`,
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Asset grid */}
            <div className="grid grid-cols-4 gap-2">
              {filteredSymbols.map(sym => {
                const info = MOCK_PRICES[sym];
                const isSelected = selectedSymbol === sym;
                return (
                  <button
                    key={sym}
                    onClick={() => handleSelectSymbol(sym)}
                    className="flex flex-col items-start p-2.5 rounded-lg border transition-all hover:bg-white/5 text-left"
                    style={{
                      borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                      backgroundColor: isSelected ? 'rgba(245,196,0,0.08)' : 'transparent',
                    }}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-bold" style={{ color: isSelected ? 'var(--primary)' : 'var(--foreground)' }}>
                        {sym.split('/')[0]}
                      </span>
                      {info && (
                        <span className={`text-xs ${info.change >= 0 ? 'text-positive' : 'text-negative'}`}>
                          {info.change >= 0 ? '+' : ''}{info.change.toFixed(2)}%
                        </span>
                      )}
                    </div>
                    {info && (
                      <span className="text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>
                        ${info.price >= 1 ? info.price.toLocaleString() : info.price.toFixed(7)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Instrument bar */}
      <InstrumentBar
        instrument={currentInstrument}
        instruments={instruments}
        selectedSymbol={selectedSymbol}
        onSelectSymbol={setSelectedSymbol}
      />

      {/* Main workspace — top section */}
      <div className="flex min-h-0" style={{ flex: '1 1 0' }}>
        {/* Chart area */}
        <div className="flex min-w-0 min-h-0" style={{ flex: '1 1 0' }}>
          <div className="flex-1 min-w-0 min-h-0">
            <ChartPanel
              symbol={selectedSymbol}
              timeframe={timeframe}
              onTimeframeChange={setTimeframe}
              onFullscreen={toggleFullscreen}
              isFullscreen={isFullscreen}
            />
          </div>
          {/* Right-side vertical chart toolbar */}
          <ChartToolbar selectedTool={selectedTool} onSelectTool={setSelectedTool} />
        </div>

        {/* Order Book */}
        <div className="shrink-0 flex flex-col border-l" style={{ width: '200px', borderColor: 'var(--border)' }}>
          {orderBook && <OrderBook orderBook={orderBook} currentPrice={currentInstrument?.lastPrice || 0} />}
        </div>

        {/* Order Form */}
        <div className="shrink-0 flex flex-col border-l overflow-y-auto no-scrollbar" style={{ width: '220px', borderColor: 'var(--border)' }}>
          <OrderForm symbol={selectedSymbol} currentPrice={currentInstrument?.lastPrice || 0} />
        </div>
      </div>

      {/* Live Orders bar (collapsible) */}
      {showLiveOrders && (
        <div className="shrink-0 border-t px-3 py-2" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
          <LiveOrdersPanel symbol={selectedSymbol} />
        </div>
      )}

      {/* Bottom row: Watchlist | Recent Trades | Market Overview | Top Movers */}
      <div className="flex shrink-0 border-t" style={{ height: '200px', borderColor: 'var(--border)' }}>
        <div className="flex-1 min-w-0 border-r" style={{ borderColor: 'var(--border)' }}>
          <WatchlistPanel
            instruments={instruments}
            selectedSymbol={selectedSymbol}
            onSelectSymbol={setSelectedSymbol}
          />
        </div>
        <div className="shrink-0 border-r" style={{ width: '260px', borderColor: 'var(--border)' }}>
          <RecentTradesPanel trades={recentTrades} />
        </div>
        <div className="shrink-0 border-r" style={{ width: '280px', borderColor: 'var(--border)' }}>
          <MarketOverviewPanel symbol={selectedSymbol} instrument={currentInstrument} />
        </div>
        <div className="shrink-0" style={{ width: '240px' }}>
          <TopMoversPanel instruments={instruments} onSelectSymbol={setSelectedSymbol} />
        </div>
      </div>
    </div>
  );
}