'use client';
import React, { useEffect, useState } from 'react';
import { marketDataService, MarketQuote } from '@/services/market-data.service';
import { PageHeader, Card, AdminTable, KpiCard } from '@/components/admin/AdminUI';

export default function AdminTradingMarketContent() {
  const [quotes, setQuotes] = useState<MarketQuote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const symbols = ['BTC/USDC', 'ETH/USDC', 'SOL/USDC', 'XAU/USD', 'EUR/USD', 'BNB/USDC', 'ADA/USDC', 'XRP/USDC'];
    marketDataService.getQuotes(symbols).then(d => { setQuotes(d); setLoading(false); });
    const unsub = marketDataService.subscribe(symbols, (q) => {
      setQuotes(prev => prev.map(p => p.symbol === q.symbol ? q : p));
    });
    return unsub;
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader title="Market Overview" subtitle="All prices via centralized market-data.service" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Tracked Instruments" value={quotes.length} />
        <KpiCard label="Gainers" value={quotes.filter(q => q.changePct24h > 0).length} />
        <KpiCard label="Losers" value={quotes.filter(q => q.changePct24h < 0).length} />
        <KpiCard label="Neutral" value={quotes.filter(q => q.changePct24h === 0).length} />
      </div>
      <Card padding="p-0">
        <AdminTable
          columns={[
            { key: 'symbol', label: 'Symbol', render: (q: MarketQuote) => <span className="font-mono font-bold" style={{ color: 'var(--primary)' }}>{q.symbol}</span> },
            { key: 'name', label: 'Name' },
            { key: 'price', label: 'Price', render: (q: MarketQuote) => <span className="font-mono">${q.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span> },
            { key: 'changePct24h', label: '24h Change', render: (q: MarketQuote) => (
              <span style={{ color: q.changePct24h >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
                {q.changePct24h >= 0 ? '+' : ''}{q.changePct24h.toFixed(2)}%
              </span>
            )},
            { key: 'high24h', label: '24h High', render: (q: MarketQuote) => `$${q.high24h.toLocaleString()}` },
            { key: 'low24h', label: '24h Low', render: (q: MarketQuote) => `$${q.low24h.toLocaleString()}` },
          ]}
          data={quotes.map(q => ({ ...q, id: q.symbol }))}
          loading={loading}
        />
      </Card>
    </div>
  );
}
