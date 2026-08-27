'use client';
import React, { useEffect, useState } from 'react';
import { adminService, StaffMember } from '@/services/admin.service';
import { PageHeader, Card, AdminTable, StatusBadge, KpiCard, ActionButton } from '@/components/admin/AdminUI';
import { X } from 'lucide-react';

interface EditModalProps {
  member: StaffMember;
  onClose: () => void;
  onSave: (updated: StaffMember) => void;
}

function EditStaffModal({ member, onClose, onSave }: EditModalProps) {
  const [form, setForm] = useState({ ...member });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-md rounded-xl border shadow-2xl" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Edit Staff Member</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/5"><X size={16} style={{ color: 'var(--muted-foreground)' }} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
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
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="senior_agent">Senior Agent</option>
              <option value="agent">Agent</option>
              <option value="finance">Finance</option>
              <option value="compliance">Compliance</option>
              <option value="support">Support</option>
            </select>
          </div>
          <div>
            <label className="block text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as 'active' | 'suspended' }))}
              className="w-full px-3 py-2 rounded-lg border text-xs outline-none focus:ring-1"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
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

interface DeleteModalProps {
  member: StaffMember;
  onClose: () => void;
  onConfirm: () => void;
}

function DeleteStaffModal({ member, onClose, onConfirm }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-sm rounded-xl border shadow-2xl" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Remove Staff Member</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-white/5"><X size={16} style={{ color: 'var(--muted-foreground)' }} /></button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Are you sure you want to remove <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{member.firstName} {member.lastName}</span> from the platform? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <button onClick={onClose}
              className="flex-1 px-4 py-2 rounded-lg border text-xs font-medium transition-colors hover:bg-white/5"
              style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>Cancel</button>
            <button onClick={() => { onConfirm(); onClose(); }}
              className="flex-1 px-4 py-2 rounded-lg text-xs font-semibold transition-colors"
              style={{ backgroundColor: '#ef4444', color: '#fff' }}>Remove</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminStaffContent() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMember, setEditMember] = useState<StaffMember | null>(null);
  const [deleteMember, setDeleteMember] = useState<StaffMember | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => { adminService.getStaff().then(d => { setStaff(d); setLoading(false); }); }, []);

  const handleSave = (updated: StaffMember) => {
    setStaff(prev => prev.map(s => s.id === updated.id ? updated : s));
  };

  const handleDelete = (id: string) => {
    setStaff(prev => prev.filter(s => s.id !== id));
  };

  const BLANK_MEMBER: StaffMember = { id: `staff-${Date.now()}`, firstName: '', lastName: '', email: '', role: 'agent', status: 'active', lastActive: '—', createdAt: new Date().toISOString().split('T')[0] };

  return (
    <div className="space-y-4">
      <PageHeader title="Staff" subtitle="Platform staff management" actions={<ActionButton variant="primary" onClick={() => setShowAddModal(true)}>Add Staff Member</ActionButton>} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Staff" value={staff.length} />
        <KpiCard label="Active" value={staff.filter(s => s.status === 'active').length} />
        <KpiCard label="Suspended" value={staff.filter(s => s.status === 'suspended').length} />
        <KpiCard label="Roles" value={new Set(staff.map(s => s.role)).size} />
      </div>
      <Card padding="p-0">
        <AdminTable
          columns={[
            {
              key: 'name', label: 'Staff Member',
              render: (s: StaffMember) => (
                <div>
                  <p className="font-medium" style={{ color: 'var(--foreground)' }}>{s.firstName} {s.lastName}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.email}</p>
                </div>
              )
            },
            { key: 'role', label: 'Role', render: (s: StaffMember) => <span className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'rgba(245,196,0,0.1)', color: 'var(--primary)' }}>{s.role}</span> },
            { key: 'status', label: 'Status', render: (s: StaffMember) => <StatusBadge status={s.status} /> },
            { key: 'lastActive', label: 'Last Active' },
            { key: 'createdAt', label: 'Created' },
            {
              key: 'actions', label: '',
              render: (s: StaffMember) => (
                <div className="flex gap-1">
                  <ActionButton onClick={() => setEditMember(s)}>Edit</ActionButton>
                  <ActionButton variant="danger" onClick={() => setDeleteMember(s)}>Delete</ActionButton>
                </div>
              )
            },
          ]}
          data={staff}
          loading={loading}
        />
      </Card>

      {editMember && (
        <EditStaffModal member={editMember} onClose={() => setEditMember(null)} onSave={handleSave} />
      )}
      {deleteMember && (
        <DeleteStaffModal member={deleteMember} onClose={() => setDeleteMember(null)} onConfirm={() => handleDelete(deleteMember.id)} />
      )}
      {showAddModal && (
        <EditStaffModal
          member={BLANK_MEMBER}
          onClose={() => setShowAddModal(false)}
          onSave={(m) => setStaff(prev => [...prev, m])}
        />
      )}
    </div>
  );
}
