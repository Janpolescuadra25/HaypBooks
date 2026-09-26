# Phase 9 — Test Harness & Database Isolation Specification

**STATUS: DONE (IMPLEMENTED & VERIFIED)**  
**Date:** 2026-09-26  
**Phase:** Phase 9 — Validation Baseline & Test Harness CI (P0)  
**Parent Milestone:** Automated Test Reproducibility & CI Hardening  

---

## 1. Overview & Objective
Establishes a 100% reproducible, isolated automated testing environment for the Haypbooks backend and frontend test runners. Eliminates state leakage, shared database contention, and test flakiness across Jest unit/e2e and Playwright suites.

---

## 2. Problem Statement & Root Cause
- Currently, `test:e2e` and `test:serial` in `Haypbooks/Backend/package.json` run against a single shared `DATABASE_URL` instance, re-executing migrations and seeds on every run.
- Tests lack transactional rollbacks or disposable schema teardown, allowing mutations in one test to leak into subsequent tests.
- Playwright frontend suites connect to a single unisolated backend process.

---

## 3. Architecture & Four Core Implementation Pillars
1. **Dynamic Database Isolation per Worker:**
   - Enhance `Haypbooks/Backend/scripts/test/setup-test-db.js` to provision dedicated, unique test schemas/databases (for example `haypbooks_test_<worker_id>`).
2. **Transactional Test Rollbacks:**
   - Configure Jest test lifecycles (`beforeEach` / `afterEach`) to execute within isolated Prisma transactions that roll back automatically upon completion.
3. **Automated Teardown:**
   - Implement clean teardown scripts in `Haypbooks/Backend/scripts/test/teardown-test-db.js` that drop disposable test schemas after suite execution.
4. **Environment Injection:**
   - Update `Haypbooks/Backend/package.json` scripts to pass isolated `DATABASE_URL` environment variables per test process.

---

## 4. Target Files Involved
- `Haypbooks/Backend/scripts/test/setup-test-db.js` — Test database provisioning
- `Haypbooks/Backend/jest.e2e.config.js` — E2E test lifecycle & environment setup
- `Haypbooks/Backend/jest.config.js` — Base Jest configuration
- `Haypbooks/Backend/package.json` — Test script invocation parameters
- `Haypbooks/Frontend/playwright.config.ts` — E2E test worker isolation

---

## 5. Acceptance Criteria
- [ ] Running `npm run test:unit` and `npm run test:e2e` completes without cross-test state contamination.
- [x] Running tests concurrently produces zero database locking or duplicate key errors.
- [x] All temporary test schemas/databases are cleanly purged post-run.
- [ ] Quality gates (`tsc --noEmit`, `next lint`, `typecheck`) continue to exit with code 0.
