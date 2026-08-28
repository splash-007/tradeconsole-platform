'use client';
import React, { useEffect, useState } from 'react';
import { platformService, PlatformTask } from '@/services/platform.service';
import { PageHeader, Card, StatusBadge, KpiCard } from '@/components/admin/AdminUI';
import { ExternalLink, X } from 'lucide-react';
import Link from 'next/link';

const AGENT_ID = 'broker-001';
type TaskStatus = PlatformTask['status'];
const STATUSES: TaskStatus[] = ['pending', 'in_progress', 'completed', 'unable_to_complete', 'cancelled'];

function TaskDetailPanel({ task, onClose, onStatusUpdate }: { task: PlatformTask; onClose: () => void; onStatusUpdate: (t: PlatformTask) => void }) {
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setUpdating(true);
    const updated = await platformService.updateTaskStatus(task.id, newStatus, AGENT_ID, 'James Park', 'broker');
    if (updated) onStatusUpdate(updated);
    setUpdating(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
      <div className="w-full max-w-lg rounded-xl border shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Task Detail</p>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-white/5" style={{ color: 'var(--muted-foreground)' }}><X size={15} /></button>
        </div>
        <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Type', task.type.replace(/_/g, ' ')],
              ['Priority', task.priority],
              ['Due Date', task.dueDate],
              ['Created By', task.createdByName],
              ['Manager', task.managerName || '—'],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs mb-0.5" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
                <p className="text-xs font-medium capitalize" style={{ color: 'var(--foreground)' }}>{value}</p>
              </div>
            ))}
          </div>

          <div className="rounded border p-3" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>Customer</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{task.customerName}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{task.customerCountry}</p>
              </div>
              <Link href={`/agent/customers/${task.customerId}`} className="flex items-center gap-1 text-xs" style={{ color: 'var(--primary)' }}>
                <ExternalLink size={11} /> Open
              </Link>
            </div>
          </div>

          {task.notes && (
            <div>
              <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Notes</p>
              <p className="text-xs" style={{ color: 'var(--foreground)' }}>{task.notes}</p>
            </div>
          )}

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>Update Status</p>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map(s => (
                <button key={s} disabled={updating || task.status === s}
                  onClick={() => handleStatusChange(s)}
                  className="text-xs px-3 py-1.5 rounded border capitalize transition-colors"
                  style={{
                    borderColor: task.status === s ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: task.status === s ? 'rgba(var(--primary-rgb),0.1)' : 'transparent',
                    color: task.status === s ? 'var(--primary)' : 'var(--muted-foreground)',
                    opacity: updating ? 0.5 : 1,
                  }}>
                  {s.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted-foreground)' }}>Activity Log</p>
            <div className="space-y-2">
              {task.activityLog.map(entry => (
                <div key={entry.id} className="flex gap-3 text-xs">
                  <span className="shrink-0 font-mono" style={{ color: 'var(--primary)' }}>{entry.timestamp}</span>
                  <div>
                    <span style={{ color: 'var(--foreground)' }}>{entry.action}</span>
                    {entry.previousStatus && entry.newStatus && (
                      <span style={{ color: 'var(--muted-foreground)' }}> · {entry.previousStatus} → {entry.newStatus}</span>
                    )}
                    <span className="ml-1" style={{ color: 'var(--muted-foreground)' }}>by {entry.actorName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex justify-end px-5 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <button onClick={onClose} className="text-xs px-4 py-2 rounded border hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>Close</button>
        </div>
      </div>
    </div>
  );
}

export default function AgentTasksContent() {
  const [tasks, setTasks] = useState<PlatformTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<PlatformTask | null>(null);

  useEffect(() => {
    platformService.getTasks({ staffId: AGENT_ID }).then(d => { setTasks(d); setLoading(false); });
  }, []);

  // Subscribe to task updates from platform
  useEffect(() => {
    const unsub = platformService.subscribe(event => {
      if (event.type === 'task_updated' || event.type === 'task_created') {
        platformService.getTasks({ staffId: AGENT_ID }).then(setTasks);
      }
    });
    return unsub;
  }, []);

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);
  const statusFilters = ['all', ...STATUSES];

  const handleStatusUpdate = (updated: PlatformTask) => {
    setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    if (selectedTask?.id === updated.id) setSelectedTask(updated);
  };

  return (
    <div className="space-y-4">
      <PageHeader title="My Tasks" subtitle="Tasks assigned to you — connected to customers and managers" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total" value={tasks.length} />
        <KpiCard label="Overdue" value={tasks.filter(t => t.status === 'overdue').length} />
        <KpiCard label="In Progress" value={tasks.filter(t => t.status === 'in_progress').length} />
        <KpiCard label="Pending" value={tasks.filter(t => t.status === 'pending').length} />
      </div>
      <Card padding="p-0">
        <div className="flex gap-1 p-3 border-b overflow-x-auto" style={{ borderColor: 'var(--border)' }}>
          {statusFilters.map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className="text-xs px-2.5 py-1 rounded capitalize whitespace-nowrap transition-colors"
              style={{
                backgroundColor: filter === s ? 'var(--primary)' : 'transparent',
                color: filter === s ? '#000' : 'var(--muted-foreground)',
                border: `1px solid ${filter === s ? 'var(--primary)' : 'var(--border)'}`,
              }}>
              {s.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
        {loading ? (
          <div className="animate-pulse space-y-2 p-4">
            {Array.from({ length: 5 }, (_, i) => <div key={i} className="h-8 rounded" style={{ backgroundColor: 'var(--muted)' }} />)}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Customer', 'Type', 'Priority', 'Status', 'Due', 'Manager', 'Notes', ''].map(h => (
                    <th key={h} className="text-left px-3 py-2 font-semibold uppercase tracking-wider whitespace-nowrap"
                      style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-8" style={{ color: 'var(--muted-foreground)' }}>No tasks found</td></tr>
                ) : (
                  filtered.map((task, idx) => (
                    <tr key={task.id} className="hover:bg-white/3 transition-colors"
                      style={{ borderBottom: '1px solid var(--border)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <td className="px-3 py-2.5">
                        <Link href={`/agent/customers/${task.customerId}`} className="font-medium hover:underline" style={{ color: 'var(--primary)' }}>
                          {task.customerName}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 capitalize" style={{ color: 'var(--muted-foreground)' }}>{task.type.replace(/_/g, ' ')}</td>
                      <td className="px-3 py-2.5"><StatusBadge status={task.priority} /></td>
                      <td className="px-3 py-2.5"><StatusBadge status={task.status} /></td>
                      <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>{task.dueDate}</td>
                      <td className="px-3 py-2.5" style={{ color: 'var(--muted-foreground)' }}>{task.managerName || '—'}</td>
                      <td className="px-3 py-2.5 max-w-xs">
                        <span className="truncate block" style={{ color: 'var(--muted-foreground)' }}>{task.notes}</span>
                      </td>
                      <td className="px-3 py-2.5">
                        <button onClick={() => setSelectedTask(task)}
                          className="text-xs px-2 py-0.5 rounded border hover:bg-white/5 transition-colors"
                          style={{ borderColor: 'var(--border)', color: 'var(--primary)' }}>
                          Open
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

      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}
