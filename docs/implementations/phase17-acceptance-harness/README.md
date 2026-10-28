# Phase 17: Acceptance Test Harness Implementation Guide

## 1. Overview & Verification Status
- **Phase:** Phase 17 (Integrated Acceptance Testing)
- **Milestone:** Step 1 & Step 2 — Acceptance Test Harness Infrastructure, Schema Lifecycle, and Journey 1 Fixture
- **Status:** COMPLETE & VERIFIED
- **Verified HEAD Commit:** `01fb8635412dc5e5ab5c7cf1ae6f6a19596cc467`
- **Verification Date:** 2026-10-28

---

## 2. Architectural Design & Database Safety Guards
The acceptance testing framework validates multi-step, cross-module end-to-end user journeys against a live NestJS application instance while maintaining strict isolation from daily unit and e2e test suites:

1. **File Naming & Suite Isolation:**
   - Acceptance specs use `*.acceptance-spec.ts` located in `Haypbooks/Backend/test/acceptance/`.
   - Existing e2e tests target `*.e2e-spec.ts` via `jest.e2e.config.js`. Running standard `npm run test:e2e` never triggers acceptance suites.
2. **Dedicated Jest Runner Configuration:**
   - Dedicated configuration file: `Haypbooks/Backend/jest.acceptance.config.js`.
   - Uses `preset: 'ts-jest'`, extended test timeout (60,000ms), single-worker serial execution (`maxWorkers: 1`), and alias mapping for `^src/(.*)$`.
   - Registers `globalSetup: '<rootDir>/test/acceptance-global-setup.ts'` and `globalTeardown: '<rootDir>/test/acceptance-global-teardown.ts'`.
3. **Automated Schema-Only Lifecycle:**
   - Lifecycle scripts target the `acceptance_test` schema exclusively via `--schema=acceptance_test`.
   - Full database drops are prohibited. Only the isolated test schema is recreated before test runs and dropped during teardown.
4. **Database Name Safety Guard:**
   - Global setup enforces that the target database name must contain `test` or `acceptance`.
   - Any attempt to target an unapproved or production database fails closed immediately.
5. **Fail-Closed Execution:**
   - Setup and teardown scripts explicitly throw on errors instead of swallowing failures.
   - If no valid, safe `DATABASE_URL` is configured, the test suite aborts safely without touching data.

---

## 3. Files Created and Modified
| File Path | Type | Role |
|---|---|---|
| `Haypbooks/Backend/jest.acceptance.config.js` | Created | Dedicated Jest configuration with acceptance global setup and teardown |
| `Haypbooks/Backend/package.json` | Modified | Added `"test:acceptance"` runner script |
| `Haypbooks/Backend/test/acceptance-global-setup.ts` | Created | Automated isolated schema setup (`acceptance_test`) with database name validation |
| `Haypbooks/Backend/test/acceptance-global-teardown.ts` | Created | Automated isolated schema cleanup (`acceptance_test`) |
| `Haypbooks/Backend/test/acceptance/shared/acceptance-harness.ts` | Created | Shared harness bootstrapping NestJS app, PrismaService, and service accessors |
| `Haypbooks/Backend/test/acceptance/journey-1-owner-lifecycle.acceptance-spec.ts` | Created | Complete Journey 1 owner lifecycle fixture (onboarding → customer → invoice → payment → balanced GL entries) |
| `docs/implementations/phase17-acceptance-harness/README.md` | Created | Centralized implementation guide for acceptance testing framework |

---

## 4. Usage Instructions

To run the acceptance test harness from `Haypbooks/Backend`:

```bash
npm run test:acceptance
```

To run a specific acceptance journey:

```bash
npm run test:acceptance -- --testPathPattern=journey-1
```

---

## 5. Dependencies & Environment Requirements
- **JWT_SECRET:** Injected via the `test:acceptance` script to allow NestJS `AppModule` to initialize cleanly in test mode without relying on external secrets.
- **DATABASE_URL:** Acceptance testing requires a dedicated, isolated PostgreSQL test database containing `test` or `acceptance` in its name. The test harness intentionally fails closed if no safe `DATABASE_URL` is provided.

---

## 6. Current Limitations & Next Steps
- **Current Milestone:** Harness infrastructure, schema lifecycle management, safety guards, and Journey 1 fixture contracts are complete, verified, and compile cleanly.
- **Pending Deliverables:** Execution of Journey 1 through Journey 5 fixtures against a live isolated acceptance database, followed by Phase 18 database migration.
