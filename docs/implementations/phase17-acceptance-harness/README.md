# Phase 17: Acceptance Test Harness Implementation Guide

## 1. Overview & Verification Status
- **Phase:** Phase 17 (Integrated Acceptance Testing)
- **Milestone:** Step 1 — Acceptance Test Harness Infrastructure & Initial Journey Fixture
- **Infrastructure Status:** COMPLETE & COMPILE-VERIFIED
- **Runtime Acceptance Status:** BLOCKED pending an explicitly provisioned isolated acceptance database
- **Verified HEAD Commit:** `cabed9ef44b0b16e4feb3cc21eb8cb142788b38d`
- **Verification Date:** 2026-10-28

The infrastructure files compile and the acceptance runner reaches Prisma initialization. A complete NestJS application boot and Journey 1 runtime pass have not been certified because no safe acceptance `DATABASE_URL` was supplied. The runner fails closed rather than selecting an existing development, Neon, or production database.

---

## 2. Architectural Design & Isolation
The acceptance framework is designed for multi-step, cross-module journeys against a live NestJS application instance while remaining separate from unit and existing e2e suites.

1. **File Naming Isolation**
   - Acceptance specs use `*.acceptance-spec.ts` under `Haypbooks/Backend/test/acceptance/`.
   - Existing e2e specs use `*.e2e-spec.ts` through `jest.e2e.config.js`; their normal command does not select acceptance specs.
2. **Dedicated Jest Runner**
   - Configuration: `Haypbooks/Backend/jest.acceptance.config.js`.
   - Uses `ts-jest`, a 60-second test timeout, serial execution, and the `src/*` alias mapping.
3. **Application Bootstrap and Teardown**
   - `acceptance-harness.ts` creates a Nest testing module from `AppModule`, applies global validation pipes, resolves `PrismaService`, and exposes `closeAcceptanceTestApp`.
4. **Scoped Bootstrap Compatibility**
   - The Journey 1 fixture supplies a deterministic mock for the ESM-only `uuid` request-ID dependency.
   - It replaces the unrelated test-endpoint module during this suite because that module's controller currently has unresolved dependencies under `NODE_ENV=test`; application services used by Journey 1 remain real.
5. **Database Isolation**
   - `PrismaService` is real and attempts to connect during application initialization.
   - No default database URL is embedded in the harness. Missing `DATABASE_URL` stops execution before journey tests run.

---

## 3. Files Created and Modified

| File Path | Type | Role |
|---|---|---|
| `Haypbooks/Backend/jest.acceptance.config.js` | Created | Dedicated Jest configuration for acceptance tests |
| `Haypbooks/Backend/package.json` | Modified | Added the `test:acceptance` runner and acceptance-only JWT bootstrap value |
| `Haypbooks/Backend/test/acceptance/shared/acceptance-harness.ts` | Created | Shared Nest application, Prisma, validation, ID, and teardown helpers |
| `Haypbooks/Backend/test/acceptance/journey-1-owner-lifecycle.acceptance-spec.ts` | Created | Initial Journey 1 harness and `OnboardingService.complete` contract fixture |

---

## 4. Usage Instructions

From `Haypbooks/Backend`, first provide a dedicated acceptance database URL through the process environment. Do not source a production or general development `.env` file.

Run all acceptance specs:

```bash
npm run test:acceptance
```

Run Journey 1 only:

```bash
npm run test:acceptance -- --runTestsByPath test/acceptance/journey-1-owner-lifecycle.acceptance-spec.ts
```

The database must be provisioned, migrated, seeded with deterministic acceptance fixtures, and approved for destructive cleanup before running future lifecycle journeys.

---

## 5. Dependencies & Environment Requirements
- **JWT secret:** The package script supplies a non-production acceptance-only value so `JwtStrategy` can be constructed without reading a real secret.
- **DATABASE_URL:** Required from the caller and must identify a dedicated isolated PostgreSQL database. The current runner intentionally fails closed when it is absent.
- **Schema:** Apply the repository's reviewed migration history to the isolated database before executing journeys.
- **Data lifecycle:** Each journey must create uniquely identified fixtures and remove or transactionally roll back only its own records.
- **Prohibited targets:** Neon production/legacy data, the VPS live database, shared development databases, and any database whose destructive-test authorization is unknown.

---

## 6. Verification Evidence
- `npm --prefix Haypbooks/Backend run build`: passed on 2026-10-28.
- `npm --prefix Haypbooks/Frontend run typecheck`: passed on 2026-10-28.
- `npm run test:acceptance`: runner configuration and Nest dependency loading were exercised; after scoped bootstrap compatibility fixes, execution reached Prisma initialization and stopped because `DATABASE_URL` was absent.
- No runtime acceptance test pass is claimed at this milestone.

---

## 7. Current Limitations & Next Steps
1. Provision an isolated acceptance PostgreSQL instance with credentials stored outside Git.
2. Rehearse migrations and seed deterministic identities, workspaces, companies, accounts, periods, and plan entitlements.
3. Complete Journey 1 with real onboarding, persistence, permissions, and cleanup assertions rather than method-shape checks alone.
4. Add Journeys 2–5 for Accountant multi-entity, AP bills, Fixed Assets, and Multi-Currency/Tax.
5. Add double-entry, report reconciliation, concurrency/replay, permission-denial, retry, reload, and cleanup evidence.
6. Mark Phase 17 complete only after the entire roadmap matrix passes against the isolated database.
