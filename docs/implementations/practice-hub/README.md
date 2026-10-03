# Practice Hub Architecture & Tenant Access Delegation (Phase 11 Step 1)

## Status
**IN PROGRESS & VERIFIED** (2026-10-03)

## Overview
Phase 11 establishes multi-firm practice management, enabling professional accountants and bookkeeping firms to manage multiple client company workspaces:
1. **Core Models**:
   - `Practice`: firm-level identity linked to a practice subscription.
   - `PracticeUser`: firm staff membership supporting practice-level access.
   - `PracticeInvite`: invitation lifecycle for client onboarding and engagement creation.
   - `Engagement`: active contract linking a Practice to a client Company workspace.
2. **Tenant Access Delegation**:
   - Centralized in `WorkspaceAccessGuard` (`src/auth/guards/workspace-access.guard.ts`).
   - If an authenticated user does not hold direct `WorkspaceUser` membership in a client company workspace, the guard checks for an active `Engagement` between the client workspace and a Practice where the user is a member.
   - On success, attaches `request.practiceAccess` containing engagement and practice metadata.
3. **Security Invariants**:
   - Practice staff are strictly bounded to client companies with an `ACTIVE` engagement status.
   - Terminated or pending engagements fail closed with `ForbiddenException`.
