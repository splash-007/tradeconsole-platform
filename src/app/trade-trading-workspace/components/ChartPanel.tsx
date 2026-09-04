'use client';
import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import { Camera, Maximize2, Minimize2, RotateCcw, Wifi, WifiOff } from 'lucide-react';
import { useRealTimeMarket, CandleData } from '@/hooks/useRealTimeMarket';

interface Props {
  symbol: string;
  timeframe: string;
  onTimeframeChange: (tf: string) => void;
  onFullscreen?: () => void;
  isFullscreen?: boolean;
}

const TIMEFRAMES = ['1m', '5m', '15m', '1H', '4H', '1D', '1W'];

const SYMBOL_MAP: Record<string, string> = {
  'BTC/USDC': 'BTC/USDC',
  'ETH/USDC': 'ETH/USDC',
  'BNB/USDC': 'BNB/USDC',
  'SOL/USDC': 'SOL/USDC',
  'ADA/USDC': 'ADA/USDC',
  'AVAX/USDC': 'AVAX/USDC',
  'DOT/USDC': 'DOT/USDC',
  'XRP/USDC': 'XRP/USDC',
};

const BASE_PRICES: Record<string, number> = {
  'BTC/USDC': 67842,
  'ETH/USDC': 3542,
  'BNB/USDC': 612,
  'SOL/USDC': 182,
  'ADA/USDC': 0.48,
  'AVAX/USDC': 38.4,
  'DOT/USDC': 7.82,
  'XRP/USDC': 0.624,
};

function generateFallbackCandles(count: number, basePrice: number) {
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
    const label = `${ts.getHours().toString().padStart(2,'0')}:00`;
    const isUp = close >= open;
    candles.push({
      time: label,
      open,
      close,
      high,
      low,
      volume,
      isUp,
      bodyLow: Math.min(open, close),
      bodyHigh: Math.max(open, close),
      bodySize: Math.abs(close - open),
      wickHigh: high,
      wickLow: low,
    });
    price = close;
  }
  return candles;
}

function candleDataToChartFormat(candles: CandleData[]) {
  return candles.map(c => {
    const d = new Date(c.time * 1000);
    const label = `${d.getHours().toString().padStart(2,'0')}:00`;
    const isUp = c.close >= c.open;
    return {
      time: label,
      open: c.open,
      close: c.close,
      high: c.high,
      low: c.low,
      volume: Math.random() * 800 + 100,
      isUp,
      bodyLow: Math.min(c.open, c.close),
      bodyHigh: Math.max(c.open, c.close),
      bodySize: Math.abs(c.close - c.open),
      wickHigh: c.high,
      wickLow: c.low,
    };
  });
}

const CustomCandleTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  return (
    <div className="px-3 py-2 rounded border shadow-xl text-xs space-y-1" style={{ backgroundColor: '#111111', borderColor: '#2a2a2a' }}>
      <p className="font-semibold text-gray-400">{label}</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
        <span className="text-gray-500">O</span>
        <span className="tabular-nums font-mono text-right text-white">{d.open?.toFixed(2)}</span>
        <span className="text-gray-500">H</span>
        <span className="tabular-nums font-mono text-right text-green-400">{d.high?.toFixed(2)}</span>
        <span className="text-gray-500">L</span>
        <span className="tabular-nums font-mono text-right text-red-400">{d.low?.toFixed(2)}</span>
        <span className="text-gray-500">C</span>
        <span className={`tabular-nums font-mono text-right ${d.isUp ? 'text-green-400' : 'text-red-400'}`}>{d.close?.toFixed(2)}</span>
        <span className="text-gray-500">Vol</span>
        <span className="tabular-nums font-mono text-right text-white">{d.volume?.toFixed(1)}</span>
      </div>
    </div>
  );
};

const ALL_LIVE_SYMBOLS = ['BTC/USDC', 'ETH/USDC', 'SOL/USDC', 'BNB/USDC', 'XRP/USDC', 'ADA/USDC', 'AVAX/USDC', 'DOT/USDC'];

export default function ChartPanel({ symbol, timeframe, onTimeframeChange, onFullscreen, isFullscreen }: Props) {
  const mappedSymbol = SYMBOL_MAP[symbol] ?? null;
  const { quotes, candles } = useRealTimeMarket(ALL_LIVE_SYMBOLS);

  const liveCandles = mappedSymbol ? candles[mappedSymbol] : undefined;
  const liveQuote = mappedSymbol ? quotes[mappedSymbol] : undefined;
  const isLive = !!liveQuote;

  const basePrice = BASE_PRICES[symbol] ?? 100;

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height);
      }
    });
    ro.observe(el);
    setContainerHeight(el.getBoundingClientRect().height);
    return () => ro.disconnect();
  }, []);

  const chartData = useMemo(() => {
    if (liveCandles && liveCandles.length >= 2) {
      return candleDataToChartFormat(liveCandles);
    }
    return generateFallbackCandles(48, basePrice * 0.96);
  }, [liveCandles, basePrice]);

  const last = chartData[chartData.length - 1];
  const liveClose: number = liveQuote?.price ?? last?.close ?? 0;
  const displayLast = last ? { ...last, close: liveClose } : last;
  const changeVal = displayLast ? (displayLast.close - displayLast.open) : 0;
  const changePct = displayLast && displayLast.open > 0 ? ((changeVal / displayLast.open) * 100) : 0;

  // Chart area: toolbar=32px, ohlcBar=24px, xAxis is INSIDE the main chart (bottom margin)
  const toolbarHeight = 32;
  const ohlcBarHeight = 24;
  const reservedHeight = toolbarHeight + ohlcBarHeight + 4;
  const availableHeight = containerHeight > reservedHeight + 60 ? containerHeight - reservedHeight : 320;
  // Main chart gets 78%, volume gets 20%, 2% gap
  const mainChartHeight = Math.floor(availableHeight * 0.78);
  const volumeChartHeight = Math.floor(availableHeight * 0.20);

  // Terminal colors
  const termBg = '#000000';
  const termSurface = '#080808';
  const termBorder = '#1a1a1a';
  const termMuted = '#555555';

  return (
    <div className="flex flex-col h-full w-full" style={{ backgroundColor: termBg }}>
      {/* Timeframe + tools bar */}
      <div
        className="flex items-center gap-1 px-2 py-1 border-b shrink-0"
        style={{ backgroundColor: termSurface, borderColor: termBorder, height: `${toolbarHeight}px` }}
      >
        {/* Timeframes */}
        <div className="flex items-center gap-0">
          {TIMEFRAMES.map((tf, idx) => (
            <button
              key={`tf-${tf}-${idx}`}
              onClick={() => onTimeframeChange(tf)}
              className="px-2 py-0.5 text-xs rounded transition-all duration-150 font-medium"
              style={timeframe === tf
                ? { color: 'var(--primary)', fontWeight: 700, backgroundColor: 'rgba(245,196,0,0.1)' }
                : { color: termMuted }}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="w-px h-3 mx-1" style={{ backgroundColor: termBorder }} />

        {/* Indicators button */}
        <button
          className="flex items-center gap-1 px-2 py-0.5 text-xs rounded border transition-all"
          style={{ borderColor: termBorder, color: termMuted, backgroundColor: 'transparent' }}
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M1 9L4 5L7 7L11 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Indicators
        </button>

        <div className="flex-1" />

        {/* Live status */}
        <div
          className="flex items-center gap-1 px-2 py-0.5 rounded text-xs"
          style={{
            backgroundColor: isLive ? 'rgba(34,197,94,0.08)' : 'rgba(245,196,0,0.06)',
            color: isLive ? '#22c55e' : '#6b7280',
          }}
        >
          {isLive ? <Wifi size={10} /> : <WifiOff size={10} />}
          <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-yellow-600 animate-pulse'}`} />
          <span className="hidden sm:inline">{isLive ? 'Live' : 'Mock'}</span>
        </div>

        <button className="p-1 rounded transition-colors" style={{ color: termMuted }}>
          <Camera size={12} />
        </button>
        <button
          onClick={onFullscreen}
          className="p-1 rounded transition-colors"
          style={{ color: termMuted }}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
        </button>
        <button className="p-1 rounded transition-colors" style={{ color: termMuted }}>
          <RotateCcw size={12} />
        </button>
      </div>

      {/* OHLC info bar */}
      <div
        className="flex items-center gap-2 px-3 shrink-0"
        style={{ backgroundColor: termBg, height: `${ohlcBarHeight}px` }}
      >
        <span className="text-xs font-semibold text-gray-500">
          {symbol} · {timeframe} · Trade Console
        </span>
        {displayLast && (
          <>
            <span className="text-xs text-gray-600">O <span className="font-mono text-white">{displayLast.open.toFixed(2)}</span></span>
            <span className="text-xs text-gray-600">H <span className="font-mono text-green-400">{displayLast.high.toFixed(2)}</span></span>
            <span className="text-xs text-gray-600">L <span className="font-mono text-red-400">{displayLast.low.toFixed(2)}</span></span>
            <span className="text-xs text-gray-600">C <span className={`font-mono ${changeVal >= 0 ? 'text-green-400' : 'text-red-400'}`}>{liveClose.toFixed(2)}</span></span>
            <span className={`text-xs font-semibold ${changeVal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {changeVal >= 0 ? '+' : ''}{changeVal.toFixed(2)} ({changePct >= 0 ? '+' : ''}{changePct.toFixed(2)}%)
            </span>
            {isLive && liveQuote && (
              <span className="text-xs font-bold tabular-nums font-mono" style={{ color: 'var(--primary)' }}>
                ${liveQuote.price >= 1000 ? liveQuote.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : liveQuote.price.toFixed(4)}
              </span>
            )}
          </>
        )}
      </div>

      {/* Chart body — measured container, fills all remaining height */}
      <div ref={containerRef} className="flex-1 min-h-0 flex flex-col" style={{ backgroundColor: termBg }}>
        {/* Main candlestick chart — X-axis at bottom of this chart */}
        {mainChartHeight > 0 && (
          <div style={{ height: mainChartHeight, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 6, right: 60, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 6" stroke="rgba(255,255,255,0.03)" vertical={false} />
                <XAxis
                  dataKey="time"
                  tick={{ fill: '#555555', fontSize: 9, fontFamily: 'monospace' }}
                  axisLine={{ stroke: '#222222' }}
                  tickLine={false}
                  interval={Math.floor(chartData.length / 8)}
                  height={18}
                />
                <YAxis
                  domain={['auto', 'auto']}
                  tick={{ fill: '#555555', fontSize: 9, fontFamily: 'monospace' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(1)}K` : v >= 1 ? v.toFixed(0) : v.toFixed(4)}
                  width={58}
                  orientation="right"
                />
                <Tooltip content={<CustomCandleTooltip />} />

                {/* Candle body bars */}
                <Bar dataKey="bodySize" fill="transparent" stroke="transparent" minPointSize={1}>
                  {chartData.map((entry, idx) => (
                    <Cell
                      key={`cell-body-${idx}`}
                      fill={entry.isUp ? '#22c55e' : '#ef4444'}
                      stroke={entry.isUp ? '#22c55e' : '#ef4444'}
                    />
                  ))}
                </Bar>

                {/* Current price reference line */}
                {liveClose && (
                  <ReferenceLine
                    y={liveClose}
                    stroke="var(--primary)"
                    strokeDasharray="4 3"
                    strokeWidth={1}
                    label={{ value: liveClose.toFixed(2), position: 'right', fill: 'var(--primary)', fontSize: 9 }}
                  />
                )}

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
          </div>
        )}

        {/* Volume sub-chart — no X-axis (already shown above), sits directly below */}
        {volumeChartHeight > 0 && (
          <div style={{ height: volumeChartHeight, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 0, right: 60, left: 0, bottom: 0 }}>
                <XAxis dataKey="time" hide />
                <YAxis hide orientation="right" width={58} />
                <Bar dataKey="volume" radius={[1, 1, 0, 0]}>
                  {chartData.map((entry, idx) => (
                    <Cell
                      key={`cell-vol-${idx}`}
                      fill={entry.isUp ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}
                    />
                  ))}
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Loading state */}
        {containerHeight === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="w-5 h-5 border-2 rounded-full animate-spin" style={{ borderColor: '#222', borderTopColor: 'var(--primary)' }} />
              <span className="text-xs text-gray-600">Loading chart…</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}