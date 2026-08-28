'use client';
import React, { useMemo } from 'react';
import { ComposedChart, Bar, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { CandleData } from '@/hooks/useRealTimeMarket';

interface Props {
  candles: CandleData[];
  width?: number;
  height?: number;
  showTooltip?: boolean;
}

interface CandleBarShape {
  x: number;
  y: number;
  width: number;
  height: number;
  payload: {
    open: number;
    close: number;
    high: number;
    low: number;
    scaledOpen: number;
    scaledClose: number;
    scaledHigh: number;
    scaledLow: number;
    isUp: boolean;
  };
}

// Custom candle shape rendered as SVG
function CandleShape(props: CandleBarShape) {
  const { x, y, width, payload } = props;
  if (!payload) return null;

  const { scaledOpen, scaledClose, scaledHigh, scaledLow, isUp } = payload;
  const color = isUp ? '#22c55e' : '#ef4444';
  const bodyTop = Math.min(scaledOpen, scaledClose);
  const bodyBottom = Math.max(scaledOpen, scaledClose);
  const bodyHeight = Math.max(bodyBottom - bodyTop, 1);
  const wickX = x + width / 2;

  return (
    <g>
      {/* Wick */}
      <line
        x1={wickX}
        y1={scaledHigh}
        x2={wickX}
        y2={scaledLow}
        stroke={color}
        strokeWidth={1}
        opacity={0.8}
      />
      {/* Body */}
      <rect
        x={x + 1}
        y={bodyTop}
        width={Math.max(width - 2, 2)}
        height={bodyHeight}
        fill={color}
        opacity={0.9}
        rx={0.5}
      />
    </g>
  );
}

export default function MiniCandleChart({ candles, width = 80, height = 36, showTooltip = false }: Props) {
  const chartData = useMemo(() => {
    if (!candles || candles.length < 2) return [];

    const allPrices = candles.flatMap(c => [c.high, c.low]);
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const range = maxPrice - minPrice || 1;
    const padding = height * 0.05;
    const chartHeight = height - padding * 2;

    const scale = (price: number) =>
      padding + chartHeight - ((price - minPrice) / range) * chartHeight;

    return candles.map((c, i) => ({
      index: i,
      open: c.open,
      close: c.close,
      high: c.high,
      low: c.low,
      isUp: c.close >= c.open,
      scaledOpen: scale(c.open),
      scaledClose: scale(c.close),
      scaledHigh: scale(c.high),
      scaledLow: scale(c.low),
      // Bar value is always the full height so recharts renders the bar
      barValue: height,
    }));
  }, [candles, height]);

  if (chartData.length < 2) {
    // Fallback skeleton while loading
    return (
      <div
        style={{ width, height }}
        className="flex items-end gap-px px-0.5"
      >
        {Array.from({ length: 12 }, (_, i) => (
          <div
            key={`skel-${i}`}
            className="flex-1 rounded-sm animate-pulse"
            style={{
              height: `${30 + Math.sin(i) * 20}%`,
              backgroundColor: 'var(--muted)',
              opacity: 0.5,
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <ResponsiveContainer width={width} height={height}>
      <ComposedChart
        data={chartData}
        margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
      >
        <XAxis dataKey="index" hide />
        <YAxis hide domain={[0, height]} />
        {showTooltip && (
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const d = payload[0].payload;
              const isUp = d.isUp;
              return (
                <div
                  className="text-xs rounded px-2 py-1 shadow-lg"
                  style={{
                    backgroundColor: 'var(--card)',
                    border: '1px solid var(--border)',
                    color: 'var(--foreground)',
                    fontSize: '10px',
                  }}
                >
                  <div style={{ color: isUp ? '#22c55e' : '#ef4444' }}>
                    {isUp ? '▲' : '▼'} {isUp ? 'Bullish' : 'Bearish'}
                  </div>
                  <div>O: {d.open?.toFixed(2)}</div>
                  <div>H: {d.high?.toFixed(2)}</div>
                  <div>L: {d.low?.toFixed(2)}</div>
                  <div>C: {d.close?.toFixed(2)}</div>
                </div>
              );
            }}
          />
        )}
        <Bar
          dataKey="barValue"
          shape={(props: unknown) => <CandleShape {...(props as CandleBarShape)} />}
          isAnimationActive={false}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.isUp ? '#22c55e' : '#ef4444'}
            />
          ))}
        </Bar>
      </ComposedChart>
    </ResponsiveContainer>
  );
}
