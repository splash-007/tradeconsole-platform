'use client';
import React, { useState, useEffect } from 'react';
import InstrumentBar from './InstrumentBar';
import ChartPanel from './ChartPanel';
import ChartToolbar from './ChartToolbar';
import OrderBook from './OrderBook';
import OrderForm from './OrderForm';
import WatchlistPanel from './WatchlistPanel';
import RecentTradesPanel from './RecentTradesPanel';
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
    <div className="flex flex-col h-[calc(100vh-48px)] overflow-hidden">
      {/* Instrument bar */}
      <InstrumentBar
        instrument={currentInstrument}
        instruments={instruments}
        selectedSymbol={selectedSymbol}
        onSelectSymbol={setSelectedSymbol}
      />

      {/* Main workspace */}
      <div className="flex flex-1 min-h-0">
        {/* Chart + toolbar */}
        <div className="flex flex-1 min-w-0 min-h-0">
          {/* Chart */}
          <div className="flex-1 min-w-0 min-h-0 flex flex-col">
            <ChartPanel symbol={selectedSymbol} timeframe={timeframe} onTimeframeChange={setTimeframe} />
          </div>
          {/* Right-side chart toolbar */}
          <ChartToolbar selectedTool={selectedTool} onSelectTool={setSelectedTool} />
        </div>

        {/* Right column: Order book + Order form */}
        <div className="w-64 xl:w-72 shrink-0 flex flex-col border-l" style={{ borderColor: 'var(--border)' }}>
          <div className="flex-1 min-h-0 overflow-hidden border-b" style={{ borderColor: 'var(--border)' }}>
            {orderBook && <OrderBook orderBook={orderBook} currentPrice={currentInstrument?.lastPrice || 0} />}
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
            <OrderForm symbol={selectedSymbol} currentPrice={currentInstrument?.lastPrice || 0} />
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="flex border-t shrink-0" style={{ borderColor: 'var(--border)', height: '180px' }}>
        <div className="flex-1 min-w-0 border-r" style={{ borderColor: 'var(--border)' }}>
          <WatchlistPanel
            instruments={instruments}
            selectedSymbol={selectedSymbol}
            onSelectSymbol={setSelectedSymbol}
          />
        </div>
        <div className="w-64 xl:w-72 shrink-0">
          <RecentTradesPanel trades={recentTrades} />
        </div>
      </div>
    </div>
  );
}