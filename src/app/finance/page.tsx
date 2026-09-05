'use client';
import React, { useState, useEffect, Suspense } from 'react';

import AppLayout from '@/components/AppLayout';
import { fundsService, CustomerBalance } from '@/services/funds.service';


import { ArrowUpRight, History, Info, AlertTriangle, Check, Shield, TrendingUp, Activity, CreditCard, X, Copy, AlertCircle, ChevronRight, Bitcoin, Building2, Wallet, Zap, Globe, BarChart3, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

// ─── Crypto asset data ────────────────────────────────────────────────────────
const CRYPTO_ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin', color: '#F7931A', bg: 'rgba(247,147,26,0.15)' },
  { symbol: 'ETH', name: 'Ethereum', color: '#627EEA', bg: 'rgba(98,126,234,0.15)' },
  { symbol: 'USDT', name: 'Tether', color: '#26A17B', bg: 'rgba(38,161,123,0.15)' },
  { symbol: 'USDC', name: 'USD Coin', color: '#2775CA', bg: 'rgba(39,117,202,0.15)' },
  { symbol: 'BNB', name: 'BNB', color: '#F3BA2F', bg: 'rgba(243,186,47,0.15)' },
  { symbol: 'SOL', name: 'Solana', color: '#9945FF', bg: 'rgba(153,69,255,0.15)' },
  { symbol: 'XRP', name: 'Ripple', color: '#00AAE4', bg: 'rgba(0,170,228,0.15)' },
  { symbol: 'ADA', name: 'Cardano', color: '#0033AD', bg: 'rgba(0,51,173,0.15)' },
];

const CRYPTO_NETWORKS: Record<string, { id: string; name: string; fee: string; time: string; confirmations: number }[]> = {
  BTC: [
    { id: 'bitcoin', name: 'Bitcoin Network', fee: '~0.0001 BTC', time: '10–60 min', confirmations: 3 },
    { id: 'lightning', name: 'Lightning Network', fee: 'Near zero', time: 'Instant', confirmations: 0 },
  ],
  ETH: [
    { id: 'erc20', name: 'Ethereum (ERC-20)', fee: '~$2–15', time: '1–5 min', confirmations: 12 },
    { id: 'arbitrum', name: 'Arbitrum One', fee: '<$0.10', time: '~1 min', confirmations: 1 },
    { id: 'optimism', name: 'Optimism', fee: '<$0.10', time: '~1 min', confirmations: 1 },
  ],
  USDT: [
    { id: 'trc20', name: 'TRON (TRC-20)', fee: '~1 USDT', time: '1–3 min', confirmations: 20 },
    { id: 'erc20', name: 'Ethereum (ERC-20)', fee: '~$2–15', time: '1–5 min', confirmations: 12 },
    { id: 'bep20', name: 'BNB Smart Chain (BEP-20)', fee: '<$0.10', time: '~1 min', confirmations: 15 },
    { id: 'solana', name: 'Solana (SPL)', fee: '<$0.01', time: '~30 sec', confirmations: 1 },
  ],
  USDC: [
    { id: 'erc20', name: 'Ethereum (ERC-20)', fee: '~$2–15', time: '1–5 min', confirmations: 12 },
    { id: 'solana', name: 'Solana (SPL)', fee: '<$0.01', time: '~30 sec', confirmations: 1 },
    { id: 'arbitrum', name: 'Arbitrum One', fee: '<$0.10', time: '~1 min', confirmations: 1 },
  ],
  BNB: [{ id: 'bep20', name: 'BNB Smart Chain (BEP-20)', fee: '<$0.10', time: '~1 min', confirmations: 15 }],
  SOL: [{ id: 'solana', name: 'Solana Network', fee: '<$0.01', time: '~30 sec', confirmations: 1 }],
  XRP: [{ id: 'xrp', name: 'XRP Ledger', fee: '~0.00001 XRP', time: '3–5 sec', confirmations: 1 }],
  ADA: [{ id: 'cardano', name: 'Cardano Network', fee: '~0.17 ADA', time: '1–5 min', confirmations: 15 }],
};

const MOCK_DEPOSIT_ADDRESSES: Record<string, Record<string, string>> = {
  BTC: { bitcoin: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh', lightning: 'lnbc1pvjluezpp5qqqsyq...' },
  ETH: { erc20: '0x742d35Cc6634C0532925a3b8D4C9C3B1234567890', arbitrum: '0x742d35Cc6634C0532925a3b8D4C9C3B1234567890', optimism: '0x742d35Cc6634C0532925a3b8D4C9C3B1234567890' },
  USDT: { trc20: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE', erc20: '0x742d35Cc6634C0532925a3b8D4C9C3B1234567890', bep20: '0x742d35Cc6634C0532925a3b8D4C9C3B1234567890', solana: 'DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC86PZ8okm8qs' },
  USDC: { erc20: '0x742d35Cc6634C0532925a3b8D4C9C3B1234567890', solana: 'DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC86PZ8okm8qs', arbitrum: '0x742d35Cc6634C0532925a3b8D4C9C3B1234567890' },
  BNB: { bep20: '0x742d35Cc6634C0532925a3b8D4C9C3B1234567890' },
  SOL: { solana: 'DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC86PZ8okm8qs' },
  XRP: { xrp: 'rHb9CJAWyB4rj91VRWn96DkukG4bwdtyTh' },
  ADA: { cardano: 'addr1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' },
};

// ─── Crypto Icon Component ────────────────────────────────────────────────────
function CryptoIcon({ symbol, size = 32 }: { symbol: string; size?: number }) {
  const asset = CRYPTO_ASSETS.find(a => a.symbol === symbol);
  if (!asset) return (
    <div className="rounded-full flex items-center justify-center font-bold text-xs"
      style={{ width: size, height: size, backgroundColor: 'rgba(212,168,0,0.15)', color: 'var(--primary)' }}>
      {symbol.slice(0, 2)}
    </div>
  );

  const iconMap: Record<string, React.ReactNode> = {
    BTC: (
      <svg viewBox="0 0 32 32" width={size * 0.6} height={size * 0.6} fill={asset.color}>
        <path d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0zm3.5 13.5c.5 1 .5 2.5-.5 3.5 1.5.5 2 2 1.5 3.5-.5 2-2.5 2.5-5 2.5H10V9h5.5c2 0 4 .5 4 2.5 0 .5-.5 1.5-.5 1.5h.5zm-6.5 2h2c.5 0 1.5 0 1.5-1s-1-1-1.5-1H13v2zm0 4h2.5c.5 0 1.5 0 1.5-1.5s-1-1.5-1.5-1.5H13v3z"/>
      </svg>
    ),
    ETH: (
      <svg viewBox="0 0 32 32" width={size * 0.6} height={size * 0.6} fill={asset.color}>
        <path d="M16 3l-8 13 8 4.5L24 16 16 3zm0 18.5L8 17l8 12 8-12-8 4.5z" opacity="0.9"/>
      </svg>
    ),
    USDT: (
      <svg viewBox="0 0 32 32" width={size * 0.6} height={size * 0.6} fill={asset.color}>
        <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm1 18.5c0 .276-.448.5-1 .5s-1-.224-1-.5v-7c-2.5-.2-4.5-.8-4.5-1.5s2-1.3 4.5-1.5V9h2v1.5c2.5.2 4.5.8 4.5 1.5s-2 1.3-4.5 1.5v7z"/>
      </svg>
    ),
    USDC: (
      <svg viewBox="0 0 32 32" width={size * 0.6} height={size * 0.6} fill={asset.color}>
        <path d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2zm0 22c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zm1-12.5c1.5.2 2.5.8 2.5 1.5s-1 1.3-2.5 1.5v2c1.5-.2 3-.8 3-2s-1.5-1.8-3-2V9h-2v1.5c-1.5.2-3 .8-3 2s1.5 1.8 3 2v2c-1.5-.2-2.5-.8-2.5-1.5s1-1.3 2.5-1.5v-2z"/>
      </svg>
    ),
  };

  return (
    <div className="rounded-full flex items-center justify-center shrink-0"
      style={{ width: size, height: size, backgroundColor: asset.bg, border: `1.5px solid ${asset.color}33` }}>
      {iconMap[symbol] || (
        <span style={{ color: asset.color, fontSize: size * 0.3, fontWeight: 700 }}>{symbol.slice(0, 2)}</span>
      )}
    </div>
  );
}

// ─── Step Progress Bar ────────────────────────────────────────────────────────
function StepProgress({ steps, currentIndex }: { steps: string[]; currentIndex: number }) {
  return (
    <div className="flex items-center gap-0 mb-6">
      {steps.map((label, i) => (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center gap-1">
            <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold transition-all"
              style={{
                fontSize: '11px',
                backgroundColor: i < currentIndex ? 'var(--primary)' : i === currentIndex ? 'rgba(212,168,0,0.2)' : 'rgba(255,255,255,0.05)',
                border: `2px solid ${i <= currentIndex ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                color: i < currentIndex ? '#000' : i === currentIndex ? 'var(--primary)' : 'rgba(255,255,255,0.3)',
                boxShadow: i === currentIndex ? '0 0 12px rgba(212,168,0,0.3)' : 'none',
              }}>
              {i < currentIndex ? <Check size={12} /> : i + 1}
            </div>
            <span className="text-center whitespace-nowrap" style={{ fontSize: '10px', color: i === currentIndex ? 'var(--primary)' : 'rgba(255,255,255,0.35)', fontWeight: i === currentIndex ? 600 : 400 }}>{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div className="flex-1 h-0.5 mx-1 mb-4 transition-all" style={{ backgroundColor: i < currentIndex ? 'var(--primary)' : 'rgba(255,255,255,0.08)' }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

// ─── Modal Shell ──────────────────────────────────────────────────────────────
function ModalShell({ title, subtitle, icon, iconBg, onClose, children }: {
  title: string; subtitle: string; icon: React.ReactNode; iconBg: string; onClose: () => void; children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl"
        style={{
          backgroundColor: 'var(--card)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,168,0,0.08)',
        }}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: iconBg }}>
              {icon}
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>{title}</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{subtitle}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-white/5" style={{ color: 'var(--muted-foreground)' }}>
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

// ─── Crypto Deposit Modal ─────────────────────────────────────────────────────
type CryptoDepositStep = 'asset' | 'network' | 'address' | 'confirm';

function CryptoDepositModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<CryptoDepositStep>('asset');
  const [selectedAsset, setSelectedAsset] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [copied, setCopied] = useState(false);

  const asset = CRYPTO_ASSETS.find(a => a.symbol === selectedAsset);
  const networks = selectedAsset ? (CRYPTO_NETWORKS[selectedAsset] || []) : [];
  const network = networks.find(n => n.id === selectedNetwork);
  const depositAddress = selectedAsset && selectedNetwork ? (MOCK_DEPOSIT_ADDRESSES[selectedAsset]?.[selectedNetwork] || 'Address provided by backend') : '';

  const STEPS = ['Select Asset', 'Select Network', 'Deposit Address', 'Confirm'];
  const stepIndex = ['asset', 'network', 'address', 'confirm'].indexOf(step);

  const handleCopy = () => {
    navigator.clipboard.writeText(depositAddress).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <ModalShell
      title="Crypto Deposit"
      subtitle="Deposit cryptocurrency to your account"
      icon={<Bitcoin size={18} style={{ color: '#F7931A' }} />}
      iconBg="rgba(247,147,26,0.15)"
      onClose={onClose}
    >
      <StepProgress steps={STEPS} currentIndex={stepIndex} />

      {step === 'asset' && (
        <div className="space-y-4">
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Which asset would you like to deposit?</p>
          <div className="grid grid-cols-2 gap-2.5">
            {CRYPTO_ASSETS.map(a => (
              <button key={a.symbol}
                onClick={() => setSelectedAsset(a.symbol)}
                className="flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left hover:border-yellow-500/40"
                style={{
                  borderColor: selectedAsset === a.symbol ? 'var(--primary)' : 'rgba(255,255,255,0.07)',
                  backgroundColor: selectedAsset === a.symbol ? 'rgba(212,168,0,0.08)' : 'rgba(255,255,255,0.02)',
                  boxShadow: selectedAsset === a.symbol ? '0 0 0 1px rgba(212,168,0,0.2)' : 'none',
                }}>
                <CryptoIcon symbol={a.symbol} size={36} />
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{a.symbol}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{a.name}</p>
                </div>
              </button>
            ))}
          </div>
          <button onClick={() => selectedAsset && setStep('network')} disabled={!selectedAsset}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40"
            style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
            Continue →
          </button>
        </div>
      )}

      {step === 'network' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <CryptoIcon symbol={selectedAsset} size={36} />
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{asset?.name}</p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Select deposit network</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-xl" style={{ backgroundColor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)' }}>
            <AlertCircle size={14} style={{ color: '#f59e0b' }} className="shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>Ensure you select the correct network. Sending to the wrong network may result in permanent loss of funds.</p>
          </div>
          <div className="space-y-2">
            {networks.map(n => (
              <button key={n.id}
                onClick={() => setSelectedNetwork(n.id)}
                className="w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left hover:border-yellow-500/40"
                style={{
                  borderColor: selectedNetwork === n.id ? 'var(--primary)' : 'rgba(255,255,255,0.07)',
                  backgroundColor: selectedNetwork === n.id ? 'rgba(212,168,0,0.06)' : 'rgba(255,255,255,0.02)',
                }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{n.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                    {n.confirmations > 0 ? `${n.confirmations} confirmations · ` : ''}{n.time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Network fee</p>
                  <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{n.fee}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="flex gap-2.5">
            <button onClick={() => setStep('asset')} className="flex-1 py-3 rounded-xl font-medium text-sm border transition-all" style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--muted-foreground)' }}>Back</button>
            <button onClick={() => selectedNetwork && setStep('address')} disabled={!selectedNetwork}
              className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40"
              style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {step === 'address' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl text-center" style={{ backgroundColor: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.18)' }}>
            <p className="text-sm font-bold mb-1" style={{ color: '#34d399' }}>Send {selectedAsset} to this address</p>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Only send {selectedAsset} via {network?.name}. Other assets will be permanently lost.</p>
          </div>

          {/* QR Code placeholder */}
          <div className="flex justify-center">
            <div className="w-36 h-36 rounded-2xl flex flex-col items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '2px dashed rgba(255,255,255,0.1)' }}>
              <Globe size={28} style={{ color: 'var(--muted-foreground)', opacity: 0.4 }} />
              <p className="text-xs mt-2 text-center" style={{ color: 'var(--muted-foreground)', opacity: 0.5 }}>QR Code&lt;br/&gt;from backend</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--muted-foreground)' }}>DEPOSIT ADDRESS</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-3.5 py-3 rounded-xl border font-mono text-xs break-all leading-relaxed"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: 'var(--foreground)' }}>
                {depositAddress}
              </div>
              <button onClick={handleCopy}
                className="flex items-center gap-1.5 px-3.5 py-3 rounded-xl border text-xs font-semibold transition-all shrink-0 hover:border-yellow-500/40"
                style={{ borderColor: 'rgba(255,255,255,0.1)', color: copied ? '#34d399' : 'var(--muted-foreground)' }}>
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Asset', value: `${selectedAsset} — ${asset?.name}` },
              { label: 'Network', value: network?.name || '' },
              { label: 'Confirmations', value: network?.confirmations ? `${network.confirmations} required` : 'N/A' },
              { label: 'Arrival time', value: network?.time || '' },
            ].map(({ label, value }) => (
              <div key={label} className="p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
                <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--foreground)' }}>{value}</p>
              </div>
            ))}
          </div>

          <div className="flex gap-2.5">
            <button onClick={() => setStep('network')} className="flex-1 py-3 rounded-xl font-medium text-sm border transition-all" style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--muted-foreground)' }}>Back</button>
            <button onClick={() => setStep('confirm')}
              className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all"
              style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
              I've Sent the Funds →
            </button>
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{ backgroundColor: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.25)' }}>
            <CheckCircle2 size={28} style={{ color: '#34d399' }} />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--foreground)' }}>Deposit Initiated</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              Your {selectedAsset} deposit via {network?.name} is being monitored. Your balance will be credited after {network?.confirmations || 1} network confirmation{(network?.confirmations || 1) > 1 ? 's' : ''}.
            </p>
          </div>
          <div className="p-4 rounded-xl text-left space-y-2" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              ['Asset', selectedAsset],
              ['Network', network?.name || ''],
              ['Estimated arrival', network?.time || ''],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span style={{ color: 'var(--muted-foreground)' }}>{label}</span>
                <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{value}</span>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-2 p-3 rounded-xl text-left" style={{ backgroundColor: 'rgba(212,168,0,0.06)', border: '1px solid rgba(212,168,0,0.15)' }}>
            <Info size={13} className="shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>Balance updates only after backend confirms the deposit. No artificial balance changes are made on the frontend.</p>
          </div>
          <button onClick={onClose} className="w-full py-3 rounded-xl font-semibold text-sm transition-all" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
            Done
          </button>
        </div>
      )}
    </ModalShell>
  );
}

// ─── Bank Deposit Modal ───────────────────────────────────────────────────────
type BankDepositStep = 'currency' | 'method' | 'details' | 'confirm';

function BankDepositModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<BankDepositStep>('currency');
  const [currency, setCurrency] = useState('USD');
  const [bankMethod, setBankMethod] = useState('');
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const BANK_METHODS = [
    { id: 'wire', label: 'Wire Transfer', desc: 'International bank wire', fee: '$25', time: '2–5 business days', icon: <Globe size={16} style={{ color: '#60a5fa' }} /> },
    { id: 'sepa', label: 'SEPA Transfer', desc: 'EU bank transfer', fee: 'Free', time: '1–2 business days', icon: <Building2 size={16} style={{ color: '#a78bfa' }} /> },
    { id: 'ach', label: 'ACH Transfer', desc: 'US domestic transfer', fee: 'Free', time: '1–3 business days', icon: <Zap size={16} style={{ color: '#34d399' }} /> },
  ];

  const BANK_DETAILS = {
    bankName: 'Trade Console Financial Ltd',
    accountName: 'TC Client Funds Account',
    accountNumber: 'Provided by platform',
    sortCode: 'Provided by platform',
    iban: 'Provided by platform',
    swift: 'Provided by platform',
    reference: 'TC-REF-' + Math.random().toString(36).slice(2, 8).toUpperCase(),
  };

  const STEPS = ['Currency', 'Bank Method', 'Bank Details', 'Confirm'];
  const stepIndex = ['currency', 'method', 'details', 'confirm'].indexOf(step);

  const handleCopy = (value: string, key: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  return (
    <ModalShell
      title="Bank Deposit"
      subtitle="Deposit via bank transfer"
      icon={<Building2 size={18} style={{ color: '#60a5fa' }} />}
      iconBg="rgba(96,165,250,0.15)"
      onClose={onClose}
    >
      <StepProgress steps={STEPS} currentIndex={stepIndex} />

      {step === 'currency' && (
        <div className="space-y-4">
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Select deposit currency</p>
          <div className="grid grid-cols-3 gap-2.5">
            {['USD', 'EUR', 'GBP'].map(c => (
              <button key={c} onClick={() => setCurrency(c)}
                className="py-4 rounded-xl border font-bold text-base transition-all"
                style={{
                  borderColor: currency === c ? 'var(--primary)' : 'rgba(255,255,255,0.07)',
                  backgroundColor: currency === c ? 'rgba(212,168,0,0.1)' : 'rgba(255,255,255,0.02)',
                  color: currency === c ? 'var(--primary)' : 'var(--foreground)',
                  boxShadow: currency === c ? '0 0 0 1px rgba(212,168,0,0.2)' : 'none',
                }}>
                {c}
              </button>
            ))}
          </div>
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--muted-foreground)' }}>AMOUNT (OPTIONAL)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: 'var(--muted-foreground)' }}>
                {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}
              </span>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 rounded-xl border text-sm font-mono focus:outline-none focus:ring-1 focus:ring-yellow-500/30"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: 'var(--foreground)' }} />
            </div>
            <div className="flex gap-2 mt-2">
              {['1000', '5000', '10000', '25000'].map(v => (
                <button key={v} onClick={() => setAmount(v)}
                  className="flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-all"
                  style={{ borderColor: amount === v ? 'var(--primary)' : 'rgba(255,255,255,0.07)', color: amount === v ? 'var(--primary)' : 'var(--muted-foreground)', backgroundColor: amount === v ? 'rgba(212,168,0,0.08)' : 'transparent' }}>
                  {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}{parseInt(v).toLocaleString()}
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => setStep('method')}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all"
            style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
            Continue →
          </button>
        </div>
      )}

      {step === 'method' && (
        <div className="space-y-4">
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Select bank transfer method</p>
          <div className="space-y-2.5">
            {BANK_METHODS.map(m => (
              <button key={m.id} onClick={() => setBankMethod(m.id)}
                className="w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left hover:border-yellow-500/40"
                style={{
                  borderColor: bankMethod === m.id ? 'var(--primary)' : 'rgba(255,255,255,0.07)',
                  backgroundColor: bankMethod === m.id ? 'rgba(212,168,0,0.06)' : 'rgba(255,255,255,0.02)',
                }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {m.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{m.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{m.desc}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{m.fee}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{m.time}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="flex gap-2.5">
            <button onClick={() => setStep('currency')} className="flex-1 py-3 rounded-xl font-medium text-sm border transition-all" style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--muted-foreground)' }}>Back</button>
            <button onClick={() => bankMethod && setStep('details')} disabled={!bankMethod}
              className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40"
              style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {step === 'details' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl" style={{ backgroundColor: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.18)' }}>
            <p className="text-sm font-bold" style={{ color: '#34d399' }}>
              Transfer {amount ? `${currency} ${parseFloat(amount).toLocaleString()}` : 'your amount'} to:
            </p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Include your reference number in the payment description — this is required to credit your account.</p>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Bank Name', value: BANK_DETAILS.bankName, key: 'bankName' },
              { label: 'Account Name', value: BANK_DETAILS.accountName, key: 'accountName' },
              { label: 'Account Number', value: BANK_DETAILS.accountNumber, key: 'accountNumber' },
              { label: 'Sort Code / Routing', value: BANK_DETAILS.sortCode, key: 'sortCode' },
              { label: 'IBAN', value: BANK_DETAILS.iban, key: 'iban' },
              { label: 'SWIFT / BIC', value: BANK_DETAILS.swift, key: 'swift' },
            ].map(({ label, value, key }) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
                  <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--foreground)' }}>{value}</p>
                </div>
                <button onClick={() => handleCopy(value, key)} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: 'var(--muted-foreground)' }}>
                  {copied === key ? <Check size={13} style={{ color: '#34d399' }} /> : <Copy size={13} />}
                </button>
              </div>
            ))}
            <div className="flex items-center justify-between p-3 rounded-xl"
              style={{ backgroundColor: 'rgba(212,168,0,0.08)', border: '1px solid rgba(212,168,0,0.25)' }}>
              <div>
                <p className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>Payment Reference <span style={{ color: '#f87171' }}>*Required</span></p>
                <p className="text-base font-bold font-mono mt-0.5" style={{ color: 'var(--primary)' }}>{BANK_DETAILS.reference}</p>
              </div>
              <button onClick={() => handleCopy(BANK_DETAILS.reference, 'ref')} className="p-1.5 rounded-lg transition-colors hover:bg-white/5" style={{ color: 'var(--primary)' }}>
                {copied === 'ref' ? <Check size={13} style={{ color: '#34d399' }} /> : <Copy size={13} />}
              </button>
            </div>
          </div>
          <div className="flex gap-2.5">
            <button onClick={() => setStep('method')} className="flex-1 py-3 rounded-xl font-medium text-sm border transition-all" style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--muted-foreground)' }}>Back</button>
            <button onClick={() => setStep('confirm')}
              className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all"
              style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
              I've Sent the Transfer →
            </button>
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{ backgroundColor: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.25)' }}>
            <CheckCircle2 size={28} style={{ color: '#34d399' }} />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--foreground)' }}>Bank Transfer Initiated</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              Once your bank transfer is received and confirmed by our finance team, your account balance will be credited. This typically takes 1–3 business days.
            </p>
          </div>
          <div className="p-4 rounded-xl text-left space-y-2" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              ['Currency', currency],
              ['Method', BANK_METHODS.find(m => m.id === bankMethod)?.label || ''],
              ['Reference', BANK_DETAILS.reference],
              ['Processing time', '1–3 business days'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span style={{ color: 'var(--muted-foreground)' }}>{label}</span>
                <span className="font-semibold" style={{ color: label === 'Reference' ? 'var(--primary)' : 'var(--foreground)' }}>{value}</span>
              </div>
            ))}
          </div>
          <button onClick={onClose} className="w-full py-3 rounded-xl font-semibold text-sm transition-all" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
            Done
          </button>
        </div>
      )}
    </ModalShell>
  );
}

// ─── Crypto Withdrawal Modal ──────────────────────────────────────────────────
type CryptoWithdrawStep = 'asset' | 'network' | 'address' | 'amount' | 'confirm';

function CryptoWithdrawModal({ availableBalance, onClose }: { availableBalance: number; onClose: () => void }) {
  const [step, setStep] = useState<CryptoWithdrawStep>('asset');
  const [selectedAsset, setSelectedAsset] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const asset = CRYPTO_ASSETS.find(a => a.symbol === selectedAsset);
  const networks = selectedAsset ? (CRYPTO_NETWORKS[selectedAsset] || []) : [];
  const network = networks.find(n => n.id === selectedNetwork);

  const STEPS = ['Select Asset', 'Network', 'Wallet Address', 'Amount', 'Confirm'];
  const stepIndex = ['asset', 'network', 'address', 'amount', 'confirm'].indexOf(step);

  if (submitted) {
    return (
      <ModalShell
        title="Crypto Withdrawal"
        subtitle="Withdrawal request submitted"
        icon={<ArrowUpRight size={18} style={{ color: '#f87171' }} />}
        iconBg="rgba(248,113,113,0.15)"
        onClose={onClose}
      >
        <div className="space-y-4 text-center py-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{ backgroundColor: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.25)' }}>
            <CheckCircle2 size={28} style={{ color: '#34d399' }} />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--foreground)' }}>Withdrawal Submitted</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              Your {selectedAsset} withdrawal request is pending review. You'll be notified once it's processed.
            </p>
          </div>
          <div className="p-4 rounded-xl text-left space-y-2" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              ['Asset', selectedAsset],
              ['Network', network?.name || ''],
              ['Amount', `${amount} ${selectedAsset}`],
              ['Estimated arrival', network?.time || ''],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span style={{ color: 'var(--muted-foreground)' }}>{label}</span>
                <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{value}</span>
              </div>
            ))}
          </div>
          <button onClick={onClose} className="w-full py-3 rounded-xl font-semibold text-sm" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>Done</button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell
      title="Crypto Withdrawal"
      subtitle="Withdraw cryptocurrency from your account"
      icon={<ArrowUpRight size={18} style={{ color: '#f87171' }} />}
      iconBg="rgba(248,113,113,0.15)"
      onClose={onClose}
    >
      <StepProgress steps={STEPS} currentIndex={stepIndex} />

      {step === 'asset' && (
        <div className="space-y-4">
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Which asset would you like to withdraw?</p>
          <div className="grid grid-cols-2 gap-2.5">
            {CRYPTO_ASSETS.map(a => (
              <button key={a.symbol} onClick={() => setSelectedAsset(a.symbol)}
                className="flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left hover:border-yellow-500/40"
                style={{
                  borderColor: selectedAsset === a.symbol ? 'var(--primary)' : 'rgba(255,255,255,0.07)',
                  backgroundColor: selectedAsset === a.symbol ? 'rgba(212,168,0,0.08)' : 'rgba(255,255,255,0.02)',
                }}>
                <CryptoIcon symbol={a.symbol} size={36} />
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{a.symbol}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{a.name}</p>
                </div>
              </button>
            ))}
          </div>
          <button onClick={() => selectedAsset && setStep('network')} disabled={!selectedAsset}
            className="w-full py-3 rounded-xl font-semibold text-sm disabled:opacity-40"
            style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
            Continue →
          </button>
        </div>
      )}

      {step === 'network' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <CryptoIcon symbol={selectedAsset} size={36} />
            <div>
              <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{asset?.name}</p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Select withdrawal network</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-xl" style={{ backgroundColor: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.18)' }}>
            <AlertCircle size={14} style={{ color: '#f87171' }} className="shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>Select the correct network. Funds sent to the wrong network cannot be recovered.</p>
          </div>
          <div className="space-y-2">
            {networks.map(n => (
              <button key={n.id} onClick={() => setSelectedNetwork(n.id)}
                className="w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left hover:border-yellow-500/40"
                style={{
                  borderColor: selectedNetwork === n.id ? 'var(--primary)' : 'rgba(255,255,255,0.07)',
                  backgroundColor: selectedNetwork === n.id ? 'rgba(212,168,0,0.06)' : 'rgba(255,255,255,0.02)',
                }}>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{n.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{n.time}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Fee</p>
                  <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{n.fee}</p>
                </div>
              </button>
            ))}
          </div>
          <div className="flex gap-2.5">
            <button onClick={() => setStep('asset')} className="flex-1 py-3 rounded-xl font-medium text-sm border" style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--muted-foreground)' }}>Back</button>
            <button onClick={() => selectedNetwork && setStep('address')} disabled={!selectedNetwork}
              className="flex-1 py-3 rounded-xl font-semibold text-sm disabled:opacity-40"
              style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {step === 'address' && (
        <div className="space-y-4">
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Enter destination wallet address</p>
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--muted-foreground)' }}>WALLET ADDRESS ({selectedAsset} · {network?.name})</label>
            <div className="relative">
              <Wallet size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
              <input type="text" value={walletAddress} onChange={e => setWalletAddress(e.target.value)}
                placeholder={selectedAsset === 'BTC' ? 'bc1q...' : '0x...'}
                className="w-full pl-9 pr-4 py-3 rounded-xl border text-sm font-mono focus:outline-none focus:ring-1 focus:ring-yellow-500/30"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: 'var(--foreground)' }} />
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-xl" style={{ backgroundColor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.18)' }}>
            <AlertTriangle size={14} style={{ color: '#fbbf24' }} className="shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>Double-check the wallet address. Funds sent to an incorrect address cannot be recovered.</p>
          </div>
          <div className="flex gap-2.5">
            <button onClick={() => setStep('network')} className="flex-1 py-3 rounded-xl font-medium text-sm border" style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--muted-foreground)' }}>Back</button>
            <button onClick={() => walletAddress && setStep('amount')} disabled={!walletAddress}
              className="flex-1 py-3 rounded-xl font-semibold text-sm disabled:opacity-40"
              style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {step === 'amount' && (
        <div className="space-y-4">
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Enter withdrawal amount</p>
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--muted-foreground)' }}>AMOUNT ({selectedAsset})</label>
            <div className="relative">
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
                className="w-full px-4 py-3 rounded-xl border text-sm font-mono focus:outline-none focus:ring-1 focus:ring-yellow-500/30"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: 'var(--foreground)' }} />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold" style={{ color: 'var(--primary)' }}>{selectedAsset}</span>
            </div>
          </div>
          <div className="p-3.5 rounded-xl space-y-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--muted-foreground)' }}>Available balance</span>
              <span className="font-semibold" style={{ color: '#34d399' }}>${availableBalance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--muted-foreground)' }}>Network fee</span>
              <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{network?.fee}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--muted-foreground)' }}>Estimated arrival</span>
              <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{network?.time}</span>
            </div>
          </div>
          <div className="flex gap-2.5">
            <button onClick={() => setStep('address')} className="flex-1 py-3 rounded-xl font-medium text-sm border" style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--muted-foreground)' }}>Back</button>
            <button onClick={() => amount && parseFloat(amount) > 0 && setStep('confirm')} disabled={!amount || parseFloat(amount) <= 0}
              className="flex-1 py-3 rounded-xl font-semibold text-sm disabled:opacity-40"
              style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
              Review →
            </button>
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="space-y-4">
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Review & Security Confirmation</p>
          <div className="p-4 rounded-xl space-y-2.5" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              ['Asset', selectedAsset],
              ['Network', network?.name || ''],
              ['Amount', `${amount} ${selectedAsset}`],
              ['Destination', walletAddress.length > 20 ? walletAddress.slice(0, 12) + '...' + walletAddress.slice(-8) : walletAddress],
              ['Network fee', network?.fee || ''],
              ['Estimated arrival', network?.time || ''],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm border-b pb-2 last:border-0 last:pb-0" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>{label}</span>
                <span className="font-semibold text-right max-w-[55%] truncate" style={{ color: 'var(--foreground)' }}>{value}</span>
              </div>
            ))}
          </div>
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--muted-foreground)' }}>SECURITY CODE (2FA / OTP)</label>
            <div className="relative">
              <Shield size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
              <input type="text" value={securityCode} onChange={e => setSecurityCode(e.target.value)}
                placeholder="Enter 2FA or OTP code"
                className="w-full pl-9 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500/30"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: 'var(--foreground)' }} />
            </div>
          </div>
          <div className="flex items-start gap-2.5 p-3 rounded-xl" style={{ backgroundColor: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.18)' }}>
            <AlertTriangle size={14} style={{ color: '#f87171' }} className="shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>This action is irreversible. Ensure all details are correct before confirming.</p>
          </div>
          <div className="flex gap-2.5">
            <button onClick={() => setStep('amount')} className="flex-1 py-3 rounded-xl font-medium text-sm border" style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--muted-foreground)' }}>Back</button>
            <button onClick={() => setSubmitted(true)}
              className="flex-1 py-3 rounded-xl font-semibold text-sm"
              style={{ backgroundColor: '#ef4444', color: '#fff' }}>
              Confirm Withdrawal
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}

// ─── Bank Withdrawal Modal ────────────────────────────────────────────────────
type BankWithdrawStep = 'currency' | 'account' | 'amount' | 'review' | 'confirm';

function BankWithdrawModal({ availableBalance, onClose }: { availableBalance: number; onClose: () => void }) {
  const [step, setStep] = useState<BankWithdrawStep>('currency');
  const [currency, setCurrency] = useState('USD');
  const [bankAccount, setBankAccount] = useState('');
  const [amount, setAmount] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const BANK_ACCOUNTS = [
    { id: 'acc1', label: 'Chase Bank ****4521', details: 'USD · Checking', verified: true },
    { id: 'acc2', label: 'Barclays ****8834', details: 'GBP · Current', verified: true },
    { id: 'acc3', label: 'Deutsche Bank ****2290', details: 'EUR · Savings', verified: false },
  ];

  const FEE_MAP: Record<string, { fee: string; eta: string }> = {
    USD: { fee: '$15', eta: '1–3 business days' },
    EUR: { fee: '€10', eta: '1–2 business days (SEPA)' },
    GBP: { fee: '£8', eta: '1–2 business days' },
  };

  const STEPS = ['Currency', 'Bank Account', 'Amount', 'Review & Fees', 'Confirm'];
  const stepIndex = ['currency', 'account', 'amount', 'review', 'confirm'].indexOf(step);

  if (submitted) {
    return (
      <ModalShell
        title="Bank Withdrawal"
        subtitle="Withdrawal request submitted"
        icon={<Building2 size={18} style={{ color: '#60a5fa' }} />}
        iconBg="rgba(96,165,250,0.15)"
        onClose={onClose}
      >
        <div className="space-y-4 text-center py-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto" style={{ backgroundColor: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.25)' }}>
            <CheckCircle2 size={28} style={{ color: '#34d399' }} />
          </div>
          <div>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--foreground)' }}>Withdrawal Submitted</h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
              Your bank withdrawal request is pending review. Funds will be transferred within {FEE_MAP[currency]?.eta}.
            </p>
          </div>
          <div className="p-4 rounded-xl text-left space-y-2" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              ['Currency', currency],
              ['Amount', `${currency} ${parseFloat(amount || '0').toLocaleString()}`],
              ['Fee', FEE_MAP[currency]?.fee || ''],
              ['ETA', FEE_MAP[currency]?.eta || ''],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm">
                <span style={{ color: 'var(--muted-foreground)' }}>{label}</span>
                <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{value}</span>
              </div>
            ))}
          </div>
          <button onClick={onClose} className="w-full py-3 rounded-xl font-semibold text-sm" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>Done</button>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell
      title="Bank Withdrawal"
      subtitle="Withdraw funds to your bank account"
      icon={<Building2 size={18} style={{ color: '#60a5fa' }} />}
      iconBg="rgba(96,165,250,0.15)"
      onClose={onClose}
    >
      <StepProgress steps={STEPS} currentIndex={stepIndex} />

      {step === 'currency' && (
        <div className="space-y-4">
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Select withdrawal currency</p>
          <div className="grid grid-cols-3 gap-2.5">
            {['USD', 'EUR', 'GBP'].map(c => (
              <button key={c} onClick={() => setCurrency(c)}
                className="py-4 rounded-xl border font-bold text-base transition-all"
                style={{
                  borderColor: currency === c ? 'var(--primary)' : 'rgba(255,255,255,0.07)',
                  backgroundColor: currency === c ? 'rgba(212,168,0,0.1)' : 'rgba(255,255,255,0.02)',
                  color: currency === c ? 'var(--primary)' : 'var(--foreground)',
                }}>
                {c}
              </button>
            ))}
          </div>
          <div className="p-3.5 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--muted-foreground)' }}>Available balance</span>
              <span className="font-bold" style={{ color: '#34d399' }}>${availableBalance.toLocaleString()}</span>
            </div>
          </div>
          <button onClick={() => setStep('account')}
            className="w-full py-3 rounded-xl font-semibold text-sm"
            style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
            Continue →
          </button>
        </div>
      )}

      {step === 'account' && (
        <div className="space-y-4">
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Select bank account</p>
          <div className="space-y-2.5">
            {BANK_ACCOUNTS.map(acc => (
              <button key={acc.id} onClick={() => setBankAccount(acc.id)}
                className="w-full flex items-center gap-3 p-4 rounded-xl border transition-all text-left hover:border-yellow-500/40"
                style={{
                  borderColor: bankAccount === acc.id ? 'var(--primary)' : 'rgba(255,255,255,0.07)',
                  backgroundColor: bankAccount === acc.id ? 'rgba(212,168,0,0.06)' : 'rgba(255,255,255,0.02)',
                }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.2)' }}>
                  <Building2 size={16} style={{ color: '#60a5fa' }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{acc.label}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{acc.details}</p>
                </div>
                {acc.verified && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: 'rgba(52,211,153,0.12)', color: '#34d399' }}>Verified</span>
                )}
              </button>
            ))}
            <div className="p-3 rounded-xl text-center" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.08)' }}>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Bank accounts are verified by our compliance team. Contact support to add a new account.</p>
            </div>
          </div>
          <div className="flex gap-2.5">
            <button onClick={() => setStep('currency')} className="flex-1 py-3 rounded-xl font-medium text-sm border" style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--muted-foreground)' }}>Back</button>
            <button onClick={() => bankAccount && setStep('amount')} disabled={!bankAccount}
              className="flex-1 py-3 rounded-xl font-semibold text-sm disabled:opacity-40"
              style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {step === 'amount' && (
        <div className="space-y-4">
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Enter withdrawal amount</p>
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--muted-foreground)' }}>AMOUNT ({currency})</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold" style={{ color: 'var(--muted-foreground)' }}>
                {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}
              </span>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
                className="w-full pl-8 pr-4 py-3 rounded-xl border text-sm font-mono focus:outline-none focus:ring-1 focus:ring-yellow-500/30"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: 'var(--foreground)' }} />
            </div>
            <div className="flex gap-2 mt-2">
              {['500', '1000', '5000', '10000'].map(v => (
                <button key={v} onClick={() => setAmount(v)}
                  className="flex-1 py-1.5 rounded-lg border text-xs font-semibold transition-all"
                  style={{ borderColor: amount === v ? 'var(--primary)' : 'rgba(255,255,255,0.07)', color: amount === v ? 'var(--primary)' : 'var(--muted-foreground)', backgroundColor: amount === v ? 'rgba(212,168,0,0.08)' : 'transparent' }}>
                  {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}{parseInt(v).toLocaleString()}
                </button>
              ))}
            </div>
          </div>
          <div className="p-3.5 rounded-xl space-y-1.5" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--muted-foreground)' }}>Available balance</span>
              <span className="font-semibold" style={{ color: '#34d399' }}>${availableBalance.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--muted-foreground)' }}>Withdrawal fee</span>
              <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{FEE_MAP[currency]?.fee}</span>
            </div>
          </div>
          <div className="flex gap-2.5">
            <button onClick={() => setStep('account')} className="flex-1 py-3 rounded-xl font-medium text-sm border" style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--muted-foreground)' }}>Back</button>
            <button onClick={() => amount && parseFloat(amount) > 0 && setStep('review')} disabled={!amount || parseFloat(amount) <= 0}
              className="flex-1 py-3 rounded-xl font-semibold text-sm disabled:opacity-40"
              style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
              Review →
            </button>
          </div>
        </div>
      )}

      {step === 'review' && (
        <div className="space-y-4">
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Review fees & estimated arrival</p>
          <div className="p-4 rounded-xl space-y-3" style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex justify-between text-sm pb-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--muted-foreground)' }}>Withdrawal amount</span>
              <span className="font-bold text-base" style={{ color: 'var(--foreground)' }}>{currency} {parseFloat(amount).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--muted-foreground)' }}>Withdrawal fee</span>
              <span className="font-semibold" style={{ color: '#f87171' }}>{FEE_MAP[currency]?.fee}</span>
            </div>
            <div className="flex justify-between text-sm pb-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <span style={{ color: 'var(--muted-foreground)' }}>Net amount</span>
              <span className="font-bold" style={{ color: '#34d399' }}>Backend calculated</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--muted-foreground)' }}>Estimated arrival</span>
              <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{FEE_MAP[currency]?.eta}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--muted-foreground)' }}>Destination</span>
              <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{BANK_ACCOUNTS.find(a => a.id === bankAccount)?.label}</span>
            </div>
          </div>
          <div className="flex gap-2.5">
            <button onClick={() => setStep('amount')} className="flex-1 py-3 rounded-xl font-medium text-sm border" style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--muted-foreground)' }}>Back</button>
            <button onClick={() => setStep('confirm')}
              className="flex-1 py-3 rounded-xl font-semibold text-sm"
              style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
              Continue →
            </button>
          </div>
        </div>
      )}

      {step === 'confirm' && (
        <div className="space-y-4">
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Security confirmation</p>
          <div className="flex items-start gap-3 p-4 rounded-xl" style={{ backgroundColor: 'rgba(212,168,0,0.06)', border: '1px solid rgba(212,168,0,0.18)' }}>
            <Shield size={16} style={{ color: 'var(--primary)' }} className="shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>For your security, please enter your 2FA or OTP code to authorize this withdrawal.</p>
          </div>
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--muted-foreground)' }}>SECURITY CODE (2FA / OTP)</label>
            <div className="relative">
              <Shield size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
              <input type="text" value={securityCode} onChange={e => setSecurityCode(e.target.value)}
                placeholder="Enter 2FA or OTP code"
                className="w-full pl-9 pr-4 py-3 rounded-xl border text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500/30"
                style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.08)', color: 'var(--foreground)' }} />
            </div>
          </div>
          <div className="flex gap-2.5">
            <button onClick={() => setStep('review')} className="flex-1 py-3 rounded-xl font-medium text-sm border" style={{ borderColor: 'rgba(255,255,255,0.1)', color: 'var(--muted-foreground)' }}>Back</button>
            <button onClick={() => setSubmitted(true)}
              className="flex-1 py-3 rounded-xl font-semibold text-sm"
              style={{ backgroundColor: '#ef4444', color: '#fff' }}>
              Confirm Withdrawal
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}

// ─── Chart data generator ─────────────────────────────────────────────────────
type ChartRange = '1D' | '1W' | '1M' | '3M' | '1Y' | 'All';
const CHART_RANGES: ChartRange[] = ['1D', '1W', '1M', '3M', '1Y', 'All'];

function generateChartData(range: ChartRange) {
  const points: { date: string; balance: number }[] = [];
  const counts: Record<ChartRange, number> = { '1D': 24, '1W': 7, '1M': 30, '3M': 90, '1Y': 52, 'All': 60 };
  const n = counts[range];
  let val = 12000;
  for (let i = 0; i < n; i++) {
    val = val + (Math.random() - 0.42) * 400;
    if (val < 5000) val = 5000;
    const d = new Date();
    if (range === '1D') d.setHours(d.getHours() - (n - i));
    else if (range === '1W') d.setDate(d.getDate() - (n - i));
    else if (range === '1M') d.setDate(d.getDate() - (n - i));
    else if (range === '3M') d.setDate(d.getDate() - (n - i));
    else if (range === '1Y') d.setDate(d.getDate() - (n - i) * 7);
    else d.setMonth(d.getMonth() - (n - i));
    points.push({ date: range === '1D' ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString([], { month: 'short', day: 'numeric' }), balance: Math.round(val) });
  }
  return points;
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
type ModalType = 'crypto-deposit' | 'bank-deposit' | 'crypto-withdraw' | 'bank-withdraw' | null;

function FinanceDashboard({ balance }: { balance: CustomerBalance }) {
  const [chartRange, setChartRange] = useState<ChartRange>('1M');
  const [chartData, setChartData] = useState<{ date: string; balance: number }[]>([]);
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [dismissedNotice, setDismissedNotice] = useState(false);

  useEffect(() => {
    setChartData(generateChartData(chartRange));
  }, [chartRange]);

  const kpiCards = [
    {
      label: 'Total Balance',
      value: balance.totalBalance,
      sub: 'All accounts',
      subColor: 'var(--muted-foreground)',
      iconBg: 'rgba(212,168,0,0.12)',
      iconBorder: 'rgba(212,168,0,0.25)',
      iconColor: 'var(--primary)',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
      trend: null,
    },
    {
      label: 'Available Balance',
      value: balance.availableBalance,
      sub: 'Ready for trading',
      subColor: '#34d399',
      iconBg: 'rgba(52,211,153,0.1)',
      iconBorder: 'rgba(52,211,153,0.2)',
      iconColor: '#34d399',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 3" />
        </svg>
      ),
      trend: null,
    },
    {
      label: 'Profit & Loss',
      value: null,
      sub: 'Realized + Unrealized',
      subColor: 'var(--muted-foreground)',
      iconBg: 'rgba(52,211,153,0.1)',
      iconBorder: 'rgba(52,211,153,0.2)',
      iconColor: '#34d399',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" /><polyline points="16 7 22 7 22 13" />
        </svg>
      ),
      trend: null,
    },
    {
      label: 'Pending',
      value: balance.pendingBalance,
      sub: 'In progress',
      subColor: 'var(--muted-foreground)',
      iconBg: 'rgba(251,191,36,0.1)',
      iconBorder: 'rgba(251,191,36,0.2)',
      iconColor: '#fbbf24',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      trend: null,
    },
  ];

  const chartMin = chartData.length ? Math.min(...chartData.map(d => d.balance)) * 0.97 : 0;
  const chartMax = chartData.length ? Math.max(...chartData.map(d => d.balance)) * 1.03 : 100000;

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiCards.map((card, i) => (
          <div key={i} className="rounded-2xl border p-5 relative overflow-hidden"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'rgba(255,255,255,0.07)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}>
            {/* Subtle gradient accent */}
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 -translate-y-8 translate-x-8"
              style={{ backgroundColor: card.iconColor, filter: 'blur(20px)' }} />
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: card.iconBg, border: `1px solid ${card.iconBorder}`, color: card.iconColor }}>
                {card.icon}
              </div>
            </div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'var(--muted-foreground)' }}>{card.label}</p>
            {card.value === null ? (
              <p className="text-2xl font-bold tabular-nums mb-1.5" style={{ color: 'rgba(255,255,255,0.2)' }}>—</p>
            ) : (
              <p className="text-2xl font-bold tabular-nums mb-1.5" style={{ color: card.value === 0 ? 'rgba(255,255,255,0.2)' : 'var(--foreground)' }}>
                {card.value === 0 ? '—' : `$${card.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </p>
            )}
            <p className="text-xs font-medium" style={{ color: card.subColor }}>{card.sub}</p>
          </div>
        ))}
      </div>

      {/* Notice */}
      {!dismissedNotice && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-xs" style={{ backgroundColor: 'rgba(212,168,0,0.06)', border: '1px solid rgba(212,168,0,0.15)' }}>
          <Info size={13} className="shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
          <p style={{ color: 'rgba(255,255,255,0.55)' }}>
            Balances shown are indicative. The authoritative balance is maintained by the backend financial ledger. Frontend actions do not directly modify your balance.
          </p>
          <button onClick={() => setDismissedNotice(true)} className="shrink-0 ml-auto text-base leading-none hover:opacity-70" style={{ color: 'var(--muted-foreground)' }}>×</button>
        </div>
      )}

      {/* Account Balance Overview Chart */}
      <div className="rounded-2xl border p-5"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'rgba(255,255,255,0.07)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>Account Balance Overview</h2>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Total account balance over time including deposits, withdrawals, and trading activity.</p>
          </div>
          <div className="flex items-center gap-1 shrink-0 p-1 rounded-xl" style={{ backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
            {CHART_RANGES.map(r => (
              <button key={r} onClick={() => setChartRange(r)}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={{
                  backgroundColor: chartRange === r ? 'rgba(212,168,0,0.18)' : 'transparent',
                  color: chartRange === r ? 'var(--primary)' : 'var(--muted-foreground)',
                  border: chartRange === r ? '1px solid rgba(212,168,0,0.3)' : '1px solid transparent',
                }}>
                {r}
              </button>
            ))}
          </div>
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgba(212,168,0,0.3)" />
                  <stop offset="100%" stopColor="rgba(212,168,0,0)" />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
              <YAxis domain={[chartMin, chartMax]} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} width={42} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--card)', border: '1px solid rgba(212,168,0,0.25)', borderRadius: '12px', fontSize: '12px', color: 'var(--foreground)' }}
                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Balance']}
              />
              <Area type="monotone" dataKey="balance" stroke="var(--primary)" strokeWidth={2} fill="url(#balanceGrad)" dot={false} activeDot={{ r: 4, fill: 'var(--primary)', stroke: 'var(--card)', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="rounded-xl flex flex-col items-center justify-center" style={{ height: 220, backgroundColor: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.07)' }}>
            <Activity size={28} className="mb-3" style={{ color: 'var(--muted-foreground)', opacity: 0.3 }} />
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Loading chart...</p>
          </div>
        )}
      </div>

      {/* Funding Actions */}
      <div className="rounded-2xl border p-5"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'rgba(255,255,255,0.07)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.04)',
        }}>
        <div className="mb-4">
          <h2 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>Funding Actions</h2>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Deposit or withdraw funds from your trading account.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Crypto Deposit */}
          <button onClick={() => setActiveModal('crypto-deposit')}
            className="flex items-center gap-4 p-4 rounded-xl border text-left transition-all hover:border-yellow-500/40 group"
            style={{ backgroundColor: 'rgba(247,147,26,0.04)', borderColor: 'rgba(247,147,26,0.18)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover:scale-105"
              style={{ backgroundColor: 'rgba(247,147,26,0.12)', border: '1px solid rgba(247,147,26,0.25)' }}>
              <Bitcoin size={20} style={{ color: '#F7931A' }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Crypto Deposit</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>BTC, ETH, USDT, USDC & more</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: 'rgba(52,211,153,0.1)', color: '#34d399' }}>Network fee only</span>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
          </button>

          {/* Bank Deposit */}
          <button onClick={() => setActiveModal('bank-deposit')}
            className="flex items-center gap-4 p-4 rounded-xl border text-left transition-all hover:border-yellow-500/40 group"
            style={{ backgroundColor: 'rgba(96,165,250,0.04)', borderColor: 'rgba(96,165,250,0.18)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover:scale-105"
              style={{ backgroundColor: 'rgba(96,165,250,0.12)', border: '1px solid rgba(96,165,250,0.25)' }}>
              <Building2 size={20} style={{ color: '#60a5fa' }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Bank Deposit</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Wire, SEPA, ACH transfer</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: 'rgba(96,165,250,0.1)', color: '#60a5fa' }}>Free · 1–3 days</span>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
          </button>

          {/* Crypto Withdrawal */}
          <button onClick={() => setActiveModal('crypto-withdraw')}
            className="flex items-center gap-4 p-4 rounded-xl border text-left transition-all hover:border-yellow-500/40 group"
            style={{ backgroundColor: 'rgba(248,113,113,0.04)', borderColor: 'rgba(248,113,113,0.18)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover:scale-105"
              style={{ backgroundColor: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.25)' }}>
              <ArrowUpRight size={20} style={{ color: '#f87171' }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Crypto Withdrawal</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Withdraw to any wallet address</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: 'rgba(248,113,113,0.1)', color: '#f87171' }}>Network fee</span>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
          </button>

          {/* Bank Withdrawal */}
          <button onClick={() => setActiveModal('bank-withdraw')}
            className="flex items-center gap-4 p-4 rounded-xl border text-left transition-all hover:border-yellow-500/40 group"
            style={{ backgroundColor: 'rgba(167,139,250,0.04)', borderColor: 'rgba(167,139,250,0.18)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all group-hover:scale-105"
              style={{ backgroundColor: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)' }}>
              <CreditCard size={20} style={{ color: '#a78bfa' }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Bank Withdrawal</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Transfer to your bank account</p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: 'rgba(167,139,250,0.1)', color: '#a78bfa' }}>From $8 fee</span>
              </div>
            </div>
            <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
          </button>
        </div>
      </div>

      {/* Bottom panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Transactions */}
        <div className="rounded-2xl border overflow-hidden"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'rgba(255,255,255,0.07)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Recent Transactions</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Latest deposits, withdrawals & funding activity</p>
            </div>
            <Link href="/transactions" className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:bg-white/5" style={{ color: 'var(--primary)', border: '1px solid rgba(212,168,0,0.2)' }}>
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  {['DATE', 'TYPE', 'AMOUNT', 'STATUS'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold tracking-wider" style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
            </table>
          </div>
          <div className="py-12 text-center">
            <History size={24} className="mx-auto mb-3" style={{ color: 'var(--muted-foreground)', opacity: 0.25 }} />
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>No transactions yet</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Transaction history will appear here once backend is connected.</p>
          </div>
        </div>

        {/* Trading History */}
        <div className="rounded-2xl border overflow-hidden"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'rgba(255,255,255,0.07)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.04)',
          }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Trading History</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Recent trades across all markets</p>
            </div>
            <Link href="/portfolio" className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:bg-white/5" style={{ color: 'var(--primary)', border: '1px solid rgba(212,168,0,0.2)' }}>
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)' }}>
                  {['DATE', 'MARKET', 'TYPE', 'P&L', 'STATUS'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-semibold tracking-wider" style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
            </table>
          </div>
          <div className="py-12 text-center">
            <TrendingUp size={24} className="mx-auto mb-3" style={{ color: 'var(--muted-foreground)', opacity: 0.25 }} />
            <p className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>No trading history yet</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Completed trades will appear here once backend is connected.</p>
          </div>
        </div>
      </div>

      {/* Modals */}
      {activeModal === 'crypto-deposit' && <CryptoDepositModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'bank-deposit' && <BankDepositModal onClose={() => setActiveModal(null)} />}
      {activeModal === 'crypto-withdraw' && <CryptoWithdrawModal availableBalance={balance.availableBalance} onClose={() => setActiveModal(null)} />}
      {activeModal === 'bank-withdraw' && <BankWithdrawModal availableBalance={balance.availableBalance} onClose={() => setActiveModal(null)} />}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
function FinancePageInner() {
  const [balance, setBalance] = useState<CustomerBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fundsService.getBalance().then(bal => {
      setBalance(bal);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="py-5 space-y-4">
          <div className="h-8 w-52 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--muted)' }} />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-28 rounded-2xl border animate-pulse" style={{ backgroundColor: 'var(--card)', borderColor: 'rgba(255,255,255,0.07)' }} />)}
          </div>
          <div className="h-72 rounded-2xl border animate-pulse" style={{ backgroundColor: 'var(--card)', borderColor: 'rgba(255,255,255,0.07)' }} />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="py-5 w-full">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(212,168,0,0.12)', border: '1px solid rgba(212,168,0,0.25)' }}>
              <BarChart3 size={18} style={{ color: 'var(--primary)' }} />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Balance &amp; Funds</h1>
          </div>
          <p className="text-sm ml-12" style={{ color: 'var(--muted-foreground)' }}>
            Manage your account balance, track performance, and fund your trading account.
          </p>
        </div>

        {balance && <FinanceDashboard balance={balance} />}
      </div>
    </AppLayout>
  );
}

export default function FinancePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--background)' }}>
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
      </div>
    }>
      <FinancePageInner />
    </Suspense>
  );
}
