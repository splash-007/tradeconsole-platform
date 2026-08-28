'use client';
import React, { useEffect, useState } from 'react';
import { platformService, PlatformTask } from '@/services/platform.service';
import { PageHeader, Card, StatusBadge, KpiCard, ActionButton } from '@/components/admin/AdminUI';
import { X, ClipboardPlus, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const TASK_TYPES = ['call_customer', 'follow_up', 'verify_information', 'contact_customer', 'review_registration', 'send_documents', 'schedule_meeting'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const STAFF_LIST = [
  { id: 'broker-001', name: 'James Park', role: 'broker' as const },
  { id: 'broker-002', name: 'Emma Wilson', role: 'broker' as const },
  { id: 'ftd-001', name: 'Carlos Mendez', role: 'ftd_broker' as const },
  { id: 'ret-001', name: 'Maria Santos', role: 'retention_broker' as const },
  { id: 'comp-001', name: 'Yuki Tanaka', role: 'compliance_broker' as const },
];
const CUSTOMERS = [
  { id: 'cust-001', name: 'Alex Morgan', country: 'United Kingdom' },
  { id: 'cust-002', name: 'Marcus Whitfield', country: 'United Kingdom' },
  { id: 'cust-003', name: 'Priya Sharma', country: 'India' },
  { id: 'cust-004', name: 'Aisha Al-Rashidi', country: 'UAE' },
  { id: 'cust-005', name: 'Thomas Bergmann', country: 'Germany' },
];

function TaskDetailModal({ task, onClose }: { task: PlatformTask; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
      <div className="w-full max-w-lg rounded-xl border shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Task Detail</p>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-white/5" style={{ color: 'var(--muted-foreground)' }}><X size={15} /></button>
        </div>
        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Task ID', task.id],
              ['Type', task.type.replace(/_/g, ' ')],
              ['Status', task.status],
              ['Priority', task.priority],
              ['Due Date', task.dueDate],
              ['Created', task.createdAt],
              ['Updated', task.updatedAt],
              ['Completed', task.completedAt || '—'],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs mb-0.5" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
                <p className="text-xs font-medium capitalize" style={{ color: 'var(--foreground)' }}>{value}</p>
              </div>
            ))}
          </div>

          <div className="rounded border p-3 space-y-2" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Customer</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{task.customerName}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{task.customerCountry} · ID: {task.customerId}</p>
              </div>
              <Link href={`/admin/customers/${task.customerId}`} className="flex items-center gap-1 text-xs" style={{ color: 'var(--primary)' }}>
                <ExternalLink size={11} /> View
              </Link>
            </div>
          </div>

          <div className="rounded border p-3 space-y-2" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Assignment</p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Assigned To</p>
                <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{task.assignedToName}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{task.assignedToRole.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Manager</p>
                <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{task.managerName || '—'}</p>
              </div>
              <div>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Created By</p>
                <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{task.createdByName}</p>
              </div>
            </div>
          </div>

          {task.notes && (
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Notes</p>
              <p className="text-xs" style={{ color: 'var(--foreground)' }}>{task.notes}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>Activity Log</p>
            <div className="space-y-2">
              {task.activityLog.map(entry => (
                <div key={entry.id} className="flex gap-3 text-xs">
                  <span className="shrink-0 font-mono" style={{ color: 'var(--primary)' }}>{entry.timestamp}</span>
                  <div>
                    <span style={{ color: 'var(--foreground)' }}>{entry.action}</span>
                    {entry.previousStatus && entry.newStatus && (
                      <span style={{ color: 'var(--muted-foreground)' }}> · {entry.previousStatus} → {entry.newStatus}</span>
                    )}
                    <span className="ml-1" style={{ color: 'var(--muted-foreground)' }}>by {entry.actorName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end px-5 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <button onClick={onClose} className="text-xs px-4 py-2 rounded border hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>Close</button>
        </div>
      </div>
    </div>
  );
}

function CreateTaskModal({ onClose, onSave }: { onClose: () => void; onSave: (t: PlatformTask) => void }) {
  const [form, setForm] = useState({
    customerId: '', staffId: '', type: 'call_customer', priority: 'medium',
    dueDate: new Date().toISOString().slice(0, 10), notes: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.customerId || !form.staffId) { setError('Customer and staff member are required.'); return; }
    setSaving(true);
    const customer = CUSTOMERS.find(c => c.id === form.customerId)!;
    const staff = STAFF_LIST.find(s => s.id === form.staffId)!;
    const task = await platformService.createTask({
      customerId: customer.id, customerName: customer.name, customerCountry: customer.country,
      assignedToId: staff.id, assignedToName: staff.name, assignedToRole: staff.role,
      managerId: 'bm-001', managerName: 'Sarah Chen',
      createdById: 'admin-001', createdByName: 'Admin',
      type: form.type, status: 'pending', priority: form.priority as PlatformTask['priority'],
      dueDate: form.dueDate, notes: form.notes, completedAt: null,
    }, 'admin-001', 'Admin', 'admin');
    onSave(task);
    onClose();
  };

  const selectStyle = { backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
      <div className="w-full max-w-md rounded-xl border shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <ClipboardPlus size={15} style={{ color: 'var(--primary)' }} />
            <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Create Task</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-white/5" style={{ color: 'var(--muted-foreground)' }}><X size={15} /></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          {error && <p className="text-xs px-3 py-2 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>{error}</p>}
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Customer *</label>
            <select value={form.customerId} onChange={e => setForm(f => ({ ...f, customerId: e.target.value }))}
              className="w-full text-xs px-3 py-2 rounded border outline-none" style={selectStyle}>
              <option value="">Select customer...</option>
              {CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Assign To *</label>
            <select value={form.staffId} onChange={e => setForm(f => ({ ...f, staffId: e.target.value }))}
              className="w-full text-xs px-3 py-2 rounded border outline-none" style={selectStyle}>
              <option value="">Select staff member...</option>
              {STAFF_LIST.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role.replace(/_/g, ' ')})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Task Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full text-xs px-3 py-2 rounded border outline-none" style={selectStyle}>
                {TASK_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                className="w-full text-xs px-3 py-2 rounded border outline-none" style={selectStyle}>
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Due Date</label>
            <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
              className="w-full text-xs px-3 py-2 rounded border outline-none" style={selectStyle} />
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2} className="w-full text-xs px-3 py-2 rounded border outline-none resize-none" style={selectStyle} />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <ActionButton onClick={onClose}>Cancel</ActionButton>
          <ActionButton variant="primary" onClick={handleSubmit}>{saving ? 'Creating…' : 'Create Task'}</ActionButton>
        </div>
      </div>
    </div>
  );
}

export default function AdminTasksContent() {
  const [tasks, setTasks] = useState<PlatformTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<PlatformTask | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    platformService.getTasks().then(d => { setTasks(d); setLoading(false); });
  }, []);

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);
  const statuses = ['all', 'pending', 'in_progress', 'completed', 'overdue', 'cancelled'];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Tasks"
        subtitle="All tasks across the platform — connected to customers, staff, and managers"
        actions={
          <ActionButton variant="primary" onClick={() => setShowCreate(true)}>
            <span className="flex items-center gap-1.5"><ClipboardPlus size={12} /> Create Task</span>
          </ActionButton>
        }
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Tasks" value={tasks.length} />
        <KpiCard label="Overdue" value={tasks.filter(t => t.status === 'overdue').length} />
        <KpiCard label="In Progress" value={tasks.filter(t => t.status === 'in_progress').length} />
        <KpiCard label="Pending" value={tasks.filter(t => t.status === 'pending').length} />
      </div>
      <Card padding="p-0">
        <div className="flex gap-1 p-3 border-b overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
          {statuses.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className="text-xs px-2.5 py-1 rounded capitalize whitespace-nowrap transition-colors"
              style={{
                backgroundColor: filter === s ? 'var(--primary)' : 'transparent',
                color: filter === s ? '#000' : 'var(--muted-foreground)',
                border: `1px solid ${filter === s ? 'var(--primary)' : 'var(--border)'}`,
              }}>
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="animate-pulse space-y-2 p-4">
            {Array.from({ length: 5 }, (_, i) => <div key={i} className="h-8 rounded" style={{ backgroundColor: 'var(--muted)' }} />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Customer', 'Country', 'Type', 'Assigned To', 'Manager', 'Priority', 'Status', 'Due', 'Created By', ''].map(h => (
                    <th key={h} className="text-left px-3 py-2 font-semibold uppercase tracking-wider whitespace-nowrap"
                      style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-8" style={{ color: 'var(--muted-foreground)' }}>No tasks found</td></tr>
                ) : (
                  filtered.map((task, idx) => (
                    <tr key={task.id} className="hover:bg-white/3 transition-colors"
                      style={{ borderBottom: '1px solid var(--border)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <td className="px-3 py-2.5">
                        <Link href={`/admin/customers/${task.customerId}`} className="font-medium hover:underline" style={{ color: 'var(--primary)' }}>
                          {task.customerName}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5" style={{ color: 'var(--muted-foreground)' }}>{task.customerCountry}</td>
                      <td className="px-3 py-2.5 capitalize" style={{ color: 'var(--muted-foreground)' }}>{task.type.replace(/_/g, ' ')}</td>
                      <td className="px-3 py-2.5">
                        <div style={{ color: 'var(--foreground)' }}>{task.assignedToName}</div>
                        <div className="text-xs capitalize" style={{ color: 'var(--muted-foreground)' }}>{task.assignedToRole.replace(/_/g, ' ')}</div>
                      </td>
                      <td className="px-3 py-2.5" style={{ color: 'var(--muted-foreground)' }}>{task.managerName || '—'}</td>
                      <td className="px-3 py-2.5"><StatusBadge status={task.priority} /></td>
                      <td className="px-3 py-2.5"><StatusBadge status={task.status} /></td>
                      <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>{task.dueDate}</td>
                      <td className="px-3 py-2.5" style={{ color: 'var(--muted-foreground)' }}>{task.createdByName}</td>
                      <td className="px-3 py-2.5">
                        <button onClick={() => setSelectedTask(task)}
                          className="text-xs px-2 py-0.5 rounded border hover:bg-white/5 transition-colors"
                          style={{ borderColor: 'var(--border)', color: 'var(--primary)' }}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {selectedTask && <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} />}
      {showCreate && <CreateTaskModal onClose={() => setShowCreate(false)} onSave={t => setTasks(prev => [t, ...prev])} />}
    </div>
  );
}
