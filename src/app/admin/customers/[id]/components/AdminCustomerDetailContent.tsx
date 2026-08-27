'use client';
import React, { useState } from 'react';
import { PageHeader, Card, ActionButton } from '@/components/admin/AdminUI';
import AssignAgentModal from './AssignAgentModal';

const MOCK_CUSTOMER = {
  id: 'cust-001', firstName: 'Alex', lastName: 'Morgan', email: 'alex.morgan@gmail.com',
  phone: '+44 7700 900100', country: 'United Kingdom', status: 'active',
  registrationDate: '2026-08-20 14:22', verificationStatus: 'verified',
  source: 'Google Ads', affiliate: 'AFF-0042', campaign: 'summer-2026',
  utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'summer-2026',
  assignedAgent: 'Sarah Chen', accountBalance: '$24,850.00',
  totalDeposits: '$35,000.00', totalWithdrawals: '$10,150.00',
  tags: ['VIP', 'High Value'], onlineStatus: 'online',
};

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

export default function AdminCustomerDetailContent({ customerId }: { customerId: string }) {
  const [activeTab, setActiveTab] = useState('Overview');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const c = MOCK_CUSTOMER;

  return (
    <div className="space-y-4">
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
            <ActionButton>Send Notification</ActionButton>
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
            <p className="text-sm font-bold mt-1" style={{ color: 'var(--foreground)' }}>{s.value}</p>
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

      {/* Tab content */}
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
                <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--foreground)' }}>{value}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

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

      {!['Overview', 'Attribution', 'Account', 'Activity'].includes(activeTab) && (
        <Card>
          <div className="text-center py-8">
            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>{activeTab}</p>
            <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>
              This section will be populated when the backend API is connected.
            </p>
          </div>
        </Card>
      )}

      {showAssignModal && <AssignAgentModal customerId={customerId} customerName={`${c.firstName} ${c.lastName}`} onClose={() => setShowAssignModal(false)} />}
    </div>
  );
}
