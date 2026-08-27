'use client';
import React, { useState, useMemo } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';

interface Props {
  symbol: string;
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
}

const TIMEFRAMES = ['1m', '5m', '15m', '1H', '4H', '1D'];

function generateCandles(count: number, basePrice: number) {
  const candles = [];
  let price = basePrice;
  const now = Date.now();
  for (let i = count - 1; i >= 0; i--) {
    const open = price;
    const change = (Math.random() - 0.48) * price * 0.012;
    const close = open + change;
    const high = Math.max(open, close) + Math.random() * price * 0.004;
    const low = Math.min(open, close) - Math.random() * price * 0.004;
    const volume = Math.random() * 800 + 100;
    const ts = new Date(now - i * 3600000);
    const label = `${ts.getMonth() + 1}/${ts.getDate()} ${ts.getHours()}:00`;
    candles.push({ time: label, open, close, high, low, volume, isUp: close >= open });
    price = close;
  }
  return candles;
}

const CustomCandleTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="px-3 py-2 rounded-md border shadow-xl text-xs space-y-1" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <p className="font-semibold" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
        <span style={{ color: 'var(--muted-foreground)' }}>O</span>
        <span className="tabular-nums font-mono text-right" style={{ color: 'var(--foreground)' }}>{d.open?.toFixed(2)}</span>
        <span style={{ color: 'var(--muted-foreground)' }}>H</span>
        <span className="tabular-nums font-mono text-right text-positive">{d.high?.toFixed(2)}</span>
        <span style={{ color: 'var(--muted-foreground)' }}>L</span>
        <span className="tabular-nums font-mono text-right text-negative">{d.low?.toFixed(2)}</span>
        <span style={{ color: 'var(--muted-foreground)' }}>C</span>
        <span className={`tabular-nums font-mono text-right ${d.isUp ? 'text-positive' : 'text-negative'}`}>{d.close?.toFixed(2)}</span>
        <span style={{ color: 'var(--muted-foreground)' }}>Vol</span>
        <span className="tabular-nums font-mono text-right" style={{ color: 'var(--foreground)' }}>{d.volume?.toFixed(1)}</span>
      </div>
    </div>
  );
};

export default function ChartPanel({ symbol, timeframe, onTimeframeChange }: Props) {
  const basePrice = symbol === 'BTC/USDC' ? 67842 : symbol === 'ETH/USDC' ? 3542 : 182;
  const candles = useMemo(() => generateCandles(32, basePrice * 0.96), [symbol]);

  // For candlestick simulation: use Bar for body, Line for high/low wicks
  const chartData = candles.map(c => ({
    ...c,
    bodyLow: Math.min(c.open, c.close),
    bodyHigh: Math.max(c.open, c.close),
    bodySize: Math.abs(c.close - c.open),
    wickRange: [c.low, c.high],
  }));

  return (
    <div className="flex flex-col flex-1 min-h-0" style={{ backgroundColor: 'var(--background)' }}>
      {/* Chart toolbar top */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b shrink-0" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        {/* Timeframes */}
        <div className="flex items-center gap-0.5">
          {TIMEFRAMES.map(tf => (
            <button
              key={`tf-${tf}`}
              onClick={() => onTimeframeChange(tf)}
              className={`px-2 py-1 text-xs rounded transition-all duration-150 font-medium ${
                timeframe === tf
                  ? 'bg-primary-subtle text-gold' :'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="w-px h-4 mx-1" style={{ backgroundColor: 'var(--border)' }} />

        {/* Chart type */}
        {['Candles', 'Line', 'Area'].map(ct => (
          <button
            key={`ct-${ct}`}
            className={`px-2 py-1 text-xs rounded transition-all ${ct === 'Candles' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
          >
            {ct}
          </button>
        ))}

        <div className="flex-1" />

        {/* Indicators */}
        <button className="px-2 py-1 text-xs rounded border transition-all hover:bg-muted" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
          MA(7)
        </button>
        <button className="px-2 py-1 text-xs rounded border transition-all hover:bg-muted" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
          MA(25)
        </button>
        <button className="px-2 py-1 text-xs rounded border transition-all hover:bg-muted" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
          + Indicator
        </button>
      </div>

      {/* Chart body */}
      <div className="flex-1 min-h-0 p-2">
        <ResponsiveContainer width="100%" height="75%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" />
            <XAxis
              dataKey="time"
              tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              interval={4}
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v.toFixed(0)}
              width={56}
              orientation="right"
            />
            <Tooltip content={<CustomCandleTooltip />} />
            {/* Wick lines */}
            <Bar dataKey="bodySize" stackId="candle" fill="transparent" stroke="transparent">
              {chartData.map((entry, idx) => (
                <Cell
                  key={`cell-body-${idx}`}
                  fill={entry.isUp ? 'var(--positive)' : 'var(--negative)'}
                  stroke={entry.isUp ? 'var(--positive)' : 'var(--negative)'}
                />
              ))}
            </Bar>
            {/* MA line */}
            <Line
              type="monotone"
              dataKey="close"
              stroke="var(--primary)"
              strokeWidth={1}
              dot={false}
              strokeOpacity={0.5}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Volume sub-chart */}
        <ResponsiveContainer width="100%" height="22%">
          <ComposedChart data={chartData} margin={{ top: 2, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="time" hide />
            <YAxis hide orientation="right" width={56} />
            <Bar dataKey="volume" radius={[1, 1, 0, 0]}>
              {chartData.map((entry, idx) => (
                <Cell
                  key={`cell-vol-${idx}`}
                  fill={entry.isUp ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}
                />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}