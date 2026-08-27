// BACKEND INTEGRATION: GET/POST /api/v1/admin/*

import type { Agent, AgentPermissions, AssignedCustomer, Priority, TaskType } from './agent.service';

export interface AdminCustomer extends AssignedCustomer {
  registrationDate: string;
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  accountBalance: string;
  totalDeposits: string;
  totalWithdrawals: string;
  tags: string[];
  notes: string;
  loginHistory: LoginRecord[];
  timeline: TimelineEvent[];
}

export interface LoginRecord {
  id: string;
  timestamp: string;
  ip: string;
  device: string;
  location: string;
  success: boolean;
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  type: string;
  description: string;
  actor: string;
}

export interface CustomerAssignment {
  id: string;
  customerId: string;
  customerName: string;
  agentId: string;
  agentName: string;
  priority: Priority;
  taskType: TaskType;
  dueDate: string;
  notes: string;
  permissions: Partial<AgentPermissions>;
  assignedAt: string;
  assignedBy: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  staffId: string;
  staffName: string;
  action: string;
  resource: string;
  customerId: string | null;
  customerName: string | null;
  ip: string;
  sessionId: string;
  result: 'success' | 'failure';
  details: string;
}

export interface FinanceAccount {
  id: string;
  customerId: string;
  customerName: string;
  currency: string;
  availableBalance: number;
  reservedBalance: number;
  totalBalance: number;
  status: 'active' | 'suspended' | 'closed';
  createdAt: string;
}

export interface Transaction {
  id: string;
  customerId: string;
  customerName: string;
  type: 'deposit' | 'withdrawal' | 'trade' | 'fee' | 'transfer';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  reference: string;
}

export interface DepositRequest {
  id: string;
  customerId: string;
  customerName: string;
  amount: number;
  currency: string;
  method: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  submittedAt: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
}

export interface WithdrawalRequest extends DepositRequest {
  destination: string;
}

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: 'active' | 'suspended';
  lastActive: string;
  createdAt: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'audit-001', timestamp: '2026-08-27 14:40', staffId: 'admin-001', staffName: 'Sarah Chen', action: 'CUSTOMER_ASSIGNED', resource: 'Customer', customerId: 'cust-001', customerName: 'Alex Morgan', ip: '192.168.1.10', sessionId: 'sess-abc', result: 'success', details: 'Assigned to agent Sarah Chen' },
  { id: 'audit-002', timestamp: '2026-08-27 14:35', staffId: 'admin-001', staffName: 'Sarah Chen', action: 'PERMISSION_CHANGED', resource: 'Agent', customerId: null, customerName: null, ip: '192.168.1.10', sessionId: 'sess-abc', result: 'success', details: 'Updated agent-002 permissions' },
  { id: 'audit-003', timestamp: '2026-08-27 14:20', staffId: 'agent-001', staffName: 'Sarah Chen', action: 'CONVERSATION_VIEWED', resource: 'Conversation', customerId: 'cust-001', customerName: 'Alex Morgan', ip: '192.168.1.11', sessionId: 'sess-def', result: 'success', details: 'Opened conversation conv-001' },
  { id: 'audit-004', timestamp: '2026-08-27 13:15', staffId: 'admin-001', staffName: 'Sarah Chen', action: 'CUSTOMER_STATUS_CHANGED', resource: 'Customer', customerId: 'cust-002', customerName: 'Marcus Whitfield', ip: '192.168.1.10', sessionId: 'sess-abc', result: 'success', details: 'Status changed to verified' },
  { id: 'audit-005', timestamp: '2026-08-27 12:00', staffId: 'admin-001', staffName: 'Sarah Chen', action: 'WITHDRAWAL_REVIEWED', resource: 'Withdrawal', customerId: 'cust-004', customerName: 'Aisha Al-Rashidi', ip: '192.168.1.10', sessionId: 'sess-abc', result: 'success', details: 'Withdrawal approved' },
  { id: 'audit-006', timestamp: '2026-08-27 11:30', staffId: 'admin-001', staffName: 'Sarah Chen', action: 'VERIFICATION_UPDATED', resource: 'Verification', customerId: 'cust-003', customerName: 'Priya Sharma', ip: '192.168.1.10', sessionId: 'sess-abc', result: 'success', details: 'KYC documents approved' },
  { id: 'audit-007', timestamp: '2026-08-27 10:00', staffId: 'admin-001', staffName: 'Sarah Chen', action: 'SIMULATION_STARTED', resource: 'SimulationLab', customerId: null, customerName: null, ip: '192.168.1.10', sessionId: 'sess-abc', result: 'success', details: 'Started BTC simulation scenario' },
];

const MOCK_ACCOUNTS: FinanceAccount[] = [
  { id: 'acc-001', customerId: 'cust-001', customerName: 'Alex Morgan', currency: 'USD', availableBalance: 24850.00, reservedBalance: 5000.00, totalBalance: 29850.00, status: 'active', createdAt: '2026-08-20' },
  { id: 'acc-002', customerId: 'cust-002', customerName: 'Marcus Whitfield', currency: 'USD', availableBalance: 8420.50, reservedBalance: 0, totalBalance: 8420.50, status: 'active', createdAt: '2026-08-22' },
  { id: 'acc-003', customerId: 'cust-003', customerName: 'Priya Sharma', currency: 'USD', availableBalance: 15200.00, reservedBalance: 2000.00, totalBalance: 17200.00, status: 'active', createdAt: '2026-08-23' },
  { id: 'acc-004', customerId: 'cust-004', customerName: 'Aisha Al-Rashidi', currency: 'USD', availableBalance: 52000.00, reservedBalance: 10000.00, totalBalance: 62000.00, status: 'active', createdAt: '2026-08-24' },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tx-001', customerId: 'cust-001', customerName: 'Alex Morgan', type: 'deposit', amount: 10000, currency: 'USD', status: 'completed', createdAt: '2026-08-27 10:00', reference: 'DEP-001' },
  { id: 'tx-002', customerId: 'cust-001', customerName: 'Alex Morgan', type: 'trade', amount: -5000, currency: 'USD', status: 'completed', createdAt: '2026-08-27 11:30', reference: 'TRD-001' },
  { id: 'tx-003', customerId: 'cust-004', customerName: 'Aisha Al-Rashidi', type: 'withdrawal', amount: -8000, currency: 'USD', status: 'pending', createdAt: '2026-08-27 12:00', reference: 'WTH-001' },
  { id: 'tx-004', customerId: 'cust-002', customerName: 'Marcus Whitfield', type: 'deposit', amount: 5000, currency: 'USD', status: 'completed', createdAt: '2026-08-26 14:00', reference: 'DEP-002' },
];

const MOCK_DEPOSITS: DepositRequest[] = [
  { id: 'dep-001', customerId: 'cust-001', customerName: 'Alex Morgan', amount: 10000, currency: 'USD', method: 'Bank Transfer', status: 'approved', submittedAt: '2026-08-27 09:00', reviewedBy: 'Sarah Chen', reviewedAt: '2026-08-27 10:00' },
  { id: 'dep-002', customerId: 'cust-002', customerName: 'Marcus Whitfield', amount: 5000, currency: 'USD', method: 'Credit Card', status: 'pending', submittedAt: '2026-08-27 13:00', reviewedBy: null, reviewedAt: null },
  { id: 'dep-003', customerId: 'cust-003', customerName: 'Priya Sharma', amount: 2000, currency: 'USD', method: 'Crypto', status: 'processing', submittedAt: '2026-08-27 11:00', reviewedBy: null, reviewedAt: null },
];

const MOCK_WITHDRAWALS: WithdrawalRequest[] = [
  { id: 'wth-001', customerId: 'cust-004', customerName: 'Aisha Al-Rashidi', amount: 8000, currency: 'USD', method: 'Bank Transfer', status: 'pending', submittedAt: '2026-08-27 12:00', reviewedBy: null, reviewedAt: null, destination: 'IBAN ending ...4521' },
  { id: 'wth-002', customerId: 'cust-001', customerName: 'Alex Morgan', amount: 2500, currency: 'USD', method: 'Crypto', status: 'approved', submittedAt: '2026-08-26 16:00', reviewedBy: 'Sarah Chen', reviewedAt: '2026-08-26 17:00', destination: 'BTC wallet ending ...8f2a' },
];

const MOCK_STAFF: StaffMember[] = [
  { id: 'admin-001', firstName: 'Sarah', lastName: 'Chen', email: 'sarah.chen@cryptovault.app', role: 'super_admin', status: 'active', lastActive: '2026-08-27 14:40', createdAt: '2026-01-01' },
  { id: 'agent-001', firstName: 'Sarah', lastName: 'Chen', email: 'sarah.chen@cryptovault.app', role: 'agent', status: 'active', lastActive: '2026-08-27 14:40', createdAt: '2026-03-15' },
  { id: 'agent-002', firstName: 'James', lastName: 'Park', email: 'james.park@cryptovault.app', role: 'agent', status: 'active', lastActive: '2026-08-27 14:35', createdAt: '2026-04-01' },
  { id: 'agent-003', firstName: 'Maria', lastName: 'Santos', email: 'maria.santos@cryptovault.app', role: 'agent', status: 'active', lastActive: '2026-08-27 13:20', createdAt: '2026-05-10' },
  { id: 'agent-004', firstName: 'David', lastName: 'Kim', email: 'david.kim@cryptovault.app', role: 'senior_agent', status: 'active', lastActive: '2026-08-27 09:15', createdAt: '2026-02-20' },
];

const MOCK_ROLES: Role[] = [
  { id: 'role-001', name: 'super_admin', description: 'Full platform access', permissions: ['*'], userCount: 1 },
  { id: 'role-002', name: 'admin', description: 'Administrative access', permissions: ['admin.*'], userCount: 2 },
  { id: 'role-003', name: 'manager', description: 'Team management', permissions: ['customers.*', 'agents.*', 'tasks.*'], userCount: 3 },
  { id: 'role-004', name: 'agent', description: 'Customer service agent', permissions: ['assigned_customers.view', 'tasks.update', 'calls.initiate', 'chat.send'], userCount: 12 },
  { id: 'role-005', name: 'marketing', description: 'Marketing team', permissions: ['marketing.*', 'registrations.view'], userCount: 4 },
  { id: 'role-006', name: 'finance', description: 'Finance team', permissions: ['finance.*', 'transactions.*'], userCount: 3 },
  { id: 'role-007', name: 'compliance', description: 'Compliance team', permissions: ['verification.*', 'documents.*'], userCount: 2 },
  { id: 'role-008', name: 'support', description: 'Support team', permissions: ['support.*', 'conversations.view'], userCount: 5 },
  { id: 'role-009', name: 'customer', description: 'End customer', permissions: ['own_account.*'], userCount: 14820 },
];

export const adminService = {
  async getCustomers(): Promise<AdminCustomer[]> {
    // BACKEND INTEGRATION: GET /api/v1/admin/customers
    return [];
  },

  async getCustomer(id: string): Promise<AdminCustomer | null> {
    // BACKEND INTEGRATION: GET /api/v1/admin/customers/:id
    return null;
  },

  async assignCustomer(assignment: Omit<CustomerAssignment, 'id' | 'assignedAt' | 'assignedBy'>): Promise<{ success: boolean }> {
    // BACKEND INTEGRATION: POST /api/v1/admin/assignments
    return { success: true };
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    return MOCK_AUDIT_LOGS;
  },

  async getAccounts(): Promise<FinanceAccount[]> {
    return MOCK_ACCOUNTS;
  },

  async getTransactions(): Promise<Transaction[]> {
    return MOCK_TRANSACTIONS;
  },

  async getDeposits(): Promise<DepositRequest[]> {
    return MOCK_DEPOSITS;
  },

  async getWithdrawals(): Promise<WithdrawalRequest[]> {
    return MOCK_WITHDRAWALS;
  },

  async getStaff(): Promise<StaffMember[]> {
    return MOCK_STAFF;
  },

  async getRoles(): Promise<Role[]> {
    return MOCK_ROLES;
  },

  async updateCustomerStatus(customerId: string, status: string): Promise<{ success: boolean }> {
    // BACKEND INTEGRATION: PATCH /api/v1/admin/customers/:id/status
    return { success: true };
  },

  async reviewDeposit(depositId: string, action: 'approve' | 'reject'): Promise<{ success: boolean }> {
    // BACKEND INTEGRATION: POST /api/v1/admin/deposits/:id/review
    return { success: true };
  },

  async reviewWithdrawal(withdrawalId: string, action: 'approve' | 'reject'): Promise<{ success: boolean }> {
    // BACKEND INTEGRATION: POST /api/v1/admin/withdrawals/:id/review
    return { success: true };
  },
};
