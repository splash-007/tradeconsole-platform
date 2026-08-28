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

## 25. Audit Actions

**PostgreSQL column**: `audit_logs.action`

| Backend Value | Trigger |
|--------------|---------|
| `CUSTOMER_CREATED` | New customer registered |
| `CUSTOMER_UPDATED` | Customer profile updated |
| `CUSTOMER_STATUS_CHANGED` | Customer status changed |
| `CUSTOMER_ASSIGNED` | Customer assigned to staff |
| `CUSTOMER_REASSIGNED` | Customer reassigned |
| `TASK_CREATED` | Task created |
| `TASK_UPDATED` | Task updated |
| `TASK_COMPLETED` | Task completed |
| `TASK_CANCELLED` | Task cancelled |
| `NOTE_ADDED` | Internal note added |
| `CALL_STARTED` | Call initiated |
| `CALL_COMPLETED` | Call ended |
| `ROLE_ASSIGNED` | Role assigned to staff |
| `ROLE_CHANGED` | Staff role changed |
| `PERMISSION_CHANGED` | Permission override set |
| `MANAGER_CHANGED` | Manager relationship changed |
| `VERIFICATION_UPDATED` | KYC status updated |
| `DEPOSIT_REVIEWED` | Deposit reviewed |
| `WITHDRAWAL_REVIEWED` | Withdrawal reviewed |
| `CHAT_ADMIN_VIEWED` | Admin viewed chat |
| `STAFF_CREATED` | Staff account created |
| `STAFF_DISABLED` | Staff account disabled |
| `STAFF_REACTIVATED` | Staff account reactivated |
| `CONVERSATION_VIEWED` | Conversation opened |
| `SIMULATION_STARTED` | Simulation lab run |
| `ESCALATION_CREATED` | Escalation raised |

---

## 26. Naming Convention Summary

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
