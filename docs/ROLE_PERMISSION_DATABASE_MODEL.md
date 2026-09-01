# Trade Console — Role & Permission Database Model

---

## 1. Current Role System

Inspected from `src/lib/rbac.ts`, `src/services/admin.service.ts`, and `src/services/auth.service.ts`.

| Display Name | Internal Key | Default Route | Manager Type | Workspace |
|-------------|-------------|---------------|--------------|-----------|
| Super Admin | `super_admin` | `/admin-dashboard` | — | Admin |
| Admin | `admin` | `/admin-dashboard` | — | Admin |
| Customer | `customer` | `/trading-dashboard` | — | Customer |
| Affiliate | `affiliate` | `/affiliate` | — | Affiliate |
| Operator | `operator` | `/operator` | — | Staff |
| Broker | `broker` | `/broker` | broker_manager | Staff |
| FTD Broker | `ftd_broker` | `/ftd-broker` | conversion_manager | Staff |
| Retention Broker | `retention_broker` | `/retention-broker` | retention_manager | Staff |
| Compliance Broker | `compliance_broker` | `/compliance-broker` | compliance_manager | Staff |
| New Affiliate Manager | `new_affiliate_manager` | `/new-affiliate-manager` | affiliate_manager | Manager |
| Affiliate Manager | `affiliate_manager` | `/affiliate-manager` | — | Manager |
| Broker Manager | `broker_manager` | `/broker-manager` | vp_sales | Manager |
| Desk Manager | `desk_manager` | `/desk-manager` | — | Manager |
| Shift Manager | `shift_manager` | `/shift-manager` | — | Manager |
| Desk Broker | `desk_broker` | `/desk-broker` | desk_manager | Staff |
| Marketer Manager | `marketer_manager` | `/marketer-manager` | — | Manager |
| Compliance Manager | `compliance_manager` | `/compliance-manager` | — | Manager |
| Team Leader | `team_leader` | `/team-leader` | broker_manager | Manager |
| Office | `office` | `/office` | — | Staff |
| VP Sales | `vp_sales` | `/vp-sales` | — | Executive |
| Finance | `finance` | `/finance-workspace` | — | Finance |
| Conversion Manager | `conversion_manager` | `/conversion-manager` | — | Manager |
| Retention Manager | `retention_manager` | `/retention-manager` | — | Manager |

**Total roles: 23** (canonical — do not add new roles without explicit product decision)

---

## 2. Permission Database Model

### Design Principles

The Trade Console permission system requires three layers:

```
Layer 1: Role Permissions (default for all staff with that role)
Layer 2: Staff Permission Overrides (individual staff member override)
Layer 3: Assignment-Specific Overrides (override for one specific customer)
```

### Resolution Order (highest priority wins)

```
Assignment-specific override
    ↓ (if none)
Staff-level override
    ↓ (if none)
Role default permission
    ↓ (if none)
Deny
```

### Tables

```sql
-- Layer 1: Role defaults
role_permissions (
  role_id,
  permission_id,
  granted BOOLEAN
)

-- Layer 2 + 3: Individual overrides
staff_permission_overrides (
  staff_user_id,
  permission_id,
  customer_id,      -- NULL = applies to all customers
  assignment_id,    -- NULL = not assignment-specific
  granted BOOLEAN,
  granted_by_id,
  expires_at
)
```

### Permission Resolution Algorithm

```
function canStaffDoAction(staff_user_id, permission_key, customer_id, assignment_id):

  1. Check assignment-specific override:
     SELECT granted FROM staff_permission_overrides
     WHERE staff_user_id = ? AND permission_key = ? AND assignment_id = ?
     → If found: return granted

  2. Check customer-specific override:
     SELECT granted FROM staff_permission_overrides
     WHERE staff_user_id = ? AND permission_key = ? AND customer_id = ? AND assignment_id IS NULL
     → If found: return granted

  3. Check global staff override:
     SELECT granted FROM staff_permission_overrides
     WHERE staff_user_id = ? AND permission_key = ? AND customer_id IS NULL AND assignment_id IS NULL
     → If found: return granted

  4. Check role default:
     SELECT granted FROM role_permissions rp
     JOIN roles r ON r.id = rp.role_id
     JOIN users u ON u.role = r.key
     WHERE u.id = ? AND permission_key = ?
     → If found: return granted

  5. Default: return false (deny)
```

### Account-Request Authorization (Additional Scope Check)

For `customer_account.request` and `customer_account.request_view`, permission possession alone is not sufficient. The backend must additionally verify:

```
function canRequestAccount(staff_user_id, registration_id):
  1. Check permission via standard resolution above
  2. Additionally verify: staff has active assignment scope for the customer/lead
     (i.e. customer_assignments record exists linking staff_user_id to the customer)
  3. Both checks must pass — permission + scope
```

Admin and Super Admin bypass scope restriction for `customer_account.approve`, `customer_account.reject`, `customer_account.provision`, `customer_account.invite_resend`, `customer_account.disable`, `customer_account.credentials_reset`.

---

## 3. Known Permissions (from application inspection)

### Core Permissions

| Permission Key | Category | Description | Default Role Access |
|---------------|----------|-------------|---------------------|
| `view_customer_email` | PII | View customer email address | admin, super_admin, broker (with override) |
| `view_customer_phone` | SENSITIVE PII | View customer phone number | admin, super_admin only by default |
| `view_customer_country` | PII | View customer country | most staff roles |
| `view_account_data` | FINANCIAL | View account balance/data | admin, broker, ftd_broker, retention_broker |
| `view_transactions` | FINANCIAL | View transaction history | admin, finance, broker (with override) |
| `view_verification` | COMPLIANCE | View KYC/verification data | admin, compliance_broker, compliance_manager |
| `call_customer` | OPERATIONAL | Initiate calls to customer | broker, ftd_broker, retention_broker, operator, desk_broker |
| `chat_with_customer` | OPERATIONAL | Send messages to customer | broker, ftd_broker, retention_broker, operator |
| `add_internal_notes` | OPERATIONAL | Add internal staff notes | all staff roles |
| `assign_customer` | ADMIN | Assign customers to staff | admin, broker_manager, desk_manager, conversion_manager, retention_manager |
| `review_deposit` | FINANCIAL | Approve/reject deposits | admin, finance |
| `review_withdrawal` | FINANCIAL | Approve/reject withdrawals | admin, finance |
| `review_kyc` | COMPLIANCE | Approve/reject KYC | admin, compliance_broker, compliance_manager |
| `change_customer_status` | ADMIN | Change customer status | admin, compliance_manager |
| `change_staff_role` | ADMIN | Change staff role | admin, super_admin |
| `view_audit_logs` | SECURITY | View audit logs | admin, super_admin |
| `manage_staff` | ADMIN | Create/disable staff | admin, super_admin |

### Account Provisioning Permissions (New)

| Permission Key | Category | Description | Default Role Access | Scope Restriction |
|---------------|----------|-------------|---------------------|-------------------|
| `customer_account.request` | ACCOUNT_PROVISIONING | Submit account creation request for an assigned lead/customer | broker, ftd_broker, retention_broker, desk_broker, compliance_broker, operator | **Must also have assignment scope for the customer** |
| `customer_account.request_view` | ACCOUNT_PROVISIONING | View own submitted account requests | broker, ftd_broker, retention_broker, desk_broker, compliance_broker, operator | Own requests only |
| `customer_account.approve` | ACCOUNT_PROVISIONING | Approve account requests | admin, super_admin | — |
| `customer_account.reject` | ACCOUNT_PROVISIONING | Reject account requests | admin, super_admin | — |
| `customer_account.provision` | ACCOUNT_PROVISIONING | Manual provisioning override | super_admin | — |
| `customer_account.invite_resend` | ACCOUNT_PROVISIONING | Resend account access invitation email | admin, super_admin | — |
| `customer_account.disable` | ACCOUNT_PROVISIONING | Disable a provisioned customer account | admin, super_admin | — |
| `customer_account.credentials_reset` | ACCOUNT_PROVISIONING | Reset customer access credentials | admin, super_admin | — |

### Marketing Site Permissions (New)

| Permission Key | Category | Description | Default Role Access |
|---------------|----------|-------------|---------------------|
| `marketing_site.view` | MARKETING | View configured marketing sites (for site selection in account requests) | broker, ftd_broker, retention_broker, desk_broker, compliance_broker, operator, broker_manager, desk_manager, conversion_manager, retention_manager, compliance_manager, affiliate_manager, admin, super_admin |
| `marketing_site.manage` | MARKETING | Create/update/deactivate marketing sites | super_admin |

---

## 4. Example: Phone Number Permission Scenario

**Scenario**: Broker cannot see phone number by default. Admin grants `view_customer_phone` to one specific broker for one specific customer assignment.

```sql
-- Admin grants phone permission to broker James Park
-- for customer Aisha Al-Rashidi's assignment only
INSERT INTO staff_permission_overrides (
  staff_user_id,
  permission_id,
  customer_id,
  assignment_id,
  granted,
  granted_by_id,
  reason
) VALUES (
  'broker-001-uuid',          -- James Park
  'perm-view-phone-uuid',     -- view_customer_phone
  'cust-004-uuid',            -- Aisha Al-Rashidi
  'asgn-002-uuid',            -- specific assignment
  true,
  'admin-001-uuid',           -- Sarah Chen (Admin)
  'Customer requested direct callback'
);
```

**Result**: James Park can see Aisha's phone number only in the context of assignment asgn-002. For all other customers, phone remains hidden.

---

## 5. Role Hierarchy

```
super_admin
└── admin
    ├── vp_sales
    │   ├── broker_manager
    │   │   ├── broker
    │   │   ├── desk_broker
    │   │   └── team_leader
    │   ├── conversion_manager
    │   │   └── ftd_broker
    │   └── retention_manager
    │       └── retention_broker
    ├── compliance_manager
    │   └── compliance_broker
    ├── affiliate_manager
    │   ├── new_affiliate_manager
    │   └── affiliate
    ├── marketer_manager
    ├── desk_manager
    │   └── desk_broker
    ├── shift_manager
    ├── finance
    ├── office
    └── operator

customer (separate hierarchy — no staff access)
```

---

## 6. Role Storage in PostgreSQL

```sql
-- The roles table stores role definitions
-- users.role stores the current role key (text FK to roles.key)
-- This allows role metadata to be updated without touching users

-- Example: Check if a user has a specific role
SELECT u.id, u.email, r.display_name, r.default_route
FROM users u
JOIN roles r ON r.key = u.role
WHERE u.id = $1;

-- Example: Get all staff with a specific role
SELECT sp.id, sp.first_name, sp.last_name, u.email, u.status
FROM staff_profiles sp
JOIN users u ON u.id = sp.user_id
WHERE u.role = 'broker'
  AND u.status = 'active';
```

---

## 7. Recommended Indexes for Permission Queries

```sql
-- Fast permission lookup for a staff member
CREATE INDEX idx_staff_perm_overrides_staff_perm
  ON staff_permission_overrides (staff_user_id, permission_id);

-- Fast customer-specific permission lookup
CREATE INDEX idx_staff_perm_overrides_customer
  ON staff_permission_overrides (staff_user_id, customer_id, permission_id);

-- Fast assignment-specific permission lookup
CREATE INDEX idx_staff_perm_overrides_assignment
  ON staff_permission_overrides (assignment_id, permission_id);

-- Role permission lookup
CREATE INDEX idx_role_permissions_role
  ON role_permissions (role_id, permission_id);
```

---

## 8. Account Provisioning Permission Summary

| Action | Required Permission | Additional Scope Check |
|--------|--------------------|-----------------------|
| Submit account request | `customer_account.request` | Must have assignment scope for the customer/lead |
| View own requests | `customer_account.request_view` | Own requests only |
| Approve request | `customer_account.approve` | Admin/Super Admin only |
| Reject request | `customer_account.reject` | Admin/Super Admin only |
| Manual provisioning override | `customer_account.provision` | Super Admin only |
| Resend invitation | `customer_account.invite_resend` | Admin/Super Admin |
| Disable account | `customer_account.disable` | Admin/Super Admin |
| Reset credentials | `customer_account.credentials_reset` | Admin/Super Admin |
| View marketing sites | `marketing_site.view` | Manager roles + Admin |
| Manage marketing sites | `marketing_site.manage` | Super Admin only |

**Security principle**: The frontend may render approval controls, but actual approve/reject/provision/disable/reset authorization must be validated server-side by the API. Do not rely on hidden buttons as security.
