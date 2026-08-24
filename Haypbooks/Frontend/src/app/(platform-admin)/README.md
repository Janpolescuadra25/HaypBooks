# Platform Admin Route Group

## Overview

This directory contains the platform owner admin dashboard, which is isolated from company-level admin routes.

- Access is restricted to users with `systemRole === 'SUPER_ADMIN'`
- Routes live under the route group: `/platform-admin/*`
- Verified pages:
  - `/platform-admin/metrics`
  - `/platform-admin/storage`
  - `/platform-admin/users`

## Architecture

- The route group is implemented using Next.js route groups. Parentheses around `(platform-admin)` mean the folder does not add a URL segment.
- `layout.tsx` is the platform-admin layout file.
- The layout enforces the SUPER_ADMIN check using `useUser()` and a redirect back to `/home/dashboard` when the user is not authorized.
- The auth check uses safe short-circuit evaluation:
  - `!user || user.systemRole !== 'SUPER_ADMIN'`
  - This correctly handles null/undefined `user` state while the auth status is loading.
- The layout does not share `OwnerTopBar`/`OwnerSidebar` with company admin routes.
- This layout is fully isolated for platform owner administration.

## Pages

- `platform-admin/metrics/page.tsx` — Platform Metrics dashboard (plan distribution, growth history, snapshots, MRR)
- `platform-admin/storage/page.tsx` — Storage Management (per-company storage, limits, R2 usage)
- `platform-admin/users/page.tsx` — User Management (all users, suspend/reactivate, sessions, role assignment)

## Backend Endpoints Consumed

- All pages consume platform admin endpoints under `/api/owner/*`
- Every endpoint should require `JwtAuthGuard` and `SystemRoleGuard` with `@SystemRoles('SUPER_ADMIN')`
- Verified endpoint list (10 total):
  - `/api/owner/health`
  - `/api/owner/storage/usage`
  - `/api/owner/storage/usage/:companyId`
  - `/api/owner/storage/limits/:companyId`
  - `/api/owner/users`
  - `/api/owner/users/:userId/status`
  - `/api/owner/metrics/plan-distribution`
  - `/api/owner/metrics/snapshot`
  - `/api/owner/metrics/history`
  - `/api/owner/metrics/*`

## Notes

- `OwnerController` is currently the backend controller for these platform-owner endpoints.
- The current roadmap item is to rename/reorganize it into a dedicated `PlatformAdminController` module for code clarity.
- Status: DONE
