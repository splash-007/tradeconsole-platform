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
  managerId?: string;
  managerName?: string;
  department?: string;
  office?: string;
  shift?: string;
  status: 'active' | 'suspended' | 'disabled';
  lastActive: string;
  createdAt: string;
  presenceStatus?: 'online' | 'away' | 'busy' | 'offline';
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
  { id: 'admin-001', firstName: 'Sarah', lastName: 'Chen', email: 'sarah.chen@cryonfx.app', role: 'super_admin', status: 'active', lastActive: '2026-08-27 14:40', createdAt: '2026-01-01', presenceStatus: 'online' },
  { id: 'broker-001', firstName: 'James', lastName: 'Park', email: 'james.park@cryonfx.app', role: 'broker', status: 'active', lastActive: '2026-08-27 14:35', createdAt: '2026-04-01', managerId: 'bm-001', managerName: 'Sarah Chen', department: 'Sales', presenceStatus: 'online' },
  { id: 'broker-002', firstName: 'Emma', lastName: 'Wilson', email: 'emma.wilson@cryonfx.app', role: 'broker', status: 'active', lastActive: '2026-08-27 14:20', createdAt: '2026-05-10', managerId: 'bm-001', managerName: 'Sarah Chen', department: 'Sales', presenceStatus: 'busy' },
  { id: 'ftd-001', firstName: 'Carlos', lastName: 'Mendez', email: 'carlos.mendez@cryonfx.app', role: 'ftd_broker', status: 'active', lastActive: '2026-08-27 13:15', createdAt: '2026-06-01', managerId: 'cm-001', managerName: 'Robert Chen', department: 'Conversion', presenceStatus: 'online' },
  { id: 'ret-001', firstName: 'Maria', lastName: 'Santos', email: 'maria.santos@cryonfx.app', role: 'retention_broker', status: 'active', lastActive: '2026-08-27 12:00', createdAt: '2026-03-15', managerId: 'rm-001', managerName: 'Lisa Wang', department: 'Retention', presenceStatus: 'away' },
  { id: 'comp-001', firstName: 'Yuki', lastName: 'Tanaka', email: 'yuki.tanaka@cryonfx.app', role: 'compliance_broker', status: 'active', lastActive: '2026-08-27 11:30', createdAt: '2026-04-20', managerId: 'cm-001', managerName: 'Lisa Wang', department: 'Compliance', presenceStatus: 'online' },
  { id: 'aff-001', firstName: 'Marco', lastName: 'Rossi', email: 'marco.rossi@cryonfx.app', role: 'affiliate', status: 'active', lastActive: '2026-08-27 10:00', createdAt: '2026-02-10', managerId: 'am-001', managerName: 'Elena Vasquez', presenceStatus: 'online' },
  { id: 'fin-001', firstName: 'David', lastName: 'Kim', email: 'david.kim@cryonfx.app', role: 'finance', status: 'active', lastActive: '2026-08-27 14:00', createdAt: '2026-01-15', department: 'Finance', presenceStatus: 'online' },
  { id: 'vp-001', firstName: 'Robert', lastName: 'Chen', email: 'robert.chen@cryonfx.app', role: 'vp_sales', status: 'active', lastActive: '2026-08-27 09:00', createdAt: '2026-01-01', presenceStatus: 'online' },
  { id: 'cm-001', firstName: 'Lisa', lastName: 'Wang', email: 'lisa.wang@cryonfx.app', role: 'compliance_manager', status: 'active', lastActive: '2026-08-27 13:45', createdAt: '2026-02-01', department: 'Compliance', presenceStatus: 'online' },
  { id: 'bm-001', firstName: 'Sarah', lastName: 'Chen', email: 'sarah.chen2@cryonfx.app', role: 'broker_manager', status: 'active', lastActive: '2026-08-27 14:40', createdAt: '2026-03-01', managerId: 'vp-001', managerName: 'Robert Chen', department: 'Sales', presenceStatus: 'online' },
  { id: 'sm-001', firstName: 'Alex', lastName: 'Torres', email: 'alex.torres@cryonfx.app', role: 'shift_manager', status: 'active', lastActive: '2026-08-27 08:00', createdAt: '2026-05-01', presenceStatus: 'online' },
  { id: 'op-001', firstName: 'Anna', lastName: 'Kowalski', email: 'anna.kowalski@cryonfx.app', role: 'operator', status: 'active', lastActive: '2026-08-27 14:10', createdAt: '2026-06-15', presenceStatus: 'online' },
  { id: 'tl-001', firstName: 'Liam', lastName: 'Johnson', email: 'liam.johnson@cryonfx.app', role: 'team_leader', status: 'active', lastActive: '2026-08-27 13:00', createdAt: '2026-04-10', managerId: 'bm-001', managerName: 'Sarah Chen', presenceStatus: 'away' },
];

const MOCK_ROLES: Role[] = [
  { id: 'role-001', name: 'super_admin', description: 'Full platform access', permissions: ['*'], userCount: 1 },
  { id: 'role-002', name: 'admin', description: 'Administrative access', permissions: ['admin.*'], userCount: 1 },
  { id: 'role-003', name: 'affiliate', description: 'Affiliate partner', permissions: ['affiliate_stats.view', 'campaigns.view', 'commissions.view'], userCount: 8 },
  { id: 'role-004', name: 'operator', description: 'Customer operator', permissions: ['assigned_customers.view', 'tasks.*', 'calls.*'], userCount: 5 },
  { id: 'role-005', name: 'broker', description: 'Sales broker', permissions: ['assigned_customers.view', 'tasks.*', 'calls.*', 'messages.*'], userCount: 12 },
  { id: 'role-006', name: 'ftd_broker', description: 'First-time deposit broker', permissions: ['assigned_customers.view', 'ftd.*', 'calls.*'], userCount: 5 },
  { id: 'role-007', name: 'retention_broker', description: 'Retention specialist', permissions: ['assigned_customers.view', 'retention.*', 'calls.*'], userCount: 6 },
  { id: 'role-008', name: 'compliance_broker', description: 'Compliance verification', permissions: ['compliance_cases.view', 'kyc.*'], userCount: 4 },
  { id: 'role-009', name: 'new_affiliate_manager', description: 'New affiliate onboarding', permissions: ['new_affiliates.*', 'campaigns.*'], userCount: 2 },
  { id: 'role-010', name: 'affiliate_manager', description: 'Affiliate team manager', permissions: ['affiliates.*', 'campaigns.*', 'reports.*'], userCount: 3 },
  { id: 'role-011', name: 'broker_manager', description: 'Broker team manager', permissions: ['broker_team.*', 'customers.view', 'assignments.*'], userCount: 3 },
  { id: 'role-012', name: 'desk_manager', description: 'Desk operations manager', permissions: ['desk.*', 'assignments.*'], userCount: 2 },
  { id: 'role-013', name: 'shift_manager', description: 'Shift supervisor', permissions: ['shift.*', 'staff_online.view'], userCount: 3 },
  { id: 'role-014', name: 'desk_broker', description: 'Desk broker', permissions: ['assigned_customers.view', 'tasks.*', 'calls.*'], userCount: 8 },
  { id: 'role-015', name: 'marketer_manager', description: 'Marketing manager', permissions: ['marketing.*', 'campaigns.*', 'affiliates.*'], userCount: 2 },
  { id: 'role-016', name: 'compliance_manager', description: 'Compliance manager', permissions: ['compliance.*', 'verification.*', 'documents.*'], userCount: 2 },
  { id: 'role-017', name: 'team_leader', description: 'Team leader', permissions: ['team.*', 'tasks.*', 'performance.view'], userCount: 4 },
  { id: 'role-018', name: 'office', description: 'Office operations', permissions: ['office.*', 'staff.view', 'customers.view'], userCount: 3 },
  { id: 'role-019', name: 'vp_sales', description: 'VP of Sales', permissions: ['sales_overview.*', 'teams.view', 'performance.*', 'revenue.view'], userCount: 1 },
  { id: 'role-020', name: 'finance', description: 'Finance team', permissions: ['finance.*', 'transactions.*', 'deposits.*', 'withdrawals.*'], userCount: 3 },
  { id: 'role-021', name: 'conversion_manager', description: 'Conversion manager', permissions: ['conversion.*', 'ftd_brokers.*', 'assignments.*'], userCount: 2 },
  { id: 'role-022', name: 'retention_manager', description: 'Retention manager', permissions: ['retention.*', 'retention_brokers.*'], userCount: 2 },
  { id: 'role-023', name: 'customer', description: 'End customer', permissions: ['own_account.*'], userCount: 14820 },
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
