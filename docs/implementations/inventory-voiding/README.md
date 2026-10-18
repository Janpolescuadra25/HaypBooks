# Phase A5: Inventory Transaction Voiding & GL Reversal Workflow

**Implementation Date:** 2026-10-18  
**Status:** DONE & VERIFIED (Commit `edbdaacd1ee335481601fb7f00dab7f29b21c90f`)  
**Target Module:** `Haypbooks/Backend/src/inventory/` & `Haypbooks/Backend/src/shared/`

---

## 1. Executive Summary
Phase A5 implements a fail-closed, atomic voiding workflow for inventory transactions with automatic General Ledger reversal. It mirrors the accounting integrity controls established in Phase 16A (Payroll Voiding), ensuring that inventory transaction adjustments leave an immutable audit trail and prevent discrepancies between inventory sub-ledgers and the balance sheet.

---

## 2. Architecture & Transaction Boundaries

### 2.1 Sub-Ledger GL Reversal Integration
- **Service:** `Haypbooks/Backend/src/shared/sub-ledger.service.ts`
- **Method:** `reverseInventoryTransactionGL(companyId: string, transactionId: string, reason?: string, tx?: any)`
- **Behavior:**
  1. Resolves original journal entry by matching `sourceReferenceId: transactionId` and `transactionSource: 'Inventory Transaction'`.
  2. Asserts the accounting period is open using `assertPeriodOpen`.
  3. Reverses journal lines by generating an offsetting journal entry via `createReversingJE`.
  4. Marks the transaction `postingStatus: 'VOIDED'`.

### 2.2 Inventory Service Workflow
- **Service:** `Haypbooks/Backend/src/inventory/inventory.service.ts`
- **Method:** `voidInventoryTransaction(userId: string, companyId: string, transactionId: string, reason?: string)`
- **Safety Gates & Validation:**
  - User authorization enforced via `assertAccess(userId, companyId)`.
  - Transaction existence and `companyId` scoping strictly asserted.
  - State machine invariant: Only transactions in `POSTED` status can be voided. Rejects `DRAFT` or already `VOIDED` transactions with `BadRequestException`.
  - Atomic execution: Status mutation to `VOIDED`, soft-deletion (`deletedAt: new Date()`), sub-ledger GL reversal, and audit logging are wrapped inside a single Prisma `$transaction(async (tx) => ...)`.
  - Comprehensive audit log written to `tx.auditLog.create` with action `VOID_INVENTORY_TRANSACTION`.

### 2.3 API Routing & Security Guards
- **Controller:** `Haypbooks/Backend/src/inventory/inventory.controller.ts`
- **Endpoints Exposed:**
  - `POST /api/companies/:companyId/inventory/transactions/:transactionId/post` -> Triggers GL posting for draft transactions.
  - `POST /api/companies/:companyId/inventory/transactions/:transactionId/void` -> Triggers transactional GL reversal and voiding.
- **Security Guards:** Inherits controller-level `@UseGuards(JwtAuthGuard, CompanyAccessGuard, WorkspaceAccessGuard)`.

---

## 3. Unit Test Verification
- **Test File:** `Haypbooks/Backend/src/inventory/inventory.service.spec.ts`
- **Execution Command:** `npm run test:unit -- src/inventory/inventory.service.spec.ts`
- **Test Results (5/5 passing):**
  1. `successfully voids a POSTED inventory transaction, reverses GL, updates status, and creates an audit log` (PASS)
  2. `throws NotFoundException when the inventory transaction does not exist or belongs to a different company` (PASS)
  3. `throws BadRequestException when the inventory transaction is in DRAFT status` (PASS)
  4. `throws BadRequestException when the inventory transaction is already VOIDED` (PASS)
  5. `throws BadRequestException when the GL reversal fails` (PASS)
