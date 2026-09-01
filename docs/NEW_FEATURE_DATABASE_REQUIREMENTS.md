// NEW FEATURE DATABASE REQUIREMENTS
// Trade Console — Frontend Feature Additions
// Generated: September 2026
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
8. Customer Preferences
9. Theme Preference
10. Notification State
11. Notification Read State
12. Notification Dismissal
13. Dividend Programs
14. Dividend Eligibility
15. Dividend Claims
16. Dividend Payments
17. Support Notification Integration

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
- `bot_type` — enum: grid | dca | momentum | custom
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

**Purpose:** Store the versioned configuration parameters for each bot.

**Required Fields:**
- `id` — uuid, primary key
- `bot_id` — uuid, FK → trading_bots.id
- `leverage` — numeric(5,2), nullable
- `lower_bound` — numeric(18,8), nullable
- `upper_bound` — numeric(18,8), nullable
- `grid_count` — integer, nullable
- `investment_amount` — numeric(18,8)
- `investment_currency` — varchar(8)
- `stop_loss_percentage` — numeric(5,2), nullable
- `take_profit_percentage` — numeric(5,2), nullable
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
- `status` — enum: open | closed | resolved | cancelled
- `resolution_criteria` — text
- `yes_probability` — numeric(5,4), default 0.5
- `no_probability` — numeric(5,4), default 0.5
- `total_volume` — numeric(18,8), default 0
- `closes_at` — timestamptz
- `resolves_at` — timestamptz, nullable
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

**Purpose:** Record the settlement of prediction market positions.

**Required Fields:**
- `id` — uuid, primary key
- `market_id` — uuid, FK → prediction_markets.id
- `position_id` — uuid, FK → prediction_positions.id
- `user_id` — uuid, FK → users.id
- `outcome` — enum: won | lost | void
- `payout_amount` — numeric(18,8)
- `currency` — varchar(8)
- `settled_at` — timestamptz
- `ledger_transaction_id` — uuid, FK → ledger_transactions.id

**Relationships:**
- Belongs to `prediction_markets`
- Belongs to `prediction_positions`
- References `ledger_transactions`

**Ownership:** System-generated. Not user-modifiable.

**Mutability:** Append-only. Immutable after creation.

**Audit:** All settlements logged in `audit_logs`.

**Storage:** PostgreSQL

---

## 8. Customer Preferences

**Purpose:** Store per-user display and platform preferences.

**Required Fields:**
- `id` — uuid, primary key
- `user_id` — uuid, FK → users.id, UNIQUE
- `language` — varchar(8), default 'en'
- `timezone` — varchar(64), default 'UTC'
- `display_currency` — varchar(8), default 'USD'
- `number_format` — varchar(16), default 'en-US'
- `market_default_view` — varchar(32), default 'all'
- `chart_type` — varchar(32), default 'candlestick'
- `chart_interval` — varchar(8), default '1h'
- `show_pnl_in_header` — boolean, default true
- `compact_tables` — boolean, default false
- `updated_at` — timestamptz

**Relationships:**
- Belongs to `users` (one-to-one)

**Ownership:** Per-user.

**Mutability:** Mutable.

**Suggested API:**
- `GET /api/v1/preferences`
- `PUT /api/v1/preferences`

**Security/Permissions:** User can only read/write their own preferences.

**Storage:** PostgreSQL

---

## 9. Theme Preference

**Purpose:** Store the user's selected theme (light/dark/system).

**Implementation Note:** Theme preference can be stored as a field in `customer_preferences` rather than a separate table.

**Required Field (addition to customer_preferences):**
- `theme` — enum: light | dark | system, default 'light'

**Ownership:** Per-user.

**Mutability:** Mutable.

**Suggested API:**
- `POST /api/v1/preferences/theme`

**Security/Permissions:** User can only read/write their own theme.

**Audit:** Not required.

**Storage:** PostgreSQL (as part of customer_preferences)

---

## 10. Notification State

**Purpose:** Store platform notifications and their per-user state.

**IMPORTANT DESIGN PRINCIPLE:**
- READ ≠ DISMISSED
- READ: The user has seen the notification.
- DISMISSED: The user intentionally removed it from their active feed.
- Historical record is ALWAYS retained regardless of read/dismiss state.
- Notification state is USER-SPECIFIC. Admin A reading notification X does NOT mark it read for Admin B.

**notifications table:**
- `id` — uuid, primary key
- `type` — varchar(64) (e.g. deposit_confirmed, kyc_approved, security_login)
- `category` — enum: account | security | trading | kyc | finance | support | system | dividend
- `severity` — enum: info | success | warning | critical
- `title` — varchar(256)
- `message` — text
- `source` — varchar(64), nullable
- `related_entity_id` — uuid, nullable
- `related_entity_type` — varchar(64), nullable
- `target_user_id` — uuid, nullable (null = broadcast to all)
- `target_role` — varchar(64), nullable (null = all roles)
- `created_at` — timestamptz
- `expires_at` — timestamptz, nullable

**Relationships:**
- Has many `notification_user_states`

**Ownership:** Platform-generated. Not user-modifiable.

**Mutability:** Append-only. Notifications are never modified after creation.

**Storage:** PostgreSQL

---

## 11. Notification Read State

**Purpose:** Track per-user read state for each notification.

**notification_user_states table:**
- `id` — uuid, primary key
- `notification_id` — uuid, FK → notifications.id
- `user_id` — uuid, FK → users.id
- `read_at` — timestamptz, nullable (null = unread)
- `dismissed_at` — timestamptz, nullable (null = not dismissed from active feed)
- UNIQUE constraint on (notification_id, user_id)

**Relationships:**
- Belongs to `notifications`
- Belongs to `users`

**Ownership:** Per-user. Each user has their own read/dismiss state.

**Mutability:** read_at and dismissed_at are set once and never cleared.

**Suggested API:**
- `GET  /api/v1/notifications`
- `GET  /api/v1/notifications/unread-count`
- `POST /api/v1/notifications/:id/read`
- `POST /api/v1/notifications/:id/dismiss`
- `POST /api/v1/notifications/read-all`

**Security/Permissions:** User can only read/update their own notification state. Admin can view all notification states for support/audit.

**Audit:** Notification read and dismiss events should be logged in `audit_logs`.

**Storage:** PostgreSQL

---

## 12. Notification Dismissal

**Purpose:** See Notification Read State (section 11). Dismissal is a field on `notification_user_states`, not a separate table.

**Key Constraint:** Dismissing a notification MUST NOT delete the notification or its history. The `dismissed_at` field records when the user removed it from their active feed. The notification remains visible in the Notifications history page under the "Dismissed" filter.

---

## 13. Dividend Programs

**Purpose:** Store platform-configured dividend/benefit programs. Eligibility and amounts are backend-controlled. The frontend must never compute or credit amounts.

**dividend_programs table:**
- `id` — uuid, primary key
- `name` — varchar(256)
- `description` — text
- `eligibility_criteria` — jsonb (backend-defined rules)
- `period_type` — enum: monthly | quarterly | annual | one_time
- `status` — enum: active | inactive | suspended
- `created_at` — timestamptz
- `created_by` — uuid, FK → users.id (admin)

**Relationships:**
- Has many `dividend_eligibility_records`
- Has many `dividend_claims`

**Ownership:** Platform-owned. Admin-managed.

**Mutability:** Mutable by admin only.

**Security/Permissions:** Read: eligible customers (filtered by backend). Create/modify: admin/super_admin only.

**Audit:** All program changes logged in `audit_logs`.

**Storage:** PostgreSQL

---

## 14. Dividend Eligibility

**Purpose:** Store per-account eligibility evaluations for dividend programs.

**dividend_eligibility_records table:**
- `id` — uuid, primary key
- `user_id` — uuid, FK → users.id
- `program_id` — uuid, FK → dividend_programs.id
- `status` — enum: not_evaluated | under_review | eligible | not_eligible | claim_available | claim_submitted | processing | paid | rejected
- `employment_status` — enum: employed | self_employed | retired | unemployed | other, nullable
- `evaluated_at` — timestamptz, nullable
- `next_review_at` — timestamptz, nullable
- `eligible_amount` — numeric(18,8), nullable (backend-calculated only)
- `currency` — varchar(8), nullable
- `available_from` — timestamptz, nullable
- `claim_deadline` — timestamptz, nullable
- `evaluated_by` — uuid, FK → users.id (admin/system), nullable
- `notes` — text, nullable
- `created_at` — timestamptz
- `updated_at` — timestamptz

**Relationships:**
- Belongs to `users`
- Belongs to `dividend_programs`

**Ownership:** System-generated. Admin-managed.

**Mutability:** Status and amounts are mutable by admin/system only. Never by customer frontend.

**Security/Permissions:** Customer can read their own eligibility status (not the evaluation criteria). Admin can read/write all.

**Audit:** All eligibility status changes logged in `audit_logs`.

**Storage:** PostgreSQL

---

## 15. Dividend Claims

**Purpose:** Store customer-submitted dividend claims.

**dividend_claims table:**
- `id` — uuid, primary key
- `user_id` — uuid, FK → users.id
- `program_id` — uuid, FK → dividend_programs.id
- `eligibility_record_id` — uuid, FK → dividend_eligibility_records.id
- `status` — enum: submitted | under_review | approved | processing | paid | rejected | expired
- `claimed_amount` — numeric(18,8), nullable (backend-determined)
- `currency` — varchar(8)
- `destination_account_id` — uuid, FK → accounts.id
- `declaration_accepted` — boolean, NOT NULL
- `declaration_accepted_at` — timestamptz
- `submitted_at` — timestamptz
- `reviewed_at` — timestamptz, nullable
- `reviewed_by` — uuid, FK → users.id (admin), nullable
- `review_note` — text, nullable
- `reference` — varchar(64), UNIQUE (generated by backend)
- `created_at` — timestamptz
- `updated_at` — timestamptz

**Relationships:**
- Belongs to `users`
- Belongs to `dividend_programs`
- Belongs to `dividend_eligibility_records`
- References `accounts` (destination)
- Has one `dividend_payment` (after approval)

**Ownership:** Per-user (submitted by customer). Reviewed by admin.

**Mutability:** Status is mutable by admin/system. Amount is set by backend only. Customer cannot modify after submission.

**Suggested API:**
- `GET  /api/v1/dividends/eligibility`
- `GET  /api/v1/dividends/programs`
- `GET  /api/v1/dividends/claims`
- `POST /api/v1/dividends/claims`
- `GET  /api/v1/dividends/claims/:id`

**Security/Permissions:** Customer can submit and view their own claims. Admin can review/approve/reject. Backend must validate eligibility before accepting a claim submission.

**Audit:** All claim lifecycle events logged in `audit_logs`.

**Storage:** PostgreSQL

---

## 16. Dividend Payments

**Purpose:** Record the actual payment/settlement of an approved dividend claim.

**dividend_payments table:**
- `id` — uuid, primary key
- `claim_id` — uuid, FK → dividend_claims.id
- `user_id` — uuid, FK → users.id
- `amount` — numeric(18,8)
- `currency` — varchar(8)
- `status` — enum: processing | completed | failed | reversed
- `ledger_transaction_id` — uuid, FK → ledger_transactions.id
- `processed_at` — timestamptz, nullable
- `reference` — varchar(64), UNIQUE
- `created_at` — timestamptz

**Relationships:**
- Belongs to `dividend_claims`
- Belongs to `users`
- References `ledger_transactions` (double-entry ledger)

**Ownership:** System-generated. Not user-modifiable.

**Mutability:** Append-only. Immutable after creation.

**Audit:** All payment events logged in `audit_logs`.

**Storage:** PostgreSQL

---

## 17. Support Notification Integration

**Purpose:** Integrate support conversation activity with the global notification system so that unread support messages appear in the notification bell and badge.

**Design:**
- When a support agent sends a message in a conversation, a notification record is created in the `notifications` table with:
  - `category = 'support'`
  - `type = 'support_message'`
  - `related_entity_id = conversation_id`
  - `related_entity_type = 'support_conversation'`
  - `target_user_id = customer_user_id`
- When the customer opens the conversation, the notification is marked as read via `POST /api/v1/notifications/:id/read`.
- The same notification must NOT reappear as unread after being read.
- Notification state is per-user. Agent A reading a notification does not affect Customer B's state.

**No new table required.** Uses the existing `notifications` and `notification_user_states` tables.

**Suggested API:**
- `POST /api/v1/notifications/:id/read` (called when conversation is opened)

**Security/Permissions:** Customer can only mark their own support notifications as read.

**Audit:** Support notification read events logged in `audit_logs`.

**Storage:** PostgreSQL (via notifications + notification_user_states)

---

## Summary Table

| # | Feature | New Table(s) | Storage | Append-Only? | Per-User? |
|---|---------|-------------|---------|--------------|-----------|
| 1 | Watchlists | watchlist_items | PostgreSQL | No | Yes |
| 2 | Trading Bots | trading_bots | PostgreSQL | No | Yes |
| 3 | Bot Configurations | bot_configurations | PostgreSQL | Yes (versioned) | Yes |
| 4 | Bot Runs | bot_runs | PostgreSQL | Yes | Yes |
| 5 | Prediction Markets | prediction_markets | PostgreSQL | No | No (platform) |
| 6 | Prediction Positions | prediction_positions | PostgreSQL | No | Yes |
| 7 | Prediction Settlement | prediction_settlements | PostgreSQL | Yes | Yes |
| 8 | Customer Preferences | customer_preferences | PostgreSQL | No | Yes |
| 9 | Theme Preference | (field in customer_preferences) | PostgreSQL | No | Yes |
| 10 | Notification State | notifications | PostgreSQL | Yes | No (platform) |
| 11 | Notification Read State | notification_user_states | PostgreSQL | Yes | Yes |
| 12 | Notification Dismissal | (field in notification_user_states) | PostgreSQL | Yes | Yes |
| 13 | Dividend Programs | dividend_programs | PostgreSQL | No | No (platform) |
| 14 | Dividend Eligibility | dividend_eligibility_records | PostgreSQL | No | Yes |
| 15 | Dividend Claims | dividend_claims | PostgreSQL | No | Yes |
| 16 | Dividend Payments | dividend_payments | PostgreSQL | Yes | Yes |
| 17 | Support Notifications | (uses notifications tables) | PostgreSQL | Yes | Yes |

---

*Document generated: September 2026. Do NOT create SQL migrations until this document is reviewed and approved.*
