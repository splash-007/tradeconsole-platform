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
