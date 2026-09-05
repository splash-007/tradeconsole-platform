'use client';
import React, { useState, useEffect, Suspense } from 'react';
import AppLayout from '@/components/AppLayout';
import { fundsService, CustomerBalance, FundsHistoryEntry, FundsHistoryStatus } from '@/services/funds.service';


import { ArrowDownLeft, ArrowUpRight, History, Info, AlertTriangle, Check, X, Shield, Copy, Building2, Wallet, TrendingUp, Activity, DollarSign, Landmark, Hash, CheckCircle2, Clock } from 'lucide-react';


// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: FundsHistoryStatus | string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    draft:          { label: 'Draft',           color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
    submitted:      { label: 'Submitted',       color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
    pending:        { label: 'Pending',         color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    pending_review: { label: 'Pending Review',  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    processing:     { label: 'Processing',      color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
    completed:      { label: 'Completed',       color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
    failed:         { label: 'Failed',          color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    cancelled:      { label: 'Cancelled',       color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
    rejected:       { label: 'Rejected',        color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
    approved:       { label: 'Approved',        color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  };
  const cfg = map[status] || { label: status, color: '#6b7280', bg: 'rgba(107,114,128,0.1)' };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold" style={{ color: cfg.color, backgroundColor: cfg.bg }}>
      {cfg.label}
    </span>
  );
}

// ─── Modal wrapper ────────────────────────────────────────────────────────────

function Modal({ open, onClose, title, subtitle, icon, iconBg, iconColor, children }: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  children: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
      <div
        className="relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', maxHeight: '90vh' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: iconBg, color: iconColor }}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{title}</h2>
            {subtitle && <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:opacity-70"
            style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}
          >
            <X size={14} />
          </button>
        </div>
        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Crypto Deposit Modal ─────────────────────────────────────────────────────

const CRYPTO_ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin', color: '#f7931a' },
  { symbol: 'ETH', name: 'Ethereum', color: '#627eea' },
  { symbol: 'USDT', name: 'Tether', color: '#26a17b' },
  { symbol: 'USDC', name: 'USD Coin', color: '#2775ca' },
  { symbol: 'BNB', name: 'BNB', color: '#f3ba2f' },
  { symbol: 'SOL', name: 'Solana', color: '#9945ff' },
  { symbol: 'XRP', name: 'XRP', color: '#346aa9' },
  { symbol: 'LTC', name: 'Litecoin', color: '#bfbbbb' },
];

const CHAINS: Record<string, string[]> = {
  BTC:  ['Bitcoin (BTC)'],
  ETH:  ['Ethereum (ERC-20)', 'Arbitrum', 'Optimism', 'Base'],
  USDT: ['Ethereum (ERC-20)', 'Tron (TRC-20)', 'BNB Smart Chain (BEP-20)', 'Solana'],
  USDC: ['Ethereum (ERC-20)', 'Solana', 'Arbitrum', 'Base', 'Polygon'],
  BNB:  ['BNB Smart Chain (BEP-20)', 'Ethereum (ERC-20)'],
  SOL:  ['Solana'],
  XRP:  ['XRP Ledger'],
  LTC:  ['Litecoin (LTC)'],
};

function CryptoDepositModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [asset, setAsset] = useState('');
  const [chain, setChain] = useState('');
  const [txHash, setTxHash] = useState('');
  const [amount, setAmount] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const chains = asset ? (CHAINS[asset] || []) : [];
  const depositAddress = asset ? `0x${asset.toLowerCase()}...demo_address_${asset.toLowerCase()}` : '';

  const handleClose = () => {
    setAsset(''); setChain(''); setTxHash(''); setAmount('');
    setSubmitted(false); setSubmitting(false);
    onClose();
  };

  const handleCopy = () => {
    if (depositAddress) {
      navigator.clipboard.writeText(depositAddress).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async () => {
    if (!asset || !chain || !txHash) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Modal open={open} onClose={handleClose} title="Crypto Deposit" subtitle="Submit your transaction" icon={<Wallet size={16} />} iconBg="rgba(212,168,0,0.15)" iconColor="var(--primary)">
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.3)' }}>
            <CheckCircle2 size={26} style={{ color: '#22c55e' }} />
          </div>
          <h3 className="text-base font-bold mb-1" style={{ color: 'var(--foreground)' }}>Deposit Submitted!</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>Your {asset} deposit on {chain} has been submitted for review.</p>
          <div className="rounded-xl p-3 text-xs text-left mb-5 space-y-1.5" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
            <div className="flex justify-between"><span style={{ color: 'var(--muted-foreground)' }}>Asset</span><span className="font-semibold" style={{ color: 'var(--foreground)' }}>{asset}</span></div>
            <div className="flex justify-between"><span style={{ color: 'var(--muted-foreground)' }}>Network</span><span className="font-semibold" style={{ color: 'var(--foreground)' }}>{chain}</span></div>
            <div className="flex justify-between"><span style={{ color: 'var(--muted-foreground)' }}>Amount</span><span className="font-semibold" style={{ color: 'var(--foreground)' }}>{amount || '—'} {asset}</span></div>
            <div className="flex justify-between gap-2"><span className="shrink-0" style={{ color: 'var(--muted-foreground)' }}>TX Hash</span><span className="font-mono text-xs truncate" style={{ color: 'var(--foreground)' }}>{txHash}</span></div>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-xl text-xs mb-5" style={{ backgroundColor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <Clock size={12} className="shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
            <p style={{ color: 'var(--muted-foreground)' }}>Your balance will be credited after our team verifies the transaction on-chain. This usually takes 10–30 minutes.</p>
          </div>
          <button onClick={handleClose} className="w-full py-2.5 rounded-xl text-sm font-semibold" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>Done</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Crypto Deposit" subtitle="Select asset, network and submit TX hash" icon={<Wallet size={16} />} iconBg="rgba(212,168,0,0.15)" iconColor="var(--primary)">
      <div className="space-y-5">
        {/* Step 1: Select Asset */}
        <div>
          <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--muted-foreground)' }}>1. Select Crypto Asset</label>
          <div className="grid grid-cols-4 gap-2">
            {CRYPTO_ASSETS.map(a => (
              <button
                key={a.symbol}
                onClick={() => { setAsset(a.symbol); setChain(''); }}
                className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border transition-all"
                style={{
                  borderColor: asset === a.symbol ? a.color : 'var(--border)',
                  backgroundColor: asset === a.symbol ? `${a.color}14` : 'var(--muted)',
                }}
              >
                <span className="text-xs font-bold" style={{ color: asset === a.symbol ? a.color : 'var(--foreground)' }}>{a.symbol}</span>
                <span className="text-xs leading-tight text-center" style={{ color: 'var(--muted-foreground)', fontSize: 9 }}>{a.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Select Chain */}
        {asset && (
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--muted-foreground)' }}>2. Select Network / Chain</label>
            <div className="space-y-1.5">
              {chains.map(c => (
                <button
                  key={c}
                  onClick={() => setChain(c)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all"
                  style={{
                    borderColor: chain === c ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: chain === c ? 'rgba(212,168,0,0.08)' : 'var(--muted)',
                    color: chain === c ? 'var(--primary)' : 'var(--foreground)',
                  }}
                >
                  <span className="font-medium text-xs">{c}</span>
                  {chain === c && <Check size={13} style={{ color: 'var(--primary)' }} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Deposit Address */}
        {asset && chain && (
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--muted-foreground)' }}>3. Send to this address</label>
            <div className="rounded-xl border p-3" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <span className="flex-1 font-mono text-xs break-all" style={{ color: 'var(--foreground)' }}>{depositAddress}</span>
                <button onClick={handleCopy} className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all" style={{ backgroundColor: copied ? 'rgba(34,197,94,0.12)' : 'var(--card)', color: copied ? '#22c55e' : 'var(--muted-foreground)', border: '1px solid var(--border)' }}>
                  {copied ? <Check size={11} /> : <Copy size={11} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="flex items-start gap-2 mt-2 p-2.5 rounded-lg text-xs" style={{ backgroundColor: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
              <AlertTriangle size={11} className="shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
              <p style={{ color: 'var(--muted-foreground)' }}>Only send <strong style={{ color: 'var(--foreground)' }}>{asset}</strong> on the <strong style={{ color: 'var(--foreground)' }}>{chain}</strong> network. Sending the wrong asset or using the wrong network will result in permanent loss.</p>
            </div>
          </div>
        )}

        {/* Step 4: Amount + TX Hash */}
        {asset && chain && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>4. Amount Sent ({asset})</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder={`e.g. 0.05`}
                className="w-full px-3 py-2.5 rounded-xl border text-sm font-mono focus:outline-none focus:ring-1"
                style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>5. Transaction Hash (TX ID)</label>
              <div className="relative">
                <Hash size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
                <input
                  type="text"
                  value={txHash}
                  onChange={e => setTxHash(e.target.value)}
                  placeholder="0x..."
                  className="w-full pl-8 pr-3 py-2.5 rounded-xl border text-sm font-mono focus:outline-none focus:ring-1"
                  style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Paste the transaction hash from your wallet or exchange after sending.</p>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!asset || !chain || !txHash || submitting}
          className="w-full py-3 rounded-xl text-sm font-bold disabled:opacity-40 transition-all"
          style={{ backgroundColor: 'var(--primary)', color: '#000' }}
        >
          {submitting ? 'Submitting…' : 'Submit Deposit for Review'}
        </button>
      </div>
    </Modal>
  );
}

// ─── Bank Deposit Modal ───────────────────────────────────────────────────────

const BANK_CURRENCIES = ['USD', 'EUR', 'GBP', 'CHF', 'AUD', 'CAD'];

function BankDepositModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [currency, setCurrency] = useState('USD');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setCurrency('USD'); setAmount(''); setReference('');
    setSubmitted(false); setSubmitting(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
  };

  const bankDetails = [
    { label: 'Bank Name', value: 'International Trade Bank' },
    { label: 'Account Name', value: 'CryptoVault Ltd.' },
    { label: 'Account Number', value: '****-****-1234' },
    { label: 'SWIFT / BIC', value: 'ITBKUS33XXX' },
    { label: 'IBAN', value: 'GB29 NWBK 6016 1331 9268 19' },
    { label: 'Routing Number', value: '021000021' },
  ];

  if (submitted) {
    return (
      <Modal open={open} onClose={handleClose} title="Bank Deposit" subtitle="Wire transfer instructions" icon={<Landmark size={16} />} iconBg="rgba(59,130,246,0.12)" iconColor="#3b82f6">
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.3)' }}>
            <CheckCircle2 size={26} style={{ color: '#22c55e' }} />
          </div>
          <h3 className="text-base font-bold mb-1" style={{ color: 'var(--foreground)' }}>Bank Deposit Request Submitted</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>Your deposit request for {currency} {parseFloat(amount || '0').toFixed(2)} has been received.</p>
          <div className="flex items-start gap-2 p-3 rounded-xl text-xs mb-5 text-left" style={{ backgroundColor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <Clock size={12} className="shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
            <p style={{ color: 'var(--muted-foreground)' }}>Bank wire transfers typically take 1–3 business days. Your balance will be credited once the funds are received and verified.</p>
          </div>
          <button onClick={handleClose} className="w-full py-2.5 rounded-xl text-sm font-semibold" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>Done</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Bank Deposit" subtitle="Wire transfer to fund your account" icon={<Landmark size={16} />} iconBg="rgba(59,130,246,0.12)" iconColor="#3b82f6">
      <div className="space-y-5">
        {/* Currency */}
        <div>
          <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--muted-foreground)' }}>Select Currency</label>
          <div className="grid grid-cols-3 gap-2">
            {BANK_CURRENCIES.map(c => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className="py-2 rounded-xl border text-sm font-semibold transition-all"
                style={{
                  borderColor: currency === c ? '#3b82f6' : 'var(--border)',
                  backgroundColor: currency === c ? 'rgba(59,130,246,0.1)' : 'var(--muted)',
                  color: currency === c ? '#3b82f6' : 'var(--foreground)',
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Amount ({currency})</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2.5 rounded-xl border text-sm font-mono focus:outline-none"
            style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
        </div>

        {/* Bank Details */}
        <div>
          <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--muted-foreground)' }}>Bank Transfer Details</label>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            {bankDetails.map((row, i) => (
              <div key={i} className="flex items-center justify-between px-3 py-2.5 border-b last:border-b-0" style={{ borderColor: 'var(--border)', backgroundColor: i % 2 === 0 ? 'var(--muted)' : 'var(--card)' }}>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{row.label}</span>
                <span className="text-xs font-semibold font-mono" style={{ color: 'var(--foreground)' }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Reference */}
        <div>
          <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Payment Reference (optional)</label>
          <input
            type="text"
            value={reference}
            onChange={e => setReference(e.target.value)}
            placeholder="Your name or account ID"
            className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
            style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Include your name or account ID as the payment reference to speed up processing.</p>
        </div>

        <div className="flex items-start gap-2 p-3 rounded-xl text-xs" style={{ backgroundColor: 'rgba(212,168,0,0.06)', border: '1px solid rgba(212,168,0,0.2)' }}>
          <Info size={12} className="shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
          <p style={{ color: 'var(--muted-foreground)' }}>After sending the wire transfer, click below to notify us. We will credit your account once funds are received.</p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!amount || parseFloat(amount) <= 0 || submitting}
          className="w-full py-3 rounded-xl text-sm font-bold disabled:opacity-40 transition-all"
          style={{ backgroundColor: '#3b82f6', color: '#fff' }}
        >
          {submitting ? 'Submitting…' : 'Notify Us — I\'ve Sent the Transfer'}
        </button>
      </div>
    </Modal>
  );
}

// ─── Crypto Withdrawal Modal ──────────────────────────────────────────────────

function CryptoWithdrawalModal({ open, onClose, balance }: { open: boolean; onClose: () => void; balance: CustomerBalance | null }) {
  const [asset, setAsset] = useState('');
  const [chain, setChain] = useState('');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const chains = asset ? (CHAINS[asset] || []) : [];

  const handleClose = () => {
    setAsset(''); setChain(''); setAddress(''); setAmount('');
    setSubmitted(false); setSubmitting(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!asset || !chain || !address || !amount) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Modal open={open} onClose={handleClose} title="Crypto Withdrawal" subtitle="Withdraw to your wallet" icon={<ArrowUpRight size={16} />} iconBg="rgba(239,68,68,0.12)" iconColor="#ef4444">
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.3)' }}>
            <CheckCircle2 size={26} style={{ color: '#22c55e' }} />
          </div>
          <h3 className="text-base font-bold mb-1" style={{ color: 'var(--foreground)' }}>Withdrawal Request Submitted</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>Your {asset} withdrawal on {chain} is pending review.</p>
          <div className="rounded-xl p-3 text-xs text-left mb-5 space-y-1.5" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
            <div className="flex justify-between"><span style={{ color: 'var(--muted-foreground)' }}>Asset</span><span className="font-semibold" style={{ color: 'var(--foreground)' }}>{asset}</span></div>
            <div className="flex justify-between"><span style={{ color: 'var(--muted-foreground)' }}>Network</span><span className="font-semibold" style={{ color: 'var(--foreground)' }}>{chain}</span></div>
            <div className="flex justify-between"><span style={{ color: 'var(--muted-foreground)' }}>Amount</span><span className="font-semibold" style={{ color: 'var(--foreground)' }}>{amount} {asset}</span></div>
            <div className="flex justify-between gap-2"><span className="shrink-0" style={{ color: 'var(--muted-foreground)' }}>Address</span><span className="font-mono text-xs truncate" style={{ color: 'var(--foreground)' }}>{address}</span></div>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-xl text-xs mb-5 text-left" style={{ backgroundColor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <Shield size={12} className="shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
            <p style={{ color: 'var(--muted-foreground)' }}>Withdrawals are reviewed by our team before processing. You will be notified once approved.</p>
          </div>
          <button onClick={handleClose} className="w-full py-2.5 rounded-xl text-sm font-semibold" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>Done</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Crypto Withdrawal" subtitle="Withdraw to your external wallet" icon={<ArrowUpRight size={16} />} iconBg="rgba(239,68,68,0.12)" iconColor="#ef4444">
      <div className="space-y-5">
        {/* Balance */}
        {balance && (
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Available Balance</span>
            <span className="text-sm font-bold font-mono" style={{ color: '#22c55e' }}>{balance.currency} {balance.availableBalance.toFixed(2)}</span>
          </div>
        )}

        {/* Asset */}
        <div>
          <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--muted-foreground)' }}>1. Select Crypto Asset</label>
          <div className="grid grid-cols-4 gap-2">
            {CRYPTO_ASSETS.map(a => (
              <button
                key={a.symbol}
                onClick={() => { setAsset(a.symbol); setChain(''); }}
                className="flex flex-col items-center gap-1 py-2.5 px-1 rounded-xl border transition-all"
                style={{
                  borderColor: asset === a.symbol ? a.color : 'var(--border)',
                  backgroundColor: asset === a.symbol ? `${a.color}14` : 'var(--muted)',
                }}
              >
                <span className="text-xs font-bold" style={{ color: asset === a.symbol ? a.color : 'var(--foreground)' }}>{a.symbol}</span>
                <span className="text-xs leading-tight text-center" style={{ color: 'var(--muted-foreground)', fontSize: 9 }}>{a.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Chain */}
        {asset && (
          <div>
            <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--muted-foreground)' }}>2. Select Network / Chain</label>
            <div className="space-y-1.5">
              {chains.map(c => (
                <button
                  key={c}
                  onClick={() => setChain(c)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-sm transition-all"
                  style={{
                    borderColor: chain === c ? '#ef4444' : 'var(--border)',
                    backgroundColor: chain === c ? 'rgba(239,68,68,0.07)' : 'var(--muted)',
                    color: chain === c ? '#ef4444' : 'var(--foreground)',
                  }}
                >
                  <span className="font-medium text-xs">{c}</span>
                  {chain === c && <Check size={13} style={{ color: '#ef4444' }} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Address + Amount */}
        {asset && chain && (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>3. Destination Wallet Address</label>
              <input
                type="text"
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="0x... or wallet address"
                className="w-full px-3 py-2.5 rounded-xl border text-sm font-mono focus:outline-none"
                style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>4. Amount ({asset})</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2.5 rounded-xl border text-sm font-mono focus:outline-none"
                style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>
          </div>
        )}

        <div className="flex items-start gap-2 p-3 rounded-xl text-xs" style={{ backgroundColor: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
          <AlertTriangle size={12} className="shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
          <p style={{ color: 'var(--muted-foreground)' }}>Double-check the destination address and network. Crypto transactions are irreversible. Wrong address = permanent loss.</p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!asset || !chain || !address || !amount || submitting}
          className="w-full py-3 rounded-xl text-sm font-bold disabled:opacity-40 transition-all"
          style={{ backgroundColor: '#ef4444', color: '#fff' }}
        >
          {submitting ? 'Submitting…' : 'Submit Withdrawal Request'}
        </button>
      </div>
    </Modal>
  );
}

// ─── Bank Withdrawal Modal ────────────────────────────────────────────────────

function BankWithdrawalModal({ open, onClose, balance }: { open: boolean; onClose: () => void; balance: CustomerBalance | null }) {
  const [currency, setCurrency] = useState('USD');
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [swift, setSwift] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setCurrency('USD'); setAmount(''); setBankName(''); setAccountName('');
    setAccountNumber(''); setSwift('');
    setSubmitted(false); setSubmitting(false);
    onClose();
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0 || !bankName || !accountNumber) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <Modal open={open} onClose={handleClose} title="Bank Withdrawal" subtitle="Withdraw to your bank account" icon={<Building2 size={16} />} iconBg="rgba(139,92,246,0.12)" iconColor="#8b5cf6">
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(34,197,94,0.12)', border: '2px solid rgba(34,197,94,0.3)' }}>
            <CheckCircle2 size={26} style={{ color: '#22c55e' }} />
          </div>
          <h3 className="text-base font-bold mb-1" style={{ color: 'var(--foreground)' }}>Bank Withdrawal Submitted</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>Your withdrawal of {currency} {parseFloat(amount || '0').toFixed(2)} is pending review.</p>
          <div className="flex items-start gap-2 p-3 rounded-xl text-xs mb-5 text-left" style={{ backgroundColor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <Clock size={12} className="shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
            <p style={{ color: 'var(--muted-foreground)' }}>Bank withdrawals are reviewed within 1 business day. Funds typically arrive within 2–5 business days after approval.</p>
          </div>
          <button onClick={handleClose} className="w-full py-2.5 rounded-xl text-sm font-semibold" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>Done</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal open={open} onClose={handleClose} title="Bank Withdrawal" subtitle="Withdraw funds to your bank account" icon={<Building2 size={16} />} iconBg="rgba(139,92,246,0.12)" iconColor="#8b5cf6">
      <div className="space-y-4">
        {/* Balance */}
        {balance && (
          <div className="flex items-center justify-between px-3 py-2.5 rounded-xl" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Available Balance</span>
            <span className="text-sm font-bold font-mono" style={{ color: '#22c55e' }}>{balance.currency} {balance.availableBalance.toFixed(2)}</span>
          </div>
        )}

        {/* Currency */}
        <div>
          <label className="text-xs font-semibold mb-2 block" style={{ color: 'var(--muted-foreground)' }}>Currency</label>
          <div className="grid grid-cols-3 gap-2">
            {BANK_CURRENCIES.map(c => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className="py-2 rounded-xl border text-sm font-semibold transition-all"
                style={{
                  borderColor: currency === c ? '#8b5cf6' : 'var(--border)',
                  backgroundColor: currency === c ? 'rgba(139,92,246,0.1)' : 'var(--muted)',
                  color: currency === c ? '#8b5cf6' : 'var(--foreground)',
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs font-semibold mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Amount ({currency})</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2.5 rounded-xl border text-sm font-mono focus:outline-none"
            style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
        </div>

        {/* Bank Details */}
        <div className="space-y-3">
          <label className="text-xs font-semibold block" style={{ color: 'var(--muted-foreground)' }}>Your Bank Details</label>
          <input
            type="text"
            value={bankName}
            onChange={e => setBankName(e.target.value)}
            placeholder="Bank Name"
            className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
            style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
          <input
            type="text"
            value={accountName}
            onChange={e => setAccountName(e.target.value)}
            placeholder="Account Holder Name"
            className="w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none"
            style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
          <input
            type="text"
            value={accountNumber}
            onChange={e => setAccountNumber(e.target.value)}
            placeholder="Account Number / IBAN"
            className="w-full px-3 py-2.5 rounded-xl border text-sm font-mono focus:outline-none"
            style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
          <input
            type="text"
            value={swift}
            onChange={e => setSwift(e.target.value)}
            placeholder="SWIFT / BIC Code"
            className="w-full px-3 py-2.5 rounded-xl border text-sm font-mono focus:outline-none"
            style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
        </div>

        <div className="flex items-start gap-2 p-3 rounded-xl text-xs" style={{ backgroundColor: 'rgba(212,168,0,0.06)', border: '1px solid rgba(212,168,0,0.2)' }}>
          <Shield size={12} className="shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
          <p style={{ color: 'var(--muted-foreground)' }}>All withdrawal requests are reviewed by our compliance team before processing. Ensure your bank details are correct.</p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!amount || parseFloat(amount) <= 0 || !bankName || !accountNumber || submitting}
          className="w-full py-3 rounded-xl text-sm font-bold disabled:opacity-40 transition-all"
          style={{ backgroundColor: '#8b5cf6', color: '#fff' }}
        >
          {submitting ? 'Submitting…' : 'Submit Bank Withdrawal'}
        </button>
      </div>
    </Modal>
  );
}

// ─── History panel ────────────────────────────────────────────────────────────

function HistoryPanel({ history }: { history: FundsHistoryEntry[] }) {
  return (
    <div className="rounded-xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>Transaction History</h3>
      </div>
      {history.length === 0 ? (
        <div className="py-12 text-center">
          <History size={24} className="mx-auto mb-2" style={{ color: 'var(--muted-foreground)', opacity: 0.4 }} />
          <p className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>No transaction history</p>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Transaction history will appear here once backend integration is connected.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ backgroundColor: 'var(--muted)' }}>
                {['Date', 'Type', 'Asset', 'Amount', 'Fee', 'Status', 'Reference'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-semibold uppercase tracking-wide" style={{ color: 'var(--muted-foreground)', fontSize: '10px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {history.map(entry => (
                <tr key={entry.id} className="border-t hover:bg-muted transition-colors" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-4 py-2.5 tabular-nums" style={{ color: 'var(--muted-foreground)' }}>{entry.createdAt}</td>
                  <td className="px-4 py-2.5 capitalize font-medium" style={{ color: 'var(--foreground)' }}>{entry.type}</td>
                  <td className="px-4 py-2.5 font-semibold" style={{ color: 'var(--foreground)' }}>{entry.asset}</td>
                  <td className="px-4 py-2.5 tabular-nums font-mono" style={{ color: entry.type === 'deposit' ? '#22c55e' : '#ef4444' }}>
                    {entry.type === 'deposit' ? '+' : '-'}{entry.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-2.5 tabular-nums font-mono" style={{ color: 'var(--muted-foreground)' }}>{entry.fee.toFixed(2)}</td>
                  <td className="px-4 py-2.5"><StatusBadge status={entry.status} /></td>
                  <td className="px-4 py-2.5 font-mono text-xs" style={{ color: 'var(--muted-foreground)' }}>{entry.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function FinancePageInner() {
  const [balance, setBalance] = useState<CustomerBalance | null>(null);
  const [history, setHistory] = useState<FundsHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [cryptoDepositOpen, setCryptoDepositOpen] = useState(false);
  const [bankDepositOpen, setBankDepositOpen] = useState(false);
  const [cryptoWithdrawOpen, setCryptoWithdrawOpen] = useState(false);
  const [bankWithdrawOpen, setBankWithdrawOpen] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const [bal, hist] = await Promise.all([
        fundsService.getBalance(),
        fundsService.getHistory(),
      ]);
      setBalance(bal);
      setHistory(hist);
      setLoading(false);
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="py-4 space-y-4">
          <div className="h-8 w-48 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--muted)' }} />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 rounded-xl border animate-pulse" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} />)}
          </div>
        </div>
      </AppLayout>
    );
  }

  const kpiCards = [
    {
      label: 'Total Balance',
      value: balance ? `$${balance.totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—',
      icon: <DollarSign size={18} />,
      iconBg: 'rgba(212,168,0,0.12)',
      iconColor: 'var(--primary)',
      sub: 'All accounts',
    },
    {
      label: 'Available Balance',
      value: balance ? `$${balance.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—',
      icon: <Activity size={18} />,
      iconBg: 'rgba(34,197,94,0.1)',
      iconColor: '#22c55e',
      sub: 'Ready for trading',
    },
    {
      label: 'Pending',
      value: balance ? `$${balance.pendingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—',
      icon: <Clock size={18} />,
      iconBg: 'rgba(245,158,11,0.1)',
      iconColor: '#f59e0b',
      sub: 'In progress',
    },
    {
      label: 'Currency',
      value: balance?.currency ?? 'USD',
      icon: <TrendingUp size={18} />,
      iconBg: 'rgba(59,130,246,0.1)',
      iconColor: '#3b82f6',
      sub: 'Account currency',
    },
  ];

  return (
    <AppLayout>
      <div className="py-5 w-full">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--foreground)' }}>Balance &amp; Funds</h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            Manage your account balance, deposit or withdraw funds, and view your transaction history.
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {kpiCards.map((card, i) => (
            <div key={i} className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: card.iconBg, color: card.iconColor }}>
                  {card.icon}
                </div>
              </div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--muted-foreground)' }}>{card.label}</p>
              <p className="text-xl font-bold tabular-nums font-mono mb-1" style={{ color: 'var(--foreground)' }}>{card.value}</p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{card.sub}</p>
            </div>
          ))}
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Deposit Card */}
          <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <ArrowDownLeft size={15} style={{ color: '#22c55e' }} />
              </div>
              <div>
                <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Deposit Funds</h2>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Add funds to your trading account</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCryptoDepositOpen(true)}
                className="flex flex-col items-start gap-2 p-4 rounded-xl border transition-all hover:border-yellow-400/40 hover:opacity-90"
                style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(212,168,0,0.12)', border: '1px solid rgba(212,168,0,0.25)' }}>
                  <Wallet size={14} style={{ color: 'var(--primary)' }} />
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>Crypto Deposit</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>BTC, ETH, USDT, USDC &amp; more</p>
                </div>
              </button>
              <button
                onClick={() => setBankDepositOpen(true)}
                className="flex flex-col items-start gap-2 p-4 rounded-xl border transition-all hover:border-blue-400/40 hover:opacity-90"
                style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
                  <Landmark size={14} style={{ color: '#3b82f6' }} />
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>Bank Deposit</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>USD, EUR, GBP wire transfer</p>
                </div>
              </button>
            </div>
          </div>

          {/* Withdrawal Card */}
          <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <ArrowUpRight size={15} style={{ color: '#ef4444' }} />
              </div>
              <div>
                <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Withdraw Funds</h2>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Transfer funds out of your account</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setCryptoWithdrawOpen(true)}
                className="flex flex-col items-start gap-2 p-4 rounded-xl border transition-all hover:border-red-400/40 hover:opacity-90"
                style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
                  <Wallet size={14} style={{ color: '#ef4444' }} />
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>Crypto Withdrawal</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Withdraw to your wallet</p>
                </div>
              </button>
              <button
                onClick={() => setBankWithdrawOpen(true)}
                className="flex flex-col items-start gap-2 p-4 rounded-xl border transition-all hover:border-purple-400/40 hover:opacity-90"
                style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <Building2 size={14} style={{ color: '#8b5cf6' }} />
                </div>
                <div>
                  <p className="text-xs font-bold" style={{ color: 'var(--foreground)' }}>Bank Withdrawal</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Wire to your bank account</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="mb-4">
          <h2 className="text-base font-bold mb-1" style={{ color: 'var(--foreground)' }}>Transaction History</h2>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Your deposits, withdrawals, and other funding activity.</p>
        </div>
        <HistoryPanel history={history} />
      </div>

      {/* Modals */}
      <CryptoDepositModal open={cryptoDepositOpen} onClose={() => setCryptoDepositOpen(false)} />
      <BankDepositModal open={bankDepositOpen} onClose={() => setBankDepositOpen(false)} />
      <CryptoWithdrawalModal open={cryptoWithdrawOpen} onClose={() => setCryptoWithdrawOpen(false)} balance={balance} />
      <BankWithdrawalModal open={bankWithdrawOpen} onClose={() => setBankWithdrawOpen(false)} balance={balance} />
    </AppLayout>
  );
}

export default function FinancePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen" style={{ backgroundColor: 'var(--background)' }}><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>}>
      <FinancePageInner />
    </Suspense>
  );
}
