// Central RBAC System — CryptoVault
// Frontend role checks are UX only. Backend API must enforce all permissions server-side.

export type RoleId =
  | 'super_admin' |'admin' |'customer' |'affiliate' |'operator' |'broker' |'ftd_broker' |'retention_broker' |'compliance_broker' |'new_affiliate_manager' |'affiliate_manager' |'broker_manager' |'desk_manager' |'shift_manager' |'desk_broker' |'marketer_manager' |'compliance_manager' |'team_leader' |'office' |'vp_sales' |'finance' |'conversion_manager' |'retention_manager';

export type AccountStatus = 'active' | 'suspended' | 'disabled';

export interface StaffSession {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: RoleId;
  permissions: string[];
  managerId?: string;
  managerName?: string;
  department?: string;
  office?: string;
  shift?: string;
  status: AccountStatus;
  presenceStatus?: 'online' | 'away' | 'busy' | 'offline';
}

export interface RoleDefinition {
  id: RoleId;
  displayName: string;
  description: string;
  defaultRoute: string;
  permissions: string[];
  navItems: NavItem[];
  isStaff: boolean;
  isAdmin: boolean;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: string;
}

// Role → default workspace route
export const ROLE_DEFAULT_ROUTES: Record<RoleId, string> = {
  super_admin: '/admin-dashboard',
  admin: '/admin-dashboard',
  customer: '/trading-dashboard',
  affiliate: '/affiliate',
  operator: '/operator',
  broker: '/broker',
  ftd_broker: '/ftd-broker',
  retention_broker: '/retention-broker',
  compliance_broker: '/compliance-broker',
  new_affiliate_manager: '/new-affiliate-manager',
  affiliate_manager: '/affiliate-manager',
  broker_manager: '/broker-manager',
  desk_manager: '/desk-manager',
  shift_manager: '/shift-manager',
  desk_broker: '/desk-broker',
  marketer_manager: '/marketer-manager',
  compliance_manager: '/compliance-manager',
  team_leader: '/team-leader',
  office: '/office',
  vp_sales: '/vp-sales',
  finance: '/finance-workspace',
  conversion_manager: '/conversion-manager',
  retention_manager: '/retention-manager',
};

// Routes accessible by each role (prefix match)
export const ROLE_ALLOWED_ROUTES: Record<RoleId, string[]> = {
  super_admin: ['/'],
  admin: ['/admin', '/admin-dashboard'],
  customer: ['/trading-dashboard', '/trade-trading-workspace', '/markets', '/portfolio', '/messages', '/settings', '/kyc', '/finance'],
  affiliate: ['/affiliate', '/settings'],
  operator: ['/operator', '/settings'],
  broker: ['/broker', '/settings'],
  ftd_broker: ['/ftd-broker', '/settings'],
  retention_broker: ['/retention-broker', '/settings'],
  compliance_broker: ['/compliance-broker', '/settings'],
  new_affiliate_manager: ['/new-affiliate-manager', '/settings'],
  affiliate_manager: ['/affiliate-manager', '/settings'],
  broker_manager: ['/broker-manager', '/settings'],
  desk_manager: ['/desk-manager', '/settings'],
  shift_manager: ['/shift-manager', '/settings'],
  desk_broker: ['/desk-broker', '/settings'],
  marketer_manager: ['/marketer-manager', '/settings'],
  compliance_manager: ['/compliance-manager', '/settings'],
  team_leader: ['/team-leader', '/settings'],
  office: ['/office', '/settings'],
  vp_sales: ['/vp-sales', '/settings'],
  finance: ['/finance-workspace', '/settings'],
  conversion_manager: ['/conversion-manager', '/settings'],
  retention_manager: ['/retention-manager', '/settings'],
};

// All staff roles (non-customer)
export const STAFF_ROLES: RoleId[] = [
  'super_admin', 'admin',
  'affiliate', 'operator', 'broker', 'ftd_broker', 'retention_broker', 'compliance_broker',
  'new_affiliate_manager', 'affiliate_manager', 'broker_manager', 'desk_manager',
  'shift_manager', 'desk_broker', 'marketer_manager', 'compliance_manager',
  'team_leader', 'office', 'vp_sales', 'finance', 'conversion_manager', 'retention_manager',
];

export const ROLE_DISPLAY_NAMES: Record<RoleId, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  customer: 'Customer',
  affiliate: 'Affiliate',
  operator: 'Operator',
  broker: 'Broker',
  ftd_broker: 'FTD Broker',
  retention_broker: 'Retention Broker',
  compliance_broker: 'Compliance Broker',
  new_affiliate_manager: 'New Affiliate Manager',
  affiliate_manager: 'Affiliate Manager',
  broker_manager: 'Broker Manager',
  desk_manager: 'Desk Manager',
  shift_manager: 'Shift Manager',
  desk_broker: 'Desk Broker',
  marketer_manager: 'Marketer Manager',
  compliance_manager: 'Compliance Manager',
  team_leader: 'Team Leader',
  office: 'Office',
  vp_sales: 'VP Sales',
  finance: 'Finance',
  conversion_manager: 'Conversion Manager',
  retention_manager: 'Retention Manager',
};

// Role-based navigation configs
export const ROLE_NAV_ITEMS: Record<RoleId, NavItem[]> = {
  super_admin: [],
  admin: [],
  customer: [],
  affiliate: [
    { label: 'Overview', href: '/affiliate', icon: 'LayoutDashboard' },
    { label: 'Performance', href: '/affiliate/performance', icon: 'TrendingUp' },
    { label: 'Campaigns', href: '/affiliate/campaigns', icon: 'Megaphone' },
    { label: 'Commissions', href: '/affiliate/commissions', icon: 'DollarSign' },
    { label: 'Messages', href: '/affiliate/messages', icon: 'MessageSquare', badge: '2' },
    { label: 'Profile', href: '/affiliate/profile', icon: 'User' },
  ],
  operator: [
    { label: 'Overview', href: '/operator', icon: 'LayoutDashboard' },
    { label: 'Customers', href: '/operator/customers', icon: 'Users', badge: '12' },
    { label: 'Tasks', href: '/operator/tasks', icon: 'ClipboardList', badge: '3' },
    { label: 'Calls', href: '/operator/calls', icon: 'PhoneCall' },
    { label: 'Messages', href: '/operator/messages', icon: 'MessageSquare' },
    { label: 'Profile', href: '/operator/profile', icon: 'User' },
  ],
  broker: [
    { label: 'Overview', href: '/broker', icon: 'LayoutDashboard' },
    { label: 'Customers', href: '/broker/customers', icon: 'Users', badge: '18' },
    { label: 'Tasks', href: '/broker/tasks', icon: 'ClipboardList', badge: '5' },
    { label: 'Calls', href: '/broker/calls', icon: 'PhoneCall' },
    { label: 'Messages', href: '/broker/messages', icon: 'MessageSquare', badge: '4' },
    { label: 'Performance', href: '/broker/performance', icon: 'BarChart2' },
    { label: 'Profile', href: '/broker/profile', icon: 'User' },
  ],
  ftd_broker: [
    { label: 'Overview', href: '/ftd-broker', icon: 'LayoutDashboard' },
    { label: 'Customers', href: '/ftd-broker/customers', icon: 'Users', badge: '9' },
    { label: 'Pending FTD', href: '/ftd-broker/pending', icon: 'Clock', badge: '6' },
    { label: 'Follow-ups', href: '/ftd-broker/followups', icon: 'CalendarCheck' },
    { label: 'Calls', href: '/ftd-broker/calls', icon: 'PhoneCall' },
    { label: 'Messages', href: '/ftd-broker/messages', icon: 'MessageSquare' },
    { label: 'Performance', href: '/ftd-broker/performance', icon: 'TrendingUp' },
    { label: 'Profile', href: '/ftd-broker/profile', icon: 'User' },
  ],
  retention_broker: [
    { label: 'Overview', href: '/retention-broker', icon: 'LayoutDashboard' },
    { label: 'Customers', href: '/retention-broker/customers', icon: 'Users', badge: '22' },
    { label: 'Retention Tasks', href: '/retention-broker/tasks', icon: 'ClipboardList' },
    { label: 'Follow-ups', href: '/retention-broker/followups', icon: 'CalendarCheck' },
    { label: 'Calls', href: '/retention-broker/calls', icon: 'PhoneCall' },
    { label: 'Messages', href: '/retention-broker/messages', icon: 'MessageSquare' },
    { label: 'Performance', href: '/retention-broker/performance', icon: 'BarChart2' },
    { label: 'Profile', href: '/retention-broker/profile', icon: 'User' },
  ],
  compliance_broker: [
    { label: 'Overview', href: '/compliance-broker', icon: 'LayoutDashboard' },
    { label: 'Cases', href: '/compliance-broker/cases', icon: 'ShieldCheck', badge: '7' },
    { label: 'KYC Queue', href: '/compliance-broker/kyc', icon: 'FileText' },
    { label: 'Documents', href: '/compliance-broker/documents', icon: 'FolderOpen' },
    { label: 'Messages', href: '/compliance-broker/messages', icon: 'MessageSquare' },
    { label: 'Profile', href: '/compliance-broker/profile', icon: 'User' },
  ],
  new_affiliate_manager: [
    { label: 'Overview', href: '/new-affiliate-manager', icon: 'LayoutDashboard' },
    { label: 'New Affiliates', href: '/new-affiliate-manager/affiliates', icon: 'UserPlus' },
    { label: 'Applications', href: '/new-affiliate-manager/applications', icon: 'ClipboardList', badge: '4' },
    { label: 'Campaigns', href: '/new-affiliate-manager/campaigns', icon: 'Megaphone' },
    { label: 'Team', href: '/new-affiliate-manager/team', icon: 'Users' },
    { label: 'Messages', href: '/new-affiliate-manager/messages', icon: 'MessageSquare' },
    { label: 'Profile', href: '/new-affiliate-manager/profile', icon: 'User' },
  ],
  affiliate_manager: [
    { label: 'Overview', href: '/affiliate-manager', icon: 'LayoutDashboard' },
    { label: 'Affiliates', href: '/affiliate-manager/affiliates', icon: 'Users' },
    { label: 'Performance', href: '/affiliate-manager/performance', icon: 'TrendingUp' },
    { label: 'Campaigns', href: '/affiliate-manager/campaigns', icon: 'Megaphone' },
    { label: 'Reports', href: '/affiliate-manager/reports', icon: 'BarChart2' },
    { label: 'Team', href: '/affiliate-manager/team', icon: 'Users2' },
    { label: 'Messages', href: '/affiliate-manager/messages', icon: 'MessageSquare' },
    { label: 'Profile', href: '/affiliate-manager/profile', icon: 'User' },
  ],
  broker_manager: [
    { label: 'Overview', href: '/broker-manager', icon: 'LayoutDashboard' },
    { label: 'Broker Team', href: '/broker-manager/team', icon: 'Users' },
    { label: 'Customers', href: '/broker-manager/customers', icon: 'UserCog' },
    { label: 'Performance', href: '/broker-manager/performance', icon: 'BarChart2' },
    { label: 'Assignments', href: '/broker-manager/assignments', icon: 'UserCheck' },
    { label: 'Reports', href: '/broker-manager/reports', icon: 'FileText' },
    { label: 'Messages', href: '/broker-manager/messages', icon: 'MessageSquare' },
    { label: 'Profile', href: '/broker-manager/profile', icon: 'User' },
  ],
  desk_manager: [
    { label: 'Overview', href: '/desk-manager', icon: 'LayoutDashboard' },
    { label: 'Desk Brokers', href: '/desk-manager/brokers', icon: 'Users' },
    { label: 'Customers', href: '/desk-manager/customers', icon: 'UserCog' },
    { label: 'Assignments', href: '/desk-manager/assignments', icon: 'UserCheck' },
    { label: 'Performance', href: '/desk-manager/performance', icon: 'TrendingUp' },
    { label: 'Shift Status', href: '/desk-manager/shift', icon: 'Clock' },
    { label: 'Messages', href: '/desk-manager/messages', icon: 'MessageSquare' },
    { label: 'Profile', href: '/desk-manager/profile', icon: 'User' },
  ],
  shift_manager: [
    { label: 'Current Shift', href: '/shift-manager', icon: 'Clock' },
    { label: 'Staff Online', href: '/shift-manager/staff', icon: 'Users' },
    { label: 'Workload', href: '/shift-manager/workload', icon: 'BarChart2' },
    { label: 'Customer Queue', href: '/shift-manager/queue', icon: 'List' },
    { label: 'Escalations', href: '/shift-manager/escalations', icon: 'AlertTriangle', badge: '2' },
    { label: 'Messages', href: '/shift-manager/messages', icon: 'MessageSquare' },
    { label: 'Profile', href: '/shift-manager/profile', icon: 'User' },
  ],
  desk_broker: [
    { label: 'Overview', href: '/desk-broker', icon: 'LayoutDashboard' },
    { label: 'Customers', href: '/desk-broker/customers', icon: 'Users', badge: '15' },
    { label: 'Tasks', href: '/desk-broker/tasks', icon: 'ClipboardList' },
    { label: 'Calls', href: '/desk-broker/calls', icon: 'PhoneCall' },
    { label: 'Messages', href: '/desk-broker/messages', icon: 'MessageSquare' },
    { label: 'Performance', href: '/desk-broker/performance', icon: 'TrendingUp' },
    { label: 'Profile', href: '/desk-broker/profile', icon: 'User' },
  ],
  marketer_manager: [
    { label: 'Overview', href: '/marketer-manager', icon: 'LayoutDashboard' },
    { label: 'Campaigns', href: '/marketer-manager/campaigns', icon: 'Megaphone' },
    { label: 'Affiliates', href: '/marketer-manager/affiliates', icon: 'Users' },
    { label: 'UTM Analytics', href: '/marketer-manager/utm', icon: 'BarChart' },
    { label: 'Traffic', href: '/marketer-manager/traffic', icon: 'TrendingUp' },
    { label: 'Reports', href: '/marketer-manager/reports', icon: 'FileText' },
    { label: 'Team', href: '/marketer-manager/team', icon: 'Users2' },
    { label: 'Messages', href: '/marketer-manager/messages', icon: 'MessageSquare' },
    { label: 'Profile', href: '/marketer-manager/profile', icon: 'User' },
  ],
  compliance_manager: [
    { label: 'Overview', href: '/compliance-manager', icon: 'LayoutDashboard' },
    { label: 'Compliance Team', href: '/compliance-manager/team', icon: 'Users' },
    { label: 'Verification Queue', href: '/compliance-manager/queue', icon: 'ShieldCheck', badge: '11' },
    { label: 'Documents', href: '/compliance-manager/documents', icon: 'FolderOpen' },
    { label: 'Escalations', href: '/compliance-manager/escalations', icon: 'AlertTriangle' },
    { label: 'Reports', href: '/compliance-manager/reports', icon: 'FileText' },
    { label: 'Messages', href: '/compliance-manager/messages', icon: 'MessageSquare' },
    { label: 'Profile', href: '/compliance-manager/profile', icon: 'User' },
  ],
  team_leader: [
    { label: 'Overview', href: '/team-leader', icon: 'LayoutDashboard' },
    { label: 'Team Members', href: '/team-leader/team', icon: 'Users' },
    { label: 'Customers', href: '/team-leader/customers', icon: 'UserCog' },
    { label: 'Tasks', href: '/team-leader/tasks', icon: 'ClipboardList' },
    { label: 'Performance', href: '/team-leader/performance', icon: 'BarChart2' },
    { label: 'Escalations', href: '/team-leader/escalations', icon: 'AlertTriangle' },
    { label: 'Messages', href: '/team-leader/messages', icon: 'MessageSquare' },
    { label: 'Profile', href: '/team-leader/profile', icon: 'User' },
  ],
  office: [
    { label: 'Overview', href: '/office', icon: 'LayoutDashboard' },
    { label: 'Staff', href: '/office/staff', icon: 'Users' },
    { label: 'Customers', href: '/office/customers', icon: 'UserCog' },
    { label: 'Tasks', href: '/office/tasks', icon: 'ClipboardList' },
    { label: 'Activity', href: '/office/activity', icon: 'Activity' },
    { label: 'Messages', href: '/office/messages', icon: 'MessageSquare' },
    { label: 'Profile', href: '/office/profile', icon: 'User' },
  ],
  vp_sales: [
    { label: 'Overview', href: '/vp-sales', icon: 'LayoutDashboard' },
    { label: 'Teams', href: '/vp-sales/teams', icon: 'Users' },
    { label: 'Performance', href: '/vp-sales/performance', icon: 'TrendingUp' },
    { label: 'Revenue', href: '/vp-sales/revenue', icon: 'DollarSign' },
    { label: 'Managers', href: '/vp-sales/managers', icon: 'UserCog' },
    { label: 'Reports', href: '/vp-sales/reports', icon: 'BarChart2' },
    { label: 'Messages', href: '/vp-sales/messages', icon: 'MessageSquare' },
    { label: 'Profile', href: '/vp-sales/profile', icon: 'User' },
  ],
  finance: [
    { label: 'Overview', href: '/finance-workspace', icon: 'LayoutDashboard' },
    { label: 'Accounts', href: '/finance-workspace/accounts', icon: 'Wallet' },
    { label: 'Transactions', href: '/finance-workspace/transactions', icon: 'ArrowUpDown' },
    { label: 'Deposits', href: '/finance-workspace/deposits', icon: 'CreditCard', badge: '3' },
    { label: 'Withdrawals', href: '/finance-workspace/withdrawals', icon: 'ArrowUpDown', badge: '2' },
    { label: 'Reports', href: '/finance-workspace/reports', icon: 'FileText' },
    { label: 'Messages', href: '/finance-workspace/messages', icon: 'MessageSquare' },
    { label: 'Profile', href: '/finance-workspace/profile', icon: 'User' },
  ],
  conversion_manager: [
    { label: 'Overview', href: '/conversion-manager', icon: 'LayoutDashboard' },
    { label: 'FTD Brokers', href: '/conversion-manager/brokers', icon: 'Users' },
    { label: 'Registrations', href: '/conversion-manager/registrations', icon: 'UserPlus' },
    { label: 'FTD Funnel', href: '/conversion-manager/funnel', icon: 'Filter' },
    { label: 'Assignments', href: '/conversion-manager/assignments', icon: 'UserCheck' },
    { label: 'Performance', href: '/conversion-manager/performance', icon: 'TrendingUp' },
    { label: 'Reports', href: '/conversion-manager/reports', icon: 'BarChart2' },
    { label: 'Messages', href: '/conversion-manager/messages', icon: 'MessageSquare' },
    { label: 'Profile', href: '/conversion-manager/profile', icon: 'User' },
  ],
  retention_manager: [
    { label: 'Overview', href: '/retention-manager', icon: 'LayoutDashboard' },
    { label: 'Retention Team', href: '/retention-manager/team', icon: 'Users' },
    { label: 'Customers', href: '/retention-manager/customers', icon: 'UserCog' },
    { label: 'Retention Queue', href: '/retention-manager/queue', icon: 'List', badge: '8' },
    { label: 'Performance', href: '/retention-manager/performance', icon: 'BarChart2' },
    { label: 'Reports', href: '/retention-manager/reports', icon: 'FileText' },
    { label: 'Messages', href: '/retention-manager/messages', icon: 'MessageSquare' },
    { label: 'Profile', href: '/retention-manager/profile', icon: 'User' },
  ],
};

// Check if a user can access a given route
export function canAccessRoute(session: StaffSession | null, pathname: string): boolean {
  if (!session) return false;
  if (session.status !== 'active') return false;
  if (session.role === 'super_admin') return true;

  const allowed = ROLE_ALLOWED_ROUTES[session.role] || [];
  return allowed.some(prefix => pathname === prefix || pathname.startsWith(prefix + '/'));
}

// Get the default route for a role
export function getDefaultRoute(role: RoleId): string {
  return ROLE_DEFAULT_ROUTES[role] || '/sign-up-login-screen';
}

// Check if role is a staff role
export function isStaffRole(role: RoleId): boolean {
  return role !== 'customer';
}

// Get display name for role
export function getRoleDisplayName(role: string): string {
  return ROLE_DISPLAY_NAMES[role as RoleId] || role;
}

// All role options for dropdowns
export const ALL_ROLE_OPTIONS: { value: RoleId; label: string }[] = [
  { value: 'super_admin', label: 'Super Admin' },
  { value: 'admin', label: 'Admin' },
  { value: 'affiliate', label: 'Affiliate' },
  { value: 'operator', label: 'Operator' },
  { value: 'broker', label: 'Broker' },
  { value: 'ftd_broker', label: 'FTD Broker' },
  { value: 'retention_broker', label: 'Retention Broker' },
  { value: 'compliance_broker', label: 'Compliance Broker' },
  { value: 'new_affiliate_manager', label: 'New Affiliate Manager' },
  { value: 'affiliate_manager', label: 'Affiliate Manager' },
  { value: 'broker_manager', label: 'Broker Manager' },
  { value: 'desk_manager', label: 'Desk Manager' },
  { value: 'shift_manager', label: 'Shift Manager' },
  { value: 'desk_broker', label: 'Desk Broker' },
  { value: 'marketer_manager', label: 'Marketer Manager' },
  { value: 'compliance_manager', label: 'Compliance Manager' },
  { value: 'team_leader', label: 'Team Leader' },
  { value: 'office', label: 'Office' },
  { value: 'vp_sales', label: 'VP Sales' },
  { value: 'finance', label: 'Finance' },
  { value: 'conversion_manager', label: 'Conversion Manager' },
  { value: 'retention_manager', label: 'Retention Manager' },
  { value: 'customer', label: 'Customer' },
];
