# Phase 16A — Payroll Voiding & GL Reversal Workflow (A4)

**Status:** DONE & VERIFIED (2026-10-18)  
**Requirement Reference:** Roadmap A4 (Release-blocking financial work)  
**Repository Path:** `Haypbooks/Backend/`  

---

## 1. Overview & Architecture
The Payroll Voiding workflow allows authorized company operators (under `JwtAuthGuard` and `CompanyAccessGuard`) to void a previously `POSTED` payroll run. To ensure sub-ledger and General Ledger financial consistency, the void operation creates an inverted General Ledger reversing journal entry inside an atomic Prisma `$transaction`.

---

## 2. Key Components & Implementation Details

### 2.1 Sub-Ledger GL Reversal (`src/shared/sub-ledger.service.ts`)
- Added `reversePayrollRunFromGL(tx, companyId, journalEntryId, reason, reversalDate)`:
  - Invokes `createReversingJE` from `./gl-integration`.
  - Re-uses core GL inversion: swaps debits and credits, links reversing journal entry, and enforces `assertPeriodOpen`.

### 2.2 Payroll Service (`src/payroll/payroll.service.ts`)
- Updated `voidPayrollRun(userId, companyId, runId, reason?)`:
  - **Pre-flight Invariants:** Asserts user access via `assertAccess(userId, companyId)`. Finds run via `findPayrollRunById`.
  - **Status Guard:** Rejects runs not in `POSTED` status (throws `BadRequestException('Only POSTED payroll runs can be voided')`).
  - **Atomicity:** Wraps all operations in `this.prisma.$transaction(async (tx) => { ... })`.
  - **GL Reversal:** If `run.journalEntryId` is populated, calls `this.subLedger.reversePayrollRunFromGL`.
  - **Audit & Status Update:** Updates `PayrollRun` status to `VOID`, posting status to `VOIDED`, and sets `deletedAt: new Date()`.
  - **Paycheck Soft-Delete:** Cascades soft-delete to all linked `Paycheck` records matching `payrollRunId: runId` by setting `deletedAt: new Date()`.

### 2.3 Controller Delegation (`src/payroll/payroll.controller.ts`)
- Preserves existing route `POST /api/companies/:companyId/payroll/runs/:runId/void`.
- Preserves authentication and authorization guards: `@UseGuards(JwtAuthGuard, CompanyAccessGuard)`.

---

## 3. Verification & Testing
- Unit tests implemented in `Haypbooks/Backend/src/payroll/payroll.service.spec.ts`.
- Verified test cases (4/4 passing):
  - Successful void of `POSTED` run with GL reversal and paycheck soft-deletion.
  - Rejection with `BadRequestException` when run is `DRAFT`.
  - Rejection with `BadRequestException` when run is already `VOID`.
  - Rejection with `NotFoundException` when run does not exist.
