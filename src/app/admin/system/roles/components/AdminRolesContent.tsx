'use client';
import React, { useEffect, useState } from 'react';
import { adminService, Role } from '@/services/admin.service';
import { PageHeader, Card, AdminTable, KpiCard, ActionButton } from '@/components/admin/AdminUI';
import { ROLE_DISPLAY_NAMES, type RoleId } from '@/lib/rbac';

export default function AdminRolesContent() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { adminService.getRoles().then(d => { setRoles(d); setLoading(false); }); }, []);

  const staffRoles = roles.filter(r => r.name !== 'customer');
  const totalStaff = staffRoles.reduce((s, r) => s + r.userCount, 0);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Roles & Permissions"
        subtitle="RBAC role management — 23 roles · Frontend controls only, backend enforces all permissions"
        actions={<ActionButton variant="primary">Create Role</ActionButton>}
      />
      <div className="p-3 rounded border text-xs" style={{ borderColor: 'rgba(245,196,0,0.3)', backgroundColor: 'rgba(245,196,0,0.05)', color: 'var(--muted-foreground)' }}>
        ⚠ Frontend permissions are presentation controls only. The VPS API must enforce all permissions server-side. Never rely on hidden menu items for security.
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Roles" value={roles.length} />
        <KpiCard label="Staff Roles" value={staffRoles.length} />
        <KpiCard label="Total Staff" value={totalStaff} />
        <KpiCard label="Customers" value={roles.find(r => r.name === 'customer')?.userCount || 0} />
      </div>
      <Card padding="p-0">
        <AdminTable
          columns={[
            {
              key: 'name', label: 'Role',
              render: (r: Role) => (
                <div>
                  <span className="font-mono font-bold text-xs" style={{ color: 'var(--primary)' }}>
                    {ROLE_DISPLAY_NAMES[r.name as RoleId] || r.name}
                  </span>
                  <p className="text-xs font-mono mt-0.5 opacity-60" style={{ color: 'var(--muted-foreground)' }}>{r.name}</p>
                </div>
              )
            },
            { key: 'description', label: 'Description', render: (r: Role) => <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{r.description}</span> },
            { key: 'userCount', label: 'Users', render: (r: Role) => <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{r.userCount}</span> },
            {
              key: 'permissions', label: 'Permissions',
              render: (r: Role) => (
                <div className="flex flex-wrap gap-1">
                  {r.permissions.slice(0, 2).map(p => (
                    <span key={p} className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>{p}</span>
                  ))}
                  {r.permissions.length > 2 && <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>+{r.permissions.length - 2} more</span>}
                </div>
              )
            },
            { key: 'actions', label: '', render: () => <ActionButton>Edit</ActionButton> },
          ]}
          data={roles}
          loading={loading}
        />
      </Card>
    </div>
  );
}
