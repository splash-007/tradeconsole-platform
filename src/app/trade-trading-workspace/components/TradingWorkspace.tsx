'use client';
import React, { useState, useEffect } from 'react';
import InstrumentBar from './InstrumentBar';
import ChartPanel from './ChartPanel';
import ChartToolbar from './ChartToolbar';
import OrderBook from './OrderBook';
import OrderForm from './OrderForm';
import WatchlistPanel from './WatchlistPanel';
import RecentTradesPanel from './RecentTradesPanel';
import MarketOverviewPanel from './MarketOverviewPanel';
import TopMoversPanel from './TopMoversPanel';
import { marketsService, MarketInstrument, OrderBook as OrderBookType, RecentTrade } from '@/services/markets.service';

export default function TradingWorkspace() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTC/USDC');
  const [instruments, setInstruments] = useState<MarketInstrument[]>([]);
  const [orderBook, setOrderBook] = useState<OrderBookType | null>(null);
  const [recentTrades, setRecentTrades] = useState<RecentTrade[]>([]);
  const [selectedTool, setSelectedTool] = useState('cursor');
  const [timeframe, setTimeframe] = useState('1H');

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

  const currentInstrument = instruments.find(i => i.symbol === selectedSymbol);

  return (
    <div className="flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 48px)', backgroundColor: 'var(--background)' }}>
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
            <ChartPanel symbol={selectedSymbol} timeframe={timeframe} onTimeframeChange={setTimeframe} />
          </div>
          {/* Right-side vertical chart toolbar — between chart and order book */}
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

      {/* Bottom row: Watchlist | Recent Trades | Market Overview | Top Movers */}
      <div className="flex shrink-0 border-t" style={{ height: '200px', borderColor: 'var(--border)' }}>
        {/* Watchlist */}
        <div className="flex-1 min-w-0 border-r" style={{ borderColor: 'var(--border)' }}>
          <WatchlistPanel
            instruments={instruments}
            selectedSymbol={selectedSymbol}
            onSelectSymbol={setSelectedSymbol}
          />
        </div>
        {/* Recent Trades */}
        <div className="shrink-0 border-r" style={{ width: '260px', borderColor: 'var(--border)' }}>
          <RecentTradesPanel trades={recentTrades} />
        </div>
        {/* Market Overview */}
        <div className="shrink-0 border-r" style={{ width: '280px', borderColor: 'var(--border)' }}>
          <MarketOverviewPanel symbol={selectedSymbol} instrument={currentInstrument} />
        </div>
        {/* Top Movers */}
        <div className="shrink-0" style={{ width: '240px' }}>
          <TopMoversPanel instruments={instruments} onSelectSymbol={setSelectedSymbol} />
        </div>
      </div>
    </div>
  );
}