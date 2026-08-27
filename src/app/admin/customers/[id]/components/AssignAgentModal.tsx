'use client';
import React, { useState } from 'react';
import { ActionButton } from '@/components/admin/AdminUI';

const AGENTS = [
  { id: 'agent-001', name: 'Sarah Chen', status: 'online', assigned: 24 },
  { id: 'agent-002', name: 'James Park', status: 'busy', assigned: 18 },
  { id: 'agent-003', name: 'Maria Santos', status: 'away', assigned: 12 },
  { id: 'agent-004', name: 'David Kim', status: 'offline', assigned: 31 },
];

const STATUS_DOT: Record<string, string> = { online: '#22c55e', busy: '#F5C400', away: '#f59e0b', offline: '#6b7280' };

interface AssignAgentModalProps {
  customerId: string;
  customerName: string;
  onClose: () => void;
}

export default function AssignAgentModal({ customerId, customerName, onClose }: AssignAgentModalProps) {
  const [selectedAgent, setSelectedAgent] = useState('');
  const [priority, setPriority] = useState('medium');
  const [taskType, setTaskType] = useState('call_customer');
  const [dueDate, setDueDate] = useState('2026-08-27');
  const [notes, setNotes] = useState('');
  const [permissions, setPermissions] = useState({
    canViewCountry: true, canViewAccountData: true, canViewVerification: true,
    canCallCustomer: true, canChatWithCustomer: true, canAddInternalNotes: true,
    canViewEmail: false, canViewPhone: false,
  });

  const handleSubmit = () => {
    // BACKEND INTEGRATION: POST /api/v1/admin/assignments
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-lg rounded-xl border p-6 space-y-4 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Assign Agent</h2>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Customer: {customerName}</p>
          </div>
          <button onClick={onClose} className="text-xs" style={{ color: 'var(--muted-foreground)' }}>✕</button>
        </div>

        {/* Agent selection */}
        <div>
          <label className="text-xs font-medium block mb-2" style={{ color: 'var(--muted-foreground)' }}>Select Agent</label>
          <div className="space-y-1.5">
            {AGENTS.map(a => (
              <button key={a.id} onClick={() => setSelectedAgent(a.id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded border text-xs transition-colors"
                style={{
                  borderColor: selectedAgent === a.id ? 'var(--primary)' : 'var(--border)',
                  backgroundColor: selectedAgent === a.id ? 'rgba(245,196,0,0.08)' : 'transparent',
                  color: 'var(--foreground)',
                }}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: STATUS_DOT[a.status] }} />
                <span className="flex-1 text-left font-medium">{a.name}</span>
                <span style={{ color: 'var(--muted-foreground)' }}>{a.assigned} customers</span>
              </button>
            ))}
          </div>
        </div>

        {/* Priority & Task */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Priority</label>
            <select value={priority} onChange={e => setPriority(e.target.value)}
              className="w-full text-xs px-2 py-1.5 rounded border outline-none"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
              {['low', 'medium', 'high', 'urgent'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Task Type</label>
            <select value={taskType} onChange={e => setTaskType(e.target.value)}
              className="w-full text-xs px-2 py-1.5 rounded border outline-none"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
              {['call_customer', 'follow_up', 'review_registration', 'contact_customer', 'verify_information'].map(t => (
                <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Due Date</label>
          <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
            className="w-full text-xs px-2 py-1.5 rounded border outline-none"
            style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
        </div>

        <div>
          <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
            className="w-full text-xs px-2 py-1.5 rounded border outline-none resize-none"
            style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            placeholder="Assignment notes..." />
        </div>

        {/* Permissions */}
        <div>
          <label className="text-xs font-semibold block mb-2 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Agent Visibility Permissions</label>
          <div className="space-y-1.5">
            {Object.entries(permissions).map(([key, val]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={val} onChange={e => setPermissions(p => ({ ...p, [key]: e.target.checked }))}
                  className="w-3 h-3" />
                <span className="text-xs" style={{ color: val ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                  {key.replace(/([A-Z])/g, ' $1').replace('can ', 'Can ').trim()}
                </span>
                {(key === 'canViewEmail' || key === 'canViewPhone') && (
                  <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>PII</span>
                )}
              </label>
            ))}
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>
            ⚠ PII fields (phone/email) are hidden by default. Enable only when required. Backend enforces these permissions server-side.
          </p>
        </div>

        <div className="flex gap-2 pt-2">
          <ActionButton variant="primary" onClick={handleSubmit}>Assign Agent</ActionButton>
          <ActionButton onClick={onClose}>Cancel</ActionButton>
        </div>
      </div>
    </div>
  );
}
