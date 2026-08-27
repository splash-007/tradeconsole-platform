'use client';
import React, { useEffect, useState } from 'react';
import { agentService, CallRecord } from '@/services/agent.service';
import { PageHeader, Card, AdminTable, StatusBadge, KpiCard } from '@/components/admin/AdminUI';

const AGENT_ID = 'agent-001';

const OUTCOME_LABELS: Record<string, string> = {
  connected: 'Connected', no_answer: 'No Answer', busy: 'Busy', call_back: 'Call Back',
  interested: 'Interested', not_interested: 'Not Interested', follow_up_required: 'Follow-up Required',
};

export default function AgentCallsContent() {
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { agentService.getCalls(AGENT_ID).then(d => { setCalls(d); setLoading(false); }); }, []);

  return (
    <div className="space-y-4">
      <PageHeader title="Call History" subtitle="Your call records — phone numbers are not displayed" />
      <div className="p-2 rounded border text-xs" style={{ borderColor: 'rgba(245,196,0,0.2)', backgroundColor: 'rgba(245,196,0,0.04)', color: 'var(--muted-foreground)' }}>
        🔒 Phone numbers are never displayed. Calls are initiated through the platform's secure calling service.
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Calls" value={calls.length} />
        <KpiCard label="Completed" value={calls.filter(c => c.status === 'completed').length} />
        <KpiCard label="Missed" value={calls.filter(c => c.status === 'missed').length} />
        <KpiCard label="Today" value={calls.filter(c => c.date.startsWith('2026-08-27')).length} />
      </div>
      <Card padding="p-0">
        <AdminTable
          columns={[
            { key: 'customerName', label: 'Customer' },
            { key: 'date', label: 'Date & Time' },
            { key: 'duration', label: 'Duration' },
            { key: 'direction', label: 'Direction', render: (c: CallRecord) => <span className="capitalize" style={{ color: 'var(--muted-foreground)' }}>{c.direction}</span> },
            { key: 'status', label: 'Status', render: (c: CallRecord) => <StatusBadge status={c.status} /> },
            { key: 'outcome', label: 'Outcome', render: (c: CallRecord) => <span style={{ color: 'var(--muted-foreground)' }}>{OUTCOME_LABELS[c.outcome] || c.outcome}</span> },
            { key: 'followUp', label: 'Follow-up', render: (c: CallRecord) => c.followUp || '—' },
          ]}
          data={calls}
          loading={loading}
        />
      </Card>
    </div>
  );
}
