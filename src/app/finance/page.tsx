'use client';
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { fundsService, CustomerBalance, FundsHistoryEntry, FundsHistoryStatus } from '@/services/funds.service';
import { depositService, DepositMethodConfig } from '@/services/deposit.service';
import { withdrawalService, WithdrawalDestination } from '@/services/withdrawal.service';
import { transferService } from '@/services/transfer.service';
import { Wallet, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, History, LayoutDashboard, Info, AlertTriangle, Check, ChevronRight, RefreshCw, Shield, Clock } from 'lucide-react';

type FundsTab = 'overview' | 'deposit' | 'withdraw' | 'transfer' | 'history';

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

// ─── Balance summary ──────────────────────────────────────────────────────────

function BalanceSummary({ balance }: { balance: CustomerBalance }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
      {[
        { label: 'Total Balance', value: balance.totalBalance, color: 'var(--foreground)', primary: true },
        { label: 'Available', value: balance.availableBalance, color: '#22c55e', primary: false },
        { label: 'Reserved / Locked', value: balance.reservedBalance, color: '#f59e0b', primary: false },
        { label: 'Pending', value: balance.pendingBalance, color: '#6b7280', primary: false },
      ].map((item, i) => (
        <div
          key={i}
          className="rounded border p-3"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: item.primary ? 'rgba(212,168,0,0.3)' : 'var(--border)',
          }}
        >
          <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>{item.label}</p>
          <p className="text-base font-bold tabular-nums font-mono" style={{ color: item.color }}>
            {balance.currency} {item.value.toFixed(2)}
          </p>
        </div>
      ))}
    </div>
  );
}

// ─── Deposit flow ─────────────────────────────────────────────────────────────

type DepositStep = 'method' | 'currency' | 'amount' | 'instructions' | 'review' | 'submitted';

function DepositPanel({ methods }: { methods: DepositMethodConfig[] }) {
  const [step, setStep] = useState<DepositStep>('method');
  const [selectedMethod, setSelectedMethod] = useState<DepositMethodConfig | null>(null);
  const [currency, setCurrency] = useState('USD');
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [depositId, setDepositId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedMethod) return;
    setSubmitting(true);
    const result = await depositService.submitDeposit({
      methodId: selectedMethod.id,
      currency,
      amount: parseFloat(amount),
    });
    setSubmitting(false);
    if (result.success) {
      setDepositId(result.depositId ?? null);
      setStep('submitted');
    }
  };

  const reset = () => {
    setStep('method');
    setSelectedMethod(null);
    setCurrency('USD');
    setAmount('');
    setDepositId(null);
  };

  if (step === 'submitted') {
    return (
      <div className="rounded border p-8 text-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <Check size={20} style={{ color: '#22c55e' }} />
        </div>
        <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>Deposit Request Submitted</h3>
        <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Your deposit request has been submitted and is being processed.</p>
        {depositId && <p className="text-xs font-mono mb-4" style={{ color: 'var(--muted-foreground)' }}>Reference: {depositId}</p>}
        <div className="flex items-start gap-2 p-3 rounded text-xs mb-4 text-left" style={{ backgroundColor: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <Info size={12} className="shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
          <p style={{ color: 'var(--muted-foreground)' }}>
            Balance updates only after backend confirms and processes the deposit. Processing time depends on the selected method.
          </p>
        </div>
        <button onClick={reset} className="px-4 py-2 rounded text-sm font-semibold" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
          New Deposit
        </button>
      </div>
    );
  }

  // Step indicator
  const STEPS: { id: DepositStep; label: string }[] = [
    { id: 'method', label: 'Method' },
    { id: 'currency', label: 'Currency' },
    { id: 'amount', label: 'Amount' },
    { id: 'instructions', label: 'Instructions' },
    { id: 'review', label: 'Review' },
  ];
  const stepIndex = STEPS.findIndex(s => s.id === step);

  return (
    <div className="space-y-4">
      {/* Step progress */}
      <div className="flex items-center gap-0 overflow-x-auto no-scrollbar">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: i <= stepIndex ? 'var(--primary)' : 'var(--muted)',
                  color: i <= stepIndex ? '#000' : 'var(--muted-foreground)',
                }}
              >
                {i < stepIndex ? <Check size={10} /> : i + 1}
              </div>
              <span className="text-xs font-medium whitespace-nowrap" style={{ color: i === stepIndex ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-px mx-2 shrink-0 min-w-[12px]" style={{ backgroundColor: i < stepIndex ? 'var(--primary)' : 'var(--border)' }} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Method */}
      {step === 'method' && (
        <div className="rounded border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--foreground)' }}>Choose Deposit Method</h3>
          {methods.length === 0 ? (
            <div className="py-8 text-center">
              <Wallet size={24} className="mx-auto mb-2" style={{ color: 'var(--muted-foreground)', opacity: 0.4 }} />
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>No deposit methods configured</p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Available deposit methods are configured by the platform. Contact support if you need to make a deposit.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {methods.map(method => (
                <button
                  key={method.id}
                  onClick={() => { setSelectedMethod(method); setStep('currency'); }}
                  className="text-left p-4 rounded border transition-all hover:border-primary/40 group"
                  style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}
                >
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{method.label}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{method.description}</p>
                  {method.processingTime && (
                    <p className="text-xs mt-2 flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
                      <Clock size={10} /> {method.processingTime}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Currency */}
      {step === 'currency' && selectedMethod && (
        <div className="rounded border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--foreground)' }}>Select Currency</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
            {(selectedMethod.currencies.length > 0 ? selectedMethod.currencies : ['USD', 'EUR', 'GBP']).map(c => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className="py-2 rounded border text-sm font-semibold transition-all"
                style={{
                  borderColor: currency === c ? 'var(--primary)' : 'var(--border)',
                  backgroundColor: currency === c ? 'rgba(212,168,0,0.08)' : 'var(--muted)',
                  color: currency === c ? 'var(--primary)' : 'var(--foreground)',
                }}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep('method')} className="flex-1 py-2 rounded text-sm font-medium border" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>Back</button>
            <button onClick={() => setStep('amount')} className="flex-1 py-2 rounded text-sm font-semibold" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>Continue</button>
          </div>
        </div>
      )}

      {/* Step 3: Amount */}
      {step === 'amount' && selectedMethod && (
        <div className="rounded border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--foreground)' }}>Enter Amount</h3>
          <div className="mb-4">
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Amount ({currency})</label>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-3 py-2.5 rounded border text-sm font-mono focus:outline-none focus:ring-1"
              style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
            <div className="flex gap-4 mt-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {selectedMethod.minimumAmount !== null && <span>Min: {currency} {selectedMethod.minimumAmount}</span>}
              {selectedMethod.maximumAmount !== null && <span>Max: {currency} {selectedMethod.maximumAmount}</span>}
              {selectedMethod.feeDescription && <span>Fee: {selectedMethod.feeDescription}</span>}
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 rounded text-xs mb-4" style={{ backgroundColor: 'rgba(212,168,0,0.05)', border: '1px solid rgba(212,168,0,0.15)' }}>
            <Info size={12} className="shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
            <p style={{ color: 'var(--muted-foreground)' }}>Minimum, maximum, and fee values are backend-configured and may change. Estimated credit time depends on the deposit method.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep('currency')} className="flex-1 py-2 rounded text-sm font-medium border" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>Back</button>
            <button onClick={() => setStep('instructions')} disabled={!amount || parseFloat(amount) <= 0} className="flex-1 py-2 rounded text-sm font-semibold disabled:opacity-50" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>Continue</button>
          </div>
        </div>
      )}

      {/* Step 4: Instructions */}
      {step === 'instructions' && selectedMethod && (
        <div className="rounded border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--foreground)' }}>Deposit Instructions</h3>
          <div className="p-4 rounded text-xs mb-4" style={{ backgroundColor: 'var(--muted)', border: '1px solid var(--border)' }}>
            <p className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Instructions will be provided by the backend</p>
            <p style={{ color: 'var(--muted-foreground)' }}>
              Deposit instructions (bank details, crypto address, or payment link) are generated by the backend when a deposit request is confirmed.
              They will appear here once the backend integration is connected.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep('amount')} className="flex-1 py-2 rounded text-sm font-medium border" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>Back</button>
            <button onClick={() => setStep('review')} className="flex-1 py-2 rounded text-sm font-semibold" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>Review</button>
          </div>
        </div>
      )}

      {/* Step 5: Review */}
      {step === 'review' && selectedMethod && (
        <div className="rounded border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--foreground)' }}>Review Deposit</h3>
          <div className="space-y-0 mb-4">
            {[
              { label: 'Method', value: selectedMethod.label },
              { label: 'Currency', value: currency },
              { label: 'Amount', value: `${currency} ${parseFloat(amount).toFixed(2)}` },
              { label: 'Fee', value: selectedMethod.feeDescription ?? 'Backend-configured' },
              { label: 'Processing Time', value: selectedMethod.processingTime ?? 'Backend-configured' },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{row.label}</span>
                <span className="text-xs font-semibold tabular-nums" style={{ color: 'var(--foreground)' }}>{row.value}</span>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-2 p-3 rounded text-xs mb-4" style={{ backgroundColor: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <AlertTriangle size={12} className="shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
            <p style={{ color: 'var(--muted-foreground)' }}>
              By submitting, you confirm the deposit details are correct. Balance will only be credited after backend processing is complete.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep('instructions')} className="flex-1 py-2 rounded text-sm font-medium border" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>Back</button>
            <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-2 rounded text-sm font-semibold disabled:opacity-60" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
              {submitting ? 'Submitting…' : 'Submit Deposit'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Withdrawal flow ──────────────────────────────────────────────────────────

type WithdrawStep = 'asset' | 'destination' | 'amount' | 'fee' | 'security' | 'review' | 'submitted';

function WithdrawPanel({ balance, destinations }: { balance: CustomerBalance; destinations: WithdrawalDestination[] }) {
  const [step, setStep] = useState<WithdrawStep>('asset');
  const [currency, setCurrency] = useState('USD');
  const [selectedDest, setSelectedDest] = useState<WithdrawalDestination | null>(null);
  const [amount, setAmount] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [withdrawalId, setWithdrawalId] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!selectedDest) return;
    setSubmitting(true);
    const result = await withdrawalService.submitWithdrawal({
      currency,
      amount: parseFloat(amount),
      destinationId: selectedDest.id,
      securityCode: securityCode || undefined,
    });
    setSubmitting(false);
    if (result.success) {
      setWithdrawalId(result.withdrawalId ?? null);
      setStep('submitted');
    }
  };

  const reset = () => {
    setStep('asset');
    setCurrency('USD');
    setSelectedDest(null);
    setAmount('');
    setSecurityCode('');
    setWithdrawalId(null);
  };

  if (step === 'submitted') {
    return (
      <div className="rounded border p-8 text-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <Check size={20} style={{ color: '#22c55e' }} />
        </div>
        <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>Withdrawal Request Submitted</h3>
        <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Your withdrawal request is pending review.</p>
        {withdrawalId && <p className="text-xs font-mono mb-4" style={{ color: 'var(--muted-foreground)' }}>Reference: {withdrawalId}</p>}
        <div className="flex items-start gap-2 p-3 rounded text-xs mb-4 text-left" style={{ backgroundColor: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.15)' }}>
          <Info size={12} className="shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
          <p style={{ color: 'var(--muted-foreground)' }}>
            Balance is updated only after backend approval and processing. Frontend approval does not authorize a withdrawal.
          </p>
        </div>
        <button onClick={reset} className="px-4 py-2 rounded text-sm font-semibold" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
          New Withdrawal
        </button>
      </div>
    );
  }

  const STEPS: { id: WithdrawStep; label: string }[] = [
    { id: 'asset', label: 'Asset' },
    { id: 'destination', label: 'Destination' },
    { id: 'amount', label: 'Amount' },
    { id: 'fee', label: 'Fee' },
    { id: 'security', label: 'Security' },
    { id: 'review', label: 'Review' },
  ];
  const stepIndex = STEPS.findIndex(s => s.id === step);

  return (
    <div className="space-y-4">
      {/* Step progress */}
      <div className="flex items-center gap-0 overflow-x-auto no-scrollbar">
        {STEPS.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className="flex items-center gap-1 shrink-0">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: i <= stepIndex ? 'var(--primary)' : 'var(--muted)', color: i <= stepIndex ? '#000' : 'var(--muted-foreground)' }}>
                {i < stepIndex ? <Check size={10} /> : i + 1}
              </div>
              <span className="text-xs font-medium whitespace-nowrap" style={{ color: i === stepIndex ? 'var(--foreground)' : 'var(--muted-foreground)' }}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className="flex-1 h-px mx-1.5 shrink-0 min-w-[8px]" style={{ backgroundColor: i < stepIndex ? 'var(--primary)' : 'var(--border)' }} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step 1: Asset */}
      {step === 'asset' && (
        <div className="rounded border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--foreground)' }}>Choose Asset / Currency</h3>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-4">
            {['USD', 'EUR', 'GBP', 'BTC', 'ETH', 'USDC'].map(c => (
              <button key={c} onClick={() => setCurrency(c)} className="py-2 rounded border text-sm font-semibold transition-all" style={{ borderColor: currency === c ? 'var(--primary)' : 'var(--border)', backgroundColor: currency === c ? 'rgba(212,168,0,0.08)' : 'var(--muted)', color: currency === c ? 'var(--primary)' : 'var(--foreground)' }}>{c}</button>
            ))}
          </div>
          <div className="p-3 rounded text-xs mb-4" style={{ backgroundColor: 'var(--muted)' }}>
            <span style={{ color: 'var(--muted-foreground)' }}>Available Balance: </span>
            <span className="font-bold tabular-nums font-mono" style={{ color: '#22c55e' }}>{balance.currency} {balance.availableBalance.toFixed(2)}</span>
          </div>
          <button onClick={() => setStep('destination')} className="w-full py-2 rounded text-sm font-semibold" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>Continue</button>
        </div>
      )}

      {/* Step 2: Destination */}
      {step === 'destination' && (
        <div className="rounded border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--foreground)' }}>Choose Destination</h3>
          {destinations.length === 0 ? (
            <div className="py-6 text-center mb-4">
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--foreground)' }}>No saved destinations</p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Withdrawal destinations are configured and verified by the backend. Contact support to add a destination.</p>
            </div>
          ) : (
            <div className="space-y-2 mb-4">
              {destinations.map(dest => (
                <button key={dest.id} onClick={() => setSelectedDest(dest)} className="w-full text-left p-3 rounded border transition-all" style={{ borderColor: selectedDest?.id === dest.id ? 'var(--primary)' : 'var(--border)', backgroundColor: 'var(--muted)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{dest.label}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{dest.details}</p>
                  {dest.verified && <span className="text-xs" style={{ color: '#22c55e' }}>✓ Verified</span>}
                </button>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={() => setStep('asset')} className="flex-1 py-2 rounded text-sm font-medium border" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>Back</button>
            <button onClick={() => setStep('amount')} disabled={destinations.length > 0 && !selectedDest} className="flex-1 py-2 rounded text-sm font-semibold disabled:opacity-50" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>Continue</button>
          </div>
        </div>
      )}

      {/* Step 3: Amount */}
      {step === 'amount' && (
        <div className="rounded border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--foreground)' }}>Enter Amount</h3>
          <div className="mb-4">
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Amount ({currency})</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full px-3 py-2.5 rounded border text-sm font-mono focus:outline-none" style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
            <p className="text-xs mt-1.5" style={{ color: 'var(--muted-foreground)' }}>Available: {balance.currency} {balance.availableBalance.toFixed(2)}</p>
          </div>
          <div className="flex items-start gap-2 p-3 rounded text-xs mb-4" style={{ backgroundColor: 'rgba(212,168,0,0.05)', border: '1px solid rgba(212,168,0,0.15)' }}>
            <Info size={12} className="shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
            <p style={{ color: 'var(--muted-foreground)' }}>Minimum, maximum, and daily limits are enforced by the backend. Frontend validation is indicative only.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep('destination')} className="flex-1 py-2 rounded text-sm font-medium border" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>Back</button>
            <button onClick={() => setStep('fee')} disabled={!amount || parseFloat(amount) <= 0} className="flex-1 py-2 rounded text-sm font-semibold disabled:opacity-50" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>Continue</button>
          </div>
        </div>
      )}

      {/* Step 4: Fee */}
      {step === 'fee' && (
        <div className="rounded border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--foreground)' }}>Fee &amp; Net Amount</h3>
          <div className="space-y-0 mb-4">
            {[
              { label: 'Requested Amount', value: `${currency} ${parseFloat(amount).toFixed(2)}` },
              { label: 'Fee', value: 'Backend-configured' },
              { label: 'Net Withdrawal', value: 'Calculated by backend' },
              { label: 'Expected Processing', value: 'Backend-configured' },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{row.label}</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{row.value}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep('amount')} className="flex-1 py-2 rounded text-sm font-medium border" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>Back</button>
            <button onClick={() => setStep('security')} className="flex-1 py-2 rounded text-sm font-semibold" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>Continue</button>
          </div>
        </div>
      )}

      {/* Step 5: Security */}
      {step === 'security' && (
        <div className="rounded border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-bold mb-3" style={{ color: 'var(--foreground)' }}>Security Verification</h3>
          <div className="flex items-start gap-3 p-3 rounded mb-4" style={{ backgroundColor: 'rgba(212,168,0,0.05)', border: '1px solid rgba(212,168,0,0.15)' }}>
            <Shield size={14} className="shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Security verification (2FA code or OTP) will be required by the backend for withdrawal requests. Enter your code below if prompted.</p>
          </div>
          <div className="mb-4">
            <label className="text-xs mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Security Code (if required)</label>
            <input type="text" value={securityCode} onChange={e => setSecurityCode(e.target.value)} placeholder="Enter 2FA / OTP code" className="w-full px-3 py-2 rounded border text-sm focus:outline-none" style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep('fee')} className="flex-1 py-2 rounded text-sm font-medium border" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>Back</button>
            <button onClick={() => setStep('review')} className="flex-1 py-2 rounded text-sm font-semibold" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>Review</button>
          </div>
        </div>
      )}

      {/* Step 6: Review */}
      {step === 'review' && (
        <div className="rounded border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <h3 className="text-sm font-bold mb-4" style={{ color: 'var(--foreground)' }}>Review Withdrawal</h3>
          <div className="space-y-0 mb-4">
            {[
              { label: 'Asset', value: currency },
              { label: 'Amount', value: `${currency} ${parseFloat(amount).toFixed(2)}` },
              { label: 'Destination', value: selectedDest?.label ?? 'Not selected' },
              { label: 'Destination Details', value: selectedDest?.details ?? '—' },
              { label: 'Fee', value: 'Backend-configured' },
              { label: 'Net Amount', value: 'Calculated by backend' },
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{row.label}</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{row.value}</span>
              </div>
            ))}
          </div>
          <div className="flex items-start gap-2 p-3 rounded text-xs mb-4" style={{ backgroundColor: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <AlertTriangle size={12} className="shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
            <p style={{ color: 'var(--muted-foreground)' }}>
              Withdrawal requests are subject to backend review and approval. Frontend submission does not guarantee approval.
              Balance is only debited after backend authorization.
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setStep('security')} className="flex-1 py-2 rounded text-sm font-medium border" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>Back</button>
            <button onClick={handleSubmit} disabled={submitting} className="flex-1 py-2 rounded text-sm font-semibold disabled:opacity-60" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
              {submitting ? 'Submitting…' : 'Submit Withdrawal'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Transfer panel ───────────────────────────────────────────────────────────

function TransferPanel({ balance }: { balance: CustomerBalance }) {
  const [currency, setCurrency] = useState('USD');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [transferId, setTransferId] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    const result = await transferService.submitTransfer({
      type: 'internal_account',
      currency,
      amount: parseFloat(amount),
      note: note || undefined,
    });
    setSubmitting(false);
    if (result.success) {
      setTransferId(result.transferId ?? null);
      setSubmitted(true);
    }
  };

  if (submitted) {
    return (
      <div className="rounded border p-8 text-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <Check size={20} style={{ color: '#22c55e' }} />
        </div>
        <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>Transfer Request Submitted</h3>
        {transferId && <p className="text-xs font-mono mb-4" style={{ color: 'var(--muted-foreground)' }}>Reference: {transferId}</p>}
        <button onClick={() => { setSubmitted(false); setAmount(''); setNote(''); }} className="px-4 py-2 rounded text-sm font-semibold" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>New Transfer</button>
      </div>
    );
  }

  return (
    <div className="rounded border p-5 space-y-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <div>
        <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>Transfer</h3>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Transfer is distinct from withdrawal. Backend determines allowed destination types and transfer rules.</p>
      </div>

      <div className="flex items-start gap-2 p-3 rounded text-xs" style={{ backgroundColor: 'rgba(212,168,0,0.05)', border: '1px solid rgba(212,168,0,0.15)' }}>
        <Info size={12} className="shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
        <p style={{ color: 'var(--muted-foreground)' }}>
          Available transfer types (internal account, wallet-to-wallet, customer transfer) are determined by backend configuration.
          Balance is only affected after backend processing.
        </p>
      </div>

      <div>
        <label className="text-xs mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Currency</label>
        <div className="grid grid-cols-4 gap-2">
          {['USD', 'EUR', 'BTC', 'ETH'].map(c => (
            <button key={c} onClick={() => setCurrency(c)} className="py-2 rounded border text-sm font-semibold transition-all" style={{ borderColor: currency === c ? 'var(--primary)' : 'var(--border)', backgroundColor: currency === c ? 'rgba(212,168,0,0.08)' : 'var(--muted)', color: currency === c ? 'var(--primary)' : 'var(--foreground)' }}>{c}</button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Amount ({currency})</label>
        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full px-3 py-2.5 rounded border text-sm font-mono focus:outline-none" style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
        <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Available: {balance.currency} {balance.availableBalance.toFixed(2)}</p>
      </div>

      <div>
        <label className="text-xs mb-1.5 block" style={{ color: 'var(--muted-foreground)' }}>Note (optional)</label>
        <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="Transfer reference or note" className="w-full px-3 py-2 rounded border text-sm focus:outline-none" style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
      </div>

      <button onClick={handleSubmit} disabled={submitting || !amount || parseFloat(amount) <= 0} className="w-full py-2.5 rounded text-sm font-semibold disabled:opacity-50" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
        {submitting ? 'Submitting…' : 'Submit Transfer'}
      </button>
    </div>
  );
}

// ─── History panel ────────────────────────────────────────────────────────────

function HistoryPanel({ history }: { history: FundsHistoryEntry[] }) {
  return (
    <div className="rounded border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
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

const VALID_TABS: FundsTab[] = ['overview', 'deposit', 'withdraw', 'transfer', 'history'];

function isValidTab(tab: string | null): tab is FundsTab {
  return VALID_TABS.includes(tab as FundsTab);
}

function FinancePageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read tab from URL query param; default to 'overview'
  const tabFromUrl = searchParams.get('tab');
  const initialTab: FundsTab = isValidTab(tabFromUrl) ? tabFromUrl : 'overview';

  const [activeTab, setActiveTab] = useState<FundsTab>(initialTab);
  const [balance, setBalance] = useState<CustomerBalance | null>(null);
  const [history, setHistory] = useState<FundsHistoryEntry[]>([]);
  const [depositMethods, setDepositMethods] = useState<DepositMethodConfig[]>([]);
  const [destinations, setDestinations] = useState<WithdrawalDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Sync tab state when URL changes (back/forward navigation)
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (isValidTab(tab) && tab !== activeTab) {
      setActiveTab(tab);
    } else if (!tab && activeTab !== 'overview') {
      setActiveTab('overview');
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update URL when tab changes (preserves browser history)
  const handleTabChange = useCallback((tab: FundsTab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(searchParams.toString());
    if (tab === 'overview') {
      params.delete('tab');
    } else {
      params.set('tab', tab);
    }
    router.push(`/finance?${params.toString()}`);
  }, [router, searchParams]);

  const loadData = async () => {
    const [bal, hist, methods, dests] = await Promise.all([
      fundsService.getBalance(),
      fundsService.getHistory(),
      depositService.getDepositMethods(),
      withdrawalService.getDestinations(),
    ]);
    setBalance(bal);
    setHistory(hist);
    setDepositMethods(methods);
    setDestinations(dests);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const TABS: { id: FundsTab; label: string; icon: React.ElementType }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'deposit', label: 'Deposit', icon: ArrowDownLeft },
    { id: 'withdraw', label: 'Withdraw', icon: ArrowUpRight },
    { id: 'transfer', label: 'Transfer', icon: ArrowLeftRight },
    { id: 'history', label: 'History', icon: History },
  ];

  if (loading) {
    return (
      <AppLayout>
        <div className="py-4 space-y-4 max-w-4xl">
          <div className="h-8 w-48 rounded animate-pulse" style={{ backgroundColor: 'var(--muted)' }} />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-20 rounded border animate-pulse" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }} />)}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="py-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded flex items-center justify-center" style={{ backgroundColor: 'rgba(245,196,0,0.12)', border: '1px solid rgba(245,196,0,0.25)' }}>
              <Wallet size={16} style={{ color: 'var(--primary)' }} />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Balance &amp; Funds</h1>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Manage deposits, withdrawals, and transfers</p>
            </div>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-medium transition-all hover:bg-muted disabled:opacity-50"
            style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
          >
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Balance summary */}
        {balance && <BalanceSummary balance={balance} />}

        {/* Important notice */}
        <div className="flex items-start gap-2 p-3 rounded text-xs mb-5" style={{ backgroundColor: 'rgba(212,168,0,0.05)', border: '1px solid rgba(212,168,0,0.15)' }}>
          <Info size={12} className="shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
          <p style={{ color: 'var(--muted-foreground)' }}>
            Balances shown are indicative. The authoritative balance is maintained by the backend financial ledger.
            Frontend actions do not directly modify your balance — all changes require backend confirmation.
          </p>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar border-b mb-5" style={{ borderColor: 'var(--border)' }}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-colors shrink-0"
              style={{
                color: activeTab === tab.id ? 'var(--primary)' : 'var(--muted-foreground)',
                borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent',
                marginBottom: '-1px',
              }}
            >
              <tab.icon size={13} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && balance && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { label: 'Deposit', desc: 'Add funds to your account', icon: ArrowDownLeft, color: '#22c55e', tab: 'deposit' as FundsTab },
                { label: 'Withdraw', desc: 'Transfer funds out', icon: ArrowUpRight, color: '#ef4444', tab: 'withdraw' as FundsTab },
                { label: 'Transfer', desc: 'Move funds between accounts', icon: ArrowLeftRight, color: '#3b82f6', tab: 'transfer' as FundsTab },
              ].map(action => (
                <button
                  key={action.label}
                  onClick={() => handleTabChange(action.tab)}
                  className="flex items-center gap-3 p-4 rounded border text-left transition-all hover:shadow-sm group"
                  style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                >
                  <div className="w-9 h-9 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: `${action.color}14`, border: `1px solid ${action.color}30` }}>
                    <action.icon size={16} style={{ color: action.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{action.label}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{action.desc}</p>
                  </div>
                  <ChevronRight size={13} className="ml-auto opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--muted-foreground)' }} />
                </button>
              ))}
            </div>

            <div className="rounded border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--muted-foreground)' }}>Recent Activity</h3>
                <button onClick={() => handleTabChange('history')} className="text-xs" style={{ color: 'var(--primary)' }}>View all</button>
              </div>
              <div className="py-8 text-center">
                <History size={20} className="mx-auto mb-2" style={{ color: 'var(--muted-foreground)', opacity: 0.4 }} />
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No recent activity</p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)', opacity: 0.7 }}>Activity will appear here once backend is connected</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'deposit' && (
          <DepositPanel methods={depositMethods} />
        )}

        {activeTab === 'withdraw' && balance && (
          <WithdrawPanel balance={balance} destinations={destinations} />
        )}

        {activeTab === 'transfer' && balance && (
          <TransferPanel balance={balance} />
        )}

        {activeTab === 'history' && (
          <HistoryPanel history={history} />
        )}
      </div>
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
