# OwnerController Split — Company Endpoint Separation

## What Was Done
Moved 3 company-level endpoints from `OwnerController` to `CompaniesController` to achieve proper architectural separation between platform-level (SUPER_ADMIN) and company-level (Owner/Admin) concerns.

## Why
The `OwnerController` previously contained a mix of platform admin endpoints (storage, users, metrics — SUPER_ADMIN only) and company admin endpoints (dashboard, cash position, financial summary — Owner/Admin). This violated the separation principle established by Phase H-2's frontend route group isolation.

## API Route Changes
| Old Path | New Path |
|----------|----------|
| `GET /api/owner/dashboard` | `GET /api/companies/dashboard` |
| `GET /api/owner/cash-position` | `GET /api/companies/cash-position` |
| `GET /api/owner/financial-summary` | `GET /api/companies/financial-summary` |

## Files Modified
- `Backend/src/companies/company.controller.ts` — added 3 methods + RolesGuard/Roles imports
- `Backend/src/owner/owner.controller.ts` — removed 3 methods + unused imports (CompanyService, RolesGuard, Roles)
- `Frontend/src/hooks/useOwnerDashboard.ts` — updated API path
- `Frontend/src/components/owner/OwnerDashboard.tsx` — updated API paths

## What Remains in OwnerController
After the split, `OwnerController` contains only platform-level SUPER_ADMIN endpoints:
- `health()`
- `getPlatformStorageUsage()`
- `getCompanyStorageUsage()`
- `getUsers()`
- `setUserSuspendStatus()`
- `getPlanDistribution()`
- `recordMetricsSnapshot()`
- `getMetricsHistory()`
- `setStorageLimit()`

## Access Control
- Moved endpoints: `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('Owner', 'Admin')`
- Remaining OwnerController endpoints: `@UseGuards(SystemRoleGuard)` + `@SystemRoles('SUPER_ADMIN')`

## Phase
Plan H, Phase H-1 (Backend Role Separation)
