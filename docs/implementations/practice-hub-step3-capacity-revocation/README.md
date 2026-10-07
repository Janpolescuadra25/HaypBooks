# Practice Hub Step 3: Accept-Time Capacity Enforcement, Atomic Invite Acceptance, and Revocation

## 1. Overview & Roadmap Status
- **Phase**: Phase 11 (`Practice Hub`) — Step 3 increment
- **Implementation Commit**: `fe1a9b485c1640826c3723f5f3786617a8c1dc2c` (`feat(practice-hub): enforce accept-time capacity, invite race guard, and revocation`)
- **Parent Baseline Commit**: `8843cdb4bc597e59854eaff711f01004c796b3c5`
- **Current Phase 11 Roadmap Status**: `PARTIAL` (`docs/Road_Map/Road_Map.md`)
  - Steps 1, 2, and 3 (practice provisioning, invite creation with `Plan.maxClients` checks, accept-time `maxClients` re-validation, atomic `PENDING -> ACCEPTED` race guard, invite revocation, engagement revocation, and `WorkspaceAccessGuard` delegated access cutoff) are implemented and unit-tested.
  - Phase 11 remains `PARTIAL` overall because practice-level owner/staff/client role hierarchies, task management, review workflows, client context switching UX, and progression remain open.

---

## 2. Live Schema & Architecture Context
The Practice Hub implementation operates on the live Prisma models in `Haypbooks/Backend/prisma/schema.prisma`:
- **`Practice`** (`schema.prisma:1365-1384`): Practice container linked to an anchor `workspace` (`Company` via `workspaceId`, storing the practice subscription and `Plan.maxClients`), `practiceUsers` (`PracticeUser[]`), `engagements` (`Engagement[]`), and `invites` (`PracticeInvite[]`).
- **`PracticeUser`** (`schema.prisma:1386-1396`): Links a `User` (`userId`) to a `Practice` (`practiceId`) and `workspaceId`. Note: the live `PracticeUser` schema defines `id`, `practiceId`, `workspaceId`, and `userId` only; it does **not** currently define a `PracticeUser.role` or `PracticeUser.status` field.
- **`Engagement`** (`schema.prisma:1398-1405`): Links a `Practice` (`practiceId`) to a client `Company` (`workspaceId`) with lifecycle `status` (`ACTIVE`, `ARCHIVED`) and `endDate`.
- **`PracticeInvite`** (`schema.prisma:12239-12256`): Tracks client invitations (`id`, `practiceId`, `email`, `workspaceId`, `token`, `status`, `expiresAt`, `acceptedByUserId`, `acceptedAt`) with compound index `@@index([practiceId, status])`.
- **`Plan.maxClients`** (`schema.prisma:11874`): Defines the maximum allowed client count on the practice anchor workspace's active subscription plan (with a default fallback of `5` when no active plan limit is configured).

*(Note: Legacy/alternative model names such as `PracticeOrganization`, `PracticeMember`, or `PracticeClientEngagement` are not used in the live repository.)*

---

## 3. What Was Implemented in Step 3

### 3.1 Service Layer (`Haypbooks/Backend/src/practice-hub/practice-hub.service.ts`)
1. **Shared Plan Capacity Helper (`getPracticeClientLimit`)**:
   - Resolves `practice.workspace?.subscriptions?.[0]?.plan?.maxClients ?? 5` so both invite creation and invite acceptance enforce the same plan limit.
2. **Invite-Time Capacity Enforcement (`inviteClient`)**:
   - Counts active `Engagement` records (`status: 'ACTIVE'`) plus non-expired `PENDING` `PracticeInvite` records (`status: 'PENDING'`, `expiresAt: { gt: new Date() }`).
   - Throws `ForbiddenException` when `activeEngagementsCount + pendingInvitesCount >= maxClients`.
3. **Accept-Time Capacity Re-Validation & Atomic Race Guard (`acceptInvite`)**:
   - Verifies invite existence, `status === 'PENDING'`, non-expiration, email match (`user.email.toLowerCase() === invite.email.toLowerCase()`), and workspace membership (`WorkspaceUser` with `status: 'ACTIVE'` and `role` in `['OWNER', 'ADMIN']`) before opening the transaction.
   - Inside `$transaction`:
     - Re-checks `activeEngagementsCount` (`status: 'ACTIVE'` for `practiceId`, excluding the target `workspaceId` if already linked) against `maxClients` (`Plan.maxClients ?? 5`), throwing `ForbiddenException('Practice has reached its maximum client limit...')` if capacity is full at accept time.
     - Executes an atomic conditional update `tx.practiceInvite.updateMany({ where: { id: invite.id, status: 'PENDING', expiresAt: { gt: now } }, data: { status: 'ACCEPTED', acceptedByUserId: userId, acceptedAt: now } })` and throws `BadRequestException('Invite has already been processed or expired')` if `claimResult.count !== 1`, preventing concurrent double-acceptance race conditions.
     - Reactivates an existing non-active `Engagement` (`status: 'ACTIVE'`, `endDate: null`) or creates a new `ACTIVE` `Engagement` if none exists.
4. **Pending Invite Revocation (`revokeInvite`)**:
   - Resolves the caller's practice via `findPracticeForUser(userId)` (verifying the caller has a `PracticeUser` record associated with a practice) and verifies `invite.practiceId === practice.id` (`ForbiddenException` otherwise).
   - Note on current authorization model: `revokeInvite` enforces practice association + `practiceId` ownership (`invite.practiceId === practice.id`); it does **not** currently enforce explicit `PracticeUser` role checks (`OWNER`/`ADMIN`/`MANAGER`), as `PracticeUser` has no `role` or `status` field in the live schema.
   - Verifies `invite.status === 'PENDING'` (`BadRequestException` otherwise) and updates the invite to `status: 'REVOKED'`, immediately freeing reserved pending invite capacity.
5. **Active Engagement Revocation (`revokeEngagement`)**:
   - Resolves the caller's practice via `findPracticeForUser(userId)` and verifies `engagement.practiceId === practice.id` (`ForbiddenException` otherwise). As with `revokeInvite`, authorization is currently based on practice association and `practiceId` ownership rather than a schema-level `PracticeUser` role field.
   - Verifies `engagement.status === 'ACTIVE'` (`BadRequestException` otherwise) and updates the engagement to `status: 'ARCHIVED'` with `endDate: new Date()`.

### 3.2 Controller Endpoints (`Haypbooks/Backend/src/practice-hub/practice-hub.controller.ts`)
- `POST /api/v1/practice-hub/invites/:inviteId/revoke` → `revokeInvite(@Request() req, @Param('inviteId') inviteId: string)`
- `POST /api/v1/practice-hub/engagements/:engagementId/revoke` → `revokeEngagement(@Request() req, @Param('engagementId') engagementId: string)`

### 3.3 Delegated Workspace Access Cutoff (`Haypbooks/Backend/src/auth/guards/workspace-access.guard.ts`)
- `WorkspaceAccessGuard` (`src/auth/guards/workspace-access.guard.ts:61-80`) prefers direct `WorkspaceUser` membership (`status === 'ACTIVE'`) and falls back to delegated Practice Hub access only when an `Engagement` exists for `workspaceId: companyId` with `status: 'ACTIVE'` and `practice: { practiceUsers: { some: { userId: user.id } } }`.
- When `revokeEngagement` transitions an engagement to `status: 'ARCHIVED'` (with `endDate` set), subsequent delegated requests through `WorkspaceAccessGuard` fail closed with `ForbiddenException`.

---

## 4. Verification & Unit Tests (`Haypbooks/Backend/src/practice-hub/practice-hub.service.spec.ts`)
- **Test File**: `Haypbooks/Backend/src/practice-hub/practice-hub.service.spec.ts` (with `moduleNameMapper` for `^src/(.*)$` in `Haypbooks/Backend/jest.config.js`).
- **Low-Memory / 4096MB Node Heap Verification Command**:
  ```cmd
  cmd /c "cd /d C:\Users\HomePC\Desktop\Haypbooksv9\Haypbooks\Backend && node --max-old-space-size=4096 ./node_modules/jest/bin/jest.js src/practice-hub/practice-hub.service.spec.ts --runInBand --no-cache"
  ```
- **Verified Result**: `1 passed, 1 total` test suite · `11 passed, 11 total` tests (`0` failures), covering:
  1. Valid invite acceptance and engagement creation (`status: 'ACTIVE'`).
  2. Rejecting non-`PENDING` invites.
  3. Rejecting expired invites and marking them `EXPIRED`.
  4. Rejecting mismatched user email.
  5. Rejecting users without active `OWNER`/`ADMIN` membership in the target client workspace.
  6. Idempotent active engagement handling when an `ACTIVE` engagement already exists.
  7. Rejecting invite acceptance when `activeEngagementsCount >= maxClients` at accept time (`ForbiddenException`).
  8. Rejecting concurrent duplicate acceptance when atomic `updateMany` returns `count: 0` (`BadRequestException`).
  9. Revoking a `PENDING` invite (`status: 'REVOKED'`) and rejecting cross-practice revocation (`ForbiddenException`).
  10. Revoking an `ACTIVE` engagement (`status: 'ARCHIVED'`, `endDate: expect.any(Date)`) and rejecting already-archived engagements (`BadRequestException`).
  11. Confirming `WorkspaceAccessGuard` denies delegated client workspace access (`ForbiddenException`) once the engagement is revoked (`status: 'ARCHIVED'`).

---

## 5. Remaining Open Scope in Phase 11 (`PARTIAL`)
Phase 11 remains marked `PARTIAL` in `docs/Road_Map/Road_Map.md`. The following capabilities are **not** yet implemented and must be completed before Phase 11 can be considered complete:
- Practice-level `OWNER` / `STAFF` / `CLIENT` role definitions and role-based permission checks (`PracticeUser` currently has `id`, `practiceId`, `workspaceId`, and `userId` without `role` or `status` fields, and `revokeInvite`/`revokeEngagement` currently check practice membership + `practiceId` ownership rather than explicit role hierarchies).
- Practice task management and review workflows.
- Multi-client workspace switching UX and full progression flows.