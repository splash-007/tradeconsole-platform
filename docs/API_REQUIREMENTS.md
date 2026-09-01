# Trade Console — API Requirements

> Base URL: `/api/v1`  
> Production host: configurable via environment variable (e.g. `API_BASE_URL`)  
> Current test host: configurable — never hardcode  
> Authentication: HTTP-only session cookie (`tc_session_token`)

---

## Authentication

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/auth/login` | Login with identifier + password (supports direct and marketing-site login) | Public |
| POST | `/auth/register` | Customer registration (lead capture) | Public |
| POST | `/auth/logout` | Invalidate session | Authenticated |
| POST | `/auth/forgot-password` | Request password reset | Public |
| POST | `/auth/reset-password` | Reset password with token | Public |
| POST | `/auth/verify-email` | Verify email with token | Public |
| POST | `/auth/activate` | Complete account activation (set password via activation link) | Public (token-gated) |
| GET | `/auth/me` | Get current session user | Authenticated |
| POST | `/auth/refresh` | Refresh session | Authenticated |

### Login Request
```json
{
  "identifier": "username-or-email",
  "password": "string",
  "sourceSite": "optional-approved-marketing-domain"
}
```

> One authentication system supports both direct Trade Console login and marketing-site login.  
> `sourceSite` is optional. When provided, it must match a configured `marketing_sites.domain`.  
> Backend does NOT trust an arbitrary redirect URL from the request body.  
> Backend validates `sourceSite` against the `marketing_sites` approved-domain allowlist.

**Login Success Response (direct Trade Console login):**
```json
{
  "data": {
    "user": { "id": "string", "email": "string", "role": "string" },
    "sessionCreated": true
  }
}
```

**Login Success Response (marketing-site login — cross-domain handoff):**
```json
{
  "data": {
    "handoffUrl": "https://app.tradeconsole.com/auth/handoff?token=<short_lived_token>"
  }
}
```

> The `handoffUrl` is constructed server-side from the approved domain configuration.  
> The token is cryptographically random, single-use, short-lived (~60 seconds), stored hashed in Valkey.

**Login Error Codes:**
| Code | Meaning |
|------|---------|
| `invalid_credentials` | Identifier or password incorrect |
| `account_pending` | Account not yet activated |
| `account_disabled` | Account has been disabled |
| `activation_required` | Customer must complete activation |
| `password_change_required` | Password change required |
| `rate_limited` | Too many attempts |

> Do NOT reveal whether a username/email exists.

### Account Activation Request
```json
{
  "token": "string",
  "password": "string",
  "confirmPassword": "string"
}
```

> Customer uses the activation link to set their own password.  
> `users.password_hash` may be NULL only before activation.  
> Once `account_activated = true`, a valid Argon2id hash is required.  
> Do NOT email permanent or temporary plaintext passwords.

### Register Request (from RegisterDTO)
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string",
  "phone": "string",
  "country": "string",
  "password": "string",
  "confirmPassword": "string",
  "terms": true,
  "source_site": "string?",
  "affiliate_id": "string?",
  "campaign_id": "string?",
  "utm_source": "string?",
  "utm_medium": "string?",
  "utm_campaign": "string?",
  "utm_term": "string?",
  "utm_content": "string?",
  "landing_page": "string?",
  "referrer": "string?",
  "click_id": "string?"
}
```

> Registration creates a `registrations` record. A `users` record is NOT created at registration time.  
> The full lifecycle is: registration → account request → Admin approval → async provisioning → users record created → activation email → customer sets password → activated.

---

## Cross-Domain Login Handoff

> Marketing websites authenticate against the Trade Console API — they do NOT maintain their own auth database.  
> One central authentication system supports both direct Trade Console login and marketing-site login.

### Step 1 — Marketing Site Login
```
POST /api/v1/auth/login
```
**Request:**
```json
{
  "identifier": "username-or-email",
  "password": "string",
  "sourceSite": "cryonfx.com"
}
```

**Success Response:**
```json
{
  "data": {
    "handoffUrl": "https://app.tradeconsole.com/auth/handoff?token=<short_lived_token>"
  }
}
```

**Handoff Token Security Requirements:**
- Cryptographically random (minimum 32 bytes)
- Short-lived: ~60 seconds TTL
- Single-use: deleted from Valkey immediately on redemption
- Stored as hashed/derived token data in Valkey (not plaintext)
- Bound to authenticated user/session attempt
- Protected against replay attacks
- Auditable (creation and redemption recorded in `audit_logs`)
- **No PostgreSQL `login_handoff_tokens` table** — Valkey only

---

### Step 2 — Handoff Token Redemption (Trade Console)
```
GET /auth/handoff?token=<token>
```
> This is a Trade Console frontend route that calls the backend to redeem the token.

**Backend behavior:**
1. Validate token exists in Valkey, is not expired, is not already redeemed
2. Delete token from Valkey immediately (single-use)
3. Create secure HttpOnly session cookie (`tc_session_token`)
4. Create audit record: `LOGIN_HANDOFF_REDEEMED`
5. Redirect customer to their dashboard

> Do NOT put passwords or permanent session tokens in redirect URLs.

---

## Dashboard (Customer)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/dashboard/overview` | Portfolio overview + KPIs | customer |

---

## Trading

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/orders` | Place a new order | customer |
| GET | `/orders` | Get orders (filter: status, symbol) | customer |
| GET | `/orders/:id` | Get order detail | customer |
| DELETE | `/orders/:id` | Cancel order | customer |
| GET | `/positions` | Get open positions | customer |
| GET | `/portfolio/positions` | Get portfolio positions | customer |
| GET | `/portfolio/allocation` | Get portfolio allocation | customer |
| GET | `/portfolio/trades` | Get trade history | customer |

---

## Markets

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/markets` | Get all instruments | customer, staff |
| GET | `/markets/:symbol` | Get instrument detail | customer, staff |
| GET | `/markets/:symbol/orderbook` | Get order book | customer |
| GET | `/markets/:symbol/trades` | Get recent trades | customer |
| GET | `/markets/:symbol/candles` | Get OHLC candles | customer |

---

## Watchlist

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/watchlists` | Get customer watchlists | customer |
| POST | `/watchlists` | Create watchlist | customer |
| GET | `/watchlists/:id/items` | Get watchlist items | customer |
| POST | `/watchlists/:id/items` | Add item to watchlist | customer |
| DELETE | `/watchlists/:id/items/:symbol` | Remove item | customer |

---

## Finance (Customer)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/finance/balance` | Get account balance (computed from ledger) | customer |
| GET | `/finance/deposits` | Get deposit history | customer |
| POST | `/finance/deposits` | Submit deposit request | customer |
| GET | `/finance/withdrawals` | Get withdrawal history | customer |
| POST | `/finance/withdrawals` | Submit withdrawal request | customer |
| DELETE | `/finance/withdrawals/:id` | Cancel withdrawal | customer |
| GET | `/finance/transactions` | Get transaction history | customer |

---

## KYC / Verification (Customer)

> KYC is mandatory but presented under Profile/Settings rather than primary navigation.

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/kyc/status` | Get KYC status | customer |
| PATCH | `/kyc/personal` | Save personal info | customer |
| POST | `/kyc/documents` | Upload document (stored in S3-compatible storage; PostgreSQL stores key/metadata only) | customer |
| POST | `/kyc/submit` | Submit KYC for review | customer |

---

## Conversations & Messages (Customer ↔ Staff)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/conversations` | Get conversations | customer, staff |
| POST | `/conversations` | Create conversation | staff, admin |
| GET | `/conversations/:id/messages` | Get messages | customer, staff |
| POST | `/conversations/:id/messages` | Send message | customer, staff |
| PATCH | `/conversations/:id/read` | Mark as read | customer, staff |
| PATCH | `/conversations/:id/close` | Close conversation | staff, admin |

---

## Internal Staff Chat

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/internal/conversations` | Get staff conversations | staff |
| POST | `/internal/conversations` | Create staff conversation | staff |
| GET | `/internal/conversations/:id/messages` | Get messages | staff |
| POST | `/internal/conversations/:id/messages` | Send message | staff |
| PATCH | `/internal/conversations/:id/read` | Mark as read | staff |
| GET | `/internal/presence` | Get staff presence | staff |
| POST | `/internal/presence` | Update own presence | staff |

---

## Notifications

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/notifications` | Get notifications | authenticated |
| GET | `/notifications/unread-count` | Get unread count | authenticated |
| PATCH | `/notifications/:id/read` | Mark as read | authenticated |
| PATCH | `/notifications/read-all` | Mark all as read | authenticated |
| POST | `/notifications/email` | Send email notification | admin, staff |
| POST | `/notifications/in-app` | Create in-app notification | admin, staff |

---

## Calls

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/calls/initiate` | Initiate call to customer | staff (with permission) |
| POST | `/calls/:id/end` | End call | staff |
| POST | `/calls/:id/mute` | Mute/unmute call | staff |
| POST | `/calls/:id/hold` | Hold/unhold call | staff |
| GET | `/calls` | Get call history | staff, admin |
| GET | `/calls/:id` | Get call detail | staff, admin |

---

## Agent / Staff Workspace

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/agents/:id/overview` | Agent overview stats | staff |
| GET | `/agents/:id/customers` | Assigned customers | staff |
| GET | `/agents/:agentId/customers/:customerId` | Customer detail | staff |
| GET | `/agents/:id/tasks` | Agent tasks | staff |
| PATCH | `/tasks/:id` | Update task status | staff |
| GET | `/agents/:id/calls` | Agent call history | staff |
| PATCH | `/agents/:id/permissions` | Update agent permissions | admin, manager |

---

## Tasks

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/tasks` | Get tasks (filter: staffId, customerId, managerId) | staff, admin |
| POST | `/tasks` | Create task | admin, manager, staff |
| GET | `/tasks/:id` | Get task detail | staff, admin |
| PATCH | `/tasks/:id/status` | Update task status | staff, admin |
| DELETE | `/tasks/:id` | Cancel task | admin, manager |

---

## Assignments

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/assignments` | Get assignments (filter: staffId, customerId, status) | admin, manager |
| POST | `/assignments` | Create assignment | admin, manager |
| GET | `/assignments/:id` | Get assignment detail | admin, manager, staff |
| PATCH | `/assignments/:id/reassign` | Reassign customer | admin, manager |
| PATCH | `/assignments/:id/status` | Update assignment status | admin, manager |

---

## Admin — Customers

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/admin/customers` | List all customers | admin |
| GET | `/admin/customers/:id` | Customer detail | admin |
| PATCH | `/admin/customers/:id` | Update customer | admin |
| PATCH | `/admin/customers/:id/status` | Change customer status | admin |
| GET | `/admin/customers/:id/timeline` | Customer activity timeline | admin |
| GET | `/admin/customers/:id/notes` | Customer notes | admin, staff |
| POST | `/admin/customers/:id/notes` | Add note | admin, staff |

---

## Admin — Staff

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/admin/staff` | List all staff | admin |
| POST | `/admin/staff` | Create staff member | admin |
| GET | `/admin/staff/:id` | Staff detail | admin |
| PATCH | `/admin/staff/:id` | Update staff | admin |
| PATCH | `/admin/staff/:id/role` | Change role | admin |
| PATCH | `/admin/staff/:id/status` | Enable/disable staff | admin |
| GET | `/admin/staff/:id/permissions` | Get permissions | admin |
| PATCH | `/admin/staff/:id/permissions` | Update permissions | admin |

---

## Admin — Roles

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/admin/roles` | List all roles | admin |
| GET | `/admin/roles/:id` | Role detail + permissions | admin |
| PATCH | `/admin/roles/:id/permissions` | Update role permissions | super_admin |

---

## Admin — Finance

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/admin/finance/accounts` | List all accounts | admin, finance |
| GET | `/admin/finance/transactions` | List all transactions | admin, finance |
| GET | `/admin/finance/deposits` | List deposit requests | admin, finance |
| PATCH | `/admin/finance/deposits/:id` | Review deposit | admin, finance |
| GET | `/admin/finance/withdrawals` | List withdrawal requests | admin, finance |
| PATCH | `/admin/finance/withdrawals/:id` | Review withdrawal | admin, finance |

---

## Admin — Compliance

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/admin/compliance/verification` | List verification cases | admin, compliance_manager, compliance_broker |
| GET | `/admin/compliance/verification/:id` | Case detail | admin, compliance_manager, compliance_broker |
| PATCH | `/admin/compliance/verification/:id` | Review case | admin, compliance_manager, compliance_broker |
| GET | `/admin/compliance/documents` | List documents | admin, compliance_manager |
| GET | `/admin/compliance/documents/:id` | Document detail | admin, compliance_manager, compliance_broker |

---

## Admin — Marketing

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/admin/marketing/overview` | Marketing KPIs | admin, marketer_manager |
| GET | `/admin/registrations` | List registrations | admin, marketer_manager, conversion_manager |
| GET | `/admin/marketing/timeline` | Registration timeline | admin, marketer_manager |
| GET | `/admin/marketing/sources` | Source performance | admin, marketer_manager |
| GET | `/admin/marketing/affiliates` | Affiliate list | admin, marketer_manager, affiliate_manager |
| GET | `/admin/marketing/campaigns` | Campaign list | admin, marketer_manager, affiliate_manager |
| GET | `/admin/marketing/utm` | UTM analytics | admin, marketer_manager |
| GET | `/admin/marketing/funnel` | Conversion funnel | admin, marketer_manager, conversion_manager |

---

## Admin — Trading

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/admin/trading/orders` | All orders | admin |
| GET | `/admin/trading/positions` | All positions | admin |
| GET | `/admin/trading/activity` | Trading activity | admin |
| GET | `/admin/trading/market` | Market overview | admin |

---

## Admin — System

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/admin/audit` | Audit logs | admin, super_admin |
| GET | `/admin/system/settings` | Platform settings | super_admin |
| PATCH | `/admin/system/settings` | Update settings | super_admin |
| GET | `/admin/system/notifications` | Notification templates | admin |
| POST | `/admin/system/simulation` | Run simulation | admin |

---

## Admin — Performance

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/admin/performance` | Performance overview | admin, vp_sales |
| GET | `/admin/performance/agents` | Agent performance | admin, manager |

---

## Admin — Account Requests (Customer Account Provisioning)

> Permission required: `customer_account.request_view` (view), `customer_account.approve` / `customer_account.reject` (actions)  
> Authorization must be validated server-side. Frontend controls are not a security boundary.

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/admin/account-requests` | List all account requests (filterable by status) | admin, super_admin |
| GET | `/admin/account-requests/:id` | Get account request detail + approval history (from audit_logs) | admin, super_admin |
| POST | `/admin/account-requests/:id/approve` | Approve request → triggers async provisioning job | admin, super_admin |
| POST | `/admin/account-requests/:id/reject` | Reject request with reason | admin, super_admin |
| POST | `/admin/account-requests/:id/resend-invitation` | Resend activation email | admin, super_admin |
| POST | `/admin/account-requests/:id/disable` | Disable provisioned account | admin, super_admin |
| POST | `/admin/account-requests/:id/reset-access` | Reset customer access credentials | admin, super_admin |

### Account Request — Create (Manager)

> Permission required: `customer_account.request`  
> Additional scope check: manager must have assignment scope for the referenced registration/customer.

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/account-requests` | Submit account creation request for a lead/customer | manager roles with assignment scope |
| GET | `/account-requests` | List own submitted requests | manager roles |

### Create Request Body
```json
{
  "registrationId": "string",
  "marketingSiteId": "string",
  "requestReason": "string"
}
```
> `requestedByUserId` is resolved server-side from the authenticated session.  
> `marketingSiteId` must reference a configured, active `marketing_sites` record.  
> Frontend must NOT allow arbitrary domain text entry.  
> Backend additionally verifies assignment/customer scope — permission alone is not sufficient.

### Approve Response (triggers async provisioning job)
```json
{
  "data": {
    "requestId": "string",
    "status": "approved",
    "provisioningTriggered": true
  }
}
```

### Provisioning Complete Response (via WebSocket or polling)
```json
{
  "data": {
    "requestId": "string",
    "status": "provisioned",
    "provisionedUserId": "string",
    "username": "string",
    "accountActivated": false,
    "mustChangePassword": false
  }
}
```

> Username is generated by the backend. Frontend must NOT generate authoritative usernames.  
> `accountActivated` is false until the customer uses the activation link to set their password.  
> No plaintext password is ever returned by the API.

---

## Marketing Site Configuration

> Permission required: `marketing_site.view` (read), `marketing_site.manage` (write — super_admin only)  
> Marketing sites are the approved authentication entry-point allowlist.  
> They are separate from `marketing_sources` (attribution data).

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/admin/marketing-sites` | List all configured marketing sites | admin, super_admin, manager roles |
| POST | `/admin/marketing-sites` | Create new marketing site | super_admin |
| PATCH | `/admin/marketing-sites/:id` | Update marketing site | super_admin |
| DELETE | `/admin/marketing-sites/:id` | Deactivate marketing site | super_admin |

### Marketing Site Object
```json
{
  "id": "string",
  "name": "CryonFX",
  "domain": "cryonfx.com",
  "loginUrl": "https://cryonfx.com/login",
  "status": "active",
  "brandConfig": {
    "brandName": "CryonFX",
    "logoUrl": "https://...",
    "primaryColor": "#..."
  },
  "createdAt": "string",
  "updatedAt": "string"
}
```
> Backend must validate `loginUrl` against an approved-domain allowlist.  
> Frontend must never accept arbitrary redirect URLs.  
> `brandConfig` is used for per-site email template branding.

---

## Account Provisioning Contract

On approval, the backend async provisioning job will:
1. Create `users` record (with `account_activated = false`, `password_hash = NULL`)
2. Create `customer_profiles` record
3. Assign `Customer` role
4. Associate source/affiliate/campaign attribution from `registration_attribution`
5. Associate assigned manager
6. Generate unique username (backend responsibility — frontend must NOT generate authoritative usernames)
7. Generate secure activation token (stored hashed in `users.activation_token_hash`)
8. Create audit records in `audit_logs`
9. Trigger account access email with activation link and login URL from `marketing_sites.login_url`
10. Update `account_requests.status` to `provisioned`
11. Set `account_requests.provisioned_user_id` to the new `users.id`

**Account flags returned by provisioning API:**
```json
{
  "username": "string",
  "mustChangePassword": false,
  "accountActivated": false
}
```

> No plaintext password is ever emailed or returned by the API.  
> Customer sets their own password via the activation link.

---

## WebSocket Events (Account Provisioning)

| Event | Direction | Payload | Trigger |
|-------|-----------|---------|---------|
| `account_request.status_updated` | Server → Client | `{ requestId, status, updatedAt }` | Account request status changed |
| `account.provisioned` | Server → Client | `{ requestId, provisionedUserId, username }` | Customer account provisioned |
| `account.activated` | Server → Client | `{ userId, activatedAt }` | Customer completed first login |

---

## WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `message:new` | Server → Client | New chat message |
| `message:read` | Server → Client | Message read receipt |
| `presence:update` | Server → Client | Staff presence change |
| `typing:start` | Server → Client | User started typing |
| `typing:stop` | Server → Client | User stopped typing |
| `conversation:new` | Server → Client | New conversation created |
| `notification:new` | Server → Client | New notification |
| `assignment:new` | Server → Client | New customer assignment |
| `assignment:updated` | Server → Client | Assignment changed |
| `task:new` | Server → Client | New task assigned |
| `task:updated` | Server → Client | Task status changed |
| `quote:update` | Server → Client | Market price update |
| `call:status` | Server → Client | Call state change |

---

## Standard Response Format

```json
{
  "data": {},
  "error": null,
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 1234
  }
}
```

## Standard Error Format

```json
{
  "data": null,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

## HTTP Status Codes Used

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 400 | Bad request / validation error |
| 401 | Unauthenticated |
| 403 | Forbidden (authenticated but no permission) |
| 404 | Not found |
| 409 | Conflict (duplicate) |
| 429 | Rate limited |
| 500 | Internal server error |
