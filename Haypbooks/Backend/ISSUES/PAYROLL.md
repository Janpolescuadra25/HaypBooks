# Payroll Implementation - Acceptance Criteria

## Problem
Payroll is documented in Grok but not yet implemented. We need a production-ready, tested payroll system that posts proper JEs and supports tax filings.

## Acceptance Criteria
- DB schema includes: `PaySchedule`, `PayrollRun`, `Paycheck`, `PaycheckLine`, `PaycheckTax`, `PaycheckDirectDeposit`, `PayrollJournalEntries`.
- Tax tables for federal/state/local are represented (schema and seeds for the US version).
- `payroll_runs` can be initiated, processed, and finalised. Each processed run posts `JournalEntry` lines to the GL via JournalService (implemented in `PayrollService`).
- Full e2e tests for a simple payroll run, including posting to GL and reporting — PARTIALLY DONE: unit tests for calculation and persistence exist; add e2e test to assert JournalEntry posting and reporting.
- Tests for rollback/resubmit, negative paychecks, garnishments and tax filing simulations — NOT DONE.
- RLS & tenant-safety: Every payroll entity is tenant-scoped, has `tenantId` text and FK to `Tenant(id)`; RLS enforced by policy.
- CI: e2e tests included in `test:e2e` and smoke seed — ensure e2e payments are added to the CI job.

## Suggested Steps
1. Add schema migrations and Prisma models.
2. Implement services to compute taxes and pay lines.
3. Add job to create `payroll_journal_entries` (idempotent).
4. Implement e2e tests and CI pipeline.

Estimated effort: 4-6 sprints depending on jurisdiction coverage.
