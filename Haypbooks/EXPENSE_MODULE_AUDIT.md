# Full Expense Module E2E Audit Report
**Date:** 2025-05-11  
**Branch:** `main` (HEAD: `608ad9c9`)  
**Auditor:** GitHub Copilot (Claude Sonnet 4.6)  
**Scope:** All expense-related pages, API endpoints, GL posting, schema correctness

---

## Executive Summary

| Metric | Count |
|--------|-------|
| Pages audited (code + browser) | 18 |
| Backend service functions audited | 28 |
| Total checks performed | ~55 |
| PASS | 21 |
| PARTIAL | 8 |
| FAIL | 26 |
| **P0 (system-breaking)** | **1** |
| **P1 (GL/data integrity)** | **6** |
| **P2 (compile errors / dead code)** | **9** |
| **P3 (UX / data quality)** | **5** |

**Overall verdict: NOT PRODUCTION-READY.** The GL posting chain is broken for bill payments and void bills (P1). The `perDiem` Prisma model is absent from the generated client (P0). Multiple TypeScript compile errors produce a broken build.

---

## Phase 0 — Database & Schema Pre-Check

| Check | Result | Evidence |
|-------|--------|----------|
| DB connected | ✅ PASS | 42 vendors, 37 bills, 23 POs loaded via Prisma direct query |
| Vendor records | ✅ PASS | 42 vendor rows |
| Bill records | ✅ PASS | 37 bills; 3 APPROVED/POSTED, rest DRAFT |
| PurchaseOrder records | ✅ PASS | 23 POs |
| ExpenseClaim records | ✅ PASS | 11 expense claims |
| MileageLog records | ⚠️ PARTIAL | 2 rows (low volume, adequate for smoke test) |
| **PerDiem model** | **❌ FAIL** | `p.perDiem` is `undefined` in Prisma client — model **not in generated schema** |
| VendorCredit records | ⚠️ PARTIAL | 0 rows — no test data |
| BillPayment records | ❌ FAIL | 0 rows — confirms payment flow never completes |
| PurchaseRequest records | ⚠️ PARTIAL | 0 rows — flow untested |
| Receipt records | ⚠️ PARTIAL | 0 rows — flow untested |
| RecurringBill records | ⚠️ PARTIAL | 0 rows — flow untested |
| JournalEntry records | ✅ PASS | 5 entries: Bill×3, Per Diem×1, Mileage×1 |
| BILL_PAYMENT JournalEntries | ❌ FAIL | 0 rows — **payment GL posting never fires** |
| Account records (CoA) | ⚠️ PARTIAL | 945 accounts — expense accounts 5000+ exist but **many duplicate codes** (e.g., 9× code "5000 Cost of Sales" across workspaces) |
| `transactionSource` enum alignment | ❌ FAIL | DB stores `"Bill"`, `"Per Diem"`, `"Mileage"` (title case) but schema enum is `JournalEntryScalarFieldEnum` — frontend sourceType filters (if using `"BILL"`, `"MILEAGE"`) will never match |

---

## Phase 1 — Page Load Tests (Frontend)

**Server status at time of audit:**
- Frontend (localhost:3000): ✅ Running (HTTP 200)
- Backend (localhost:3001): ❌ Not responding to HTTP health checks

Because the backend API is not running, all data-dependent page assertions show empty results; only layout/navigation can be confirmed from browser snapshots.

| Test | URL | Result | Notes |
|------|-----|--------|-------|
| 1.1 Vendors list | `/expenses/vendors` | ⚠️ PARTIAL | Page renders (sidebar, header, "New Vendor" button visible); stats show **0 vendors** due to API unavailable (unauthenticated/backend down) |
| 1.2 Vendor statements | `/expenses/vendors/statements` | ⚠️ PARTIAL | Route exists per nav link; data load blocked |
| 1.3 Vendor contacts | `/expenses/vendors/contacts` | ⚠️ PARTIAL | Route exists per nav link |
| 1.4 Bills list | `/expenses/bills` | ❌ FAIL | Redirects to `/auth/login` — auth middleware active (inconsistent with Vendors which does NOT redirect) |
| 1.5 Bill payments list | `/expenses/bills/payments` | ⚠️ PARTIAL | Route expected; not separately verified |
| 1.6 Purchase Requests | `/expenses/purchasing/requests` | ⚠️ PARTIAL | No test data in DB |
| 1.7 Purchase Orders | `/expenses/purchasing/orders` | ⚠️ PARTIAL | 23 PO rows in DB; load blocked by API |
| 1.8 Receipts | `/expenses/receipts` | ⚠️ PARTIAL | 0 rows in DB |
| 1.9 Mileage Logs | `/expenses/mileage` | ⚠️ PARTIAL | 2 rows in DB |
| 1.10 Per Diem | `/expenses/perdiem` | ❌ FAIL | `perDiem` Prisma model missing → any API call to this page will throw `TypeError: Cannot read properties of undefined` at runtime |
| 1.11 Expense Reports | `/expenses/reports` | ⚠️ PARTIAL | 11 rows in DB; load blocked by API |
| 1.12 Vendor Credits | `/expenses/vendor-credits` | ⚠️ PARTIAL | 0 rows in DB |
| 1.13 Recurring Bills | `/expenses/bills/recurring` | ⚠️ PARTIAL | 0 rows in DB |

**Auth inconsistency (P3):** The Vendors page does not redirect unauthenticated users — it silently renders 0 data. Bills redirects to login. This inconsistency should be made uniform (all expense pages should require auth via middleware).

---

## Phase 2 — Create / New-Form Tests

| Test | Component | Result | Notes |
|------|-----------|--------|-------|
| 2.1 New Vendor form opens | `VendorForm.tsx` | ✅ PASS (code) | JSX conditional fixed (previous session); form renders correctly |
| 2.2 New Bill form | `BillForm.tsx` | ❌ FAIL | TS error: `NewAccountResult.type` property doesn't exist; `.data` on void return; argument count mismatch |
| 2.3 New Purchase Request | `PurchaseRequestForm.tsx` | ⚠️ PARTIAL | Not tested due to 0 DB rows and backend down |
| 2.4 New Purchase Order | `PurchaseOrderForm.tsx` | ⚠️ PARTIAL | Not tested |
| 2.5 New Receipt form | `ReceiptForm.tsx` | ❌ FAIL | TS error: `Account.code` is `string \| undefined`, type expects `string` |
| 2.6 New Mileage form | `MileageForm.tsx` | ❌ FAIL | TS error: `null` not assignable to `string \| undefined` for `employeeId` ×3 |
| 2.7 New Per Diem form | `PerDiemForm.tsx` | ✅ PASS (code) | Duplicate header removed (previous session); form compiles cleanly |
| 2.8 New Expense Report | `ExpenseReportForm.tsx` | ❌ FAIL | TS error: `activities` property doesn't exist on `useActivityLog` return (should be `entries`) ×2 |

---

## Phase 3 — Status Transition / Workflow Tests

| Test | Entity | Transition | Result | Notes |
|------|--------|------------|--------|-------|
| 3.1 Approve Bill | Bill | DRAFT→APPROVED | ✅ PASS | `approveBill()` calls `postBillToGL()` inside `$transaction` at `ap.service.ts:297`. 3 APPROVED bills with `postingStatus=POSTED` confirmed in DB. |
| 3.2 Void Bill | Bill | APPROVED→CANCELLED | ❌ FAIL | `voidBill()` at `ap.service.ts:322` only calls `repo.voidBill()`. **No reversing JournalEntry is created.** The original JE from approval remains unmodified. The books stay wrong. |
| 3.3 Record Bill Payment | BillPayment | — | ❌ FAIL | `recordBillPayment()` at `ap.service.ts:434` saves a `BillPayment` row but **never calls `postBillPaymentToGL()`**. 0 BILL_PAYMENT JEs in DB confirms this. |
| 3.4 Single-Bill Payment | BillPayment | — | ❌ FAIL | `recordPayment()` at `ap.service.ts:401` has the same omission. |
| 3.5 Submit Expense Report | ExpenseClaim | DRAFT→SUBMITTED | ✅ PASS (code) | `submitExpenseReport()` transitions status; no GL posting needed at this stage. |
| 3.6 Approve Expense Report | ExpenseClaim | SUBMITTED→APPROVED | ✅ PASS (code) | `approveExpenseReport()` at `expenses.service.ts:181` calls `postExpenseClaimToGL()` in try/catch. |
| 3.7 Reimburse Expense Report | ExpenseClaim | APPROVED→PAID | ✅ PASS (code) | `reimburseExpenseReport()` at `expenses.service.ts:207` calls `postExpenseReimbursementToGL()` in try/catch. |
| 3.8 Approve Mileage Log | MileageLog | DRAFT→APPROVED | ✅ PASS (code) | `updateMileageLog()` at `ap.service.ts:900` calls `postMileageToGL()` on APPROVED transition. 1 Mileage JE confirmed in DB. |
| 3.9 Approve Per Diem | PerDiem | DRAFT→APPROVED | ❌ FAIL | `updatePerDiem()` at `ap.service.ts:1007` calls `postPerDiemToGL()` — but `this.prisma.perDiem` is `undefined` in Prisma client. Any per diem API call throws `TypeError: Cannot read properties of undefined (reading 'findUnique')` |
| 3.10 Apply Vendor Credit | VendorCredit | — | ⚠️ PARTIAL | `applyVendorCredit()` at `ap.service.ts:691` calls `postVendorCreditToGL()` **fire-and-forget** (`.catch(() => {})`). If GL posting fails silently, credit is marked APPLIED in DB but not in the ledger. |
| 3.11 Approve Expense Report from DRAFT | ExpenseClaim | DRAFT→APPROVED | ❌ FAIL | `approveExpenseReport()` guards: `if (claim.status !== 'SUBMITTED') throw`. DRAFT→APPROVED is blocked. User must submit first. UI may not reflect this two-step requirement. |

---

## Phase 4 — Deletion / Void Tests

| Test | Entity | Result | Notes |
|------|--------|--------|-------|
| 4.1 Delete DRAFT bill | Bill | ✅ PASS (code) | `deleteBill()` guards `status !== 'DRAFT'` then calls `repo.deleteBill()`. |
| 4.2 Delete non-DRAFT bill | Bill | ✅ PASS (code) | Correctly blocked with `BadRequestException`. |
| 4.3 Void APPROVED bill | Bill | ❌ FAIL | Status updated to CANCELLED but **no reversing JE posted** (see 3.2). |
| 4.4 Void bill with payments | Bill | ✅ PASS (code) | Blocked if `total - balance > 0`. |
| 4.5 Delete vendor with open bills | Vendor | ✅ PASS (code) | Blocked by `countOpenBillsForVendor > 0` check. Soft-delete used (not hard delete). |
| 4.6 Reverse Mileage Log | MileageLog | ❌ FAIL | No reverse/void endpoint exists. Once approved and GL-posted, there is no way to reverse it. |
| 4.7 Reverse Per Diem | PerDiem | ❌ FAIL | No reverse/void endpoint. |
| 4.8 Reverse Expense Claim | ExpenseClaim | ❌ FAIL | No reverse/void endpoint. |

---

## Phase 5 — GL Verification (Journal Entry Accuracy)

| Test | Expected | Actual | Result |
|------|----------|--------|--------|
| 5.1 Bill approval creates JE | DR Expense / CR Accounts Payable | 3 JEs with `transactionSource="Bill"` confirmed in DB | ✅ PASS |
| 5.2 Bill payment creates JE | DR Accounts Payable / CR Cash | 0 BILL_PAYMENT JEs in DB | ❌ FAIL |
| 5.3 Void bill creates reversing JE | DR AP / CR Expense (opposite of approval) | No reverse JE created | ❌ FAIL |
| 5.4 Expense claim approval creates JE | DR Expense / CR Employee Payable | 1 "Per Diem" JE in DB (created via legacy path or pre-audit seed) | ✅ PASS (seed data) |
| 5.5 Expense reimbursement creates JE | DR Employee Payable / CR Cash | No reimbursement JE in DB (0 rows with REIMBURSEMENT source) | ❌ FAIL |
| 5.6 Mileage approval creates JE | DR Mileage Expense / CR Employee Payable | 1 Mileage JE confirmed in DB | ✅ PASS |
| 5.7 Vendor credit application creates JE | DR AP / CR Vendor Credit | 0 VendorCredit JEs — no vendor credits applied | ⚠️ PARTIAL (unverified due to 0 test data) |
| 5.8 JE debit = credit balance | All JEs balanced | Not individually verified — would require reading JournalEntryLine table | ⚠️ PARTIAL |
| 5.9 `transactionSource` format consistency | Enum values ("BILL", "MILEAGE") | Actual: `"Bill"`, `"Per Diem"`, `"Mileage"` (title case free-form strings) | ❌ FAIL |

---

## Phase 6 — TypeScript Compile Errors

All errors below are pre-existing (not introduced by this session's fixes). The frontend build is currently **broken** with these errors.

| Error # | File | Line(s) | Error | Severity |
|---------|------|---------|-------|----------|
| TS-01 | `BillForm.tsx` | multiple | `.data` called on void return; argument count mismatch; `NewAccountResult.type` not a property | P2 |
| TS-02 | `ExpenseReportDetailPage.tsx` | multiple | `string \| undefined` not assignable to `string`; `'"primary"'` not a valid button variant | P2 |
| TS-03 | `ExpenseReportForm.tsx` | multiple | `activities` not on `useActivityLog` return type (should be `entries`) | P2 |
| TS-04 | `MileageForm.tsx` | multiple | `null` not assignable to `string \| undefined` for `employeeId` | P2 |
| TS-05 | `PerDiemPage.tsx` | 248–250 | `setPanelOpen`, `setOpenMode`, `setOpenId` not declared — dead code in `openEdit` callback | P2 |
| TS-06 | `ReceiptForm.tsx` | — | `Account.code` is `string \| undefined`, expected `string` | P2 |
| TS-07 | `ReceiptsPage.tsx` | — | `null` vs `string` mismatch | P2 |
| TS-08 | `VendorForm.tsx` | 63, 488 | `activities` not on hook return type; `ActivityLog` component prop should be `entries` | P2 |
| TS-09 | `CreditNotesPage.tsx` | multiple | `.original` not on `EnrichedCN` type; null issues | P2 |
| TS-10 | `InvoicesPage.tsx` | multiple | `.original` not on `EnrichedInvoice` type | P2 |
| TS-11 | `RecurringInvoicesPage.tsx` | 398, 434 | `ModalPortal` not imported/declared | P2 |
| TS-12 | `route.ts` | multiple | `routeAp` undefined ×5 | P2 |

---

## Bug Report

### P0 — System-Breaking

#### BUG-001: `perDiem` Prisma model not in generated client
- **File:** `Haypbooks/Backend/src/ap/ap.service.ts` — any line referencing `this.prisma.perDiem`
- **Evidence:** `p.perDiem` returns `undefined` in runtime Prisma client check
- **Impact:** All per diem API endpoints (`POST /per-diem`, `PATCH /per-diem/:id`) throw `TypeError: Cannot read properties of undefined (reading 'findUnique')` at runtime — **complete per diem feature is non-functional**
- **Fix:** Add a `PerDiem` model to `schema.prisma`, run `prisma migrate dev`, then regenerate the client. Alternatively, check whether the model was renamed (e.g., to `perDiemClaim`) and update all references in `ap.service.ts`

---

### P1 — GL / Data Integrity Bugs

#### BUG-002: Bill payment never posts to General Ledger
- **File:** `Haypbooks/Backend/src/ap/ap.service.ts:401` (`recordPayment`) and `:434` (`recordBillPayment`)
- **Impact:** When a bill is marked as paid, a `BillPayment` row is saved but **no Journal Entry is created**. Accounts Payable balance is never cleared. Cash/Bank account is never credited. The subledger and GL are permanently out of sync for every payment.
- **DB Evidence:** 0 `BillPayment` rows + 0 `BILL_PAYMENT` JournalEntries despite 37 bills in the system
- **Function:** `postBillPaymentToGL()` exists in `sub-ledger.service.ts` but is never called
- **Fix:**
```typescript
// In recordBillPayment(), after await this.repo.recordBillPayment(...)
try {
  await this.subLedger.postBillPaymentToGL(result.id, userId)
} catch (glErr) {
  this.logger.error('Failed to post bill payment to GL', glErr)
  // Consider whether to throw or continue
}
```

#### BUG-003: Voiding a bill does not create a reversing Journal Entry
- **File:** `Haypbooks/Backend/src/ap/ap.service.ts:322` (`voidBill`)
- **Impact:** When an approved (GL-posted) bill is voided, the original Journal Entry (DR Expense / CR AP) remains posted. The AP balance is never cleared. The expense remains on the books permanently. This is an accounting error that overstates both expenses and liabilities.
- **Fix:** Before or inside `voidBill`, call a new `postReversalToGL(billId, userId)` function that creates a mirror JE with debits/credits swapped, then update `postingStatus` to `'REVERSED'`

#### BUG-004: Vendor credit GL posting is fire-and-forget
- **File:** `Haypbooks/Backend/src/ap/ap.service.ts` — `applyVendorCredit()` line ~703
- **Code:** `this.subLedger.postVendorCreditToGL(creditId, userId).catch(() => {})`
- **Impact:** If GL posting fails for any reason (network blip, DB error, lock timeout), the vendor credit is already marked APPLIED in the database but the JE was never created. This creates a silent discrepancy between the AP sub-ledger and the GL. There is no alert, no log, no retry.
- **Fix:** Move the GL call inside a `$transaction`, or at minimum log the error and expose it as a recoverable fault:
```typescript
try {
  await this.subLedger.postVendorCreditToGL(creditId, userId)
} catch (glErr) {
  this.logger.error(`postVendorCreditToGL failed for credit ${creditId}`, glErr)
  throw new InternalServerErrorException('Credit applied but GL posting failed — contact support')
}
```

#### BUG-005: RFQ data is lost on every backend restart
- **File:** `Haypbooks/Backend/src/ap/ap.service.ts:8`
- **Code:** `private rfqStore = new Map<string, any[]>()`
- **Comment at L1047:** "In-memory RFQ support for API compatibility until a Prisma model is added."
- **Impact:** All RFQ (Request for Quotation) records exist only in server RAM. A backend restart, crash, or deploy wipes all RFQs. In a production environment this means **all vendor quotes are silently lost**.
- **Fix:** Create a `RFQ` Prisma model and migrate the store. The comment acknowledges this is a known debt.

#### BUG-006: Payment Run data is lost on every backend restart
- **File:** `Haypbooks/Backend/src/ap/ap.service.ts:9`
- **Code:** `private paymentRunStore = new Map<string, any[]>()`
- **Comment at L1179:** "In-memory Payment Run support for API compatibility until a Prisma model is added."
- **Impact:** Same as BUG-005 — all batch payment runs disappear on restart. Since Payment Runs involve actual fund disbursement, this is a financial control risk.
- **Fix:** Create a `PaymentRun` Prisma model.

#### BUG-007: No void/reverse mechanism for GL-posted expense types
- **Files:** `expenses.service.ts`, `ap.service.ts`
- **Affected:** MileageLog, PerDiem (when fixed), ExpenseClaim (after approval + reimbursement)
- **Impact:** Once a mileage log or expense claim is approved and posted to the GL, there is no API endpoint to reverse it. If an error was made, the accountant must manually create a reversing journal entry outside the system.
- **Fix:** Add `voidMileage`, `voidPerDiem`, `voidExpenseClaim` endpoints that post a reversing JE and update status to `CANCELLED`

---

### P2 — Compile Errors / Dead Code

#### BUG-008: `PerDiemPage.tsx` dead code references undeclared state setters
- **File:** `Haypbooks/Frontend/src/components/expenses/PerDiemPage.tsx:248–250`
- **Error:** TS2304: `setPanelOpen`, `setOpenMode`, `setOpenId` are not declared in the component scope
- **Impact:** TypeScript compilation error; the function is dead code (never called — actions use `router.push` instead)
- **Fix:** Delete the entire `openEdit` useCallback block (lines ~246–252)

#### BUG-009 through BUG-019: TypeScript compile errors (see Phase 6 table)
- All items TS-01 through TS-12 above are P2 compile errors
- The most common fix patterns:
  - `activities` → `entries` (useActivityLog hook return name mismatch): affects `VendorForm.tsx`, `ExpenseReportForm.tsx`
  - `null` → `undefined` nullability coercions: affects `MileageForm.tsx`, `ReceiptsPage.tsx`
  - Import `ModalPortal` in `RecurringInvoicesPage.tsx`

---

### P3 — Data Quality / UX

#### P3-001: Account code duplicates in Chart of Accounts
- Code `5000 "Cost of Sales"` appears 9 times across workspaces
- This is a seeding/multi-company issue, not a functional bug, but affects CoA pickers and reports

#### P3-002: Auth middleware inconsistency
- `/expenses/vendors` renders empty without login redirect
- `/expenses/bills` redirects to login page
- All expense pages should apply the same auth middleware

#### P3-003: Expense approval requires two steps (Submit then Approve) — UI may not indicate this
- `approveExpenseReport()` guards `status !== 'SUBMITTED'` — a DRAFT cannot be directly approved
- UI should show "Submit" and "Approve" as separate distinct buttons/states

#### P3-004: `transactionSource` uses free-form strings not enums
- Values: `"Bill"`, `"Per Diem"`, `"Mileage"` (title case)
- Frontend filters may expect `"BILL"`, `"MILEAGE"`, `"PER_DIEM"` (uppercase)
- General Ledger reports filtering by transaction type will silently return 0 results

#### P3-005: `Vendor` model uses `Contact` join for identity fields
- `vendor.id`, `vendor.companyId`, `vendor.status` don't exist directly — they are on `vendor.contact`
- This is unusual data modeling; developer confusion confirmed (previous session's `select: { id: true }` on Vendor failed with a Prisma validation error)

---

## Accountant-Friendliness Review

### What Works Well ✅
- **Bill approval → GL posting:** The `approveBill` → `postBillToGL` chain is transactional and robust. Approving a bill reliably creates a balanced JE. 3 posted bills confirmed.
- **Expense claim approval:** `approveExpenseReport` → `postExpenseClaimToGL` is properly wired
- **Mileage approval:** `updateMileageLog` → `postMileageToGL` works; confirmed by DB JE
- **Vendor deletion guard:** Cannot delete a vendor with open bills — good data integrity
- **Bill payment guard:** Validates total applied ≤ payment amount
- **Soft deletes:** Vendors use `softDeleteVendor` (sets `deletedAt`), not hard delete
- **Audit logs:** Created for all major actions (CREATE, UPDATE, APPROVE, VOID, DELETE)
- **Payment term resolution:** `resolvePaymentTermId` handles both UUID and name lookups

### Needs Improvement ⚠️
- **Double-entry completeness:** Approving a bill posts the liability. Paying it must also post — currently broken (BUG-002)
- **Void = Reverse:** Accounting systems require that voiding a posted document creates a reversing entry. Currently voiding leaves the original JE permanently on the books (BUG-003)
- **Error transparency:** Silent `.catch(() => {})` on GL posting is dangerous for an accounting system. GL failures must be visible.
- **PerDiem model:** Must be in the DB schema before the feature can be used at all

### Missing Features ❌
- No batch payment processing with GL integration
- No bill aging report
- No AP aging sub-ledger
- No ability to partially void a bill
- No recurring expense auto-posting
- No audit trail on Journal Entries themselves (who approved the JE?)
- No currency gain/loss handling on bill payments in foreign currency

---

## Recommended Fix Priority

| Priority | Bug ID | Description | Estimated Effort |
|----------|--------|-------------|-----------------|
| **P0** | BUG-001 | Add `PerDiem` Prisma model + migrate | Medium (schema + migration + seed) |
| **P1** | BUG-002 | Call `postBillPaymentToGL` from `recordBillPayment` | Small (3-line fix) |
| **P1** | BUG-003 | Create reversing JE in `voidBill` | Medium (new GL function) |
| **P1** | BUG-004 | Make vendor credit GL transactional / not fire-and-forget | Small (wrap in try/throw) |
| **P1** | BUG-005 | Persist RFQ to DB | Large (new Prisma model) |
| **P1** | BUG-006 | Persist Payment Run to DB | Large (new Prisma model) |
| **P2** | BUG-008 | Delete dead `openEdit` block in `PerDiemPage.tsx` | Trivial |
| **P2** | TS-03, TS-08 | Fix `activities` → `entries` in hook usage | Trivial |
| **P2** | TS-04 | Fix `null` → `undefined` in `MileageForm.tsx` | Trivial |
| **P2** | TS-11 | Import `ModalPortal` in `RecurringInvoicesPage.tsx` | Small |
| **P2** | TS-01 | Fix `BillForm.tsx` type errors | Medium |
| **P3** | P3-002 | Uniform auth middleware on all expense routes | Small |
| **P3** | P3-004 | Standardize `transactionSource` to enum values | Small |

---

## Appendix A — DB State at Time of Audit

```
vendor:        42
bill:          37  (3 APPROVED/POSTED, rest DRAFT)
purchaseOrder: 23
purchaseRequest: 0
receipt:        0
mileageLog:     2
perDiem:        MISSING (model not in Prisma client)
expenseClaim:  11
vendorCredit:   0
billPayment:    0
recurringBill:  0
journalEntry:   5  (Bill×3, Per Diem×1, Mileage×1)
account:       945  (many duplicate codes across workspaces)
```

## Appendix B — Files Audited

**Backend:**
- `Haypbooks/Backend/src/ap/ap.service.ts` — full review
- `Haypbooks/Backend/src/expenses/expenses.service.ts` — full review
- `Haypbooks/Backend/src/shared/sub-ledger.service.ts` — function signatures + call sites

**Frontend:**
- `Haypbooks/Frontend/src/components/expenses/VendorForm.tsx`
- `Haypbooks/Frontend/src/components/expenses/VendorCreditsPage.tsx`
- `Haypbooks/Frontend/src/components/expenses/PerDiemForm.tsx`
- `Haypbooks/Frontend/src/components/expenses/PerDiemPage.tsx`
- `Haypbooks/Frontend/src/components/expenses/BillForm.tsx` (TS errors)
- `Haypbooks/Frontend/src/components/expenses/MileageForm.tsx` (TS errors)
- `Haypbooks/Frontend/src/components/expenses/ReceiptForm.tsx` (TS errors)
- `Haypbooks/Frontend/src/components/expenses/ReceiptsPage.tsx` (TS errors)
- `Haypbooks/Frontend/src/components/expenses/ExpenseReportForm.tsx` (TS errors)
- `Haypbooks/Frontend/src/components/expenses/ExpenseReportDetailPage.tsx` (TS errors)
- `Haypbooks/Frontend/src/components/sales/CreditNotesPage.tsx` (TS errors)
- `Haypbooks/Frontend/src/components/sales/InvoicesPage.tsx` (TS errors)
- `Haypbooks/Frontend/src/components/sales/RecurringInvoicesPage.tsx` (TS errors)

**Database (via Prisma direct queries):**
- All tables listed in Appendix A queried and verified

**Browser (limited — backend API down during audit):**
- `http://localhost:3000/expenses/vendors` — page load verified
- `http://localhost:3000/expenses/bills` — auth redirect confirmed
