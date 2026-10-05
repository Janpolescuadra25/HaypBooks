# Approval Workflow Completion (14A)

## Completion Status
- **STATUS: DONE**
- **STATUS: DONE (verified via HYDRA audit)**
- **Completion Date:** 2026-10-05
- **Scope Clarification:** This task completes Section **14A** (`Approval workflow completion`) for the AP bill approval lifecycle. It covers pending approval queue discovery, endpoint exposure, self-approval prevention, and replay protection for already-posted bills.

## Files & Methods Involved
1. **`Haypbooks/Backend/src/ap/ap.service.ts`**:
   - `listPendingApprovals(userId, companyId)`: verifies the caller is an active workspace member with permission to view pending approvals, scopes results to the company and active workspace workflow, and excludes legacy approval rows without `requestedById`.
   - `approveBill(userId, companyId, billId)`: rejects bills that are still `DRAFT`, blocks self-approval for both bill creators and original requesters, requires exactly one pending approval request, validates `requestedById`, and blocks replay when `postingStatus === 'POSTED'`.
   - `deleteBill(userId, companyId, billId)` and `voidBill(userId, companyId, billId)`: cancel any pending approval requests before deleting or voiding a bill.
2. **`Haypbooks/Backend/src/ap/ap.controller.ts`**:
   - `GET /api/companies/:companyId/ap/approvals/pending`: controller route exposing the pending approval queue under the existing company/workspace guard chain.
3. **`Haypbooks/Backend/src/__tests__/ap/approval-workflow.spec.ts`**:
   - verifies pending-approval listing, creator/requester self-approval denial, replay protection, and single-pending-request enforcement.
4. **`Haypbooks/Backend/src/__tests__/ap/bill-lifecycle.spec.ts`**:
   - retains bill lifecycle coverage and the direct-approval guard around `DRAFT` bills when workflow enforcement is active.

## Business Rules Enforced
- A caller must be an active workspace member and cannot be a `VIEWER` when listing pending approvals.
- `listPendingApprovals()` only returns pending `BILL` approval requests within the target company and active workspace.
- Legacy approval requests missing `requestedById` are ignored in the queue and rejected if encountered during approval.
- A bill creator cannot approve their own bill.
- The original requester for the pending approval cannot approve the same bill.
- Approval is rejected if the bill has no pending approval request or more than one pending request.
- An already posted bill cannot be approved again (`postingStatus === 'POSTED'` triggers replay protection).
- Deleting or voiding a bill cancels any still-pending approval requests tied to that bill.

## Verified Validation
- `npx jest --runInBand --config jest.unit.config.js src/__tests__/ap/approval-workflow.spec.ts src/__tests__/ap/bill-lifecycle.spec.ts`
- `npx tsc --noEmit --pretty false`

## Result
The approval workflow now enforces the same business invariants expected by the schema and the AP lifecycle tests: pending approval queue visibility is tenant-scoped, self-approval is blocked, and duplicate replay attempts are refused before any GL posting occurs.
