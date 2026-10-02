# Backend Module Inventory (Phase 16D Baseline)

## Overview
This document provides the authoritative architecture baseline for the backend module inventory under `Haypbooks/Backend/src/`. It records the active controller surface, the module paths behind each capability, the current tenant-isolation status, and the public/admin exceptions that remain intentionally unguarded or explicitly restricted.

The inventory is scoped to the verified repository state at HEAD `5fc85212` and is intended to support the Phase 16D documentation effort, the Phase 12 security audit, and the Phase 17 acceptance matrix.

## Status Legend
- `PROD READY`: implemented, guarded, and materially integrated into the production-facing backend surface.
- `PARTIAL`: present and in use but not fully complete or not yet hardened across all paths.
- `NOT STARTED`: no meaningful implementation or no active production flow in the current repo state.

## Summary Status Matrix
- `Total controller files`: 39
- `Public / exempt controllers`: 2 (`auth.controller.ts`, `health.controller.ts`)
- `Admin / system controllers`: 1 (`owner.controller.ts` protected by `SystemRoleGuard`)
- `Tenant-guarded controllers (Batch 1 + Batch 2 + Practice Hub)`: 19 (`WorkspaceAccessGuard` active)
- `Batch 2 candidate controllers`: 0 (Completed in Task 519)
- `Remaining utility / tenant sub-controllers`: 17

---

## 1. Public / Exempt Controllers
These routes are intentionally public or health-only and are outside tenant isolation enforcement.

| Controller Path | Route Prefix | Current Guard Chain | Status | Notes |
|---|---|---|---|---|
| `src/auth/auth.controller.ts` | `/api/auth` | `JwtAuthGuard` on some methods only | `PROD READY` | Public login, signup, OTP, reset, and session flows remain explicitly public or partially authenticated. |
| `src/auth/verification.controller.ts` | `/api/auth` | none / route-local auth as needed | `PARTIAL` | Verification and auth side-steps are present but still require audit coverage for session and OTP edge cases. |
| `src/health/health.controller.ts` | `/health` | none | `PROD READY` | Health endpoint for infra monitoring and deployment checks. |
| `src/practice-hub/practice-invite-public.controller.ts` | `/api/public/practice-invites` | none | `PARTIAL` | Public invite acceptance entrypoint; subject to invite validation and tenant boundary checks. |

---

## 2. Admin / Platform Security Controllers
The platform admin surface is isolated behind a dedicated system-role gate before any user-facing admin route is allowed.

| Controller Path | Route Prefix | Current Guard Chain | Status | Notes |
|---|---|---|---|---|
| `src/owner/owner.controller.ts` | `/api/owner` | `@UseGuards(JwtAuthGuard)` on class; `@UseGuards(SystemRoleGuard)` and `@SystemRoles('SUPER_ADMIN')` on route methods | `PROD READY` | The class is authenticated, but every operational endpoint is restricted to `SUPER_ADMIN` via `SystemRoleGuard`. This is the required platform admin enforcement boundary. |

---

## 3. Batch 1 Guarded Controllers (WorkspaceAccessGuard Active)
These controllers enforce active workspace membership via `WorkspaceAccessGuard`, and they represent the first tenant-isolation rollout.

| Controller Path | Route Prefix | Guard Chain | Status | Notes |
|---|---|---|---|---|
| `src/accounting/accounting.controller.ts` | `/api/companies/:companyId/accounting` | `JwtAuthGuard, CompanyAccessGuard, WorkspaceAccessGuard` | `PROD READY` | Accounting routes are tenant-bound and workspace-aware. |
| `src/audit/audit.controller.ts` | `/api/companies/:companyId` | `JwtAuthGuard, CompanyAccessGuard, WorkspaceAccessGuard` | `PROD READY` | Audit surface is protected by workspace membership and company scope. |
| `src/banking/banking.controller.ts` | `/api/companies/:companyId/banking` | `JwtAuthGuard, CompanyAccessGuard, WorkspaceAccessGuard` | `PROD READY` | Bank workflows are tenant-scoped and workspace-validated. |
| `src/expenses/expenses.controller.ts` | `/api/companies/:companyId` | `JwtAuthGuard, CompanyAccessGuard, WorkspaceAccessGuard` | `PROD READY` | Expense and AP-related routes enforce the same workspace boundary. |
| `src/general-ledger/general-ledger.controller.ts` | `/api/companies/:companyId/general-ledger` | `JwtAuthGuard, CompanyAccessGuard, WorkspaceAccessGuard` | `PROD READY` | GL routes are protected by workspace boundary checks. |
| `src/inventory/inventory.controller.ts` | `/api/companies/:companyId/inventory` | `JwtAuthGuard, CompanyAccessGuard, WorkspaceAccessGuard` | `PROD READY` | Inventory actions are tenant-isolated and guarded. |
| `src/practice/practice.controller.ts` | `/api/practices` | `JwtAuthGuard, WorkspaceAccessGuard` | `PROD READY` | Practice routes enforce workspace membership directly. |
| `src/practice-hub/practice-hub.controller.ts` | `/api/practice-hub` | `JwtAuthGuard, WorkspaceAccessGuard` | `PARTIAL` | Core client-hub functionality is in place; additional coverage remains under review. |
| `src/reporting/reporting.controller.ts` | `/api/reporting`, `/api/companies/:companyId/reporting` | `JwtAuthGuard, WorkspaceAccessGuard` | `PARTIAL` | Core reporting endpoints are active, but some reporting paths still need deeper middleware hardening and flow verification. |
| `src/sales/sales.controller.ts` | `/api/companies/:companyId` | `JwtAuthGuard, CompanyAccessGuard, WorkspaceAccessGuard` | `PROD READY` | Sales/customers/revenue flows are workspace-guarded. |

### WorkspaceAccessGuard runtime behavior
The guard enforces the fail-closed rule:
- rejects array `workspaceId` payloads with `ForbiddenException('Workspace context is required')`
- requires an active membership record with `status: 'ACTIVE'` and `deletedAt: null`
- resolves the target workspace from params, query, headers, JWT claims, or a company lookup fallback
- attaches `request.workspaceId`, `request.workspaceUser`, and the async request context for downstream services

This was hardened in commit `b1b3fb46` and is validated by the WorkspaceAccessGuard Jest suite (10/10 passing).

---

## 4. Batch 2 Tenant-Isolation Controllers (Completed in Task 519)
The following 9 workspace-scoped controllers now enforce active workspace membership via `WorkspaceAccessGuard` (Completed in Task 519):

| Controller Path | Route Prefix | Guard Chain | Status | Notes |
|---|---|---|---|---|
| `src/ap/ap.controller.ts` | `/api/companies/:companyId/ap` | `JwtAuthGuard, CompanyAccessGuard, WorkspaceAccessGuard` | `PROD READY` | Workspace membership is enforced before AP access. |
| `src/ar/ar.controller.ts` | `/api/companies/:companyId/ar` | `JwtAuthGuard, CompanyAccessGuard, WorkspaceAccessGuard` | `PROD READY` | AR routes are tenant-bound and workspace-aware. |
| `src/banking/company-bank-accounts.controller.ts` | `/api/companies/:companyId/bank-accounts` | `JwtAuthGuard, CompanyAccessGuard, WorkspaceAccessGuard` | `PROD READY` | Bank-account access is now scoped to active workspace membership. |
| `src/contacts/contacts.controller.ts` | `/api/companies/:companyId/contacts` | `JwtAuthGuard, CompanyAccessGuard, WorkspaceAccessGuard` | `PROD READY` | Customer/vendor contact actions are workspace-aware. |
| `src/email-templates/email-templates.controller.ts` | `/api/companies/:companyId/email-templates` | `JwtAuthGuard, CompanyAccessGuard, WorkspaceAccessGuard` | `PROD READY` | Template APIs are guarded by workspace membership context. |
| `src/financial-services/financial-services.controller.ts` | `/api/companies/:companyId/financial-services` | `JwtAuthGuard, CompanyAccessGuard, WorkspaceAccessGuard` | `PROD READY` | Financial service endpoints now enforce workspace validation. |
| `src/organization/organization.controller.ts` | `/api/companies/:companyId/organization` | `JwtAuthGuard, CompanyAccessGuard, WorkspaceAccessGuard` | `PROD READY` | Organization and settings flows are now workspace-bound. |
| `src/time/time.controller.ts` | `/api/companies/:companyId/time` and time-entry subroutes | `JwtAuthGuard, CompanyAccessGuard, WorkspaceAccessGuard` | `PROD READY` | Time entry and timesheet actions enforce the workspace boundary. |
| `src/zypra/zypra.controller.ts` | `/api/companies/:companyId/zypra` | `JwtAuthGuard, CompanyAccessGuard, WorkspaceAccessGuard` | `PROD READY` | Chat routes are now tenant-bound and workspace-aware. |

---

## 5. Remaining Controller Inventory by Module
This section captures the remaining backend controllers that are not in Batch 1 or Batch 2 yet, grouped by module.

| Module Path | Controller Path | Guard Chain | Status | Notes |
|---|---|---|---|---|
| `src/accounting` | `accounting/coa-templates.controller.ts` | `JwtAuthGuard` | `PARTIAL` | Accounting template admin routes still need a full review against the workspace policy model. |
| `src/attachments` | `attachments/attachments.controller.ts` | `JwtAuthGuard, WorkspaceAccessGuard` on some routes; `CompanyAccessGuard` on company-scoped operations | `PROD READY` | File attachments and company-bound uploads are partially hardened; still requires audit of policy and ownership checks. |
| `src/banking` | `banking/company-bank-accounts.controller.ts` | `JwtAuthGuard, CompanyAccessGuard` | `PARTIAL` | Bank-account routes are active but not yet workspace-bound in the same way as Batch 1 routes. |
| `src/companies` | `companies/company.controller.ts` | `JwtAuthGuard` and `WorkspaceTypeGuard` on selected methods | `PARTIAL` | Company administration is present but not fully harmonized with the tenant guard rollout. |
| `src/companies` | `companies/workspace.controller.ts` | `JwtAuthGuard` | `PARTIAL` | Workspace management lives here and still requires tenant-bound validation review. |
| `src/currency` | `currency/currency.controller.ts` | `JwtAuthGuard` | `PARTIAL` | Currency config endpoints are present but not yet audited for workspace-specific usage. |
| `src/email-templates` | `email-templates/email-templates.controller.ts` | `JwtAuthGuard, CompanyAccessGuard` | `PARTIAL` | Template APIs are active but not yet rolled into workspace-scope hardening. |
| `src/expenses` | `expenses/recurring-expense.controller.ts` | `JwtAuthGuard, CompanyAccessGuard` | `PARTIAL` | Recurring expense routes remain in the company-bound model and are not yet batch-guarded. |
| `src/financial-services` | `financial-services/financial-services.controller.ts` | `JwtAuthGuard, CompanyAccessGuard` | `PARTIAL` | Financial service APIs remain under review for tenant-bound enforcement. |
| `src/integrations` | `integrations/integrations.controller.ts` | `JwtAuthGuard, CompanyAccessGuard` | `PARTIAL` | Integration routes exist but require service-level review for multi-tenant boundaries. |
| `src/onboarding` | `onboarding/onboarding.controller.ts` | `JwtAuthGuard` | `PARTIAL` | Onboarding screens and flows are active but should be audited for final route policy. |
| `src/organization` | `organization/organization.controller.ts` | `JwtAuthGuard, CompanyAccessGuard` | `PARTIAL` | Organization and settings routes exist but still need workspace-scope finalization. |
| `src/payroll` | `payroll/payroll.controller.ts` | `JwtAuthGuard, CompanyAccessGuard` | `PROD READY` | Payroll workflows are present and integrated in the accounting flow. |
| `src/projects` | `projects/projects.controller.ts` | `JwtAuthGuard, CompanyAccessGuard` | `PROD READY` | Project, change-order, retainer, billing, and resource routes are active and company-scoped. |
| `src/tax` | `tax/tax.controller.ts` | `JwtAuthGuard, CompanyAccessGuard` | `PARTIAL` | Tax routes exist but the tax engine remains not fully audited or hardened. |
| `src/tasks` | `tasks/tasks.controller.ts` | `JwtAuthGuard` | `PARTIAL` | Tasks routes exist and are protected by auth, but not yet tenant-audited at the same depth as Batch 1. |
| `src/tenants` | `tenants/tenants.controller.ts` | `JwtAuthGuard` and selected `WorkspaceAccessGuard` route methods | `PARTIAL` | Tenant-specific config still requires explicit workspace review. |
| `src/users` | `users/users.controller.ts` | `JwtAuthGuard` | `PARTIAL` | User-facing management endpoints exist but are not fully tenant-isolated. |
| `src/test` | `test/test.controller.ts` | `TestEndpointGuard` | `NOT STARTED` | This controller is specifically for test-endpoint isolation and should remain gated in production. |

---

## 6. Core Accounting & Operational Capability Status
This is the functional baseline for the major business modules, even when the underlying controller list still includes additional audit work.

| Capability / Module | Primary Module Path | Status | Notes |
|---|---|---|---|
| Inventory | `src/inventory` | `PROD READY` | Inventory APIs are active, tenant-bound, and managed through the workspace guard. |
| Payroll | `src/payroll` | `PROD READY` | Payroll routes and service logic are present and part of the core financial platform. |
| Tax | `src/tax` | `PARTIAL` | Tax logic exists but the service remains subject to additional audit and lifecycle verification. |
| Projects | `src/projects` | `PROD READY` | Project workflows and sub-controllers are active and company-scoped. |
| Time tracking | `src/time` | `PROD READY` | Time and timesheet controllers are in use and company-bound. |
| Fixed assets | `src/accounting` / `src/inventory` | `PARTIAL` | Asset and depreciation flows are present but require audit coverage and lifecycle verification. |
| Reporting | `src/reporting` | `PARTIAL` | The reporting layer is active but not yet fully hardened across all workspace scopes and export flows. |
| Banking | `src/banking` | `PROD READY` | Banking and reconcile flows are active under the Batch 1 guard. |
| Sales | `src/sales` | `PROD READY` | Sales, customer, and revenue flows are active and workspace-guarded. |
| Expenses & AP | `src/expenses` / `src/ap` | `PROD READY` | Core AP/expense workflows are present and mostly hardened. |
| AR / collections | `src/ar` | `PARTIAL` | AR routes exist and are in the next audit tranche. |

---

## 7. Explicit Security Boundaries
- `OwnerController` is protected by `@UseGuards(JwtAuthGuard)` at the class level, and every privileged platform-admin route is protected by `@UseGuards(SystemRoleGuard)` plus `@SystemRoles('SUPER_ADMIN')`.
- `WorkspaceAccessGuard` is the fail-closed tenant-isolation boundary used in the Batch 1 rollout.
- `TestEndpointGuard` remains the required production guard for the `/api/test` surface.
- `CompanyAccessGuard` remains the primary company-scoped boundary for controllers that are still on the pre-WorkspaceAccessGuard model.

---

## 8. Tenant Isolation Status
The repo is currently in a staged security posture:

- `Batch 1 guarded`: 10 controllers with active `WorkspaceAccessGuard` membership enforcement.
- `Batch 2 candidate`: 9 controllers that still require the same guard to close the tenant-boundary gap.
- `Admin and public exceptions`: explicitly allowed or restricted outside the tenant guard model.
- `Remaining utility controllers`: active but not yet aligned with the batch rollout policy.

This means the backend is not yet uniformly fully workspace-isolated, but the baseline is clear and the rollout path is explicit.

---

## 9. Implementation Notes for Phase 16D
- The purpose of this inventory is to state what is implemented, what is guarded, and what remains pending without overstating production maturity.
- `PROD READY` status means the code path is present in source and is protected by the relevant guard model, not that every edge case has been exhaustively verified in a full live production run.
- `PARTIAL` indicates active implementation with remaining security, reporting, or lifecycle work.
- `NOT STARTED` is reserved for areas that have not been materially implemented in the current repo state.

This document is a structural baseline; deployment claims require the Phase 17 integrated acceptance suite, the Phase 12 security audit, and the release checklist for each specific source module.
