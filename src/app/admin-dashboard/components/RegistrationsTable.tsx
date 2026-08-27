'use client';
import React, { useState, useMemo } from 'react';
import { Registration } from '@/services/marketing.service';
import { Search, Filter, ChevronLeft, ChevronRight, Eye, UserCheck, MoreHorizontal, Users } from 'lucide-react';

interface Props { registrations: Registration[]; }

const STATUS_STYLES: Record<Registration['status'], { color: string; bg: string }> = {
  pending: { color: 'var(--warning)', bg: 'rgba(245,158,11,0.1)' },
  verified: { color: 'var(--primary)', bg: 'rgba(245,196,0,0.1)' },
  active: { color: 'var(--positive)', bg: 'rgba(34,197,94,0.1)' },
  rejected: { color: 'var(--negative)', bg: 'rgba(239,68,68,0.1)' },
  suspended: { color: 'var(--muted-foreground)', bg: 'var(--muted)' },
};

const PAGE_SIZE = 8;

export default function RegistrationsTable({ registrations }: Props) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let data = [...registrations];
    if (search) data = data.filter(r =>
      r.firstName.toLowerCase().includes(search.toLowerCase()) ||
      r.lastName.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.country.toLowerCase().includes(search.toLowerCase())
    );
    if (statusFilter !== 'all') data = data.filter(r => r.status === statusFilter);
    return data;
  }, [registrations, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="rounded-lg border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      {/* Table header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
        <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Registrations</h3>
        <div className="flex flex-1 items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search name, email, country..."
              className="w-full pl-8 pr-3 py-1.5 rounded text-xs border focus:outline-none"
              style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
          </div>
          <div className="relative">
            <Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="pl-7 pr-6 py-1.5 rounded text-xs border focus:outline-none appearance-none"
              style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="active">Active</option>
              <option value="rejected">Rejected</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
        <span className="text-xs shrink-0" style={{ color: 'var(--muted-foreground)' }}>{filtered.length} results</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Customer', 'Email', 'Country', 'Source', 'Affiliate', 'Campaign', 'Registered', 'Status', 'Assigned To', 'Actions'].map(h => (
                <th key={`reg-th-${h}`} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider whitespace-nowrap"
                  style={{ color: 'var(--muted-foreground)' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center">
                  <Users size={24} className="mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>No registrations found</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Try adjusting your search or filter criteria</p>
                </td>
              </tr>
            ) : (
              paginated.map(reg => {
                const statusStyle = STATUS_STYLES[reg.status];
                return (
                  <tr key={`reg-row-${reg.id}`} className="hover:bg-muted transition-colors" style={{ borderBottom: '1px solid var(--border)' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                          style={{ backgroundColor: 'var(--muted)', color: 'var(--primary)' }}>
                          {reg.firstName.slice(0, 1)}{reg.lastName.slice(0, 1)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                            {reg.firstName} {reg.lastName}
                          </p>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{reg.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ color: 'var(--foreground)' }}>{reg.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ color: 'var(--foreground)' }}>{reg.country}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }}>
                        {reg.source || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-mono" style={{ color: reg.affiliate ? 'var(--primary)' : 'var(--muted-foreground)' }}>
                        {reg.affiliate || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ color: reg.campaign ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                        {reg.campaign || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>{reg.registeredAt}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded font-semibold capitalize whitespace-nowrap"
                        style={{ color: statusStyle.color, backgroundColor: statusStyle.bg }}>
                        {reg.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs" style={{ color: reg.assignedStaff ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                        {reg.assignedStaff || 'Unassigned'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <div className="relative group">
                          <button className="p-1.5 rounded hover:bg-muted transition-colors" style={{ color: 'var(--muted-foreground)' }}>
                            <Eye size={13} />
                          </button>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50"
                            style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                            View customer profile
                          </div>
                        </div>
                        <div className="relative group">
                          <button className="p-1.5 rounded hover:bg-muted transition-colors" style={{ color: 'var(--muted-foreground)' }}>
                            <UserCheck size={13} />
                          </button>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50"
                            style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                            Update verification status
                          </div>
                        </div>
                        <div className="relative group">
                          <button className="p-1.5 rounded hover:bg-muted transition-colors" style={{ color: 'var(--muted-foreground)' }}>
                            <MoreHorizontal size={13} />
                          </button>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 rounded text-xs whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50"
                            style={{ backgroundColor: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)' }}>
                            More actions
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <ChevronLeft size={14} />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={`reg-page-${p}`}
              onClick={() => setPage(p)}
              className={`w-7 h-7 rounded text-xs transition-all ${p === page ? 'bg-primary-subtle text-gold font-semibold' : 'text-muted-foreground hover:bg-muted'}`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
            className="p-1.5 rounded hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}