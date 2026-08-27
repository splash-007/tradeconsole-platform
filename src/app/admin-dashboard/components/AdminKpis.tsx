import React from 'react';
import { Users, UserCheck, TrendingUp, Globe, Star, Tag, BarChart2 } from 'lucide-react';
import { MarketingOverview } from '@/services/marketing.service';

interface Props { overview: MarketingOverview; }

export default function AdminKpis({ overview }: Props) {
  const cards = [
    { id: 'total-reg', label: 'Total Registrations', value: overview.totalRegistrations.toLocaleString(), sub: 'All time', icon: Users, color: 'var(--primary)', span: 1 },
    { id: 'today-reg', label: 'Today', value: overview.registrationsToday.toString(), sub: 'New signups', icon: TrendingUp, color: 'var(--positive)', span: 1 },
    { id: '7d-reg', label: 'Last 7 Days', value: overview.registrationsLast7Days.toLocaleString(), sub: 'Rolling window', icon: BarChart2, color: 'var(--primary)', span: 1 },
    { id: 'qualified', label: 'Qualified', value: overview.qualifiedCustomers.toLocaleString(), sub: 'KYC + active', icon: UserCheck, color: 'var(--positive)', span: 1 },
    { id: 'conversions', label: 'Conversions', value: overview.conversions.toLocaleString(), sub: 'Deposited at least once', icon: Star, color: 'var(--primary)', span: 1 },
    { id: 'conv-rate', label: 'Conversion Rate', value: `${overview.conversionRate.toFixed(2)}%`, sub: 'Reg → First deposit', icon: TrendingUp, color: overview.conversionRate > 20 ? 'var(--positive)' : 'var(--warning)', span: 1 },
    { id: 'top-source', label: 'Top Source', value: overview.topSource, sub: 'Highest volume', icon: Globe, color: 'var(--primary)', span: 1 },
    { id: 'top-affiliate', label: 'Top Affiliate', value: overview.topAffiliate, sub: overview.topCampaign, icon: Tag, color: 'var(--primary)', span: 1 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-4 gap-3">
      {cards.map(card => (
        <div key={`adm-kpi-${card.id}`} className="rounded-lg p-4 border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold uppercase tracking-widest leading-tight" style={{ color: 'var(--muted-foreground)' }}>{card.label}</p>
            <div className="w-6 h-6 rounded flex items-center justify-center shrink-0" style={{ backgroundColor: `${card.color}20` }}>
              <card.icon size={12} style={{ color: card.color }} />
            </div>
          </div>
          <p className="text-xl font-bold tabular-nums truncate" style={{ color: 'var(--foreground)' }}>{card.value}</p>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--muted-foreground)' }}>{card.sub}</p>
        </div>
      ))}
    </div>
  );
}