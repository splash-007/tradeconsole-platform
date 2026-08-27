import React from 'react';
import { MarketInstrument } from '@/services/markets.service';

interface Props { instruments: MarketInstrument[]; }

export default function MarketSummary({ instruments }: Props) {
  const cryptos = instruments.filter(i => i.category === 'crypto');
  const totalMcap = cryptos.reduce((a, b) => a + b.marketCap, 0);
  const btc = cryptos.find(i => i.baseCurrency === 'BTC');
  const btcDominance = btc ? (btc.marketCap / totalMcap * 100).toFixed(1) : '—';

  return (
    <div className="rounded-lg border p-4 h-full" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <h3 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Market Overview</h3>
      <div className="space-y-3">
        {[
          { label: 'Total Market Cap', value: `$${(totalMcap / 1e12).toFixed(2)}T` },
          { label: 'BTC Dominance', value: `${btcDominance}%` },
          { label: '24h Volume (Crypto)', value: `$${(cryptos.reduce((a, b) => a + b.volume24h, 0) / 1e9).toFixed(1)}B` },
          { label: 'Active Instruments', value: instruments.length.toString() },
          { label: 'Gainers / Losers', value: `${instruments.filter(i => i.changePct24h > 0).length} / ${instruments.filter(i => i.changePct24h < 0).length}` },
        ].map(({ label, value }) => (
          <div key={`ms-${label}`} className="flex items-center justify-between">
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
            <span className="text-xs font-semibold tabular-nums font-mono" style={{ color: 'var(--foreground)' }}>{value}</span>
          </div>
        ))}
      </div>

      {/* BTC Fear/Greed placeholder */}
      <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <p className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>Fear & Greed Index</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--muted)' }}>
            <div className="h-full rounded-full" style={{ width: '68%', backgroundColor: 'var(--positive)' }} />
          </div>
          <span className="text-sm font-bold text-positive tabular-nums">68</span>
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Greed</span>
        </div>
      </div>
    </div>
  );
}