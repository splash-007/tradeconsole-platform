# Trade Console — Database Open Questions

> These are decisions that must be made before writing PostgreSQL migrations.  
> Each question is marked with its impact level.  
> **Resolved** questions are kept for audit trail — they document the final decision.

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

KYC documents must be stored somewhere. The database stores only references (keys), not binary data.

**FINAL DECISION**: Use external S3-compatible object storage — **Cloudflare R2** is the recommended provider. PostgreSQL stores object keys and metadata only. Binary document data is never stored in PostgreSQL.

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

**FINAL DECISION**: Use a genuine **double-entry ledger** as source of truth. The production financial ledger uses the structure `ledger_transactions → ledger_entries → accounts`. Every finalized ledger transaction must balance debits and credits. System/clearing/fee/settlement accounts are supported alongside customer accounts. Ledger entries are immutable and are the source of truth for all balances. A mutable customer balance field must NOT be used as financial source of truth. Add a materialized view or `account_balance_cache` table (updated by trigger) if query performance becomes an issue.

---

### Q9: Registration → Customer Profile Flow
**Impact**: Whether `registrations` and `customer_profiles` are created simultaneously or sequentially

**FINAL DECISION**: **Option B — sequential creation.**

A `registrations` record may exist without a `users` record. The full lifecycle is:

```
registration/lead → authorized staff account request → Admin/Super Admin approval
→ async provisioning → Trade Console user/profile created → activation email
→ customer sets password → activated
```

`registrations.user_id` is nullable. A `users` record and `customer_profiles` record are created only after Admin approval and successful provisioning — not at registration capture time.

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

## ACCOUNT PROVISIONING — Resolved Decisions

---

### Q21: Temporary Password vs Activation Link
**Impact**: First-login security architecture, `users` table fields, email template content

**FINAL DECISION**: **Option B — Secure activation/set-password link.**

- Do NOT email permanent or temporary plaintext passwords.
- Backend generates a secure, cryptographically random activation token.
- Token is stored **hashed** in `users.activation_token_hash`.
- Token has an expiry stored in `users.activation_token_expires_at`.
- Customer clicks the activation link and sets their own password on first visit.
- `users.password_hash` may be NULL only before account activation.
- Once `users.account_activated = true`, a valid Argon2id password hash is required.
- Activation tokens must be stored hashed and expire.

**Fields required on `users`:**
```
username                    text UNIQUE NOT NULL
must_change_password        boolean DEFAULT false
account_activated           boolean DEFAULT false
activation_token_hash       text NULL
activation_token_expires_at timestamptz NULL
```

---

### Q22: Provisioning Trigger — Immediate vs Async Job
**Impact**: Backend architecture, frontend status polling, UX after approval

**FINAL DECISION**: **Option B — Asynchronous provisioning job.**

The `provisioning` status exists in the `account_requests` enum to support this. Frontend should poll or subscribe to the WebSocket `account_request.status_updated` event. Status transitions: `approved` → `provisioning` → `provisioned`.

---

### Q23: Which Manager Roles Can Request Accounts
**Impact**: `customer_account.request` permission assignment, RBAC configuration

**FINAL DECISION**: Grant `customer_account.request` to all roles that have customer assignment scope (agent, broker, retention_broker, ftd_broker, desk_broker, compliance_broker). Restrict to assigned customers only — existing team/assignment scope must continue to apply. Account-request authorization must additionally verify assignment/customer scope. Permission possession alone is not sufficient.

---

### Q24: Admin vs Super Admin Approval Authority
**Impact**: `customer_account.approve` permission assignment

**FINAL DECISION**: Both Admin and Super Admin can approve/reject/resend/disable/reset. Super Admin additionally receives `customer_account.provision` (manual provisioning override) and `marketing_site.manage`.

---

### Q25: Marketing Sites — New Table vs Extend Existing
**Impact**: Schema design, whether `marketing_sources` table is sufficient

**FINAL DECISION**: **Option A — new `marketing_sites` table, separate from `marketing_sources`.**

- `marketing_sources` = attribution/analytics data (traffic sources, UTM tracking).
- `marketing_sites` = approved authentication entry-point allowlist (domain, login_url, brand_config).
- These are different concerns and must not be conflated.
- Never accept arbitrary redirect/login URLs from the browser.
- Backend must enforce an approved-domain allowlist for all `login_url` values.

---

### Q26: Login Handoff Token Storage
**Impact**: Token storage architecture

**FINAL DECISION**: **Valkey only — no PostgreSQL `login_handoff_tokens` table.**

- Handoff tokens are ephemeral (~60 seconds TTL), cryptographically random, single-use.
- Stored as hashed/derived token data in Valkey with TTL.
- Deleted immediately on redemption.
- Audit records of creation and redemption events go to PostgreSQL `audit_logs` (events: `LOGIN_HANDOFF_CREATED`, `LOGIN_HANDOFF_REDEEMED`).
- Do NOT create a PostgreSQL `login_handoff_tokens` table.
- Do NOT put passwords or permanent session tokens in redirect URLs.

---

### Q27: Account Access Email — Branding
**Impact**: Email template system, `marketing_sites` brand configuration

**FINAL DECISION**: Account access emails are branded per marketing site. The `marketing_sites` table includes a `brand_config` JSONB field (logo URL, brand name, colors). The email template system resolves branding from the customer's associated marketing site record. The login URL in the email is resolved from `marketing_sites.login_url` — it is never hardcoded.

---

## OPEN — Remaining Unresolved Questions

---

### Q28: Double-Entry Ledger — Account Types
**Impact**: `ledger_transactions`, `ledger_entries`, `accounts` schema

**Question**: What system/clearing/fee/settlement account identifiers will be used?
- How are system accounts seeded (migration vs admin UI)?
- What is the chart of accounts structure?

**Recommendation**: Define a `system_accounts` seed migration with well-known UUIDs for clearing, fee, and settlement accounts. Customer accounts are created dynamically on provisioning.

---

### Q29: Username Generation Strategy
**Impact**: Backend provisioning job

**Question**: What is the username generation algorithm?
- Prefix + sequential number (e.g. `TC-000042`)?
- First name + random suffix?
- Email-derived?

**Recommendation**: Backend generates username. Frontend must NOT generate authoritative usernames. The backend is responsible for uniqueness. Potential response field: `username`.

---

### Q30: KYC Placement in Navigation
**Impact**: Frontend navigation structure

**FINAL DECISION**: KYC remains mandatory but is presented under Profile/Settings rather than primary navigation. Backend enforcement will ultimately determine restricted actions for unverified customers.
