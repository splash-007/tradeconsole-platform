'use client';
import React, { useState } from 'react';
import { X, MessageSquare, User, Tag, Clock, AlertCircle } from 'lucide-react';
import { PageHeader, Card, AdminTable, StatusBadge, KpiCard, ActionButton } from '@/components/admin/AdminUI';

interface Ticket {
  id: string;
  customerName: string;
  subject: string;
  category: string;
  priority: string;
  status: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

const TICKETS: Ticket[] = [
  { id: 'tkt-001', customerName: 'Alex Morgan', subject: 'Deposit not credited', category: 'Finance', priority: 'high', status: 'open', assignedTo: 'Sarah Chen', createdAt: '2026-08-27 10:00', updatedAt: '2026-08-27 14:00' },
  { id: 'tkt-002', customerName: 'Priya Sharma', subject: 'Verification documents rejected', category: 'Compliance', priority: 'medium', status: 'in_progress', assignedTo: 'James Park', createdAt: '2026-08-27 09:00', updatedAt: '2026-08-27 11:00' },
  { id: 'tkt-003', customerName: 'Marcus Whitfield', subject: 'Cannot login to account', category: 'Technical', priority: 'high', status: 'open', assignedTo: null, createdAt: '2026-08-27 08:00', updatedAt: '2026-08-27 08:00' },
  { id: 'tkt-004', customerName: 'Thomas Bergmann', subject: 'Question about trading fees', category: 'General', priority: 'low', status: 'completed', assignedTo: 'Sarah Chen', createdAt: '2026-08-26 16:00', updatedAt: '2026-08-26 17:00' },
];

function TicketDetailModal({ ticket, onClose }: { ticket: Ticket; onClose: () => void }) {
  const [reply, setReply] = useState('');
  const [status, setStatus] = useState(ticket.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
      <div className="w-full max-w-2xl rounded-xl border shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div>
            <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{ticket.subject}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Ticket #{ticket.id}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-white/5" style={{ color: 'var(--muted-foreground)' }}>
            <X size={16} />
          </button>
        </div>

        {/* Meta info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-5 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2">
            <User size={12} style={{ color: 'var(--muted-foreground)' }} />
            <div>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Customer</p>
              <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{ticket.customerName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Tag size={12} style={{ color: 'var(--muted-foreground)' }} />
            <div>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Category</p>
              <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{ticket.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AlertCircle size={12} style={{ color: 'var(--muted-foreground)' }} />
            <div>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Priority</p>
              <StatusBadge status={ticket.priority} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={12} style={{ color: 'var(--muted-foreground)' }} />
            <div>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Updated</p>
              <p className="text-xs font-medium" style={{ color: 'var(--foreground)' }}>{ticket.updatedAt}</p>
            </div>
          </div>
        </div>

        {/* Conversation area */}
        <div className="px-5 py-4 space-y-3 max-h-64 overflow-y-auto">
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: 'rgba(245,196,0,0.15)', color: 'var(--primary)' }}>
              {ticket.customerName.charAt(0)}
            </div>
            <div className="flex-1 rounded-lg p-3" style={{ backgroundColor: 'var(--background)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{ticket.customerName}</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                Hello, I am having an issue with {ticket.subject.toLowerCase()}. Please help me resolve this as soon as possible.
              </p>
              <p className="text-xs mt-1.5 opacity-60" style={{ color: 'var(--muted-foreground)' }}>{ticket.createdAt}</p>
            </div>
          </div>
          {ticket.assignedTo && (
            <div className="flex gap-3 flex-row-reverse">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ backgroundColor: 'rgba(34,197,94,0.15)', color: '#22c55e' }}>
                {ticket.assignedTo.charAt(0)}
              </div>
              <div className="flex-1 rounded-lg p-3" style={{ backgroundColor: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.15)' }}>
                <p className="text-xs font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{ticket.assignedTo} (Support)</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                  Thank you for reaching out. We have received your ticket and are looking into this matter. We will update you shortly.
                </p>
                <p className="text-xs mt-1.5 opacity-60" style={{ color: 'var(--muted-foreground)' }}>{ticket.updatedAt}</p>
              </div>
            </div>
          )}
        </div>

        {/* Reply + status */}
        <div className="px-5 py-4 border-t space-y-3" style={{ borderColor: 'var(--border)' }}>
          <textarea
            value={reply}
            onChange={e => setReply(e.target.value)}
            placeholder="Type your reply..."
            rows={3}
            className="w-full text-xs px-3 py-2 rounded border outline-none resize-none"
            style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
          />
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Status:</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="text-xs px-2 py-1 rounded border outline-none"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div className="flex gap-2">
              <ActionButton onClick={onClose}>Cancel</ActionButton>
              <ActionButton variant="primary" onClick={() => { onClose(); }}>
                <span className="flex items-center gap-1.5"><MessageSquare size={11} /> Send Reply</span>
              </ActionButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminTicketsContent() {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  return (
    <div className="space-y-4">
      <PageHeader title="Support Tickets" subtitle="Customer support ticket management" actions={<ActionButton variant="primary">Create Ticket</ActionButton>} />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Open Tickets" value={TICKETS.filter(t => t.status === 'open').length} />
        <KpiCard label="In Progress" value={TICKETS.filter(t => t.status === 'in_progress').length} />
        <KpiCard label="Completed" value={TICKETS.filter(t => t.status === 'completed').length} />
        <KpiCard label="Unassigned" value={TICKETS.filter(t => !t.assignedTo).length} />
      </div>
      <Card padding="p-0">
        <AdminTable
          columns={[
            { key: 'id', label: 'ID', render: (t: Ticket) => <span style={{ color: 'var(--primary)', fontFamily: 'monospace' }}>{t.id}</span> },
            { key: 'customerName', label: 'Customer' },
            { key: 'subject', label: 'Subject' },
            { key: 'category', label: 'Category' },
            { key: 'priority', label: 'Priority', render: (t: Ticket) => <StatusBadge status={t.priority} /> },
            { key: 'status', label: 'Status', render: (t: Ticket) => <StatusBadge status={t.status} /> },
            { key: 'assignedTo', label: 'Assigned', render: (t: Ticket) => t.assignedTo || <span style={{ color: '#ef4444' }}>Unassigned</span> },
            { key: 'updatedAt', label: 'Updated' },
            { key: 'actions', label: '', render: (t: Ticket) => <ActionButton onClick={() => setSelectedTicket(t)}>View</ActionButton> },
          ]}
          data={TICKETS}
        />
      </Card>

      {selectedTicket && (
        <TicketDetailModal ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
      )}
    </div>
  );
}
