# Billing Trial Alignment & Defect E9 Remediation

## Status
DONE & VERIFIED (2026-10-04)

## Summary
This task resolves the release-blocking P0 Defect E9 in the Phase 13 billing and onboarding flow. The root cause was a mismatch between the Prisma `Subscription` schema and the legacy company bootstrap logic: the app still created a subscription with `plan: 'FREE'` even though the schema requires a `planId` and proper subscription status. This was combined with a remaining 14-day marketing string in the landing ticker, which contradicted the product direction of a 30-day free trial.

## Defect Fix

### 1. Canonical plan IDs and validation
The company subscription utility now exports the default trial plan ID and the canonical paid plan IDs:

- `DEFAULT_TRIAL_PLAN_ID`
- `CANONICAL_PAID_PLANS.STARTER`
- `CANONICAL_PAID_PLANS.PROFESSIONAL`
- `CANONICAL_PAID_PLANS.ENTERPRISE`
- `CANONICAL_PAID_PLANS.PRACTICE`

The validation helper now rejects the deprecated FREE payload and ensures `planId` is a non-empty string when provided.

### 2. Trial bootstrap update
The company repository now creates an initial subscription using:

```ts
{ companyId: tenant.id, planId: DEFAULT_TRIAL_PLAN_ID, status: 'TRIAL' }
```

instead of the legacy `plan: 'FREE'` payload. The same change is applied to child-company bootstrap and preserves the existing 30-day trial window and non-destructive trial activation behavior.

### 3. Unit-test coverage
The company subscription tests now assert the `planId` contract and verify that a deprecated `'FREE'` plan string is rejected. The test suite specifically ensures the trial bootstrap is tied to the canonical plan ID instead of a legacy string.

### 4. 30-day UI copy
The landing ticker copy was updated from `14 DAYS` to `30 DAYS`, aligning the user-facing message with the actual trial semantics and the database-backed plan contract.

## Files Updated
- `Haypbooks/Backend/src/companies/subscription.util.ts`
- `Haypbooks/Backend/src/companies/company.repository.prisma.ts`
- `Haypbooks/Backend/src/companies/__tests__/subscription.ensure.spec.ts`
- `Haypbooks/Backend/src/companies/__tests__/company.create.child.spec.ts`
- `Haypbooks/Frontend/src/components/landing/Ticker.tsx`
- `docs/Road_Map/Road_Map.md`

## Verification
This remediation was verified with the targeted backend subscription tests plus frontend lint/typecheck. The repo safety guard remained in place: only the approved seven-file scope was staged and committed.
