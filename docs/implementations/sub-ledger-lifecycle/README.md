# Sub-Ledger & AP/AR Posting and Reversal Lifecycle Verification (E12)

## Completion Status
- **STATUS: DONE**
- **STATUS: DONE (verified via HYDRA audit)**
- **Completion Date:** 2026-10-04
- **Scope Clarification:** Only audit item **E12** (`Haypbooks/Backend/src/ap/ap.repository.ts; src/shared/sub-ledger.service.ts`) is archived as complete. Note that `Phase 14` (`Accounting lifecycle controls`) is already listed in the `Completed & Verified Implementation Phases` table (line 111), while Section **`14A` (`Approval workflow completion — legacy Plan D; AUDIT REQUIRED`)** remains in active development in `docs/Road_Map/Road_Map.md`.

## Files & Methods Involved
1. **`Haypbooks/Backend/src/ap/ap.repository.ts`**:
   - `voidBill(companyId, billId, opts)` (lines 275–311): Executes inside a Prisma `$transaction`, calls `createReversingJE(tx, companyId, bill.journalEntryId, ...)` when `bill.journalEntryId` is present, updates `status: 'VOIDED'`, `postingStatus: 'VOIDED'`, `deletedAt: new Date()`, and writes a conditional `VOID` `auditLog` entry when `opts.userId && opts.workspaceId` are provided.
   - `recordBillPayment` & `voidBillPayment` (lines 346–419): Transactional bill payment recording, balance updates, and payment voiding with `BadRequestException('Only posted bill payments can be voided')`.
2. **`Haypbooks/Backend/src/ap/ap.service.ts` & `Haypbooks/Backend/src/expenses/expenses.service.ts`**:
   - `approveBill(userId, companyId, billId)` (lines 507–535): Enforces `PENDING` status check and executes `this.subLedger.postBillToGL(billId, userId, tx)`, bill `APPROVED` / `POSTED` status transition, approval request resolution, and `APPROVE` audit logging inside a single `$transaction`.
   - `voidBill(userId, companyId, billId)` (lines 603–611): Enforces access control, non-void check, and zero-applied-payment check before delegating to `this.repo.voidBill(companyId, billId, { workspaceId, userId })`.
   - `voidBillPayment(userId, companyId, paymentId)` (lines 797–824): Enforces `payment.postingStatus === 'POSTED'`, logs audit metadata, and executes `this.subLedger.postBillPaymentReversalToGL(paymentId, tx)` + `this.repo.voidBillPayment(companyId, paymentId, tx)` inside `$transaction`.
   - `voidMileage`, `voidPerDiem`, `voidVendorCredit`, and `ExpensesService.voidExpenseClaim`: Transactional voiding and sub-ledger GL reversal for posted mileage, per diem, vendor credits, and approved/paid expense claims.
3. **`Haypbooks/Backend/src/ar/ar.service.ts`**:
   - `sendInvoice(userId, companyId, invoiceId)` (lines 1143–1154), `voidInvoice(userId, companyId, invoiceId)` (lines 1156–1166), and `voidPayment(userId, companyId, paymentId)` (lines 1330–1349).
4. **`Haypbooks/Backend/src/shared/sub-ledger.service.ts`**:
   - Enforces `assertPeriodOpen`, double-posting prevention (`journalEntryId` guard), sequential entry numbering (`nextEntryNumber`), and atomic `$transaction` boundaries across all posting and reversal methods.

## Verified Unit Test Coverage
- `Haypbooks/Backend/src/__tests__/ap/gl-integrity.spec.ts` (lines 56–66): Verifies `repo.voidBill` calls `createReversingJE` and updates `status: 'VOIDED', postingStatus: 'VOIDED'`.
- `Haypbooks/Backend/src/__tests__/ap/bill-lifecycle.spec.ts` (lines 121–132): Verifies `service.voidBill` validation and repository delegation.
- `Haypbooks/Backend/src/__tests__/ap/void-lifecycle.spec.ts` (lines 1–194): Verifies all 8 void/reversal test cases across bill payments, mileage, per diem, vendor credits, and approved/paid expense claims.
- `Haypbooks/Backend/src/__tests__/ap/approval-workflow.spec.ts` (line 63): Verifies `postBillReversalToGL` integration.
