'use client';
import React, { useEffect, useState } from 'react';
import { adminService, StaffMember } from '@/services/admin.service';
import { PageHeader, Card, AdminTable, StatusBadge, KpiCard, ActionButton } from '@/components/admin/AdminUI';

export default function AdminStaffContent() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { adminService.getStaff().then(d => { setStaff(d); setLoading(false); }); }, []);

  return (
    <div className="space-y-4">
      <PageHeader title="Staff" subtitle="Platform staff management" actions={<ActionButton variant="primary">Add Staff Member</ActionButton>} />
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
                  <ActionButton>Edit</ActionButton>
                  {s.status === 'active' ? <ActionButton variant="danger">Suspend</ActionButton> : <ActionButton variant="primary">Reactivate</ActionButton>}
                </div>
              )
            },
          ]}
          data={staff}
          loading={loading}
        />
      </Card>
    </div>
  );
}
