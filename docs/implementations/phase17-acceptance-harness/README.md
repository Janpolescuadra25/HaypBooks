# Phase 17: Acceptance Test Harness Implementation Guide

## 1. Overview & Verification Status
- **Phase:** Phase 17 (Integrated Acceptance Testing)
- **Milestone:** Step 1 & Step 2 — Acceptance Test Harness Infrastructure, Schema Lifecycle, and Journey 1 Fixture
- **Status:** Harness and Journey 1 COMPLETE & VERIFIED; Journeys 2–5 remaining
- **Verified HEAD Commit:** `f53ce3c111576b664833e9728d57530a86e9431f`
- **Verification Date:** 2026-10-31

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
| `Haypbooks/Backend/test/acceptance-global-teardown.ts` | Created | Sequential, lock-safe isolated schema cleanup (`acceptance_test`) |
| `Haypbooks/Backend/test/acceptance/shared/acceptance-harness.ts` | Created | Shared harness bootstrapping NestJS app, PrismaService, and service accessors |
| `Haypbooks/Backend/test/acceptance/journey-1-owner-lifecycle.acceptance-spec.ts` | Created | Complete Journey 1 owner lifecycle fixture (onboarding → customer → invoice → payment → balanced GL entries) |
| `docs/implementations/phase17-acceptance-harness/README.md` | Created | Centralized implementation guide for acceptance testing framework |

### Execution deliverables

| Deliverable | Location | Status |
|---|---|---|
| Journey 1 Execution | `test/acceptance/journey-1-owner-lifecycle.acceptance-spec.ts` | `VERIFIED PASSED (1 test suite, 3/3 tests, 100%)` |
| Journeys 2–5 | `test/acceptance/` | `REMAINING` |

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
- **Current Milestone:** Harness infrastructure, schema lifecycle management, safety guards, and Journey 1 live execution are complete and verified.
- **Pending Deliverables:** Implement and execute Journeys 2–5 against an isolated acceptance database while Phase 18 migration scoping proceeds.

---

## Runtime Acceptance Fixes

Commit `783a1f57c991ab7f4f28d243422651a5c6c6035b` delivered and verified these runtime repairs:

1. **Migration schema-awareness and idempotency:** `current_schema()` guards in the affected migration SQL prevent enum, column, index, and constraint collisions when the full migration chain runs in `acceptance_test`.
2. **Sequential teardown cleanup:** `test/acceptance-global-teardown.ts` drops schema objects sequentially before removing the schema, preventing PostgreSQL shared-memory lock exhaustion caused by one monolithic cascade.
3. **Immutable AR tax resolution and transaction guard:** `ArRepository.resolveInvoiceLineTaxData` uses immutable copies and short-circuits untaxed lines; invoice creation uses a 10-second Prisma transaction timeout to prevent indefinite lock stalls.
4. **Windows shell handling:** `acceptance-global-setup.ts` invokes Prisma migrations through a platform-appropriate shell so Windows can execute the CLI reliably.

## Local Test Database Provisioning & Execution Guide

### 1. Prerequisites & Safety Guardrails
The acceptance test suite executes real domain services and persists data via Prisma against an isolated PostgreSQL database. To protect development and production databases from accidental data loss, the test lifecycle (`test/acceptance-global-setup.ts` and `test/acceptance-global-teardown.ts`) enforces strict fail-closed guards:

1. **Database Name Whitelist:** The target database name in `DATABASE_URL` must contain either `test` or `acceptance` (case-insensitive). Attempting to run against `haypbooks_dev` or production databases will immediately abort execution.
2. **Dedicated Schema Isolation:** The connection string must include `?schema=acceptance_test`, and `TEST_SCHEMA` must be set to `acceptance_test`.
3. **Schema-Only Lifecycle:** Setup recreates only `acceptance_test`; teardown removes its objects sequentially and then removes that schema. The overall database is never dropped.
4. **Prisma Schema Synchronization:** After schema initialization, setup runs `npx prisma migrate deploy --schema=prisma/schema.prisma` against `acceptance_test`.

### 2. Provisioning the Local Test Database
Ensure your local PostgreSQL instance is running on `localhost:5432`. If the database `haypbooks_test` does not exist, create it once via `psql` or PowerShell:
```sql
CREATE DATABASE haypbooks_test;
```

### 3. Environment Variables Configuration
Set the following environment variables in your terminal session before execution:
```powershell
$env:DATABASE_URL = "postgresql://postgres:<your-local-postgres-password>@localhost:5432/haypbooks_test?schema=acceptance_test"
$env:TEST_SCHEMA = "acceptance_test"
$env:JWT_SECRET = "acceptance-test-only-secret-key-32chars"
```

### 4. Running Journey 1 Acceptance Test
Navigate to `Haypbooks/Backend` and execute:
```powershell
npm run test:acceptance -- --runTestsByPath test/acceptance/journey-1-owner-lifecycle.acceptance-spec.ts
```

### 5. Local Execution Notes
- The harness intentionally refuses unsupported or production-aligned database names.
- Only the `acceptance_test` schema is reset, never the database itself.
- All setup/teardown actions are strict and fail closed if validation fails.
- Once the dedicated acceptance schema is live, the Journey 1 owner lifecycle fixture exercises onboarding, customer creation, invoice issuance, payment posting, and balanced ledger validation in a controlled environment.
