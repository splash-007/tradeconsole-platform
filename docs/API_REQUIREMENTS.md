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
