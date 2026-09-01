'use client';
import React, { useEffect, useState } from 'react';
import { agentService, AssignedCustomer } from '@/services/agent.service';
import { callingService, CallSession, CallState } from '@/services/calling.service';
import { chatService, ChatMessage } from '@/services/chat.service';
import { financeService, DepositRequest, WithdrawalRequest } from '@/services/finance.service';
import { PageHeader, Card, ActionButton, StatusBadge } from '@/components/admin/AdminUI';
import AssetControlPanel from '@/components/agent/AssetControlPanel';

import { Shield, ArrowDownLeft, ArrowUpRight, UserPlus, Globe, X } from 'lucide-react';

const AGENT_ID = 'agent-001';
const ONLINE_DOT: Record<string, string> = { online: '#22c55e', away: '#f59e0b', offline: '#6b7280' };

const TIMELINE = [
  { time: '14:40', event: 'Registration created', actor: 'System' },
  { time: '14:43', event: 'Assigned to Sarah Chen', actor: 'Admin' },
  { time: '15:05', event: 'Call started', actor: 'Sarah Chen' },
  { time: '15:09', event: 'Call ended — Connected (4:32)', actor: 'System' },
  { time: '15:32', event: 'Customer sent message', actor: 'Alex Morgan' },
  { time: '15:34', event: 'Agent replied', actor: 'Sarah Chen' },
];

const MARKETING_SITES = [
  { id: 'site-001', name: 'CryonFX', domain: 'cryonfx.com', loginUrl: 'https://cryonfx.com/login' },
  { id: 'site-002', name: 'TradeHub', domain: 'tradehub.io', loginUrl: 'https://tradehub.io/login' },
];

export default function AgentCustomerDetailContent({ customerId }: { customerId: string }) {
  const [customer, setCustomer] = useState<AssignedCustomer | null>(null);
  const [callSession, setCallSession] = useState<CallSession | null>(null);
  const [callState, setCallState] = useState<CallState>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [onHold, setOnHold] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [internalNote, setInternalNote] = useState('');
  const [activeTab, setActiveTab] = useState<'chat' | 'notes' | 'timeline' | 'kyc' | 'finance' | 'assets'>('chat');
  const [loading, setLoading] = useState(true);
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [financeTab, setFinanceTab] = useState<'deposits' | 'withdrawals'>('deposits');

  // Request Account modal state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    selectedSiteId: '',
    requestReason: '',
  });
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  useEffect(() => {
    agentService.getCustomerDetail(customerId, AGENT_ID).then(c => {
      setCustomer(c);
      setLoading(false);
    });
    chatService.getMessages('conv-001', true).then(setMessages);
    financeService.getDeposits(customerId).then(setDeposits);
    financeService.getWithdrawals(customerId).then(setWithdrawals);
  }, [customerId]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (callState === 'connected') {
      interval = setInterval(() => setCallDuration(d => d + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const handleCall = async () => {
    if (callState !== 'idle') return;
    setCallState('connecting');
    const res = await callingService.initiateCall({ customerId, agentId: AGENT_ID });
    if (res.success && res.session) {
      setCallSession(res.session);
      setTimeout(() => setCallState('ringing'), 1000);
      setTimeout(() => { setCallState('connected'); setCallDuration(0); }, 2500);
    }
  };

  const handleEndCall = async () => {
    if (callSession) await callingService.endCall(callSession.sessionId);
    setCallState('ended');
    setTimeout(() => { setCallState('idle'); setCallDuration(0); setCallSession(null); }, 2000);
  };

  const formatDuration = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const msg = await chatService.sendMessage('conv-001', newMessage, false);
    setMessages(prev => [...prev, msg]);
    setNewMessage('');
  };

  const addNote = async () => {
    if (!internalNote.trim()) return;
    const msg = await chatService.sendMessage('conv-001', internalNote, true);
    setMessages(prev => [...prev, msg]);
    setInternalNote('');
  };

  const handleSubmitAccountRequest = () => {
    if (!requestForm.selectedSiteId || !requestForm.requestReason.trim()) return;
    // Frontend contract: POST /api/v1/account-requests
    // Body: { customerId, marketingSiteId, requestReason, requestingManagerId }
    setRequestSubmitted(true);
    setTimeout(() => {
      setShowRequestModal(false);
      setRequestSubmitted(false);
      setRequestForm({ selectedSiteId: '', requestReason: '' });
    }, 1500);
  };

  if (loading || !customer) return <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Loading...</div>;

  const CALL_STATE_LABELS: Record<CallState, string> = {
    idle: '', connecting: 'Connecting...', ringing: 'Ringing...', connected: formatDuration(callDuration),
    ended: 'Call Ended', failed: 'Call Failed', unavailable: 'Unavailable',
  };

  const TABS: { id: typeof activeTab; label: string }[] = [
    { id: 'chat', label: 'Chat' },
    { id: 'notes', label: 'Notes' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'kyc', label: 'KYC' },
    { id: 'finance', label: 'Finance' },
    { id: 'assets', label: 'Assets' },
  ];

  const selectedSite = MARKETING_SITES.find(s => s.id === requestForm.selectedSiteId);

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${customer.firstName} ${customer.lastName}`}
        subtitle={`${customer.country} · ${customer.registrationSource || '—'} · Assigned ${customer.assignedDate}`}
        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ONLINE_DOT[customer.onlineStatus] }} />
              <span className="text-xs capitalize" style={{ color: 'var(--muted-foreground)' }}>{customer.onlineStatus}</span>
            </div>
            <button
              onClick={() => setShowRequestModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors hover:bg-primary/10"
              style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}
            >
              <UserPlus size={12} />
              Request Account
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Customer info */}
        <Card>
          <h3 className="text-xs font-semibold mb-3 uppercase tracking-wider" style={{ color: 'var(--muted-foreground)' }}>Customer Info</h3>
          <div className="space-y-2 text-xs">
            {[
              ['Name', `${customer.firstName} ${customer.lastName}`],
              ['Country', customer.country],
              ['Status', customer.status],
              ['Source', customer.registrationSource || '—'],
              ['Campaign', customer.campaign || '—'],
              ['Priority', customer.priority],
              ['Last Contact', customer.lastContact || '—'],
              ['Next Action', customer.nextAction || '—'],
              ['Email', customer.email === null ? '🔒 Hidden' : customer.email || '—'],
              ['Phone', customer.phone === null ? '🔒 Hidden' : customer.phone || '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span style={{ color: 'var(--muted-foreground)' }}>{label}</span>
                <span style={{ color: String(value).includes('🔒') ? '#ef4444' : 'var(--foreground)' }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Quick stats */}
          <div className="mt-3 pt-3 border-t grid grid-cols-2 gap-2" style={{ borderColor: 'var(--border)' }}>
            <div className="text-center p-2 rounded" style={{ backgroundColor: 'rgba(34,197,94,0.08)' }}>
              <p className="text-xs font-bold" style={{ color: '#22c55e' }}>${deposits.reduce((s, d) => s + d.amount, 0).toLocaleString()}</p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Total Deposits</p>
            </div>
            <div className="text-center p-2 rounded" style={{ backgroundColor: 'rgba(239,68,68,0.08)' }}>
              <p className="text-xs font-bold" style={{ color: '#ef4444' }}>${withdrawals.reduce((s, w) => s + w.amount, 0).toLocaleString()}</p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Withdrawals</p>
            </div>
          </div>

          {/* Call button */}
          <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
            {callState === 'idle' ? (
              <ActionButton variant="primary" onClick={handleCall}>📞 Call Customer</ActionButton>
            ) : (
              <div className="space-y-2">
                <div className="text-center py-2 rounded" style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}>
                  <p className="text-xs font-medium" style={{ color: callState === 'connected' ? '#22c55e' : 'var(--primary)' }}>
                    {callState === 'connecting' && 'Calling...'}
                    {callState === 'ringing' && `Calling ${customer.firstName} ${customer.lastName}...`}
                    {callState === 'connected' && `Connected · ${formatDuration(callDuration)}`}
                    {callState === 'ended' && 'Call Ended'}
                  </p>
                </div>
                {(callState === 'connected' || callState === 'ringing') && (
                  <div className="flex gap-1">
                    <button onClick={() => { setMuted(!muted); callingService.muteCall(callSession?.sessionId || '', !muted); }}
                      className="flex-1 text-xs py-1.5 rounded border transition-colors"
                      style={{ borderColor: 'var(--border)', color: muted ? 'var(--primary)' : 'var(--muted-foreground)', backgroundColor: muted ? 'rgba(245,196,0,0.1)' : 'transparent' }}>
                      {muted ? 'Unmute' : 'Mute'}
                    </button>
                    <button onClick={() => { setOnHold(!onHold); callingService.holdCall(callSession?.sessionId || '', !onHold); }}
                      className="flex-1 text-xs py-1.5 rounded border transition-colors"
                      style={{ borderColor: 'var(--border)', color: onHold ? 'var(--primary)' : 'var(--muted-foreground)', backgroundColor: onHold ? 'rgba(245,196,0,0.1)' : 'transparent' }}>
                      {onHold ? 'Resume' : 'Hold'}
                    </button>
                    <button onClick={handleEndCall}
                      className="flex-1 text-xs py-1.5 rounded border transition-colors"
                      style={{ borderColor: 'rgba(239,68,68,0.4)', color: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)' }}>
                      End
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Tabbed panel */}
        <div className="md:col-span-2">
          <Card padding="p-0">
            <div className="flex border-b overflow-x-auto no-scrollbar" style={{ borderColor: 'var(--border)' }}>
              {TABS.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className="text-xs px-3 py-2.5 capitalize transition-colors shrink-0"
                  style={{ color: activeTab === tab.id ? 'var(--primary)' : 'var(--muted-foreground)', borderBottom: activeTab === tab.id ? '2px solid var(--primary)' : '2px solid transparent' }}>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Chat */}
            {activeTab === 'chat' && (
              <div className="flex flex-col h-80">
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {messages.filter(m => !m.isInternal).map(msg => (
                    <div key={msg.id} className={`flex flex-col ${msg.senderRole === 'customer' ? 'items-start' : 'items-end'}`}>
                      <div className="max-w-xs px-3 py-2 rounded text-xs"
                        style={{ backgroundColor: msg.senderRole === 'customer' ? 'var(--muted)' : 'rgba(245,196,0,0.1)' }}>
                        <p className="font-semibold mb-0.5 text-xs" style={{ color: msg.senderRole === 'customer' ? 'var(--foreground)' : 'var(--primary)' }}>{msg.senderName}</p>
                        <p style={{ color: 'var(--foreground)' }}>{msg.content}</p>
                        <p className="text-xs mt-1 opacity-60">{msg.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t flex gap-2" style={{ borderColor: 'var(--border)' }}>
                  <input value={newMessage} onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 text-xs px-3 py-2 rounded border outline-none"
                    style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                  <ActionButton variant="primary" onClick={sendMessage}>Send</ActionButton>
                </div>
              </div>
            )}

            {/* Notes */}
            {activeTab === 'notes' && (
              <div className="flex flex-col h-80">
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  <div className="text-xs p-2 rounded" style={{ backgroundColor: 'rgba(245,196,0,0.05)', color: 'var(--muted-foreground)' }}>
                    🔒 Internal notes are NEVER visible to the customer
                  </div>
                  {messages.filter(m => m.isInternal).map(msg => (
                    <div key={msg.id} className="p-3 rounded border text-xs" style={{ borderColor: 'rgba(245,196,0,0.3)', backgroundColor: 'rgba(245,196,0,0.05)' }}>
                      <p className="font-semibold mb-1" style={{ color: 'var(--primary)' }}>Internal Note — {msg.senderName}</p>
                      <p style={{ color: 'var(--foreground)' }}>{msg.content}</p>
                      <p className="mt-1 opacity-60">{msg.timestamp}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t flex gap-2" style={{ borderColor: 'var(--border)' }}>
                  <input value={internalNote} onChange={e => setInternalNote(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addNote()}
                    placeholder="Add internal note..."
                    className="flex-1 text-xs px-3 py-2 rounded border outline-none"
                    style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }} />
                  <ActionButton onClick={addNote}>Add Note</ActionButton>
                </div>
              </div>
            )}

            {/* Timeline */}
            {activeTab === 'timeline' && (
              <div className="p-3 space-y-2 h-80 overflow-y-auto">
                {TIMELINE.map((t, i) => (
                  <div key={i} className="flex gap-3 text-xs">
                    <span className="shrink-0 font-mono w-12" style={{ color: 'var(--primary)' }}>{t.time}</span>
                    <div className="flex-1 pb-2 border-b" style={{ borderColor: 'var(--border)' }}>
                      <span style={{ color: 'var(--foreground)' }}>{t.event}</span>
                      <span className="ml-2" style={{ color: 'var(--muted-foreground)' }}>· {t.actor}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* KYC */}
            {activeTab === 'kyc' && (
              <div className="p-3 h-80 overflow-y-auto">
                <div className="flex items-center gap-2 mb-3">
                  <Shield size={14} style={{ color: 'var(--primary)' }} />
                  <h4 className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>KYC Verification Status</h4>
                </div>
                <div className="space-y-2 text-xs">
                  {[
                    { label: 'Identity Verification', status: 'verified' },
                    { label: 'Address Verification', status: 'verified' },
                    { label: 'Document Upload', status: 'verified' },
                    { label: 'Selfie Check', status: 'pending' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between p-2 rounded border" style={{ borderColor: 'var(--border)' }}>
                      <span style={{ color: 'var(--foreground)' }}>{item.label}</span>
                      <StatusBadge status={item.status} />
                    </div>
                  ))}
                </div>
                <div className="mt-3 p-2 rounded text-xs" style={{ backgroundColor: 'rgba(245,196,0,0.06)', color: 'var(--muted-foreground)' }}>
                  Overall KYC Status: <span style={{ color: 'var(--primary)' }}>Partially Verified</span>
                </div>
              </div>
            )}

            {/* Finance */}
            {activeTab === 'finance' && (
              <div className="h-80 overflow-y-auto">
                <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
                  {(['deposits', 'withdrawals'] as const).map(ft => (
                    <button key={ft} onClick={() => setFinanceTab(ft)}
                      className="text-xs px-4 py-2 capitalize transition-colors"
                      style={{ color: financeTab === ft ? 'var(--primary)' : 'var(--muted-foreground)', borderBottom: financeTab === ft ? '2px solid var(--primary)' : '2px solid transparent' }}>
                      {ft}
                    </button>
                  ))}
                </div>
                <div className="p-3 space-y-2">
                  {financeTab === 'deposits' && deposits.map(d => (
                    <div key={d.id} className="flex items-center gap-3 p-2 rounded border text-xs" style={{ borderColor: 'var(--border)' }}>
                      <ArrowDownLeft size={12} style={{ color: '#22c55e' }} />
                      <div className="flex-1">
                        <p style={{ color: 'var(--foreground)' }}>+${d.amount.toLocaleString()} {d.currency}</p>
                        <p style={{ color: 'var(--muted-foreground)' }}>{d.method.replace('_', ' ')} · {d.submittedAt}</p>
                      </div>
                      <StatusBadge status={d.status} />
                    </div>
                  ))}
                  {financeTab === 'withdrawals' && withdrawals.map(w => (
                    <div key={w.id} className="flex items-center gap-3 p-2 rounded border text-xs" style={{ borderColor: 'var(--border)' }}>
                      <ArrowUpRight size={12} style={{ color: '#ef4444' }} />
                      <div className="flex-1">
                        <p style={{ color: 'var(--foreground)' }}>-${w.amount.toLocaleString()} {w.currency}</p>
                        <p style={{ color: 'var(--muted-foreground)' }}>{w.method.replace('_', ' ')} · {w.submittedAt}</p>
                      </div>
                      <StatusBadge status={w.status} />
                    </div>
                  ))}
                  {financeTab === 'deposits' && deposits.length === 0 && (
                    <p className="text-xs text-center py-4" style={{ color: 'var(--muted-foreground)' }}>No deposits found</p>
                  )}
                  {financeTab === 'withdrawals' && withdrawals.length === 0 && (
                    <p className="text-xs text-center py-4" style={{ color: 'var(--muted-foreground)' }}>No withdrawals found</p>
                  )}
                </div>
              </div>
            )}

            {/* Asset Control */}
            {activeTab === 'assets' && (
              <div className="p-3 h-80 overflow-y-auto">
                <AssetControlPanel customer={customer} />
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Request Account Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded border shadow-xl"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <UserPlus size={14} style={{ color: 'var(--primary)' }} />
                <h3 className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Request Account Creation</h3>
              </div>
              <button onClick={() => setShowRequestModal(false)} className="p-1 rounded hover:bg-black/5" style={{ color: 'var(--muted-foreground)' }}>
                <X size={14} />
              </button>
            </div>

            {requestSubmitted ? (
              <div className="p-6 text-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: 'rgba(22,163,74,0.1)' }}>
                  <span style={{ color: '#16A34A', fontSize: 20 }}>✓</span>
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>Request Submitted</p>
                <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Pending admin approval</p>
              </div>
            ) : (
              <div className="p-4 space-y-4">
                {/* Customer summary */}
                <div className="p-3 rounded border text-xs" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
                  <div className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{customer.firstName} {customer.lastName}</div>
                  <div style={{ color: 'var(--muted-foreground)' }}>{customer.country} · {customer.registrationSource || 'Direct'}</div>
                </div>

                {/* Marketing site selector */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
                    Login / Customer Source <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <p className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>
                    Select the marketing site the customer will use to log in. Must be a configured site.
                  </p>
                  <div className="space-y-1.5">
                    {MARKETING_SITES.map(site => (
                      <button
                        key={site.id}
                        onClick={() => setRequestForm(f => ({ ...f, selectedSiteId: site.id }))}
                        className="w-full text-left p-3 rounded border transition-all text-xs"
                        style={{
                          borderColor: requestForm.selectedSiteId === site.id ? 'var(--primary)' : 'var(--border)',
                          backgroundColor: requestForm.selectedSiteId === site.id ? 'rgba(212,168,0,0.06)' : 'var(--card)',
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Globe size={12} style={{ color: requestForm.selectedSiteId === site.id ? 'var(--primary)' : 'var(--muted-foreground)' }} />
                          <div>
                            <div className="font-semibold" style={{ color: 'var(--foreground)' }}>{site.name}</div>
                            <div style={{ color: 'var(--muted-foreground)' }}>{site.domain}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  {selectedSite && (
                    <p className="text-xs mt-1.5" style={{ color: 'var(--muted-foreground)' }}>
                      Customer login URL: <span className="font-mono">{selectedSite.loginUrl}</span>
                    </p>
                  )}
                </div>

                {/* Request reason */}
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--foreground)' }}>
                    Request Reason <span style={{ color: '#DC2626' }}>*</span>
                  </label>
                  <textarea
                    className="w-full text-xs p-2 rounded border resize-none outline-none"
                    style={{ backgroundColor: 'var(--input)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    rows={3}
                    placeholder="Explain why this customer is ready for account creation..."
                    value={requestForm.requestReason}
                    onChange={e => setRequestForm(f => ({ ...f, requestReason: e.target.value }))}
                  />
                </div>

                <div className="p-2 rounded text-xs" style={{ backgroundColor: 'rgba(212,168,0,0.06)', color: 'var(--muted-foreground)' }}>
                  This request will be sent to Admin for approval. You cannot create active customer accounts directly.
                </div>

                <div className="flex gap-2 justify-end pt-1">
                  <button
                    onClick={() => setShowRequestModal(false)}
                    className="px-3 py-1.5 rounded text-xs border"
                    style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitAccountRequest}
                    disabled={!requestForm.selectedSiteId || !requestForm.requestReason.trim()}
                    className="px-3 py-1.5 rounded text-xs font-medium transition-opacity"
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: 'var(--primary-foreground)',
                      opacity: (!requestForm.selectedSiteId || !requestForm.requestReason.trim()) ? 0.5 : 1,
                    }}
                  >
                    Submit Request
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
