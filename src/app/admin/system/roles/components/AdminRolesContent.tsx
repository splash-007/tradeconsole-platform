'use client';
import React, { useEffect, useState } from 'react';
import { adminService, Role } from '@/services/admin.service';
import { PageHeader, Card, AdminTable, KpiCard, ActionButton } from '@/components/admin/AdminUI';

export default function AdminRolesContent() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { adminService.getRoles().then(d => { setRoles(d); setLoading(false); }); }, []);

  return (
    <div className="space-y-4">
      <PageHeader title="Roles & Permissions" subtitle="RBAC role management — frontend controls only, backend enforces all permissions"
        actions={<ActionButton variant="primary">Create Role</ActionButton>} />
      <div className="p-3 rounded border text-xs" style={{ borderColor: 'rgba(245,196,0,0.3)', backgroundColor: 'rgba(245,196,0,0.05)', color: 'var(--muted-foreground)' }}>
        ⚠ Frontend permissions are presentation controls only. The VPS API must enforce all permissions server-side.
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {roles.slice(0, 4).map(r => <KpiCard key={r.id} label={r.name} value={r.userCount} sub="users" />)}
      </div>
      <Card padding="p-0">
        <AdminTable
          columns={[
            { key: 'name', label: 'Role', render: (r: Role) => <span className="font-mono font-bold" style={{ color: 'var(--primary)' }}>{r.name}</span> },
            { key: 'description', label: 'Description' },
            { key: 'userCount', label: 'Users' },
            { key: 'permissions', label: 'Permissions', render: (r: Role) => (
              <div className="flex flex-wrap gap-1">
                {r.permissions.slice(0, 3).map(p => (
                  <span key={p} className="text-xs px-1.5 py-0.5 rounded font-mono" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>{p}</span>
                ))}
                {r.permissions.length > 3 && <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>+{r.permissions.length - 3} more</span>}
              </div>
            )},
            { key: 'actions', label: '', render: () => <ActionButton>Edit</ActionButton> },
          ]}
          data={roles}
          loading={loading}
        />
      </Card>
    </div>
  );
}
