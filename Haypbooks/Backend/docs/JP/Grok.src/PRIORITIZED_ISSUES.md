# Prioritized Issues & Acceptance Criteria

This file lists prioritized issues and recommended acceptance criteria for the database schema and related infra. Use this as a starting point for actionable PRs.

## High Priority

1. Fix `Contact.id` and Contact FK regressions (Critical) — DONE
- Description: Reverted `Contact.id` (and `ContactEmail.contactId`, `ContactPhone.contactId`) from `@db.Text` to `@id @default(uuid())` and re-established correct relations and FKs in `schema.prisma`.
- Why: Primary key must have UUID default to prevent collision, guarantee Prisma relations and FK enforcement.
- Acceptance Criteria (completed):
  - Prisma schema updated with `@id @default(uuid())` for `Contact` and related email/phone IDs.
  - Migration added that sets the default `gen_random_uuid()` for `Contact.id` and ensures FK index consistency.
  - Unit tests: (pending) create contact and contact details; confirm IDs are automatically generated and relations work.
  - CI validators: lint migrations for RLS unchanged; run `prisma validate` and `prisma generate` successfully. (Pending CI run)
  - PR includes brief migration runbook for staging & production cutover. (This doc created in `REVIEW_SUMMARY.md`)
- Priority: High
- Estimate: 1–2 days

2. Ensure Payment Application Models & AR/AP Application Links (Critical)
- Description: Add or confirm `InvoicePaymentApplication` and `BillPaymentApplication` (or equivalent) models exist and are linked to invoices, bills, payments and the GL.
- Why: Allows traceable payment applications and accurate aging & balance calculations.
- Acceptance Criteria:
  - Prisma models in `schema.prisma` exist with proper `@@index` and `@@unique` as outlined (invoiceId+paymentId unique).
  - Migration SQL added for new tables, or validated that they exist.
  - Backend services to create an application when payments are applied: an API or a method used by tests.
  - Tests: fully create invoice -> create payment -> apply to invoice -> expect invoice balance reduced, journal entry recorded.
  - CI: RLS policies and tenancy enforced for these new tables.
- Priority: High
- Estimate: 3–5 days

3. Link Postable Records to JournalEntry (High)
- Description: Ensure `Invoice`, `Bill`, `PaymentReceived`, `BillPayment`, `Paycheck`, and other postable entities have `journalEntryId` and relations to `JournalEntry`.
- Why: Keep auditable linkage between subledger operations and ledger entries.
- Acceptance Criteria:
  - Schema updated with `journalEntryId` + relation on relevant models + index.
  - Migration script and backfill logic (where existing data already posted) to populate `journalEntryId`.
  - Tests: posting invoice creates a journal entry and `journalEntryId` populated; the `JournalEntry` aggregates the same posting lines.
  - CI: DB ship checks include a smoke test for JournalEntry linking.
- Priority: High
- Estimate: 4–6 days

4. Seed Snapshot Export/Import (High) — DONE
- Description: Add dev helper scripts to export a snapshot of the current seeded in-memory DB and import it into a running seed or staging DB for deterministic test/debug.
- Why: Makes developer flows reproducible and enables saving manual test states.
- Acceptance Criteria:
  - `api` endpoint or CLI export to a JSON snapshot (frontend `mock/db` and backend `prisma seeds`) added.
  - Import script to merge snapshot into the running seed (idempotent upsert semantics).
  - Tests: export snapshot -> clear DB -> import snapshot -> expect same record counts and key object invariants. (Partially verified locally; CI will run this as smoke test)
  - Documentation: README updated with example commands for export/import.
- Priority: High
- Estimate: 2–3 days

5. POC Field-level Encryption (Medium)
- Description: Create a field-level encryption POC for sensitive PII (SSN, Tax ID). Implement minimal wrapper transformations using a KMS-emulating local dev mode.
- Why: PII must be encrypted at rest for compliance.
- Acceptance Criteria:
  - POC implemented with a wrapper in `scripts` or a helper package demonstrating encryption/decryption using a mock KMS or local keystore.
  - Example applied to the `Employee.ssnHash` or equivalent field with unit tests for encryption/decryption.
  - Document dev-mode toggle and caution for migration behavior.
- Priority: Medium
- Estimate: 2–4 days

## Medium/Low Priority

6. Multi-currency on Payments (Medium)
- Acceptance: Add `currency`, `exchangeRate`, `baseAmount` to `PaymentReceived` and `BillPayment`. Tests verifying conversions and balances.

7. Customer Credit Memos & Applications (Medium)
- Acceptance: Add `CustomerCredit`, `CustomerCreditLine`, and `CustomerCreditApplication` models with tests.

8. Employee Expense Reports & Reimbursements (Medium)
- Acceptance: Add `ExpenseReport`, `ExpenseLine`, link with reimbursement methodologies (Payroll/AP). Tests that reimbursements reduce GL correctly.

9. Bank Rules & Auto-matching (Low/Medium)
- Acceptance: Add `BankRule` model and a small rule runner for auto-categorization; tests for rule application.

10. Partitioning & Backups Drill Automation (Low/Medium)
- Acceptance: Document partition strategy, add sample SQL to create partitions for `JournalEntryLine`, create an ops script to perform a backup & restore, and a CI job to run a restore drill periodically.

11. Composite Index Additions (High) — DONE
- Description: Add composite indexes for high volume reporting & query patterns
- Acceptance: Add `journalentryline_tenantid_accountid_idx` and `invoiceline_tenantid_itemid_idx` indexes and migration file. Tests cannot verify performance but ensure no errors creating indexes.
- Done: `Backend/prisma/migrations/20251214_add_composite_indexes/migration.sql`

## Next Steps Recommended
- Create PRs for items 1–4 in the order listed (contact fix, payment applications, journal linking, seed import/export).
- Add CI smoke test to validate all newly added schema changes (RLS, FK, backfill, and migration validations).
- Add an `ISSUE_TEMPLATE` or `PR_TEMPLATE` checklist for schema PRs to ensure they include migration SQL, backfill scripts, CI checks, and runbook steps.

---

Maintainers: assign this file to a tracking issue or board column and start converting items into actionable PRs. If you want, I can create PRs for items 1–4, migrate, and run the backfill/validation in staging once you provide the staging DB URL.