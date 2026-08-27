'use client';
import React from 'react';
import { PageHeader, Card, ActionButton } from '@/components/admin/AdminUI';

const SETTINGS_SECTIONS = [
  {
    title: 'Platform', items: [
      { label: 'Platform Name', value: 'CryptoVault', type: 'text' },
      { label: 'Support Email', value: 'support@cryptovault.app', type: 'text' },
      { label: 'Default Currency', value: 'USD', type: 'text' },
      { label: 'Maintenance Mode', value: 'false', type: 'toggle' },
    ]
  },
  {
    title: 'Registration', items: [
      { label: 'Allow New Registrations', value: 'true', type: 'toggle' },
      { label: 'Require Email Verification', value: 'true', type: 'toggle' },
      { label: 'Require KYC Before Trading', value: 'true', type: 'toggle' },
      { label: 'Auto-assign Agent', value: 'false', type: 'toggle' },
    ]
  },
  {
    title: 'API Configuration', items: [
      { label: 'API Base URL', value: 'https://api.core-domain.com', type: 'text' },
      { label: 'Data Mode', value: 'mock', type: 'text' },
      { label: 'WebSocket URL', value: 'wss://api.core-domain.com/ws', type: 'text' },
    ]
  },
];

export default function AdminSettingsContent() {
  return (
    <div className="space-y-4">
      <PageHeader title="Settings" subtitle="Platform configuration and system settings" />
      <div className="p-3 rounded border text-xs" style={{ borderColor: 'rgba(245,196,0,0.3)', backgroundColor: 'rgba(245,196,0,0.05)', color: 'var(--muted-foreground)' }}>
        ⚠ Settings are read-only in mock mode. Connect to VPS API to persist changes.
      </div>
      {SETTINGS_SECTIONS?.map(section => (
        <Card key={section?.title}>
          <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>{section?.title}</h3>
          <div className="space-y-3">
            {section?.items?.map(item => (
              <div key={item?.label} className="flex items-center justify-between py-2 border-b" style={{ borderColor: 'var(--border)' }}>
                <span className="text-xs" style={{ color: 'var(--foreground)' }}>{item?.label}</span>
                <div className="flex items-center gap-2">
                  {item?.type === 'toggle' ? (
                    <span className="text-xs px-2 py-0.5 rounded" style={{
                      backgroundColor: item?.value === 'true' ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.08)',
                      color: item?.value === 'true' ? '#22c55e' : 'var(--muted-foreground)'
                    }}>{item?.value === 'true' ? 'Enabled' : 'Disabled'}</span>
                  ) : (
                    <span className="text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>{item?.value}</span>
                  )}
                  <ActionButton>Edit</ActionButton>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
