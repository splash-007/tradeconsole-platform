'use client';
import React, { useState } from 'react';
import { AssignedCustomer } from '@/services/agent.service';
import { ActionButton } from '@/components/admin/AdminUI';
import { DollarSign, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface AssetControlPanelProps {
  customer: AssignedCustomer;
  onClose?: () => void;
}

type TriggerMode = 'immediate' | 'scheduled';
type AdjustmentType = 'set' | 'increase' | 'decrease' | 'percentage';

interface ScheduledTrigger {
  id: string;
  customerId: string;
  customerName: string;
  adjustmentType: AdjustmentType;
  value: number;
  triggerAt: string;
  reason: string;
  status: 'pending' | 'executed' | 'cancelled';
  createdAt: string;
}

// Mock scheduled triggers store
const MOCK_TRIGGERS: ScheduledTrigger[] = [
  {
    id: 'trig-001',
    customerId: 'cust-001',
    customerName: 'Alex Morgan',
    adjustmentType: 'increase',
    value: 500,
    triggerAt: '2026-08-28 09:00',
    reason: 'Bonus credit for referral',
    status: 'pending',
    createdAt: '2026-08-27 14:00',
  },
];

export default function AssetControlPanel({ customer, onClose }: AssetControlPanelProps) {
  const [mode, setMode] = useState<TriggerMode>('immediate');
  const [adjustType, setAdjustType] = useState<AdjustmentType>('set');
  const [value, setValue] = useState('');
  const [reason, setReason] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [triggers, setTriggers] = useState<ScheduledTrigger[]>(
    MOCK_TRIGGERS.filter(t => t.customerId === customer.id)
  );

  // Mock current balance
  const currentBalance = 24850;

  const getPreviewBalance = () => {
    const v = parseFloat(value) || 0;
    if (adjustType === 'set') return v;
    if (adjustType === 'increase') return currentBalance + v;
    if (adjustType === 'decrease') return Math.max(0, currentBalance - v);
    if (adjustType === 'percentage') return currentBalance * (1 + v / 100);
    return currentBalance;
  };

  const handleApply = async () => {
    if (!value || !reason) return;
    setLoading(true);

    // BACKEND INTEGRATION: POST /api/v1/admin/customers/:id/asset-control
    await new Promise(r => setTimeout(r, 800));

    if (mode === 'scheduled' && scheduledTime) {
      const newTrigger: ScheduledTrigger = {
        id: `trig-${Date.now()}`,
        customerId: customer.id,
        customerName: `${customer.firstName} ${customer.lastName}`,
        adjustmentType: adjustType,
        value: parseFloat(value),
        triggerAt: scheduledTime,
        reason,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      setTriggers(prev => [...prev, newTrigger]);
    }

    setLoading(false);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setValue('');
      setReason('');
      setScheduledTime('');
    }, 2000);
  };

  const cancelTrigger = (triggerId: string) => {
    setTriggers(prev => prev.map(t => t.id === triggerId ? { ...t, status: 'cancelled' } : t));
  };

  const inputCls = "w-full text-xs px-3 py-2 rounded border outline-none";
  const inputStyle = { backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' };

  const ADJUST_TYPES: { value: AdjustmentType; label: string }[] = [
    { value: 'set', label: 'Set to' },
    { value: 'increase', label: 'Increase by' },
    { value: 'decrease', label: 'Decrease by' },
    { value: 'percentage', label: '% Change' },
  ];

  return (
    <div className="space-y-4">
      {/* Current balance */}
      <div className="flex items-center gap-3 p-3 rounded-lg border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(245,196,0,0.15)' }}>
          <DollarSign size={14} style={{ color: 'var(--primary)' }} />
        </div>
        <div>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Current Balance — {customer.firstName} {customer.lastName}</p>
          <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>${currentBalance.toLocaleString()}</p>
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-2 p-2 rounded text-xs" style={{ backgroundColor: 'rgba(239,68,68,0.08)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>
        <AlertTriangle size={12} className="mt-0.5 shrink-0" />
        Asset adjustments are logged and audited. Only use for legitimate corrections or bonuses.
      </div>

      {/* Trigger mode */}
      <div className="flex gap-2">
        {(['immediate', 'scheduled'] as TriggerMode[]).map(m => (
          <button key={m} onClick={() => setMode(m)}
            className="flex-1 text-xs py-2 rounded border capitalize transition-all"
            style={{
              borderColor: mode === m ? 'var(--primary)' : 'var(--border)',
              backgroundColor: mode === m ? 'rgba(245,196,0,0.08)' : 'transparent',
              color: mode === m ? 'var(--primary)' : 'var(--muted-foreground)',
            }}>
            {m === 'immediate' ? '⚡ Immediate' : '🕐 Scheduled'}
          </button>
        ))}
      </div>

      {/* Adjustment type */}
      <div>
        <label className="text-xs mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Adjustment Type</label>
        <div className="grid grid-cols-2 gap-1.5">
          {ADJUST_TYPES.map(at => (
            <button key={at.value} onClick={() => setAdjustType(at.value)}
              className="text-xs py-1.5 px-2 rounded border transition-all"
              style={{
                borderColor: adjustType === at.value ? 'var(--primary)' : 'var(--border)',
                backgroundColor: adjustType === at.value ? 'rgba(245,196,0,0.08)' : 'transparent',
                color: adjustType === at.value ? 'var(--primary)' : 'var(--muted-foreground)',
              }}>
              {at.label}
            </button>
          ))}
        </div>
      </div>

      {/* Value */}
      <div>
        <label className="text-xs mb-1 block" style={{ color: 'var(--muted-foreground)' }}>
          {adjustType === 'percentage' ? 'Percentage (%)' : 'Amount (USD)'}
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {adjustType === 'percentage' ? '%' : '$'}
          </span>
          <input type="number" className={inputCls + " pl-6"} style={inputStyle}
            value={value} onChange={e => setValue(e.target.value)} placeholder="0.00" />
        </div>
        {value && (
          <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
            Preview: <span style={{ color: 'var(--primary)' }}>${getPreviewBalance().toLocaleString()}</span>
          </p>
        )}
      </div>

      {/* Scheduled time */}
      {mode === 'scheduled' && (
        <div>
          <label className="text-xs mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Trigger Date & Time</label>
          <input type="datetime-local" className={inputCls} style={inputStyle}
            value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} />
        </div>
      )}

      {/* Reason */}
      <div>
        <label className="text-xs mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Reason (required for audit)</label>
        <input className={inputCls} style={inputStyle}
          value={reason} onChange={e => setReason(e.target.value)}
          placeholder="e.g. Bonus credit, correction, promotional adjustment" />
      </div>

      {/* Apply button */}
      {success ? (
        <div className="flex items-center justify-center gap-2 py-2 rounded text-xs" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>
          <CheckCircle size={12} />
          {mode === 'immediate' ? 'Applied successfully' : 'Scheduled successfully'}
        </div>
      ) : (
        <ActionButton
          variant="primary"
          onClick={handleApply}
        >
          {loading ? 'Applying...' : mode === 'immediate' ? '⚡ Apply Now' : '🕐 Schedule Trigger'}
        </ActionButton>
      )}

      {/* Scheduled triggers list */}
      {triggers.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Scheduled Triggers</h4>
          <div className="space-y-2">
            {triggers.map(t => (
              <div key={t.id} className="flex items-start gap-2 p-2 rounded border text-xs" style={{ borderColor: 'var(--border)' }}>
                <Clock size={11} className="mt-0.5 shrink-0" style={{ color: t.status === 'pending' ? 'var(--primary)' : 'var(--muted-foreground)' }} />
                <div className="flex-1 min-w-0">
                  <p style={{ color: 'var(--foreground)' }}>
                    {t.adjustmentType === 'set' ? 'Set to' : t.adjustmentType === 'increase' ? '+' : t.adjustmentType === 'decrease' ? '-' : ''}
                    {t.adjustmentType === 'percentage' ? `${t.value}%` : `$${t.value.toLocaleString()}`}
                  </p>
                  <p style={{ color: 'var(--muted-foreground)' }}>{t.triggerAt} · {t.reason}</p>
                </div>
                <div className="flex items-center gap-1">
                  <span className="capitalize text-xs px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: t.status === 'pending' ? 'rgba(245,196,0,0.1)' : t.status === 'executed' ? 'rgba(34,197,94,0.1)' : 'rgba(107,114,128,0.1)',
                      color: t.status === 'pending' ? 'var(--primary)' : t.status === 'executed' ? '#22c55e' : '#6b7280',
                    }}>
                    {t.status}
                  </span>
                  {t.status === 'pending' && (
                    <button onClick={() => cancelTrigger(t.id)} className="text-xs px-1.5 py-0.5 rounded" style={{ color: '#ef4444' }}>✕</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
