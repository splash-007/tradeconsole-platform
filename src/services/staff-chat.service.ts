// Internal Staff Chat Service — CryptoVault
// IMPORTANT: This is SEPARATE from customer support chat.
// conversation_type: 'internal' | 'customer'
// BACKEND INTEGRATION: WebSocket + PostgreSQL + Redis/Valkey for presence & pub/sub

export type PresenceStatus = 'online' | 'away' | 'busy' | 'offline';
export type ConversationType = 'direct' | 'team' | 'department';

export interface StaffPresence {
  staffId: string;
  name: string;
  role: string;
  status: PresenceStatus;
  lastSeen?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  timestamp: string;
  readBy: string[];
  delivered: boolean;
  type: 'text' | 'system';
}

export interface Conversation {
  id: string;
  type: ConversationType;
  conversationType: 'internal'; // Always internal for staff chat
  name: string;
  participants: string[];
  participantNames: string[];
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCount: number;
  isOnline?: boolean;
  presenceStatus?: PresenceStatus;
}

// Mock data for development
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-int-001',
    type: 'direct',
    conversationType: 'internal',
    name: 'Sarah Chen',
    participants: ['current-user', 'staff-001'],
    participantNames: ['You', 'Sarah Chen'],
    lastMessage: 'Can you check the new customer assignment?',
    lastMessageAt: '2 min ago',
    unreadCount: 2,
    isOnline: true,
    presenceStatus: 'online',
  },
  {
    id: 'conv-int-002',
    type: 'direct',
    conversationType: 'internal',
    name: 'James Park',
    participants: ['current-user', 'staff-002'],
    participantNames: ['You', 'James Park'],
    lastMessage: 'The FTD report is ready',
    lastMessageAt: '15 min ago',
    unreadCount: 0,
    isOnline: true,
    presenceStatus: 'busy',
  },
  {
    id: 'conv-int-003',
    type: 'team',
    conversationType: 'internal',
    name: 'Broker Team',
    participants: ['current-user', 'staff-001', 'staff-002', 'staff-003'],
    participantNames: ['You', 'Sarah Chen', 'James Park', 'Maria Santos'],
    lastMessage: 'Team meeting at 3pm today',
    lastMessageAt: '1 hr ago',
    unreadCount: 5,
    isOnline: true,
    presenceStatus: 'online',
  },
  {
    id: 'conv-int-004',
    type: 'direct',
    conversationType: 'internal',
    name: 'Maria Santos',
    participants: ['current-user', 'staff-003'],
    participantNames: ['You', 'Maria Santos'],
    lastMessage: 'Customer follow-up done',
    lastMessageAt: '2 hrs ago',
    unreadCount: 0,
    isOnline: false,
    presenceStatus: 'offline',
  },
  {
    id: 'conv-int-005',
    type: 'department',
    conversationType: 'internal',
    name: 'Finance Team',
    participants: ['current-user', 'staff-004', 'staff-005'],
    participantNames: ['You', 'David Kim', 'Lisa Wang'],
    lastMessage: 'Monthly reconciliation complete',
    lastMessageAt: '3 hrs ago',
    unreadCount: 1,
    isOnline: false,
    presenceStatus: 'offline',
  },
];

const MOCK_MESSAGES: Record<string, ChatMessage[]> = {
  'conv-int-001': [
    { id: 'msg-001', conversationId: 'conv-int-001', senderId: 'staff-001', senderName: 'Sarah Chen', senderRole: 'Broker Manager', content: 'Hey, how are the new customer assignments going?', timestamp: '14:30', readBy: ['current-user'], delivered: true, type: 'text' },
    { id: 'msg-002', conversationId: 'conv-int-001', senderId: 'current-user', senderName: 'You', senderRole: 'Broker', content: 'Going well! Just finished the first 3 follow-ups.', timestamp: '14:32', readBy: ['staff-001'], delivered: true, type: 'text' },
    { id: 'msg-003', conversationId: 'conv-int-001', senderId: 'staff-001', senderName: 'Sarah Chen', senderRole: 'Broker Manager', content: 'Great work. Can you check the new customer assignment?', timestamp: '14:35', readBy: [], delivered: true, type: 'text' },
    { id: 'msg-004', conversationId: 'conv-int-001', senderId: 'staff-001', senderName: 'Sarah Chen', senderRole: 'Broker Manager', content: 'There are 2 high-priority leads waiting.', timestamp: '14:36', readBy: [], delivered: true, type: 'text' },
  ],
  'conv-int-002': [
    { id: 'msg-005', conversationId: 'conv-int-002', senderId: 'staff-002', senderName: 'James Park', senderRole: 'FTD Broker', content: 'The FTD report is ready for your review.', timestamp: '14:20', readBy: ['current-user'], delivered: true, type: 'text' },
  ],
  'conv-int-003': [
    { id: 'msg-006', conversationId: 'conv-int-003', senderId: 'staff-001', senderName: 'Sarah Chen', senderRole: 'Broker Manager', content: 'Team meeting at 3pm today — please confirm attendance.', timestamp: '13:45', readBy: [], delivered: true, type: 'text' },
    { id: 'msg-007', conversationId: 'conv-int-003', senderId: 'staff-002', senderName: 'James Park', senderRole: 'FTD Broker', content: 'Confirmed ✓', timestamp: '13:47', readBy: [], delivered: true, type: 'text' },
    { id: 'msg-008', conversationId: 'conv-int-003', senderId: 'staff-003', senderName: 'Maria Santos', senderRole: 'Retention Broker', content: 'I\'ll be there', timestamp: '13:50', readBy: [], delivered: true, type: 'text' },
  ],
};

const MOCK_PRESENCE: StaffPresence[] = [
  { staffId: 'staff-001', name: 'Sarah Chen', role: 'Broker Manager', status: 'online' },
  { staffId: 'staff-002', name: 'James Park', role: 'FTD Broker', status: 'busy' },
  { staffId: 'staff-003', name: 'Maria Santos', role: 'Retention Broker', status: 'away' },
  { staffId: 'staff-004', name: 'David Kim', role: 'Finance', status: 'online' },
  { staffId: 'staff-005', name: 'Lisa Wang', role: 'Compliance Manager', status: 'offline' },
];

export const staffChatService = {
  async getConversations(): Promise<Conversation[]> {
    // BACKEND INTEGRATION: GET /api/v1/internal/conversations
    return MOCK_CONVERSATIONS;
  },

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    // BACKEND INTEGRATION: GET /api/v1/internal/conversations/:id/messages
    return MOCK_MESSAGES[conversationId] || [];
  },

  async sendMessage(conversationId: string, content: string): Promise<ChatMessage> {
    // BACKEND INTEGRATION: POST /api/v1/internal/conversations/:id/messages
    // WebSocket: emit 'message:send' event
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId: 'current-user',
      senderName: 'You',
      senderRole: 'Staff',
      content,
      timestamp: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
      readBy: [],
      delivered: true,
      type: 'text',
    };
    if (MOCK_MESSAGES[conversationId]) {
      MOCK_MESSAGES[conversationId].push(msg);
    } else {
      MOCK_MESSAGES[conversationId] = [msg];
    }
    return msg;
  },

  async markAsRead(conversationId: string): Promise<void> {
    // BACKEND INTEGRATION: POST /api/v1/internal/conversations/:id/read
    // WebSocket: emit 'message:read' event
    const conv = MOCK_CONVERSATIONS.find(c => c.id === conversationId);
    if (conv) conv.unreadCount = 0;
  },

  async getPresence(): Promise<StaffPresence[]> {
    // BACKEND INTEGRATION: GET /api/v1/internal/presence
    // WebSocket: subscribe to 'presence:update' events
    return MOCK_PRESENCE;
  },

  async updatePresence(status: PresenceStatus): Promise<void> {
    // BACKEND INTEGRATION: POST /api/v1/internal/presence
    // WebSocket: emit 'presence:update' event
    // Redis/Valkey stores ephemeral presence state
  },

  async createDirectConversation(staffId: string, staffName: string): Promise<Conversation> {
    // BACKEND INTEGRATION: POST /api/v1/internal/conversations
    const conv: Conversation = {
      id: `conv-int-${Date.now()}`,
      type: 'direct',
      conversationType: 'internal',
      name: staffName,
      participants: ['current-user', staffId],
      participantNames: ['You', staffName],
      unreadCount: 0,
      isOnline: false,
      presenceStatus: 'offline',
    };
    MOCK_CONVERSATIONS.unshift(conv);
    return conv;
  },

  getTotalUnread(): number {
    return MOCK_CONVERSATIONS.reduce((sum, c) => sum + c.unreadCount, 0);
  },
};
