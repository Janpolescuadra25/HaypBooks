# Phase 17 Journey 4: Fixed Asset Lifecycle Backend Module

## Overview
Phase 17 Journey 4 adds the fixed assets lifecycle to the backend, covering registration, chart-of-accounts validation, straight-line monthly depreciation schedules, soft-delete handling, and audit records for all lifecycle mutations.

## Module Layout
- `Haypbooks/Backend/src/fixed-assets/fixed-assets.module.ts` — NestJS module wiring.
- `Haypbooks/Backend/src/fixed-assets/fixed-assets.service.ts` — core fixed asset lifecycle logic.
- `Haypbooks/Backend/src/fixed-assets/fixed-assets.controller.ts` — REST endpoints under `/companies/:companyId/fixed-assets`.
- `Haypbooks/Backend/src/fixed-assets/dto/` — request validation DTOs.

## Key Lifecycle Rules
1. Asset registration requires a valid category in the same company.
2. Chart-of-accounts validation is enforced for `assetAccountId`, `accumulatedDepreciationId`, and `depreciationExpenseAccountId`.
3. Depreciation is restricted to `STRAIGHT_LINE` for Phase 17 Journey 4.
4. Active reads are filtered with `deletedAt: null` and asset deletion is implemented as a soft delete.
5. All create, delete, and schedule-generation actions are logged via `AuditService`.

## Depreciation Formula
For each asset:

$$
\text{Monthly Depreciation} = \text{round}\left(\frac{\text{Cost} - \text{Salvage Value}}{\text{Useful Life Months}}\right)
$$

The backend generates 12 monthly periods each fiscal year and stores them as `FixedAssetDepreciation` rows linked to a `FixedAssetSchedule` record.

## Acceptance Verification
The acceptance suite is located at:
`Haypbooks/Backend/test/acceptance/acceptance-journey4-fixed-asset-lifecycle.acceptance-spec.ts`

It asserts:
- category creation succeeds;
- invalid account references fail with 400;
- valid asset acquisition succeeds;
- multi-tenant access is blocked with 404;
- straight-line schedule generation yields 12 monthly periods;
- soft deletion removes the asset from active listings.

## Implementation Notes
- No schema changes were made.
- Existing migration and Prisma schema state was left intact.
- The module is wired into the root app through `AppModule` to remain available to the backend runtime.
