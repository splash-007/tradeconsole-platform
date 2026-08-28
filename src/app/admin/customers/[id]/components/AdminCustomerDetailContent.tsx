'use client';
import React, { useState } from 'react';
import { PageHeader, Card, ActionButton, StatusBadge } from '@/components/admin/AdminUI';
import AssignAgentModal from './AssignAgentModal';
import { notificationService } from '@/services/notification.service';
import { CheckCircle, Mail } from 'lucide-react';

const MOCK_CUSTOMER = {
  id: 'cust-001', firstName: 'Alex', lastName: 'Morgan', email: 'alex.morgan@gmail.com',
  phone: '+44 7700 900100', country: 'United Kingdom', status: 'active',
  registrationDate: '2026-08-20 14:22', verificationStatus: 'verified',
  source: 'Google Ads', affiliate: 'AFF-0042', campaign: 'summer-2026',
  utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'summer-2026',
  assignedAgent: 'Sarah Chen', accountBalance: '$24,850.00',
  totalDeposits: '$35,000.00', totalWithdrawals: '$10,150.00',
  tags: ['VIP', 'High Value'], onlineStatus: 'online',
  dateOfBirth: '1988-04-15', nationality: 'British', address: '12 Baker Street, London, W1U 6TN',
  city: 'London', postalCode: 'W1U 6TN', occupation: 'Software Engineer',
  employerName: 'TechCorp Ltd', annualIncome: '$120,000',
};

const MOCK_TRANSACTIONS = [
  { id: 'tx-001', type: 'deposit', amount: '+$10,000', currency: 'USD', status: 'completed', date: '2026-08-27 10:00', ref: 'DEP-001' },
  { id: 'tx-002', type: 'trade', amount: '-$5,000', currency: 'USD', status: 'completed', date: '2026-08-27 11:30', ref: 'TRD-001' },
  { id: 'tx-003', type: 'withdrawal', amount: '-$2,500', currency: 'USD', status: 'approved', date: '2026-08-26 16:00', ref: 'WTH-001' },
  { id: 'tx-004', type: 'deposit', amount: '+$15,000', currency: 'USD', status: 'completed', date: '2026-08-22 09:00', ref: 'DEP-002' },
  { id: 'tx-005', type: 'fee', amount: '-$25', currency: 'USD', status: 'completed', date: '2026-08-22 09:01', ref: 'FEE-001' },
];

const MOCK_POSITIONS = [
  { symbol: 'BTC/USDC', side: 'long', entry: '$63,200', current: '$67,842', size: '0.35', pnl: '+$1,624.82', pnlPct: '+7.34%' },
  { symbol: 'ETH/USDC', side: 'long', entry: '$3,680', current: '$3,542', size: '2.4', pnl: '-$329.28', pnlPct: '-3.73%' },
  { symbol: 'SOL/USDC', side: 'long', entry: '$168.50', current: '$182.45', size: '15', pnl: '+$209.25', pnlPct: '+8.28%' },
];

const MOCK_MESSAGES = [
  { id: 'm1', from: 'Alex Morgan', text: 'Hi, I have a question about my withdrawal.', time: '2026-08-27 15:32', direction: 'inbound' },
  { id: 'm2', from: 'Sarah Chen', text: 'Hi Alex! Happy to help. What would you like to know?', time: '2026-08-27 15:34', direction: 'outbound' },
  { id: 'm3', from: 'Alex Morgan', text: 'When will my withdrawal of $2,500 be processed?', time: '2026-08-27 15:35', direction: 'inbound' },
  { id: 'm4', from: 'Sarah Chen', text: 'It is currently under review and should be processed within 24 hours.', time: '2026-08-27 15:36', direction: 'outbound' },
];

const MOCK_TASKS = [
  { id: 't1', title: 'Follow-up call', priority: 'high', status: 'pending', dueDate: '2026-08-28', assignedTo: 'Sarah Chen' },
  { id: 't2', title: 'Verify KYC documents', priority: 'medium', status: 'completed', dueDate: '2026-08-25', assignedTo: 'Sarah Chen' },
  { id: 't3', title: 'Send deposit confirmation', priority: 'low', status: 'completed', dueDate: '2026-08-27', assignedTo: 'Sarah Chen' },
];

const MOCK_NOTES = [
  { id: 'n1', author: 'Sarah Chen', time: '2026-08-27 15:10', text: 'Customer is interested in increasing their BTC position. Follow up with market analysis.' },
  { id: 'n2', author: 'Sarah Chen', time: '2026-08-26 11:00', text: 'VIP client — handle with priority. Prefers email communication over calls.' },
];

const MOCK_SESSIONS = [
  { id: 's1', timestamp: '2026-08-27 14:30', ip: '82.45.123.10', device: 'Chrome / macOS', location: 'London, UK', status: 'active' },
  { id: 's2', timestamp: '2026-08-26 09:15', ip: '82.45.123.10', device: 'Safari / iPhone', location: 'London, UK', status: 'ended' },
  { id: 's3', timestamp: '2026-08-24 18:42', ip: '82.45.123.10', device: 'Chrome / macOS', location: 'London, UK', status: 'ended' },
];

const KYC_STEPS = [
  { step: 'Personal Information', status: 'verified', completedAt: '2026-08-20 14:30' },
  { step: 'Address Verification', status: 'verified', completedAt: '2026-08-20 14:35' },
  { step: 'Document Upload', status: 'verified', completedAt: '2026-08-21 10:00' },
  { step: 'Identity Check', status: 'verified', completedAt: '2026-08-21 11:30' },
  { step: 'Final Review', status: 'verified', completedAt: '2026-08-22 09:00' },
];

const TABS = ['Overview', 'Profile', 'Attribution', 'Account', 'Transactions', 'Trading', 'Verification', 'Communications', 'Tasks', 'Internal Notes', 'Activity', 'Security'];

const TIMELINE = [
  { time: '14:40', event: 'Registration created', actor: 'System' },
  { time: '14:43', event: 'Assigned to Sarah Chen', actor: 'Admin' },
  { time: '15:01', event: 'Agent opened customer profile', actor: 'Sarah Chen' },
  { time: '15:05', event: 'Call started', actor: 'Sarah Chen' },
  { time: '15:09', event: 'Call ended — Connected (4:32)', actor: 'System' },
  { time: '15:10', event: 'Internal note added', actor: 'Sarah Chen' },
  { time: '15:32', event: 'Customer sent message', actor: 'Alex Morgan' },
  { time: '15:34', event: 'Agent replied', actor: 'Sarah Chen' },
  { time: '16:00', event: 'Follow-up scheduled for Aug 28', actor: 'Sarah Chen' },
];

const TX_TYPE_COLOR: Record<string, string> = { deposit: '#22c55e', withdrawal: '#ef4444', trade: '#F5C400', fee: '#6b7280', transfer: '#627EEA' };

export default function AdminCustomerDetailContent({ customerId }: { customerId: string }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [notes, setNotes] = useState(MOCK_NOTES);
  const [notifSent, setNotifSent] = useState<string | null>(null);
  const c = MOCK_CUSTOMER;

  const addNote = () => {
    if (!newNote.trim()) return;
    setNotes(prev => [{ id: `n${Date.now()}`, author: 'Admin', time: new Date().toISOString().replace('T', ' ').slice(0, 16), text: newNote }, ...prev]);
    setNewNote('');
  };

  const handleConfirmDeposit = async (amount: number) => {
    await notificationService.notifyDepositConfirmed(
      { id: c.id, email: c.email, name: `${c.firstName} ${c.lastName}` },
      amount
    );
    setNotifSent(`Deposit confirmation email sent to ${c.email}`);
    setTimeout(() => setNotifSent(null), 4000);
  };

  const handleWithdrawalStatus = async (status: 'pending' | 'approved' | 'rejected', amount: number) => {
    await notificationService.notifyWithdrawalStatus(
      { id: c.id, email: c.email, name: `${c.firstName} ${c.lastName}` },
      status, amount
    );
    setNotifSent(`Withdrawal ${status} notification sent to ${c.email}`);
    setTimeout(() => setNotifSent(null), 4000);
  };

  const handleProfileUpdate = async (fields: string) => {
    await notificationService.notifyProfileUpdated(
      { id: c.id, email: c.email, name: `${c.firstName} ${c.lastName}` },
      fields
    );
    setNotifSent(`Profile update notification sent to ${c.email}`);
    setTimeout(() => setNotifSent(null), 4000);
  };

  const handleKYCApprove = async () => {
    await notificationService.notifyKYCApproved(
      { id: c.id, email: c.email, name: `${c.firstName} ${c.lastName}` }
    );
    setNotifSent(`KYC approval notification & email sent to ${c.email}`);
    setTimeout(() => setNotifSent(null), 4000);
  };

  const handleKYCReject = async (reason: string) => {
    await notificationService.notifyKYCRejected(
      { id: c.id, email: c.email, name: `${c.firstName} ${c.lastName}` },
      reason
    );
    setNotifSent(`KYC rejection notification sent to ${c.email}`);
    setTimeout(() => setNotifSent(null), 4000);
  };

  return (
    <div className="space-y-4">
      {/* Notification sent toast */}
      {notifSent && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium" style={{ backgroundColor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e' }}>
          <CheckCircle size={13} />
          {notifSent}
        </div>
      )}

      {/* Header */}
      <PageHeader
        title={`${c.firstName} ${c.lastName}`}
        subtitle={`Customer ID: ${customerId} · Registered ${c.registrationDate}`}
        actions={
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.onlineStatus === 'online' ? '#22c55e' : '#6b7280' }} />
              <span className="text-xs capitalize" style={{ color: 'var(--muted-foreground)' }}>{c.onlineStatus}</span>
            </div>
            <ActionButton onClick={() => setShowAssignModal(true)} variant="primary">Assign Agent</ActionButton>
            <ActionButton onClick={() => handleProfileUpdate('Account information')}>
              <Mail size={11} className="inline mr-1" />Send Notification
            </ActionButton>
            <ActionButton variant="danger">Suspend</ActionButton>
          </>
        }
      />

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Account Balance', value: c.accountBalance },
          { label: 'Total Deposits', value: c.totalDeposits },
          { label: 'Total Withdrawals', value: c.totalWithdrawals },
          { label: 'Verification', value: c.verificationStatus },
        ].map(s => (
          <Card key={s.label} padding="p-3">
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
            <p className="text-sm font-bold mt-1 capitalize" style={{ color: 'var(--foreground)' }}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b overflow-x-auto no-scrollbar" style={{ borderColor: 'var(--border)' }}>
        {TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className="text-xs px-3 py-2 whitespace-nowrap transition-colors shrink-0"
            style={{
              color: activeTab === tab ? 'var(--primary)' : 'var(--muted-foreground)',
              borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
            }}>
            {tab}
          </button>
        ))}
      </div>

      {/* ── Overview ── */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Customer Info</h3>
            <div className="space-y-2">
              {[
                ['Full Name', `${c.firstName} ${c.lastName}`],
                ['Email', c.email],
                ['Phone', c.phone],
                ['Country', c.country],
                ['Status', c.status],
                ['Assigned Agent', c.assignedAgent],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-xs">
                  <span style={{ color: 'var(--muted-foreground)' }}>{label}</span>
                  <span style={{ color: 'var(--foreground)' }}>{value}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Activity Timeline</h3>
            <div className="space-y-2">
              {TIMELINE.map((t, i) => (
                <div key={i} className="flex gap-3 text-xs">
                  <span className="shrink-0 font-mono" style={{ color: 'var(--primary)' }}>{t.time}</span>
                  <div>
                    <span style={{ color: 'var(--foreground)' }}>{t.event}</span>
                    <span className="ml-2" style={{ color: 'var(--muted-foreground)' }}>· {t.actor}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── Profile ── */}
      {activeTab === 'Profile' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Personal Details</h3>
            <div className="space-y-2">
              {[
                ['Full Name', `${c.firstName} ${c.lastName}`],
                ['Date of Birth', c.dateOfBirth],
                ['Nationality', c.nationality],
                ['Email', c.email],
                ['Phone', c.phone],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-xs">
                  <span style={{ color: 'var(--muted-foreground)' }}>{label}</span>
                  <span style={{ color: 'var(--foreground)' }}>{value}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Address & Employment</h3>
            <div className="space-y-2">
              {[
                ['Address', c.address],
                ['City', c.city],
                ['Postal Code', c.postalCode],
                ['Country', c.country],
                ['Occupation', c.occupation],
                ['Employer', c.employerName],
                ['Annual Income', c.annualIncome],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-xs">
                  <span style={{ color: 'var(--muted-foreground)' }}>{label}</span>
                  <span style={{ color: 'var(--foreground)' }}>{value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── Attribution ── */}
      {activeTab === 'Attribution' && (
        <Card>
          <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Registration Attribution</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              ['Source', c.source], ['Affiliate', c.affiliate], ['Campaign', c.campaign],
              ['UTM Source', c.utm_source], ['UTM Medium', c.utm_medium], ['UTM Campaign', c.utm_campaign],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
                <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--foreground)' }}>{value || '—'}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Account ── */}
      {activeTab === 'Account' && (
        <Card>
          <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Account Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              ['Available Balance', c.accountBalance], ['Total Deposits', c.totalDeposits], ['Total Withdrawals', c.totalWithdrawals],
              ['Account Status', c.status], ['Verification', c.verificationStatus], ['Tags', c.tags.join(', ')],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
                <p className="text-sm font-medium mt-0.5 capitalize" style={{ color: 'var(--foreground)' }}>{value}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Transactions ── */}
      {activeTab === 'Transactions' && (
        <Card padding="p-0">
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Transaction History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Reference', 'Type', 'Amount', 'Currency', 'Status', 'Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-2 text-left font-medium" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {MOCK_TRANSACTIONS.map(tx => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-4 py-2 font-mono" style={{ color: 'var(--muted-foreground)' }}>{tx.ref}</td>
                    <td className="px-4 py-2">
                      <span className="px-2 py-0.5 rounded text-xs font-medium capitalize" style={{ backgroundColor: `${TX_TYPE_COLOR[tx.type]}20`, color: TX_TYPE_COLOR[tx.type] }}>{tx.type}</span>
                    </td>
                    <td className="px-4 py-2 font-semibold" style={{ color: tx.amount.startsWith('+') ? '#22c55e' : '#ef4444' }}>{tx.amount}</td>
                    <td className="px-4 py-2" style={{ color: 'var(--muted-foreground)' }}>{tx.currency}</td>
                    <td className="px-4 py-2"><StatusBadge status={tx.status} /></td>
                    <td className="px-4 py-2" style={{ color: 'var(--muted-foreground)' }}>{tx.date}</td>
                    <td className="px-4 py-2">
                      {tx.type === 'deposit' && tx.status !== 'completed' && (
                        <button
                          onClick={() => handleConfirmDeposit(parseFloat(tx.amount.replace(/[^0-9.]/g, '')))}
                          className="text-xs px-2 py-1 rounded font-medium transition-all"
                          style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}
                        >
                          Confirm
                        </button>
                      )}
                      {tx.type === 'withdrawal' && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleWithdrawalStatus('pending', parseFloat(tx.amount.replace(/[^0-9.]/g, '')))}
                            className="text-xs px-2 py-1 rounded font-medium transition-all"
                            style={{ backgroundColor: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.25)' }}
                          >
                            Pending
                          </button>
                          <button
                            onClick={() => handleWithdrawalStatus('approved', parseFloat(tx.amount.replace(/[^0-9.]/g, '')))}
                            className="text-xs px-2 py-1 rounded font-medium transition-all"
                            style={{ backgroundColor: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}
                          >
                            Approve
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ── Trading ── */}
      {activeTab === 'Trading' && (
        <div className="space-y-4">
          <Card padding="p-0">
            <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Open Positions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Symbol', 'Side', 'Entry', 'Current', 'Size', 'P&L', 'P&L %'].map(h => (
                      <th key={h} className="px-4 py-2 text-left font-medium" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MOCK_POSITIONS.map((p, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="px-4 py-2 font-semibold" style={{ color: 'var(--foreground)' }}>{p.symbol}</td>
                      <td className="px-4 py-2"><span className="px-2 py-0.5 rounded capitalize" style={{ backgroundColor: p.side === 'long' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: p.side === 'long' ? '#22c55e' : '#ef4444' }}>{p.side}</span></td>
                      <td className="px-4 py-2" style={{ color: 'var(--muted-foreground)' }}>{p.entry}</td>
                      <td className="px-4 py-2" style={{ color: 'var(--foreground)' }}>{p.current}</td>
                      <td className="px-4 py-2" style={{ color: 'var(--muted-foreground)' }}>{p.size}</td>
                      <td className="px-4 py-2 font-semibold" style={{ color: p.pnl.startsWith('+') ? '#22c55e' : '#ef4444' }}>{p.pnl}</td>
                      <td className="px-4 py-2 font-semibold" style={{ color: p.pnlPct.startsWith('+') ? '#22c55e' : '#ef4444' }}>{p.pnlPct}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ── Verification (KYC) ── */}
      {activeTab === 'Verification' && (
        <div className="space-y-4">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>KYC Verification Status</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleKYCApprove}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all active:scale-95"
                  style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.3)' }}
                >
                  <CheckCircle size={11} /> Approve KYC
                </button>
                <button
                  onClick={() => handleKYCReject('Documents require re-submission')}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-semibold transition-all active:scale-95"
                  style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}
                >
                  Reject KYC
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {KYC_STEPS.map((step, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--background)' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>✓</div>
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{step.step}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Completed {step.completedAt}</p>
                    </div>
                  </div>
                  <StatusBadge status={step.status} />
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Submitted Documents</h3>
            <div className="space-y-2">
              {[
                { doc: 'Passport', status: 'verified', submitted: '2026-08-21 10:00' },
                { doc: 'Proof of Address (Utility Bill)', status: 'verified', submitted: '2026-08-21 10:02' },
                { doc: 'Selfie with ID', status: 'verified', submitted: '2026-08-21 10:05' },
              ].map((d, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-2 rounded" style={{ backgroundColor: 'var(--background)' }}>
                  <span style={{ color: 'var(--foreground)' }}>{d.doc}</span>
                  <div className="flex items-center gap-3">
                    <span style={{ color: 'var(--muted-foreground)' }}>{d.submitted}</span>
                    <StatusBadge status={d.status} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── Communications ── */}
      {activeTab === 'Communications' && (
        <Card>
          <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Message History</h3>
          <div className="space-y-3">
            {MOCK_MESSAGES.map(msg => (
              <div key={msg.id} className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-xs">
                  <div className="px-3 py-2 rounded-lg text-xs" style={{
                    backgroundColor: msg.direction === 'outbound' ? 'rgba(245,196,0,0.15)' : 'var(--background)',
                    color: 'var(--foreground)',
                    border: '1px solid var(--border)',
                  }}>
                    {msg.text}
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)', textAlign: msg.direction === 'outbound' ? 'right' : 'left' }}>
                    {msg.from} · {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Tasks ── */}
      {activeTab === 'Tasks' && (
        <Card padding="p-0">
          <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Assigned Tasks</h3>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {MOCK_TASKS.map(task => (
              <div key={task.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{task.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Due {task.dueDate} · {task.assignedTo}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded capitalize" style={{
                    backgroundColor: task.priority === 'high' ? 'rgba(239,68,68,0.1)' : task.priority === 'medium' ? 'rgba(245,196,0,0.1)' : 'rgba(107,114,128,0.1)',
                    color: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? 'var(--primary)' : '#6b7280',
                  }}>{task.priority}</span>
                  <StatusBadge status={task.status} />
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Internal Notes ── */}
      {activeTab === 'Internal Notes' && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Add Note</h3>
            <textarea
              value={newNote}
              onChange={e => setNewNote(e.target.value)}
              rows={3}
              placeholder="Write an internal note..."
              className="w-full px-3 py-2 rounded-lg border text-xs outline-none focus:ring-1 resize-none"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
            <div className="flex justify-end mt-2">
              <ActionButton variant="primary" onClick={addNote}>Add Note</ActionButton>
            </div>
          </Card>
          <Card>
            <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Notes History</h3>
            <div className="space-y-3">
              {notes.map(note => (
                <div key={note.id} className="p-3 rounded-lg" style={{ backgroundColor: 'var(--background)' }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium" style={{ color: 'var(--primary)' }}>{note.author}</span>
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{note.time}</span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--foreground)' }}>{note.text}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* ── Activity ── */}
      {activeTab === 'Activity' && (
        <Card>
          <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Activity Timeline</h3>
          <div className="space-y-3">
            {TIMELINE.map((t, i) => (
              <div key={i} className="flex gap-3 text-xs items-start">
                <span className="shrink-0 font-mono w-12" style={{ color: 'var(--primary)' }}>{t.time}</span>
                <div className="flex-1 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                  <span style={{ color: 'var(--foreground)' }}>{t.event}</span>
                  <span className="ml-2" style={{ color: 'var(--muted-foreground)' }}>· {t.actor}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ── Security ── */}
      {activeTab === 'Security' && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Active Sessions</h3>
            <div className="space-y-2">
              {MOCK_SESSIONS.map(session => (
                <div key={session.id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: 'var(--background)' }}>
                  <div>
                    <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{session.device}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{session.ip} · {session.location} · {session.timestamp}</p>
                  </div>
                  <StatusBadge status={session.status} />
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Security Settings</h3>
            <div className="space-y-3">
              {[
                { label: '2FA Authentication', value: 'Enabled (Authenticator App)', status: 'active' },
                { label: 'Email Verification', value: 'Verified', status: 'verified' },
                { label: 'Phone Verification', value: 'Verified', status: 'verified' },
                { label: 'Last Password Change', value: '2026-07-15', status: 'active' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span style={{ color: 'var(--muted-foreground)' }}>{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span style={{ color: 'var(--foreground)' }}>{item.value}</span>
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {showAssignModal && <AssignAgentModal customerId={customerId} customerName={`${c.firstName} ${c.lastName}`} onClose={() => setShowAssignModal(false)} />}
    </div>
  );
}
