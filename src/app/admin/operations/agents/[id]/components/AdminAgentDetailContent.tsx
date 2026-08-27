'use client';
import React, { useEffect, useState } from 'react';
import { agentService, Agent, AgentPermissions } from '@/services/agent.service';
import { PageHeader, Card, StatusBadge, ActionButton, KpiCard } from '@/components/admin/AdminUI';

export default function AdminAgentDetailContent({ agentId }: { agentId: string }) {
  const [agent, setAgent] = useState<Agent | null>(null);
  const [permissions, setPermissions] = useState<AgentPermissions | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    agentService.getAgent(agentId).then(a => {
      setAgent(a);
      if (a) setPermissions({ ...a.permissions });
    });
  }, [agentId]);

  const handleSave = async () => {
    if (!permissions) return;
    setSaving(true);
    await agentService.updateAgentPermissions(agentId, permissions);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!agent) return <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Loading...</div>;

  const STATUS_DOT: Record<string, string> = { online: '#22c55e', busy: '#F5C400', away: '#f59e0b', offline: '#6b7280' };

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${agent.firstName} ${agent.lastName}`}
        subtitle={`${agent.role} · ${agent.email}`}
        actions={
          <>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_DOT[agent.status] }} />
              <StatusBadge status={agent.status} />
            </div>
            <ActionButton variant="danger">Suspend</ActionButton>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Assigned Customers" value={agent.assignedCustomers} />
        <KpiCard label="Open Tasks" value={agent.openTasks} />
        <KpiCard label="Calls Today" value={agent.callsToday} />
        <KpiCard label="Unread Messages" value={agent.unreadConversations} />
      </div>

      <Card>
        <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Agent Permissions</h3>
        <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
          These are role-level permissions. Assignment-specific permissions can be set when assigning a customer.
          <span className="ml-1 font-medium" style={{ color: '#ef4444' }}>Backend enforces all permissions server-side.</span>
        </p>
        {permissions && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(permissions).map(([key, val]) => (
              <label key={key} className="flex items-center gap-3 cursor-pointer p-2 rounded border transition-colors hover:bg-white/3"
                style={{ borderColor: 'var(--border)' }}>
                <input type="checkbox" checked={val}
                  onChange={e => setPermissions(p => p ? { ...p, [key]: e.target.checked } : p)}
                  className="w-3.5 h-3.5" />
                <div className="flex-1">
                  <span className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>
                    {key.replace(/([A-Z])/g, ' $1').replace('can ', 'Can ').trim()}
                  </span>
                  {(key === 'canViewEmail' || key === 'canViewPhone') && (
                    <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>PII</span>
                  )}
                </div>
                <span className="text-xs" style={{ color: val ? '#22c55e' : 'var(--muted-foreground)' }}>{val ? 'Allowed' : 'Denied'}</span>
              </label>
            ))}
          </div>
        )}
        <div className="flex gap-2 mt-4">
          <ActionButton variant="primary" onClick={handleSave}>
            {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Permissions'}
          </ActionButton>
        </div>
      </Card>
    </div>
  );
}
