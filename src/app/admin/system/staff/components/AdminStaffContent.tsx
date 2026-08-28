'use client';
import React, { useEffect, useState } from 'react';
import { adminService, StaffMember } from '@/services/admin.service';
import { PageHeader, Card, AdminTable, StatusBadge, KpiCard, ActionButton } from '@/components/admin/AdminUI';
import { X, Search } from 'lucide-react';
import { ALL_ROLE_OPTIONS, ROLE_DISPLAY_NAMES, type RoleId } from '@/lib/rbac';

interface EditModalProps {
  member: StaffMember;
  onClose: () => void;
  onSave: (updated: StaffMember) => void;
  allStaff: StaffMember[];
}

function EditStaffModal({ member, onClose, onSave, allStaff }: EditModalProps) {
  const [form, setForm] = useState({ ...member });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Resolve manager name from selected managerId
    const mgr = allStaff.find(s => s.id === form.managerId);
    onSave({ ...form, managerName: mgr ? `${mgr.firstName} ${mgr.lastName}` : undefined });
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-lg rounded-xl border shadow-2xl overflow-y-auto max-h-[90vh]" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b sticky top-0" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{member.id.startsWith('staff-') ? 'Add' : 'Edit'} Staff Member</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/5"><X size={16} style={{ color: 'var(--muted-foreground)' }} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>First Name</label>
              <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-xs outline-none focus:ring-1"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }} required />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Last Name</label>
              <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-xs outline-none focus:ring-1"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }} required />
            </div>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Email</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border text-xs outline-none focus:ring-1"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }} required />
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Role</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border text-xs outline-none focus:ring-1"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
              {ALL_ROLE_OPTIONS.filter(r => r.value !== 'customer').map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Manager (optional)</label>
            <select value={form.managerId || ''} onChange={e => setForm(f => ({ ...f, managerId: e.target.value || undefined }))}
              className="w-full px-3 py-2 rounded-lg border text-xs outline-none focus:ring-1"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
              <option value="">— No Manager —</option>
              {allStaff.filter(s => s.id !== form.id).map(s => (
                <option key={s.id} value={s.id}>{s.firstName} {s.lastName} ({ROLE_DISPLAY_NAMES[s.role as RoleId] || s.role})</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Department</label>
              <input value={form.department || ''} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}
                placeholder="e.g. Sales"
                className="w-full px-3 py-2 rounded-lg border text-xs outline-none focus:ring-1"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Office</label>
              <input value={form.office || ''} onChange={e => setForm(f => ({ ...f, office: e.target.value }))}
                placeholder="e.g. London"
                className="w-full px-3 py-2 rounded-lg border text-xs outline-none focus:ring-1"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
            </div>
            <div>
              <label className="block text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Shift</label>
              <select value={form.shift || ''} onChange={e => setForm(f => ({ ...f, shift: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border text-xs outline-none focus:ring-1"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                <option value="">— Any —</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="night">Night</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as 'active' | 'suspended' | 'disabled' }))}
              className="w-full px-3 py-2 rounded-lg border text-xs outline-none focus:ring-1"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border text-xs font-medium transition-colors hover:bg-white/5"
              style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>Cancel</button>
            <button type="submit"
              className="flex-1 px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
              style={{ backgroundColor: 'var(--primary)', color: '#000' }}>Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const PRESENCE_COLORS: Record<string, string> = {
  online: '#22c55e', away: '#f59e0b', busy: '#ef4444', offline: '#6b7280',
};

export default function AdminStaffContent() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMember, setEditMember] = useState<StaffMember | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { adminService.getStaff().then(d => { setStaff(d); setLoading(false); }); }, []);

  const handleSave = (updated: StaffMember) => {
    setStaff(prev => {
      const exists = prev.find(s => s.id === updated.id);
      if (exists) return prev.map(s => s.id === updated.id ? updated : s);
      return [...prev, updated];
    });
  };

  const BLANK_MEMBER: StaffMember = {
    id: `staff-${Date.now()}`, firstName: '', lastName: '', email: '',
    role: 'broker', status: 'active', lastActive: '—', createdAt: new Date().toISOString().split('T')[0],
  };

  const filtered = staff.filter(s => {
    const name = `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase());
    const matchRole = !roleFilter || s.role === roleFilter;
    const matchStatus = !statusFilter || s.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const uniqueRoles = Array.from(new Set(staff.map(s => s.role)));

  return (
    <div className="space-y-4">
      <PageHeader
        title="Staff"
        subtitle="Platform staff management — all 23 roles"
        actions={<ActionButton variant="primary" onClick={() => setShowAddModal(true)}>Add Staff Member</ActionButton>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Staff" value={staff.length} />
        <KpiCard label="Active" value={staff.filter(s => s.status === 'active').length} />
        <KpiCard label="Suspended" value={staff.filter(s => s.status === 'suspended').length} />
        <KpiCard label="Roles Used" value={new Set(staff.map(s => s.role)).size} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email..."
            className="w-full pl-8 pr-3 py-2 rounded-lg border text-xs focus:outline-none"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => setRoleFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border text-xs focus:outline-none"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
        >
          <option value="">All Roles</option>
          {uniqueRoles.map(r => (
            <option key={r} value={r}>{ROLE_DISPLAY_NAMES[r as RoleId] || r}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-lg border text-xs focus:outline-none"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="disabled">Disabled</option>
        </select>
      </div>

      <Card padding="p-0">
        <AdminTable
          columns={[
            {
              key: 'name', label: 'Staff Member',
              render: (s: StaffMember) => (
                <div className="flex items-center gap-2">
                  <div className="relative shrink-0">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'rgba(245,196,0,0.15)', color: 'var(--primary)' }}>
                      {s.firstName[0]}{s.lastName[0]}
                    </div>
                    {s.presenceStatus && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border" style={{ backgroundColor: PRESENCE_COLORS[s.presenceStatus], borderColor: 'var(--card)' }} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-xs" style={{ color: 'var(--foreground)' }}>{s.firstName} {s.lastName}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.email}</p>
                  </div>
                </div>
              )
            },
            {
              key: 'role', label: 'Role',
              render: (s: StaffMember) => (
                <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(245,196,0,0.1)', color: 'var(--primary)' }}>
                  {ROLE_DISPLAY_NAMES[s.role as RoleId] || s.role}
                </span>
              )
            },
            {
              key: 'manager', label: 'Manager',
              render: (s: StaffMember) => (
                <span className="text-xs" style={{ color: s.managerName ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                  {s.managerName || '—'}
                </span>
              )
            },
            {
              key: 'department', label: 'Dept/Office',
              render: (s: StaffMember) => (
                <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {[s.department, s.office].filter(Boolean).join(' / ') || '—'}
                </span>
              )
            },
            { key: 'status', label: 'Status', render: (s: StaffMember) => <StatusBadge status={s.status} /> },
            { key: 'lastActive', label: 'Last Active', render: (s: StaffMember) => <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.lastActive}</span> },
            {
              key: 'actions', label: '',
              render: (s: StaffMember) => (
                <div className="flex gap-1">
                  <ActionButton onClick={() => setEditMember(s)}>Edit</ActionButton>
                </div>
              )
            },
          ]}
          data={filtered}
          loading={loading}
        />
      </Card>

      {editMember && (
        <EditStaffModal member={editMember} onClose={() => setEditMember(null)} onSave={handleSave} allStaff={staff} />
      )}
      {showAddModal && (
        <EditStaffModal
          member={BLANK_MEMBER}
          onClose={() => setShowAddModal(false)}
          onSave={handleSave}
          allStaff={staff}
        />
      )}
    </div>
  );
}
