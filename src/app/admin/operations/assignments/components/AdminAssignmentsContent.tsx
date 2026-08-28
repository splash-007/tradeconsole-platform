'use client';
import React, { useState } from 'react';
import { X, UserPlus } from 'lucide-react';
import { PageHeader, Card, AdminTable, StatusBadge, KpiCard, ActionButton } from '@/components/admin/AdminUI';

interface Assignment {
  id: string;
  customerName: string;
  agentName: string;
  priority: string;
  taskType: string;
  dueDate: string;
  status: string;
  assignedAt: string;
  assignedBy: string;
}

const INITIAL_ASSIGNMENTS: Assignment[] = [
  { id: 'asgn-001', customerName: 'Alex Morgan', agentName: 'Sarah Chen', priority: 'high', taskType: 'call_customer', dueDate: '2026-08-27', status: 'in_progress', assignedAt: '2026-08-27 08:00', assignedBy: 'Admin' },
  { id: 'asgn-002', customerName: 'Aisha Al-Rashidi', agentName: 'Sarah Chen', priority: 'urgent', taskType: 'follow_up', dueDate: '2026-08-27', status: 'in_progress', assignedAt: '2026-08-27 07:30', assignedBy: 'Admin' },
  { id: 'asgn-003', customerName: 'Marcus Whitfield', agentName: 'James Park', priority: 'medium', taskType: 'verify_information', dueDate: '2026-08-28', status: 'pending', assignedAt: '2026-08-26 15:00', assignedBy: 'James Park' },
  { id: 'asgn-004', customerName: 'Thomas Bergmann', agentName: 'Sarah Chen', priority: 'medium', taskType: 'contact_customer', dueDate: '2026-08-27', status: 'pending', assignedAt: '2026-08-26 18:00', assignedBy: 'Admin' },
  { id: 'asgn-005', customerName: 'Priya Sharma', agentName: 'Sarah Chen', priority: 'low', taskType: 'review_registration', dueDate: '2026-08-26', status: 'overdue', assignedAt: '2026-08-25 10:00', assignedBy: 'Admin' },
];

const AGENTS = ['Sarah Chen', 'James Park', 'Maria Garcia', 'David Kim', 'Emma Wilson'];
const CUSTOMERS = ['Alex Morgan', 'Aisha Al-Rashidi', 'Marcus Whitfield', 'Thomas Bergmann', 'Priya Sharma', 'Elena Vasquez', 'Kenji Tanaka'];
const TASK_TYPES = ['call_customer', 'follow_up', 'verify_information', 'contact_customer', 'review_registration', 'send_documents', 'schedule_meeting'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

function NewAssignmentModal({ onClose, onSave }: { onClose: () => void; onSave: (a: Assignment) => void }) {
  const [form, setForm] = useState({
    customerName: '',
    agentName: '',
    priority: 'medium',
    taskType: 'call_customer',
    dueDate: new Date().toISOString().slice(0, 10),
    notes: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!form.customerName || !form.agentName) {
      setError('Customer and Agent are required.');
      return;
    }
    const now = new Date();
    const newAssignment: Assignment = {
      id: `asgn-${Date.now()}`,
      customerName: form.customerName,
      agentName: form.agentName,
      priority: form.priority,
      taskType: form.taskType,
      dueDate: form.dueDate,
      status: 'pending',
      assignedAt: `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`,
      assignedBy: 'Admin',
    };
    onSave(newAssignment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-md rounded-xl border shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <UserPlus size={16} style={{ color: 'var(--primary)' }} />
            <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>New Assignment</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-white/5" style={{ color: 'var(--muted-foreground)' }}>
            <X size={16} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3">
          {error && (
            <p className="text-xs px-3 py-2 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>{error}</p>
          )}

          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Customer *</label>
            <select
              value={form.customerName}
              onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
              className="w-full text-xs px-3 py-2 rounded border outline-none"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            >
              <option value="">Select customer...</option>
              {CUSTOMERS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Assign to Agent *</label>
            <select
              value={form.agentName}
              onChange={e => setForm(f => ({ ...f, agentName: e.target.value }))}
              className="w-full text-xs px-3 py-2 rounded border outline-none"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            >
              <option value="">Select agent...</option>
              {AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Task Type</label>
              <select
                value={form.taskType}
                onChange={e => setForm(f => ({ ...f, taskType: e.target.value }))}
                className="w-full text-xs px-3 py-2 rounded border outline-none"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                {TASK_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Priority</label>
              <select
                value={form.priority}
                onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                className="w-full text-xs px-3 py-2 rounded border outline-none"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Due Date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
              className="w-full text-xs px-3 py-2 rounded border outline-none"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
          </div>

          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Add any notes..."
              rows={2}
              className="w-full text-xs px-3 py-2 rounded border outline-none resize-none"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <ActionButton onClick={onClose}>Cancel</ActionButton>
          <ActionButton variant="primary" onClick={handleSubmit}>Create Assignment</ActionButton>
        </div>
      </div>
    </div>
  );
}

export default function AdminAssignmentsContent() {
  const [assignments, setAssignments] = useState<Assignment[]>(INITIAL_ASSIGNMENTS);
  const [showModal, setShowModal] = useState(false);

  const handleSave = (newAssignment: Assignment) => {
    setAssignments(prev => [newAssignment, ...prev]);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Assignments"
        subtitle="Customer-agent assignment management"
        actions={
          <ActionButton variant="primary" onClick={() => setShowModal(true)}>
            <span className="flex items-center gap-1.5"><UserPlus size={12} /> New Assignment</span>
          </ActionButton>
        }
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Active" value={assignments.filter(a => a.status !== 'completed').length} />
        <KpiCard label="Overdue" value={assignments.filter(a => a.status === 'overdue').length} />
        <KpiCard label="Pending" value={assignments.filter(a => a.status === 'pending').length} />
        <KpiCard label="In Progress" value={assignments.filter(a => a.status === 'in_progress').length} />
      </div>
      <Card padding="p-0">
        <AdminTable
          columns={[
            { key: 'customerName', label: 'Customer' },
            { key: 'agentName', label: 'Agent' },
            { key: 'priority', label: 'Priority', render: (r: Assignment) => <StatusBadge status={r.priority} /> },
            { key: 'taskType', label: 'Task', render: (r: Assignment) => <span style={{ color: 'var(--muted-foreground)' }}>{r.taskType.replace(/_/g, ' ')}</span> },
            { key: 'dueDate', label: 'Due' },
            { key: 'status', label: 'Status', render: (r: Assignment) => <StatusBadge status={r.status} /> },
            { key: 'assignedAt', label: 'Assigned' },
            { key: 'assignedBy', label: 'By' },
          ]}
          data={assignments}
        />
      </Card>

      {showModal && (
        <NewAssignmentModal onClose={() => setShowModal(false)} onSave={handleSave} />
      )}
    </div>
  );
}
