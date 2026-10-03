# Practice Hub Architecture, Tenant Delegation & Client Capacity Gating (Phase 11 Steps 1 & 2)

## Status
**DONE & VERIFIED** (2026-10-03)

## Overview
Phase 11 establishes multi-firm practice management, enabling professional accountants and bookkeeping firms to manage client engagements with subscription-enforced limits:
1. **Core Models**:
   - `Practice`: firm-level identity linked to a practice subscription.
   - `PracticeInvite`: invitation lifecycle for client onboarding and engagement creation.
   - `Engagement`: active contract linking a Practice to a client Company workspace.
   - `Plan`: includes the `maxClients Int?` capacity field.
2. **Tenant Access Delegation**:
   - Centralized in `WorkspaceAccessGuard` (`src/auth/guards/workspace-access.guard.ts`).
   - If direct `WorkspaceUser` membership is not present, the guard validates that the user is an active `PracticeUser` in a Practice that holds an active `Engagement` with the client company workspace.
   - On success, it attaches `request.practiceAccess` with the engagement metadata needed for downstream authorization.
3. **Plan Capacity Gating**:
   - `createInvite()` enforces `plan.maxClients`.
   - It counts current active `Engagement` records for the practice and throws `BadRequestException('Client limit reached for your subscription plan')` when the active count reaches the configured limit.

## Security Invariants
- Practice staff are strictly bounded to client companies with an `ACTIVE` engagement status.
- Terminated or pending engagements fail closed with `ForbiddenException`.
- Client invites cannot exceed the subscribed practice capacity.
