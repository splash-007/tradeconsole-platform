import React from 'react';
import Link from 'next/link';
import { DashboardOverview } from '@/services/dashboard.service';
import { ArrowUpRight, ArrowDownLeft, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


interface Props { activities: DashboardOverview['recentActivity']; }

const TYPE_CONFIG = {
  buy: { icon: ArrowDownLeft, color: 'var(--positive)', label: 'Buy', bg: 'rgba(34,197,94,0.1)' },
  sell: { icon: ArrowUpRight, color: 'var(--negative)', label: 'Sell', bg: 'rgba(239,68,68,0.1)' },
  deposit: { icon: ArrowDownToLine, color: 'var(--primary)', label: 'Deposit', bg: 'rgba(245,196,0,0.1)' },
  withdrawal: { icon: ArrowUpFromLine, color: 'var(--muted-foreground)', label: 'Withdraw', bg: 'var(--muted)' },
};

const STATUS_COLORS = {
  filled: 'var(--positive)',
  pending: 'var(--warning)',
  cancelled: 'var(--negative)',
};

export default function RecentActivity({ activities }: Props) {
  return (
    <div className="rounded-lg border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Recent Activity</h3>
        <Link href="/portfolio" className="text-xs hover:underline" style={{ color: 'var(--primary)' }}>View all</Link>
      </div>
      <div className="space-y-1">
        {activities.map(act => {
          const cfg = TYPE_CONFIG[act.type];
          const Icon = cfg.icon;
          return (
            <div key={`act-${act.id}`} className="flex items-center gap-3 px-2 py-2 rounded hover:bg-muted transition-colors">
              <div className="w-7 h-7 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: cfg.bg }}>
                <Icon size={14} style={{ color: cfg.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{cfg.label} {act.symbol}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-sm font-medium" style={{ color: STATUS_COLORS[act.status], backgroundColor: `${STATUS_COLORS[act.status]}18` }}>
                    {act.status}
                  </span>
                </div>
                <p className="text-xs tabular-nums" style={{ color: 'var(--muted-foreground)' }}>
                  {act.amount} @ ${act.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <span className="text-xs shrink-0" style={{ color: 'var(--muted-foreground)' }}>{act.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}