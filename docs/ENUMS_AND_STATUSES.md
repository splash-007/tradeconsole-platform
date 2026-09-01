# CryonFX — Enums & Status Values

> Canonical backend representations for all status values, types, and enums.  
> All values are `snake_case` for PostgreSQL storage.  
> Frontend display names are mapped in the API response layer.

---

## 1. User / Account Status

**PostgreSQL column**: `users.status`  
**Type**: `text` with CHECK constraint

| Backend Value | Display | Notes |
|--------------|---------|-------|
| `active` | Active | Normal account |
| `suspended` | Suspended | Temporarily blocked |
| `disabled` | Disabled | Permanently disabled |

**Inconsistency found**: `admin.service.ts` uses `suspended` and `disabled`. `auth.service.ts` uses `suspended` and `disabled`. These are consistent. ✓

---

## 2. Customer Status

**PostgreSQL column**: `customer_profiles.status` (via `registrations.status`)  
**Type**: `text` with CHECK constraint

| Backend Value | Display | Notes |
|--------------|---------|-------|
| `pending` | Pending | Just registered, not yet reviewed |
| `verified` | Verified | Identity verified |
| `active` | Active | Fully active customer |
| `suspended` | Suspended | Account suspended |
| `rejected` | Rejected | Registration rejected |

**Inconsistency found**: `admin.service.ts` uses `unverified` in `verificationStatus`. This should be `pending` in the backend. The `verificationStatus` field is separate from `customerStatus`.

---

## 3. Verification / KYC Status

**PostgreSQL column**: `verification_cases.status`  
**Type**: `text` with CHECK constraint

| Backend Value | Display | Notes |
|--------------|---------|-------|
| `not_started` | Not Started | No KYC submitted |
| `in_progress` | In Progress | Partially filled |
| `submitted` | Submitted | Awaiting review |
| `under_review` | Under Review | Being reviewed |
| `verified` | Verified | KYC approved |
| `rejected` | Rejected | KYC rejected |

**Source**: `kyc.service.ts` KYCStatus type — consistent across files. ✓

---

## 4. Task Status

**PostgreSQL column**: `tasks.status`  
**Type**: `text` with CHECK constraint

| Backend Value | Display | Notes |
|--------------|---------|-------|
| `pending` | Pending | Not started |
| `in_progress` | In Progress | Being worked on |
| `completed` | Completed | Done |
| `unable_to_complete` | Unable to Complete | Could not be done |
| `cancelled` | Cancelled | Cancelled |
| `overdue` | Overdue | Past due date (computed or set) |

**Inconsistency found**:  
- `agent.service.ts` uses: `pending`, `in_progress`, `completed`, `overdue`, `cancelled`  
- `platform.service.ts` adds: `unable_to_complete`  
**Canonical**: Use `platform.service.ts` version — it is more complete.

---

## 5. Task Type

**PostgreSQL column**: `tasks.type`  
**Type**: `text` with CHECK constraint

| Backend Value | Display |
|--------------|---------|
| `call_customer` | Call Customer |
| `follow_up` | Follow Up |
| `review_registration` | Review Registration |
| `contact_customer` | Contact Customer |
| `request_information` | Request Information |
| `verify_information` | Verify Information |
| `custom` | Custom |

**Source**: `agent.service.ts` TaskType — consistent. ✓

---

## 6. Priority

**PostgreSQL column**: `tasks.priority`, `customer_assignments.priority`  
**Type**: `text` with CHECK constraint

| Backend Value | Display | Sort Order |
|--------------|---------|-----------|
| `low` | Low | 1 |
| `medium` | Medium | 2 |
| `high` | High | 3 |
| `urgent` | Urgent | 4 |

**Source**: `agent.service.ts` Priority — consistent across all files. ✓

---

## 7. Assignment Status

**PostgreSQL column**: `customer_assignments.status`  
**Type**: `text` with CHECK constraint

| Backend Value | Display |
|--------------|---------|
| `active` | Active |
| `completed` | Completed |
| `cancelled` | Cancelled |

**Source**: `platform.service.ts` PlatformAssignment — consistent. ✓

---

## 8. Staff / Agent Presence Status

**Storage**: Valkey (primary), `staff_presence_log` (historical)  
**Type**: `text`

| Backend Value | Display | Color |
|--------------|---------|-------|
| `online` | Online | Green |
| `away` | Away | Yellow |
| `busy` | Busy | Red |
| `offline` | Offline | Gray |

**Source**: `staff-chat.service.ts` PresenceStatus — consistent across all files. ✓

---

## 9. Call Status

**PostgreSQL column**: `calls.status`  
**Type**: `text` with CHECK constraint

| Backend Value | Display |
|--------------|---------|
| `connecting` | Connecting |
| `ringing` | Ringing |
| `connected` | Connected |
| `ended` | Ended |
| `failed` | Failed |
| `unavailable` | Unavailable |
| `missed` | Missed |

**Inconsistency found**:  
- `calling.service.ts` CallState: `idle`, `connecting`, `ringing`, `connected`, `ended`, `failed`, `unavailable`  
- `agent.service.ts` CallStatus: `connecting`, `ringing`, `connected`, `ended`, `failed`, `unavailable`  
- `agent.service.ts` call record status: `completed`, `missed`, `failed`  
**Canonical for DB**: `connecting | ringing | connected | ended | failed | unavailable | missed`  
`idle` is a frontend-only UI state — not stored in DB.

---

## 10. Call Outcome

**PostgreSQL column**: `calls.outcome`  
**Type**: `text` with CHECK constraint

| Backend Value | Display |
|--------------|---------|
| `connected` | Connected |
| `no_answer` | No Answer |
| `busy` | Busy |
| `call_back` | Call Back |
| `interested` | Interested |
| `not_interested` | Not Interested |
| `follow_up_required` | Follow Up Required |

**Source**: `agent.service.ts` CallOutcome — consistent. ✓

---

## 11. Deposit / Withdrawal Status

**PostgreSQL column**: `deposit_requests.status`, `withdrawal_requests.status`  
**Type**: `text` with CHECK constraint

| Backend Value | Display | Notes |
|--------------|---------|-------|
| `pending` | Pending | Awaiting review |
| `processing` | Processing | Being processed |
| `approved` | Approved | Approved by finance |
| `rejected` | Rejected | Rejected by finance |
| `completed` | Completed | Funds transferred |
| `failed` | Failed | Processing failed |
| `cancelled` | Cancelled | Cancelled by customer |

**Inconsistency found**:  
- `finance.service.ts` FinanceStatus: `pending`, `processing`, `completed`, `failed`, `cancelled`  
- `admin.service.ts` DepositRequest.status: `pending`, `approved`, `rejected`, `processing`  
**Canonical**: Merge both — use the full set above.

---

## 12. Transaction Type

**PostgreSQL column**: `transactions.type`  
**Type**: `text` with CHECK constraint

| Backend Value | Display |
|--------------|---------|
| `deposit` | Deposit |
| `withdrawal` | Withdrawal |
| `trade` | Trade |
| `fee` | Fee |
| `transfer` | Transfer |

**Source**: `admin.service.ts` Transaction.type — consistent. ✓

---

## 13. Transaction Status

**PostgreSQL column**: `transactions.status`  
**Type**: `text` with CHECK constraint

| Backend Value | Display |
|--------------|---------|
| `pending` | Pending |
| `completed` | Completed |
| `failed` | Failed |
| `cancelled` | Cancelled |

---

## 14. Order Status

**PostgreSQL column**: `orders.status`  
**Type**: `text` with CHECK constraint

| Backend Value | Display |
|--------------|---------|
| `pending` | Pending |
| `filled` | Filled |
| `partially_filled` | Partially Filled |
| `cancelled` | Cancelled |

**Source**: `trading.service.ts` Order.status — consistent. ✓

---

## 15. Order Side

**PostgreSQL column**: `orders.side`, `trades.side`  
**Type**: `text` with CHECK constraint

| Backend Value | Display |
|--------------|---------|
| `buy` | Buy |
| `sell` | Sell |

---

## 16. Order Type

**PostgreSQL column**: `orders.type`  
**Type**: `text` with CHECK constraint

| Backend Value | Display |
|--------------|---------|
| `market` | Market |
| `limit` | Limit |
| `stop_limit` | Stop Limit |

---

## 17. Position Side

**PostgreSQL column**: `positions.side`  
**Type**: `text` with CHECK constraint

| Backend Value | Display |
|--------------|---------|
| `long` | Long |
| `short` | Short |

---

## 18. Deposit Method

**PostgreSQL column**: `deposit_requests.method`  
**Type**: `text` with CHECK constraint

| Backend Value | Display |
|--------------|---------|
| `bank_transfer` | Bank Transfer |
| `credit_card` | Credit Card |
| `crypto` | Crypto |
| `wire` | Wire Transfer |

---

## 19. Withdrawal Method

**PostgreSQL column**: `withdrawal_requests.method`  
**Type**: `text` with CHECK constraint

| Backend Value | Display |
|--------------|---------|
| `bank_transfer` | Bank Transfer |
| `crypto` | Crypto |
| `wire` | Wire Transfer |

---

## 20. Conversation Type

**PostgreSQL column**: `conversations.type`  
**Type**: `text` with CHECK constraint

| Backend Value | Display | Notes |
|--------------|---------|-------|
| `customer_support` | Customer Support | Customer ↔ Staff |
| `internal_direct` | Direct Message | Staff ↔ Staff |
| `internal_team` | Team Chat | Staff team group |
| `internal_department` | Department Chat | Department group |

**Inconsistency found**:  
- `chat.service.ts` uses no type field  
- `staff-chat.service.ts` uses `direct`, `team`, `department` + `conversationType: 'internal'`  
**Canonical**: Use the merged type above — single `type` column distinguishes all conversation kinds.

---

## 21. Notification Type

**PostgreSQL column**: `notifications.type`  
**Type**: `text` with CHECK constraint

| Backend Value | Display |
|--------------|---------|
| `assignment` | Assignment |
| `task` | Task |
| `message` | Message |
| `escalation` | Escalation |
| `system` | System |
| `finance` | Finance |
| `compliance` | Compliance |

---

## 22. Email Notification Type

**PostgreSQL column**: `notifications.type` (email subtype)

| Backend Value | Trigger |
|--------------|---------|
| `deposit_confirmed` | Finance approves deposit |
| `withdrawal_pending` | Withdrawal submitted |
| `withdrawal_approved` | Finance approves withdrawal |
| `withdrawal_rejected` | Finance rejects withdrawal |
| `profile_updated` | Admin updates customer profile |
| `kyc_approved` | Compliance approves KYC |
| `kyc_rejected` | Compliance rejects KYC |
| `account_activated` | Admin activates account |
| `account_suspended` | Admin suspends account |

---

## 23. KYC Document Type

**PostgreSQL column**: `verification_cases.document_type`, `verification_documents.document_type`  
**Type**: `text` with CHECK constraint

| Backend Value | Display |
|--------------|---------|
| `passport` | Passport |
| `national_id` | National ID |
| `drivers_license` | Driver's License |

---

## 24. Document Upload Type

**PostgreSQL column**: `verification_documents.document_type`

| Backend Value | Display |
|--------------|---------|
| `passport_front` | Passport Front |
| `passport_back` | Passport Back |
| `national_id_front` | National ID Front |
| `national_id_back` | National ID Back |
| `selfie` | Selfie |
| `proof_of_address` | Proof of Address |

---

## 25. Account Request Status

**PostgreSQL column**: `account_requests.status`  
**Type**: `text` with CHECK constraint

> This enum covers the full lifecycle of a customer account provisioning request.  
> Verify against `users.status` and `customer_profiles.status` — these are separate concerns.

| Backend Value | Display | Notes |
|--------------|---------|-------|
| `draft` | Draft | Request started but not submitted |
| `pending_approval` | Pending Approval | Submitted by manager, awaiting admin review |
| `approved` | Approved | Admin approved, provisioning not yet started |
| `rejected` | Rejected | Admin rejected the request |
| `provisioning` | Provisioning | Backend provisioning job in progress |
| `provisioned` | Provisioned | Account created, invitation not yet sent |
| `invite_sent` | Invite Sent | Account access email sent to customer |
| `activated` | Activated | Customer completed first login |
| `cancelled` | Cancelled | Request cancelled before completion |

**No overlap with existing enums**: `users.status` uses `active | suspended | disabled`. `customer_profiles.status` uses `pending | verified | active | suspended | rejected`. These are distinct from `account_requests.status`. ✓

---

## 26. Account Activation State (Customer Profile)

**PostgreSQL column**: `customer_profiles.activation_status` (new column — extends existing table)  
**Type**: `text` with CHECK constraint

> Tracks the customer account activation lifecycle. Separate from `customer_profiles.status` (identity/CRM status).

| Backend Value | Display | Notes |
|--------------|---------|-------|
| `pending_approval` | Pending Approval | Account request not yet approved |
| `approved` | Approved | Request approved, not yet provisioned |
| `invite_sent` | Invite Sent | Access email sent |
| `active` | Active | Customer has logged in and activated |
| `disabled` | Disabled | Account disabled by admin |
| `suspended` | Suspended | Temporarily suspended |

---

## 27. Login Handoff Token Status

**Storage**: Valkey (primary, with TTL) — not stored in PostgreSQL  
**Audit record**: `audit_logs` (event: `LOGIN_HANDOFF_CREATED`, `LOGIN_HANDOFF_REDEEMED`)

| State | Description |
|-------|-------------|
| `valid` | Token exists in Valkey, not yet redeemed |
| `redeemed` | Token consumed — immediately deleted from Valkey |
| `expired` | TTL elapsed — auto-removed by Valkey |

---

## 28. New Audit Event Types (Account Provisioning)

**PostgreSQL column**: `audit_logs.event_type`  
**Extends existing audit event enum** — verify no duplicates before adding.

| Backend Value | Trigger |
|--------------|---------|
| `ACCOUNT_CREATION_REQUESTED` | Manager submits account request |
| `ACCOUNT_REQUEST_APPROVED` | Admin approves request |
| `ACCOUNT_REQUEST_REJECTED` | Admin rejects request |
| `CUSTOMER_ACCOUNT_PROVISIONED` | Backend provisioning completes |
| `ACCOUNT_INVITATION_SENT` | Account access email sent |
| `ACCOUNT_INVITATION_RESENT` | Admin resends invitation |
| `ACCOUNT_ACTIVATED` | Customer completes first login |
| `ACCOUNT_DISABLED` | Admin disables account |
| `PASSWORD_RESET_INITIATED` | Password reset triggered |
| `LOGIN_HANDOFF_CREATED` | Handoff token generated after marketing site login |
| `LOGIN_HANDOFF_REDEEMED` | Handoff token redeemed, Trade Console session created |

---

## 29. New Permission Keys (Account Provisioning)

**PostgreSQL table**: `permissions` (extends existing permission registry)  
**Naming convention**: `resource.action` (snake_case) — consistent with existing pattern.

| Permission Key | Description | Default Roles |
|---------------|-------------|---------------|
| `customer_account.request` | Submit account creation request for assigned customer | agent, broker, retention_broker, ftd_broker, desk_broker, compliance_broker |
| `customer_account.request_view` | View own submitted account requests | (same as above) |
| `customer_account.approve` | Approve or reject account requests | admin, super_admin |
| `customer_account.reject` | Reject account requests | admin, super_admin |
| `customer_account.provision` | Manual provisioning override | super_admin |
| `customer_account.invite_resend` | Resend account access invitation | admin, super_admin |
| `customer_account.disable` | Disable a provisioned customer account | admin, super_admin |
| `customer_account.credentials_reset` | Reset customer access credentials | admin, super_admin |
| `marketing_site.view` | View configured marketing sites | manager roles, admin, super_admin |
| `marketing_site.manage` | Create/update/deactivate marketing sites | super_admin |

> **Scope restriction**: `customer_account.request` applies only to customers assigned to the requesting manager. Existing team/assignment scope continues to apply.  
> **No duplicate check**: Reviewed existing permissions in `ROLE_PERMISSION_DATABASE_MODEL.md` — no equivalent permissions exist. ✓

---

## 30. Naming Convention Summary

| Context | Convention | Example |
|---------|-----------|---------|
| PostgreSQL columns | `snake_case` | `first_name`, `created_at` |
| PostgreSQL tables | `snake_case` | `customer_profiles`, `audit_logs` |
| API JSON responses | `camelCase` | `firstName`, `createdAt` |
| Enum values (DB) | `snake_case` | `in_progress`, `bank_transfer` |
| Enum values (API) | `snake_case` (same) | `in_progress` |
| Frontend display | Title Case | `In Progress`, `Bank Transfer` |
| Role keys | `snake_case` | `ftd_broker`, `compliance_manager` |
| Permission keys | `snake_case` | `view_customer_phone` |
| Audit actions | `SCREAMING_SNAKE_CASE` | `CUSTOMER_ASSIGNED` |

### Fields Requiring Mapping (DB → API)

| DB Column | API Field |
|-----------|-----------|
| `first_name` | `firstName` |
| `last_name` | `lastName` |
| `created_at` | `createdAt` |
| `updated_at` | `updatedAt` |
| `assigned_at` | `assignedAt` |
| `reviewed_by_id` | `reviewedById` |
| `is_internal` | `isInternal` |
| `due_date` | `dueDate` |
| `take_profit_price` | `takeProfitPrice` |
| `stop_loss_price` | `stopLossPrice` |
