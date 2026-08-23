# Platform Owner Route Guard (Phase H-2)

**Status: DONE**

## Overview
Client-side routing guard that prevents non-SUPER_ADMIN users from accessing platform admin pages by redirecting them to the owner dashboard. This is a UX-level guard — the backend SystemRoleGuard remains the real security boundary.

## Problem Solved
Before this guard, users who manually typed `/owner/storage`, `/owner/metrics`, or `/owner/users` in the browser would see a broken page (the React page rendered but all API calls returned 403). This guard intercepts the navigation and redirects unauthorized users before any content renders.

## Architecture

### Guard Location
`Frontend/src/app/(owner)/layout.tsx` — the shared layout for all owner routes.

### Implementation Pattern
- Uses `useUser()` hook to get the current user's `systemRole` and `loading` state
- Uses `usePathname()` to detect if the current route is a platform admin route
- Uses `useRouter().replace()` inside `useEffect` to redirect unauthorized users
- Returns `null` during loading on platform routes to prevent content flash

### Guarded Routes
| Route | Required Role | Redirect Target |
|-------|--------------|-----------------|
| `/owner/storage` | SUPER_ADMIN | `/owner/dashboard` |
| `/owner/metrics` | SUPER_ADMIN | `/owner/dashboard` |
| `/owner/users` | SUPER_ADMIN | `/owner/dashboard` |

### Non-Guarded Owner Routes
These routes are NOT affected by the guard — any owner-role user can access them:
- `/owner/dashboard`
- `/owner/cash-position`
- `/owner/financial-summary`

### Guard Logic Flow
1. Check if current pathname starts with any platform admin route
2. If yes and `loading` is true → return `null` (prevent flash)
3. If yes and user is loaded but not SUPER_ADMIN → redirect to `/owner/dashboard`, return `null`
4. Otherwise → render children normally

### Security Model
- **This guard is UX-only.** It prevents confusing broken-page experiences.
- **Backend enforcement**: `SystemRoleGuard` + `@SystemRoles('SUPER_ADMIN')` on all 9 platform endpoints returns 403 Forbidden.
- If this client-side guard is bypassed, no data leaks — the API blocks unauthorized access.

## Files Modified
| File | Change |
|------|--------|
| `Frontend/src/app/(owner)/layout.tsx` | Added route guard with useUser, usePathname, useRouter |

## Dependencies
- `useUser()` hook (`Frontend/src/hooks/use-user.ts`) — provides `user.systemRole` and `loading` state
- Backend `SystemRoleGuard` (`Backend/src/auth/guards/system-role.guard.ts`) — the real security boundary

## Commit
`28112812` — feat(frontend): guard platform owner routes for non-SUPER_ADMIN users
