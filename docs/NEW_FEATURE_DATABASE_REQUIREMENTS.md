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

## Financial Architecture Notes

**Watchlist:** PostgreSQL per-user persistence.

**Preferences (including Theme):** PostgreSQL per-user persistence. Theme is part of preferences.

**Notification delivery/read/dismiss:** PostgreSQL per-user state. Transient real-time delivery via Valkey / WebSocket.

**Bot runtime:** PostgreSQL configuration/history + Valkey real-time/runtime state where appropriate.

**Prediction positions:** PostgreSQL authoritative records. Balance allocation and settlement must integrate with the future immutable financial ledger.

**Prediction eligibility:** PostgreSQL with possible Valkey cache for short-lived results.

**Dividend claims/payments:** PostgreSQL + immutable financial ledger.

**No frontend direct balance manipulation.** All financial operations are server-authoritative.
