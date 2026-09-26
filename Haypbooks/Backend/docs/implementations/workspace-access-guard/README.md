# Phase 12 — Workspace-Scoped Tenant Isolation (`WorkspaceAccessGuard`)

**STATUS: DONE & VERIFIED**  
**Date:** 2026-09-26  
**Phase:** Phase 12 — Security & Tenant Isolation  
**Task ID:** Task 384  
**Base Commit:** 35c21160  

---

## 1. Overview & Objective
Enforces strict multi-tenant boundary isolation across all workspace-scoped backend endpoints. Completely prevents unauthorized cross-tenant data access, stale JWT exploitation, and unvalidated workspace parameter tampering by enforcing server-side `WorkspaceUser` active membership validation.

---

## 2. Core Architecture & Files Modified
1. **WorkspaceAccessGuard (`src/auth/guards/workspace-access.guard.ts`):**
   - Extracts target `workspaceId` from:
     - `request.params.workspaceId`
     - `request.query.workspaceId`
     - Header `x-workspace-id`
     - Authenticated JWT payload (`user.workspaceId` or `user.tenantId`)
   - Queries Prisma model `WorkspaceUser` for active membership:
     - `workspaceId`: Target workspace ID
     - `userId`: Authenticated user ID
     - `status`: Must be `'ACTIVE'`
     - `deletedAt`: Must be `null`
   - Injects verified context into request:
     - `request.workspaceId = workspaceId`
     - `request.workspaceUser = membership`
   - Updates asynchronous request context via `setRequestContext({ workspaceId, userId })`.
   - Throws fail-closed `403 Forbidden` on any membership absence, status mismatch, or soft-deleted record.
   - Throws `401 Unauthorized` if no authenticated user is present.
2. **PracticeHubController (`src/practice-hub/practice-hub.controller.ts`):**
   - Bound with `@UseGuards(JwtAuthGuard, WorkspaceAccessGuard)` across all workspace-scoped routes.
3. **PracticeController (`src/practice/practice.controller.ts`):**
   - Bound with `@UseGuards(JwtAuthGuard, WorkspaceAccessGuard)` across all workspace practice routes.
4. **Comprehensive Unit Test Suite (`src/auth/guards/workspace-access.guard.spec.ts`):**
   - 6 passing unit tests covering active membership, cross-tenant denial, inactive status, parameter resolution, header resolution, and missing authentication.

---

## 3. Preserved Boundary Invariants
- **Database Schema:** Prisma schema remains untouched; utilizes existing `Workspace` and `WorkspaceUser` tables.
- **Fail-Closed Default:** Unauthenticated or cross-tenant requests are immediately denied with `401` or `403`.
- **Company & Test Endpoints:** Existing `CompanyAccessGuard` and `TestEndpointGuard` invariants preserved.

---

## 4. Verification & Quality Gates
- Guard Jest Suite: `npx jest src/auth/guards/workspace-access.guard.spec.ts --runInBand --verbose` → 6/6 Tests Passed (Exit code 0).
- Test Module Suite: `npx jest src/test/test.guard.spec.ts --runInBand --verbose` → 8/8 Tests Passed (Exit code 0).
- Backend TypeScript: `npx tsc --noEmit` → Exit code 0.
- Frontend Lint: `npm run lint -- --quiet` → Exit code 0 (`✔ No ESLint warnings or errors`).
- Frontend TypeScript: `npm run typecheck` → Exit code 0.