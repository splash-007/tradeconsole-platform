# Trade Console — Database Relationships

---

## Entity Relationship Map

```
User
│
├── Customer Profile (1:1) [created only after Admin approval + provisioning]
│   ├── Registration (1:1 via registrations.user_id — nullable until provisioned)
│   │   ├── Registration Attribution (1:1)
│   │   └── Account Request (1:many via account_requests.registration_id)
│   │       └── Marketing Site (many:1 via account_requests.marketing_site_id)
│   ├── Customer Assignments (1:many)
│   │   └── Assignment History (1:many)
│   ├── Tasks (1:many via assigned customer)
│   ├── Accounts (1:many — one per currency; system accounts have no customer_id)
│   │   ├── Ledger Entries (1:many via ledger_transactions)
│   │   ├── Deposit Requests (1:many)
│   │   └── Withdrawal Requests (1:many)
│   ├── Trading Account (1:1 or 1:many)
│   │   ├── Orders (1:many)
│   │   ├── Positions (1:many)
│   │   └── Trades (1:many)
│   ├── Watchlists (1:many)
│   │   └── Watchlist Items (1:many)
│   ├── Verification Case (1:1)
│   │   ├── Verification Documents (1:many)
│   │   └── Compliance Reviews (1:many)
│   ├── Conversations (1:many — customer_support type)
│   │   ├── Conversation Members (1:many)
│   │   └── Messages (1:many)
│   ├── Customer Notes (1:many)
│   ├── Customer Tag Assignments (1:many)
│   │   └── Customer Tags (many:1)
│   ├── Customer Activities (1:many)
│   ├── Calls (1:many)
│   ├── Notifications (1:many)
│   └── Login History (1:many via users)
│
└── Staff Profile (1:1)
    ├── Roles (many:1 via users.role)
    ├── Role Permissions (many:many via roles)
    ├── Staff Permission Overrides (1:many)
    ├── Staff Manager History (1:many)
    ├── Customer Assignments (1:many — as assignee)
    ├── Account Requests (1:many — as requested_by_user_id or assigned_manager_id)
    ├── Tasks (1:many — as assignee)
    ├── Calls (1:many — as staff)
    ├── Conversations (1:many — as member)
    │   └── Messages (1:many — as sender)
    ├── Notifications (1:many)
    └── Audit Logs (1:many — as actor)

Registration [may exist without a User]
│
├── User (1:1 via registrations.user_id — NULL until provisioned)
├── Registration Attribution (1:1)
└── Account Requests (1:many via account_requests.registration_id)

Marketing Sites [approved authentication entry-point allowlist]
│
├── Account Requests (1:many via account_requests.marketing_site_id)
└── Customer Profiles (1:many via customer_profiles.marketing_site_id)

Ledger (double-entry)
│
├── Ledger Transactions (1:many per reference)
│   └── Ledger Entries (1:many per transaction — must balance debits/credits)
│       └── Accounts (many:1 — customer or system accounts)
```

---

## Complete Relationship Table

### Authentication & Security

| From | Column | To | Type | On Delete | Notes |
|------|--------|----|------|-----------|-------|
| sessions | user_id | users.id | many:1 | CASCADE | All sessions deleted when user deleted |
| password_resets | user_id | users.id | many:1 | CASCADE | — |
| email_verifications | user_id | users.id | many:1 | CASCADE | — |
| two_factor_auth | user_id | users.id | 1:1 | CASCADE | — |
| recovery_codes | user_id | users.id | many:1 | CASCADE | — |
| login_history | user_id | users.id | many:1 | SET NULL | Preserve login history even if user deleted |
| security_events | user_id | users.id | many:1 | SET NULL | Preserve security events |

> **Note**: There is NO `login_handoff_tokens` table in PostgreSQL. Cross-domain login handoff tokens are stored exclusively in Valkey with ~60s TTL. Audit records go to `audit_logs`.

### Identity & Profiles

| From | Column | To | Type | On Delete | Notes |
|------|--------|----|------|-----------|-------|
| customer_profiles | user_id | users.id | 1:1 | CASCADE | Created only after Admin approval + provisioning |
| customer_profiles | marketing_site_id | marketing_sites.id | many:1 | SET NULL | Associated login entry point |
| staff_profiles | user_id | users.id | 1:1 | CASCADE | — |
| staff_profiles | manager_id | staff_profiles.id | many:1 | SET NULL | Current manager |
| staff_manager_history | staff_id | staff_profiles.id | many:1 | RESTRICT | Never delete — history |
| staff_manager_history | manager_id | staff_profiles.id | many:1 | RESTRICT | Never delete — history |
| staff_manager_history | assigned_by_id | users.id | many:1 | RESTRICT | — |

### Roles & Permissions

| From | Column | To | Type | On Delete | Notes |
|------|--------|----|------|-----------|-------|
| users | role | roles.key | many:1 | RESTRICT | Cannot delete role in use |
| role_permissions | role_id | roles.id | many:1 | CASCADE | — |
| role_permissions | permission_id | permissions.id | many:1 | CASCADE | — |
| staff_permission_overrides | staff_user_id | users.id | many:1 | CASCADE | — |
| staff_permission_overrides | permission_id | permissions.id | many:1 | CASCADE | — |
| staff_permission_overrides | customer_id | customer_profiles.id | many:1 | CASCADE | Customer-specific override |
| staff_permission_overrides | assignment_id | customer_assignments.id | many:1 | CASCADE | Assignment-specific override |
| staff_permission_overrides | granted_by_id | users.id | many:1 | RESTRICT | — |

### Marketing & Attribution

| From | Column | To | Type | On Delete | Notes |
|------|--------|----|------|-----------|-------|
| affiliates | owner_user_id | users.id | many:1 | SET NULL | — |
| affiliates | manager_user_id | users.id | many:1 | SET NULL | — |
| campaigns | affiliate_id | affiliates.id | many:1 | SET NULL | — |
| campaigns | source_id | marketing_sources.id | many:1 | SET NULL | — |
| registrations | user_id | users.id | 1:1 | SET NULL | **Nullable** — registration may exist without a user record |
| registrations | assigned_staff_id | users.id | many:1 | SET NULL | — |
| registration_attribution | registration_id | registrations.id | 1:1 | CASCADE | — |
| registration_attribution | source_id | marketing_sources.id | many:1 | SET NULL | — |
| registration_attribution | affiliate_id | affiliates.id | many:1 | SET NULL | — |
| registration_attribution | campaign_id | campaigns.id | many:1 | SET NULL | — |
| utm_events | registration_id | registrations.id | many:1 | SET NULL | — |

### Account Provisioning

| From | Column | To | Type | On Delete | Notes |
|------|--------|----|------|-----------|-------|
| account_requests | registration_id | registrations.id | many:1 | RESTRICT | The lead/registration this request is for. NOT NULL. |
| account_requests | provisioned_user_id | users.id | many:1 | SET NULL | NULL until provisioning completes |
| account_requests | requested_by_user_id | users.id | many:1 | RESTRICT | Manager who submitted. NOT NULL. |
| account_requests | assigned_manager_id | users.id | many:1 | SET NULL | May differ from requester |
| account_requests | marketing_site_id | marketing_sites.id | many:1 | RESTRICT | Selected login entry point. NOT NULL. |
| account_requests | reviewed_by_id | users.id | many:1 | SET NULL | Admin who approved/rejected |

> **No `account_request_audit` table.** All approval/rejection/provisioning events are recorded in the existing immutable `audit_logs` table.

### Assignments & Tasks

| From | Column | To | Type | On Delete | Notes |
|------|--------|----|------|-----------|-------|
| customer_assignments | customer_id | customer_profiles.id | many:1 | RESTRICT | Never delete customer with active assignment |
| customer_assignments | staff_id | users.id | many:1 | RESTRICT | — |
| customer_assignments | assigned_by_id | users.id | many:1 | RESTRICT | — |
| assignment_history | assignment_id | customer_assignments.id | many:1 | RESTRICT | Never delete — history |
| assignment_history | customer_id | customer_profiles.id | many:1 | RESTRICT | — |
| assignment_history | from_staff_id | users.id | many:1 | SET NULL | — |
| assignment_history | to_staff_id | users.id | many:1 | RESTRICT | — |
| assignment_history | changed_by_id | users.id | many:1 | RESTRICT | — |
| tasks | customer_id | customer_profiles.id | many:1 | RESTRICT | — |
| tasks | assigned_to_id | users.id | many:1 | RESTRICT | — |
| tasks | manager_id | users.id | many:1 | SET NULL | — |
| tasks | created_by_id | users.id | many:1 | RESTRICT | — |
| tasks | assignment_id | customer_assignments.id | many:1 | SET NULL | — |
| task_activity_log | task_id | tasks.id | many:1 | RESTRICT | Never delete — history |
| task_activity_log | actor_id | users.id | many:1 | RESTRICT | — |

### Finance (Double-Entry Ledger)

| From | Column | To | Type | On Delete | Notes |
|------|--------|----|------|-----------|-------|
| accounts | customer_id | customer_profiles.id | many:1 | RESTRICT | NULL for system accounts (clearing/fee/settlement) |
| ledger_transactions | reference_id | (polymorphic) | many:1 | RESTRICT | Points to deposit_request.id, order.id, etc. |
| ledger_entries | ledger_transaction_id | ledger_transactions.id | many:1 | RESTRICT | Never delete — financial record |
| ledger_entries | account_id | accounts.id | many:1 | RESTRICT | Never delete — financial record |
| deposit_requests | customer_id | customer_profiles.id | many:1 | RESTRICT | — |
| deposit_requests | account_id | accounts.id | many:1 | RESTRICT | — |
| deposit_requests | reviewed_by_id | users.id | many:1 | SET NULL | — |
| withdrawal_requests | customer_id | customer_profiles.id | many:1 | RESTRICT | — |
| withdrawal_requests | account_id | accounts.id | many:1 | RESTRICT | — |
| withdrawal_requests | reviewed_by_id | users.id | many:1 | SET NULL | — |
| transactions | customer_id | customer_profiles.id | many:1 | RESTRICT | — |
| transactions | account_id | accounts.id | many:1 | RESTRICT | — |
| fees | transaction_id | transactions.id | many:1 | RESTRICT | — |

### Trading

| From | Column | To | Type | On Delete | Notes |
|------|--------|----|------|-----------|-------|
| trading_accounts | customer_id | customer_profiles.id | many:1 | RESTRICT | — |
| orders | trading_account_id | trading_accounts.id | many:1 | RESTRICT | — |
| orders | customer_id | customer_profiles.id | many:1 | RESTRICT | — |
| positions | trading_account_id | trading_accounts.id | many:1 | RESTRICT | — |
| positions | customer_id | customer_profiles.id | many:1 | RESTRICT | — |
| trades | order_id | orders.id | many:1 | RESTRICT | — |
| trades | customer_id | customer_profiles.id | many:1 | RESTRICT | — |
| watchlists | customer_id | customer_profiles.id | many:1 | CASCADE | — |
| watchlist_items | watchlist_id | watchlists.id | many:1 | CASCADE | — |

### Compliance & KYC

| From | Column | To | Type | On Delete | Notes |
|------|--------|----|------|-----------|-------|
| verification_cases | customer_id | customer_profiles.id | 1:1 | RESTRICT | — |
| verification_cases | reviewed_by_id | users.id | many:1 | SET NULL | — |
| verification_documents | case_id | verification_cases.id | many:1 | RESTRICT | — |
| verification_documents | customer_id | customer_profiles.id | many:1 | RESTRICT | — |
| compliance_notes | customer_id | customer_profiles.id | many:1 | RESTRICT | — |
| compliance_notes | case_id | verification_cases.id | many:1 | SET NULL | — |
| compliance_notes | author_id | users.id | many:1 | RESTRICT | — |
| compliance_reviews | case_id | verification_cases.id | many:1 | RESTRICT | — |
| compliance_reviews | reviewer_id | users.id | many:1 | RESTRICT | — |

### Messaging & Chat

| From | Column | To | Type | On Delete | Notes |
|------|--------|----|------|-----------|-------|
| conversations | customer_id | customer_profiles.id | many:1 | SET NULL | Preserve conversation if customer deleted |
| conversation_members | conversation_id | conversations.id | many:1 | CASCADE | — |
| conversation_members | user_id | users.id | many:1 | CASCADE | — |
| messages | conversation_id | conversations.id | many:1 | RESTRICT | Never delete conversation with messages |
| messages | sender_id | users.id | many:1 | RESTRICT | — |
| message_reads | message_id | messages.id | many:1 | CASCADE | — |
| message_reads | user_id | users.id | many:1 | CASCADE | — |

### Calls

| From | Column | To | Type | On Delete | Notes |
|------|--------|----|------|-----------|-------|
| calls | customer_id | customer_profiles.id | many:1 | RESTRICT | — |
| calls | staff_id | users.id | many:1 | RESTRICT | — |
| call_outcomes | call_id | calls.id | 1:1 | CASCADE | — |
| call_outcomes | created_by_id | users.id | many:1 | RESTRICT | — |

### Platform Operations

| From | Column | To | Type | On Delete | Notes |
|------|--------|----|------|-----------|-------|
| notifications | recipient_id | users.id | many:1 | CASCADE | — |
| notifications | customer_id | customer_profiles.id | many:1 | SET NULL | — |
| customer_activities | customer_id | customer_profiles.id | many:1 | RESTRICT | — |
| customer_activities | actor_id | users.id | many:1 | SET NULL | — |
| audit_logs | actor_user_id | users.id | many:1 | RESTRICT | Never delete — audit |
| audit_logs | customer_id | customer_profiles.id | many:1 | SET NULL | — |
| customer_notes | customer_id | customer_profiles.id | many:1 | RESTRICT | — |
| customer_notes | author_id | users.id | many:1 | RESTRICT | — |
| customer_tag_assignments | customer_id | customer_profiles.id | many:1 | CASCADE | — |
| customer_tag_assignments | tag_id | customer_tags.id | many:1 | CASCADE | — |
| customer_tag_assignments | assigned_by_id | users.id | many:1 | RESTRICT | — |
| escalations | customer_id | customer_profiles.id | many:1 | SET NULL | — |
| escalations | raised_by_id | users.id | many:1 | RESTRICT | — |
| escalations | assigned_to_id | users.id | many:1 | SET NULL | — |
| simulation_runs | created_by_id | users.id | many:1 | RESTRICT | — |

---

## Many-to-Many Relationships

| Entity A | Junction Table | Entity B | Notes |
|----------|---------------|----------|-------|
| roles | role_permissions | permissions | Default role permissions |
| users | staff_permission_overrides | permissions | Individual overrides |
| conversations | conversation_members | users | Chat participants |
| customers | customer_tag_assignments | customer_tags | Customer tagging |

---

## Key Lifecycle Relationships

### Registration → Account Provisioning Lifecycle

```
registrations (lead captured)
    │
    │  [no users record yet]
    │
    ├── registration_attribution (attribution preserved)
    │
    └── account_requests (manager submits request)
            │
            │  [Admin approves]
            │
            ├── users (created on provisioning)
            │       └── customer_profiles (created on provisioning)
            │               └── customer_profiles.marketing_site_id → marketing_sites
            │
            └── account_requests.provisioned_user_id → users.id (set after provisioning)
```

### Cross-Domain Login Handoff (Valkey — no PostgreSQL table)

```
Marketing site login
    │
    POST /api/v1/auth/login (with sourceSite)
    │
    Trade Console API validates credentials
    │
    Generates handoff token → stored in Valkey (hashed, ~60s TTL)
    │
    Returns handoffUrl (server-constructed from marketing_sites.login_url)
    │
    Browser → GET /auth/handoff?token=...
    │
    Token redeemed → deleted from Valkey immediately
    │
    sessions record created in PostgreSQL
    │
    audit_logs: LOGIN_HANDOFF_CREATED + LOGIN_HANDOFF_REDEEMED
```

### Double-Entry Ledger

```
deposit_request approved
    │
    ledger_transactions (reference_type='deposit', reference_id=deposit_request.id)
    │
    ├── ledger_entries (debit: clearing_account, amount=X)
    └── ledger_entries (credit: customer_account, amount=X)
    [sum(debits) = sum(credits) — transaction balances]
```

---

## Soft Delete / Archive Strategy

| Table | Strategy | Column | Notes |
|-------|----------|--------|-------|
| users | Soft delete | archived_at | Never hard delete |
| customer_profiles | Soft delete | via users.archived_at | — |
| staff_profiles | Soft disable | disabled_at | — |
| affiliates | Soft archive | archived_at | — |
| accounts | Soft close | closed_at | — |
| customer_assignments | Status field | ended_at | Use status=cancelled |
| tasks | Status field | — | Use status=cancelled |
| messages | Soft delete | deleted_at | — |
| conversations | Status field | closed_at | — |
| audit_logs | NEVER delete | — | Append-only |
| ledger_entries | NEVER delete | — | Immutable |
| ledger_transactions | NEVER delete | — | Immutable |
| assignment_history | NEVER delete | — | Immutable |
| task_activity_log | NEVER delete | — | Immutable |
| login_history | NEVER delete | — | Security record |
| account_requests | Status field | — | Use status=cancelled |
