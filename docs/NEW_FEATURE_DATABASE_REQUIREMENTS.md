// NEW FEATURE DATABASE REQUIREMENTS
// Trade Console — Frontend Feature Additions
// Generated: September 2026 — Updated: September 2026 (Audit Pass)
//
// PURPOSE:
// This document captures every newly introduced persistent-data requirement
// from the frontend feature additions in this sprint. It is intended to let
// the team review and freeze product requirements BEFORE continuing database
// implementation. No SQL migrations should be created until this document
// is reviewed and approved.
//
// DO NOT create migrations based on this document without explicit approval.

# Trade Console — New Feature Database Requirements

## Overview

This document covers the persistent-data requirements introduced by the following frontend features:

1. Watchlists
2. Trading Bots
3. Bot Configurations
4. Bot Runs / History
5. Prediction Markets
6. Prediction Positions
7. Prediction Settlement
8. Prediction Eligibility / Restrictions
9. Customer Preferences
10. Theme Preference
11. Notification Events
12. Per-user Notification State
13. Notification Read State
14. Notification Dismissal
15. Dividend Programs
16. Dividend Eligibility
17. Dividend Claims
18. Dividend Payments
19. Support Notification Integration
20. Support Conversation Persistence

---

## 1. Watchlists

**Purpose:** Store per-user instrument watchlists. A user may star/unstar any instrument from the Markets page. The watchlist must be user-specific and must not show default instruments.

**Required Fields:**
- `id` — uuid, primary key
- `user_id` — uuid, FK → users.id (NOT NULL)
- `symbol` — varchar(32), instrument symbol (e.g. "EURUSD", "BTCUSDT")
- `instrument_name` — varchar(128)
- `category` — enum: forex | indices | commodities | metals | energy | shares | crypto
- `added_at` — timestamptz, NOT NULL, default now()

**Relationships:**
- Belongs to `users`
- References instrument catalog (future)

**Ownership:** Per-user. User A's watchlist is completely independent of User B's.

**Mutability:** Append + delete (user can add/remove). Not append-only.

**Suggested API:**
- `GET    /api/v1/watchlist`
- `POST   /api/v1/watchlist`
- `DELETE /api/v1/watchlist/:symbol`

**Security/Permissions:** Customer can only read/write their own watchlist. Staff/admin may view for support purposes.

**Audit:** Low priority. No audit log required for watchlist changes.

**Storage:** PostgreSQL

---

## 2. Trading Bots

**Purpose:** Store customer-created automated trading bot configurations.

**Required Fields:**
- `id` — uuid, primary key
- `user_id` — uuid, FK → users.id
- `name` — varchar(128)
- `market_type` — enum: spot | perpetual_futures | options
- `symbol` — varchar(32)
- `bot_type` — enum: grid | dca | momentum | technical | arbitrage
- `status` — enum: draft | active | paused | stopped | error
- `created_at` — timestamptz
- `updated_at` — timestamptz
- `started_at` — timestamptz, nullable
- `stopped_at` — timestamptz, nullable

**Relationships:**
- Belongs to `users`
- Has many `bot_configurations`
- Has many `bot_runs`

**Ownership:** Per-user.

**Mutability:** Mutable (status, configuration can change).

**Suggested API:**
- `GET  /api/v1/bots`
- `POST /api/v1/bots`
- `GET  /api/v1/bots/:id`
- `POST /api/v1/bots/:id/start`
- `POST /api/v1/bots/:id/pause`
- `POST /api/v1/bots/:id/stop`

**Security/Permissions:** Customer owns their bots. Admin can view/suspend. Actual trade execution requires server-side authorization.

**Audit:** Bot start/stop/error events should be logged in `audit_logs`.

**Storage:** PostgreSQL

---

## 3. Bot Configurations

**Purpose:** Store the versioned configuration parameters for each bot. Differentiated by market type.

**Required Fields:**
- `id` — uuid, primary key
- `bot_id` — uuid, FK → trading_bots.id
- `market_type` — enum: spot | perpetual_futures | options
- `leverage` — numeric(5,2), nullable (futures only)
- `direction` — enum: long | short, nullable (futures only)
- `isolated_margin` — boolean, nullable (futures only)
- `liquidation_buffer_pct` — numeric(5,2), nullable (futures only)
- `option_type` — enum: call | put, nullable (options only)
- `strike_price` — numeric(18,8), nullable (options only)
- `expiry_date` — date, nullable (options only)
- `premium_budget` — numeric(18,8), nullable (options only)
- `lower_bound` — numeric(18,8), nullable (grid strategies)
- `upper_bound` — numeric(18,8), nullable (grid strategies)
- `grid_count` — integer, nullable (grid strategies)
- `investment_amount` — numeric(18,8)
- `investment_currency` — varchar(8)
- `stop_loss_percentage` — numeric(5,2), nullable
- `take_profit_percentage` — numeric(5,2), nullable
- `dca_interval` — varchar(8), nullable (DCA strategies)
- `dca_amount` — numeric(18,8), nullable (DCA strategies)
- `created_at` — timestamptz
- `version` — integer, default 1

**Relationships:**
- Belongs to `trading_bots`

**Ownership:** Derived from bot ownership.

**Mutability:** Append-only (new version created on each configuration change).

**Storage:** PostgreSQL

---

## 4. Bot Runs / History

**Purpose:** Track each execution run of a trading bot for performance analytics.

**Required Fields:**
- `id` — uuid, primary key
- `bot_id` — uuid, FK → trading_bots.id
- `started_at` — timestamptz
- `ended_at` — timestamptz, nullable
- `status` — enum: running | completed | stopped | error
- `pnl` — numeric(18,8), nullable (server-calculated only)
- `trades_executed` — integer, default 0
- `error_message` — text, nullable
- `configuration_version` — integer

**Relationships:**
- Belongs to `trading_bots`

**Ownership:** Derived from bot ownership.

**Mutability:** Append-only. Runs are never modified after completion.

**Audit:** All run events logged in `audit_logs`.

**Storage:** PostgreSQL

---

## 5. Prediction Markets

**Purpose:** Store prediction market events available on the platform.

**Required Fields:**
- `id` — uuid, primary key
- `title` — varchar(512)
- `description` — text
- `category` — enum: finance | crypto | economy | technology | sports | world_events | other
- `image_url` — varchar(1024), nullable
- `status` — enum: open | suspended | closed | resolving | resolved_yes | resolved_no | voided
- `resolution_criteria` — text
- `resolution_source` — varchar(512)
- `yes_probability` — numeric(5,4), default 0.5
- `no_probability` — numeric(5,4), default 0.5
- `total_volume` — numeric(18,8), default 0
- `closes_at` — timestamptz
- `resolves_at` — timestamptz, nullable
- `resolution_deadline` — timestamptz, nullable
- `resolved_outcome` — enum: yes | no | void, nullable
- `created_at` — timestamptz
- `created_by` — uuid, FK → users.id (admin/operator)

**Relationships:**
- Has many `prediction_positions`
- Created by admin/operator

**Ownership:** Platform-owned. Customers participate but do not own markets.

**Mutability:** Status and probabilities are mutable. Resolution is append-only.

**Suggested API:**
- `GET /api/v1/prediction-markets`
- `GET /api/v1/prediction-markets/:id`

**Security/Permissions:** Read: all authenticated customers. Create/resolve: admin/operator only. Jurisdiction/eligibility checks required before participation.

**Audit:** Market creation, resolution, and cancellation logged in `audit_logs`.

**Storage:** PostgreSQL

---

## 6. Prediction Positions

**Purpose:** Store customer participation in prediction markets.

**Required Fields:**
- `id` — uuid, primary key
- `market_id` — uuid, FK → prediction_markets.id
- `user_id` — uuid, FK → users.id
- `side` — enum: yes | no
- `amount` — numeric(18,8) (locked from customer balance — server-authoritative)
- `currency` — varchar(8)
- `status` — enum: active | settled | cancelled | refunded
- `created_at` — timestamptz
- `settled_at` — timestamptz, nullable
- `payout_amount` — numeric(18,8), nullable (server-calculated only)

**Relationships:**
- Belongs to `prediction_markets`
- Belongs to `users`
- References `ledger_entries` for balance locking and settlement

**Ownership:** Per-user.

**Mutability:** Status is mutable. Amount is immutable after creation.

**Suggested API:**
- `POST /api/v1/prediction-markets/:id/positions`
- `GET  /api/v1/prediction-markets/positions`
- `GET  /api/v1/prediction-markets/history`

**Security/Permissions:** Customer can only view/create their own positions. Balance debit, locking, and settlement MUST be server-authoritative. Frontend must never compute or credit balances.

**Audit:** All position creation and settlement events logged in `audit_logs`.

**Storage:** PostgreSQL

---

## 7. Prediction Settlement

**Purpose:** Record the settlement outcome for each prediction market position.

**Required Fields:**
- `id` — uuid, primary key
- `position_id` — uuid, FK → prediction_positions.id
- `market_id` — uuid, FK → prediction_markets.id
- `user_id` — uuid, FK → users.id
- `outcome` — enum: won | lost | voided | refunded
- `original_amount` — numeric(18,8)
- `payout_amount` — numeric(18,8)
- `settled_at` — timestamptz
- `ledger_entry_id` — uuid, FK → ledger_entries.id (when payout credited)

**Relationships:**
- Belongs to `prediction_positions`
- References `ledger_entries`

**Ownership:** Per-user.

**Mutability:** Append-only. Settlement records are immutable.

**Audit:** All settlement events logged in `audit_logs`.

**Financial Ledger:** Payout credits MUST go through the immutable financial ledger.

**Storage:** PostgreSQL

---

## 8. Prediction Eligibility / Restrictions

**Purpose:** Store per-user, per-market eligibility determinations for prediction market participation. The backend performs jurisdiction and compliance checks.

**Required Fields:**
- `id` — uuid, primary key
- `user_id` — uuid, FK → users.id
- `market_id` — uuid, FK → prediction_markets.id
- `status` — enum: available | unavailable | region_restricted | kyc_required | account_restricted | market_closed | resolved | voided
- `message` — text (human-readable reason)
- `can_participate` — boolean
- `checked_at` — timestamptz
- `expires_at` — timestamptz, nullable (eligibility may be cached for a period)

**Relationships:**
- Belongs to `users`
- Belongs to `prediction_markets`

**Ownership:** Per-user, per-market.

**Mutability:** Mutable (eligibility can change as account status changes).

**Suggested API:**
- `GET /api/v1/prediction-markets/:id/eligibility`

**Security/Permissions:** Customer can only read their own eligibility. Backend performs jurisdiction checks. Frontend must never assume eligibility.

**Storage:** PostgreSQL (with possible Valkey cache for short-lived eligibility results)

---

## 9. Customer Preferences

**Purpose:** Store per-user application preferences including language, timezone, display currency, number formatting, chart preferences, and market default view.

**Required Fields:**
- `id` — uuid, primary key
- `user_id` — uuid, FK → users.id (UNIQUE)
- `language` — varchar(8), default 'en'
- `timezone` — varchar(64), default 'UTC'
- `display_currency` — varchar(8), default 'USD'
- `number_format` — varchar(16), default 'en-US'
- `market_default_view` — varchar(32), default 'all'
- `chart_type` — enum: candlestick | line | bar | area, default 'candlestick'
- `chart_interval` — varchar(8), default '1h'
- `show_pnl_in_header` — boolean, default true
- `compact_tables` — boolean, default false
- `theme` — enum: light | dark | system, default 'light'
- `created_at` — timestamptz
- `updated_at` — timestamptz

**Relationships:**
- Belongs to `users` (one-to-one)

**Ownership:** Per-user.

**Mutability:** Mutable.

**Suggested API:**
- `GET /api/v1/preferences`
- `PUT /api/v1/preferences`

**Security/Permissions:** Customer can only read/write their own preferences.

**Storage:** PostgreSQL

---

## 10. Theme Preference

**Purpose:** Theme preference is part of Customer Preferences (see §9). Stored as `theme` field.

**Values:** light | dark | system

**Default:** light

**Notes:**
- Unauthenticated users may use browser/system preference as fallback.
- Authenticated users load their stored preference from the backend.
- Theme switching must be immediate (no page reload required).
- The frontend applies the theme class to `<html>` element.

**Storage:** Part of `customer_preferences` table (PostgreSQL)

---

## 11. Notification Events

**Purpose:** Store notification events generated by the platform for delivery to users.

**Required Fields:**
- `id` — uuid, primary key
- `user_id` — uuid, FK → users.id
- `type` — enum: deposit_confirmed | withdrawal_pending | withdrawal_approved | withdrawal_rejected | profile_updated | kyc_approved | kyc_rejected | kyc_submitted | account_activated | account_suspended | security_login | security_password_changed | trade_filled | trade_cancelled | support_message | support_ticket_updated | dividend_eligible | dividend_paid | dividend_rejected | system_maintenance | system_announcement
- `category` — enum: account | security | trading | kyc | finance | support | system | dividend
- `severity` — enum: info | success | warning | critical
- `title` — varchar(256)
- `message` — text
- `source` — varchar(64), nullable (e.g. 'support', 'trading-engine')
- `related_entity` — varchar(128), nullable (e.g. conversation ID, order ID)
- `created_at` — timestamptz

**Relationships:**
- Belongs to `users`
- Has one `notification_state` per user

**Ownership:** Per-user. Notification events are user-specific.

**Mutability:** Append-only. Notification events are never modified.

**Storage:** PostgreSQL (event record) + Valkey (real-time delivery)

---

## 12. Per-user Notification State

**Purpose:** Track the read/dismiss state of each notification per user. This is separate from the notification event itself to support multi-device scenarios.

**CRITICAL DESIGN PRINCIPLE:**
- READ ≠ DISMISSED
- READ: The user has seen the notification.
- DISMISSED: The user intentionally removed it from their active feed.
- Historical record is ALWAYS retained regardless of read/dismiss state.
- Notification state is USER-SPECIFIC. Admin A reading notification X does NOT mark it read for Admin B.

**Required Fields:**
- `id` — uuid, primary key
- `notification_id` — uuid, FK → notifications.id
- `user_id` — uuid, FK → users.id
- `read_at` — timestamptz, nullable (null = unread)
- `dismissed_at` — timestamptz, nullable (null = not dismissed from active feed)
- `updated_at` — timestamptz

**Relationships:**
- Belongs to `notifications`
- Belongs to `users`

**Ownership:** Per-user.

**Mutability:** Mutable (read_at and dismissed_at can be set, but never cleared).

**Suggested API:**
- `GET  /api/v1/notifications`
- `GET  /api/v1/notifications/unread-count`
- `POST /api/v1/notifications/:id/read`
- `POST /api/v1/notifications/:id/dismiss`
- `POST /api/v1/notifications/read-all`

**Security/Permissions:** Customer can only read/update their own notification state.

**Storage:** PostgreSQL (persistent state) + Valkey (unread count cache)

---

## 13. Notification Read State

See §12 (Per-user Notification State) — `read_at` field.

**Notes:**
- Once read, a notification must NOT return as unread after page refresh, navigation, logout/login, or another device session.
- `read_at` is set once and never cleared.

---

## 14. Notification Dismissal

See §12 (Per-user Notification State) — `dismissed_at` field.

**Notes:**
- Dismissing a notification hides it from the active dashboard feed.
- Dismissed notifications MUST remain accessible in notification history.
- `dismissed_at` is set once and never cleared.
- Customer A dismissing a notification does NOT dismiss it for Customer B.
- An administrator may globally withdraw a notification (separate mechanism).

---

## 15. Dividend Programs

**Purpose:** Store dividend/benefit programs configured by administrators.

**Required Fields:**
- `id` — uuid, primary key
- `name` — varchar(256)
- `description` — text
- `period_start` — date
- `period_end` — date
- `claim_deadline` — timestamptz, nullable
- `status` — enum: draft | active | closed | expired
- `created_by` — uuid, FK → users.id (admin)
- `created_at` — timestamptz
- `updated_at` — timestamptz

**Relationships:**
- Has many `dividend_eligibility` records
- Has many `dividend_claims`

**Ownership:** Platform-owned. Administered by authorized staff only.

**Mutability:** Mutable (status can change). Period and amounts are immutable after activation.

**Security/Permissions:** Read: eligible customers (their own eligibility only). Create/manage: admin only.

**Storage:** PostgreSQL

---

## 16. Dividend Eligibility

**Purpose:** Store per-user eligibility determinations for dividend programs. Eligibility is backend-controlled and never computed by the frontend.

**Required Fields:**
- `id` — uuid, primary key
- `user_id` — uuid, FK → users.id
- `program_id` — uuid, FK → dividend_programs.id
- `status` — enum: not_evaluated | under_review | eligible | not_eligible | claim_available | claim_submitted | processing | paid | rejected
- `employment_status` — enum: employed | self_employed | retired | unemployed | other, nullable
- `eligible_amount` — numeric(18,8), nullable (backend-determined only)
- `currency` — varchar(8), nullable
- `evaluated_at` — timestamptz, nullable
- `next_review_at` — timestamptz, nullable
- `notes` — text, nullable (internal)

**Relationships:**
- Belongs to `users`
- Belongs to `dividend_programs`

**Ownership:** Per-user, per-program.

**Mutability:** Mutable (status and amount can change as eligibility is reviewed).

**IMPORTANT:** The frontend MUST NOT compute or display eligibility amounts. All amounts are backend-authoritative.

**Suggested API:**
- `GET /api/v1/dividends/eligibility`

**Storage:** PostgreSQL

---

## 17. Dividend Claims

**Purpose:** Store customer-submitted dividend claims.

**Required Fields:**
- `id` — uuid, primary key
- `user_id` — uuid, FK → users.id
- `program_id` — uuid, FK → dividend_programs.id
- `eligibility_id` — uuid, FK → dividend_eligibility.id
- `status` — enum: submitted | under_review | approved | processing | paid | rejected | expired
- `claimed_amount` — numeric(18,8), nullable (backend-determined)
- `currency` — varchar(8)
- `destination_account_id` — uuid, FK → accounts.id
- `declaration_accepted` — boolean, NOT NULL
- `declaration_accepted_at` — timestamptz
- `submitted_at` — timestamptz
- `processed_at` — timestamptz, nullable
- `reference` — varchar(64), unique
- `notes` — text, nullable

**Relationships:**
- Belongs to `users`
- Belongs to `dividend_programs`
- Belongs to `dividend_eligibility`
- References `accounts` (destination)

**Ownership:** Per-user.

**Mutability:** Status is mutable. Amount and declaration are immutable after submission.

**Suggested API:**
- `GET  /api/v1/dividends/claims`
- `POST /api/v1/dividends/claims`
- `GET  /api/v1/dividends/claims/:id`

**Security/Permissions:** Customer can only view/submit their own claims. Approval requires admin authorization. Frontend must never compute or credit amounts.

**Audit:** All claim events logged in `audit_logs`.

**Storage:** PostgreSQL

---

## 18. Dividend Payments

**Purpose:** Record actual dividend payments made to customers.

**Required Fields:**
- `id` — uuid, primary key
- `claim_id` — uuid, FK → dividend_claims.id
- `user_id` — uuid, FK → users.id
- `amount` — numeric(18,8)
- `currency` — varchar(8)
- `paid_at` — timestamptz
- `ledger_entry_id` — uuid, FK → ledger_entries.id
- `reference` — varchar(64), unique

**Relationships:**
- Belongs to `dividend_claims`
- Belongs to `users`
- References `ledger_entries`

**Ownership:** Per-user.

**Mutability:** Append-only. Payment records are immutable.

**Financial Ledger:** All payments MUST go through the immutable financial ledger.

**Audit:** All payment events logged in `audit_logs`.

**Storage:** PostgreSQL

---

## 19. Support Notification Integration

**Purpose:** Ensure unread support conversations generate notifications that integrate with the global notification system.

**Design:**
- When a support agent sends a message, a `support_message` notification event is created for the customer.
- When the customer opens the conversation, the associated notification is marked as read.
- The same notification must NOT be repeatedly generated as unread after it has been read.
- Support unread count must be reflected in both the Support nav badge and the notification bell.

**Required Fields (on notification_events):**
- `type` = 'support_message'
- `category` = 'support'
- `source` = 'support'
- `related_entity` = conversation_id

**Deduplication Rule:**
- Only one unread `support_message` notification per conversation at a time.
- Opening a conversation marks all associated support notifications as read.

**Suggested API:**
- `POST /api/v1/notifications/:id/read` (called when conversation is opened)

**Storage:** Part of notification system (PostgreSQL + Valkey)

---

## 20. Support Conversation Persistence

**Purpose:** Store customer support conversations and messages for the Support (Messages) page.

**Required Fields (conversations):**
- `id` — uuid, primary key
- `customer_id` — uuid, FK → users.id
- `agent_id` — uuid, FK → users.id, nullable
- `status` — enum: open | waiting | resolved | closed
- `subject` — varchar(256), nullable
- `created_at` — timestamptz
- `updated_at` — timestamptz
- `last_message_at` — timestamptz, nullable
- `unread_count_customer` — integer, default 0
- `unread_count_agent` — integer, default 0

**Required Fields (messages):**
- `id` — uuid, primary key
- `conversation_id` — uuid, FK → support_conversations.id
- `sender_id` — uuid, FK → users.id
- `sender_type` — enum: customer | agent | system
- `content` — text
- `created_at` — timestamptz
- `read_at` — timestamptz, nullable

**Relationships:**
- Conversation belongs to `users` (customer)
- Conversation belongs to `users` (agent, nullable)
- Message belongs to `support_conversations`

**Ownership:** Per-customer conversation. Agent assigned by platform.

**Mutability:** Messages are append-only. Conversation status is mutable.

**Suggested API:**
- `GET  /api/v1/support/conversations`
- `GET  /api/v1/support/conversations/:id`
- `POST /api/v1/support/conversations/:id/messages`

**Security/Permissions:** Customer can only view their own conversations. Agents can view assigned conversations. Admin can view all.

**Storage:** PostgreSQL (with Valkey for real-time message delivery)

---

## 21. Customer Programs

**Purpose:** Track which benefit programs are available to a customer, their enrollment status, and program configuration. Programs include Deposit Bonus, Referral, Crypto Lending, and Dividend.

**Suggested Table:** `customer_programs`

**Required Fields:**
- `id` — uuid, primary key
- `user_id` — uuid, FK → users.id (NOT NULL)
- `program_type` — enum: deposit_bonus | referral | lending | dividend
- `program_id` — uuid, FK → program configuration table (type-specific)
- `status` — enum: available | activated | used | expired | not_eligible
- `enrolled_at` — timestamptz, nullable
- `expires_at` — timestamptz, nullable
- `metadata` — jsonb, program-specific data
- `created_at` — timestamptz
- `updated_at` — timestamptz

**Relationships:** Belongs to `users`. References type-specific program configuration.

**Ownership:** Per-customer. Managed by platform admin.

**Mutability:** Status is mutable. Enrollment events are append-only audit log.

**Storage:** PostgreSQL

**API Requirements:**
- `GET  /api/v1/programs` — list available programs for authenticated customer
- `GET  /api/v1/programs/:type` — get specific program details

**Permissions:** Customer reads own programs. Admin manages program availability.

**Audit Events:** program_enrolled, program_activated, program_expired, program_status_changed

**Ledger Interaction:** Bonus credits and rewards must integrate with the double-entry financial ledger.

---

## 22. Deposit Bonus Programs

**Purpose:** Define configurable deposit bonus programs. Bonus percentage, minimum deposit, maximum bonus, and eligible deposit types are all backend-configured — never hardcoded on the frontend.

**Suggested Table:** `deposit_bonus_programs`

**Required Fields:**
- `id` — uuid, primary key
- `name` — varchar(255)
- `description` — text
- `bonus_percentage` — numeric(5,2), nullable (null = TBD / admin-set)
- `minimum_deposit` — numeric(18,8) NOT NULL
- `maximum_bonus` — numeric(18,8), nullable
- `eligible_deposit_types` — text[], e.g. ['bank_transfer', 'crypto']
- `valid_from` — timestamptz NOT NULL
- `valid_until` — timestamptz, nullable
- `is_active` — boolean, default true
- `terms` — text
- `created_at` — timestamptz
- `updated_at` — timestamptz

**Relationships:** Referenced by `customer_programs`.

**Ownership:** Platform-managed. Admin creates and configures programs.

**Mutability:** Program configuration is mutable by admin. Customer enrollment is append-only.

**Storage:** PostgreSQL

**API Requirements:**
- `GET  /api/v1/programs/deposit-bonus` — get active deposit bonus program for customer
- `POST /api/v1/programs/deposit-bonus/activate` — customer activates bonus

**Permissions:** Admin manages programs. Customer reads active programs.

**Audit Events:** deposit_bonus_created, deposit_bonus_activated, deposit_bonus_credited

**Ledger Interaction:** Bonus credit must be recorded as a double-entry ledger transaction (debit: platform bonus expense, credit: customer account).

---

## 23. Customer Bonus Enrollment

**Purpose:** Track individual customer enrollment and usage of deposit bonus programs.

**Suggested Table:** `customer_bonus_enrollments`

**Required Fields:**
- `id` — uuid, primary key
- `user_id` — uuid, FK → users.id
- `program_id` — uuid, FK → deposit_bonus_programs.id
- `status` — enum: pending | active | credited | expired | cancelled
- `qualifying_deposit_id` — uuid, FK → deposits.id, nullable
- `qualifying_deposit_amount` — numeric(18,8), nullable
- `bonus_amount` — numeric(18,8), nullable (set by backend on qualification)
- `credited_at` — timestamptz, nullable
- `expires_at` — timestamptz, nullable
- `created_at` — timestamptz
- `updated_at` — timestamptz

**Relationships:** Belongs to `users` and `deposit_bonus_programs`.

**Ownership:** Per-customer. Backend-authoritative.

**Mutability:** Status transitions are append-only audit log. Bonus amount set by backend only.

**Storage:** PostgreSQL

**Ledger Interaction:** Bonus credit is a ledger transaction. Frontend must never set bonus_amount.

---

## 24. Referral Programs

**Purpose:** Define configurable referral reward programs. Reward amounts and qualification criteria are backend-configured.

**Suggested Table:** `referral_programs`

**Required Fields:**
- `id` — uuid, primary key
- `name` — varchar(255)
- `description` — text
- `reward_type` — enum: fixed | percentage
- `reward_amount` — numeric(18,8), nullable (backend-configured)
- `reward_currency` — varchar(10)
- `qualification_criteria` — jsonb (e.g. min_deposit, kyc_required, min_trades)
- `is_active` — boolean, default true
- `valid_from` — timestamptz
- `valid_until` — timestamptz, nullable
- `terms` — text
- `created_at` — timestamptz
- `updated_at` — timestamptz

**Ownership:** Platform-managed.

**Storage:** PostgreSQL

**API Requirements:**
- `GET  /api/v1/referrals/me` — get customer referral program details and stats
- `GET  /api/v1/referrals` — get referral history
- `POST /api/v1/referrals/invite` — send referral invitation

---

## 25. Referral Relationships

**Purpose:** Track referrer → referred customer relationships.

**Suggested Table:** `referral_relationships`

**Required Fields:**
- `id` — uuid, primary key
- `referrer_id` — uuid, FK → users.id (the referring customer)
- `referred_id` — uuid, FK → users.id (the new customer)
- `referral_code` — varchar(64)
- `program_id` — uuid, FK → referral_programs.id
- `status` — enum: pending | qualified | rewarded | expired | cancelled
- `qualified_at` — timestamptz, nullable
- `created_at` — timestamptz
- `updated_at` — timestamptz

**Relationships:** Both referrer and referred belong to `users`.

**Ownership:** Per-customer pair. Backend-authoritative.

**Mutability:** Status transitions are append-only audit log.

**Storage:** PostgreSQL

**Audit Events:** referral_created, referral_qualified, referral_rewarded, referral_expired

---

## 26. Referral Rewards

**Purpose:** Track reward amounts owed and paid to referrers.

**Suggested Table:** `referral_rewards`

**Required Fields:**
- `id` — uuid, primary key
- `referral_relationship_id` — uuid, FK → referral_relationships.id
- `referrer_id` — uuid, FK → users.id
- `program_id` — uuid, FK → referral_programs.id
- `amount` — numeric(18,8) (backend-set only)
- `currency` — varchar(10)
- `status` — enum: pending | approved | processing | paid | rejected | cancelled
- `approved_by` — uuid, FK → users.id (admin), nullable
- `approved_at` — timestamptz, nullable
- `paid_at` — timestamptz, nullable
- `ledger_transaction_id` — uuid, nullable (FK → financial ledger)
- `created_at` — timestamptz
- `updated_at` — timestamptz

**Ownership:** Per-referrer. Backend-authoritative.

**Mutability:** Amount set by backend only. Status transitions are append-only audit log.

**Storage:** PostgreSQL

**Ledger Interaction:** Reward payment must be a double-entry ledger transaction. Frontend must never set reward amounts.

**Audit Events:** referral_reward_created, referral_reward_approved, referral_reward_paid

---

## 27. Lending Programs

**Purpose:** Define configurable crypto lending programs. APY/rates are backend/provider-configured — never hardcoded on the frontend.

**Suggested Table:** `lending_programs`

**Required Fields:**
- `id` — uuid, primary key
- `name` — varchar(255)
- `description` — text
- `asset_symbol` — varchar(20) (e.g. BTC, USDC)
- `apy_rate` — numeric(8,4), nullable (null = TBD / provider-set)
- `term_type` — enum: flexible | fixed
- `term_days` — integer, nullable (null for flexible)
- `minimum_amount` — numeric(18,8) NOT NULL
- `maximum_amount` — numeric(18,8), nullable
- `available_liquidity` — numeric(18,8)
- `risk_level` — enum: low | medium | high
- `status` — enum: available | paused | closed
- `terms` — text
- `risk_disclosure` — text
- `created_at` — timestamptz
- `updated_at` — timestamptz

**Ownership:** Platform-managed. Admin creates and configures programs.

**Storage:** PostgreSQL

**API Requirements:**
- `GET  /api/v1/lending/programs` — list available lending programs

**Permissions:** Admin manages. Customer reads available programs.

---

## 28. Lending Positions

**Purpose:** Track customer lending positions. Principal and accrued amounts are backend-authoritative.

**Suggested Table:** `lending_positions`

**Required Fields:**
- `id` — uuid, primary key
- `user_id` — uuid, FK → users.id
- `program_id` — uuid, FK → lending_programs.id
- `asset_symbol` — varchar(20)
- `principal_amount` — numeric(18,8) NOT NULL (set by backend on confirmation)
- `current_rate` — numeric(8,4), nullable (rate at time of opening)
- `status` — enum: pending | active | maturing | completed | cancelled | defaulted
- `opened_at` — timestamptz, nullable
- `maturity_date` — timestamptz, nullable
- `closed_at` — timestamptz, nullable
- `ledger_debit_id` — uuid, nullable (FK → financial ledger, principal debit)
- `ledger_credit_id` — uuid, nullable (FK → financial ledger, principal return)
- `created_at` — timestamptz
- `updated_at` — timestamptz

**Relationships:** Belongs to `users` and `lending_programs`.

**Ownership:** Per-customer. Backend-authoritative.

**Mutability:** Status transitions are append-only audit log. Principal set by backend only.

**Storage:** PostgreSQL

**API Requirements:**
- `GET  /api/v1/lending/positions` — list customer lending positions
- `POST /api/v1/lending/positions` — open new lending position
- `POST /api/v1/lending/positions/:id/close` — close/withdraw lending position

**Permissions:** Customer reads/manages own positions. Admin can view all.

**Audit Events:** lending_position_opened, lending_position_closed, lending_position_defaulted

**Ledger Interaction:** Opening a position debits customer account (principal). Closing credits principal return. Interest/accrual is a separate ledger entry. Frontend must never modify balances.

---

## 29. Lending Accrual / Settlement

**Purpose:** Track interest accrual and settlement for lending positions. All amounts are backend-calculated.

**Suggested Table:** `lending_accruals`

**Required Fields:**
- `id` — uuid, primary key
- `position_id` — uuid, FK → lending_positions.id
- `user_id` — uuid, FK → users.id
- `accrual_date` — date NOT NULL
- `accrual_amount` — numeric(18,8) NOT NULL (backend-calculated only)
- `rate_applied` — numeric(8,4)
- `status` — enum: accrued | settled | reversed
- `settled_at` — timestamptz, nullable
- `ledger_transaction_id` — uuid, nullable (FK → financial ledger)
- `created_at` — timestamptz

**Ownership:** Per-position. Backend-authoritative. Append-only.

**Mutability:** Accrual records are append-only. Status transitions only.

**Storage:** PostgreSQL

**Ledger Interaction:** Each settled accrual is a double-entry ledger transaction (debit: lending interest expense, credit: customer account). Frontend must never set accrual amounts.

**Audit Events:** lending_accrual_created, lending_accrual_settled, lending_accrual_reversed

---

## Financial Settlement Rules (Programs)

**Deposit Bonus Credits:**
- Triggered by qualifying deposit confirmation (backend event)
- Recorded as double-entry ledger: debit platform bonus expense → credit customer account
- Frontend must never directly credit accounts

**Referral Rewards:**
- Triggered by referral qualification (backend event)
- Requires admin approval before payment
- Recorded as double-entry ledger: debit platform referral expense → credit referrer account
- Frontend must never set reward amounts

**Lending Principal:**
- Debited from customer account on position open (backend-authoritative)
- Credited back on position close/maturity
- All amounts set by backend only

**Lending Interest:**
- Accrued daily by backend calculation
- Settled to customer account per program terms
- Recorded as double-entry ledger entries
- Frontend displays accrued amounts from API only

**Dividend Payments:**
- Governed by existing dividend.service.ts architecture
- All amounts backend-authoritative
- Recorded as double-entry ledger entries
- Frontend must never modify balances

---

## 30. Customer Profile Persistence

**Purpose:** Store the complete customer profile including personal information, employment status, address, and financial preferences. This is the authoritative customer identity record.

**Suggested Table:** `customer_profiles`

**Required Fields:**
- `id` — uuid, primary key
- `user_id` — uuid, FK → users.id (UNIQUE, NOT NULL)
- `first_name` — varchar(128) NOT NULL
- `last_name` — varchar(128) NOT NULL
- `email` — varchar(256) NOT NULL (read-only after creation, change via support)
- `phone` — varchar(32)
- `phone_country_code` — varchar(8)
- `date_of_birth` — date
- `nationality` — varchar(128)
- `country` — varchar(128)
- `address` — varchar(512)
- `city` — varchar(128)
- `postal_code` — varchar(32)
- `occupation` — varchar(256)
- `employer_name` — varchar(256)
- `employment_status` — enum: employed | self_employed | retired | unemployed | student | other
- `annual_income_range` — varchar(64)
- `preferred_currency` — varchar(16)
- `language` — varchar(16)
- `timezone` — varchar(64)
- `account_status` — enum: active | suspended | restricted | closed | pending
- `account_type` — varchar(64)
- `member_since` — date
- `created_at` — timestamptz NOT NULL
- `updated_at` — timestamptz NOT NULL

**Relationships:**
- Belongs to `users` (1:1)
- Referenced by KYC, dividend eligibility, program eligibility

**Ownership:** Per-user. Customer can update personal fields. Sensitive fields (email, account_status) require admin/support authorization.

**Mutability:** Mutable. All changes are audited.

**API Requirements:**
- `GET /api/v1/me/profile` — get current customer profile
- `PUT /api/v1/me/profile/personal` — update personal information
- `PUT /api/v1/me/profile/employment` — update employment information
- `PUT /api/v1/me/profile/preferences` — update preferences

**Permissions:** Customer reads/updates own profile. Admin can view and update with audit trail.

**Audit Events:** profile_personal_updated, profile_employment_updated, profile_preferences_updated

**Storage:** PostgreSQL

---

## 31. Employment Status

**Purpose:** Track customer employment status as one eligibility signal for backend program rules. Employment status alone does not grant program eligibility.

**Note:** Employment status is stored as part of `customer_profiles.employment_status`.

**Possible Values:**
- `employed` — Full-time or part-time employment
- `self_employed` — Self-employed or business owner
- `retired` — Retired (does NOT automatically grant dividend eligibility)
- `unemployed` — Currently unemployed
- `student` — Student
- `other` — Other employment situation

**Eligibility Rule:** Backend determines program eligibility using employment status as one of multiple signals (account status, KYC, jurisdiction, admin authorization). Frontend must never derive eligibility from employment status alone.

---

## 32. Customer Financial Preferences

**Purpose:** Store customer display and trading preferences. Separate from profile identity fields.

**Note:** Preferences are stored as part of `customer_profiles` or a separate `customer_preferences` table depending on implementation.

**Required Fields:**
- `preferred_currency` — ISO currency code
- `language` — ISO language code
- `timezone` — IANA timezone string
- `number_format` — locale string (e.g. en-US, de-DE)
- `market_default_view` — enum: all | forex | crypto | indices | commodities
- `chart_type` — enum: candlestick | line | bar | area
- `chart_interval` — varchar(8)
- `show_pnl_in_header` — boolean
- `compact_tables` — boolean

**API Requirements:**
- `GET /api/v1/me/preferences`
- `PUT /api/v1/me/preferences`

---

## 33. Deposit Requests

**Purpose:** Track all customer deposit requests from submission through completion.

**Suggested Table:** `deposit_requests`

**Required Fields:**
- `id` — uuid, primary key
- `user_id` — uuid, FK → users.id NOT NULL
- `method_id` — uuid, FK → deposit_methods.id
- `currency` — varchar(16) NOT NULL
- `amount` — numeric(18,8) NOT NULL
- `fee` — numeric(18,8) NOT NULL default 0
- `net_amount` — numeric(18,8) NOT NULL (amount - fee, backend-calculated)
- `status` — enum: draft | submitted | pending | processing | completed | failed | cancelled | rejected
- `reference` — varchar(128) UNIQUE (platform reference)
- `external_reference` — varchar(256) (payment provider reference)
- `instructions` — text (deposit instructions shown to customer)
- `ledger_transaction_id` — uuid, nullable (FK → financial ledger, set on completion)
- `submitted_at` — timestamptz
- `processed_at` — timestamptz, nullable
- `created_at` — timestamptz NOT NULL
- `updated_at` — timestamptz NOT NULL

**Relationships:**
- Belongs to `users`
- References `deposit_methods`
- References financial ledger on completion

**Ownership:** Per-user. Customer can view own deposits. Admin can view and manage all.

**Status Lifecycle:** draft → submitted → pending → processing → completed | failed | cancelled | rejected

**Mutability:** Status transitions only. Amount and method are immutable after submission.

**API Requirements:**
- `GET  /api/v1/me/deposits` — list customer deposits
- `POST /api/v1/me/deposits` — submit deposit request
- `GET  /api/v1/me/deposits/:id` — get specific deposit

**Permissions:** Customer reads own deposits. Admin manages all.

**Audit Events:** deposit_submitted, deposit_processing, deposit_completed, deposit_failed, deposit_rejected

**Ledger Interaction:** On completion, backend creates double-entry ledger: debit payment received → credit customer account. Frontend must never credit balances.

**Storage:** PostgreSQL

---

## 34. Withdrawal Requests

**Purpose:** Track all customer withdrawal requests from submission through completion or rejection.

**Suggested Table:** `withdrawal_requests`

**Required Fields:**
- `id` — uuid, primary key
- `user_id` — uuid, FK → users.id NOT NULL
- `destination_id` — uuid, FK → withdrawal_destinations.id
- `currency` — varchar(16) NOT NULL
- `amount` — numeric(18,8) NOT NULL
- `fee` — numeric(18,8) NOT NULL default 0
- `net_amount` — numeric(18,8) NOT NULL (backend-calculated)
- `status` — enum: draft | submitted | pending_review | approved | processing | completed | rejected | cancelled | failed
- `reference` — varchar(128) UNIQUE
- `security_verification_type` — varchar(64) (2fa, otp, etc.)
- `reviewed_by` — uuid, nullable (FK → staff users)
- `review_note` — text, nullable
- `ledger_transaction_id` — uuid, nullable
- `submitted_at` — timestamptz
- `reviewed_at` — timestamptz, nullable
- `processed_at` — timestamptz, nullable
- `created_at` — timestamptz NOT NULL
- `updated_at` — timestamptz NOT NULL

**Relationships:**
- Belongs to `users`
- References `withdrawal_destinations`
- References financial ledger on completion

**Ownership:** Per-user. Customer views own withdrawals. Admin reviews and approves.

**Status Lifecycle:** draft → submitted → pending_review → approved → processing → completed | rejected | cancelled | failed

**Mutability:** Status transitions only. Amount and destination are immutable after submission.

**API Requirements:**
- `GET  /api/v1/me/withdrawals` — list customer withdrawals
- `POST /api/v1/me/withdrawals` — submit withdrawal request
- `GET  /api/v1/me/withdrawals/:id` — get specific withdrawal

**Permissions:** Customer reads own withdrawals. Admin reviews and approves.

**Audit Events:** withdrawal_submitted, withdrawal_approved, withdrawal_rejected, withdrawal_completed, withdrawal_failed

**Ledger Interaction:** On approval, backend reserves funds. On completion, double-entry: debit customer account → credit payment sent. Frontend must never debit balances.

**Storage:** PostgreSQL

---

## 35. Transfer Requests

**Purpose:** Track internal and wallet-to-wallet transfer requests. Transfer is distinct from withdrawal.

**Suggested Table:** `transfer_requests`

**Required Fields:**
- `id` — uuid, primary key
- `user_id` — uuid, FK → users.id NOT NULL
- `type` — enum: internal_account | wallet_to_wallet | customer_transfer
- `currency` — varchar(16) NOT NULL
- `amount` — numeric(18,8) NOT NULL
- `fee` — numeric(18,8) NOT NULL default 0
- `net_amount` — numeric(18,8) NOT NULL
- `source_account_id` — uuid, nullable
- `destination_account_id` — uuid, nullable
- `destination_reference` — varchar(256), nullable
- `status` — enum: draft | submitted | pending_review | processing | completed | failed | cancelled | rejected
- `reference` — varchar(128) UNIQUE
- `note` — text, nullable
- `ledger_transaction_id` — uuid, nullable
- `created_at` — timestamptz NOT NULL
- `updated_at` — timestamptz NOT NULL

**Relationships:**
- Belongs to `users`
- References financial ledger on completion

**Ownership:** Per-user. Customer views own transfers. Admin can view all.

**Status Lifecycle:** draft → submitted → pending_review → processing → completed | failed | cancelled | rejected

**API Requirements:**
- `GET  /api/v1/me/transfers` — list customer transfers
- `POST /api/v1/me/transfers` — submit transfer request
- `GET  /api/v1/me/transfers/:id` — get specific transfer

**Permissions:** Customer reads own transfers. Admin manages all.

**Audit Events:** transfer_submitted, transfer_processing, transfer_completed, transfer_failed

**Ledger Interaction:** Double-entry: debit source account → credit destination account. Frontend must never modify balances.

**Storage:** PostgreSQL

---

## 36. Funding Methods

**Purpose:** Store platform-configured deposit methods available to customers. Methods are configured by admin, not by customers.

**Suggested Table:** `deposit_methods`

**Required Fields:**
- `id` — uuid, primary key
- `type` — enum: bank_transfer | card | crypto | other
- `label` — varchar(128) NOT NULL
- `description` — text
- `minimum_amount` — numeric(18,8), nullable (null = no minimum)
- `maximum_amount` — numeric(18,8), nullable
- `fee_description` — varchar(256), nullable
- `processing_time` — varchar(128), nullable
- `currencies` — varchar[] (supported currencies)
- `enabled` — boolean NOT NULL default true
- `jurisdiction_restrictions` — varchar[] (restricted jurisdictions)
- `created_at` — timestamptz NOT NULL
- `updated_at` — timestamptz NOT NULL

**Ownership:** Platform-level. Admin manages. Customer reads available methods only.

**API Requirements:**
- `GET /api/v1/deposits/methods` — list available deposit methods for current customer

**Permissions:** Admin creates/updates methods. Customer reads enabled methods only.

**Storage:** PostgreSQL

---

## 37. Withdrawal Destinations

**Purpose:** Store customer-registered withdrawal destinations (bank accounts, crypto addresses). Destinations must be verified before use.

**Suggested Table:** `withdrawal_destinations`

**Required Fields:**
- `id` — uuid, primary key
- `user_id` — uuid, FK → users.id NOT NULL
- `type` — enum: bank_account | crypto_address | saved_destination
- `label` — varchar(128) NOT NULL
- `details` — varchar(512) NOT NULL (masked for display)
- `currency` — varchar(16)
- `verified` — boolean NOT NULL default false
- `verified_at` — timestamptz, nullable
- `verified_by` — uuid, nullable (FK → staff users)
- `active` — boolean NOT NULL default true
- `created_at` — timestamptz NOT NULL
- `updated_at` — timestamptz NOT NULL

**Ownership:** Per-user. Customer manages own destinations. Admin verifies.

**Mutability:** Destinations are immutable after verification. New destination required for changes.

**API Requirements:**
- `GET  /api/v1/me/withdrawal-destinations` — list customer destinations
- `POST /api/v1/me/withdrawal-destinations` — add new destination

**Permissions:** Customer reads/adds own destinations. Admin verifies.

**Audit Events:** destination_added, destination_verified, destination_deactivated

**Storage:** PostgreSQL

---

## 38. Financial Action Status History

**Purpose:** Append-only audit trail of all status transitions for deposits, withdrawals, and transfers.

**Suggested Table:** `financial_action_status_history`

**Required Fields:**
- `id` — uuid, primary key
- `action_type` — enum: deposit | withdrawal | transfer
- `action_id` — uuid NOT NULL (FK to respective table)
- `user_id` — uuid, FK → users.id
- `from_status` — varchar(64)
- `to_status` — varchar(64) NOT NULL
- `changed_by` — uuid, nullable (FK → users, null = system)
- `note` — text, nullable
- `created_at` — timestamptz NOT NULL

**Ownership:** System-generated. Append-only. No updates or deletes.

**Mutability:** Append-only. Immutable after creation.

**Storage:** PostgreSQL

**Audit Events:** All status transitions are themselves audit events.

---

## Financial Balance Authority

**CRITICAL RULE:** Frontend must NEVER directly change a customer's authoritative balance.

**Required Flow:**
1. Customer submits financial action (deposit/withdrawal/transfer)
2. Backend validates all rules (KYC, limits, restrictions, security)
3. Backend creates financial ledger entry (double-entry)
4. Balance/read model updates from ledger
5. Frontend refreshes balance from API

**No client-side balance manipulation is permitted under any circumstances.**

All balance values displayed on the frontend must come from backend API responses.
