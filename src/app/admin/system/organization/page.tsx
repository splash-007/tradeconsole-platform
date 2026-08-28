'use client';
import React, { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminService, StaffMember } from '@/services/admin.service';
import { ROLE_DISPLAY_NAMES, type RoleId } from '@/lib/rbac';
import { ChevronDown, ChevronRight } from 'lucide-react';

const PRESENCE_COLORS: Record<string, string> = {
  online: '#22c55e', away: '#f59e0b', busy: '#ef4444', offline: '#6b7280',
};

interface OrgNode {
  member: StaffMember;
  reports: OrgNode[];
}

function buildOrgTree(staff: StaffMember[]): OrgNode[] {
  const map = new Map<string, OrgNode>();
  staff.forEach(s => map.set(s.id, { member: s, reports: [] }));

  const roots: OrgNode[] = [];
  staff.forEach(s => {
    if (s.managerId && map.has(s.managerId)) {
      map.get(s.managerId)!.reports.push(map.get(s.id)!);
    } else {
      roots.push(map.get(s.id)!);
    }
  });
  return roots;
}

interface OrgNodeCardProps {
  node: OrgNode;
  depth?: number;
}

function OrgNodeCard({ node, depth = 0 }: OrgNodeCardProps) {
  const [expanded, setExpanded] = useState(depth < 2);
  const { member } = node;
  const hasReports = node.reports.length > 0;

  return (
    <div className="flex flex-col items-start">
      <div className="flex items-center gap-2">
        {depth > 0 && (
          <div className="flex items-center">
            <div className="w-6 border-t" style={{ borderColor: 'var(--border)' }} />
          </div>
        )}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer hover:bg-white/5 transition-colors"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', minWidth: '180px' }}
          onClick={() => hasReports && setExpanded(!expanded)}
        >
          <div className="relative shrink-0">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold" style={{ backgroundColor: 'rgba(245,196,0,0.15)', color: 'var(--primary)' }}>
              {member.firstName[0]}{member.lastName[0]}
            </div>
            {member.presenceStatus && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border" style={{ backgroundColor: PRESENCE_COLORS[member.presenceStatus], borderColor: 'var(--card)' }} />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold truncate" style={{ color: 'var(--foreground)' }}>{member.firstName} {member.lastName}</p>
            <p className="text-xs truncate" style={{ color: 'var(--primary)' }}>{ROLE_DISPLAY_NAMES[member.role as RoleId] || member.role}</p>
          </div>
          {hasReports && (
            <div style={{ color: 'var(--muted-foreground)' }}>
              {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </div>
          )}
        </div>
      </div>

      {hasReports && expanded && (
        <div className="ml-8 mt-1 pl-4 border-l space-y-1" style={{ borderColor: 'var(--border)' }}>
          {node.reports.map(child => (
            <OrgNodeCard key={child.member.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminOrganizationPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { adminService.getStaff().then(d => { setStaff(d); setLoading(false); }); }, []);

  const orgTree = buildOrgTree(staff);

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Organization Chart</h1>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              Staff hierarchy based on configured manager relationships · {staff.length} staff members
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#22c55e' }} />Online</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#f59e0b' }} />Away</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ef4444' }} />Busy</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#6b7280' }} />Offline</span>
          </div>
        </div>

        <div className="p-3 rounded border text-xs" style={{ borderColor: 'rgba(245,196,0,0.3)', backgroundColor: 'rgba(245,196,0,0.05)', color: 'var(--muted-foreground)' }}>
          ℹ Hierarchy reflects configured <code className="font-mono">manager_id</code> relationships. Use Staff Management to update assignments.
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 rounded-full animate-spin" style={{ borderColor: 'transparent', borderTopColor: 'var(--primary)' }} />
          </div>
        ) : (
          <div className="rounded-xl border p-4 overflow-x-auto" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="space-y-2 min-w-max">
              {orgTree.map(node => (
                <OrgNodeCard key={node.member.id} node={node} />
              ))}
            </div>
          </div>
        )}

        {/* Role Summary */}
        <div className="rounded-xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <h2 className="text-sm font-semibold mb-3" style={{ color: 'var(--foreground)' }}>Staff by Role</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {Array.from(new Set(staff.map(s => s.role))).map(role => {
              const count = staff.filter(s => s.role === role).length;
              return (
                <div key={role} className="p-2.5 rounded-lg text-center" style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)' }}>
                  <p className="text-lg font-bold" style={{ color: 'var(--primary)' }}>{count}</p>
                  <p className="text-xs mt-0.5 leading-tight" style={{ color: 'var(--muted-foreground)' }}>{ROLE_DISPLAY_NAMES[role as RoleId] || role}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
