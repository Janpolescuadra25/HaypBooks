# Phase 17 Journey 3 — AP Bill Lifecycle Implementation & Verification

## Status: DONE (VERIFIED COMPLETE)
# Phase 17 Journey 3: AP Bill Lifecycle Acceptance Tests

## 1. Overview
- **Phase**: Phase 17 (Acceptance & Integration Testing)
- **Journey**: Journey 3 — AP Bill Lifecycle & Double-Entry GL Verification
- **Date**: 2026-11-04
- **Branch**: `checkpoint/dev`

---

## 2. Implementation Artifacts
- **Test Specification**: `Haypbooks/Backend/test/acceptance/acceptance-journey3-ap-bill-lifecycle.acceptance-spec.ts`
- **Associated Commits**:
  * `af3f58f`: Task 949: Fix UUID import, bank account GL resolution, and bill payment nullability
  * `d0cb66e`: Phase 17 Journey 3: Add AP bill lifecycle acceptance test suite
  * `10c4131`: docs(roadmap): update checkpoint to 2026-11-04, record Journey 3 test suite implementation, and archive Phase 12

---

## 3. Core Architecture & Acceptance Scope
The test suite validates the complete lifecycle of Accounts Payable bills using direct module service access (`ApService`, `SubLedgerService`):

1. **Scenario 1: Bill Creation & Validation**
   - Submits bill lines linked to Expense account code `5010`.
   - Enforces runtime schema validation, rejecting empty lines or invalid account references.
2. **Scenario 2: Anti-Self-Approval Enforcement**
   - Enforces strict separation of duties: creators are barred from approving their own bills.
3. **Scenario 3: Multi-Entity Access Isolation**
   - Validates that cross-company approval attempts reject with access errors.
4. **Scenario 4: Bill Approval & General Ledger Accrual**
   - Approval via `ApService.approveBill` transitions status to `APPROVED`.
   - Triggers `SubLedgerService.postBillToGL`, generating a balanced `JournalEntry` (Debit Expense `5010`, Credit Accounts Payable `2010`).
   - Links `Bill.journalEntryId` 1:1.
5. **Scenario 5: Bill Payment & General Ledger Settlement**
   - Records payment via `ApService.recordPayment` (or `payBill`), transitioning status to `PAID`.
   - Triggers `SubLedgerService.postBillPaymentToGL`, generating a balanced `JournalEntry` (Debit Accounts Payable `2010`, Credit Cash/Bank `1010`).
   - Links `BillPayment.journalEntryId` 1:1.
6. **Scenario 6: Immutability & Re-Payment Guards**
   - Rejects duplicate payment attempts against already settled bills.

---

## 4. Test Environment Requirements
- **Runner**: Jest via acceptance configuration (`Haypbooks/Backend/jest.acceptance.config.js`).
- **Database**: PostgreSQL with isolated `acceptance_test` schema.
- **Safety Control**: Requires `DATABASE_URL` pointing to test schema; execution against production/development schemas is blocked.

## 5. Acceptance Execution Notes
- Use a disposable PostgreSQL schema or database dedicated to `acceptance_test`.
- Ensure both `DATABASE_URL` and `ACCEPTANCE_DATABASE_URL` point to the correct acceptance database before running the direct-service suite.
- Validate bank account mapping and GL codes before payment settlement assertions, because the test exercises real posting through the sub-ledger services.
- All checks must be executed in a fail-closed setup that aborts on mismatched journal entries or account resolution.
