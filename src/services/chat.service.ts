// BACKEND INTEGRATION: WebSocket wss://api.core-domain.com/ws/chat
// REST: GET/POST /api/v1/conversations/*

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'customer' | 'agent' | 'admin';
  content: string;
  timestamp: string;
  delivered: boolean;
  read: boolean;
  isInternal: boolean; // internal notes — NEVER visible to customer
}

export interface Conversation {
  id: string;
  customerId: string;
  customerName: string;
  agentId: string;
  agentName: string;
  status: 'active' | 'closed' | 'pending';
  lastMessage: string;
  lastActivity: string;
  unreadCount: number;
  customerOnline: boolean;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  { id: 'conv-001', customerId: 'cust-001', customerName: 'Alex Morgan', agentId: 'agent-001', agentName: 'Sarah Chen', status: 'active', lastMessage: 'Can you check my account?', lastActivity: '2026-08-27 14:32', unreadCount: 2, customerOnline: true },
  { id: 'conv-002', customerId: 'cust-003', customerName: 'Priya Sharma', agentId: 'agent-001', agentName: 'Sarah Chen', status: 'active', lastMessage: 'Thank you for your help', lastActivity: '2026-08-27 12:15', unreadCount: 0, customerOnline: false },
  { id: 'conv-003', customerId: 'cust-002', customerName: 'Marcus Whitfield', agentId: 'agent-002', agentName: 'James Park', status: 'active', lastMessage: 'When will my verification be done?', lastActivity: '2026-08-27 11:00', unreadCount: 1, customerOnline: false },
  { id: 'conv-004', customerId: 'cust-004', customerName: 'Aisha Al-Rashidi', agentId: 'agent-001', agentName: 'Sarah Chen', status: 'active', lastMessage: 'I need help with my withdrawal', lastActivity: '2026-08-27 09:45', unreadCount: 0, customerOnline: true },
];

const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  'conv-001': [
    { id: 'msg-001', conversationId: 'conv-001', senderId: 'agent-001', senderName: 'Sarah Chen', senderRole: 'agent', content: 'Hello Alex, how can I help you today?', timestamp: '2026-08-27 14:20', delivered: true, read: true, isInternal: false },
    { id: 'msg-002', conversationId: 'conv-001', senderId: 'cust-001', senderName: 'Alex Morgan', senderRole: 'customer', content: 'Hi Sarah, can you check my account?', timestamp: '2026-08-27 14:25', delivered: true, read: true, isInternal: false },
    { id: 'msg-003', conversationId: 'conv-001', senderId: 'agent-001', senderName: 'Sarah Chen', senderRole: 'agent', content: 'Customer requested follow-up tomorrow regarding deposit.', timestamp: '2026-08-27 14:28', delivered: true, read: true, isInternal: true },
    { id: 'msg-004', conversationId: 'conv-001', senderId: 'cust-001', senderName: 'Alex Morgan', senderRole: 'customer', content: 'Can you check my account balance?', timestamp: '2026-08-27 14:32', delivered: true, read: false, isInternal: false },
  ],
};

export const chatService = {
  async getConversations(agentId?: string): Promise<Conversation[]> {
    // BACKEND INTEGRATION: GET /api/v1/conversations?agentId=...
    if (agentId) return MOCK_CONVERSATIONS.filter(c => c.agentId === agentId);
    return MOCK_CONVERSATIONS;
  },

  async getMessages(conversationId: string, includeInternal: boolean = false): Promise<ChatMessage[]> {
    // BACKEND INTEGRATION: GET /api/v1/conversations/:id/messages
    const msgs = MOCK_MESSAGES[conversationId] || [];
    if (!includeInternal) return msgs.filter(m => !m.isInternal);
    return msgs;
  },

  async sendMessage(conversationId: string, content: string, isInternal: boolean = false): Promise<ChatMessage> {
    // BACKEND INTEGRATION: POST /api/v1/conversations/:id/messages
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: 'agent-001',
      senderName: 'Sarah Chen',
      senderRole: 'agent',
      content,
      timestamp: new Date().toISOString(),
      delivered: true,
      read: false,
      isInternal,
    };
    return msg;
  },

  async markAsRead(conversationId: string): Promise<{ success: boolean }> {
    // BACKEND INTEGRATION: PATCH /api/v1/conversations/:id/read
    return { success: true };
  },
};
