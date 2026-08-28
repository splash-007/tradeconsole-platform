'use client';
import React, { useEffect, useState, useCallback } from 'react';
import { platformService, AuditRecord, AuditAction, ResourceType } from '@/services/platform.service';
import { PageHeader, Card, StatusBadge, KpiCard } from '@/components/admin/AdminUI';
import { X, Search, Filter, ChevronDown, ChevronRight, Shield } from 'lucide-react';

const ACTION_COLORS: Record<string, string> = {
  CUSTOMER_ASSIGNED: '#3b82f6',
  CUSTOMER_REASSIGNED: '#f59e0b',
  CUSTOMER_CREATED: '#22c55e',
  CUSTOMER_UPDATED: '#6b7280',
  CUSTOMER_STATUS_CHANGED: '#f59e0b',
  TASK_CREATED: '#3b82f6',
  TASK_UPDATED: '#6b7280',
  TASK_COMPLETED: '#22c55e',
  TASK_CANCELLED: '#ef4444',
  NOTE_ADDED: '#6b7280',
  CALL_STARTED: '#f59e0b',
  CALL_COMPLETED: '#22c55e',
  ROLE_ASSIGNED: '#a855f7',
  ROLE_CHANGED: '#a855f7',
  PERMISSION_CHANGED: '#ef4444',
  MANAGER_CHANGED: '#f59e0b',
  VERIFICATION_UPDATED: '#22c55e',
  DEPOSIT_REVIEWED: '#22c55e',
  WITHDRAWAL_REVIEWED: '#f59e0b',
  STAFF_CREATED: '#22c55e',
  STAFF_DISABLED: '#ef4444',
  STAFF_REACTIVATED: '#22c55e',
  ESCALATION_CREATED: '#ef4444',
};

const ALL_ACTIONS: AuditAction[] = [
  'CUSTOMER_CREATED', 'CUSTOMER_UPDATED', 'CUSTOMER_STATUS_CHANGED', 'CUSTOMER_ASSIGNED', 'CUSTOMER_REASSIGNED',
  'TASK_CREATED', 'TASK_UPDATED', 'TASK_COMPLETED', 'TASK_CANCELLED',
  'NOTE_ADDED', 'CALL_STARTED', 'CALL_COMPLETED',
  'ROLE_ASSIGNED', 'ROLE_CHANGED', 'PERMISSION_CHANGED', 'MANAGER_CHANGED',
  'VERIFICATION_UPDATED', 'DEPOSIT_REVIEWED', 'WITHDRAWAL_REVIEWED',
  'CHAT_ADMIN_VIEWED', 'STAFF_CREATED', 'STAFF_DISABLED', 'STAFF_REACTIVATED', 'ESCALATION_CREATED',
];

const RESOURCE_TYPES: ResourceType[] = [
  'Customer', 'Task', 'Assignment', 'Staff', 'Role', 'Permission',
  'Verification', 'Deposit', 'Withdrawal', 'Conversation', 'Note', 'Call', 'Escalation',
];

interface Filters {
  search: string;
  dateFrom: string;
  dateTo: string;
  action: string;
  resourceType: string;
  result: string;
  staffName: string;
}

function AuditDetailModal({ record, onClose }: { record: AuditRecord; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
      <div className="w-full max-w-lg rounded-xl border shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <Shield size={15} style={{ color: 'var(--primary)' }} />
            <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Audit Record</p>
            <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>{record.id}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-white/5" style={{ color: 'var(--muted-foreground)' }}>
            <X size={15} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-3 max-h-[70vh] overflow-y-auto">
          {/* Read-only notice */}
          <div className="flex items-center gap-2 px-3 py-2 rounded text-xs" style={{ backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444' }}>
            <Shield size={11} />
            Audit records are read-only and cannot be modified.
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              ['Timestamp', record.timestamp],
              ['Record ID', record.id],
              ['Actor', record.actorName],
              ['Actor Role', record.actorRole],
              ['Action', record.action],
              ['Resource Type', record.resourceType],
              ['Resource ID', record.resourceId],
              ['Customer', record.customerName || '—'],
              ['Customer ID', record.customerId || '—'],
              ['Result', record.result],
              ['Session ID', record.sessionId],
              ['IP Address', record.ipAddress || '—'],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs mb-0.5" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
                <p className="text-xs font-medium font-mono" style={{ color: 'var(--foreground)' }}>{value}</p>
              </div>
            ))}
          </div>

          {(record.previousValue || record.newValue) && (
            <div className="rounded border p-3 space-y-2" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Change</p>
              {record.previousValue && (
                <div className="flex items-start gap-2">
                  <span className="text-xs px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444' }}>Before</span>
                  <span className="text-xs font-mono" style={{ color: 'var(--foreground)' }}>{record.previousValue}</span>
                </div>
              )}
              {record.newValue && (
                <div className="flex items-start gap-2">
                  <span className="text-xs px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor: 'rgba(34,197,94,0.1)', color: '#22c55e' }}>After</span>
                  <span className="text-xs font-mono" style={{ color: 'var(--foreground)' }}>{record.newValue}</span>
                </div>
              )}
            </div>
          )}

          {record.reason && (
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Reason / Note</p>
              <p className="text-xs" style={{ color: 'var(--foreground)' }}>{record.reason}</p>
            </div>
          )}

          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Details</p>
            <p className="text-xs" style={{ color: 'var(--foreground)' }}>{record.details}</p>
          </div>
        </div>

        <div className="flex justify-end px-5 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <button onClick={onClose} className="text-xs px-4 py-2 rounded border transition-colors hover:bg-white/5" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminAuditLogsContent() {
  const [logs, setLogs] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecord, setSelectedRecord] = useState<AuditRecord | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    dateFrom: '',
    dateTo: '',
    action: '',
    resourceType: '',
    result: '',
    staffName: '',
  });

  useEffect(() => {
    platformService.getAuditRecords().then(d => {
      setLogs(d);
      setLoading(false);
    });
  }, []);

  const filtered = logs.filter(l => {
    const searchStr = `${l.actorName} ${l.action} ${l.customerName || ''} ${l.resourceType} ${l.details}`.toLowerCase();
    if (filters.search && !searchStr.includes(filters.search.toLowerCase())) return false;
    if (filters.action && l.action !== filters.action) return false;
    if (filters.resourceType && l.resourceType !== filters.resourceType) return false;
    if (filters.result && l.result !== filters.result) return false;
    if (filters.staffName && !l.actorName.toLowerCase().includes(filters.staffName.toLowerCase())) return false;
    if (filters.dateFrom && l.timestamp < filters.dateFrom) return false;
    if (filters.dateTo && l.timestamp > filters.dateTo + ' 23:59') return false;
    return true;
  });

  const clearFilters = useCallback(() => {
    setFilters({ search: '', dateFrom: '', dateTo: '', action: '', resourceType: '', result: '', staffName: '' });
  }, []);

  const activeFilterCount = Object.values(filters).filter(v => v !== '').length;

  const selectStyle = {
    backgroundColor: 'var(--background)',
    borderColor: 'var(--border)',
    color: 'var(--foreground)',
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Audit Logs"
        subtitle="Read-only security and administrative change history"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(f => !f)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border transition-colors hover:bg-white/5"
              style={{ borderColor: 'var(--border)', color: activeFilterCount > 0 ? 'var(--primary)' : 'var(--muted-foreground)' }}
            >
              <Filter size={12} />
              Filters
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold" style={{ backgroundColor: 'var(--primary)', color: '#000' }}>
                  {activeFilterCount}
                </span>
              )}
              {showFilters ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs px-2 py-1.5 rounded" style={{ color: '#ef4444' }}>
                Clear
              </button>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total Records" value={logs.length} />
        <KpiCard label="Filtered" value={filtered.length} />
        <KpiCard label="Failures" value={logs.filter(l => l.result === 'failure').length} />
        <KpiCard label="Unique Actors" value={new Set(logs.map(l => l.actorUserId)).size} />
      </div>

      {/* Filters panel */}
      {showFilters && (
        <Card>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Search</label>
              <div className="relative">
                <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
                <input
                  value={filters.search}
                  onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
                  placeholder="Search logs..."
                  className="w-full text-xs pl-7 pr-3 py-1.5 rounded border outline-none"
                  style={selectStyle}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Staff Name</label>
              <input
                value={filters.staffName}
                onChange={e => setFilters(f => ({ ...f, staffName: e.target.value }))}
                placeholder="Filter by staff..."
                className="w-full text-xs px-3 py-1.5 rounded border outline-none"
                style={selectStyle}
              />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Action</label>
              <select value={filters.action} onChange={e => setFilters(f => ({ ...f, action: e.target.value }))}
                className="w-full text-xs px-3 py-1.5 rounded border outline-none" style={selectStyle}>
                <option value="">All Actions</option>
                {ALL_ACTIONS.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Resource Type</label>
              <select value={filters.resourceType} onChange={e => setFilters(f => ({ ...f, resourceType: e.target.value }))}
                className="w-full text-xs px-3 py-1.5 rounded border outline-none" style={selectStyle}>
                <option value="">All Resources</option>
                {RESOURCE_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Result</label>
              <select value={filters.result} onChange={e => setFilters(f => ({ ...f, result: e.target.value }))}
                className="w-full text-xs px-3 py-1.5 rounded border outline-none" style={selectStyle}>
                <option value="">All Results</option>
                <option value="success">Success</option>
                <option value="failure">Failure</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Date From</label>
              <input type="date" value={filters.dateFrom} onChange={e => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                className="w-full text-xs px-3 py-1.5 rounded border outline-none" style={selectStyle} />
            </div>
            <div>
              <label className="text-xs font-medium block mb-1" style={{ color: 'var(--muted-foreground)' }}>Date To</label>
              <input type="date" value={filters.dateTo} onChange={e => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                className="w-full text-xs px-3 py-1.5 rounded border outline-none" style={selectStyle} />
            </div>
          </div>
        </Card>
      )}

      <Card padding="p-0">
        {loading ? (
          <div className="animate-pulse space-y-2 p-4">
            {Array.from({ length: 6 }, (_, i) => <div key={i} className="h-8 rounded" style={{ backgroundColor: 'var(--muted)' }} />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Timestamp', 'Actor', 'Role', 'Action', 'Resource', 'Customer', 'Change', 'Result', ''].map(h => (
                    <th key={h} className="text-left px-3 py-2 font-semibold uppercase tracking-wider whitespace-nowrap"
                      style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-8" style={{ color: 'var(--muted-foreground)' }}>
                      No audit records match the current filters
                    </td>
                  </tr>
                ) : (
                  filtered.map((log, idx) => (
                    <tr key={log.id}
                      className="hover:bg-white/3 transition-colors cursor-pointer"
                      style={{ borderBottom: '1px solid var(--border)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}
                      onClick={() => setSelectedRecord(log)}
                    >
                      <td className="px-3 py-2.5 font-mono whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>{log.timestamp}</td>
                      <td className="px-3 py-2.5 font-medium whitespace-nowrap" style={{ color: 'var(--foreground)' }}>{log.actorName}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>{log.actorRole}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap">
                        <span className="font-mono text-xs px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: `${ACTION_COLORS[log.action] || '#6b7280'}18`, color: ACTION_COLORS[log.action] || '#6b7280' }}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>{log.resourceType}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: 'var(--foreground)' }}>{log.customerName || '—'}</td>
                      <td className="px-3 py-2.5 max-w-xs">
                        {log.previousValue && log.newValue ? (
                          <span className="flex items-center gap-1 text-xs">
                            <span style={{ color: '#ef4444' }} className="truncate max-w-16">{log.previousValue}</span>
                            <span style={{ color: 'var(--muted-foreground)' }}>→</span>
                            <span style={{ color: '#22c55e' }} className="truncate max-w-16">{log.newValue}</span>
                          </span>
                        ) : (
                          <span className="truncate block" style={{ color: 'var(--muted-foreground)' }}>{log.details}</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5"><StatusBadge status={log.result} /></td>
                      <td className="px-3 py-2.5">
                        <button className="text-xs px-2 py-0.5 rounded border hover:bg-white/5 transition-colors"
                          style={{ borderColor: 'var(--border)', color: 'var(--primary)' }}
                          onClick={e => { e.stopPropagation(); setSelectedRecord(log); }}>
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

      {selectedRecord && (
        <AuditDetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
      )}
    </div>
  );
}
