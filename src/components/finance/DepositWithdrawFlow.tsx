'use client';
import React, { useState } from 'react';
import { financeService, WithdrawMethod } from '@/services/finance.service';

import { CheckCircle, Clock, AlertCircle, ArrowDownLeft, ArrowUpRight, Bitcoin, Building2, Copy, Check, Info } from 'lucide-react';

type FlowType = 'deposit' | 'withdrawal';

// ── Deposit method types ──────────────────────────────────────────────────────
type DepositMethodType = 'crypto' | 'bank';

// Crypto deposit steps: method → asset → network → amount → instructions → review
type CryptoDepositStep = 'method' | 'asset' | 'network' | 'amount' | 'instructions' | 'review';
// Bank deposit steps: method → amount → instructions → review
type BankDepositStep = 'method' | 'amount' | 'instructions' | 'review';

type WithdrawStep = 'method' | 'amount' | 'destination' | 'confirm' | 'success';

const WITHDRAW_METHODS: { value: WithdrawMethod; label: string; fee: string; time: string }[] = [
  { value: 'bank_transfer', label: 'Bank Transfer', fee: '$15', time: '1–3 business days' },
  { value: 'crypto', label: 'Crypto Wallet', fee: 'Network fee', time: '10–60 min' },
  { value: 'wire', label: 'Wire Transfer', fee: '$25', time: '2–5 business days' },
];

const CRYPTO_ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin', color: '#F7931A' },
  { symbol: 'ETH', name: 'Ethereum', color: '#627EEA' },
  { symbol: 'USDT', name: 'Tether USD', color: '#26A17B' },
  { symbol: 'USDC', name: 'USD Coin', color: '#2775CA' },
  { symbol: 'BNB', name: 'BNB', color: '#F3BA2F' },
  { symbol: 'SOL', name: 'Solana', color: '#9945FF' },
  { symbol: 'XRP', name: 'Ripple', color: '#00AAE4' },
  { symbol: 'ADA', name: 'Cardano', color: '#0033AD' },
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
  BNB: [
    { id: 'bep20', name: 'BNB Smart Chain (BEP-20)', fee: '<$0.10', time: '~1 min', confirmations: 15 },
  ],
  SOL: [
    { id: 'solana', name: 'Solana Network', fee: '<$0.01', time: '~30 sec', confirmations: 1 },
  ],
  XRP: [
    { id: 'xrp', name: 'XRP Ledger', fee: '~0.00001 XRP', time: '3–5 sec', confirmations: 1 },
  ],
  ADA: [
    { id: 'cardano', name: 'Cardano Network', fee: '~0.17 ADA', time: '1–5 min', confirmations: 15 },
  ],
};

// Mock deposit addresses — backend will provide real ones
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

interface DepositWithdrawFlowProps {
  type: FlowType;
  onClose: () => void;
  availableBalance?: number;
}

const inputCls = "w-full text-sm px-3 py-2.5 rounded-lg border outline-none transition-colors focus:ring-1 focus:ring-yellow-500/30";
const inputStyle = { backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' };

// ── Crypto Deposit Flow ───────────────────────────────────────────────────────
function CryptoDepositFlow({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<CryptoDepositStep>('asset');
  const [selectedAsset, setSelectedAsset] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [amount, setAmount] = useState('');
  const [copied, setCopied] = useState(false);

  const asset = CRYPTO_ASSETS.find(a => a.symbol === selectedAsset);
  const networks = selectedAsset ? (CRYPTO_NETWORKS[selectedAsset] || []) : [];
  const network = networks.find(n => n.id === selectedNetwork);
  const depositAddress = selectedAsset && selectedNetwork ? (MOCK_DEPOSIT_ADDRESSES[selectedAsset]?.[selectedNetwork] || '') : '';

  const STEPS: { id: CryptoDepositStep; label: string }[] = [
    { id: 'asset', label: 'Asset' },
    { id: 'network', label: 'Network' },
    { id: 'amount', label: 'Amount' },
    { id: 'instructions', label: 'Address' },
    { id: 'review', label: 'Review' },
  ];
  const stepIndex = STEPS.findIndex(s => s.id === step);

  const handleCopy = () => {
    navigator.clipboard.writeText(depositAddress).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-4">
      {/* Step progress */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold"
                style={{
                  fontSize: '10px',
                  backgroundColor: i < stepIndex ? 'var(--primary)' : i === stepIndex ? 'rgba(212,168,0,0.2)' : 'var(--muted)',
                  border: `1.5px solid ${i <= stepIndex ? 'var(--primary)' : 'var(--border)'}`,
                  color: i < stepIndex ? '#000' : i === stepIndex ? 'var(--primary)' : 'var(--muted-foreground)',
                }}>
                {i < stepIndex ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: '9px', color: i === stepIndex ? 'var(--primary)' : 'var(--muted-foreground)' }}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className="flex-1 h-px mb-3" style={{ backgroundColor: i < stepIndex ? 'var(--primary)' : 'var(--border)' }} />}
          </React.Fragment>
        ))}
      </div>

      <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
        {/* Step: Asset */}
        {step === 'asset' && (
          <div className="space-y-3">
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Select Asset to Deposit</p>
            <div className="grid grid-cols-2 gap-2">
              {CRYPTO_ASSETS.map(a => (
                <button key={a.symbol}
                  onClick={() => setSelectedAsset(a.symbol)}
                  className="flex items-center gap-3 p-3 rounded-lg border transition-all text-left"
                  style={{
                    borderColor: selectedAsset === a.symbol ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: selectedAsset === a.symbol ? 'rgba(212,168,0,0.06)' : 'transparent',
                  }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: a.color + '22', color: a.color }}>
                    {a.symbol.slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{a.symbol}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{a.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Network */}
        {step === 'network' && (
          <div className="space-y-3">
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Select Network for {selectedAsset}</p>
            <div className="p-2 rounded-lg flex items-center gap-2" style={{ backgroundColor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <AlertCircle size={13} style={{ color: '#f59e0b' }} className="shrink-0" />
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Ensure you select the correct network. Sending to the wrong network may result in permanent loss.</p>
            </div>
            <div className="space-y-2">
              {networks.map(n => (
                <button key={n.id}
                  onClick={() => setSelectedNetwork(n.id)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left"
                  style={{
                    borderColor: selectedNetwork === n.id ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: selectedNetwork === n.id ? 'rgba(212,168,0,0.06)' : 'transparent',
                  }}>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{n.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                      {n.confirmations > 0 ? `${n.confirmations} confirmations · ` : ''}{n.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>Fee</p>
                    <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{n.fee}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step: Amount */}
        {step === 'amount' && (
          <div className="space-y-3">
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Enter Deposit Amount</p>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Amount ({selectedAsset})</label>
              <div className="relative">
                <input
                  type="number"
                  className={inputCls}
                  style={inputStyle}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold" style={{ color: 'var(--primary)' }}>{selectedAsset}</span>
              </div>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Network: <span style={{ color: 'var(--foreground)' }}>{network?.name}</span></p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Network fee: <span style={{ color: 'var(--foreground)' }}>{network?.fee}</span></p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Estimated arrival: <span style={{ color: 'var(--foreground)' }}>{network?.time}</span></p>
            </div>
          </div>
        )}

        {/* Step: Instructions / Address */}
        {step === 'instructions' && (
          <div className="space-y-3">
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Deposit Address</p>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: '#22c55e' }}>Send {selectedAsset} to this address</p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Only send {selectedAsset} via {network?.name}. Other assets will be lost.</p>
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Deposit Address</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2.5 rounded-lg border font-mono text-xs break-all" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                  {depositAddress || 'Address will be provided by backend'}
                </div>
                <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border text-xs font-medium transition-all shrink-0" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                  {copied ? <Check size={12} style={{ color: '#22c55e' }} /> : <Copy size={12} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Asset', value: `${asset?.name} (${selectedAsset})` },
                { label: 'Network', value: network?.name || '' },
                { label: 'Confirmations', value: network?.confirmations ? `${network.confirmations} required` : 'N/A' },
                { label: 'Min. Deposit', value: 'Platform configured' },
              ].map(({ label, value }) => (
                <div key={label} className="p-2 rounded-lg" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
                  <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--foreground)' }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step: Review */}
        {step === 'review' && (
          <div className="space-y-3">
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Review Deposit Details</p>
            {[
              ['Asset', `${selectedAsset} — ${asset?.name}`],
              ['Network', network?.name || ''],
              ['Amount', amount ? `${amount} ${selectedAsset}` : 'Not specified'],
              ['Network Fee', network?.fee || ''],
              ['Estimated Arrival', network?.time || ''],
              ['Deposit Address', depositAddress ? depositAddress.slice(0, 20) + '...' : 'Backend provided'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>{label}</span>
                <span className="font-medium text-right max-w-[60%] truncate" style={{ color: 'var(--foreground)' }}>{value}</span>
              </div>
            ))}
            <div className="p-3 rounded-lg flex items-start gap-2" style={{ backgroundColor: 'rgba(245,196,0,0.06)', border: '1px solid rgba(245,196,0,0.15)' }}>
              <Info size={13} className="shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Balances are updated after backend confirmation. Deposits do not modify your balance directly — all changes require backend ledger confirmation.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => {
            if (step === 'asset') onBack();
            else if (step === 'network') setStep('asset');
            else if (step === 'amount') setStep('network');
            else if (step === 'instructions') setStep('amount');
            else if (step === 'review') setStep('instructions');
          }}
          className="text-sm px-4 py-2 rounded-lg border transition-colors"
          style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
          Back
        </button>
        <button
          onClick={() => {
            if (step === 'asset' && selectedAsset) setStep('network');
            else if (step === 'network' && selectedNetwork) setStep('amount');
            else if (step === 'amount') setStep('instructions');
            else if (step === 'instructions') setStep('review');
          }}
          disabled={
            (step === 'asset' && !selectedAsset) ||
            (step === 'network' && !selectedNetwork)
          }
          className="text-sm px-5 py-2 rounded-lg font-semibold transition-all disabled:opacity-40"
          style={{ backgroundColor: step === 'review' ? 'var(--primary)' : 'var(--primary)', color: '#000' }}>
          {step === 'review' ? 'Done — Awaiting Deposit' : 'Continue →'}
        </button>
      </div>
    </div>
  );
}

// ── Bank Deposit Flow ─────────────────────────────────────────────────────────
function BankDepositFlow({ onBack }: { onBack: () => void }) {
  const [step, setBankStep] = useState<BankDepositStep>('amount');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [copied, setCopied] = useState<string | null>(null);

  const BANK_DETAILS = {
    bankName: 'Trade Console Financial Ltd',
    accountName: 'TC Client Funds Account',
    accountNumber: 'Provided by platform',
    sortCode: 'Provided by platform',
    iban: 'Provided by platform',
    swift: 'Provided by platform',
    reference: 'TC-' + Math.random().toString(36).slice(2, 10).toUpperCase(),
  };

  const handleCopy = (value: string, key: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const STEPS: { id: BankDepositStep; label: string }[] = [
    { id: 'amount', label: 'Amount' },
    { id: 'instructions', label: 'Details' },
    { id: 'review', label: 'Review' },
  ];
  const stepIndex = STEPS.findIndex(s => s.id === step);

  return (
    <div className="space-y-4">
      {/* Step progress */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold"
                style={{
                  fontSize: '10px',
                  backgroundColor: i < stepIndex ? 'var(--primary)' : i === stepIndex ? 'rgba(212,168,0,0.2)' : 'var(--muted)',
                  border: `1.5px solid ${i <= stepIndex ? 'var(--primary)' : 'var(--border)'}`,
                  color: i < stepIndex ? '#000' : i === stepIndex ? 'var(--primary)' : 'var(--muted-foreground)',
                }}>
                {i < stepIndex ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: '9px', color: i === stepIndex ? 'var(--primary)' : 'var(--muted-foreground)' }}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className="flex-1 h-px mb-3" style={{ backgroundColor: i < stepIndex ? 'var(--primary)' : 'var(--border)' }} />}
          </React.Fragment>
        ))}
      </div>

      <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
        {step === 'amount' && (
          <div className="space-y-3">
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Bank Transfer Deposit</p>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Amount</label>
              <div className="relative">
                <input
                  type="number"
                  className={inputCls}
                  style={inputStyle}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold" style={{ color: 'var(--primary)' }}>{currency}</span>
              </div>
            </div>
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Currency</label>
              <div className="flex gap-2">
                {['USD', 'EUR', 'GBP'].map(c => (
                  <button key={c} onClick={() => setCurrency(c)}
                    className="flex-1 py-2 rounded-lg border text-sm font-semibold transition-all"
                    style={{
                      borderColor: currency === c ? 'var(--primary)' : 'var(--border)',
                      backgroundColor: currency === c ? 'rgba(212,168,0,0.08)' : 'transparent',
                      color: currency === c ? 'var(--primary)' : 'var(--muted-foreground)',
                    }}>
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              {['500', '1000', '5000', '10000'].map(v => (
                <button key={v} onClick={() => setAmount(v)}
                  className="px-3 py-1.5 rounded-lg border text-xs transition-colors"
                  style={{ borderColor: amount === v ? 'var(--primary)' : 'var(--border)', color: amount === v ? 'var(--primary)' : 'var(--muted-foreground)', backgroundColor: amount === v ? 'rgba(212,168,0,0.08)' : 'transparent' }}>
                  {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£'}{v}
                </button>
              ))}
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Processing time: <span style={{ color: 'var(--foreground)' }}>1–3 business days</span></p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Fee: <span style={{ color: 'var(--foreground)' }}>Free (bank fees may apply)</span></p>
            </div>
          </div>
        )}

        {step === 'instructions' && (
          <div className="space-y-3">
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Bank Transfer Details</p>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.2)' }}>
              <p className="text-xs font-semibold" style={{ color: '#22c55e' }}>Transfer {amount ? `${currency} ${parseFloat(amount).toLocaleString()}` : 'your amount'} to the account below</p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Include your reference number in the payment description.</p>
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
                <div key={key} className="flex items-center justify-between p-2.5 rounded-lg" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
                    <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--foreground)' }}>{value}</p>
                  </div>
                  <button onClick={() => handleCopy(value, key)} className="p-1.5 rounded transition-colors hover:bg-white/5" style={{ color: 'var(--muted-foreground)' }}>
                    {copied === key ? <Check size={13} style={{ color: '#22c55e' }} /> : <Copy size={13} />}
                  </button>
                </div>
              ))}
              <div className="flex items-center justify-between p-2.5 rounded-lg" style={{ backgroundColor: 'rgba(212,168,0,0.06)', border: '1px solid rgba(212,168,0,0.2)' }}>
                <div>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Payment Reference <span className="text-red-400">*Required</span></p>
                  <p className="text-sm font-bold font-mono mt-0.5" style={{ color: 'var(--primary)' }}>{BANK_DETAILS.reference}</p>
                </div>
                <button onClick={() => handleCopy(BANK_DETAILS.reference, 'ref')} className="p-1.5 rounded transition-colors hover:bg-white/5" style={{ color: 'var(--muted-foreground)' }}>
                  {copied === 'ref' ? <Check size={13} style={{ color: '#22c55e' }} /> : <Copy size={13} />}
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'review' && (
          <div className="space-y-3">
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Review & Confirm</p>
            {[
              ['Method', 'Bank Transfer'],
              ['Amount', amount ? `${currency} ${parseFloat(amount).toLocaleString()}` : 'Not specified'],
              ['Processing Time', '1–3 business days'],
              ['Fee', 'Free (bank fees may apply)'],
              ['Reference', BANK_DETAILS.reference],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>{label}</span>
                <span className="font-medium" style={{ color: 'var(--foreground)' }}>{value}</span>
              </div>
            ))}
            <div className="p-3 rounded-lg flex items-start gap-2" style={{ backgroundColor: 'rgba(245,196,0,0.06)', border: '1px solid rgba(245,196,0,0.15)' }}>
              <Info size={13} className="shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Your balance will be updated after the bank transfer is received and confirmed by our finance team. This typically takes 1–3 business days.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between">
        <button
          onClick={() => {
            if (step === 'amount') onBack();
            else if (step === 'instructions') setBankStep('amount');
            else if (step === 'review') setBankStep('instructions');
          }}
          className="text-sm px-4 py-2 rounded-lg border transition-colors"
          style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
          Back
        </button>
        <button
          onClick={() => {
            if (step === 'amount') setBankStep('instructions');
            else if (step === 'instructions') setBankStep('review');
          }}
          disabled={step === 'amount' && !amount}
          className="text-sm px-5 py-2 rounded-lg font-semibold transition-all disabled:opacity-40"
          style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
          {step === 'review' ? 'Done — Transfer Initiated' : 'Continue →'}
        </button>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function DepositWithdrawFlow({ type, onClose, availableBalance = 0 }: DepositWithdrawFlowProps) {
  const isDeposit = type === 'deposit';

  // Deposit method selection
  const [depositMethod, setDepositMethod] = useState<DepositMethodType | null>(null);

  // Withdrawal state
  const [withdrawStep, setWithdrawStep] = useState<WithdrawStep>('method');
  const [selectedWithdrawMethod, setSelectedWithdrawMethod] = useState<WithdrawMethod>('bank_transfer');
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState('');

  const selectedWMethod = WITHDRAW_METHODS.find(m => m.value === selectedWithdrawMethod);

  const handleWithdrawNext = () => {
    if (withdrawStep === 'method') setWithdrawStep('amount');
    else if (withdrawStep === 'amount') setWithdrawStep('destination');
    else if (withdrawStep === 'destination') setWithdrawStep('confirm');
    else if (withdrawStep === 'confirm') handleWithdrawSubmit();
  };

  const handleWithdrawSubmit = async () => {
    setLoading(true);
    const res = await financeService.submitWithdrawal('cust-001', {
      amount: parseFloat(amount),
      currency: 'USD',
      method: selectedWithdrawMethod,
      destination,
    });
    setLoading(false);
    if (res.success && res.withdrawal) {
      setReference(res.withdrawal.reference);
      setWithdrawStep('success');
    }
  };

  const handleWithdrawBack = () => {
    if (withdrawStep === 'amount') setWithdrawStep('method');
    else if (withdrawStep === 'destination') setWithdrawStep('amount');
    else if (withdrawStep === 'confirm') setWithdrawStep('destination');
  };

  // ── Deposit: Method selection screen ──────────────────────────────────────
  if (isDeposit && !depositMethod) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}>
            <ArrowDownLeft size={14} style={{ color: '#22c55e' }} />
          </div>
          <div>
            <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Deposit Funds</h3>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Choose your deposit method</p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setDepositMethod('crypto')}
            className="w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left hover:border-yellow-500/50"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(247,147,26,0.12)', border: '1px solid rgba(247,147,26,0.25)' }}>
              <Bitcoin size={22} style={{ color: '#F7931A' }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Crypto Deposit</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Deposit BTC, ETH, USDT, USDC and more via blockchain</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>Network fee only</span>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>10–60 min</span>
              </div>
            </div>
            <div className="text-gray-400">→</div>
          </button>

          <button
            onClick={() => setDepositMethod('bank')}
            className="w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left hover:border-yellow-500/50"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)' }}>
              <Building2 size={22} style={{ color: '#3b82f6' }} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Bank Deposit</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Bank transfer, wire transfer, or SEPA payment</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(59,130,246,0.1)', color: '#3b82f6' }}>Free</span>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>1–3 business days</span>
              </div>
            </div>
            <div className="text-gray-400">→</div>
          </button>
        </div>

        <div className="flex justify-end">
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-lg border transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // ── Deposit: Crypto flow ───────────────────────────────────────────────────
  if (isDeposit && depositMethod === 'crypto') {
    return <CryptoDepositFlow onBack={() => setDepositMethod(null)} />;
  }

  // ── Deposit: Bank flow ─────────────────────────────────────────────────────
  if (isDeposit && depositMethod === 'bank') {
    return <BankDepositFlow onBack={() => setDepositMethod(null)} />;
  }

  // ── Withdrawal flow ────────────────────────────────────────────────────────
  const WITHDRAW_STEP_LABELS = ['Method', 'Amount', 'Destination', 'Confirm', 'Done'];
  const withdrawStepIndex = ['method', 'amount', 'destination', 'confirm', 'success'].indexOf(withdrawStep);
  const isSuccess = withdrawStep === 'success';
  const isConfirm = withdrawStep === 'confirm';
  const canGoBack = !isSuccess && withdrawStep !== 'method';

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(239,68,68,0.15)' }}>
          <ArrowUpRight size={14} style={{ color: '#ef4444' }} />
        </div>
        <div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Withdraw Funds</h3>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Available: ${availableBalance.toLocaleString()}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-1">
        {WITHDRAW_STEP_LABELS.map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-6 h-6 rounded-full flex items-center justify-center font-bold"
                style={{
                  fontSize: '10px',
                  backgroundColor: i < withdrawStepIndex ? 'var(--primary)' : i === withdrawStepIndex ? 'rgba(212,168,0,0.2)' : 'var(--muted)',
                  border: `1.5px solid ${i <= withdrawStepIndex ? 'var(--primary)' : 'var(--border)'}`,
                  color: i < withdrawStepIndex ? '#000' : i === withdrawStepIndex ? 'var(--primary)' : 'var(--muted-foreground)',
                }}>
                {i < withdrawStepIndex ? '✓' : i + 1}
              </div>
              <span className="hidden sm:block" style={{ fontSize: '9px', color: i === withdrawStepIndex ? 'var(--primary)' : 'var(--muted-foreground)' }}>{label}</span>
            </div>
            {i < WITHDRAW_STEP_LABELS.length - 1 && <div className="flex-1 h-px" style={{ backgroundColor: i < withdrawStepIndex ? 'var(--primary)' : 'var(--border)' }} />}
          </React.Fragment>
        ))}
      </div>

      <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
        {withdrawStep === 'method' && (
          <div className="space-y-2">
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Select withdrawal method</p>
            {WITHDRAW_METHODS.map(m => {
              const isSelected = selectedWithdrawMethod === m.value;
              return (
                <button key={m.value}
                  onClick={() => setSelectedWithdrawMethod(m.value as WithdrawMethod)}
                  className="w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left"
                  style={{ borderColor: isSelected ? 'var(--primary)' : 'var(--border)', backgroundColor: isSelected ? 'rgba(212,168,0,0.06)' : 'transparent' }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{m.label}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{m.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Fee: {m.fee}</p>
                    {isSelected && <span className="text-xs" style={{ color: 'var(--primary)' }}>Selected ✓</span>}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {withdrawStep === 'amount' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'var(--muted-foreground)' }}>$</span>
                <input type="number" className={inputCls + " pl-7"} style={inputStyle} value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" min="1" />
              </div>
            </div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Available: <span style={{ color: 'var(--foreground)' }}>${availableBalance.toLocaleString()}</span>
              {' · '}Fee: <span style={{ color: 'var(--foreground)' }}>{selectedWMethod?.fee}</span>
            </p>
            <div className="flex gap-2">
              {['500', '1000', '5000', '10000'].map(v => (
                <button key={v} onClick={() => setAmount(v)}
                  className="flex-1 text-xs py-1.5 rounded-lg border transition-colors"
                  style={{ borderColor: amount === v ? 'var(--primary)' : 'var(--border)', color: amount === v ? 'var(--primary)' : 'var(--muted-foreground)', backgroundColor: amount === v ? 'rgba(212,168,0,0.08)' : 'transparent' }}>
                  ${v}
                </button>
              ))}
            </div>
          </div>
        )}

        {withdrawStep === 'destination' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>
                {selectedWithdrawMethod === 'crypto' ? 'Wallet Address' : 'Bank Account / IBAN'}
              </label>
              <input className={inputCls} style={inputStyle} value={destination} onChange={e => setDestination(e.target.value)}
                placeholder={selectedWithdrawMethod === 'crypto' ? '0x...' : 'IBAN or account number'} />
            </div>
            <div className="p-3 rounded-lg flex items-start gap-2" style={{ backgroundColor: 'rgba(245,196,0,0.06)', border: '1px solid rgba(245,196,0,0.15)' }}>
              <AlertCircle size={13} className="mt-0.5 shrink-0" style={{ color: 'var(--primary)' }} />
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Double-check the destination. Funds sent to incorrect addresses cannot be recovered.</p>
            </div>
          </div>
        )}

        {isConfirm && (
          <div className="space-y-2">
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Confirm withdrawal</p>
            {[
              ['Method', selectedWMethod?.label],
              ['Amount', `$${parseFloat(amount || '0').toLocaleString()}`],
              ['Fee', selectedWMethod?.fee],
              ['Estimated arrival', selectedWMethod?.time],
              ['Destination', destination || '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-sm py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>{label}</span>
                <span style={{ color: 'var(--foreground)' }}>{value}</span>
              </div>
            ))}
          </div>
        )}

        {isSuccess && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}>
              <CheckCircle size={24} style={{ color: '#22c55e' }} />
            </div>
            <div>
              <p className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>Withdrawal Requested</p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Your withdrawal of ${parseFloat(amount).toLocaleString()} has been queued.</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs" style={{ borderColor: 'rgba(212,168,0,0.3)', backgroundColor: 'rgba(212,168,0,0.06)', color: 'var(--muted-foreground)' }}>
              <Clock size={11} style={{ color: 'var(--primary)' }} />
              Reference: {reference}
            </div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Estimated: {selectedWMethod?.time}</p>
          </div>
        )}
      </div>

      {!isSuccess && (
        <div className="flex justify-between">
          <button onClick={canGoBack ? handleWithdrawBack : onClose}
            className="text-sm px-4 py-2 rounded-lg border transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
            {canGoBack ? 'Back' : 'Cancel'}
          </button>
          <button
            onClick={handleWithdrawNext}
            disabled={loading}
            className="text-sm px-5 py-2 rounded-lg font-semibold transition-all disabled:opacity-60"
            style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
            {loading ? 'Processing...' : isConfirm ? 'Confirm Withdrawal' : 'Continue →'}
          </button>
        </div>
      )}
      {isSuccess && (
        <div className="flex justify-end">
          <button onClick={onClose} className="text-sm px-5 py-2 rounded-lg font-semibold" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>Done</button>
        </div>
      )}
    </div>
  );
}
