# WorkspaceAccessGuard Implementation

## Status
**DONE & VERIFIED** (Task 510 Batch 1 Rollout & Hardening, Commit `b1b3fb46`)

## Overview
`WorkspaceAccessGuard` provides centralized tenant-isolation security across backend controllers. It verifies that an authenticated user possesses active, non-deleted membership in the requested workspace before allowing execution of workspace-scoped routes.

## Architecture & Core Security Controls
1. **Multi-Source Workspace Identification**:
   - Route parameters (`:workspaceId`, `:tenantId`)
   - Request headers (`x-workspace-id`, `x-tenant-id`)
   - User JWT claims (`user.workspaceId`, `user.tenantId`)
   - Company lookup fallback: when `:companyId` is supplied, it resolves the associated `workspaceId` via Prisma.
2. **Fail-Closed Type & Membership Assertion**:
   - Rejects array `workspaceId` payloads with `ForbiddenException('Workspace context is required')`.
   - Requires explicit active status: `status: 'ACTIVE'` and `deletedAt: null`.
3. **Request Context Propagation**:
   - Attaches `workspaceId` and `workspaceUser` directly to the request object.
   - Synchronizes `setRequestContext({ workspaceId })` for downstream sub-ledger and service calls.

## Batch 1 Rollout Scope (10 Core Controllers)
The guard is active and chained at the class level via `@UseGuards(JwtAuthGuard, CompanyAccessGuard, WorkspaceAccessGuard)` or `@UseGuards(JwtAuthGuard, WorkspaceAccessGuard)` across:
1. `src/banking/banking.controller.ts`
2. `src/inventory/inventory.controller.ts`
3. `src/reporting/reporting.controller.ts`
4. `src/accounting/accounting.controller.ts`
5. `src/audit/audit.controller.ts`
6. `src/general-ledger/general-ledger.controller.ts`
7. `src/expenses/expenses.controller.ts`
8. `src/sales/sales.controller.ts`
9. `src/practice/practice.controller.ts`
10. `src/practice-hub/practice-hub.controller.ts`

## Dependency Injection
- Wired `PrismaService` from `../repositories/prisma/prisma.service` into `src/sales/sales.module.ts` providers array.

## Test Harness Verification
- Unit test suite: `src/auth/guards/workspace-access.guard.spec.ts`
- Test status: **10/10 unit tests passing**
- Coverage includes negative assertions for missing users, array workspace IDs, non-existent company IDs, inactive memberships, and cross-tenant access attempts.