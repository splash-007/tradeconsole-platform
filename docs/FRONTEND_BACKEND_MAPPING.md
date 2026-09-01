# Trade Console — Frontend ↔ Backend Mapping

> Maps every major page to its required API endpoints and database tables.

---

## Customer Pages

### `/trading-dashboard`
**Service**: `dashboardService.getOverview()`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/dashboard/overview` | `accounts`, `ledger_entries`, `positions`, `trades` |
| WS `quote:update` | Valkey (market data cache) |

---

### `/trade-trading-workspace`
**Services**: `tradingService`, `marketsService`, `marketDataService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/markets` | Valkey/provider |
| GET `/markets/:symbol/orderbook` | Valkey/provider |
| GET `/markets/:symbol/trades` | Valkey/provider |
| GET `/markets/:symbol/candles` | Valkey/provider |
| POST `/orders` | `orders`, `trading_accounts`, `ledger_entries` |
| GET `/orders` | `orders` |
| GET `/positions` | `positions` |
| WS `quote:update` | Valkey |

---

### `/markets`
**Service**: `marketsService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/markets` | Valkey/provider |
| WS `quote:update` | Valkey |

---

### `/portfolio`
**Service**: `portfolioService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/portfolio/positions` | `positions`, `trading_accounts` |
| GET `/portfolio/allocation` | `positions` (computed) |
| GET `/portfolio/trades` | `trades` |

---

### `/watchlist`
**Service**: `marketDataService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/watchlists` | `watchlists`, `watchlist_items` |
| POST `/watchlists/:id/items` | `watchlist_items` |
| DELETE `/watchlists/:id/items/:symbol` | `watchlist_items` |
| WS `quote:update` | Valkey |

---

### `/finance`
**Service**: `financeService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/finance/balance` | `accounts`, `ledger_entries` (computed from double-entry ledger) |
| GET `/finance/deposits` | `deposit_requests` |
| POST `/finance/deposits` | `deposit_requests`, `ledger_transactions`, `ledger_entries` |
| GET `/finance/withdrawals` | `withdrawal_requests` |
| POST `/finance/withdrawals` | `withdrawal_requests` |
| DELETE `/finance/withdrawals/:id` | `withdrawal_requests` |

---

### `/transactions`
**Service**: `financeService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/finance/transactions` | `transactions` |

---

### `/kyc`
**Service**: `kycService`

> KYC is mandatory but presented under Profile/Settings rather than primary navigation.

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/kyc/status` | `verification_cases` |
| PATCH `/kyc/personal` | `verification_cases` |
| POST `/kyc/documents` | `verification_documents` (key/metadata only — binary stored in Cloudflare R2) |
| POST `/kyc/submit` | `verification_cases` |

---

### `/messages`
**Service**: `chatService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/conversations` | `conversations`, `conversation_members` |
| GET `/conversations/:id/messages` | `messages`, `message_reads` |
| POST `/conversations/:id/messages` | `messages` |
| PATCH `/conversations/:id/read` | `message_reads` |
| WS `message:new`, `typing:start`, `typing:stop` | Valkey pub/sub |

---

### `/settings`
**Service**: `authService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/auth/me` | `users`, `customer_profiles` |
| PATCH `/auth/me` | `users`, `customer_profiles` |

---

## Authentication & Activation Pages

### `/sign-up-login-screen` (Direct Trade Console Login)
**Service**: `authService`

| API Endpoint | DB Tables |
|-------------|-----------|
| POST `/auth/login` (identifier + password, no sourceSite) | `users`, `sessions`, `login_history`, `audit_logs` |
| POST `/auth/register` | `registrations`, `registration_attribution` |

> Registration creates a `registrations` record only. A `users` record is NOT created at registration time.

---

### `/auth/handoff` (Cross-Domain Login Handoff — Trade Console)
**Service**: `authService`

| Step | Action | Storage |
|------|--------|---------|
| 1 | Customer arrives from marketing site with handoff token | — |
| 2 | Backend validates token in Valkey | Valkey |
| 3 | Token deleted from Valkey immediately (single-use) | Valkey |
| 4 | Secure HttpOnly session cookie created (`tc_session_token`) | `sessions` |
| 5 | Audit records created | `audit_logs` (LOGIN_HANDOFF_REDEEMED) |
| 6 | Customer redirected to dashboard | — |

> No PostgreSQL `login_handoff_tokens` table. Tokens are Valkey-only with ~60s TTL.

---

### Account Activation (via activation link in email)
**Service**: `authService`

| API Endpoint | DB Tables |
|-------------|-----------|
| POST `/auth/activate` (token + new password) | `users` (sets password_hash, account_activated=true, clears activation_token_hash) |

---

## Admin Pages

### `/admin-dashboard`
**Service**: `dashboardService`, `marketingService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/admin/marketing/overview` | `registrations`, `customer_assignments` |
| GET `/admin/marketing/timeline` | `registrations` |
| GET `/admin/marketing/sources` | `registration_attribution`, `marketing_sources` |

---

### `/admin/customers`
**Service**: `adminService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/admin/customers` | `users`, `customer_profiles`, `customer_assignments`, `verification_cases` |
| GET `/admin/staff` | `users`, `staff_profiles` |
| GET `/admin/roles` | `roles` |

---

### `/admin/customers/[id]`
**Service**: `adminService`, `notificationService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/admin/customers/:id` | `users`, `customer_profiles`, `registration_attribution` |
| GET `/admin/customers/:id/timeline` | `customer_activities` |
| GET `/admin/customers/:id/notes` | `customer_notes` |
| POST `/admin/customers/:id/notes` | `customer_notes`, `audit_logs` |
| GET `/conversations` (customer filter) | `conversations`, `messages` |
| GET `/tasks` (customer filter) | `tasks` |
| POST `/assignments` | `customer_assignments`, `assignment_history`, `audit_logs` |
| GET `/finance/deposits` (customer filter) | `deposit_requests` |
| GET `/finance/withdrawals` (customer filter) | `withdrawal_requests` |
| GET `/portfolio/positions` (customer filter) | `positions` |
| GET `/kyc/status` (customer) | `verification_cases`, `verification_documents` |
| GET `/sessions` (customer) | `sessions`, `login_history` |
| POST `/notifications/email` | `notifications` |

---

### `/admin/registrations`
**Service**: `marketingService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/admin/registrations` | `registrations`, `registration_attribution` |

> Registrations may exist without a corresponding `users` record (leads not yet provisioned).

---

### `/admin/marketing/*`
**Service**: `marketingService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/admin/marketing/overview` | `registrations`, `registration_attribution` |
| GET `/admin/marketing/sources` | `marketing_sources`, `registration_attribution` |
| GET `/admin/marketing/affiliates` | `affiliates`, `registrations` |
| GET `/admin/marketing/campaigns` | `campaigns`, `registrations` |
| GET `/admin/marketing/utm` | `utm_events`, `registration_attribution` |
| GET `/admin/marketing/funnel` | `registrations`, `customer_assignments`, `deposit_requests` |

---

### `/admin/finance/accounts`
**Service**: `adminService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/admin/finance/accounts` | `accounts`, `customer_profiles`, `ledger_entries` (computed from double-entry ledger) |

---

### `/admin/finance/transactions`
**Service**: `adminService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/admin/finance/transactions` | `transactions`, `customer_profiles` |

---

### `/admin/finance/deposits`
**Service**: `adminService`, `notificationService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/admin/finance/deposits` | `deposit_requests`, `customer_profiles` |
| PATCH `/admin/finance/deposits/:id` | `deposit_requests`, `ledger_transactions`, `ledger_entries`, `audit_logs` |
| POST `/notifications/email` | `notifications` |

---

### `/admin/finance/withdrawals`
**Service**: `adminService`, `notificationService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/admin/finance/withdrawals` | `withdrawal_requests`, `customer_profiles` |
| PATCH `/admin/finance/withdrawals/:id` | `withdrawal_requests`, `ledger_transactions`, `ledger_entries`, `audit_logs` |
| POST `/notifications/email` | `notifications` |

---

### `/admin/compliance/verification`
**Service**: `adminService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/admin/compliance/verification` | `verification_cases`, `customer_profiles` |
| PATCH `/admin/compliance/verification/:id` | `verification_cases`, `compliance_reviews`, `audit_logs` |

---

### `/admin/compliance/documents`
**Service**: `adminService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/admin/compliance/documents` | `verification_documents`, `verification_cases` |

> Document binaries are in Cloudflare R2. PostgreSQL stores keys/metadata only.

---

### `/admin/trading/*`
**Service**: `adminService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/admin/trading/orders` | `orders`, `customer_profiles` |
| GET `/admin/trading/positions` | `positions`, `customer_profiles` |
| GET `/admin/trading/activity` | `trades`, `customer_profiles` |
| GET `/admin/trading/market` | Valkey/provider |

---

### `/admin/system/staff`
**Service**: `adminService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/admin/staff` | `users`, `staff_profiles` |
| POST `/admin/staff` | `users`, `staff_profiles`, `audit_logs` |
| PATCH `/admin/staff/:id/role` | `users`, `audit_logs` |
| PATCH `/admin/staff/:id/status` | `users`, `audit_logs` |
| PATCH `/admin/staff/:id/permissions` | `staff_permission_overrides`, `audit_logs` |

---

### `/admin/system/roles`
**Service**: `adminService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/admin/roles` | `roles`, `role_permissions`, `permissions` |
| PATCH `/admin/roles/:id/permissions` | `role_permissions`, `audit_logs` |

---

### `/admin/system/audit`
**Service**: `platformService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/admin/audit` | `audit_logs` |

---

### `/admin/operations/assignments`
**Service**: `platformService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/assignments` | `customer_assignments`, `assignment_history`, `customer_profiles`, `staff_profiles` |
| POST `/assignments` | `customer_assignments`, `assignment_history`, `audit_logs`, `notifications` |
| PATCH `/assignments/:id/reassign` | `customer_assignments`, `assignment_history`, `audit_logs`, `notifications` |

---

### `/admin/operations/tasks`
**Service**: `platformService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/tasks` | `tasks`, `task_activity_log`, `customer_profiles`, `staff_profiles` |
| POST `/tasks` | `tasks`, `task_activity_log`, `audit_logs`, `notifications` |
| PATCH `/tasks/:id/status` | `tasks`, `task_activity_log`, `audit_logs` |

---

### `/admin/operations/agents`
**Service**: `agentService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/admin/agents` | `users`, `staff_profiles`, `customer_assignments`, `tasks` |
| GET `/admin/agents/:id` | `users`, `staff_profiles`, `staff_permission_overrides` |
| PATCH `/admin/agents/:id/permissions` | `staff_permission_overrides`, `audit_logs` |

---

### `/admin/support/conversations`
**Service**: `chatService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/conversations` | `conversations`, `conversation_members`, `messages` |

---

### `/admin/performance`
**Service**: `agentService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/admin/performance` | `tasks`, `calls`, `customer_assignments` (aggregated) |
| GET `/admin/performance/agents` | `staff_profiles`, `tasks`, `calls` |

---

### `/admin/account-requests`
**Service**: `adminService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/admin/account-requests` | `account_requests`, `users`, `customer_profiles`, `registrations`, `marketing_sites`, `staff_profiles` |
| GET `/admin/account-requests/:id` | `account_requests`, `audit_logs` (approval history — no separate audit table) |
| POST `/admin/account-requests/:id/approve` | `account_requests`, `audit_logs` (triggers async provisioning) |
| POST `/admin/account-requests/:id/reject` | `account_requests`, `audit_logs` |
| POST `/admin/account-requests/:id/resend-invitation` | `account_requests`, `audit_logs` |
| POST `/admin/account-requests/:id/disable` | `users`, `audit_logs` |
| POST `/admin/account-requests/:id/reset-access` | `users`, `audit_logs` |

> Approval history is sourced from `audit_logs` — there is NO separate `account_request_audit` table.

---

### `/admin/marketing-sites` (future page)
**Service**: `adminService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/admin/marketing-sites` | `marketing_sites` |
| POST `/admin/marketing-sites` | `marketing_sites` |
| PATCH `/admin/marketing-sites/:id` | `marketing_sites` |
| DELETE `/admin/marketing-sites/:id` | `marketing_sites` |

> `marketing_sites` = approved authentication entry-point allowlist.  
> Separate from `marketing_sources` (attribution/analytics data).  
> Backend must enforce approved-domain allowlist for `loginUrl` values.

---

## Agent / Manager Pages

### `/agent/customers/[id]` — Request Account Action
**Service**: `agentService`

| API Endpoint | DB Tables |
|-------------|-----------|
| POST `/account-requests` | `account_requests`, `registrations`, `marketing_sites`, `audit_logs` |
| GET `/admin/marketing-sites` (active only) | `marketing_sites` |

**Frontend contract:**
- Manager selects from configured `marketing_sites` (active only — dropdown, not free text)
- Manager provides `requestReason`
- `registrationId` references the lead/registration record
- `requestedByUserId` resolved server-side from session
- Frontend does NOT allow arbitrary domain text entry
- Manager cannot create active customer login accounts directly
- Backend additionally verifies assignment/customer scope

---

## Marketing Site Login Handoff Flow

### `cryonfx.com/login` (Marketing Site — external, example)
> Marketing site is NOT a separate auth system. It is a branded login entry point only.  
> CryonFX may remain as an example external marketing website/brand.

| Step | Action | Notes |
|------|--------|-------|
| 1 | Customer submits credentials on marketing site | Marketing site calls Trade Console API |
| 2 | `POST /api/v1/auth/login` with `identifier` + `sourceSite` | Trade Console validates credentials |
| 3 | Backend generates short-lived handoff token | Cryptographically random, ~60s TTL, stored hashed in Valkey |
| 4 | Backend returns `handoffUrl` | URL constructed server-side from approved domain config |
| 5 | Browser redirects to `/auth/handoff?token=...` | Trade Console frontend route |
| 6 | Trade Console backend validates + redeems token from Valkey | Token immediately deleted |
| 7 | Secure HttpOnly session cookie created | `tc_session_token` |
| 8 | Audit records created | `audit_logs`: LOGIN_HANDOFF_CREATED + LOGIN_HANDOFF_REDEEMED |
| 9 | Customer redirected to dashboard | No second login required |

**DB Tables involved:** `users`, `sessions`, `audit_logs`  
**Valkey:** handoff token (hashed, ~60s TTL, deleted on redemption)  
**No PostgreSQL `login_handoff_tokens` table.**

---

## Staff Workspace Pages

### `/agent` (and all role variants: `/broker`, `/ftd-broker`, etc.)
**Service**: `agentService`, `platformService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/agents/:id/overview` | `customer_assignments`, `tasks`, `calls`, `conversations` |
| GET `/agents/:id/customers` | `customer_assignments`, `customer_profiles` |
| GET `/agents/:id/tasks` | `tasks` |
| GET `/agents/:id/calls` | `calls` |
| GET `/notifications` | `notifications` |

---

### `/agent/customers/[id]`
**Service**: `agentService`, `chatService`, `callingService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/agents/:agentId/customers/:customerId` | `customer_profiles` (PII filtered by permissions) |
| GET `/conversations` (customer filter) | `conversations`, `messages` |
| GET `/tasks` (customer filter) | `tasks` |
| GET `/calls` (customer filter) | `calls` |
| POST `/calls/initiate` | `calls` (phone retrieved server-side) |

---

### `/agent/messages`
**Service**: `chatService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/conversations` | `conversations`, `messages` |
| POST `/conversations/:id/messages` | `messages` |
| WS `message:new`, `typing:*` | Valkey |

---

### `/staff/chat`
**Service**: `staffChatService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/internal/conversations` | `conversations` (type=internal) |
| GET `/internal/conversations/:id/messages` | `messages` |
| POST `/internal/conversations/:id/messages` | `messages` |
| GET `/internal/presence` | Valkey |
| POST `/internal/presence` | Valkey |
| WS `message:new`, `presence:update`, `typing:*` | Valkey pub/sub |

---

### `/affiliate`
**Service**: `marketingService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/admin/marketing/affiliates` (own) | `affiliates`, `registrations`, `registration_attribution` |
| GET `/admin/marketing/campaigns` (own) | `campaigns` |

---

### `/finance-workspace`
**Service**: `adminService`, `financeService`

| API Endpoint | DB Tables |
|-------------|-----------|
| GET `/admin/finance/accounts` | `accounts`, `ledger_entries` |
| GET `/admin/finance/deposits` | `deposit_requests` |
| GET `/admin/finance/withdrawals` | `withdrawal_requests` |
| GET `/admin/finance/transactions` | `transactions` |
| PATCH `/admin/finance/deposits/:id` | `deposit_requests`, `ledger_transactions`, `ledger_entries`, `audit_logs` |
| PATCH `/admin/finance/withdrawals/:id` | `withdrawal_requests`, `ledger_transactions`, `ledger_entries`, `audit_logs` |
