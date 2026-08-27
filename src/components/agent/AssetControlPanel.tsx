'use client';
import React, { useState } from 'react';
import { AssignedCustomer } from '@/services/agent.service';
import { ActionButton } from '@/components/admin/AdminUI';
import { Clock, AlertTriangle, CheckCircle, Bitcoin } from 'lucide-react';

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
  assetSymbol: string;
  value: number;
  triggerAt: string;
  reason: string;
  status: 'pending' | 'executed' | 'cancelled';
  createdAt: string;
}

interface ClientAsset {
  symbol: string;
  name: string;
  balance: number;
  value: number;
  pnl: number;
  pnlPct: number;
  icon: string;
}

const MOCK_CLIENT_ASSETS: ClientAsset[] = [
  { symbol: 'BTC', name: 'Bitcoin', balance: 0.3842, value: 26048.12, pnl: 1842.50, pnlPct: 7.61, icon: '₿' },
  { symbol: 'ETH', name: 'Ethereum', balance: 4.215, value: 14929.23, pnl: -312.40, pnlPct: -2.05, icon: 'Ξ' },
  { symbol: 'USDC', name: 'USD Coin', balance: 8420.00, value: 8420.00, pnl: 0, pnlPct: 0, icon: '$' },
  { symbol: 'BNB', name: 'BNB', balance: 12.5, value: 3750.00, pnl: 225.00, pnlPct: 6.38, icon: 'B' },
  { symbol: 'SOL', name: 'Solana', balance: 28.4, value: 4260.00, pnl: -180.00, pnlPct: -4.05, icon: 'S' },
  { symbol: 'XRP', name: 'Ripple', balance: 5200, value: 2860.00, pnl: 104.00, pnlPct: 3.77, icon: 'X' },
];

const MOCK_TRIGGERS: ScheduledTrigger[] = [
  {
    id: 'trig-001',
    customerId: 'cust-001',
    customerName: 'Alex Morgan',
    adjustmentType: 'increase',
    assetSymbol: 'USDC',
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
  const [selectedAsset, setSelectedAsset] = useState<string>('USDC');
  const [value, setValue] = useState('');
  const [reason, setReason] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [triggers, setTriggers] = useState<ScheduledTrigger[]>(
    MOCK_TRIGGERS.filter(t => t.customerId === customer.id)
  );
  const [assets, setAssets] = useState<ClientAsset[]>(MOCK_CLIENT_ASSETS);
  const [activeView, setActiveView] = useState<'assets' | 'adjust'>('assets');

  const totalPortfolioValue = assets.reduce((sum, a) => sum + a.value, 0);
  const totalPnl = assets.reduce((sum, a) => sum + a.pnl, 0);

  const currentAsset = assets.find(a => a.symbol === selectedAsset);

  const getPreviewValue = () => {
    if (!currentAsset) return 0;
    const v = parseFloat(value) || 0;
    if (adjustType === 'set') return v;
    if (adjustType === 'increase') return currentAsset.value + v;
    if (adjustType === 'decrease') return Math.max(0, currentAsset.value - v);
    if (adjustType === 'percentage') return currentAsset.value * (1 + v / 100);
    return currentAsset.value;
  };

  const handleApply = async () => {
    if (!value || !reason) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    if (mode === 'scheduled' && scheduledTime) {
      const newTrigger: ScheduledTrigger = {
        id: `trig-${Date.now()}`,
        customerId: customer.id,
        customerName: `${customer.firstName} ${customer.lastName}`,
        adjustmentType: adjustType,
        assetSymbol: selectedAsset,
        value: parseFloat(value),
        triggerAt: scheduledTime,
        reason,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      setTriggers(prev => [...prev, newTrigger]);
    } else {
      // Apply immediately — update asset value in state
      const v = parseFloat(value);
      setAssets(prev => prev.map(a => {
        if (a.symbol !== selectedAsset) return a;
        let newValue = a.value;
        if (adjustType === 'set') newValue = v;
        else if (adjustType === 'increase') newValue = a.value + v;
        else if (adjustType === 'decrease') newValue = Math.max(0, a.value - v);
        else if (adjustType === 'percentage') newValue = a.value * (1 + v / 100);
        return { ...a, value: Math.round(newValue * 100) / 100 };
      }));
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
    <div className="space-y-3">
      {/* Portfolio Summary */}
      <div className="p-3 rounded-lg border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{customer.firstName} {customer.lastName} — Portfolio</p>
          <span className={`text-xs font-semibold ${totalPnl >= 0 ? 'text-positive' : 'text-negative'}`}>
            {totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>
        <p className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>${totalPortfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{assets.length} assets held</p>
      </div>

      {/* View Toggle */}
      <div className="flex gap-1.5">
        <button onClick={() => setActiveView('assets')}
          className="flex-1 text-xs py-1.5 rounded border transition-all"
          style={{
            borderColor: activeView === 'assets' ? 'var(--primary)' : 'var(--border)',
            backgroundColor: activeView === 'assets' ? 'rgba(245,196,0,0.08)' : 'transparent',
            color: activeView === 'assets' ? 'var(--primary)' : 'var(--muted-foreground)',
          }}>
          📊 All Assets
        </button>
        <button onClick={() => setActiveView('adjust')}
          className="flex-1 text-xs py-1.5 rounded border transition-all"
          style={{
            borderColor: activeView === 'adjust' ? 'var(--primary)' : 'var(--border)',
            backgroundColor: activeView === 'adjust' ? 'rgba(245,196,0,0.08)' : 'transparent',
            color: activeView === 'adjust' ? 'var(--primary)' : 'var(--muted-foreground)',
          }}>
          ⚙️ Adjust Asset
        </button>
      </div>

      {/* Assets View */}
      {activeView === 'assets' && (
        <div className="space-y-1.5">
          {assets.map(asset => (
            <div
              key={asset.symbol}
              onClick={() => { setSelectedAsset(asset.symbol); setActiveView('adjust'); }}
              className="flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer hover:bg-white/3 transition-colors"
              style={{ borderColor: 'var(--border)' }}
            >
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: 'rgba(245,196,0,0.12)', color: 'var(--primary)' }}>
                {asset.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{asset.symbol}</p>
                  <p className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>${asset.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{asset.balance} {asset.symbol}</p>
                  <span className={`text-xs ${asset.pnl >= 0 ? 'text-positive' : 'text-negative'}`}>
                    {asset.pnl >= 0 ? '+' : ''}{asset.pnlPct.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          ))}
          <p className="text-xs text-center pt-1" style={{ color: 'var(--muted-foreground)' }}>Click an asset to adjust its value</p>
        </div>
      )}

      {/* Adjust View */}
      {activeView === 'adjust' && (
        <div className="space-y-3">
          {/* Asset Selector */}
          <div>
            <label className="text-xs mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Select Asset</label>
            <select
              value={selectedAsset}
              onChange={e => setSelectedAsset(e.target.value)}
              className={inputCls}
              style={inputStyle}
            >
              {assets.map(a => (
                <option key={a.symbol} value={a.symbol}>{a.symbol} — {a.name} (${a.value.toLocaleString()})</option>
              ))}
            </select>
          </div>

          {/* Current asset info */}
          {currentAsset && (
            <div className="flex items-center gap-3 p-2.5 rounded border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)' }}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'rgba(245,196,0,0.12)', color: 'var(--primary)' }}>
                {currentAsset.icon}
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Current {currentAsset.symbol} Value</p>
                <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>${currentAsset.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            </div>
          )}

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
              {adjustType === 'percentage' ? 'Percentage (%)' : `Amount (${selectedAsset === 'USDC' ? 'USD' : 'USD value'})`}
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
                Preview: <span style={{ color: 'var(--primary)' }}>${getPreviewValue().toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
            <ActionButton variant="primary" onClick={handleApply}>
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
                        {t.assetSymbol} — {t.adjustmentType === 'set' ? 'Set to' : t.adjustmentType === 'increase' ? '+' : t.adjustmentType === 'decrease' ? '-' : ''}
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
      )}
    </div>
  );
}
