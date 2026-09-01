'use client';
import React, { useState, useMemo } from 'react';
import { ArrowDownLeft, ArrowUpRight, RefreshCw, Search, Download, TrendingUp, DollarSign, ArrowUpDown, Clock, CheckCircle2, XCircle, ChevronDown } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';


type TxType = 'deposit' | 'withdrawal' | 'trade_buy' | 'trade_sell' | 'fee';
type TxStatus = 'completed' | 'pending' | 'processing' | 'failed';

interface Transaction {
  id: string;
  reference: string;
  type: TxType;
  asset: string;
  amount: number;
  fee: number;
  currency: string;
  status: TxStatus;
  date: string;
  description: string;
  balance: number;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tx-001', reference: 'TXN-20260828-001', type: 'deposit', asset: 'USDC', amount: 5000, fee: 0, currency: 'USDC', status: 'completed', date: '2026-08-28 09:14', description: 'Bank wire deposit', balance: 17480 },
  { id: 'tx-002', reference: 'TXN-20260827-012', type: 'trade_buy', asset: 'BTC', amount: -2450.00, fee: 4.90, currency: 'USDC', status: 'completed', date: '2026-08-27 15:32', description: 'Buy 0.038 BTC @ $64,473', balance: 12480 },
  { id: 'tx-003', reference: 'TXN-20260827-008', type: 'trade_sell', asset: 'ETH', amount: 1820.50, fee: 3.64, currency: 'USDC', status: 'completed', date: '2026-08-27 11:05', description: 'Sell 0.6 ETH @ $3,034', balance: 14930 },
  { id: 'tx-004', reference: 'TXN-20260826-019', type: 'withdrawal', asset: 'USDC', amount: -500, fee: 2.50, currency: 'USDC', status: 'processing', date: '2026-08-26 18:45', description: 'Withdrawal to bank account ****4821', balance: 13110 },
  { id: 'tx-005', reference: 'TXN-20260825-003', type: 'trade_buy', asset: 'ETH', amount: -1800, fee: 3.60, currency: 'USDC', status: 'completed', date: '2026-08-25 14:20', description: 'Buy 0.6 ETH @ $3,000', balance: 13610 },
  { id: 'tx-006', reference: 'TXN-20260824-007', type: 'fee', asset: 'USDC', amount: -12.50, fee: 0, currency: 'USDC', status: 'completed', date: '2026-08-24 00:00', description: 'Monthly platform fee', balance: 15410 },
  { id: 'tx-007', reference: 'TXN-20260822-015', type: 'deposit', asset: 'USDC', amount: 2500, fee: 0, currency: 'USDC', status: 'completed', date: '2026-08-22 10:30', description: 'Bank wire deposit', balance: 15422.50 },
  { id: 'tx-008', reference: 'TXN-20260820-004', type: 'trade_sell', asset: 'BTC', amount: 3200, fee: 6.40, currency: 'USDC', status: 'completed', date: '2026-08-20 16:55', description: 'Sell 0.05 BTC @ $64,000', balance: 12922.50 },
  { id: 'tx-009', reference: 'TXN-20260818-022', type: 'withdrawal', asset: 'USDC', amount: -1000, fee: 2.50, currency: 'USDC', status: 'failed', date: '2026-08-18 09:10', description: 'Withdrawal rejected — insufficient funds', balance: 9722.50 },
  { id: 'tx-010', reference: 'TXN-20260815-001', type: 'deposit', asset: 'USDC', amount: 10000, fee: 0, currency: 'USDC', status: 'completed', date: '2026-08-15 08:00', description: 'Initial deposit', balance: 10722.50 },
];

// Balance history for chart (derived from transactions, oldest first)
const BALANCE_HISTORY = [
  { date: 'Aug 15', balance: 10722.50 },
  { date: 'Aug 18', balance: 9722.50 },
  { date: 'Aug 20', balance: 12922.50 },
  { date: 'Aug 22', balance: 15422.50 },
  { date: 'Aug 24', balance: 15410 },
  { date: 'Aug 25', balance: 13610 },
  { date: 'Aug 26', balance: 13110 },
  { date: 'Aug 27', balance: 14930 },
  { date: 'Aug 28', balance: 17480 },
];

const TYPE_CONFIG: Record<TxType, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  deposit:    { label: 'Deposit',    icon: ArrowDownLeft,  color: '#22c55e', bg: 'rgba(34,197,94,0.1)' },
  withdrawal: { label: 'Withdrawal', icon: ArrowUpRight,   color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  trade_buy:  { label: 'Buy',        icon: TrendingUp,     color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  trade_sell: { label: 'Sell',       icon: DollarSign,     color: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
  fee:        { label: 'Fee',        icon: ArrowUpDown,    color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
};

const STATUS_CONFIG: Record<TxStatus, { icon: React.ElementType; color: string; label: string }> = {
  completed:  { icon: CheckCircle2, color: '#22c55e', label: 'Completed' },
  pending:    { icon: Clock,        color: '#f59e0b', label: 'Pending' },
  processing: { icon: RefreshCw,    color: '#3b82f6', label: 'Processing' },
  failed:     { icon: XCircle,      color: '#ef4444', label: 'Failed' },
};

const BalanceTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded border shadow-lg text-xs" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <p className="font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
      <p className="font-bold tabular-nums" style={{ color: 'var(--primary)' }}>
        ${payload[0]?.value?.toLocaleString('en-US', { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
};

export default function TransactionHistoryContent() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showChart, setShowChart] = useState(true);

  const filtered = useMemo(() => {
    return MOCK_TRANSACTIONS.filter(tx => {
      const matchSearch = !search || tx.reference.toLowerCase().includes(search.toLowerCase()) || tx.description.toLowerCase().includes(search.toLowerCase()) || tx.asset.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === 'all' || tx.type === typeFilter;
      const matchStatus = statusFilter === 'all' || tx.status === statusFilter;
      return matchSearch && matchType && matchStatus;
    });
  }, [search, typeFilter, statusFilter]);

  const totalDeposited = MOCK_TRANSACTIONS.filter(t => t.type === 'deposit' && t.status === 'completed').reduce((s, t) => s + t.amount, 0);
  const totalWithdrawn = MOCK_TRANSACTIONS.filter(t => t.type === 'withdrawal' && t.status === 'completed').reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalFees = MOCK_TRANSACTIONS.filter(t => t.status === 'completed').reduce((s, t) => s + t.fee, 0);
  const pendingCount = MOCK_TRANSACTIONS.filter(t => t.status === 'pending' || t.status === 'processing').length;
  const currentBalance = MOCK_TRANSACTIONS[0]?.balance ?? 0;

  const exportCSV = () => {
    const headers = ['Reference', 'Type', 'Asset', 'Amount', 'Fee', 'Status', 'Date', 'Description'];
    const rows = filtered.map(t => [t.reference, t.type, t.asset, t.amount, t.fee, t.status, t.date, t.description]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transaction-history.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="py-4 space-y-4 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Transaction History</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>All deposits, withdrawals, trades and fees on your account</p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border transition-colors hover:bg-white/5 shrink-0"
          style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
        >
          <Download size={12} />
          Export CSV
        </button>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Cash Balance', value: `$${currentBalance.toLocaleString()}`, color: 'var(--primary)', icon: DollarSign },
          { label: 'Total Deposited', value: `$${totalDeposited.toLocaleString()}`, color: '#22c55e', icon: ArrowDownLeft },
          { label: 'Total Withdrawn', value: `$${totalWithdrawn.toLocaleString()}`, color: '#f59e0b', icon: ArrowUpRight },
          { label: 'Fees Paid', value: `$${totalFees.toFixed(2)}`, color: '#6b7280', icon: ArrowUpDown },
          { label: 'Pending', value: String(pendingCount), color: '#3b82f6', icon: Clock },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="rounded-lg border p-3.5 flex items-center gap-3" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}>
              <Icon size={14} style={{ color }} />
            </div>
            <div>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
              <p className="text-sm font-bold mt-0.5 tabular-nums" style={{ color: 'var(--foreground)' }}>{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Balance history chart */}
      <div className="rounded-lg border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Cash Balance History</h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>USDC account balance over time</p>
          </div>
          <button
            onClick={() => setShowChart(v => !v)}
            className="text-xs px-2 py-1 rounded border transition-colors hover:bg-muted"
            style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
          >
            {showChart ? 'Hide' : 'Show'}
          </button>
        </div>
        {showChart && (
          <div className="px-4 pb-4 pt-2">
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={BALANCE_HISTORY} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="balGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="date" tick={{ fill: 'var(--muted-foreground)', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: 'var(--muted-foreground)', fontSize: 9 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}K`}
                  width={40}
                />
                <Tooltip content={<BalanceTooltip />} />
                <Area type="monotone" dataKey="balance" stroke="var(--primary)" strokeWidth={2} fill="url(#balGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="rounded-lg border p-3 flex flex-wrap gap-2 items-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        {/* Search */}
        <div className="flex items-center gap-2 flex-1 min-w-[180px] px-3 py-2 rounded-lg border" style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(255,255,255,0.03)' }}>
          <Search size={12} style={{ color: 'var(--muted-foreground)' }} />
          <input
            className="flex-1 text-xs bg-transparent outline-none"
            style={{ color: 'var(--foreground)' }}
            placeholder="Search by reference, asset..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Type filter */}
        <div className="relative">
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border appearance-none pr-7 outline-none cursor-pointer"
            style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            <option value="all">All Types</option>
            <option value="deposit">Deposits</option>
            <option value="withdrawal">Withdrawals</option>
            <option value="trade_buy">Buy Orders</option>
            <option value="trade_sell">Sell Orders</option>
            <option value="fee">Fees</option>
          </select>
          <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--muted-foreground)' }} />
        </div>

        {/* Status filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 rounded-lg border appearance-none pr-7 outline-none cursor-pointer"
            style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>
          <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--muted-foreground)' }} />
        </div>

        <span className="text-xs ml-auto" style={{ color: 'var(--muted-foreground)' }}>
          {filtered.length} of {MOCK_TRANSACTIONS.length} transactions
        </span>
      </div>

      {/* Transaction list */}
      <div className="rounded-lg border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        {/* Table header */}
        <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-3 px-4 py-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
          {['Transaction', 'Type', 'Amount', 'Fee', 'Balance', 'Status'].map(h => (
            <span key={h} className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>{h}</span>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No transactions match your filters</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {filtered.map(tx => {
              const typeConf = TYPE_CONFIG[tx.type];
              const statusConf = STATUS_CONFIG[tx.status];
              const TIcon = typeConf.icon;
              const SIcon = statusConf.icon;
              const isPositive = tx.amount > 0;

              return (
                <div key={tx.id} className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr] gap-3 px-4 py-3.5 hover:bg-white/[0.02] transition-colors">
                  {/* Transaction info */}
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: typeConf.bg }}>
                      <TIcon size={14} style={{ color: typeConf.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: 'var(--foreground)' }}>{tx.description}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)', fontFamily: 'monospace', fontSize: '10px' }}>{tx.reference}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)', opacity: 0.7 }}>{tx.date}</p>
                    </div>
                  </div>

                  {/* Type */}
                  <div className="flex items-center md:block">
                    <span className="md:hidden text-xs mr-2" style={{ color: 'var(--muted-foreground)' }}>Type:</span>
                    <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ backgroundColor: typeConf.bg, color: typeConf.color }}>
                      {typeConf.label}
                    </span>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center md:block">
                    <span className="md:hidden text-xs mr-2" style={{ color: 'var(--muted-foreground)' }}>Amount:</span>
                    <span className="text-xs font-semibold tabular-nums" style={{ color: isPositive ? '#22c55e' : tx.type === 'fee' ? '#6b7280' : '#ef4444' }}>
                      {isPositive ? '+' : ''}{tx.amount.toLocaleString()} {tx.currency}
                    </span>
                  </div>

                  {/* Fee */}
                  <div className="flex items-center md:block">
                    <span className="md:hidden text-xs mr-2" style={{ color: 'var(--muted-foreground)' }}>Fee:</span>
                    <span className="text-xs" style={{ color: tx.fee > 0 ? '#6b7280' : 'var(--muted-foreground)' }}>
                      {tx.fee > 0 ? `-$${tx.fee.toFixed(2)}` : '—'}
                    </span>
                  </div>

                  {/* Balance */}
                  <div className="flex items-center md:block">
                    <span className="md:hidden text-xs mr-2" style={{ color: 'var(--muted-foreground)' }}>Balance:</span>
                    <span className="text-xs font-medium tabular-nums" style={{ color: 'var(--foreground)' }}>${tx.balance.toLocaleString()}</span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-1.5">
                    <SIcon size={11} style={{ color: statusConf.color }} className={tx.status === 'processing' ? 'animate-spin' : ''} />
                    <span className="text-xs" style={{ color: statusConf.color }}>{statusConf.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
