'use client';
import React, { useState } from 'react';
import { financeService, DepositMethod, WithdrawMethod } from '@/services/finance.service';
import { ActionButton } from '@/components/admin/AdminUI';
import { CheckCircle, Clock, AlertCircle, ArrowDownLeft, ArrowUpRight } from 'lucide-react';

type FlowType = 'deposit' | 'withdrawal';
type DepositStep = 'method' | 'amount' | 'confirm' | 'success';
type WithdrawStep = 'method' | 'amount' | 'destination' | 'confirm' | 'success';

const DEPOSIT_METHODS: { value: DepositMethod; label: string; fee: string; time: string }[] = [
  { value: 'bank_transfer', label: 'Bank Transfer', fee: 'Free', time: '1–3 business days' },
  { value: 'credit_card', label: 'Credit / Debit Card', fee: '1.5%', time: 'Instant' },
  { value: 'crypto', label: 'Crypto Transfer', fee: 'Network fee', time: '10–60 min' },
  { value: 'wire', label: 'Wire Transfer', fee: '$15 flat', time: '2–5 business days' },
];

const WITHDRAW_METHODS: { value: WithdrawMethod; label: string; fee: string; time: string }[] = [
  { value: 'bank_transfer', label: 'Bank Transfer', fee: '$15', time: '1–3 business days' },
  { value: 'crypto', label: 'Crypto Wallet', fee: 'Network fee', time: '10–60 min' },
  { value: 'wire', label: 'Wire Transfer', fee: '$25', time: '2–5 business days' },
];

interface DepositWithdrawFlowProps {
  type: FlowType;
  onClose: () => void;
  availableBalance?: number;
}

export default function DepositWithdrawFlow({ type, onClose, availableBalance = 24850 }: DepositWithdrawFlowProps) {
  const isDeposit = type === 'deposit';

  const [depositStep, setDepositStep] = useState<DepositStep>('method');
  const [withdrawStep, setWithdrawStep] = useState<WithdrawStep>('method');
  const [loading, setLoading] = useState(false);
  const [reference, setReference] = useState('');

  const [selectedDepositMethod, setSelectedDepositMethod] = useState<DepositMethod>('bank_transfer');
  const [selectedWithdrawMethod, setSelectedWithdrawMethod] = useState<WithdrawMethod>('bank_transfer');
  const [amount, setAmount] = useState('');
  const [destination, setDestination] = useState('');

  const currentStep = isDeposit ? depositStep : withdrawStep;
  const selectedMethod = isDeposit
    ? DEPOSIT_METHODS.find(m => m.value === selectedDepositMethod)
    : WITHDRAW_METHODS.find(m => m.value === selectedWithdrawMethod);

  const handleDepositNext = () => {
    if (depositStep === 'method') setDepositStep('amount');
    else if (depositStep === 'amount') setDepositStep('confirm');
    else if (depositStep === 'confirm') handleDepositSubmit();
  };

  const handleWithdrawNext = () => {
    if (withdrawStep === 'method') setWithdrawStep('amount');
    else if (withdrawStep === 'amount') setWithdrawStep('destination');
    else if (withdrawStep === 'destination') setWithdrawStep('confirm');
    else if (withdrawStep === 'confirm') handleWithdrawSubmit();
  };

  const handleDepositSubmit = async () => {
    setLoading(true);
    const res = await financeService.submitDeposit('cust-001', {
      amount: parseFloat(amount),
      currency: 'USD',
      method: selectedDepositMethod,
    });
    setLoading(false);
    if (res.success && res.deposit) {
      setReference(res.deposit.reference);
      setDepositStep('success');
    }
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

  const handleBack = () => {
    if (isDeposit) {
      if (depositStep === 'amount') setDepositStep('method');
      else if (depositStep === 'confirm') setDepositStep('amount');
    } else {
      if (withdrawStep === 'amount') setWithdrawStep('method');
      else if (withdrawStep === 'destination') setWithdrawStep('amount');
      else if (withdrawStep === 'confirm') setWithdrawStep('destination');
    }
  };

  const isSuccess = currentStep === 'success';
  const isConfirm = currentStep === 'confirm';
  const canGoBack = !isSuccess && currentStep !== 'method';

  const inputCls = "w-full text-xs px-3 py-2 rounded border outline-none";
  const inputStyle = { backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' };

  const STEP_LABELS: Record<string, string[]> = {
    deposit: ['Method', 'Amount', 'Confirm', 'Done'],
    withdrawal: ['Method', 'Amount', 'Destination', 'Confirm', 'Done'],
  };
  const steps = STEP_LABELS[type];
  const stepIndex = isDeposit
    ? ['method', 'amount', 'confirm', 'success'].indexOf(depositStep)
    : ['method', 'amount', 'destination', 'confirm', 'success'].indexOf(withdrawStep);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: isDeposit ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)' }}>
          {isDeposit ? <ArrowDownLeft size={14} style={{ color: '#22c55e' }} /> : <ArrowUpRight size={14} style={{ color: '#ef4444' }} />}
        </div>
        <div>
          <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{isDeposit ? 'Deposit Funds' : 'Withdraw Funds'}</h3>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {isDeposit ? 'Add funds to your account' : `Available: $${availableBalance.toLocaleString()}`}
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-1">
        {steps.map((label, i) => (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center gap-0.5">
              <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                style={{
                  backgroundColor: i < stepIndex ? 'var(--primary)' : i === stepIndex ? 'rgba(245,196,0,0.2)' : 'var(--card)',
                  border: `1.5px solid ${i <= stepIndex ? 'var(--primary)' : 'var(--border)'}`,
                  color: i < stepIndex ? '#000' : i === stepIndex ? 'var(--primary)' : 'var(--muted-foreground)',
                  fontSize: '9px',
                }}>
                {i < stepIndex ? '✓' : i + 1}
              </div>
              <span className="text-xs hidden sm:block" style={{ color: i === stepIndex ? 'var(--primary)' : 'var(--muted-foreground)', fontSize: '9px' }}>{label}</span>
            </div>
            {i < steps.length - 1 && <div className="flex-1 h-px" style={{ backgroundColor: i < stepIndex ? 'var(--primary)' : 'var(--border)' }} />}
          </React.Fragment>
        ))}
      </div>

      {/* Step content */}
      <div className="rounded-lg border p-4 space-y-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
        {/* Method selection */}
        {currentStep === 'method' && (
          <div className="space-y-2">
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>Select {isDeposit ? 'deposit' : 'withdrawal'} method</p>
            {(isDeposit ? DEPOSIT_METHODS : WITHDRAW_METHODS).map((m) => {
              const isSelected = isDeposit ? selectedDepositMethod === m.value : selectedWithdrawMethod === m.value;
              return (
                <button key={m.value}
                  onClick={() => isDeposit ? setSelectedDepositMethod(m.value as DepositMethod) : setSelectedWithdrawMethod(m.value as WithdrawMethod)}
                  className="w-full flex items-center justify-between p-3 rounded border transition-all text-left"
                  style={{
                    borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: isSelected ? 'rgba(245,196,0,0.06)' : 'transparent',
                  }}>
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{m.label}</p>
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

        {/* Amount */}
        {currentStep === 'amount' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--muted-foreground)' }}>$</span>
                <input
                  type="number"
                  className={inputCls + " pl-6"}
                  style={inputStyle}
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  min="1"
                />
              </div>
            </div>
            {!isDeposit && (
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Available balance: <span style={{ color: 'var(--foreground)' }}>${availableBalance.toLocaleString()}</span>
                {' · '}Fee: <span style={{ color: 'var(--foreground)' }}>{selectedMethod?.fee}</span>
              </p>
            )}
            <div className="flex gap-2">
              {(isDeposit ? ['100', '500', '1000', '5000'] : ['500', '1000', '5000', '10000']).map(v => (
                <button key={v} onClick={() => setAmount(v)}
                  className="flex-1 text-xs py-1.5 rounded border transition-colors"
                  style={{ borderColor: amount === v ? 'var(--primary)' : 'var(--border)', color: amount === v ? 'var(--primary)' : 'var(--muted-foreground)', backgroundColor: amount === v ? 'rgba(245,196,0,0.08)' : 'transparent' }}>
                  ${v}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Destination (withdrawal only) */}
        {currentStep === 'destination' && (
          <div className="space-y-3">
            <div>
              <label className="text-xs mb-1 block" style={{ color: 'var(--muted-foreground)' }}>
                {selectedWithdrawMethod === 'crypto' ? 'Wallet Address' : 'Bank Account / IBAN'}
              </label>
              <input
                className={inputCls}
                style={inputStyle}
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder={selectedWithdrawMethod === 'crypto' ? '0x...' : 'IBAN or account number'}
              />
            </div>
            <div className="p-2 rounded text-xs flex items-start gap-2" style={{ backgroundColor: 'rgba(245,196,0,0.06)', color: 'var(--muted-foreground)' }}>
              <AlertCircle size={12} className="mt-0.5 shrink-0" style={{ color: 'var(--primary)' }} />
              Double-check the destination. Funds sent to incorrect addresses cannot be recovered.
            </div>
          </div>
        )}

        {/* Confirm */}
        {isConfirm && (
          <div className="space-y-2">
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--muted-foreground)' }}>Confirm {isDeposit ? 'deposit' : 'withdrawal'}</p>
            {[
              ['Method', selectedMethod?.label],
              ['Amount', `$${parseFloat(amount || '0').toLocaleString()}`],
              ['Fee', selectedMethod?.fee],
              ['Estimated arrival', selectedMethod?.time],
              ...(!isDeposit ? [['Destination', destination || '—']] : []),
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between text-xs py-1.5 border-b" style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>{label}</span>
                <span style={{ color: 'var(--foreground)' }}>{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Success */}
        {isSuccess && (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(34,197,94,0.15)' }}>
              <CheckCircle size={24} style={{ color: '#22c55e' }} />
            </div>
            <div>
              <p className="text-sm font-bold mb-1" style={{ color: 'var(--foreground)' }}>
                {isDeposit ? 'Deposit Submitted' : 'Withdrawal Requested'}
              </p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {isDeposit
                  ? `Your deposit of $${parseFloat(amount).toLocaleString()} is being processed.`
                  : `Your withdrawal of $${parseFloat(amount).toLocaleString()} has been queued.`}
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded border text-xs" style={{ borderColor: 'rgba(245,196,0,0.3)', backgroundColor: 'rgba(245,196,0,0.06)', color: 'var(--muted-foreground)' }}>
              <Clock size={11} style={{ color: 'var(--primary)' }} />
              Reference: {reference}
            </div>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Estimated: {selectedMethod?.time}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      {!isSuccess && (
        <div className="flex justify-between">
          <button
            onClick={canGoBack ? handleBack : onClose}
            className="text-xs px-4 py-2 rounded border transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
            {canGoBack ? 'Back' : 'Cancel'}
          </button>
          <ActionButton
            variant={isConfirm ? 'primary' : 'primary'}
            onClick={isDeposit ? handleDepositNext : handleWithdrawNext}
          >
            {loading ? 'Processing...' : isConfirm ? (isDeposit ? 'Confirm Deposit' : 'Confirm Withdrawal') : 'Continue →'}
          </ActionButton>
        </div>
      )}
      {isSuccess && (
        <div className="flex justify-end">
          <ActionButton variant="primary" onClick={onClose}>Done</ActionButton>
        </div>
      )}
    </div>
  );
}
