'use client';
import React, { useState, useMemo } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell
} from 'recharts';
import { Camera, Maximize2, Minimize2, RotateCcw } from 'lucide-react';

interface Props {
  symbol: string;
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
  onFullscreen?: () => void;
  isFullscreen?: boolean;
}

const TIMEFRAMES = ['1m', '5m', '15m', '1H', '4H', '1D', '1D'];

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

export default function ChartPanel({ symbol, timeframe, onTimeframeChange, onFullscreen, isFullscreen }: Props) {
  const basePrice = symbol === 'BTC/USDC' ? 67842 : symbol === 'ETH/USDC' ? 3542 : 182;
  const candles = useMemo(() => generateCandles(36, basePrice * 0.96), [symbol]);

  const chartData = candles.map(c => ({
    ...c,
    bodyLow: Math.min(c.open, c.close),
    bodyHigh: Math.max(c.open, c.close),
    bodySize: Math.abs(c.close - c.open),
  }));

  // OHLC label for header
  const last = chartData[chartData.length - 1];
  const changeVal = last ? (last.close - last.open) : 0;
  const changePct = last ? ((changeVal / last.open) * 100) : 0;

  return (
    <div className="flex flex-col flex-1 min-h-0" style={{ backgroundColor: 'var(--background)' }}>
      {/* Timeframe + tools bar */}
      <div className="flex items-center gap-1 px-3 py-1.5 border-b shrink-0" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        {/* Timeframes */}
        <div className="flex items-center gap-0.5">
          {TIMEFRAMES.map((tf, idx) => (
            <button
              key={`tf-${tf}-${idx}`}
              onClick={() => onTimeframeChange(tf)}
              className={`px-2 py-1 text-xs rounded transition-all duration-150 font-medium ${
                timeframe === tf && idx === TIMEFRAMES.indexOf(tf)
                  ? 'text-gold font-bold' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
              style={timeframe === tf && idx === TIMEFRAMES.indexOf(tf) ? { color: 'var(--primary)' } : {}}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="w-px h-4 mx-1" style={{ backgroundColor: 'var(--border)' }} />

        {/* Indicators button */}
        <button className="flex items-center gap-1 px-2 py-1 text-xs rounded border transition-all hover:bg-muted" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 9L4 5L7 7L11 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Indicators
        </button>

        <div className="flex-1" />

        {/* Right icons */}
        <button className="p-1.5 rounded hover:bg-muted transition-colors" style={{ color: 'var(--muted-foreground)' }}>
          <Camera size={13} />
        </button>
        <button
          onClick={onFullscreen}
          className="p-1.5 rounded hover:bg-muted transition-colors"
          style={{ color: 'var(--muted-foreground)' }}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
        </button>
        <button className="p-1.5 rounded hover:bg-muted transition-colors" style={{ color: 'var(--muted-foreground)' }}>
          <RotateCcw size={13} />
        </button>
      </div>

      {/* OHLC info bar */}
      <div className="flex items-center gap-3 px-3 py-1 shrink-0" style={{ backgroundColor: 'var(--background)' }}>
        <span className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>
          {symbol} · {timeframe} · CRYPTO VAULT
        </span>
        {last && (
          <>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>O <span className="font-mono" style={{ color: 'var(--foreground)' }}>{last.open.toFixed(2)}</span></span>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>H <span className="font-mono text-positive">{last.high.toFixed(2)}</span></span>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>L <span className="font-mono text-negative">{last.low.toFixed(2)}</span></span>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>C <span className={`font-mono ${changeVal >= 0 ? 'text-positive' : 'text-negative'}`}>{last.close.toFixed(2)}</span></span>
            <span className={`text-xs font-semibold ${changeVal >= 0 ? 'text-positive' : 'text-negative'}`}>
              {changeVal >= 0 ? '+' : ''}{changeVal.toFixed(2)} ({changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}%)
            </span>
          </>
        )}
      </div>

      {/* Chart body */}
      <div className="flex-1 min-h-0 px-2 pb-1">
        <ResponsiveContainer width="100%" height="76%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="time"
              tick={{ fill: 'var(--muted-foreground)', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              interval={5}
            />
            <YAxis
              domain={['auto', 'auto']}
              tick={{ fill: 'var(--muted-foreground)', fontSize: 9 }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v.toFixed(0)}
              width={52}
              orientation="right"
            />
            <Tooltip content={<CustomCandleTooltip />} />
            <Bar dataKey="bodySize" fill="transparent" stroke="transparent">
              {chartData.map((entry, idx) => (
                <Cell
                  key={`cell-body-${idx}`}
                  fill={entry.isUp ? '#22c55e' : '#ef4444'}
                  stroke={entry.isUp ? '#22c55e' : '#ef4444'}
                />
              ))}
            </Bar>
            {/* MA line — gold */}
            <Line
              type="monotone"
              dataKey="close"
              stroke="var(--primary)"
              strokeWidth={1.5}
              dot={false}
              strokeOpacity={0.7}
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Volume sub-chart */}
        <ResponsiveContainer width="100%" height="21%">
          <ComposedChart data={chartData} margin={{ top: 2, right: 8, left: 0, bottom: 0 }}>
            <XAxis dataKey="time" hide />
            <YAxis hide orientation="right" width={52} />
            <Bar dataKey="volume" radius={[1, 1, 0, 0]}>
              {chartData.map((entry, idx) => (
                <Cell
                  key={`cell-vol-${idx}`}
                  fill={entry.isUp ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)'}
                />
              ))}
            </Bar>
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}