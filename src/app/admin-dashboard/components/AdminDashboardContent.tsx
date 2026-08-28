'use client';
import React, { useEffect, useState } from 'react';
import { marketingService, MarketingOverview, Registration } from '@/services/marketing.service';
import AdminKpis from './AdminKpis';
import RegistrationsChart from './RegistrationsChart';
import SourcePerformanceChart from './SourcePerformanceChart';
import RegistrationsTable from './RegistrationsTable';
import { UserPlus, ClipboardPlus, X, Check, Users, ClipboardList } from 'lucide-react';

interface AgentFormData {
  name: string;
  email: string;
  role: string;
  phone: string;
  language: string;
}

interface TaskFormData {
  title: string;
  assignedAgent: string;
  customer: string;
  type: string;
  priority: string;
  dueDate: string;
  notes: string;
}

const MOCK_AGENTS = ['Sarah Chen', 'Michael Torres', 'Emma Wilson', 'James Park'];
const MOCK_CUSTOMERS = ['Alex Morgan', 'David Kim', 'Lisa Johnson', 'Robert Brown', 'Maria Garcia'];

export default function AdminDashboardContent() {
  const [overview, setOverview] = useState<MarketingOverview | null>(null);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [timeline, setTimeline] = useState<{ date: string; count: number }[]>([]);
  const [sources, setSources] = useState<{ source: string; count: number; conversion: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateAgent, setShowCreateAgent] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [agentSaved, setAgentSaved] = useState(false);
  const [taskSaved, setTaskSaved] = useState(false);
  const [dismissedLeads, setDismissedLeads] = useState<Set<string>>(new Set());
  const [lastUpdated, setLastUpdated] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const LIVE_LEADS = [
    { id: 'll-001', name: 'Thomas Bergmann', country: 'Germany', source: 'Google Ads', time: '1 min ago' },
    { id: 'll-002', name: 'Priya Sharma', country: 'India', source: 'Organic', time: '5 min ago' },
    { id: 'll-003', name: 'Carlos Mendez', country: 'Mexico', source: 'Facebook', time: '12 min ago' },
  ];

  const visibleLeads = LIVE_LEADS.filter(l => !dismissedLeads.has(l.id));

  const [agentForm, setAgentForm] = useState<AgentFormData>({ name: '', email: '', role: 'agent', phone: '', language: 'English' });
  const [taskForm, setTaskForm] = useState<TaskFormData>({ title: '', assignedAgent: '', customer: '', type: 'Call Customer', priority: 'Medium', dueDate: '', notes: '' });

  useEffect(() => {
    Promise.all([
      marketingService.getOverview(),
      marketingService.getRegistrations(),
      marketingService.getRegistrationTimeline(),
      marketingService.getSourcePerformance(),
    ]).then(([ov, regs, tl, src]) => {
      setOverview(ov);
      setRegistrations(regs);
      setTimeline(tl);
      setSources(src);
      setLoading(false);
      const now = new Date();
      setLastUpdated(`${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`);
    });
  }, []);

  // Real-time polling every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshing(true);
      Promise.all([
        marketingService.getOverview(),
        marketingService.getRegistrations(),
        marketingService.getRegistrationTimeline(),
        marketingService.getSourcePerformance(),
      ]).then(([ov, regs, tl, src]) => {
        setOverview(ov);
        setRegistrations(regs);
        setTimeline(tl);
        setSources(src);
        setRefreshing(false);
        const now = new Date();
        setLastUpdated(`${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}:${now.getSeconds().toString().padStart(2,'0')}`);
      });
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateAgent = () => {
    if (!agentForm.name || !agentForm.email) return;
    setAgentSaved(true);
    setTimeout(() => { setAgentSaved(false); setShowCreateAgent(false); setAgentForm({ name: '', email: '', role: 'agent', phone: '', language: 'English' }); }, 2000);
  };

  const handleCreateTask = () => {
    if (!taskForm.title || !taskForm.assignedAgent) return;
    setTaskSaved(true);
    setTimeout(() => { setTaskSaved(false); setShowCreateTask(false); setTaskForm({ title: '', assignedAgent: '', customer: '', type: 'Call Customer', priority: 'Medium', dueDate: '', notes: '' }); }, 2000);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 rounded" style={{ backgroundColor: 'var(--muted)' }} />
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }, (_, i) => <div key={`adm-sk-${i}`} className="h-24 rounded-lg" style={{ backgroundColor: 'var(--card)' }} />)}
        </div>
        <div className="grid xl:grid-cols-2 gap-4">
          {Array.from({ length: 2 }, (_, i) => <div key={`adm-chart-sk-${i}`} className="h-64 rounded-lg" style={{ backgroundColor: 'var(--card)' }} />)}
        </div>
        <div className="h-96 rounded-lg" style={{ backgroundColor: 'var(--card)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Admin Dashboard</h1>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Aug 27, 2026 · Overview & Quick Actions
            {lastUpdated && <span className="ml-2">· Updated {lastUpdated}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--positive)' }} />
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Live data{refreshing ? ' · syncing…' : ''}</span>
        </div>
      </div>

      {/* New Lead Notifications */}
      {visibleLeads.length > 0 && (
        <div className="space-y-2">
          {visibleLeads.map(lead => (
            <div key={lead.id} className="flex items-center gap-3 px-4 py-2.5 rounded-xl border animate-fade-in"
              style={{ backgroundColor: 'rgba(245,196,0,0.05)', borderColor: 'rgba(245,196,0,0.25)' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(245,196,0,0.15)' }}>
                <UserPlus size={12} style={{ color: 'var(--primary)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>New Lead: {lead.name}</span>
                <span className="text-xs ml-2" style={{ color: 'var(--muted-foreground)' }}>{lead.country} · via {lead.source}</span>
              </div>
              <span className="text-xs shrink-0" style={{ color: 'var(--muted-foreground)' }}>{lead.time}</span>
              <button onClick={() => setDismissedLeads(prev => new Set([...prev, lead.id]))}
                className="p-1 rounded hover:bg-white/10 transition-colors shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                <X size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setShowCreateAgent(true)}
          className="flex items-center gap-3 p-4 rounded-xl border transition-all hover:bg-white/5 active:scale-[0.99] text-left"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(245,196,0,0.12)' }}>
            <UserPlus size={16} style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Create Agent Profile</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Add a new agent to the platform</p>
          </div>
        </button>
        <button
          onClick={() => setShowCreateTask(true)}
          className="flex items-center gap-3 p-4 rounded-xl border transition-all hover:bg-white/5 active:scale-[0.99] text-left"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(34,197,94,0.12)' }}>
            <ClipboardPlus size={16} style={{ color: 'var(--positive)' }} />
          </div>
          <div>
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Assign Task</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Create and assign a task to an agent</p>
          </div>
        </button>
      </div>

      {/* KPIs */}
      {overview && <AdminKpis overview={overview} />}

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <RegistrationsChart data={timeline} />
        <SourcePerformanceChart data={sources} />
      </div>

      {/* Registrations table */}
      <RegistrationsTable registrations={registrations} />

      {/* Create Agent Modal */}
      {showCreateAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl border shadow-2xl" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <Users size={16} style={{ color: 'var(--primary)' }} />
                <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Create Agent Profile</h2>
              </div>
              <button onClick={() => setShowCreateAgent(false)} className="p-1.5 rounded hover:bg-muted transition-colors" style={{ color: 'var(--muted-foreground)' }}>
                <X size={15} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Full Name *</label>
                  <input
                    type="text"
                    value={agentForm.name}
                    onChange={e => setAgentForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Sarah Chen"
                    className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none"
                    style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Email Address *</label>
                  <input
                    type="email"
                    value={agentForm.email}
                    onChange={e => setAgentForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="agent@cryonfx.app"
                    className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none"
                    style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Role</label>
                  <select
                    value={agentForm.role}
                    onChange={e => setAgentForm(p => ({ ...p, role: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none"
                    style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  >
                    {['agent', 'manager', 'support', 'compliance', 'finance', 'marketing'].map(r => (
                      <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Language</label>
                  <select
                    value={agentForm.language}
                    onChange={e => setAgentForm(p => ({ ...p, language: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none"
                    style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  >
                    {['English', 'Spanish', 'French', 'German', 'Arabic', 'Chinese'].map(l => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Phone (optional)</label>
                  <input
                    type="tel"
                    value={agentForm.phone}
                    onChange={e => setAgentForm(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none"
                    style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  />
                </div>
              </div>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                A temporary password will be sent to the agent's email address.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <button onClick={() => setShowCreateAgent(false)} className="px-4 py-2 rounded-lg text-sm border transition-all hover:bg-muted"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                Cancel
              </button>
              <button
                onClick={handleCreateAgent}
                disabled={!agentForm.name || !agentForm.email}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)', color: '#000' }}
              >
                {agentSaved ? <><Check size={14} /> Created!</> : <><UserPlus size={14} /> Create Agent</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="w-full max-w-md rounded-2xl border shadow-2xl" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <ClipboardList size={16} style={{ color: 'var(--positive)' }} />
                <h2 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Assign Task</h2>
              </div>
              <button onClick={() => setShowCreateTask(false)} className="p-1.5 rounded hover:bg-muted transition-colors" style={{ color: 'var(--muted-foreground)' }}>
                <X size={15} />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div>
                <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Task Title *</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={e => setTaskForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Follow up with customer"
                  className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none"
                  style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Assign To *</label>
                  <select
                    value={taskForm.assignedAgent}
                    onChange={e => setTaskForm(p => ({ ...p, assignedAgent: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none"
                    style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  >
                    <option value="">Select agent</option>
                    {MOCK_AGENTS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Customer</label>
                  <select
                    value={taskForm.customer}
                    onChange={e => setTaskForm(p => ({ ...p, customer: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none"
                    style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  >
                    <option value="">Select customer</option>
                    {MOCK_CUSTOMERS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Task Type</label>
                  <select
                    value={taskForm.type}
                    onChange={e => setTaskForm(p => ({ ...p, type: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none"
                    style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  >
                    {['Call Customer', 'Follow-up', 'Review Registration', 'Contact Customer', 'Request Information', 'Verify Information', 'Custom Task'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={e => setTaskForm(p => ({ ...p, priority: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none"
                    style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  >
                    {['Low', 'Medium', 'High', 'Urgent'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={e => setTaskForm(p => ({ ...p, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none"
                    style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>Notes</label>
                  <textarea
                    value={taskForm.notes}
                    onChange={e => setTaskForm(p => ({ ...p, notes: e.target.value }))}
                    placeholder="Additional instructions for the agent..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg text-sm border focus:outline-none resize-none"
                    style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <button onClick={() => setShowCreateTask(false)} className="px-4 py-2 rounded-lg text-sm border transition-all hover:bg-muted"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                disabled={!taskForm.title || !taskForm.assignedAgent}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: 'var(--positive)', color: '#fff' }}
              >
                {taskSaved ? <><Check size={14} /> Assigned!</> : <><ClipboardPlus size={14} /> Assign Task</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}