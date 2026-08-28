'use client';
import React, { useEffect, useState } from 'react';
import { platformService, PlatformAssignment } from '@/services/platform.service';
import { PageHeader, Card, StatusBadge, KpiCard, ActionButton } from '@/components/admin/AdminUI';
import { X, UserPlus, History, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { RoleId } from '@/lib/rbac';
import { ROLE_DISPLAY_NAMES } from '@/lib/rbac';

const STAFF_LIST = [
  { id: 'broker-001', name: 'James Park', role: 'broker' as RoleId },
  { id: 'broker-002', name: 'Emma Wilson', role: 'broker' as RoleId },
  { id: 'ftd-001', name: 'Carlos Mendez', role: 'ftd_broker' as RoleId },
  { id: 'ret-001', name: 'Maria Santos', role: 'retention_broker' as RoleId },
  { id: 'comp-001', name: 'Yuki Tanaka', role: 'compliance_broker' as RoleId },
  { id: 'op-001', name: 'Anna Kowalski', role: 'operator' as RoleId },
];
const CUSTOMERS = [
  { id: 'cust-001', name: 'Alex Morgan', country: 'United Kingdom', status: 'active' },
  { id: 'cust-002', name: 'Marcus Whitfield', country: 'United Kingdom', status: 'verified' },
  { id: 'cust-003', name: 'Priya Sharma', country: 'India', status: 'active' },
  { id: 'cust-004', name: 'Aisha Al-Rashidi', country: 'UAE', status: 'active' },
  { id: 'cust-005', name: 'Thomas Bergmann', country: 'Germany', status: 'pending' },
];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

function AssignmentHistoryModal({ assignment, onClose }: { assignment: PlatformAssignment; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
      <div className="w-full max-w-lg rounded-xl border shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <History size={15} style={{ color: 'var(--primary)' }} />
            <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Assignment History — {assignment.customerName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-white/5" style={{ color: 'var(--muted-foreground)' }}><X size={15} /></button>
        </div>
        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Current state */}
          <div className="rounded border p-3" style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(var(--primary-rgb),0.04)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>Current Assignment</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{assignment.assignedToName}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{ROLE_DISPLAY_NAMES[assignment.assignedToRole] || assignment.assignedToRole}</p>
              </div>
              <StatusBadge status={assignment.status} />
            </div>
          </div>

          {/* History timeline */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--muted-foreground)' }}>Assignment History</p>
            <div className="space-y-3">
              {assignment.history.map((entry, idx) => (
                <div key={entry.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ backgroundColor: idx === assignment.history.length - 1 ? 'var(--primary)' : 'var(--muted-foreground)' }} />
                    {idx < assignment.history.length - 1 && <div className="w-px flex-1 mt-1" style={{ backgroundColor: 'var(--border)' }} />}
                  </div>
                  <div className="pb-3 flex-1">
                    <p className="text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>{entry.timestamp}</p>
                    <p className="text-xs font-medium mt-0.5" style={{ color: 'var(--foreground)' }}>
                      {entry.fromStaffName ? `Reassigned from ${entry.fromStaffName} to ` : 'Assigned to '}
                      {entry.toStaffName}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      {ROLE_DISPLAY_NAMES[entry.toStaffRole] || entry.toStaffRole} · by {entry.changedByName}
                    </p>
                    {entry.reason && (
                      <p className="text-xs mt-0.5 italic" style={{ color: 'var(--muted-foreground)' }}>Reason: {entry.reason}</p>
                    )}
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

function NewAssignmentModal({ onClose, onSave }: { onClose: () => void; onSave: (a: PlatformAssignment) => void }) {
  const [form, setForm] = useState({ customerId: '', staffId: '', priority: 'medium', notes: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const selectStyle = { backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' };

  const handleSubmit = async () => {
    if (!form.customerId || !form.staffId) { setError('Customer and staff member are required.'); return; }
    setSaving(true);
    const customer = CUSTOMERS.find(c => c.id === form.customerId)!;
    const staff = STAFF_LIST.find(s => s.id === form.staffId)!;
    const assignment = await platformService.createAssignment({
      customerId: customer.id, customerName: customer.name, customerCountry: customer.country,
      customerStatus: customer.status, assignedToId: staff.id, assignedToName: staff.name,
      assignedToRole: staff.role, assignedById: 'admin-001', assignedByName: 'Admin',
      status: 'active', priority: form.priority as PlatformAssignment['priority'], notes: form.notes,
    }, 'admin-001', 'Admin', 'admin');
    onSave(assignment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
      <div className="w-full max-w-md rounded-xl border shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <UserPlus size={15} style={{ color: 'var(--primary)' }} />
            <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>New Assignment</p>
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
              {CUSTOMERS.map(c => <option key={c.id} value={c.id}>{c.name} ({c.country})</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Assign To *</label>
            <select value={form.staffId} onChange={e => setForm(f => ({ ...f, staffId: e.target.value }))}
              className="w-full text-xs px-3 py-2 rounded border outline-none" style={selectStyle}>
              <option value="">Select staff member...</option>
              {STAFF_LIST.map(s => <option key={s.id} value={s.id}>{s.name} — {ROLE_DISPLAY_NAMES[s.role]}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Priority</label>
            <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
              className="w-full text-xs px-3 py-2 rounded border outline-none" style={selectStyle}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Notes (optional)</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2} className="w-full text-xs px-3 py-2 rounded border outline-none resize-none" style={selectStyle} />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-5 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <ActionButton onClick={onClose}>Cancel</ActionButton>
          <ActionButton variant="primary" onClick={handleSubmit}>{saving ? 'Assigning…' : 'Create Assignment'}</ActionButton>
        </div>
      </div>
    </div>
  );
}

export default function AdminAssignmentsContent() {
  const [assignments, setAssignments] = useState<PlatformAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [historyAssignment, setHistoryAssignment] = useState<PlatformAssignment | null>(null);

  useEffect(() => {
    platformService.getAssignments().then(d => { setAssignments(d); setLoading(false); });
  }, []);

  // Subscribe to real-time assignment updates
  useEffect(() => {
    const unsub = platformService.subscribe(event => {
      if (event.type === 'assignment_created' || event.type === 'assignment_updated') {
        platformService.getAssignments().then(setAssignments);
      }
    });
    return unsub;
  }, []);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Assignments"
        subtitle="Customer-to-staff assignments with full history and audit trail"
        actions={
          <ActionButton variant="primary" onClick={() => setShowModal(true)}>
            <span className="flex items-center gap-1.5"><UserPlus size={12} /> New Assignment</span>
          </ActionButton>
        }
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Active" value={assignments.filter(a => a.status === 'active').length} />
        <KpiCard label="Urgent" value={assignments.filter(a => a.priority === 'urgent').length} />
        <KpiCard label="High Priority" value={assignments.filter(a => a.priority === 'high').length} />
        <KpiCard label="Reassigned" value={assignments.filter(a => a.history.length > 1).length} />
      </div>
      <Card padding="p-0">
        {loading ? (
          <div className="animate-pulse space-y-2 p-4">
            {Array.from({ length: 5 }, (_, i) => <div key={i} className="h-8 rounded" style={{ backgroundColor: 'var(--muted)' }} />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Customer', 'Country', 'Assigned To', 'Role', 'Priority', 'Status', 'Assigned By', 'Assigned At', 'History', ''].map(h => (
                    <th key={h} className="text-left px-3 py-2 font-semibold uppercase tracking-wider whitespace-nowrap"
                      style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assignments.map((a, idx) => (
                  <tr key={a.id} className="hover:bg-white/3 transition-colors"
                    style={{ borderBottom: '1px solid var(--border)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td className="px-3 py-2.5">
                      <Link href={`/admin/customers/${a.customerId}`} className="font-medium hover:underline flex items-center gap-1" style={{ color: 'var(--primary)' }}>
                        {a.customerName} <ExternalLink size={10} />
                      </Link>
                    </td>
                    <td className="px-3 py-2.5" style={{ color: 'var(--muted-foreground)' }}>{a.customerCountry}</td>
                    <td className="px-3 py-2.5 font-medium" style={{ color: 'var(--foreground)' }}>{a.assignedToName}</td>
                    <td className="px-3 py-2.5 capitalize" style={{ color: 'var(--muted-foreground)' }}>{ROLE_DISPLAY_NAMES[a.assignedToRole] || a.assignedToRole}</td>
                    <td className="px-3 py-2.5"><StatusBadge status={a.priority} /></td>
                    <td className="px-3 py-2.5"><StatusBadge status={a.status} /></td>
                    <td className="px-3 py-2.5" style={{ color: 'var(--muted-foreground)' }}>{a.assignedByName}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap font-mono" style={{ color: 'var(--muted-foreground)' }}>{a.assignedAt}</td>
                    <td className="px-3 py-2.5">
                      <button onClick={() => setHistoryAssignment(a)}
                        className="flex items-center gap-1 text-xs px-2 py-0.5 rounded border hover:bg-white/5 transition-colors"
                        style={{ borderColor: 'var(--border)', color: a.history.length > 1 ? 'var(--primary)' : 'var(--muted-foreground)' }}>
                        <History size={10} /> {a.history.length}
                      </button>
                    </td>
                    <td className="px-3 py-2.5">
                      {a.notes && (
                        <span className="text-xs truncate max-w-24 block" style={{ color: 'var(--muted-foreground)' }}>{a.notes}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showModal && <NewAssignmentModal onClose={() => setShowModal(false)} onSave={a => setAssignments(prev => [a, ...prev])} />}
      {historyAssignment && <AssignmentHistoryModal assignment={historyAssignment} onClose={() => setHistoryAssignment(null)} />}
    </div>
  );
}
