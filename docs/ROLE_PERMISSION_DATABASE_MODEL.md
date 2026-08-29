# CryonFX — Role & Permission Database Model

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

**Total roles: 23**

---

## 2. Permission Database Model

### Design Principles

The CryonFX permission system requires three layers:

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

---

## 3. Known Permissions (from application inspection)

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
