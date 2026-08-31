// Central Platform Service — Trade Console
// Single source of truth for assignments, tasks, notifications, audit events, and presence.
// All dashboards (admin, manager, staff) read from and write to this service.
// BACKEND INTEGRATION: Replace in-memory state with API calls to /api/v1/platform/*

import type { RoleId } from '@/lib/rbac';
import { ROLE_DISPLAY_NAMES } from '@/lib/rbac';

// ─── Types ───────────────────────────────────────────────────────────────────

export type AuditAction =
  | 'CUSTOMER_CREATED' | 'CUSTOMER_UPDATED' | 'CUSTOMER_STATUS_CHANGED' |'CUSTOMER_ASSIGNED'| 'CUSTOMER_REASSIGNED' |'TASK_CREATED'| 'TASK_UPDATED' | 'TASK_COMPLETED' | 'TASK_CANCELLED' |'NOTE_ADDED'| 'CALL_STARTED' | 'CALL_COMPLETED' |'ROLE_ASSIGNED'| 'ROLE_CHANGED' | 'PERMISSION_CHANGED' | 'MANAGER_CHANGED' |'VERIFICATION_UPDATED'| 'DEPOSIT_REVIEWED' | 'WITHDRAWAL_REVIEWED' |'CHAT_ADMIN_VIEWED'| 'STAFF_CREATED' | 'STAFF_DISABLED' | 'STAFF_REACTIVATED' |'CONVERSATION_VIEWED' | 'SIMULATION_STARTED' | 'ESCALATION_CREATED';

export type ResourceType =
  | 'Customer' | 'Task' | 'Assignment' | 'Staff' | 'Role' | 'Permission' |'Verification'| 'Deposit' | 'Withdrawal' | 'Conversation' | 'Note' |'Call' | 'SimulationLab' | 'Escalation';

export interface AuditRecord {
  id: string;
  timestamp: string;
  actorUserId: string;
  actorName: string;
  actorRole: RoleId | string;
  action: AuditAction;
  resourceType: ResourceType;
  resourceId: string;
  customerId?: string | null;
  customerName?: string | null;
  previousValue?: string | null;
  newValue?: string | null;
  reason?: string | null;
  result: 'success' | 'failure';
  sessionId: string;
  ipAddress?: string | null;
  details: string;
}

export interface PlatformAssignment {
  id: string;
  customerId: string;
  customerName: string;
  customerCountry: string;
  customerStatus: string;
  assignedToId: string;
  assignedToName: string;
  assignedToRole: RoleId;
  assignedById: string;
  assignedByName: string;
  assignedAt: string;
  status: 'active' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  history: AssignmentHistoryEntry[];
}

export interface AssignmentHistoryEntry {
  id: string;
  timestamp: string;
  fromStaffId?: string;
  fromStaffName?: string;
  toStaffId: string;
  toStaffName: string;
  toStaffRole: RoleId;
  changedById: string;
  changedByName: string;
  reason?: string;
}

export interface PlatformTask {
  id: string;
  customerId: string;
  customerName: string;
  customerCountry?: string;
  assignedToId: string;
  assignedToName: string;
  assignedToRole: RoleId;
  managerId?: string;
  managerName?: string;
  createdById: string;
  createdByName: string;
  type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'unable_to_complete' | 'cancelled' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
  activityLog: TaskActivityEntry[];
}

export interface TaskActivityEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  action: string;
  previousStatus?: string;
  newStatus?: string;
  note?: string;
}

export interface PlatformNotification {
  id: string;
  recipientId: string;
  recipientRole: RoleId;
  type: 'assignment' | 'task' | 'message' | 'escalation' | 'system' | 'finance' | 'compliance';
  title: string;
  message: string;
  resourceType: ResourceType;
  resourceId: string;
  customerId?: string;
  customerName?: string;
  read: boolean;
  createdAt: string;
  linkHref?: string;
}

export interface PresenceState {
  userId: string;
  userName: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: string;
}

// ─── Shared In-Memory State (replaces disconnected per-page copies) ──────────

const AUDIT_RECORDS: AuditRecord[] = [
  {
    id: 'audit-001', timestamp: '2026-08-28 09:15', actorUserId: 'admin-001', actorName: 'Sarah Chen',
    actorRole: 'admin', action: 'CUSTOMER_ASSIGNED', resourceType: 'Assignment', resourceId: 'asgn-001',
    customerId: 'cust-001', customerName: 'Alex Morgan', previousValue: null, newValue: 'Sarah Chen (FTD Broker)',
    result: 'success', sessionId: 'sess-abc', ipAddress: '192.168.1.10',
    details: 'Customer assigned to Sarah Chen as FTD Broker',
  },
  {
    id: 'audit-002', timestamp: '2026-08-28 09:20', actorUserId: 'admin-001', actorName: 'Sarah Chen',
    actorRole: 'admin', action: 'TASK_CREATED', resourceType: 'Task', resourceId: 'task-001',
    customerId: 'cust-001', customerName: 'Alex Morgan', previousValue: null, newValue: 'Call Customer — High',
    result: 'success', sessionId: 'sess-abc', ipAddress: '192.168.1.10',
    details: 'Task created: Call Alex Morgan — assigned to Sarah Chen',
  },
  {
    id: 'audit-003', timestamp: '2026-08-28 10:05', actorUserId: 'broker-001', actorName: 'James Park',
    actorRole: 'broker', action: 'TASK_UPDATED', resourceType: 'Task', resourceId: 'task-002',
    customerId: 'cust-004', customerName: 'Aisha Al-Rashidi', previousValue: 'pending', newValue: 'in_progress',
    result: 'success', sessionId: 'sess-def', ipAddress: '192.168.1.11',
    details: 'Task status updated: pending → in_progress',
  },
  {
    id: 'audit-004', timestamp: '2026-08-28 10:40', actorUserId: 'admin-001', actorName: 'Sarah Chen',
    actorRole: 'admin', action: 'CUSTOMER_STATUS_CHANGED', resourceType: 'Customer', resourceId: 'cust-002',
    customerId: 'cust-002', customerName: 'Marcus Whitfield', previousValue: 'pending', newValue: 'verified',
    result: 'success', sessionId: 'sess-abc', ipAddress: '192.168.1.10',
    details: 'Customer verification status changed: pending → verified',
  },
  {
    id: 'audit-005', timestamp: '2026-08-28 11:00', actorUserId: 'admin-001', actorName: 'Sarah Chen',
    actorRole: 'admin', action: 'PERMISSION_CHANGED', resourceType: 'Permission', resourceId: 'broker-001',
    customerId: null, customerName: null, previousValue: 'view_customer_email: false', newValue: 'view_customer_email: true',
    result: 'success', sessionId: 'sess-abc', ipAddress: '192.168.1.10',
    details: 'Permission updated for James Park: view_customer_email false → true',
  },
  {
    id: 'audit-006', timestamp: '2026-08-28 11:30', actorUserId: 'fin-001', actorName: 'David Kim',
    actorRole: 'finance', action: 'WITHDRAWAL_REVIEWED', resourceType: 'Withdrawal', resourceId: 'wth-001',
    customerId: 'cust-004', customerName: 'Aisha Al-Rashidi', previousValue: 'pending', newValue: 'approved',
    result: 'success', sessionId: 'sess-ghi', ipAddress: '192.168.1.12',
    details: 'Withdrawal of $8,000 approved by Finance',
  },
  {
    id: 'audit-007', timestamp: '2026-08-28 12:00', actorUserId: 'cm-001', actorName: 'Lisa Wang',
    actorRole: 'compliance_manager', action: 'VERIFICATION_UPDATED', resourceType: 'Verification', resourceId: 'ver-003',
    customerId: 'cust-003', customerName: 'Priya Sharma', previousValue: 'pending', newValue: 'approved',
    result: 'success', sessionId: 'sess-jkl', ipAddress: '192.168.1.13',
    details: 'KYC documents approved by Compliance Manager',
  },
  {
    id: 'audit-008', timestamp: '2026-08-28 13:15', actorUserId: 'admin-001', actorName: 'Sarah Chen',
    actorRole: 'admin', action: 'ROLE_CHANGED', resourceType: 'Role', resourceId: 'broker-002',
    customerId: null, customerName: null, previousValue: 'broker', newValue: 'broker_manager',
    result: 'success', sessionId: 'sess-abc', ipAddress: '192.168.1.10',
    details: 'Role changed for Emma Wilson: broker → broker_manager',
  },
  {
    id: 'audit-009', timestamp: '2026-08-28 13:45', actorUserId: 'admin-001', actorName: 'Sarah Chen',
    actorRole: 'admin', action: 'CUSTOMER_REASSIGNED', resourceType: 'Assignment', resourceId: 'asgn-003',
    customerId: 'cust-002', customerName: 'Marcus Whitfield', previousValue: 'James Park', newValue: 'Emma Wilson',
    reason: 'Shift change', result: 'success', sessionId: 'sess-abc', ipAddress: '192.168.1.10',
    details: 'Customer reassigned from James Park to Emma Wilson — Reason: Shift change',
  },
  {
    id: 'audit-010', timestamp: '2026-08-28 14:00', actorUserId: 'broker-001', actorName: 'James Park',
    actorRole: 'broker', action: 'NOTE_ADDED', resourceType: 'Note', resourceId: 'note-001',
    customerId: 'cust-001', customerName: 'Alex Morgan', previousValue: null, newValue: 'Internal note added',
    result: 'success', sessionId: 'sess-def', ipAddress: '192.168.1.11',
    details: 'Internal note added to customer profile',
  },
  {
    id: 'audit-011', timestamp: '2026-08-28 14:20', actorUserId: 'broker-001', actorName: 'James Park',
    actorRole: 'broker', action: 'CALL_COMPLETED', resourceType: 'Call', resourceId: 'call-001',
    customerId: 'cust-001', customerName: 'Alex Morgan', previousValue: 'connecting', newValue: 'completed',
    result: 'success', sessionId: 'sess-def', ipAddress: '192.168.1.11',
    details: 'Outbound call completed — Duration: 4:32 — Outcome: Interested',
  },
  {
    id: 'audit-012', timestamp: '2026-08-28 14:35', actorUserId: 'admin-001', actorName: 'Sarah Chen',
    actorRole: 'admin', action: 'DEPOSIT_REVIEWED', resourceType: 'Deposit', resourceId: 'dep-002',
    customerId: 'cust-002', customerName: 'Marcus Whitfield', previousValue: 'pending', newValue: 'approved',
    result: 'success', sessionId: 'sess-abc', ipAddress: '192.168.1.10',
    details: 'Deposit of $5,000 reviewed and approved',
  },
];

const PLATFORM_ASSIGNMENTS: PlatformAssignment[] = [
  {
    id: 'asgn-001', customerId: 'cust-001', customerName: 'Alex Morgan', customerCountry: 'United Kingdom',
    customerStatus: 'active', assignedToId: 'broker-001', assignedToName: 'James Park',
    assignedToRole: 'ftd_broker', assignedById: 'admin-001', assignedByName: 'Sarah Chen',
    assignedAt: '2026-08-28 09:15', status: 'active', priority: 'high',
    notes: 'High-value prospect — FTD workflow',
    history: [
      { id: 'h1', timestamp: '2026-08-28 09:15', toStaffId: 'broker-001', toStaffName: 'James Park', toStaffRole: 'ftd_broker', changedById: 'admin-001', changedByName: 'Sarah Chen' },
    ],
  },
  {
    id: 'asgn-002', customerId: 'cust-004', customerName: 'Aisha Al-Rashidi', customerCountry: 'UAE',
    customerStatus: 'active', assignedToId: 'broker-001', assignedToName: 'James Park',
    assignedToRole: 'broker', assignedById: 'admin-001', assignedByName: 'Sarah Chen',
    assignedAt: '2026-08-27 07:30', status: 'active', priority: 'urgent',
    notes: 'Urgent follow-up required',
    history: [
      { id: 'h2', timestamp: '2026-08-27 07:30', toStaffId: 'broker-001', toStaffName: 'James Park', toStaffRole: 'broker', changedById: 'admin-001', changedByName: 'Sarah Chen' },
    ],
  },
  {
    id: 'asgn-003', customerId: 'cust-002', customerName: 'Marcus Whitfield', customerCountry: 'United Kingdom',
    customerStatus: 'verified', assignedToId: 'broker-002', assignedToName: 'Emma Wilson',
    assignedToRole: 'broker', assignedById: 'admin-001', assignedByName: 'Sarah Chen',
    assignedAt: '2026-08-28 13:45', status: 'active', priority: 'medium',
    notes: 'Reassigned — shift change',
    history: [
      { id: 'h3', timestamp: '2026-08-26 15:00', toStaffId: 'broker-001', toStaffName: 'James Park', toStaffRole: 'broker', changedById: 'admin-001', changedByName: 'Sarah Chen' },
      { id: 'h4', timestamp: '2026-08-28 13:45', fromStaffId: 'broker-001', fromStaffName: 'James Park', toStaffId: 'broker-002', toStaffName: 'Emma Wilson', toStaffRole: 'broker', changedById: 'admin-001', changedByName: 'Sarah Chen', reason: 'Shift change' },
    ],
  },
  {
    id: 'asgn-004', customerId: 'cust-005', customerName: 'Thomas Bergmann', customerCountry: 'Germany',
    customerStatus: 'pending', assignedToId: 'broker-001', assignedToName: 'James Park',
    assignedToRole: 'broker', assignedById: 'admin-001', assignedByName: 'Sarah Chen',
    assignedAt: '2026-08-26 18:00', status: 'active', priority: 'medium',
    notes: 'Initial contact required',
    history: [
      { id: 'h5', timestamp: '2026-08-26 18:00', toStaffId: 'broker-001', toStaffName: 'James Park', toStaffRole: 'broker', changedById: 'admin-001', changedByName: 'Sarah Chen' },
    ],
  },
];

const PLATFORM_TASKS: PlatformTask[] = [
  {
    id: 'task-001', customerId: 'cust-001', customerName: 'Alex Morgan', customerCountry: 'United Kingdom',
    assignedToId: 'broker-001', assignedToName: 'James Park', assignedToRole: 'ftd_broker',
    managerId: 'bm-001', managerName: 'Sarah Chen',
    createdById: 'admin-001', createdByName: 'Admin',
    type: 'call_customer', status: 'pending', priority: 'high',
    dueDate: '2026-08-28', notes: 'Customer requested follow-up about deposit',
    createdAt: '2026-08-28 08:00', updatedAt: '2026-08-28 08:00', completedAt: null,
    activityLog: [
      { id: 'al1', timestamp: '2026-08-28 08:00', actorId: 'admin-001', actorName: 'Admin', action: 'Task created', newStatus: 'pending' },
    ],
  },
  {
    id: 'task-002', customerId: 'cust-004', customerName: 'Aisha Al-Rashidi', customerCountry: 'UAE',
    assignedToId: 'broker-001', assignedToName: 'James Park', assignedToRole: 'broker',
    managerId: 'bm-001', managerName: 'Sarah Chen',
    createdById: 'admin-001', createdByName: 'Admin',
    type: 'follow_up', status: 'in_progress', priority: 'urgent',
    dueDate: '2026-08-28', notes: 'Urgent: customer has compliance question',
    createdAt: '2026-08-27 07:30', updatedAt: '2026-08-28 10:05', completedAt: null,
    activityLog: [
      { id: 'al2', timestamp: '2026-08-27 07:30', actorId: 'admin-001', actorName: 'Admin', action: 'Task created', newStatus: 'pending' },
      { id: 'al3', timestamp: '2026-08-28 10:05', actorId: 'broker-001', actorName: 'James Park', action: 'Status updated', previousStatus: 'pending', newStatus: 'in_progress' },
    ],
  },
  {
    id: 'task-003', customerId: 'cust-002', customerName: 'Marcus Whitfield', customerCountry: 'United Kingdom',
    assignedToId: 'broker-002', assignedToName: 'Emma Wilson', assignedToRole: 'broker',
    managerId: 'bm-001', managerName: 'Sarah Chen',
    createdById: 'broker-001', createdByName: 'James Park',
    type: 'verify_information', status: 'pending', priority: 'medium',
    dueDate: '2026-08-29', notes: 'Review submitted documents',
    createdAt: '2026-08-26 15:00', updatedAt: '2026-08-26 15:00', completedAt: null,
    activityLog: [
      { id: 'al4', timestamp: '2026-08-26 15:00', actorId: 'broker-001', actorName: 'James Park', action: 'Task created', newStatus: 'pending' },
    ],
  },
  {
    id: 'task-004', customerId: 'cust-005', customerName: 'Thomas Bergmann', customerCountry: 'Germany',
    assignedToId: 'broker-001', assignedToName: 'James Park', assignedToRole: 'broker',
    managerId: 'bm-001', managerName: 'Sarah Chen',
    createdById: 'admin-001', createdByName: 'Admin',
    type: 'contact_customer', status: 'pending', priority: 'medium',
    dueDate: '2026-08-28', notes: 'First contact — introduce platform',
    createdAt: '2026-08-26 18:00', updatedAt: '2026-08-26 18:00', completedAt: null,
    activityLog: [
      { id: 'al5', timestamp: '2026-08-26 18:00', actorId: 'admin-001', actorName: 'Admin', action: 'Task created', newStatus: 'pending' },
    ],
  },
  {
    id: 'task-005', customerId: 'cust-003', customerName: 'Priya Sharma', customerCountry: 'India',
    assignedToId: 'broker-001', assignedToName: 'James Park', assignedToRole: 'broker',
    managerId: 'bm-001', managerName: 'Sarah Chen',
    createdById: 'admin-001', createdByName: 'Admin',
    type: 'review_registration', status: 'overdue', priority: 'low',
    dueDate: '2026-08-26', notes: 'Review registration details',
    createdAt: '2026-08-25 10:00', updatedAt: '2026-08-25 10:00', completedAt: null,
    activityLog: [
      { id: 'al6', timestamp: '2026-08-25 10:00', actorId: 'admin-001', actorName: 'Admin', action: 'Task created', newStatus: 'pending' },
    ],
  },
];

const PLATFORM_NOTIFICATIONS: PlatformNotification[] = [
  {
    id: 'notif-001', recipientId: 'broker-001', recipientRole: 'ftd_broker',
    type: 'assignment', title: 'New Customer Assigned', message: 'Alex Morgan has been assigned to you.',
    resourceType: 'Assignment', resourceId: 'asgn-001', customerId: 'cust-001', customerName: 'Alex Morgan',
    read: false, createdAt: '2026-08-28 09:15', linkHref: '/ftd-broker',
  },
  {
    id: 'notif-002', recipientId: 'broker-001', recipientRole: 'broker',
    type: 'task', title: 'New Task Assigned', message: 'Call Alex Morgan — High priority, due today.',
    resourceType: 'Task', resourceId: 'task-001', customerId: 'cust-001', customerName: 'Alex Morgan',
    read: false, createdAt: '2026-08-28 09:20', linkHref: '/agent/tasks',
  },
  {
    id: 'notif-003', recipientId: 'bm-001', recipientRole: 'broker_manager',
    type: 'task', title: 'Task Overdue', message: 'Review Registration for Priya Sharma is overdue.',
    resourceType: 'Task', resourceId: 'task-005', customerId: 'cust-003', customerName: 'Priya Sharma',
    read: false, createdAt: '2026-08-28 08:00', linkHref: '/broker-manager',
  },
  {
    id: 'notif-004', recipientId: 'admin-001', recipientRole: 'admin',
    type: 'finance', title: 'Withdrawal Requires Review', message: 'Aisha Al-Rashidi — $8,000 withdrawal pending.',
    resourceType: 'Withdrawal', resourceId: 'wth-001', customerId: 'cust-004', customerName: 'Aisha Al-Rashidi',
    read: true, createdAt: '2026-08-28 11:30', linkHref: '/admin/finance/withdrawals',
  },
  {
    id: 'notif-005', recipientId: 'broker-002', recipientRole: 'broker',
    type: 'assignment', title: 'Customer Reassigned to You', message: 'Marcus Whitfield has been reassigned to you.',
    resourceType: 'Assignment', resourceId: 'asgn-003', customerId: 'cust-002', customerName: 'Marcus Whitfield',
    read: false, createdAt: '2026-08-28 13:45', linkHref: '/broker',
  },
];

const PRESENCE_MAP: Record<string, PresenceState> = {
  'admin-001': { userId: 'admin-001', userName: 'Sarah Chen', status: 'online', lastSeen: '2026-08-28 14:40' },
  'broker-001': { userId: 'broker-001', userName: 'James Park', status: 'online', lastSeen: '2026-08-28 14:35' },
  'broker-002': { userId: 'broker-002', userName: 'Emma Wilson', status: 'busy', lastSeen: '2026-08-28 14:20' },
  'ftd-001': { userId: 'ftd-001', userName: 'Carlos Mendez', status: 'online', lastSeen: '2026-08-28 13:15' },
  'ret-001': { userId: 'ret-001', userName: 'Maria Santos', status: 'away', lastSeen: '2026-08-28 12:00' },
  'comp-001': { userId: 'comp-001', userName: 'Yuki Tanaka', status: 'online', lastSeen: '2026-08-28 11:30' },
  'fin-001': { userId: 'fin-001', userName: 'David Kim', status: 'online', lastSeen: '2026-08-28 14:00' },
  'cm-001': { userId: 'cm-001', userName: 'Lisa Wang', status: 'online', lastSeen: '2026-08-28 13:45' },
  'bm-001': { userId: 'bm-001', userName: 'Sarah Chen', status: 'online', lastSeen: '2026-08-28 14:40' },
  'cust-001': { userId: 'cust-001', userName: 'Alex Morgan', status: 'online', lastSeen: '2026-08-28 14:30' },
  'cust-002': { userId: 'cust-002', userName: 'Marcus Whitfield', status: 'offline', lastSeen: '2026-08-27 18:00' },
  'cust-003': { userId: 'cust-003', userName: 'Priya Sharma', status: 'away', lastSeen: '2026-08-28 11:00' },
  'cust-004': { userId: 'cust-004', userName: 'Aisha Al-Rashidi', status: 'online', lastSeen: '2026-08-28 14:25' },
};

// ─── Event Listeners (for cross-dashboard propagation) ───────────────────────

type PlatformEventType = 'assignment_created' | 'assignment_updated' | 'task_created' | 'task_updated' | 'notification_created' | 'audit_created' | 'presence_changed';
type PlatformEventListener = (event: { type: PlatformEventType; payload: unknown }) => void;
const eventListeners: PlatformEventListener[] = [];

function emit(type: PlatformEventType, payload: unknown) {
  eventListeners.forEach(fn => fn({ type, payload }));
}

// ─── Platform Service ─────────────────────────────────────────────────────────

export const platformService = {
  // ── Audit ──────────────────────────────────────────────────────────────────

  async getAuditRecords(): Promise<AuditRecord[]> {
    // BACKEND INTEGRATION: GET /api/v1/admin/audit
    return [...AUDIT_RECORDS].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  },

  async createAuditRecord(record: Omit<AuditRecord, 'id' | 'timestamp'>): Promise<AuditRecord> {
    // BACKEND INTEGRATION: POST /api/v1/admin/audit (append-only)
    const newRecord: AuditRecord = {
      ...record,
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    AUDIT_RECORDS.push(newRecord);
    emit('audit_created', newRecord);
    return newRecord;
  },

  // ── Assignments ────────────────────────────────────────────────────────────

  async getAssignments(filters?: { staffId?: string; customerId?: string; status?: string }): Promise<PlatformAssignment[]> {
    // BACKEND INTEGRATION: GET /api/v1/assignments
    let result = [...PLATFORM_ASSIGNMENTS];
    if (filters?.staffId) result = result.filter(a => a.assignedToId === filters.staffId);
    if (filters?.customerId) result = result.filter(a => a.customerId === filters.customerId);
    if (filters?.status) result = result.filter(a => a.status === filters.status);
    return result;
  },

  async createAssignment(
    data: Omit<PlatformAssignment, 'id' | 'assignedAt' | 'history'>,
    actorId: string,
    actorName: string,
    actorRole: RoleId
  ): Promise<PlatformAssignment> {
    // BACKEND INTEGRATION: POST /api/v1/assignments
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const assignment: PlatformAssignment = {
      ...data,
      id: `asgn-${Date.now()}`,
      assignedAt: now,
      history: [{
        id: `h-${Date.now()}`,
        timestamp: now,
        toStaffId: data.assignedToId,
        toStaffName: data.assignedToName,
        toStaffRole: data.assignedToRole,
        changedById: actorId,
        changedByName: actorName,
      }],
    };
    PLATFORM_ASSIGNMENTS.push(assignment);
    emit('assignment_created', assignment);

    // Create audit record
    await this.createAuditRecord({
      actorUserId: actorId, actorName, actorRole,
      action: 'CUSTOMER_ASSIGNED', resourceType: 'Assignment', resourceId: assignment.id,
      customerId: data.customerId, customerName: data.customerName,
      previousValue: null, newValue: `${data.assignedToName} (${ROLE_DISPLAY_NAMES[data.assignedToRole] || data.assignedToRole})`,
      result: 'success', sessionId: `sess-${Date.now()}`,
      details: `Customer assigned to ${data.assignedToName}`,
    });

    // Create notification for assignee
    await this.createNotification({
      recipientId: data.assignedToId,
      recipientRole: data.assignedToRole,
      type: 'assignment',
      title: 'New Customer Assigned',
      message: `${data.customerName} has been assigned to you.`,
      resourceType: 'Assignment',
      resourceId: assignment.id,
      customerId: data.customerId,
      customerName: data.customerName,
      linkHref: `/${data.assignedToRole.replace(/_/g, '-')}`,
    });

    return assignment;
  },

  async reassignCustomer(
    assignmentId: string,
    newStaffId: string,
    newStaffName: string,
    newStaffRole: RoleId,
    actorId: string,
    actorName: string,
    actorRole: RoleId,
    reason?: string
  ): Promise<PlatformAssignment | null> {
    // BACKEND INTEGRATION: PATCH /api/v1/assignments/:id/reassign
    const idx = PLATFORM_ASSIGNMENTS.findIndex(a => a.id === assignmentId);
    if (idx === -1) return null;

    const prev = PLATFORM_ASSIGNMENTS[idx];
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const historyEntry: AssignmentHistoryEntry = {
      id: `h-${Date.now()}`,
      timestamp: now,
      fromStaffId: prev.assignedToId,
      fromStaffName: prev.assignedToName,
      toStaffId: newStaffId,
      toStaffName: newStaffName,
      toStaffRole: newStaffRole,
      changedById: actorId,
      changedByName: actorName,
      reason,
    };

    PLATFORM_ASSIGNMENTS[idx] = {
      ...prev,
      assignedToId: newStaffId,
      assignedToName: newStaffName,
      assignedToRole: newStaffRole,
      history: [...prev.history, historyEntry],
    };

    emit('assignment_updated', PLATFORM_ASSIGNMENTS[idx]);

    await this.createAuditRecord({
      actorUserId: actorId, actorName, actorRole,
      action: 'CUSTOMER_REASSIGNED', resourceType: 'Assignment', resourceId: assignmentId,
      customerId: prev.customerId, customerName: prev.customerName,
      previousValue: prev.assignedToName, newValue: newStaffName,
      reason: reason || null, result: 'success', sessionId: `sess-${Date.now()}`,
      details: `Customer reassigned from ${prev.assignedToName} to ${newStaffName}${reason ? ` — Reason: ${reason}` : ''}`,
    });

    // Notify new assignee
    await this.createNotification({
      recipientId: newStaffId, recipientRole: newStaffRole,
      type: 'assignment', title: 'Customer Reassigned to You',
      message: `${prev.customerName} has been reassigned to you.`,
      resourceType: 'Assignment', resourceId: assignmentId,
      customerId: prev.customerId, customerName: prev.customerName,
      linkHref: `/${newStaffRole.replace(/_/g, '-')}`,
    });

    return PLATFORM_ASSIGNMENTS[idx];
  },

  // ── Tasks ──────────────────────────────────────────────────────────────────

  async getTasks(filters?: { staffId?: string; customerId?: string; managerId?: string }): Promise<PlatformTask[]> {
    // BACKEND INTEGRATION: GET /api/v1/tasks
    let result = [...PLATFORM_TASKS];
    if (filters?.staffId) result = result.filter(t => t.assignedToId === filters.staffId);
    if (filters?.customerId) result = result.filter(t => t.customerId === filters.customerId);
    if (filters?.managerId) result = result.filter(t => t.managerId === filters.managerId);
    return result;
  },

  async createTask(
    data: Omit<PlatformTask, 'id' | 'createdAt' | 'updatedAt' | 'activityLog'>,
    actorId: string,
    actorName: string,
    actorRole: RoleId
  ): Promise<PlatformTask> {
    // BACKEND INTEGRATION: POST /api/v1/tasks
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const task: PlatformTask = {
      ...data,
      id: `task-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
      activityLog: [{
        id: `al-${Date.now()}`,
        timestamp: now,
        actorId,
        actorName,
        action: 'Task created',
        newStatus: data.status,
      }],
    };
    PLATFORM_TASKS.push(task);
    emit('task_created', task);

    await this.createAuditRecord({
      actorUserId: actorId, actorName, actorRole,
      action: 'TASK_CREATED', resourceType: 'Task', resourceId: task.id,
      customerId: data.customerId, customerName: data.customerName,
      previousValue: null, newValue: `${data.type.replace(/_/g, ' ')} — ${data.priority}`,
      result: 'success', sessionId: `sess-${Date.now()}`,
      details: `Task created: ${data.type.replace(/_/g, ' ')} for ${data.customerName} — assigned to ${data.assignedToName}`,
    });

    await this.createNotification({
      recipientId: data.assignedToId, recipientRole: data.assignedToRole,
      type: 'task', title: 'New Task Assigned',
      message: `${data.type.replace(/_/g, ' ')} — ${data.customerName} — ${data.priority} priority.`,
      resourceType: 'Task', resourceId: task.id,
      customerId: data.customerId, customerName: data.customerName,
      linkHref: '/agent/tasks',
    });

    return task;
  },

  async updateTaskStatus(
    taskId: string,
    newStatus: PlatformTask['status'],
    actorId: string,
    actorName: string,
    actorRole: RoleId,
    note?: string
  ): Promise<PlatformTask | null> {
    // BACKEND INTEGRATION: PATCH /api/v1/tasks/:id/status
    const idx = PLATFORM_TASKS.findIndex(t => t.id === taskId);
    if (idx === -1) return null;

    const prev = PLATFORM_TASKS[idx];
    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const activityEntry: TaskActivityEntry = {
      id: `al-${Date.now()}`,
      timestamp: now,
      actorId,
      actorName,
      action: 'Status updated',
      previousStatus: prev.status,
      newStatus,
      note,
    };

    PLATFORM_TASKS[idx] = {
      ...prev,
      status: newStatus,
      updatedAt: now,
      completedAt: newStatus === 'completed' ? now : prev.completedAt,
      activityLog: [...prev.activityLog, activityEntry],
    };

    emit('task_updated', PLATFORM_TASKS[idx]);

    const auditAction: AuditAction = newStatus === 'completed' ? 'TASK_COMPLETED' : 'TASK_UPDATED';
    await this.createAuditRecord({
      actorUserId: actorId, actorName, actorRole,
      action: auditAction, resourceType: 'Task', resourceId: taskId,
      customerId: prev.customerId, customerName: prev.customerName,
      previousValue: prev.status, newValue: newStatus,
      reason: note || null, result: 'success', sessionId: `sess-${Date.now()}`,
      details: `Task status updated: ${prev.status} → ${newStatus}${note ? ` — Note: ${note}` : ''}`,
    });

    return PLATFORM_TASKS[idx];
  },

  // ── Notifications ──────────────────────────────────────────────────────────

  async getNotifications(recipientId: string): Promise<PlatformNotification[]> {
    // BACKEND INTEGRATION: GET /api/v1/notifications?recipientId=:id
    return PLATFORM_NOTIFICATIONS.filter(n => n.recipientId === recipientId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  async createNotification(data: Omit<PlatformNotification, 'id' | 'read' | 'createdAt'>): Promise<PlatformNotification> {
    // BACKEND INTEGRATION: POST /api/v1/notifications
    const notif: PlatformNotification = {
      ...data,
      id: `notif-${Date.now()}`,
      read: false,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };
    PLATFORM_NOTIFICATIONS.push(notif);
    emit('notification_created', notif);
    return notif;
  },

  async markNotificationRead(notifId: string): Promise<void> {
    // BACKEND INTEGRATION: PATCH /api/v1/notifications/:id/read
    const idx = PLATFORM_NOTIFICATIONS.findIndex(n => n.id === notifId);
    if (idx !== -1) PLATFORM_NOTIFICATIONS[idx].read = true;
  },

  async getUnreadCount(recipientId: string): Promise<number> {
    return PLATFORM_NOTIFICATIONS.filter(n => n.recipientId === recipientId && !n.read).length;
  },

  // ── Presence ───────────────────────────────────────────────────────────────

  getPresence(userId: string): PresenceState | null {
    // BACKEND INTEGRATION: GET /api/v1/presence/:userId (WebSocket subscription)
    return PRESENCE_MAP[userId] || null;
  },

  getAllPresence(): PresenceState[] {
    return Object.values(PRESENCE_MAP);
  },

  updatePresence(userId: string, status: PresenceState['status']): void {
    // BACKEND INTEGRATION: PATCH /api/v1/presence/:userId
    if (PRESENCE_MAP[userId]) {
      PRESENCE_MAP[userId].status = status;
      PRESENCE_MAP[userId].lastSeen = new Date().toISOString().replace('T', ' ').slice(0, 16);
      emit('presence_changed', PRESENCE_MAP[userId]);
    }
  },

  // ── Event Bus ──────────────────────────────────────────────────────────────

  subscribe(listener: PlatformEventListener): () => void {
    eventListeners.push(listener);
    return () => {
      const idx = eventListeners.indexOf(listener);
      if (idx !== -1) eventListeners.splice(idx, 1);
    };
  },
};
