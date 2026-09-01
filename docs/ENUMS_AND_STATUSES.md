# Trade Console — Enums & Status Values

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

**Consistent across**: `admin.service.ts`, `auth.service.ts`. ✓

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

**Note**: `admin.service.ts` uses `unverified` in `verificationStatus`. This should be `pending` in the backend. The `verificationStatus` field is separate from `customerStatus`.

---

## 3. Verification / KYC Status

**PostgreSQL column**: `verification_cases.status`  
**Type**: `text` with CHECK constraint

> KYC is mandatory but presented under Profile/Settings rather than primary navigation.  
> Backend enforcement determines restricted actions for unverified customers.

| Backend Value | Display | Notes |
|--------------|---------|-------|
| `not_started` | Not Started | No KYC submitted |
| `in_progress` | In Progress | Partially filled |
| `submitted` | Submitted | Awaiting review |
| `under_review` | Under Review | Being reviewed |
| `additional_information_required` | Additional Information Required | Reviewer requested more info |
| `verified` | Verified | KYC approved |
| `rejected` | Rejected | KYC rejected |

**Source**: `kyc.service.ts` KYCStatus type — extended with `additional_information_required`. ✓

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

**Note**: `idle` is a frontend-only UI state — not stored in DB.

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

**Canonical**: Merged from `finance.service.ts` and `admin.service.ts`.

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
| `account_activated` | Customer completes activation |
| `account_suspended` | Admin suspends account |
| `account_access` | Account provisioned — activation link sent |
| `invitation_resent` | Admin resends invitation |

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
> Separate from `users.status` and `customer_profiles.status` — these are distinct concerns.

| Backend Value | Display | Notes |
|--------------|---------|-------|
| `draft` | Draft | Request started but not submitted |
| `pending_approval` | Pending Approval | Submitted by manager, awaiting admin review |
| `approved` | Approved | Admin approved, provisioning not yet started |
| `rejected` | Rejected | Admin rejected the request |
| `provisioning` | Provisioning | Async backend provisioning job in progress |
| `provisioned` | Provisioned | Account created, invitation not yet sent |
| `invite_sent` | Invite Sent | Activation email sent to customer |
| `activated` | Activated | Customer completed first login and set password |
| `cancelled` | Cancelled | Request cancelled before completion |

**No overlap with existing enums**: `users.status` uses `active | suspended | disabled`. `customer_profiles.status` uses `pending | verified | active | suspended | rejected`. These are distinct from `account_requests.status`. ✓

---

## 26. Account Activation State (Customer Profile)

**PostgreSQL column**: `customer_profiles.activation_status`  
**Type**: `text` with CHECK constraint

> Tracks the customer account activation lifecycle. Separate from `customer_profiles.status` (identity/CRM status).

| Backend Value | Display | Notes |
|--------------|---------|-------|
| `pending_approval` | Pending Approval | Account request not yet approved |
| `approved` | Approved | Request approved, not yet provisioned |
| `invite_sent` | Invite Sent | Activation email sent |
| `active` | Active | Customer has completed activation (set password, logged in) |
| `disabled` | Disabled | Account disabled by admin |
| `suspended` | Suspended | Temporarily suspended |

---

## 27. Login Handoff Token State

**Storage**: Valkey only (no PostgreSQL table)  
**Audit record**: `audit_logs` (events: `LOGIN_HANDOFF_CREATED`, `LOGIN_HANDOFF_REDEEMED`)

| State | Description |
|-------|-------------|
| `valid` | Token exists in Valkey, not yet redeemed (~60s TTL) |
| `redeemed` | Token consumed — immediately deleted from Valkey on redemption |
| `expired` | TTL elapsed — auto-removed by Valkey |

> **No PostgreSQL `login_handoff_tokens` table.** Tokens are ephemeral and stored only in Valkey.

---

## 28. Ledger Entry Type

**PostgreSQL column**: `ledger_entries.entry_type`  
**Type**: `text` with CHECK constraint

| Backend Value | Display | Notes |
|--------------|---------|-------|
| `debit` | Debit | Decreases account balance |
| `credit` | Credit | Increases account balance |

**Constraint**: Every finalized `ledger_transaction` must have balanced debits and credits (sum of debits = sum of credits).

---

## 29. Ledger Transaction Status

**PostgreSQL column**: `ledger_transactions.status`  
**Type**: `text` with CHECK constraint

| Backend Value | Display | Notes |
|--------------|---------|-------|
| `pending` | Pending | Transaction created, not yet finalized |
| `finalized` | Finalized | Balanced and committed — immutable |
| `reversed` | Reversed | Reversed by a compensating transaction |

---

## 30. Account Type

**PostgreSQL column**: `accounts.account_type`  
**Type**: `text` with CHECK constraint

| Backend Value | Display | Notes |
|--------------|---------|-------|
| `customer` | Customer | Customer financial account |
| `system_clearing` | System Clearing | Clearing/suspense account |
| `system_fee` | System Fee | Fee collection account |
| `system_settlement` | System Settlement | Settlement account |

---

## 31. Audit Event Types

**PostgreSQL column**: `audit_logs.action`  
**Type**: `text` — `SCREAMING_SNAKE_CASE` convention

### Existing Audit Events

| Backend Value | Trigger |
|--------------|---------|
| `CUSTOMER_ASSIGNED` | Customer assigned to staff |
| `CUSTOMER_REASSIGNED` | Customer reassigned |
| `CUSTOMER_STATUS_CHANGED` | Customer status updated |
| `STAFF_ROLE_CHANGED` | Staff role updated |
| `STAFF_DISABLED` | Staff account disabled |
| `PERMISSION_GRANTED` | Permission override added |
| `PERMISSION_REVOKED` | Permission override removed |
| `DEPOSIT_REVIEWED` | Deposit approved/rejected |
| `WITHDRAWAL_REVIEWED` | Withdrawal approved/rejected |
| `KYC_REVIEWED` | KYC case reviewed |
| `NOTE_ADDED` | Internal note added |

### Account Provisioning Audit Events (New)

| Backend Value | Trigger |
|--------------|---------|
| `ACCOUNT_CREATION_REQUESTED` | Manager submits account request |
| `ACCOUNT_REQUEST_APPROVED` | Admin approves request |
| `ACCOUNT_REQUEST_REJECTED` | Admin rejects request |
| `CUSTOMER_ACCOUNT_PROVISIONED` | Backend provisioning completes |
| `ACCOUNT_INVITATION_SENT` | Activation email sent |
| `ACCOUNT_INVITATION_RESENT` | Admin resends invitation |
| `ACCOUNT_ACTIVATED` | Customer completes first login and sets password |
| `ACCOUNT_DISABLED` | Admin disables account |
| `PASSWORD_RESET_INITIATED` | Password reset triggered |
| `LOGIN_HANDOFF_CREATED` | Handoff token generated after marketing site login |
| `LOGIN_HANDOFF_REDEEMED` | Handoff token redeemed, Trade Console session created |

---

## 32. New Permission Keys

**PostgreSQL table**: `permissions`  
**Naming convention**: `resource.action` (snake_case) — consistent with existing pattern.

| Permission Key | Category | Description |
|---------------|----------|-------------|
| `customer_account.request` | ACCOUNT_PROVISIONING | Submit account creation request for assigned customer |
| `customer_account.request_view` | ACCOUNT_PROVISIONING | View own submitted account requests |
| `customer_account.approve` | ACCOUNT_PROVISIONING | Approve account requests |
| `customer_account.reject` | ACCOUNT_PROVISIONING | Reject account requests |
| `customer_account.provision` | ACCOUNT_PROVISIONING | Manual provisioning override |
| `customer_account.invite_resend` | ACCOUNT_PROVISIONING | Resend account access invitation |
| `customer_account.disable` | ACCOUNT_PROVISIONING | Disable a provisioned customer account |
| `customer_account.credentials_reset` | ACCOUNT_PROVISIONING | Reset customer access credentials |
| `marketing_site.view` | MARKETING | View configured marketing sites |
| `marketing_site.manage` | MARKETING | Create/update/deactivate marketing sites |

---

## 33. Marketing Site Status

**PostgreSQL column**: `marketing_sites.status`  
**Type**: `text` with CHECK constraint

| Backend Value | Display | Notes |
|--------------|---------|-------|
| `active` | Active | Approved login entry point |
| `inactive` | Inactive | Deactivated — no longer accepted as login source |

---

## 34. Login Error Codes (API Response)

**Used in**: `POST /api/v1/auth/login` error responses

| Code | Meaning | Notes |
|------|---------|-------|
| `invalid_credentials` | Username or password incorrect | Do NOT reveal whether username exists |
| `account_pending` | Account not yet activated | Provisioned but activation not complete |
| `account_disabled` | Account has been disabled | — |
| `activation_required` | Customer must complete activation | Activation link not yet used |
| `password_change_required` | Password change required | — |
| `rate_limited` | Too many attempts | — |

---

## 35. Naming Convention Summary

| Context | Convention | Example |
|---------|-----------|---------|
| PostgreSQL columns | `snake_case` | `first_name`, `created_at` |
| PostgreSQL tables | `snake_case` | `customer_profiles`, `audit_logs` |
| API JSON responses | `camelCase` | `firstName`, `createdAt` |
| Enum values (DB) | `snake_case` | `in_progress`, `bank_transfer` |
| Enum values (API) | `snake_case` (same) | `in_progress` |
| Frontend display | Title Case | `In Progress`, `Bank Transfer` |
| Role keys | `snake_case` | `ftd_broker`, `compliance_manager` |
| Permission keys | `resource.action` snake_case | `customer_account.request`, `view_customer_phone` |
| Audit actions | `SCREAMING_SNAKE_CASE` | `CUSTOMER_ASSIGNED`, `ACCOUNT_ACTIVATED` |

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
| `must_change_password` | `mustChangePassword` |
| `account_activated` | `accountActivated` |
| `activation_status` | `activationStatus` |
| `marketing_site_id` | `marketingSiteId` |
| `registration_id` | `registrationId` |
| `provisioned_user_id` | `provisionedUserId` |
| `requested_by_user_id` | `requestedByUserId` |
| `assigned_manager_id` | `assignedManagerId` |
