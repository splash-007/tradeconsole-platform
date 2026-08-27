'use client';
import React from 'react';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  width?: string;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
}

export function AdminTable<T extends { id: string }>({ columns, data, loading, emptyMessage }: AdminTableProps<T>) {
  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="h-10 rounded" style={{ backgroundColor: 'var(--muted)' }} />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {columns.map(col => (
              <th key={String(col.key)} className="text-left px-3 py-2 font-semibold uppercase tracking-wider"
                style={{ color: 'var(--muted-foreground)', width: col.width }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-8" style={{ color: 'var(--muted-foreground)' }}>
                {emptyMessage || 'No data available'}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={row.id} className="hover:bg-white/3 transition-colors"
                style={{ borderBottom: '1px solid var(--border)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                {columns.map(col => (
                  <td key={String(col.key)} className="px-3 py-2.5" style={{ color: 'var(--foreground)' }}>
                    {col.render ? col.render(row) : String((row as Record<string, unknown>)[String(col.key)] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'positive' | 'negative' | 'warning' | 'info';
}

const STATUS_COLORS: Record<string, string> = {
  active: 'positive', verified: 'positive', approved: 'positive', completed: 'positive', connected: 'positive', online: 'positive',
  pending: 'warning', processing: 'warning', in_progress: 'warning', ringing: 'warning', connecting: 'warning', busy: 'warning', away: 'warning',
  rejected: 'negative', suspended: 'negative', failed: 'negative', overdue: 'negative', cancelled: 'negative', offline: 'default',
  unverified: 'default', closed: 'default', ended: 'default',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const variant = STATUS_COLORS[status.toLowerCase()] || 'default';
  const colors: Record<string, { bg: string; color: string }> = {
    positive: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
    negative: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
    warning: { bg: 'rgba(245,196,0,0.15)', color: '#F5C400' },
    info: { bg: 'rgba(59,130,246,0.15)', color: '#3b82f6' },
    default: { bg: 'rgba(255,255,255,0.08)', color: 'var(--muted-foreground)' },
  };
  const c = colors[variant];
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize"
      style={{ backgroundColor: c.bg, color: c.color }}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h1 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>{title}</h1>
        {subtitle && <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: string;
}

export function Card({ children, className = '', padding = 'p-4' }: CardProps) {
  return (
    <div className={`rounded-lg border ${padding} ${className}`}
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      {children}
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: number;
}

export function KpiCard({ label, value, sub, trend }: KpiCardProps) {
  return (
    <Card padding="p-3">
      <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
      <p className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{sub}</p>}
      {trend !== undefined && (
        <p className="text-xs mt-0.5 font-medium" style={{ color: trend >= 0 ? 'var(--positive)' : 'var(--negative)' }}>
          {trend >= 0 ? '+' : ''}{trend}%
        </p>
      )}
    </Card>
  );
}

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder || 'Search...'}
      className="text-xs px-3 py-1.5 rounded border outline-none w-48"
      style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
    />
  );
}

export function ActionButton({ onClick, children, variant = 'default' }: { onClick?: () => void; children: React.ReactNode; variant?: 'default' | 'primary' | 'danger' }) {
  const styles: Record<string, React.CSSProperties> = {
    default: { borderColor: 'var(--border)', color: 'var(--muted-foreground)', backgroundColor: 'transparent' },
    primary: { borderColor: 'var(--primary)', color: '#000', backgroundColor: 'var(--primary)' },
    danger: { borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)' },
  };
  return (
    <button onClick={onClick} className="text-xs px-3 py-1.5 rounded border transition-colors hover:opacity-80 font-medium"
      style={styles[variant]}>
      {children}
    </button>
  );
}
