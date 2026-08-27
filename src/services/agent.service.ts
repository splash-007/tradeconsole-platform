// BACKEND INTEGRATION: GET/POST /api/v1/agents/*

export type AgentStatus = 'online' | 'busy' | 'away' | 'offline';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'cancelled';
export type TaskType = 'call_customer' | 'follow_up' | 'review_registration' | 'contact_customer' | 'request_information' | 'verify_information' | 'custom';
export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type CallStatus = 'connecting' | 'ringing' | 'connected' | 'ended' | 'failed' | 'unavailable';
export type CallOutcome = 'connected' | 'no_answer' | 'busy' | 'call_back' | 'interested' | 'not_interested' | 'follow_up_required';
export type CustomerStatus = 'pending' | 'verified' | 'active' | 'suspended' | 'rejected';
export type OnlineStatus = 'online' | 'away' | 'offline';

export interface Agent {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: AgentStatus;
  assignedCustomers: number;
  openTasks: number;
  callsToday: number;
  unreadConversations: number;
  lastActive: string;
  permissions: AgentPermissions;
}

export interface AgentPermissions {
  canViewEmail: boolean;
  canViewPhone: boolean;
  canViewCountry: boolean;
  canViewAccountData: boolean;
  canViewTransactions: boolean;
  canViewVerification: boolean;
  canCallCustomer: boolean;
  canChatWithCustomer: boolean;
  canAddInternalNotes: boolean;
}

export interface AssignedCustomer {
  id: string;
  firstName: string;
  lastName: string;
  country: string;
  status: CustomerStatus;
  assignedDate: string;
  priority: Priority;
  lastContact: string | null;
  nextAction: string | null;
  onlineStatus: OnlineStatus;
  // PII — only populated if agent has permission
  email?: string | null;
  phone?: string | null;
  registrationSource?: string;
  campaign?: string;
  accountStatus?: string;
  assignedAgentId?: string;
}

export interface AgentTask {
  id: string;
  customerId: string;
  customerName: string;
  type: TaskType;
  status: TaskStatus;
  priority: Priority;
  dueDate: string;
  notes: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CallRecord {
  id: string;
  customerId: string;
  customerName: string;
  agentId: string;
  agentName: string;
  date: string;
  duration: string;
  direction: 'inbound' | 'outbound';
  status: 'completed' | 'missed' | 'failed';
  outcome: CallOutcome;
  followUp: string | null;
  // phone only shown if agent has view_customer_phone permission
  phone?: string | null;
}

export interface AgentOverviewStats {
  assignedCustomers: number;
  tasksToday: number;
  pendingFollowUps: number;
  unreadMessages: number;
  callsToday: number;
  completedTasks: number;
}

const MOCK_AGENTS: Agent[] = [
  {
    id: 'agent-001', firstName: 'Sarah', lastName: 'Chen', email: 'sarah.chen@cryptovault.app',
    role: 'agent', status: 'online', assignedCustomers: 24, openTasks: 8, callsToday: 6,
    unreadConversations: 3, lastActive: '2026-08-27 14:40',
    permissions: { canViewEmail: false, canViewPhone: false, canViewCountry: true, canViewAccountData: true, canViewTransactions: false, canViewVerification: true, canCallCustomer: true, canChatWithCustomer: true, canAddInternalNotes: true }
  },
  {
    id: 'agent-002', firstName: 'James', lastName: 'Park', email: 'james.park@cryptovault.app',
    role: 'agent', status: 'busy', assignedCustomers: 18, openTasks: 5, callsToday: 4,
    unreadConversations: 1, lastActive: '2026-08-27 14:35',
    permissions: { canViewEmail: true, canViewPhone: false, canViewCountry: true, canViewAccountData: true, canViewTransactions: true, canViewVerification: true, canCallCustomer: true, canChatWithCustomer: true, canAddInternalNotes: true }
  },
  {
    id: 'agent-003', firstName: 'Maria', lastName: 'Santos', email: 'maria.santos@cryptovault.app',
    role: 'agent', status: 'away', assignedCustomers: 12, openTasks: 3, callsToday: 2,
    unreadConversations: 0, lastActive: '2026-08-27 13:20',
    permissions: { canViewEmail: false, canViewPhone: false, canViewCountry: true, canViewAccountData: false, canViewTransactions: false, canViewVerification: false, canCallCustomer: true, canChatWithCustomer: true, canAddInternalNotes: true }
  },
  {
    id: 'agent-004', firstName: 'David', lastName: 'Kim', email: 'david.kim@cryptovault.app',
    role: 'senior_agent', status: 'offline', assignedCustomers: 31, openTasks: 12, callsToday: 0,
    unreadConversations: 5, lastActive: '2026-08-27 09:15',
    permissions: { canViewEmail: true, canViewPhone: true, canViewCountry: true, canViewAccountData: true, canViewTransactions: true, canViewVerification: true, canCallCustomer: true, canChatWithCustomer: true, canAddInternalNotes: true }
  },
];

const MOCK_ASSIGNED_CUSTOMERS: AssignedCustomer[] = [
  { id: 'cust-001', firstName: 'Alex', lastName: 'Morgan', country: 'United Kingdom', status: 'active', assignedDate: '2026-08-20', priority: 'high', lastContact: '2026-08-27 14:05', nextAction: 'Follow-up call', onlineStatus: 'online', email: null, phone: null, registrationSource: 'Google Ads', campaign: 'summer-2026', accountStatus: 'active' },
  { id: 'cust-002', firstName: 'Marcus', lastName: 'Whitfield', country: 'United Kingdom', status: 'verified', assignedDate: '2026-08-22', priority: 'medium', lastContact: '2026-08-26 11:30', nextAction: 'Verification review', onlineStatus: 'offline', email: null, phone: null, registrationSource: 'Google Ads', campaign: 'summer-2026', accountStatus: 'pending' },
  { id: 'cust-003', firstName: 'Priya', lastName: 'Sharma', country: 'India', status: 'active', assignedDate: '2026-08-23', priority: 'low', lastContact: '2026-08-25 16:00', nextAction: 'Check deposit', onlineStatus: 'away', email: null, phone: null, registrationSource: 'Facebook', campaign: 'asia-q3', accountStatus: 'active' },
  { id: 'cust-004', firstName: 'Aisha', lastName: 'Al-Rashidi', country: 'UAE', status: 'active', assignedDate: '2026-08-24', priority: 'urgent', lastContact: '2026-08-27 09:00', nextAction: 'Urgent call', onlineStatus: 'online', email: null, phone: null, registrationSource: 'Affiliate', campaign: 'mena-launch', accountStatus: 'active' },
  { id: 'cust-005', firstName: 'Thomas', lastName: 'Bergmann', country: 'Germany', status: 'pending', assignedDate: '2026-08-26', priority: 'medium', lastContact: null, nextAction: 'Initial contact', onlineStatus: 'offline', email: null, phone: null, registrationSource: 'Email', campaign: 'newsletter-aug', accountStatus: 'pending' },
];

const MOCK_TASKS: AgentTask[] = [
  { id: 'task-001', customerId: 'cust-001', customerName: 'Alex Morgan', type: 'call_customer', status: 'pending', priority: 'high', dueDate: '2026-08-27', notes: 'Customer requested follow-up about deposit', createdBy: 'Admin', createdAt: '2026-08-27 08:00', updatedAt: '2026-08-27 08:00' },
  { id: 'task-002', customerId: 'cust-004', customerName: 'Aisha Al-Rashidi', type: 'follow_up', status: 'in_progress', priority: 'urgent', dueDate: '2026-08-27', notes: 'Urgent: customer has compliance question', createdBy: 'Admin', createdAt: '2026-08-27 07:30', updatedAt: '2026-08-27 09:00' },
  { id: 'task-003', customerId: 'cust-002', customerName: 'Marcus Whitfield', type: 'verify_information', status: 'pending', priority: 'medium', dueDate: '2026-08-28', notes: 'Review submitted documents', createdBy: 'James Park', createdAt: '2026-08-26 15:00', updatedAt: '2026-08-26 15:00' },
  { id: 'task-004', customerId: 'cust-005', customerName: 'Thomas Bergmann', type: 'contact_customer', status: 'pending', priority: 'medium', dueDate: '2026-08-27', notes: 'First contact — introduce platform', createdBy: 'Admin', createdAt: '2026-08-26 18:00', updatedAt: '2026-08-26 18:00' },
  { id: 'task-005', customerId: 'cust-003', customerName: 'Priya Sharma', type: 'review_registration', status: 'overdue', priority: 'low', dueDate: '2026-08-26', notes: 'Review registration details', createdBy: 'Admin', createdAt: '2026-08-25 10:00', updatedAt: '2026-08-25 10:00' },
];

const MOCK_CALLS: CallRecord[] = [
  { id: 'call-001', customerId: 'cust-001', customerName: 'Alex Morgan', agentId: 'agent-001', agentName: 'Sarah Chen', date: '2026-08-27 14:05', duration: '4:32', direction: 'outbound', status: 'completed', outcome: 'interested', followUp: '2026-08-28', phone: null },
  { id: 'call-002', customerId: 'cust-004', customerName: 'Aisha Al-Rashidi', agentId: 'agent-001', agentName: 'Sarah Chen', date: '2026-08-27 09:00', duration: '2:15', direction: 'outbound', status: 'completed', outcome: 'follow_up_required', followUp: '2026-08-27', phone: null },
  { id: 'call-003', customerId: 'cust-002', customerName: 'Marcus Whitfield', agentId: 'agent-001', agentName: 'Sarah Chen', date: '2026-08-26 11:30', duration: '0:00', direction: 'outbound', status: 'missed', outcome: 'no_answer', followUp: '2026-08-27', phone: null },
  { id: 'call-004', customerId: 'cust-003', customerName: 'Priya Sharma', agentId: 'agent-001', agentName: 'Sarah Chen', date: '2026-08-25 16:00', duration: '7:48', direction: 'outbound', status: 'completed', outcome: 'connected', followUp: null, phone: null },
];

export const agentService = {
  async getAgents(): Promise<Agent[]> {
    // BACKEND INTEGRATION: GET /api/v1/admin/agents
    return MOCK_AGENTS;
  },

  async getAgent(id: string): Promise<Agent | null> {
    return MOCK_AGENTS.find(a => a.id === id) || null;
  },

  async getOverviewStats(agentId: string): Promise<AgentOverviewStats> {
    // BACKEND INTEGRATION: GET /api/v1/agents/:id/overview
    return { assignedCustomers: 24, tasksToday: 4, pendingFollowUps: 3, unreadMessages: 3, callsToday: 6, completedTasks: 12 };
  },

  async getAssignedCustomers(agentId: string): Promise<AssignedCustomer[]> {
    // BACKEND INTEGRATION: GET /api/v1/agents/:id/customers
    // PII fields (email, phone) are null unless agent has explicit permission
    return MOCK_ASSIGNED_CUSTOMERS;
  },

  async getCustomerDetail(customerId: string, agentId: string): Promise<AssignedCustomer | null> {
    // BACKEND INTEGRATION: GET /api/v1/agents/:agentId/customers/:customerId
    return MOCK_ASSIGNED_CUSTOMERS.find(c => c.id === customerId) || null;
  },

  async getTasks(agentId: string): Promise<AgentTask[]> {
    // BACKEND INTEGRATION: GET /api/v1/agents/:id/tasks
    return MOCK_TASKS;
  },

  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<{ success: boolean }> {
    // BACKEND INTEGRATION: PATCH /api/v1/tasks/:id
    return { success: true };
  },

  async getCalls(agentId: string): Promise<CallRecord[]> {
    // BACKEND INTEGRATION: GET /api/v1/agents/:id/calls
    return MOCK_CALLS;
  },

  async updateAgentPermissions(agentId: string, permissions: Partial<AgentPermissions>): Promise<{ success: boolean }> {
    // BACKEND INTEGRATION: PATCH /api/v1/admin/agents/:id/permissions
    return { success: true };
  },
};
