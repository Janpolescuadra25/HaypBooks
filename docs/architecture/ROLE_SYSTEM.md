# Role System Architecture

## Status: CURRENT ✅ (as of JWT payload fix)

## Overview

HaypBooks has THREE orthogonal role concepts that serve different purposes. They share the name "role" but are NOT interchangeable.

## The Three Role Layers

### Layer 1: Hub Role (Dashboard Routing)

- **Source:** `User.preferredHub` in the database
- **Values:** `'OWNER'` or `'ACCOUNTANT'`
- **Synthesized as:** `role: 'business'` (OWNER) or `role: 'accountant'` (ACCOUNTANT) in the user repository
- **Carried in:** JWT payload as `role`, API response (`/api/users/me`) as `role`
- **Consumed by:** Frontend routing (which dashboard to show), onboarding flow
- **Purpose:** Determines which hub/dashboard type the user accesses

### Layer 2: RBAC Permission Role (What Can You Do?)

- **Source:** `mapRoleForFrontend()` in `auth.controller.ts:33-40`
- **Values:** `'admin' | 'manager' | 'ap-clerk' | 'viewer' | 'no-reports'`
- **Carried in:** Cookie named `role` (set on login, complete-signup, verify-email)
- **Consumed by:**
  - `lib/rbac.ts` — client-side permission checks
  - `lib/rbac-server.ts` — server-side permission checks
  - `lib/rbac-shared.ts` — `ROLE_PERMISSIONS` map and `Role` type definition
  - `components/Sidebar.tsx` — nav item visibility
  - `components/RoleSwitcher.tsx` — dev role switcher (hardcoded options)
- **Purpose:** Determines what UI elements and API actions the user can access
- **Current mapping:** All workspace owners (both `business` and `accountant`) map to `'admin'` RBAC permissions

### Layer 3: Platform System Role (Platform-Level Access)

- **Source:** `User.systemRole` in the database (mapped to column `role` via `@map("role")`)
- **Values:** `'USER' | 'SUPPORT' | 'ADMIN' | 'SUPER_ADMIN'`
- **Carried in:** JWT payload as `systemRole`
- **Consumed by:** Backend guards (intended for future `SystemRoleGuard` in Plan H)
- **Purpose:** Determines platform-level access (e.g., only `SUPER_ADMIN` can access platform owner endpoints)

## Additional JWT Fields

- **`isOwner`** — boolean, derived from `Workspace.ownerUserId` query via `getIsOwner()` in `prisma-auth.service.ts`. Available in JWT and on `request.user` for backend guards. The `RolesGuard` bypass at `roles.guard.ts:39` uses this.

## Role Value by User Type

| User Type | Hub Role (JWT/API) | RBAC Role (Cookie) | System Role (JWT) | isOwner (JWT) |
|-----------|-------------------|--------------------|--------------------|----------------|
| Platform Owner (JP) | `'business'` | `'admin'` | `'SUPER_ADMIN'` | `true` |
| Company Admin | `'business'` | `'admin'` | `'USER'` | `true` or `false` |
| Company Member | `'business'` | `'admin'`* | `'USER'` | `false` |
| Practice Admin | `'accountant'` | `'admin'` | `'USER'` | `true` or `false` |
| Practice Member | `'accountant'` | `'admin'`* | `'USER'` | `false` |

*Note: All users currently map to `'admin'` RBAC. Finer-grained RBAC (manager, ap-clerk, viewer) will be implemented in Plan H.

## Why `mapRoleForFrontend` Is NOT a Bug

The `mapRoleForFrontend()` function maps hub-based roles to RBAC permission roles. Both `'business'` and `'accountant'` map to `'admin'`. This is intentional — workspace owners should have admin-level permissions.

The apparent "inconsistency" (JWT has `'business'`, cookie has `'admin'`) is because they serve different layers. The naming is confusing but functionally correct.

## Future Work (Plan H)

Plan H will properly separate the three-role architecture (Owner Admin, Company Admin, Practice Admin). At that point:
- RBAC roles should be derived from the user's actual workspace membership role (not defaulting everyone to `'admin'`)
- The cookie `role` name could be renamed to `rbacRole` for clarity
- The JWT `role` could be renamed to `hubType` for clarity
- A proper `SystemRoleGuard` will use `systemRole` for platform endpoint protection
