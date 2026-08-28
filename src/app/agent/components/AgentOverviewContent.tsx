'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { agentService, AgentOverviewStats, AgentTask, AssignedCustomer } from '@/services/agent.service';
import { Card, KpiCard, StatusBadge } from '@/components/admin/AdminUI';
import MarketAIChat from '@/components/agent/MarketAIChat';

const AGENT_ID = 'agent-001';
const PRIORITY_COLORS: Record<string, string> = { urgent: '#ef4444', high: '#F5C400', medium: '#3b82f6', low: '#6b7280' };
const ONLINE_DOT: Record<string, string> = { online: '#22c55e', away: '#f59e0b', offline: '#6b7280' };

export default function AgentOverviewContent() {
  const [stats, setStats] = useState<AgentOverviewStats | null>(null);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [customers, setCustomers] = useState<AssignedCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiCollapsed, setAiCollapsed] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    Promise.all([
      agentService.getOverviewStats(AGENT_ID),
      agentService.getTasks(AGENT_ID),
      agentService.getAssignedCustomers(AGENT_ID),
    ]).then(([s, t, c]) => {
      setStats(s);
      setTasks(t);
      setCustomers(c);
      setLoading(false);
      const now = new Date();
      setLastUpdated(`${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`);
    });
  }, []);

  // Real-time polling every 20 seconds for agent dashboard
  useEffect(() => {
    const interval = setInterval(() => {
      setSyncing(true);
      Promise.all([
        agentService.getOverviewStats(AGENT_ID),
        agentService.getTasks(AGENT_ID),
        agentService.getAssignedCustomers(AGENT_ID),
      ]).then(([s, t, c]) => {
        setStats(s);
        setTasks(t);
        setCustomers(c);
        setSyncing(false);
        const now = new Date();
        setLastUpdated(`${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`);
      });
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="animate-pulse space-y-4">{Array.from({ length: 4 }, (_, i) => <div key={i} className="h-24 rounded-lg" style={{ backgroundColor: 'var(--card)' }} />)}</div>;

  const priorityTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled').sort((a, b) => {
    const order = { urgent: 0, high: 1, medium: 2, low: 3 };
    return (order[a.priority] || 3) - (order[b.priority] || 3);
  }).slice(0, 5);

  const recentCustomers = customers.slice(0, 4);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-base font-bold" style={{ color: 'var(--foreground)' }}>Good afternoon, Sarah</h1>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Aug 27, 2026 · Here's your workspace overview
          {lastUpdated && <span className="ml-1">· Updated {lastUpdated}{syncing ? ' · syncing…' : ''}</span>}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <KpiCard label="Assigned Customers" value={stats?.assignedCustomers || 0} />
        <KpiCard label="Tasks Today" value={stats?.tasksToday || 0} />
        <KpiCard label="Pending Follow-ups" value={stats?.pendingFollowUps || 0} />
        <KpiCard label="Unread Messages" value={stats?.unreadMessages || 0} />
        <KpiCard label="Calls Today" value={stats?.callsToday || 0} />
        <KpiCard label="Completed Tasks" value={stats?.completedTasks || 0} />
      </div>

      {/* Main grid: tasks + customers + AI chat */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Priority Tasks */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Priority Tasks</h3>
            <Link href="/agent/tasks" className="text-xs" style={{ color: 'var(--primary)' }}>View all</Link>
          </div>
          <div className="space-y-2">
            {priorityTasks.map(task => (
              <div key={task.id} className="flex items-start gap-3 p-2 rounded border" style={{ borderColor: 'var(--border)' }}>
                <span className="w-2 h-2 rounded-full mt-1 shrink-0" style={{ backgroundColor: PRIORITY_COLORS[task.priority] }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" style={{ color: 'var(--foreground)' }}>{task.customerName}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{task.type.replace(/_/g, ' ')} · Due {task.dueDate}</p>
                </div>
                <StatusBadge status={task.status} />
              </div>
            ))}
          </div>
        </Card>

        {/* Recently Assigned Customers */}
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Recently Assigned</h3>
            <Link href="/agent/customers" className="text-xs" style={{ color: 'var(--primary)' }}>View all</Link>
          </div>
          <div className="space-y-2">
            {recentCustomers.map(c => (
              <Link key={c.id} href={`/agent/customers/${c.id}`}
                className="flex items-center gap-3 p-2 rounded border hover:bg-white/3 transition-colors block"
                style={{ borderColor: 'var(--border)' }}>
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: ONLINE_DOT[c.onlineStatus] }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{c.firstName} {c.lastName}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{c.country} · {c.registrationSource}</p>
                </div>
                <StatusBadge status={c.priority} />
              </Link>
            ))}
          </div>
        </Card>

        {/* AI Market Chat */}
        <MarketAIChat
          collapsed={aiCollapsed}
          onToggle={() => setAiCollapsed(v => !v)}
        />
      </div>
    </div>
  );
}
