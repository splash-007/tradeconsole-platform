# CryonFX — Database Open Questions

> These are decisions that must be made before writing PostgreSQL migrations.  
> Each question is marked with its impact level.

---

## CRITICAL — Must Decide Before Phase 1 Migrations

---

### Q1: Multi-Currency Accounts
**Impact**: Schema design of `accounts` table

The current UI shows a single USD balance per customer. However, the application also shows crypto positions (BTC, ETH, SOL, etc.).

**Question**: Does each customer have:
- (A) One USD account only (crypto positions are denominated in USD)
- (B) One account per currency (USD account + BTC account + ETH account, etc.)
- (C) One USD account for fiat + separate crypto wallet tracking

**Recommendation**: Option A for Phase 1 (simplest, matches current UI). Design `accounts` with `currency` column so Option B can be added later without schema changes.

---

### Q2: Trading Account vs Finance Account
**Impact**: Whether `trading_accounts` and `accounts` are the same or separate

The UI has:
- `/finance` — deposits, withdrawals, fiat balance
- `/portfolio` — positions, P&L, trading history

**Question**: Are these the same account or separate?

**Recommendation**: Keep them separate. `accounts` = fiat/cash account. `trading_accounts` = trading context. Funds move from `accounts` to `trading_accounts` when used for trading.

---

### Q3: Document Storage Provider
**Impact**: `verification_documents.storage_key` and `document_storage` table

KYC documents must be stored somewhere. The database should only store references (keys), not binary data.

**Question**: Which object storage will you use?
- (A) MinIO (self-hosted on VPS)
- (B) AWS S3
- (C) Cloudflare R2
- (D) Local filesystem (not recommended for production)

**Recommendation**: MinIO for Phase 1 (self-hosted, S3-compatible). Can migrate to R2/S3 later by changing `storage_provider` value.

---

### Q4: Affiliate Commission Model
**Impact**: Whether to add commission/payout tables in Phase 1

The UI shows affiliate revenue figures but no commission rate or payout structure is defined in the application.

**Question**: 
- How is affiliate commission calculated? (per registration? per FTD? percentage of deposit?)
- Are commissions paid automatically or manually?
- Do affiliates have a payout wallet/account in the system?

**Recommendation**: Add `affiliates.commission_rate` column in Phase 1. Defer payout tables to Phase 2.

---

### Q5: 2FA Method
**Impact**: `two_factor_auth` table design

**Question**: Will you support:
- (A) TOTP only (Google Authenticator, Authy)
- (B) SMS only
- (C) Both

**Recommendation**: TOTP only for Phase 1. SMS requires a third-party provider (Twilio, etc.) and adds complexity.

---

## HIGH PRIORITY — Decide Before Phase 1 Launch

---

### Q6: Squaretalk Integration Details
**Impact**: `calls` table `provider_metadata` JSONB field

**Question**: What data does Squaretalk return in its call session response? Specifically:
- What is the `provider_session_id` format?
- What metadata does Squaretalk provide (recording URL, call quality, etc.)?
- Does Squaretalk support webhooks for call status updates?

**Recommendation**: Design `calls.provider_metadata` as JSONB to store whatever Squaretalk returns. This avoids schema changes when integration is complete.

---

### Q7: Soft Delete Strategy for Customers
**Impact**: All queries that filter active customers

**Question**: When a customer account is "deleted" or "archived":
- Should the `users` record be soft-deleted (`archived_at` timestamp)?
- Should the `customer_profiles` record be anonymized (GDPR)?
- Should financial records be preserved?

**Recommendation**: 
- Soft delete `users` with `archived_at`
- Preserve all financial records (legal requirement)
- For GDPR: add `anonymized_at` to `customer_profiles` and null out PII fields on request

---

### Q8: Ledger Entry Source of Truth
**Impact**: Balance computation performance

The recommended architecture uses `ledger_entries` as the source of truth for balances. This means every balance query requires a SUM of ledger entries.

**Question**: Is this acceptable for performance, or do you need a cached `balance` column?

**Recommendation**: Use ledger entries as source of truth. Add a materialized view or a `account_balance_cache` table (updated by trigger) if performance becomes an issue. Do NOT use a mutable `balance` column.

---

### Q9: Registration → Customer Profile Flow
**Impact**: Whether `registrations` and `customer_profiles` are created simultaneously or sequentially

**Question**: When a user registers:
- (A) Create `users` + `customer_profiles` + `registrations` all at once
- (B) Create `registrations` first, then create `users` + `customer_profiles` after approval

**Recommendation**: Option A — create all three simultaneously. The `registrations` table captures the marketing attribution data. The `customer_profiles` table captures the customer identity. Both are needed from day one.

---

### Q10: Internal Chat Conversation Creation
**Impact**: `conversations` table and who can create internal conversations

**Question**: Can any staff member create a direct message conversation with any other staff member? Or are conversations only created by managers/admins?

**Recommendation**: Any staff member can create a direct message conversation. Team/department conversations are created by managers or admins.

---

## MEDIUM PRIORITY — Can Decide After Phase 1

---

### Q11: Escalation Workflow
**Impact**: `escalations` table design

The shift manager and team leader workspaces show escalation queues. The exact escalation workflow is not fully defined in the current UI.

**Question**: 
- Who can create escalations? (any staff? only managers?)
- Who can resolve escalations?
- Are escalations linked to specific customers, tasks, or both?

---

### Q12: Performance Metrics Storage
**Impact**: Whether to add a `staff_performance_metrics` table

The admin performance page and various manager dashboards show KPIs (calls today, tasks completed, conversion rate, etc.).

**Question**: Should performance metrics be:
- (A) Computed on-the-fly from `tasks`, `calls`, `customer_assignments`
- (B) Pre-computed and stored in a `staff_performance_metrics` table (updated daily)

**Recommendation**: Option A for Phase 1. Add pre-computed metrics in Phase 2 if query performance is an issue.

---

### Q13: Market Instrument Master Data
**Impact**: Whether to add a `market_instruments` table

The current application uses hardcoded instrument lists (BTC/USDC, ETH/USDC, EUR/USD, XAU/USD, etc.).

**Question**: Should the list of tradeable instruments be stored in PostgreSQL, or managed entirely by the market data provider?

**Recommendation**: Add a `market_instruments` table in Phase 2 for admin control over which instruments are available. Phase 1 can use a hardcoded list.

---

### Q14: Simulation Lab Data
**Impact**: `simulation_runs` table design

The admin simulation lab exists in the UI but its exact purpose is unclear from the current mock data.

**Question**: What does the simulation lab actually simulate? Market scenarios? Customer behavior? Staff training?

---

### Q15: Email Template Storage
**Impact**: Whether email templates are stored in PostgreSQL or hardcoded

The current `notification.service.ts` has hardcoded email templates.

**Question**: Should email templates be:
- (A) Stored in PostgreSQL (admin-editable)
- (B) Hardcoded in the application

**Recommendation**: Phase 1 — hardcoded. Phase 2 — move to `email_templates` table for admin customization.

---

## LOW PRIORITY — Phase 2 Decisions

---

### Q16: Affiliate Payout System
Should affiliates have their own wallet/account in the system, or are payouts handled externally?

### Q17: Customer Referral System
Is there a customer referral program (customer refers another customer)?

### Q18: Multi-Office Support
Will the platform support multiple physical offices with separate staff pools?

### Q19: Shift Scheduling
Will the shift manager have a scheduling feature (assign staff to specific shifts)?

### Q20: Audit Log Retention Policy
How long should audit logs be retained? (Legal requirement may vary by jurisdiction)

---

## ACCOUNT PROVISIONING — New Open Questions

---

### Q21: Temporary Password vs Activation Link
**Impact**: First-login security architecture, `users` table fields, email template content

**Question**: For first-login access, which mechanism will be used?
- (A) **Temporary password** — backend generates, stores only Argon2id hash, marks `mustChangePassword=true`, expires after first use or N hours
- (B) **Activation/set-password link** — backend generates secure token, customer sets their own password on first visit, no temporary plaintext password ever transmitted

**Security note**: Option A requires the temporary password to be transmitted in the account access email (plaintext in transit). Option B is preferred for security — no password is ever emailed.

**Recommendation**: Option B (activation link) is preferred. If Option A is chosen: generate server-side only, store only hash, mark temporary, require change on first login, expire it, never log it, never expose via Admin APIs.

**Fields to prepare regardless of choice:**
```
mustChangePassword: boolean
accountActivated: boolean
activationTokenExpiresAt: timestamp (Option B)
passwordExpiresAt: timestamp (Option A)
```

---

### Q22: Provisioning Trigger — Immediate vs Async Job
**Impact**: Backend architecture, frontend status polling, UX after approval

**Question**: When Admin approves an account request, does provisioning occur:
- (A) **Synchronously** — immediately on approval API response
- (B) **Asynchronously** — via background job queue (status transitions: `approved` → `provisioning` → `provisioned`)

**Recommendation**: Option B (async job) for production. The `provisioning` status exists in the enum to support this. Frontend should poll or use WebSocket `account_request.status_updated` event.

---

### Q23: Which Manager Roles Can Request Accounts
**Impact**: `customer_account.request` permission assignment, RBAC configuration

**Question**: Which staff roles should be permitted to submit account creation requests?
- All roles with customer/lead access (agent, broker, retention_broker, ftd_broker, etc.)?
- Only specific senior roles (desk_manager, team_leader, conversion_manager)?
- Configurable per team/office?

**Recommendation**: Grant `customer_account.request` to all roles that have customer assignment scope (agent, broker, retention_broker, ftd_broker, desk_broker, compliance_broker). Restrict to assigned customers only — existing team/assignment scope must continue to apply.

---

### Q24: Admin vs Super Admin Approval Authority
**Impact**: `customer_account.approve` permission assignment

**Question**: Can regular Admin approve account requests, or is this Super Admin only?

**Recommendation**: Both Admin and Super Admin should be able to approve/reject. Super Admin additionally gets `customer_account.provision` (manual provisioning override) and `customer_account.disable` / `customer_account.credentials_reset`.

---

### Q25: Marketing Sites — New Table vs Extend Existing
**Impact**: Schema design, whether `marketing_sources` table is sufficient

**Question**: The existing `marketing_sources` table tracks lead attribution sources. Should marketing sites (with `domain`, `login_url`, `brand_config`) be:
- (A) A new `marketing_sites` table (separate from attribution sources)
- (B) Extended columns on the existing `marketing_sources` table

**Recommendation**: Option A — new `marketing_sites` table. Marketing sources are attribution/analytics data. Marketing sites are authentication entry points with security implications (approved domain allowlist). These are different concerns and should not be conflated.

---

### Q26: Login Handoff Token Storage
**Impact**: New `login_handoff_tokens` table design

**Question**: Should handoff tokens be stored in:
- (A) PostgreSQL `login_handoff_tokens` table (with TTL cleanup job)
- (B) Valkey/Redis with TTL (auto-expires, no cleanup needed)

**Recommendation**: Option B (Valkey) for handoff tokens — they are ephemeral (~30–60s), high-frequency, and benefit from automatic TTL expiry. Audit records of redemption events go to PostgreSQL `audit_logs`.

---

### Q27: Account Access Email — Branding
**Impact**: Email template system, `marketing_sites` brand configuration

**Question**: Should account access emails be branded per marketing site (CryonFX branding for cryonfx.com customers, TradeHub branding for tradehub.io customers)?

**Recommendation**: Yes. The `marketing_sites` table should include a `brand_config` reference (logo URL, brand name, colors). The email template system should resolve branding from the customer's associated marketing site.
