'use client';
import React from 'react';

export type AssetType = 'crypto' | 'forex' | 'stock' | 'etf' | 'index' | 'commodity' | 'metal' | 'energy';

interface AssetIconProps {
  symbol: string;
  assetType?: AssetType;
  size?: number;
  className?: string;
}

// ── Crypto SVG marks ─────────────────────────────────────────────────────────

function BitcoinIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#F7931A" />
      <path d="M22.5 13.8c.3-2-1.2-3.1-3.3-3.8l.7-2.7-1.6-.4-.7 2.6c-.4-.1-.8-.2-1.3-.3l.7-2.6-1.6-.4-.7 2.7c-.3-.1-.7-.2-1-.3v0l-2.2-.6-.4 1.7s1.2.3 1.2.3c.7.2.8.7.8 1l-.8 3.3c0 .1.1.1.1.2-.1 0-.1 0-.2-.1l-1.2-.3-.7 1.8 2.1.5c.4.1.8.2 1.1.3l-.7 2.8 1.6.4.7-2.7c.4.1.9.2 1.3.3l-.7 2.7 1.6.4.7-2.8c2.9.5 5.1.3 6-2.3.7-2-.1-3.2-1.5-3.9 1.1-.3 1.9-1 2.1-2.5zm-3.8 5.3c-.5 2-3.9.9-5 .6l.9-3.5c1.1.3 4.6.8 4.1 2.9zm.5-5.3c-.5 1.8-3.3.9-4.3.7l.8-3.2c1 .3 4 .7 3.5 2.5z" fill="white" />
    </svg>
  );
}

function EthereumIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#627EEA" />
      <path d="M16 6v7.4l6.3 2.8L16 6z" fill="white" fillOpacity="0.6" />
      <path d="M16 6L9.7 16.2l6.3-2.8V6z" fill="white" />
      <path d="M16 21.5v4.5l6.3-8.7L16 21.5z" fill="white" fillOpacity="0.6" />
      <path d="M16 26v-4.5l-6.3-4.2L16 26z" fill="white" />
      <path d="M16 20.3l6.3-3.7-6.3-2.8v6.5z" fill="white" fillOpacity="0.2" />
      <path d="M9.7 16.6l6.3 3.7v-6.5l-6.3 2.8z" fill="white" fillOpacity="0.6" />
    </svg>
  );
}

function SolanaIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#9945FF" />
      <path d="M9 20.5h10.5c.2 0 .3.1.4.2l1.6 1.7c.1.1.1.3-.1.3H11c-.2 0-.3-.1-.4-.2L9 20.8c-.1-.1-.1-.3 0-.3z" fill="white" />
      <path d="M9 14.8h10.5c.2 0 .3.1.4.2l1.6 1.7c.1.1.1.3-.1.3H11c-.2 0-.3-.1-.4-.2L9 15.1c-.1-.1-.1-.3 0-.3z" fill="white" />
      <path d="M9 9.1h10.5c.2 0 .3.1.4.2l1.6 1.7c.1.1.1.3-.1.3H11c-.2 0-.3-.1-.4-.2L9 9.4c-.1-.1-.1-.3 0-.3z" fill="white" />
    </svg>
  );
}

function XRPIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#00AAE4" />
      <path d="M22 9h2.5l-5.4 5.3c-1.7 1.7-4.5 1.7-6.2 0L7.5 9H10l4.2 4.1c1.2 1.2 3.1 1.2 4.3 0L22 9zM10 23H7.5l5.4-5.3c1.7-1.7 4.5-1.7 6.2 0L24.5 23H22l-4.2-4.1c-1.2-1.2-3.1-1.2-4.3 0L10 23z" fill="white" />
    </svg>
  );
}

function BNBIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#F3BA2F" />
      <path d="M12.1 14.1L16 10.2l3.9 3.9 2.3-2.3L16 5.6l-6.2 6.2 2.3 2.3zM5.6 16l2.3-2.3 2.3 2.3-2.3 2.3L5.6 16zm6.5 1.9L16 21.8l3.9-3.9 2.3 2.3L16 26.4l-6.2-6.2 2.3-2.3zm10.1-1.9l2.3-2.3 2.3 2.3-2.3 2.3-2.3-2.3zm-3.8 0L16 13.8l-2.4 2.2 2.4 2.2 2.4-2.2z" fill="white" />
    </svg>
  );
}

function ADAIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#0033AD" />
      <circle cx="16" cy="10" r="1.5" fill="white" />
      <circle cx="16" cy="22" r="1.5" fill="white" />
      <circle cx="10" cy="13" r="1.5" fill="white" />
      <circle cx="22" cy="13" r="1.5" fill="white" />
      <circle cx="10" cy="19" r="1.5" fill="white" />
      <circle cx="22" cy="19" r="1.5" fill="white" />
      <circle cx="16" cy="16" r="2" fill="white" fillOpacity="0.4" />
    </svg>
  );
}

function DOTIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#E6007A" />
      <circle cx="16" cy="9" r="3" fill="white" />
      <circle cx="16" cy="23" r="3" fill="white" />
      <circle cx="9" cy="16" r="3" fill="white" />
      <circle cx="23" cy="16" r="3" fill="white" />
      <circle cx="16" cy="16" r="2.5" fill="white" fillOpacity="0.3" />
    </svg>
  );
}

function AVAXIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#E84142" />
      <path d="M19.5 21h3.8c.4 0 .6-.4.4-.7l-7.3-12.6c-.2-.3-.6-.3-.8 0L8.3 20.3c-.2.3 0 .7.4.7h3.8c.3 0 .5-.1.6-.4l2.9-5 2.9 5c.1.3.3.4.6.4z" fill="white" />
    </svg>
  );
}

function LINKIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#2A5ADA" />
      <path d="M16 7l-1.5.9-5.5 3.2-1.5.9v8.1l1.5.9 5.5 3.2 1.5.9 1.5-.9 5.5-3.2 1.5-.9V12l-1.5-.9-5.5-3.2L16 7zm0 2.8l4 2.3v4.6l-4 2.3-4-2.3v-4.6l4-2.3z" fill="white" />
    </svg>
  );
}

function UNIIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#FF007A" />
      <path d="M12.5 10c-.5 0-.9.4-.9.9 0 .3.1.5.3.7l1.5 1.5c.2.2.2.5 0 .7l-3.5 3.5c-.4.4-.4 1 0 1.4l5 5c.4.4 1 .4 1.4 0l5-5c.4-.4.4-1 0-1.4l-3.5-3.5c-.2-.2-.2-.5 0-.7l1.5-1.5c.2-.2.3-.4.3-.7 0-.5-.4-.9-.9-.9H12.5z" fill="white" />
    </svg>
  );
}

function DOGEIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#C2A633" />
      <text x="16" y="21" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white" fontFamily="serif">Ð</text>
    </svg>
  );
}

function SHIBIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#E0531B" />
      <path d="M8 20c2-4 4-6 8-6s6 2 8 6" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <circle cx="12" cy="14" r="1.5" fill="white" />
      <circle cx="20" cy="14" r="1.5" fill="white" />
      <path d="M13 22c1-1 5-1 6 0" stroke="white" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function PEPEIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#00A550" />
      <ellipse cx="16" cy="18" rx="7" ry="6" fill="#4CAF50" />
      <circle cx="13" cy="15" r="2" fill="white" />
      <circle cx="19" cy="15" r="2" fill="white" />
      <circle cx="13.5" cy="15" r="1" fill="#1a1a1a" />
      <circle cx="19.5" cy="15" r="1" fill="#1a1a1a" />
      <path d="M13 20c1-1.5 5-1.5 6 0" stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round" fill="none" />
    </svg>
  );
}

function FLOKIIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#F5A623" />
      <path d="M10 22L16 10L22 22H10z" fill="white" fillOpacity="0.9" />
      <path d="M13 18h6" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ATOMIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#2E3148" />
      <circle cx="16" cy="16" r="3" fill="white" />
      <ellipse cx="16" cy="16" rx="9" ry="4" stroke="white" strokeWidth="1.2" fill="none" />
      <ellipse cx="16" cy="16" rx="9" ry="4" stroke="white" strokeWidth="1.2" fill="none" transform="rotate(60 16 16)" />
      <ellipse cx="16" cy="16" rx="9" ry="4" stroke="white" strokeWidth="1.2" fill="none" transform="rotate(120 16 16)" />
    </svg>
  );
}

function MATICIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#8247E5" />
      <path d="M20.5 13.5c-.4-.2-.9-.2-1.3 0l-3 1.7-2 1.1-3 1.7c-.4.2-.9.2-1.3 0l-2.4-1.4c-.4-.2-.6-.6-.6-1.1v-2.7c0-.4.2-.8.6-1.1l2.4-1.4c.4-.2.9-.2 1.3 0l2.4 1.4c.4.2.6.6.6 1.1v1.7l2-1.1v-1.7c0-.4-.2-.8-.6-1.1l-4.3-2.5c-.4-.2-.9-.2-1.3 0l-4.4 2.5c-.4.2-.6.6-.6 1.1v5c0 .4.2.8.6 1.1l4.4 2.5c.4.2.9.2 1.3 0l3-1.7 2-1.1 3-1.7c.4-.2.9-.2 1.3 0l2.4 1.4c.4.2.6.6.6 1.1v2.7c0 .4-.2.8-.6 1.1l-2.4 1.4c-.4.2-.9.2-1.3 0l-2.4-1.4c-.4-.2-.6-.6-.6-1.1v-1.7l-2 1.1v1.7c0 .4.2.8.6 1.1l4.3 2.5c.4.2.9.2 1.3 0l4.4-2.5c.4-.2.6-.6.6-1.1v-5c0-.4-.2-.8-.6-1.1l-4.4-2.5z" fill="white" />
    </svg>
  );
}

function CRVIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#FF0000" />
      <path d="M8 16c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M10 20c1.5-2 3.5-3 6-3s4.5 1 6 3" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

function AAVEIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#B6509E" />
      <path d="M16 8l-6 14h3l1.5-3.5h3L19 22h3L16 8zm0 4.5l1.5 4h-3L16 12.5z" fill="white" />
    </svg>
  );
}

// ── Forex flag pairs ──────────────────────────────────────────────────────────

const CURRENCY_FLAGS: Record<string, string> = {
  EUR: '🇪🇺', USD: '🇺🇸', GBP: '🇬🇧', JPY: '🇯🇵',
  CHF: '🇨🇭', AUD: '🇦🇺', CAD: '🇨🇦', NZD: '🇳🇿',
  SEK: '🇸🇪', NOK: '🇳🇴', DKK: '🇩🇰', SGD: '🇸🇬',
  HKD: '🇭🇰', MXN: '🇲🇽', ZAR: '🇿🇦', TRY: '🇹🇷',
};

function ForexIcon({ symbol, size }: { symbol: string; size: number }) {
  const parts = symbol.replace('/', '').match(/.{3}/g) || [];
  const base = parts[0] || '';
  const quote = parts[1] || '';
  const baseFlag = CURRENCY_FLAGS[base] || '💱';
  const quoteFlag = CURRENCY_FLAGS[quote];
  const r = Math.round(size * 0.44);
  const offset = Math.round(size * 0.2);

  return (
    <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
      {/* Base currency circle */}
      <div style={{
        position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
        width: r * 2, height: r * 2, borderRadius: '50%',
        backgroundColor: '#f1f5f9', border: '1.5px solid #e2e8f0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: Math.round(r * 0.9), zIndex: 2,
      }}>
        {baseFlag}
      </div>
      {/* Quote currency circle */}
      {quoteFlag && (
        <div style={{
          position: 'absolute', left: offset, top: '50%', transform: 'translateY(-50%)',
          width: r * 2, height: r * 2, borderRadius: '50%',
          backgroundColor: '#f8fafc', border: '1.5px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: Math.round(r * 0.9), zIndex: 1,
        }}>
          {quoteFlag}
        </div>
      )}
    </div>
  );
}

// ── Stock ticker icons ────────────────────────────────────────────────────────

const STOCK_CONFIGS: Record<string, { bg: string; color: string; label: string }> = {
  AAPL: { bg: '#1d1d1f', color: '#ffffff', label: '' },
  MSFT: { bg: '#00a4ef', color: '#ffffff', label: '⊞' },
  NVDA: { bg: '#76b900', color: '#ffffff', label: 'N' },
  TSLA: { bg: '#cc0000', color: '#ffffff', label: 'T' },
  AMZN: { bg: '#ff9900', color: '#000000', label: 'a' },
  GOOGL: { bg: '#4285f4', color: '#ffffff', label: 'G' },
  GOOG: { bg: '#4285f4', color: '#ffffff', label: 'G' },
  META: { bg: '#0866ff', color: '#ffffff', label: 'f' },
  NFLX: { bg: '#e50914', color: '#ffffff', label: 'N' },
  AMD: { bg: '#ed1c24', color: '#ffffff', label: 'A' },
  INTC: { bg: '#0071c5', color: '#ffffff', label: 'i' },
  JPM: { bg: '#003087', color: '#ffffff', label: 'J' },
  BAC: { bg: '#e31837', color: '#ffffff', label: 'B' },
  V: { bg: '#1a1f71', color: '#ffffff', label: 'V' },
  MA: { bg: '#eb001b', color: '#ffffff', label: 'M' },
  SPY: { bg: '#1d4ed8', color: '#ffffff', label: 'S&P' },
  QQQ: { bg: '#7c3aed', color: '#ffffff', label: 'QQQ' },
  IWM: { bg: '#0369a1', color: '#ffffff', label: 'IWM' },
  DIA: { bg: '#0369a1', color: '#ffffff', label: 'DIA' },
};

function StockIcon({ symbol, size }: { symbol: string; size: number }) {
  const cfg = STOCK_CONFIGS[symbol];
  const label = cfg?.label ?? symbol.slice(0, 2);
  const bg = cfg?.bg ?? '#374151';
  const color = cfg?.color ?? '#ffffff';
  const fontSize = label.length > 2 ? Math.round(size * 0.25) : Math.round(size * 0.35);

  // Apple gets a special SVG apple mark
  if (symbol === 'AAPL') {
    return (
      <div style={{ width: size, height: size, borderRadius: '50%', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="white">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
        </svg>
      </div>
    );
  }

  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      backgroundColor: bg, color, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize, fontWeight: 700, fontFamily: 'monospace', lineHeight: 1,
    }}>
      {label}
    </div>
  );
}

// ── Index icons ───────────────────────────────────────────────────────────────

const INDEX_CONFIGS: Record<string, { bg: string; color: string; label: string }> = {
  'SPX500': { bg: '#1d4ed8', color: '#fff', label: 'S&P' },
  'NAS100': { bg: '#7c3aed', color: '#fff', label: 'NDX' },
  'DJI30': { bg: '#0369a1', color: '#fff', label: 'DJI' },
  'DAX40': { bg: '#000000', color: '#f59e0b', label: 'DAX' },
  'FTSE100': { bg: '#dc2626', color: '#fff', label: 'FT' },
  'CAC40': { bg: '#1d4ed8', color: '#fff', label: 'CAC' },
  'NIKKEI': { bg: '#dc2626', color: '#fff', label: 'NK' },
  'HSI': { bg: '#dc2626', color: '#fff', label: 'HSI' },
};

// ── Metal icons ───────────────────────────────────────────────────────────────

const METAL_CONFIGS: Record<string, { bg: string; color: string; label: string; symbol: string }> = {
  'XAU/USD': { bg: '#fbbf24', color: '#000', label: 'Au', symbol: 'XAU' },
  'XAG/USD': { bg: '#9ca3af', color: '#fff', label: 'Ag', symbol: 'XAG' },
  'XPT/USD': { bg: '#e5e7eb', color: '#374151', label: 'Pt', symbol: 'XPT' },
  'XPD/USD': { bg: '#d1d5db', color: '#374151', label: 'Pd', symbol: 'XPD' },
};

function MetalIcon({ symbol, size }: { symbol: string; size: number }) {
  const cfg = METAL_CONFIGS[symbol];
  const bg = cfg?.bg ?? '#fbbf24';
  const color = cfg?.color ?? '#000';
  const label = cfg?.label ?? symbol.slice(0, 2);
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      backgroundColor: bg, color, flexShrink: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: Math.round(size * 0.3), fontWeight: 800, fontFamily: 'monospace',
      border: `1.5px solid ${color}30`,
    }}>
      {label}
    </div>
  );
}

// ── Energy / Commodity SVG icons ──────────────────────────────────────────────

function OilIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#1f2937" />
      <rect x="13" y="8" width="6" height="10" rx="1" fill="#f59e0b" />
      <rect x="11" y="17" width="10" height="7" rx="1.5" fill="#f59e0b" />
      <rect x="14" y="6" width="4" height="3" rx="0.5" fill="#d97706" />
      <path d="M13 12h6" stroke="#1f2937" strokeWidth="1" />
    </svg>
  );
}

function GasIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#fef3c7" />
      <path d="M16 8c-2.5 3-5 5.5-5 9a5 5 0 0010 0c0-3.5-2.5-6-5-9z" fill="#f59e0b" />
      <path d="M16 14c-1 1.5-2 2.5-2 4a2 2 0 004 0c0-1.5-1-2.5-2-4z" fill="#fbbf24" />
    </svg>
  );
}

function WheatIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#fef9c3" />
      <path d="M16 24V10" stroke="#854d0e" strokeWidth="1.5" strokeLinecap="round" />
      <ellipse cx="16" cy="10" rx="2.5" ry="3.5" fill="#a16207" />
      <ellipse cx="13" cy="13" rx="2" ry="3" transform="rotate(-30 13 13)" fill="#ca8a04" />
      <ellipse cx="19" cy="13" rx="2" ry="3" transform="rotate(30 19 13)" fill="#ca8a04" />
      <ellipse cx="12" cy="17" rx="2" ry="3" transform="rotate(-20 12 17)" fill="#d97706" />
      <ellipse cx="20" cy="17" rx="2" ry="3" transform="rotate(20 20 17)" fill="#d97706" />
    </svg>
  );
}

function CoffeeIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#78350f" />
      <path d="M10 14h12l-1.5 8H11.5L10 14z" fill="#fef3c7" />
      <path d="M22 16h2a2 2 0 010 4h-2" stroke="#fef3c7" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13 11c0-1.5 2-2 2-3.5" stroke="#fef3c7" strokeWidth="1" strokeLinecap="round" />
      <path d="M17 11c0-1.5 2-2 2-3.5" stroke="#fef3c7" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

function CornIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#fef9c3" />
      <ellipse cx="16" cy="17" rx="4" ry="7" fill="#fbbf24" />
      <path d="M12 14c1.5-1 4-1 8 0" stroke="#d97706" strokeWidth="0.8" />
      <path d="M12 16.5c1.5-1 4-1 8 0" stroke="#d97706" strokeWidth="0.8" />
      <path d="M12 19c1.5-1 4-1 8 0" stroke="#d97706" strokeWidth="0.8" />
      <path d="M14 10c-1-2 0-3 2-3s3 1 2 3" stroke="#16a34a" strokeWidth="1.2" fill="none" />
    </svg>
  );
}

function SugarIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#fce7f3" />
      <rect x="11" y="12" width="10" height="12" rx="2" fill="#f9a8d4" />
      <rect x="13" y="9" width="6" height="4" rx="1" fill="#ec4899" />
      <circle cx="14" cy="16" r="1" fill="#be185d" />
      <circle cx="18" cy="16" r="1" fill="#be185d" />
      <circle cx="16" cy="19" r="1" fill="#be185d" />
    </svg>
  );
}

function CottonIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#f0fdf4" />
      <path d="M16 22V14" stroke="#166534" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="13" r="3" fill="white" stroke="#d1d5db" strokeWidth="0.5" />
      <circle cx="12" cy="15" r="2.5" fill="white" stroke="#d1d5db" strokeWidth="0.5" />
      <circle cx="20" cy="15" r="2.5" fill="white" stroke="#d1d5db" strokeWidth="0.5" />
    </svg>
  );
}

function BrentIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="16" fill="#111827" />
      <rect x="12" y="9" width="8" height="12" rx="1.5" fill="#f59e0b" />
      <rect x="14" y="7" width="4" height="3" rx="0.5" fill="#d97706" />
      <path d="M10 21h12" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 23h16" stroke="#6b7280" strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

// ── Crypto registry ───────────────────────────────────────────────────────────

const CRYPTO_ICONS: Record<string, (size: number) => React.ReactElement> = {
  BTC: (s) => <BitcoinIcon size={s} />,
  ETH: (s) => <EthereumIcon size={s} />,
  SOL: (s) => <SolanaIcon size={s} />,
  XRP: (s) => <XRPIcon size={s} />,
  BNB: (s) => <BNBIcon size={s} />,
  ADA: (s) => <ADAIcon size={s} />,
  DOT: (s) => <DOTIcon size={s} />,
  AVAX: (s) => <AVAXIcon size={s} />,
  LINK: (s) => <LINKIcon size={s} />,
  UNI: (s) => <UNIIcon size={s} />,
  DOGE: (s) => <DOGEIcon size={s} />,
  SHIB: (s) => <SHIBIcon size={s} />,
  PEPE: (s) => <PEPEIcon size={s} />,
  FLOKI: (s) => <FLOKIIcon size={s} />,
  ATOM: (s) => <ATOMIcon size={s} />,
  MATIC: (s) => <MATICIcon size={s} />,
  POL: (s) => <MATICIcon size={s} />,
  CRV: (s) => <CRVIcon size={s} />,
  AAVE: (s) => <AAVEIcon size={s} />,
};

const ENERGY_ICONS: Record<string, (size: number) => React.ReactElement> = {
  'WTI/USD': (s) => <OilIcon size={s} />,
  'BRENT/USD': (s) => <BrentIcon size={s} />,
  'NATGAS': (s) => <GasIcon size={s} />,
};

const COMMODITY_ICONS: Record<string, (size: number) => React.ReactElement> = {
  'WHEAT': (s) => <WheatIcon size={s} />,
  'COFFEE': (s) => <CoffeeIcon size={s} />,
  'CORN': (s) => <CornIcon size={s} />,
  'SUGAR': (s) => <SugarIcon size={s} />,
  'COTTON': (s) => <CottonIcon size={s} />,
};

// ── Main component ────────────────────────────────────────────────────────────

export default function AssetIcon({ symbol, assetType, size = 32, className }: AssetIconProps) {
  const s = size;

  // Normalize symbol: strip /USD, /USDT, /USDC suffixes for crypto lookup
  const base = symbol.split('/')[0].toUpperCase();

  // 1. Crypto
  if (assetType === 'crypto' || CRYPTO_ICONS[base]) {
    const render = CRYPTO_ICONS[base];
    if (render) {
      return <span className={className} style={{ display: 'inline-flex', flexShrink: 0 }}>{render(s)}</span>;
    }
    // Generic crypto fallback
    return (
      <div className={className} style={{
        width: s, height: s, borderRadius: '50%', flexShrink: 0,
        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: Math.round(s * 0.3), fontWeight: 700,
      }}>
        {base.slice(0, 2)}
      </div>
    );
  }

  // 2. Forex
  if (assetType === 'forex' || symbol.includes('/')) {
    const parts = symbol.split('/');
    if (parts.length === 2 && CURRENCY_FLAGS[parts[0]] !== undefined) {
      return (
        <span className={className} style={{ display: 'inline-flex', flexShrink: 0 }}>
          <ForexIcon symbol={symbol} size={s} />
        </span>
      );
    }
  }

  // 3. Metals
  if (assetType === 'metal' || METAL_CONFIGS[symbol]) {
    return (
      <span className={className} style={{ display: 'inline-flex', flexShrink: 0 }}>
        <MetalIcon symbol={symbol} size={s} />
      </span>
    );
  }

  // 4. Energy
  if (assetType === 'energy' || ENERGY_ICONS[symbol]) {
    const render = ENERGY_ICONS[symbol];
    if (render) return <span className={className} style={{ display: 'inline-flex', flexShrink: 0 }}>{render(s)}</span>;
  }

  // 5. Commodities
  if (assetType === 'commodity' || COMMODITY_ICONS[symbol]) {
    const render = COMMODITY_ICONS[symbol];
    if (render) return <span className={className} style={{ display: 'inline-flex', flexShrink: 0 }}>{render(s)}</span>;
  }

  // 6. Stocks / ETFs
  if (assetType === 'stock' || assetType === 'etf' || STOCK_CONFIGS[symbol]) {
    return (
      <span className={className} style={{ display: 'inline-flex', flexShrink: 0 }}>
        <StockIcon symbol={symbol} size={s} />
      </span>
    );
  }

  // 7. Indices
  if (assetType === 'index' || INDEX_CONFIGS[symbol]) {
    const cfg = INDEX_CONFIGS[symbol];
    const bg = cfg?.bg ?? '#1d4ed8';
    const color = cfg?.color ?? '#fff';
    const label = cfg?.label ?? symbol.slice(0, 3);
    return (
      <div className={className} style={{
        width: s, height: s, borderRadius: '50%', flexShrink: 0,
        backgroundColor: bg, color,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: Math.round(s * 0.25), fontWeight: 700, fontFamily: 'monospace',
      }}>
        {label}
      </div>
    );
  }

  // 8. Generic fallback — deterministic color from symbol
  const hash = symbol.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hue = hash % 360;
  return (
    <div className={className} style={{
      width: s, height: s, borderRadius: '50%', flexShrink: 0,
      backgroundColor: `hsl(${hue}, 55%, 45%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#fff', fontSize: Math.round(s * 0.3), fontWeight: 700,
    }}>
      {base.slice(0, 2)}
    </div>
  );
}
