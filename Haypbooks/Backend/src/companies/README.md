# Companies Module

Multi-company management for HaypBooks: company lifecycle (create, update, soft-archive), per-user company access, workspace-user membership and invitations, owner-level dashboards, per-company dashboards, business-health metrics, and overdue tracking.

## Module wiring (`companies.module.ts`)

- **Imports:** `PrismaRepositoriesModule`, `AccountingModule`
- **Providers:** `CompanyService`, `CompanyRepository`, `PrismaService`, `MailService`
- **Controllers:** `CompaniesController`, `WorkspaceController`
- **Exports:** `CompanyService`

`AccountingModule` is imported so that new companies can be seeded with a default chart of accounts at creation time (`accountingService.seedDefaultAccounts`).

## Key files

- `companies.module.ts` - NestJS module registration and provider wiring
- `company.controller.ts` - company endpoints under `api/companies`
- `workspace.controller.ts` - workspace-level endpoints under `api/workspace`
- `company.service.ts` - business logic for company lifecycle, access, invites, dashboards, and health metrics
- `company.repository.prisma.ts` - Prisma data access with per-user ownership filtering
- `subscription.util.ts` - subscription ownership validation
- `dto/` - `CreateCompanyDto`, `UpdateCompanyDto`, `CompanyGrantAccessDto`, `CompanySendInviteDto`
- `__tests__/` - behavior specs for company creation, `findForUser` access filtering, repository behavior, and subscription idempotency

## Endpoints

### CompaniesController (`api/companies`)

All routes require `JwtAuthGuard`.

- **Create:** `POST /api/companies` - additionally guarded by `WorkspaceTypeGuard` with `@RequireWorkspaceType('OWNER')` (prevents cross-role entity creation)
- **List:** `GET /api/companies`, `GET /api/companies/recent`, `GET /api/companies/current`, `GET /api/companies/:id`
- **CRUD:** `PUT /api/companies/:id`, `DELETE /api/companies/:id` (soft archive), `PATCH /api/companies/:id/last-accessed`
- **Settings:** `GET /api/companies/:id/settings`, `PUT /api/companies/:id/settings`
- **Company users:** `GET /api/companies/:id/users`, `GET /api/companies/:id/workspace-users`, `POST /api/companies/:id/workspace-users` (invite), `POST /api/companies/:id/users` (grant access), `DELETE /api/companies/:id/users/:targetUserId` (revoke), `PATCH /api/companies/:id/users/:targetUserId/role`
- **Invites:** `GET /api/companies/:id/invites`, `POST /api/companies/:id/invites`, `DELETE /api/companies/:id/invites/:inviteId`, `POST /api/companies/invites/:inviteId/accept`
- **Roles:** `GET /api/companies/:id/roles`
- **Owner dashboards** (additionally `RolesGuard` with `@Roles('Owner', 'Admin')`): `GET /api/companies/dashboard`, `GET /api/companies/cash-position`, `GET /api/companies/financial-summary`
- **Company dashboards:** `GET /api/companies/:id/dashboard/summary`, `.../cash-position`, `.../receivables`, `.../payables`, `.../recent-transactions`, `.../upcoming`
- **Business health:** `GET /api/companies/:id/health/metrics`, `.../liquidity`, `.../profitability`, `.../trends`
- **Overdue items:** `GET /api/companies/:id/overdue/all`, `.../invoices`, `.../bills`

### WorkspaceController (`api/workspace`)

- `GET /api/workspace/capabilities` - feature-flag capabilities for the authenticated user's workspace; the frontend uses this to show or hide navigation sections that point to features not yet enabled for the workspace

## Service responsibilities (`company.service.ts`)

- Company creation - `createCompany` and `createCompanyUnderTenant` both call `accountingService.seedDefaultAccounts` so every new company starts with a default chart of accounts
- Per-user listing and lookup - `listCompaniesForUser`, `listRecentForUser`, `getCompanyForUser` (ownership-filtered)
- Workspace capabilities - `getWorkspaceCapabilities` (feature flags)
- Invitation flow - `sendInvite`, `listInvites`, `cancelInvite`, `acceptInvite`
- Membership management - `grantCompanyAccess`, `revokeCompanyAccess`, `updateUserRole`, `listCompanyUsers`, `inviteCompanyUser`
- `archiveCompany` - soft archive
- Owner dashboards - `getOwnerDashboard`, `getOwnerCashPosition`, `getOwnerFinancialSummary`
- Company dashboards - `getDashboardSummary`, `getCashPosition`, `getReceivablesSummary`, `getPayablesSummary`, `getRecentTransactions`, `getUpcomingItems`
- Business health - `getHealthMetrics`, `getLiquidityRatios`, `getProfitabilityMetrics`, `getHealthTrends`
- `getOverdueItems` - overdue invoices and bills

## Repository (`company.repository.prisma.ts`)

- `findForUser` - ownership filtering so users only see companies they belong to
- `ensureSubscriptionForCompany` - idempotent, race-safe subscription seeding
- `acceptInviteForUser` - invite acceptance with default workspace-role seeding

## Subscription util (`subscription.util.ts`)

- `validateSubscriptionOwnership` - enforces exactly one of `companyId` or `practiceId` per subscription

## Security model

- Every route requires `JwtAuthGuard`
- Company creation additionally requires an OWNER-type workspace (`WorkspaceTypeGuard` + `@RequireWorkspaceType('OWNER')`)
- Owner dashboard routes additionally require `Owner` or `Admin` workspace roles (`RolesGuard` + `@Roles('Owner', 'Admin')`)
- Data-level scoping through per-user ownership filters in the repository layer

## Tests

Four spec files under `__tests__/` cover company creation, per-user access filtering, repository behavior, and subscription idempotency.
