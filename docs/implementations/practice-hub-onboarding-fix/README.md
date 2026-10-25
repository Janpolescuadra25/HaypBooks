# Practice Hub Onboarding Role & Status Fix (Phase 11 Step 4 Defect Resolution)

## Overview
- **Sub-module:** Practice Workspace Creator Membership Initialization
- **Date:** 2026-10-25
- **Task ID:** Task 856 (Onboarding Role Assignment Fix)
- **Status:** COMPLETE & VERIFIED

---

## 1. Problem Description
When an accounting practice owner signed up and onboarded their workspace through `OnboardingService.completePracticeWorkspace()`, new `PracticeUser` records created in the database were not assigned explicit `role` or `status` values.
Consequently, Prisma applied the schema defaults:
- `role: PracticeUserRole.STAFF`
- `status: PracticeUserStatus.PENDING`

When the workspace creator subsequently attempted to perform firm management actions (such as inviting staff via `createInvite()`), the operation was rejected with HTTP 403 Forbidden by `assertPracticeOwner()` in `practice-hub.service.ts`:
```typescript
if (membership.role !== PracticeUserRole.OWNER || membership.status !== PracticeUserStatus.ACTIVE) {
  throw new ForbiddenException('Only active practice owners can perform this action');
}
```
This locked legitimate practice creators out of their own firm features.

---

## 2. Root Cause Analysis
In `Haypbooks/Backend/src/onboarding/onboarding.service.ts`:
1. The existing workspace attachment path (`workspaceId: existingWorkspace.id`) invoked `(this.prisma as any).practiceUser.upsert` with an incomplete `create` payload omitting `role` and `status`.
2. The new practice workspace creation path (`workspaceId: workspace.id`) similarly omitted `role` and `status` in its `create` payload.
3. The `PracticeUserRole` and `PracticeUserStatus` enums were not imported into `onboarding.service.ts`.

---

## 3. Resolution Details
1. **Type Imports Added:**
   ```typescript
   import { PracticeUserRole, PracticeUserStatus } from '../practice-hub/types/practice-user.types';
   ```
2. **Explicit Role and Status on Create:**
   Both `practiceUser.upsert` invocations were updated to specify:
   ```typescript
   create: {
     practiceId: resolvedPractice.id,
     workspaceId: ...,
     userId,
     role: PracticeUserRole.OWNER,
     status: PracticeUserStatus.ACTIVE,
   }
   ```
3. **Immutability of Existing State:**
   The `update: {}` block in both upsert calls was kept strictly empty to ensure that idempotent onboarding re-runs do not overwrite existing, modified, or demoted user statuses.

---

## 4. Verification & Quality Gates
- **TypeScript Compilation:** `npx tsc --noEmit` in `Haypbooks/Backend` passed with 0 errors.
- **Occurrence Check:** Both upsert `create` blocks verified to contain explicit `role: PracticeUserRole.OWNER` and `status: PracticeUserStatus.ACTIVE`.
- **Working Tree:** Pristine status on `checkpoint/dev`.
