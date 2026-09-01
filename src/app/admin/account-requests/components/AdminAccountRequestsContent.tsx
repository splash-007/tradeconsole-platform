'use client';
import React, { useState } from 'react';
import { PageHeader, Card } from '@/components/admin/AdminUI';
import { CheckCircle, XCircle, Globe, RefreshCw, Ban, RotateCcw } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

type AccountRequestStatus =
  | 'draft' |'pending_approval' |'approved' |'rejected' |'provisioning' |'provisioned' |'invite_sent' |'activated' |'cancelled';

interface MarketingSite {
  id: string;
  name: string;
  domain: string;
  loginUrl: string;
  status: 'active' | 'inactive';
}

interface AccountRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  leadSource: string;
  requestingManager: string;
  assignedManager: string;
  marketingSite: MarketingSite;
  requestReason: string;
  requestedAt: string;
  status: AccountRequestStatus;
  approvalHistory: { action: string; actor: string; timestamp: string; note?: string }[];
  mustChangePassword: boolean;
  accountActivated: boolean;
  username?: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_SITES: MarketingSite[] = [
  { id: 'site-001', name: 'CryonFX', domain: 'cryonfx.com', loginUrl: 'https://cryonfx.com/login', status: 'active' },
  { id: 'site-002', name: 'TradeHub', domain: 'tradehub.io', loginUrl: 'https://tradehub.io/login', status: 'active' },
];

const MOCK_REQUESTS: AccountRequest[] = [
  {
    id: 'acr-001',
    customerId: 'cust-001',
    customerName: 'Alex Morgan',
    customerEmail: 'alex.morgan@email.com',
    leadSource: 'Google Ads — CryonFX Campaign',
    requestingManager: 'Sarah Chen',
    assignedManager: 'Sarah Chen',
    marketingSite: MOCK_SITES[0],
    requestReason: 'Customer completed onboarding call. Ready to activate trading account.',
    requestedAt: '2026-08-28 14:32',
    status: 'pending_approval',
    approvalHistory: [
      { action: 'ACCOUNT_CREATION_REQUESTED', actor: 'Sarah Chen', timestamp: '2026-08-28 14:32', note: 'Customer completed onboarding call.' },
    ],
    mustChangePassword: true,
    accountActivated: false,
  },
  {
    id: 'acr-002',
    customerId: 'cust-002',
    customerName: 'Priya Sharma',
    customerEmail: 'priya.sharma@email.com',
    leadSource: 'Organic — CryonFX',
    requestingManager: 'James Wilson',
    assignedManager: 'James Wilson',
    marketingSite: MOCK_SITES[0],
    requestReason: 'Lead converted after 3 follow-up calls. Deposit intent confirmed.',
    requestedAt: '2026-08-27 10:15',
    status: 'approved',
    approvalHistory: [
      { action: 'ACCOUNT_CREATION_REQUESTED', actor: 'James Wilson', timestamp: '2026-08-27 10:15' },
      { action: 'ACCOUNT_REQUEST_APPROVED', actor: 'Admin', timestamp: '2026-08-27 11:00', note: 'Approved — all checks passed.' },
    ],
    mustChangePassword: true,
    accountActivated: false,
    username: 'priya.sharma.2026',
  },
  {
    id: 'acr-003',
    customerId: 'cust-003',
    customerName: 'Thomas Bergmann',
    customerEmail: 'thomas.b@email.com',
    leadSource: 'Referral — TradeHub',
    requestingManager: 'Maria Lopez',
    assignedManager: 'Maria Lopez',
    marketingSite: MOCK_SITES[1],
    requestReason: 'High-value lead. Confirmed $25,000 initial deposit intent.',
    requestedAt: '2026-08-25 09:00',
    status: 'provisioned',
    approvalHistory: [
      { action: 'ACCOUNT_CREATION_REQUESTED', actor: 'Maria Lopez', timestamp: '2026-08-25 09:00' },
      { action: 'ACCOUNT_REQUEST_APPROVED', actor: 'Super Admin', timestamp: '2026-08-25 09:30' },
      { action: 'CUSTOMER_ACCOUNT_PROVISIONED', actor: 'System', timestamp: '2026-08-25 09:31' },
      { action: 'ACCOUNT_INVITATION_SENT', actor: 'System', timestamp: '2026-08-25 09:32' },
    ],
    mustChangePassword: true,
    accountActivated: false,
    username: 'thomas.bergmann.2026',
  },
  {
    id: 'acr-004',
    customerId: 'cust-004',
    customerName: 'David Kim',
    customerEmail: 'david.kim@email.com',
    leadSource: 'Facebook Ads — CryonFX',
    requestingManager: 'Sarah Chen',
    assignedManager: 'Sarah Chen',
    marketingSite: MOCK_SITES[0],
    requestReason: 'Customer requested account creation after demo session.',
    requestedAt: '2026-08-20 16:45',
    status: 'rejected',
    approvalHistory: [
      { action: 'ACCOUNT_CREATION_REQUESTED', actor: 'Sarah Chen', timestamp: '2026-08-20 16:45' },
      { action: 'ACCOUNT_REQUEST_REJECTED', actor: 'Admin', timestamp: '2026-08-21 09:00', note: 'Incomplete KYC documentation. Resubmit after verification.' },
    ],
    mustChangePassword: false,
    accountActivated: false,
  },
  {
    id: 'acr-005',
    customerId: 'cust-005',
    customerName: 'Maria Garcia',
    customerEmail: 'maria.garcia@email.com',
    leadSource: 'Organic — CryonFX',
    requestingManager: 'James Wilson',
    assignedManager: 'James Wilson',
    marketingSite: MOCK_SITES[0],
    requestReason: 'Fully verified customer. Ready for account activation.',
    requestedAt: '2026-08-15 11:20',
    status: 'activated',
    approvalHistory: [
      { action: 'ACCOUNT_CREATION_REQUESTED', actor: 'James Wilson', timestamp: '2026-08-15 11:20' },
      { action: 'ACCOUNT_REQUEST_APPROVED', actor: 'Admin', timestamp: '2026-08-15 12:00' },
      { action: 'CUSTOMER_ACCOUNT_PROVISIONED', actor: 'System', timestamp: '2026-08-15 12:01' },
      { action: 'ACCOUNT_INVITATION_SENT', actor: 'System', timestamp: '2026-08-15 12:02' },
      { action: 'ACCOUNT_ACTIVATED', actor: 'System', timestamp: '2026-08-16 08:30', note: 'Customer completed first login and set password.' },
    ],
    mustChangePassword: false,
    accountActivated: true,
    username: 'maria.garcia.2026',
  },
];

// ── Status helpers ─────────────────────────────────────────────────────────

const STATUS_LABELS: Record<AccountRequestStatus, string> = {
  draft: 'Draft',
  pending_approval: 'Pending Approval',
  approved: 'Approved',
  rejected: 'Rejected',
  provisioning: 'Provisioning',
  provisioned: 'Provisioned',
  invite_sent: 'Invite Sent',
  activated: 'Activated',
  cancelled: 'Cancelled',
};

const STATUS_COLORS: Record<AccountRequestStatus, string> = {
  draft: '#6B7280',
  pending_approval: '#D97706',
  approved: '#2563EB',
  rejected: '#DC2626',
  provisioning: '#7C3AED',
  provisioned: '#059669',
  invite_sent: '#0891B2',
  activated: '#16A34A',
  cancelled: '#6B7280',
};

const TAB_STATUSES: { label: string; values: AccountRequestStatus[] }[] = [
  { label: 'Pending', values: ['pending_approval', 'draft'] },
  { label: 'Approved', values: ['approved', 'provisioning'] },
  { label: 'Provisioned', values: ['provisioned', 'invite_sent'] },
  { label: 'Activated', values: ['activated'] },
  { label: 'Rejected', values: ['rejected', 'cancelled'] },
  { label: 'All', values: ['draft', 'pending_approval', 'approved', 'rejected', 'provisioning', 'provisioned', 'invite_sent', 'activated', 'cancelled'] },
];

// ── Component ──────────────────────────────────────────────────────────────

export default function AdminAccountRequestsContent() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedRequest, setSelectedRequest] = useState<AccountRequest | null>(null);
  const [requests, setRequests] = useState<AccountRequest[]>(MOCK_REQUESTS);
  const [actionNote, setActionNote] = useState('');
  const [showActionModal, setShowActionModal] = useState<{ type: 'approve' | 'reject'; request: AccountRequest } | null>(null);

  const filtered = requests.filter(r => TAB_STATUSES[activeTab].values.includes(r.status));

  const handleApprove = (req: AccountRequest) => {
    setShowActionModal({ type: 'approve', request: req });
    setActionNote('');
  };

  const handleReject = (req: AccountRequest) => {
    setShowActionModal({ type: 'reject', request: req });
    setActionNote('');
  };

  const confirmAction = () => {
    if (!showActionModal) return;
    const { type, request } = showActionModal;
    const newStatus: AccountRequestStatus = type === 'approve' ? 'approved' : 'rejected';
    const auditEvent = type === 'approve' ? 'ACCOUNT_REQUEST_APPROVED' : 'ACCOUNT_REQUEST_REJECTED';

    setRequests(prev => prev.map(r => r.id === request.id ? {
      ...r,
      status: newStatus,
      approvalHistory: [...r.approvalHistory, {
        action: auditEvent,
        actor: 'Admin',
        timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
        note: actionNote || undefined,
      }],
    } : r));

    if (selectedRequest?.id === request.id) {
      setSelectedRequest(prev => prev ? {
        ...prev,
        status: newStatus,
        approvalHistory: [...prev.approvalHistory, {
          action: auditEvent,
          actor: 'Admin',
          timestamp: new Date().toISOString().slice(0, 16).replace('T', ' '),
          note: actionNote || undefined,
        }],
      } : null);
    }

    setShowActionModal(null);
    setActionNote('');
  };

  return (
    <div className="space-y-4 py-4">
      <PageHeader
        title="Account Requests"
        subtitle="Review and manage customer account provisioning requests from managers"
        actions={
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#D97706' }} />
            {requests.filter(r => r.status === 'pending_approval').length} pending approval
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b" style={{ borderColor: 'var(--border)' }}>
        {TAB_STATUSES.map((tab, i) => {
          const count = requests.filter(r => tab.values.includes(r.status)).length;
          return (
            <button
              key={tab.label}
              onClick={() => setActiveTab(i)}
              className="px-3 py-2 text-xs font-medium border-b-2 transition-colors"
              style={{
                borderBottomColor: activeTab === i ? 'var(--primary)' : 'transparent',
                color: activeTab === i ? 'var(--foreground)' : 'var(--muted-foreground)',
              }}
            >
              {tab.label}
              {count > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs font-semibold"
                  style={{ backgroundColor: activeTab === i ? 'var(--primary)' : 'var(--muted)', color: activeTab === i ? 'var(--primary-foreground)' : 'var(--muted-foreground)' }}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Request List */}
        <div className="lg:col-span-2 space-y-2">
          {filtered.length === 0 && (
            <div className="text-xs text-center py-8" style={{ color: 'var(--muted-foreground)' }}>No requests in this category.</div>
          )}
          {filtered.map(req => (
            <button
              key={req.id}
              onClick={() => setSelectedRequest(req)}
              className="w-full text-left p-3 rounded border transition-all hover:border-primary"
              style={{
                backgroundColor: selectedRequest?.id === req.id ? 'rgba(212,168,0,0.06)' : 'var(--card)',
                borderColor: selectedRequest?.id === req.id ? 'var(--primary)' : 'var(--border)',
              }}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{req.customerName}</span>
                <span className="text-xs px-1.5 py-0.5 rounded font-medium shrink-0"
                  style={{ backgroundColor: `${STATUS_COLORS[req.status]}18`, color: STATUS_COLORS[req.status] }}>
                  {STATUS_LABELS[req.status]}
                </span>
              </div>
              <div className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>{req.customerEmail}</div>
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                <Globe size={10} />
                <span>{req.marketingSite.name}</span>
                <span>·</span>
                <span>{req.requestingManager}</span>
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>{req.requestedAt}</div>
            </button>
          ))}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-3">
          {!selectedRequest ? (
            <Card>
              <div className="text-xs text-center py-12" style={{ color: 'var(--muted-foreground)' }}>
                Select a request to view details
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {/* Header */}
              <Card>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h2 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>{selectedRequest.customerName}</h2>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{selectedRequest.customerEmail}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded font-medium"
                    style={{ backgroundColor: `${STATUS_COLORS[selectedRequest.status]}18`, color: STATUS_COLORS[selectedRequest.status] }}>
                    {STATUS_LABELS[selectedRequest.status]}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs mb-3">
                  {[
                    ['Lead Source', selectedRequest.leadSource],
                    ['Requesting Manager', selectedRequest.requestingManager],
                    ['Assigned Manager', selectedRequest.assignedManager],
                    ['Request Date', selectedRequest.requestedAt],
                    ['Marketing Site', `${selectedRequest.marketingSite.name} (${selectedRequest.marketingSite.domain})`],
                    ['Login URL', selectedRequest.marketingSite.loginUrl],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <span style={{ color: 'var(--muted-foreground)' }}>{label}</span>
                      <p className="font-medium mt-0.5" style={{ color: 'var(--foreground)' }}>{value}</p>
                    </div>
                  ))}
                </div>

                <div className="p-2 rounded text-xs" style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }}>
                  <span className="font-medium" style={{ color: 'var(--muted-foreground)' }}>Request Reason: </span>
                  {selectedRequest.requestReason}
                </div>

                {selectedRequest.username && (
                  <div className="mt-2 p-2 rounded text-xs border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--input)' }}>
                    <span className="font-medium" style={{ color: 'var(--muted-foreground)' }}>Generated Username: </span>
                    <span className="font-mono font-semibold" style={{ color: 'var(--foreground)' }}>{selectedRequest.username}</span>
                    <span className="ml-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>(assigned by backend)</span>
                  </div>
                )}
              </Card>

              {/* Actions */}
              {(selectedRequest.status === 'pending_approval' || selectedRequest.status === 'draft') && (
                <Card>
                  <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Actions</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(selectedRequest)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                      style={{ backgroundColor: '#16A34A', color: '#fff' }}
                    >
                      <CheckCircle size={12} /> Approve
                    </button>
                    <button
                      onClick={() => handleReject(selectedRequest)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors"
                      style={{ backgroundColor: '#DC2626', color: '#fff' }}
                    >
                      <XCircle size={12} /> Reject
                    </button>
                  </div>
                  <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>
                    Approval triggers backend provisioning. Actual authorization is validated server-side.
                  </p>
                </Card>
              )}

              {(selectedRequest.status === 'provisioned' || selectedRequest.status === 'invite_sent') && (
                <Card>
                  <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Actions</h3>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors"
                      style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                      <RefreshCw size={12} /> Resend Invitation
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors"
                      style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                      <Ban size={12} /> Disable Account
                    </button>
                  </div>
                </Card>
              )}

              {selectedRequest.status === 'activated' && (
                <Card>
                  <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Actions</h3>
                  <div className="flex gap-2">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors"
                      style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                      <RotateCcw size={12} /> Reset Access
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors"
                      style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                      <Ban size={12} /> Disable Account
                    </button>
                  </div>
                </Card>
              )}

              {/* Approval History */}
              <Card>
                <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Approval History</h3>
                <div className="space-y-2">
                  {selectedRequest.approvalHistory.map((entry, i) => (
                    <div key={i} className="flex gap-3 text-xs">
                      <div className="flex flex-col items-center">
                        <div className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ backgroundColor: 'var(--primary)' }} />
                        {i < selectedRequest.approvalHistory.length - 1 && (
                          <div className="w-px flex-1 mt-1" style={{ backgroundColor: 'var(--border)' }} />
                        )}
                      </div>
                      <div className="pb-2">
                        <div className="font-mono font-medium" style={{ color: 'var(--foreground)' }}>{entry.action}</div>
                        <div style={{ color: 'var(--muted-foreground)' }}>{entry.actor} · {entry.timestamp}</div>
                        {entry.note && <div className="mt-0.5 italic" style={{ color: 'var(--muted-foreground)' }}>{entry.note}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Account Flags */}
              <Card>
                <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Account Flags</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: 'var(--muted)' }}>
                    <span style={{ color: 'var(--muted-foreground)' }}>mustChangePassword</span>
                    <span className="font-mono font-semibold" style={{ color: selectedRequest.mustChangePassword ? '#D97706' : '#16A34A' }}>
                      {String(selectedRequest.mustChangePassword)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded" style={{ backgroundColor: 'var(--muted)' }}>
                    <span style={{ color: 'var(--muted-foreground)' }}>accountActivated</span>
                    <span className="font-mono font-semibold" style={{ color: selectedRequest.accountActivated ? '#16A34A' : '#6B7280' }}>
                      {String(selectedRequest.accountActivated)}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded border p-5 shadow-xl"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--foreground)' }}>
              {showActionModal.type === 'approve' ? 'Approve Account Request' : 'Reject Account Request'}
            </h3>
            <p className="text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>
              {showActionModal.type === 'approve'
                ? `Approving will trigger backend provisioning for ${showActionModal.request.customerName}.`
                : `Rejecting will notify the requesting manager. The customer will not receive account access.`}
            </p>
            <textarea
              className="w-full text-xs p-2 rounded border resize-none"
              style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              rows={3}
              placeholder="Optional note..."
              value={actionNote}
              onChange={e => setActionNote(e.target.value)}
            />
            <div className="flex gap-2 mt-3 justify-end">
              <button
                onClick={() => setShowActionModal(null)}
                className="px-3 py-1.5 rounded text-xs border"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="px-3 py-1.5 rounded text-xs font-medium text-white"
                style={{ backgroundColor: showActionModal.type === 'approve' ? '#16A34A' : '#DC2626' }}
              >
                {showActionModal.type === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
