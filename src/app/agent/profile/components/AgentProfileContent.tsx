'use client';
import React from 'react';
import { PageHeader, Card } from '@/components/admin/AdminUI';

export default function AgentProfileContent() {
  return (
    <div className="space-y-4">
      <PageHeader title="My Profile" subtitle="Your agent account settings" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Profile Information</h3>
          <div className="space-y-3">
            {[
              ['First Name', 'Sarah'], ['Last Name', 'Chen'], ['Email', 'sarah.chen@cryptovault.app'],
              ['Role', 'Agent'], ['Status', 'Online'], ['Last Active', '2026-08-27 14:40'],
            ]?.map(([label, value]) => (
              <div key={label} className="flex justify-between text-xs py-1.5 border-b" style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--muted-foreground)' }}>{label}</span>
                <span style={{ color: 'var(--foreground)' }}>{value}</span>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>My Permissions</h3>
          <div className="space-y-2">
            {[
              { label: 'View Customer Country', granted: true },
              { label: 'View Account Data', granted: true },
              { label: 'View Verification Status', granted: true },
              { label: 'Call Customers', granted: true },
              { label: 'Chat with Customers', granted: true },
              { label: 'Add Internal Notes', granted: true },
              { label: 'View Customer Email', granted: false },
              { label: 'View Customer Phone', granted: false },
            ]?.map(p => (
              <div key={p?.label} className="flex items-center justify-between text-xs">
                <span style={{ color: 'var(--foreground)' }}>{p?.label}</span>
                <span style={{ color: p?.granted ? '#22c55e' : '#ef4444' }}>{p?.granted ? '✓ Allowed' : '✕ Denied'}</span>
              </div>
            ))}
          </div>
          <p className="text-xs mt-3" style={{ color: 'var(--muted-foreground)' }}>Contact your manager to request additional permissions.</p>
        </Card>
      </div>
    </div>
  );
}
