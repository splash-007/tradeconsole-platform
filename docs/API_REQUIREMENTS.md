# CryonFX — API Requirements

> Base URL: `/api/v1`  
> Production host: configurable via environment variable (e.g. `API_BASE_URL`)  
> Current test host: `https://api.kraken.tube` (WILL CHANGE — never hardcode)  
> Authentication: HTTP-only session cookie (`cv_session_token`)

---

## Authentication

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/auth/login` | Login with email + password | Public |
| POST | `/auth/register` | Customer registration | Public |
| POST | `/auth/logout` | Invalidate session | Authenticated |
| POST | `/auth/forgot-password` | Request password reset | Public |
| POST | `/auth/reset-password` | Reset password with token | Public |
| POST | `/auth/verify-email` | Verify email with token | Public |
| GET | `/auth/me` | Get current session user | Authenticated |
| POST | `/auth/refresh` | Refresh session | Authenticated |

### Login Request
```json
{
  "email": "string",
  "password": "string"
}
```

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
| GET | `/finance/balance` | Get account balance | customer |
| GET | `/finance/deposits` | Get deposit history | customer |
| POST | `/finance/deposits` | Submit deposit request | customer |
| GET | `/finance/withdrawals` | Get withdrawal history | customer |
| POST | `/finance/withdrawals` | Submit withdrawal request | customer |
| DELETE | `/finance/withdrawals/:id` | Cancel withdrawal | customer |
| GET | `/finance/transactions` | Get transaction history | customer |

---

## KYC / Verification (Customer)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/kyc/status` | Get KYC status | customer |
| PATCH | `/kyc/personal` | Save personal info | customer |
| POST | `/kyc/documents` | Upload document | customer |
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

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/admin/account-requests` | List all account requests (filterable by status) | admin, super_admin |
| GET | `/admin/account-requests/:id` | Get account request detail + approval history | admin, super_admin |
| POST | `/admin/account-requests/:id/approve` | Approve request → triggers provisioning | admin, super_admin |
| POST | `/admin/account-requests/:id/reject` | Reject request with reason | admin, super_admin |
| POST | `/admin/account-requests/:id/resend-invitation` | Resend account access email | admin, super_admin |
| POST | `/admin/account-requests/:id/disable` | Disable provisioned account | admin, super_admin |
| POST | `/admin/account-requests/:id/reset-access` | Reset customer access credentials | admin, super_admin |

### Account Request — Create (Manager)

> Permission required: `customer_account.request`

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| POST | `/account-requests` | Submit account creation request for a lead/customer | manager roles |
| GET | `/account-requests` | List own submitted requests | manager roles |

### Create Request Body
```json
{
  "customerId": "string",
  "marketingSiteId": "string",
  "requestReason": "string"
}
```
> `requestingManagerId` is resolved server-side from the authenticated session.  
> `marketingSiteId` must reference a configured, active `marketing_sites` record.  
> Frontend must NOT allow arbitrary domain text entry.

### Approve Response (triggers backend provisioning)
```json
{
  "data": {
    "requestId": "string",
    "status": "approved",
    "provisioningTriggered": true,
    "username": "string",
    "mustChangePassword": true,
    "accountActivated": false
  }
}
```

---

## Marketing Site Configuration

> Permission required: `marketing_site.manage` (admin/super_admin)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/admin/marketing-sites` | List all configured marketing sites | admin, super_admin |
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
  "brandConfig": {},
  "createdAt": "string",
  "updatedAt": "string"
}
```
> Backend must validate `loginUrl` against an approved-domain allowlist.  
> Frontend must never accept arbitrary redirect URLs.

---

## Cross-Domain Login Handoff

> These endpoints support the marketing-site → Trade Console seamless login flow.  
> Marketing websites authenticate against the Trade Console API — they do NOT maintain their own auth database.

### Step 1 — Marketing Site Login
```
POST /api/v1/auth/login
```
**Request:**
```json
{
  "username": "string",
  "password": "string",
  "sourceSite": "cryonfx.com"
}
```
> `sourceSite` is used for attribution and to resolve the approved redirect domain.  
> Backend validates credentials against the central Trade Console user/session system.  
> Backend does NOT trust an arbitrary redirect URL from the request body.

**Success Response:**
```json
{
  "data": {
    "handoffUrl": "https://app.tradeconsole.com/auth/handoff?token=<short_lived_token>"
  }
}
```
> The `handoffUrl` is constructed server-side from the approved domain configuration.  
> The token is cryptographically random, single-use, short-lived (~30–60 seconds), stored hashed.

**Login Error Codes:**
| Code | Meaning |
|------|---------|
| `invalid_credentials` | Username or password incorrect |
| `account_pending` | Account not yet activated |
| `account_disabled` | Account has been disabled |
| `activation_required` | Customer must complete activation |
| `password_change_required` | Temporary password must be changed |
| `rate_limited` | Too many attempts |

> Do NOT reveal whether a username exists.

---

### Step 2 — Handoff Token Redemption (Trade Console)
```
GET /auth/handoff?token=<token>
```
> This is a Trade Console frontend route that calls the backend to redeem the token.

**Backend behavior:**
1. Validate token exists, is not expired, is not already redeemed
2. Mark token as redeemed (immediately invalid after this point)
3. Create secure HttpOnly session cookie (`cv_session_token`)
4. Create audit record: `LOGIN_HANDOFF_REDEEMED`
5. Redirect customer to their dashboard

**Token Security Requirements:**
- Cryptographically random (minimum 32 bytes)
- Short-lived: 30–60 seconds
- Single-use: invalidated immediately on redemption
- Stored hashed (not plaintext) in backend
- Bound to authenticated user/session attempt
- Protected against replay attacks
- Auditable

> Do NOT put passwords or permanent session tokens in redirect URLs.

---

## Account Provisioning Contract

On approval, the backend will:
1. Create/activate `users` record
2. Create `customer_profiles` record if required
3. Assign `Customer` role
4. Associate source/affiliate/campaign attribution
5. Associate assigned manager
6. Generate unique username (backend responsibility — frontend must NOT generate authoritative usernames)
7. Generate first-login access (temporary password or activation link — TBD, see Open Questions)
8. Create audit records
9. Trigger account access email with login URL from `marketing_sites.login_url`

**Account flags returned by provisioning API:**
```json
{
  "username": "string",
  "mustChangePassword": true,
  "accountActivated": false
}
```

---

## WebSocket Events (Account Provisioning)

| Event | Direction | Description |
|-------|-----------|-------------|
| `account_request.status_updated` | Server → Client | Account request status changed |
| `account.provisioned` | Server → Client | Customer account provisioned |
| `account.activated` | Server → Client | Customer completed first login |

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
