'use client';
import React, { useEffect, useState } from 'react';
import { agentService, AssignedCustomer } from '@/services/agent.service';
import { callingService, CallSession, CallState } from '@/services/calling.service';
import { chatService, ChatMessage } from '@/services/chat.service';
import { PageHeader, Card, ActionButton } from '@/components/admin/AdminUI';

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
  const [activeTab, setActiveTab] = useState<'chat' | 'notes' | 'timeline'>('chat');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    agentService.getCustomerDetail(customerId, AGENT_ID).then(c => {
      setCustomer(c);
      setLoading(false);
    });
    chatService.getMessages('conv-001', true).then(setMessages);
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

  if (loading || !customer) return <div className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Loading...</div>;

  const CALL_STATE_LABELS: Record<CallState, string> = {
    idle: '', connecting: 'Connecting...', ringing: 'Ringing...', connected: formatDuration(callDuration),
    ended: 'Call Ended', failed: 'Call Failed', unavailable: 'Unavailable',
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title={`${customer.firstName} ${customer.lastName}`}
        subtitle={`${customer.country} · ${customer.registrationSource || '—'} · Assigned ${customer.assignedDate}`}
        actions={
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ONLINE_DOT[customer.onlineStatus] }} />
            <span className="text-xs capitalize" style={{ color: 'var(--muted-foreground)' }}>{customer.onlineStatus}</span>
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
              ['Email', customer.email === null ? '🔒 Hidden (no permission)' : customer.email || '—'],
              ['Phone', customer.phone === null ? '🔒 Hidden (no permission)' : customer.phone || '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span style={{ color: 'var(--muted-foreground)' }}>{label}</span>
                <span style={{ color: String(value).includes('🔒') ? '#ef4444' : 'var(--foreground)' }}>{value}</span>
              </div>
            ))}
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
                  {callState === 'ringing' && <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Ringing...</p>}
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

        {/* Chat / Notes / Timeline */}
        <div className="md:col-span-2">
          <Card padding="p-0">
            <div className="flex border-b" style={{ borderColor: 'var(--border)' }}>
              {(['chat', 'notes', 'timeline'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className="text-xs px-4 py-2.5 capitalize transition-colors"
                  style={{ color: activeTab === tab ? 'var(--primary)' : 'var(--muted-foreground)', borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent' }}>
                  {tab === 'notes' ? 'Internal Notes' : tab}
                </button>
              ))}
            </div>

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
          </Card>
        </div>
      </div>
    </div>
  );
}
