# HaypBooks  End-to-End Completion Roadmap

- Current Checkpoint Date: 2026-11-08
- Provenance Pin: cca39f510c65639be3e1cd86775e5e3e8da36ead
- Authority: `Hydra 2026-11-04 Task 951 Verified State Audit`

## 0. Critical Path Execution Order
   - **Status:** Backend RBAC (`assertPracticeRole`), task mutation audit logging (`AuditService.log`), and Frontend queue views are implemented in code.
   - **Active Next Step:** Browser/E2E runtime verification.
2. **Phase 17: Acceptance & Integration Testing (P1/P2 â€” Journey 1 Verified; Journey 2 Verified; Journey 3 Verified Complete)**
- **Phase 17 Journey 3 AP Bill Lifecycle (VERIFIED COMPLETE):**
  * **Scope:** Vendor bill creation, line-item tax calculation, multi-currency support, approval workflow (preparer and approver segregation of duties), payment run execution, bank account deduction, sub-ledger to General Ledger posting (Dr Expense / Cr Accounts Payable, followed by Dr Accounts Payable / Cr Cash/Bank), and automated double-entry invariant verification.
  * **Test Spec Target:** Haypbooks/Backend/test/acceptance/acceptance-journey3-ap-bill-lifecycle.acceptance-spec.ts.
  * **Status:** VERIFIED COMPLETE â€” 7/7 acceptance tests passed in 26.551s (double-entry accrual, payment settlement, separation of duties, and immutability invariants validated in commit `258c37f586908db05ab51ab338d2f4cf91cf3b8c`).
   - **Status:** Journey 1 harness and 3/3 tests verified passing in commit `783a1f57`; Journey 2 acceptance suite passed in the live repository baseline at `66b3a68979303b4541ad8f0c32f5b688c84db422` with 1/1 suites and 3/3 tests passing; Journey 3 verified complete (7/7 tests passed).
   - **Active Next Step:** Begin implementation of Phase 17 Journey 4 (Fixed Asset Lifecycle) per the acceptance matrix.
3. **Phase 10: VPS Release Preparation & Deployment (P1 Final Gate â€” BLOCKED)**
   - **Status:** Blocked until Phase 11 Step 5B browser/E2E runtime verification is completed, Phase 18 Milestone 2 staging drill is executed, and remaining acceptance tests pass.

## Current verification checkpoint - 2026-11-04

This checkpoint supersedes stale statements below only for the items verified here. Full findings, source anchors, commands, limitations and acceptance order: [September 26 audit](../audits/2026-09-26-current-status.md).

- Source checkpoint reference: `66b3a68979303b4541ad8f0c32f5b688c84db422`.
- Status: substantial implementation; release blocked for affected accounting, billing and security scope. No production-readiness certification.
- Working tree at HEAD `66b3a68979303b4541ad8f0c32f5b688c84db422` on `checkpoint/dev` matches the authoritatively audited checkpoint, apart from the intentionally untracked local secret capture `pm2.env.md`. Deployment revision is not claiming live production release.
- Verified to date: frontend and backend type-checks are green for the audited Practice Hub patch; the navigation shell and placeholder regression coverage are verified; the verified implementation now covers RBAC enforcement, audit logging, and the `TaskStatus.PENDING` mapping used by the review flow.
- Practice Hub status: Step 4 is COMPLETE & VERIFIED (Schema, types, guards, migration, and fresh practice creator onboarding fixed 2026-10-25). Step 5A is VERIFIED COMPLETE (backend task and review queues, DTOs, service methods, and workspace type guards in commit `def107fec9bde848d43b3c4002e6f601d42f76d6`; see [Step 5A implementation guide](../implementations/practice-hub-step5a-backend-tasks/README.md)). Step 5B is VERIFIED IMPLEMENTED / 99% COMPLETE (owner/admin-only RBAC, task audit logging, and `TaskStatus.PENDING` mapping invariants verified; only browser/E2E runtime verification remains).
- Required security work: Phase 12 Security Containment (S1 âœ“, S2 âœ“, S3 âœ“) completed and verified (2026-10-24); pruned to Appendix.
- Required financial work: journal reversal/report consistency (A1), earnings (A2), payroll void (A4 âœ“ 2026-10-18), inventory voiding (A5 âœ“ 2026-10-18), bank matching (A6 âœ“ 2026-10-18), numbering (A7 âœ“ 2026-10-19). IDs refer to the linked audit.
- Required product work: real payment confirmation (B1), real analytics (F1), FX behavior (F2), and browser-verified intro/navigation/login parity. Intro slide two is white again in source; global CSS and scroll/font integration still require acceptance.
- Next order: security containment -> reproducible checks -> accounting invariants and report reconciliation -> truthful billing/analytics -> reference parity -> integrated acceptance/restore/deployment verification. Keep existing phase IDs and historical work; reopen validation acceptance where fresh checks remain blocked.

Updated 2026-10-27. Canonical location: docs/Road_Map/Road_Map.md. This file consolidates both former roadmaps; there is no separate root roadmap. This update is based on inspected source, not a claim that the application passes a complete runtime audit. The attached audit is a checklist, not an existing findings report. Browser, live database, Stripe, VPS, performance and restore validation remain outstanding.

Single source of truth: docs\Road_Map\Road_Map.md. The former root-level Road_Map.md has been removed from the working tree (Hydra repo audit, 2026-09-12).
- Provenance pin: audited source commit `b724209bad9322031d614b11ac78386bc6114886`; the active roadmap reflects the repository state at that checkpoint and does not overclaim newer implementations beyond that source.
- All 13 completed phases verified against codebase and READMEs by Hydra on 2026-10-23 at commit 6f8335e42752b276761e14f0bf3b938afeec63b0; pruned from active tracking table.

## Current audit findings

Paths below are repository-relative. Rediscover anchors before implementation.

| Evidence | Confirmed source behavior | Priority / phase |
|---|---|---|

## Audit review (attachment AW)

**A  Executive summary:** Real product foundations exist, but security, payment truthfulness and accounting integrity block a readiness claim. No live compromise, customer loss or actual erroneous charge is established by this source audit.

**B  Repository:** Next.js/React frontend and NestJS/Prisma backend already contain accounting, auth, subscriptions and practice structures. Complete existing workflows rather than replace them.

**C  Major findings:** E1/E2 are immediate release gates. E3E7 require targeted reproduction and correction. E8 invalidates build-only assurance. E9 contradicts owner direction.

**D  Accounting:** Balance validation/reversals exist. Verify precision, posting dates, periods, tax rounding, allocation, source links and ledger effects across all transaction producers.

**E  Auditor:** Require actor/company/source/reason and reversal traceability for financial mutations. Distinguish draft deletion from posted-history controls. Historical evidence records are not independent execution proof.

**F  Security:** Existing ValidationPipe/CORS/helmet in backend main.ts and access guards do not prove complete coverage. Audit company/practice ownership, roles, sessions, OTP/reset, uploads, exports and logs. Fix E1; deployed exposure is UNKNOWN.

**G  UX:** Browser parity with HB_clone remains UNKNOWN. Audit every shipped action, responsive/keyboard behavior and loading/error/retry/cancel/success states. E2 demonstrates false success risk.

**H  Financial analysis:** Reconcile balance sheet, profit/loss, trial balance, cash flow and aging on shared dated fixtures before adding dashboards. Broader report accuracy is UNKNOWN.

**I  Business:** Complete company and practice onboarding/billing separately. Four paid levels/30 days are direction; prices, capacities, tax and trial-card policy still need decisions.

**J  Backend:** Trace service/repository transaction boundaries, idempotency, errors and concurrent requests. Reuse existing ledger services; avoid speculative rewrites.

**K  Frontend:** Server-confirmed state must drive financial/subscription success. Audit API contracts, persistence after reload, validation and shared components. Build is not typecheck.

**L  Structure:** Keep reference repositories and ignored evidence distinct from product code. Change folder/package structure only for demonstrated maintenance or operational benefit.

**M  Testing:** Unit/integration/Playwright infrastructure exists; this update does not claim passing suites. Inspect setup before running migration/seed-bearing tests; use disposable databases and assert financial outcomes, not just response codes.

**N  Workflows:** Trace screen  validation  authorization  service  transaction  persistence  GL/report  visible outcome. Include cancel, failure, duplicate, concurrent, edit/reversal and reload cases.

**O  ERPNext:** Inspected `docs/erpnext/erpnext/accounts/general_ledger.py:3475` validates periods/disabled accounts and updates payment ledger, with separate cancellation handling. Essential concept: uniform posting invariants and linked reversals. HaypBooks has shared posting but equivalent coverage is not established. Adopt concepts within NestJS/Prisma; do not copy source/UI.

**P  QuickBooks:** Local `docs/Quickbooks_api/quickbooks.api.md:7883` describes SyncToken rejection of stale updates. Evaluate equivalent optimistic concurrency for financial edits: transactions alone do not prevent lost updates. No literal SyncToken requirement and no full QuickBooks parity claim.

**Q  Missing:** Actual revaluation calculation is NOT FOUND in the inspected endpoint; inventory GL is NOT FOUND in the inspected create transaction. These are scoped findings, not repository-wide absence claims.

**R  Partial:** Public/auth, practice, subscription onboarding, GL, banking, inventory and reporting have real code; improve it rather than duplicate it.

**S  Maturity:** Public/auth and practice are PARTIALLY IMPLEMENTED; checkout/GL/banking/inventory/reports IMPLEMENTED BUT INCOMPLETE; FX endpoint PARTIALLY IMPLEMENTED. Security/tenancy only PARTIALLY VERIFIED. Payroll/assets/tax/AI and operations remain UNKNOWN pending dedicated audits. No module is certified MATURE or PRODUCTION-READY.

**T  Improvements:** Active phases specify required outputs and gates. P0/P1 apply to released scope; progression and AI expansion can remain optional.

**U  Order:** 12 + 9 first; then 2/14  6/5  4, with 7 if FX offered. Scope 13 immediately and finish before paid onboarding. Complete 1/15, 11, 16  17  10. Documentation 3 accompanies every phase; AI 8 follows core stability.

**V  Risks:** Unknown deployment config, historical evidence corruption, data drift, silent failures, concurrent mutations and inconsistent plans. Never seed an unknown database or delete history to resolve capacity/accounting issues.

**W  Recommendation:** Next bounded task is test-endpoint audit/containment with production-mode negative tests (12), supported by reproducible baseline (9). This roadmap update does not implement those fixes.

## Active completion plan

Status vocabulary: AUDIT REQUIRED, NOT STARTED, PARTIAL, IN PROGRESS, BLOCKED, DONE. P0 means release-blocking for affected scope, not proof of a live incident. VERIFIED means inspected source; UNKNOWN must not be silently promoted to passing behavior.

## Active & Remaining Implementation Phases

### 8  AI Phase 2 (DEFERRED / OPTIONAL)

- Audit: existing AI, tenant data exposure, provider cost, failures and owner/JP goals.
- Deliver: agreed assistance with source traceability, uncertainty and human review for financial writes; permissions/budgets/secrets enforced. Autonomous posting requires separate approved controls.
- Depends on: 12/14/17. Historical backlog preserved as optional expansion; not required for near-term release gating.
- Status: DEFERRED / OPTIONAL. Original backlog retained for future reassessment.

### 10  VPS release (BLOCKED, P1 final gate)

- Audit: read-only local/remote revisions, server checkout, PM2, TLS/proxy, environment/migration state. Historical drift claims are not fresh facts.
- Deliver: reviewed revision -> owner push -> controlled pull/install/build/migration if approved -> restart/health check, with rollback. No blind overwrite of server changes.
- Requirements: backup/restore, secrets, logs, monitoring/resource limits. Reported 4vCPU/8GB/80GB is planning input, not measured capacity.
- Depends on: 1, 2, 3, 4, 5A, 5B, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18. Done: exact revision served, TLS/API/auth/jobs healthy, load/restore/rollback verified, no P0 unresolved.
- Current blocker clarity: release remains blocked until Phase 11 Step 5B browser/E2E runtime verification is completed, tenant-isolation validation is completed, billing/trial correctness is confirmed, and remaining Phase 17 acceptance testing is passed. Phase 11 Step 5B is verified implemented at 99% (resolved blocker), and Phase 11 Step 5A plus the fresh-signup owner onboarding fix are already verified and must not be reopened without contrary evidence.
- Critical database migration blocker: RESOLVED at Milestone 1, verified in commit 15b73459f5d0a0a2d1ba84f2b6012d54485f6a4a. Only Phase 18 Milestone 2 staging drill and VPS production cutover remain active before Phase 10 release.

## Appendix: Archived Completed Phases

### 11 Step 5B  Practice Hub frontend queue views (VERIFIED COMPLETE, P1)

- **Actual route:** `Haypbooks/Frontend/src/app/(practice-hub)/practice-hub/page.tsx`.
- **Components:** `TaskQueueView.tsx`, `ReviewQueueView.tsx`, and `TaskModal.tsx` provide filtering, pagination, assignment, review workflow, task detail, comments, and status mutations.
- **Documentation:** [Step 5B implementation guide](../implementations/practice-hub-step5b-frontend-queues/README.md).
- **Verified state:** Components are mounted and typecheck cleanly; Step 5A backend controllers and services are operational; owner/admin-only role gating is enforced for the Review Queue; task transitions and audit logging are wired through `AuditService` with `entityType: 'Task'`; and the `TaskStatus.PENDING` mapping is preserved without schema drift.
- **Remaining polish:** Only browser/E2E runtime verification of loading, error, retry, keyboard, permission, and audit-log event linking states remains.

### 15  Every shipped route/action (AUDIT REQUIRED, P1)

- Audit: inventory owner/staff/accountant/client routes and actions, real data sources and release/finish/defer disposition, including settings/reports/exports.
- Deliver: fix dead buttons, mock-live data, persistence, navigation/validation; reuse shared tables/forms/status patterns where beneficial. Keyboard/mobile and loading/error/success/retry/cancel required.
- Depends on: 1/11/13/14. Done: no unexplained shipped placeholders; reload restores server truth; realistic company/accountant/practice tasks and permission failures pass; visual differences documented.
- **Verified complete sub-module:** `Period-Close Sign-Offs` is `VERIFIED COMPLETE` and documented in [docs/implementations/period-close-sign-offs/README.md](../implementations/period-close-sign-offs/README.md). The company-scoped workflow is exposed through `AccountingController` as GET/POST endpoints under `/api/companies/:companyId/accounting/period-close/workflow*`, the stale close-checklist link was corrected to `/accounting/period-close/sign-offs`, the mutation path enforces server-side `OWNER`/`ADMIN`/`ACCOUNTANT` authorization while blocking `VIEWER` with `403`, and the live sign-offs page is wired to the backend with explicit `periodId` selection and `COMPLETE_CLOSE_WORKFLOW` audit logging.
- **Remaining Phase 15 scope:** VAT and multi-currency compliance pathways remain `AUDIT REQUIRED, P1`; overall Phase 15 remains partial until those additional routes are verified and the broader shipped-action inventory is fully audited.

### 16  Secondary data performance and indexing review (AUDIT REQUIRED, P1)

- **Archived core:** `WorkspaceAccessGuard` enforcement across 24 controllers and the Prisma `AuditLog` model are verified and recorded in the Archived Verified Phases table.
- **Remaining audit only:** profile high-volume tenant queries and migration-backed indexes, then document query plans, measured bottlenecks, missing/redundant index findings, and any bounded remediation. Do not reopen verified guard or audit-model work without contrary evidence.
- **Requirements:** read-only profiling first; no blanket reseed, delete, or speculative index creation. Depends on 9/12/14 and must use representative isolated data.
- **Done:** reviewed before/after query plans and load measurements demonstrate acceptable bounded behavior, migrations are reversible, and no regression is introduced in writes, tenant isolation, accounting, backup, or restore.

### 17  Integrated acceptance (PARTIALLY COMPLETE, P1 mandatory)

- **Owner:** Hydra (test verification) + Mantra (fixtures)
- **Status:** PARTIALLY COMPLETE (Journey 1 and Journey 2 verified complete; Journey 3 verified complete (7/7 tests passed); Journeys 4â€“5 remaining).
- **Verified passing commit:** `783a1f57c991ab7f4f28d243422651a5c6c6035b` (2026-10-31). Live isolated execution passed one suite and all three Journey 1 tests.
- **Verified runtime components:** dedicated acceptance Jest configuration; schema-aware, idempotent migrations; Windows-compatible Prisma migration invocation; sequential lock-safe teardown; immutable invoice-line tax resolution with a bounded transaction; and the balanced double-entry owner AR lifecycle.
- **Acceptance harness inventory:**
  1. `Haypbooks/Backend/jest.acceptance.config.js` (dedicated Jest config with single-worker execution and 60s timeout)
  2. `Haypbooks/Backend/package.json` (`test:acceptance` script with `NODE_ENV=test`)
  3. `Haypbooks/Backend/test/acceptance-global-setup.ts` (automated isolated schema setup with database name validation)
  4. `Haypbooks/Backend/test/acceptance-global-teardown.ts` (automated isolated schema cleanup)
  5. `Haypbooks/Backend/test/acceptance/shared/acceptance-harness.ts` (NestJS AppModule test bootstrap and service accessors)
  6. `Haypbooks/Backend/test/acceptance/journey-1-owner-lifecycle.acceptance-spec.ts` (complete Journey 1 owner lifecycle fixture: onboarding â†’ customer â†’ invoice â†’ payment â†’ balanced GL entries)
  7. `docs/implementations/phase17-acceptance-harness/README.md` (centralized architectural guide and local provisioning instructions)
- **Database Safety Controls:**
  - Automated schema-only lifecycle targeting `acceptance_test` schema exclusively (full database drops prohibited).
  - Validation requiring database name to contain `test` or `acceptance` before execution.
  - Fail-closed error handling (no error swallowing).
  - Test runner refuses unsupplied or unmarked databases, completely protecting development and production data.
- **Prerequisites:** Phase 9 (verified complete)
- **Scope:**
  - Deterministic acceptance test suite for core user journeys (Owner complete lifecycle, Accountant multi-entity, AP bill lifecycle, Fixed Asset lifecycle, Multi-Currency/Tax handling).
  - Isolated test harness with zero pollution of production or development database records.
- **Delivery criteria:**
  - 5 core journey fixtures passing deterministically in CI/local runs.
  - Verification that period-close workflows, ledger balancing, and account state transitions adhere strictly to double-entry rules.
- **Depends on:** Every phase required for release scope. Done only when the matrix below passes, no P0 remains, residual risks are scoped and accepted, and support/restore/rollback evidence is ready; then proceed to Phase 10.

## End-to-end acceptance matrix

For each row: success, invalid input, permission denial, network/server failure, cancel, repeated/concurrent submission, reload and permitted edit/reversal. Verify persisted and displayed states agree; assert financial/audit effects where applicable.

| Journey | Outcome |
|---|---|
| Signup  OTP  company/practice  trial  login/reset | Correct identity/workspace; no duplicate ownership/subscription |
| Trial  paid  change plan  overdue/cancel | Provider/UI/entitlements/history agree; no permanent free tier |
| Customer  invoice  post  partial/full payment  credit/refund | Source/allocation/AR/cash/revenue/tax/reports reconcile |
| Vendor  bill  post  payment  credit/void | AP/expense or asset/cash/tax/reversal reconcile |
| JE  approve/post  reverse  close | Balanced, numbered, traceable and period-protected |
| Inventory receipt/shipment/return/adjustment | Quantity/valuation/applicable GL agree |
| Bank import  match  reconcile  correct | No duplicate import/false match; differences explained |
| FX preview  approve/post  reverse | Correct rate/date/currency/gain-loss/idempotency |
| Practice invite  staff/client work  revoke | Correct tenant access throughout |
| Report  filter  drill-down  export | Same posted dataset and totals |
| Tax/payroll/assets/other released modules | Approved business rules and downstream effects |
| Backup  restore  deploy  health  rollback | Recoverable data and exact monitored revision |

### 18  Database Migration to Self-Hosted PostgreSQL (COMPLETED & VERIFIED: Milestone 1 & 2 Tooling; Live Drill Queued)

- **Status:** Milestone 1 (Infrastructure) and Milestone 2 (Automation Tooling) are COMPLETED & VERIFIED.
- **Milestone 1 Deliverables (Verified):**
  * PostgreSQL 15 and pgBouncer container configuration on loopback (`127.0.0.1:5432` and `127.0.0.1:6432`) with `scram-sha-256` auth.
  * Automated backup script `Haypbooks/Backend/scripts/backup.sh` with custom-format `pg_dump` and SHA-256 checksums.
  * Fail-closed restore script `Haypbooks/Backend/scripts/restore.sh` with checksum validation and active connection termination.
- **Milestone 2 Deliverables (Verified):**
  * Schema & data parity validator `Haypbooks/Backend/scripts/validate-parity.ts` (migration counts, core tables row audit, ledger debit/credit balance).
  * Automated staging drill script `Haypbooks/Backend/scripts/staging-drill.sh` with URL parsing and fail-closed checks.
  * Production cutover runbook script `Haypbooks/Backend/scripts/production-cutover.sh` with `.env` backup, PM2 restart, and 1-tap `--rollback`.
  * Updated `Haypbooks/Backend/.env.example` documenting `DIRECT_URL` (port 5432) alongside `DATABASE_URL` (port 6432).
  * Complete operational runbook documented in `docs/implementations/database-migration/README.md`.
- **Operational Next Step:** Execute live staging drill on VPS environment prior to Phase 10 deployment.
- Depends on: 1, 2, 3, 4, 5A, 5B, 6, 7, 8, 9.

<a id="appendix-completed-tasks"></a>
## Appendix: Completed Tasks
| **S1 â€” Tracked Credential Settings Containment** | **DONE & VERIFIED (2026-10-24)** | Untracked .vscode/settings.json from Git index, added .vscode/ to .gitignore, local settings preserved on disk. | [Gitignore Hardening README](../implementations/gitignore-hardening-task802/README.md#task-848s1-extension-tracked-credential-settings-containment-vscode) |
| **S2 â€” Attachment Object Ownership & Tenant Isolation** | **DONE & VERIFIED (2026-10-24)** | Enforced workspaceId filtering and uploader ownership for attachment access and deletions. | [Attachment Ownership README](../implementations/attachment-ownership/README.md) |
| **S3 â€” Guard/Controller Workspace Context Agreement** | **DONE & VERIFIED (2026-10-24)** | Enforced WorkspaceAccessGuard across all routes; eliminated raw header fallbacks. | [Security Tenant Isolation README](../implementations/security-tenant-isolation/README.md) |
| **Phase 12 â€” Security Containment** | **DONE & VERIFIED (2026-11-01)** | Completed and verified the security containment workstreams: credential settings, attachment ownership, and workspace access guard/controller agreement. | [Security Tenant Isolation README](../implementations/security-tenant-isolation/README.md) |
| **Phase 8 â€” AI Phase 2** | **DEFERRED / OPTIONAL** | Historical backlog retained for future AI review work; not a release-blocking phase for core product stability. | [Legacy AI roadmap backlog retained in this document] |

### Archived Verified Phases

| Phase | Title | Commit SHA | Verified Date |
|---|---|---|---|
| **Phase 3** | Section READMEs and evidence | `6f8335e42752b276761e14f0bf3b938afeec63b0` | 2026-10-22 |
| **Phase 4** | Balance Sheet Current-Year Earnings | `b724209bad9322031d614b11ac78386bc6114886` | 2026-10-04 |
| **Phase 5** | Inventory stock & GL atomic synchronization | `b724209bad9322031d614b11ac78386bc6114886` | 2026-10-04 |
| **Phase 7** | Multi-Currency FX Revaluation | `b724209bad9322031d614b11ac78386bc6114886` | 2026-10-12 |
| **Phase 9** | Reproducible Baseline Test Configuration | `01e470e9d2ddd687557f29fe96e3a72f48aa0c90` | 2026-10-27 |
| **Phase 11 Step 5A** | Practice Hub backend task and review queues | `def107fec9bde848d43b3c4002e6f601d42f76d6` | 2026-10-26 |
| **Phase 13** | Paid Plans, Trials & Stripe Billing | `b724209bad9322031d614b11ac78386bc6114886` | 2026-10-03 |
| **Phase 14A** | Approval workflow completion | `b724209bad9322031d614b11ac78386bc6114886` | 2026-10-05 |
| **Phase A3** | Period-Close Sign-Offs & Hardening | `01e470e9d2ddd687557f29fe96e3a72f48aa0c90` | 2026-10-10 |
| **Phase 16C** | Fixed Assets management | `b724209bad9322031d614b11ac78386bc6114886` | 2026-10-18 |
| **Phase 16D** | Remaining-module inventory and retention | `b724209bad9322031d614b11ac78386bc6114886` | 2026-10-02 |
| 16 | Core Audit Logging & Role Guards (WorkspaceAccessGuard & AuditLog model) | `42d004be3943434d4f7575c4e4d3d7df96ab36d4` | 2026-10-30 |
| **E10** | Practice Hub invitation acceptance | `b724209bad9322031d614b11ac78386bc6114886` | 2026-10-04 |
| **E12** | Sub-ledger & AP/AR posting/reversal lifecycle | `b724209bad9322031d614b11ac78386bc6114886` | 2026-10-04 |

## Appendix: Archived Completed Phases

### Phase 18 Milestone 1: Self-Hosted PostgreSQL & pgBouncer Infrastructure (COMPLETED & VERIFIED)
- **Verified Deliverables:** Loopback PostgreSQL 15 binding (`127.0.0.1:5432:5432`), pgBouncer container (`127.0.0.1:6432:6432`) with transaction pooling, `scram-sha-256` auth, automated backup script (`scripts/backup.sh`), fail-closed restore script (`scripts/restore.sh`), and migration documentation in `docs/implementations/database-migration/README.md`.
- **Status:** Locked into repository baseline at commit `66b3a68979303b4541ad8f0c32f5b688c84db422`.

## Definition of finished

Declared release scope has verified functionality, accounting integrity, permissions, usable failures, concurrency safety, tests, READMEs and operational recovery. Optional features may remain deferred. Unsupported features must not be advertised as working. Do not claim 100% functional or production-ready without scope-specific evidence.

## Consolidation decisions and original-plan crosswalk

Reviewed both complete roadmaps on 2026-09-12. The former root active phases 117 are retained above. Unique work from the August 29 documentation roadmap is integrated below; these supplements are part of the same active plan. Historical completion claims are preserved separately and are not fresh verification.

The governing [Product Maturity Standard](../standards/PRODUCT_MATURITY_STANDARD.md) remains authoritative for formal maturity audits: S1 accounting, S2 security, S3 persistence, S4 concurrency, S5 UX/API, S6 operations; formal tiers T1T5 require evidence. The descriptive labels and attachment-shaped AW summary above are planning assessments, not formal tier awards or a substitute for the standard's audit report. Defect priorities must be assessed under that standard; phase labels indicate scheduling urgency. Reference-inspired product expansion requires its prescribed proposal and owner approval.

| Previous plan/backlog | Active destination |
|---|---|
| Plan A self-hosted database | 16A below; optional infrastructure decision, not assumed necessary |
| Plan B multicurrency completion claim | 4/7/14 regression verification; does not establish revaluation completion |
| Plan C-3 budgeting | 16B below |
| Plan D approvals | 14A below |
| Plan E fixed assets | 16C archived to appendix |
| Plan F-1/F-2 AI | 8 plus supplement below |
| Plan G / S1S6 | 2/4/5/6/7/14 (S1), 12 (S2), 16 (S3), 9/14/16 (S4), 1/15 (S5), 3/9/10/17 (S6) |
| H-3 platform owner | 15A below |
| H-4 subscriptions | 13; old FREE seeding and automatic deletion requirements superseded |
| H-5 practice | 11/13/15; entitlement/access decisions verified server-side |
| H-6 role/schema cleanup | 12/16; preserve distinct platform, hub and RBAC roles |
| Ledger backlog | 2/4/6/7/14; reverify older atomicity/numbering/bank-account-link claims |
| Deferred stubs and technical debt | 16D and 9 supplements below |

Conflicts resolved:

- One canonical roadmap at this path. The root copy is removed after consolidation verification; the prior root's duplicated historical phase list is not retained as a competing plan.
- Subscription policy alignment: no permanent free tier; 15-day free trial; four paid subscription tiers with differentiated capacities. Historical 30-day references remain for reconciliation only and must not be treated as current policy. Trial expiry must not trigger automatic permanent deletion. Data retention/deletion needs explicit ownership, retention and recovery policy; historical financial records and other members' shared files are protected.
- The old recommendation to broaden cookie domain/change SameSite is now audit-first. Verify actual same-origin/proxy requirements and CSRF defenses; do not weaken cookie boundaries by rote.
- Old 4 GB server and fixed 5121024 MB heap advice is not a current sizing decision. Measure the actual server and workloads; owner reported 8 GB. Preserve 2448-hour memory monitoring as a validation task.
- Automatic deployment was historically claimed operational. Audit workflow triggers before any push; owner-only push still applies and may initiate a live deployment.
- Existing models must be reused: current Prisma schema includes FixedAsset, Approval, ApprovalWorkflow and ApprovalRequest. Do not execute old instructions to create duplicate models. Practice XP fields exist; field presence alone does not prove a working progression system.
- Current owner controller uses SystemRoleGuard/SUPER_ADMIN declarations. Do not replace existing owner APIs based on older blank-feature claims. Trace endpoint and frontend coverage first.
- The older '22 stubs' count and test counts are historical inventory claims, not verified current totals. Re-enumerate actual implementations before classifying missing work.

### 15A  Platform administration and dedicated platform-admin shell (COMPLETED)

- **Status:** [x] COMPLETED (Commit: `28a2779e`)
- **Documentation:** `Haypbooks/Frontend/docs/implementations/platform-admin-shell-phase15a/README.md`
- **Delivered scope:** Dedicated `SUPER_ADMIN` header entry point, route-guarded platform-admin layout, and a dedicated sidebar with Metrics, Storage, User Management, and Return-to-App navigation.
- Distinguish SUPER_ADMIN platform administration, company administration and practice administration. Build an authorized dashboard switcher; hiding navigation is not authorization. Platform administration itself is not a paid customer plan; any bypass must be server-side, auditable and limited to platform operations. Company/practice tenant access still needs explicit policy.
- Verify workspace creation choices, no-company layout, useCompanyId behavior, stale demo identities, and platform links shown to ordinary workspace owners. Company/practice crossover follows owner-approved membership/plan policy, not a blanket role-name assumption.
- Dependencies: 12/13/15. Acceptance: full role/route/API matrix, denied direct URLs/requests, persistent status changes, pagination/filtering, consistent metrics and audit entries. No blanket cascade user/file deletion.
- **Next phase:** Phase 15B continues with the concrete platform-admin pages and operational metrics/user-management endpoints.

### 16A  Database hosting decision (legacy Plan A; AUDIT REQUIRED, optional)

- Compare current hosted database with VPS/dedicated hosting for cost, capacity, availability, maintenance and recovery. Do not migrate just because a prior plan proposed it.
- If selected: document PostgreSQL/pooling/resource configuration, network restrictions, backup/WAL retention and restore process, migration compatibility and explicit cutover/rollback procedure. A pg_dump plus DNS change does not guarantee zero downtime; define allowable downtime or a proven replication strategy.
- Dependencies: 9/16/17 data-layer evidence and owner infrastructure decision. Acceptance: rehearsal on isolated data, reconciled counts/balances, restore and rollback, measured downtime, verified connection/security settings. Production migration requires its own bounded authorization.

### 16B  Budget enhancements (legacy C-3; AUDIT REQUIRED, P2)

- Reverify existing budgets and claimed CSV/PDF exports before adding them. Preserve industry templates, configurable variance alerts, original/revised/forecast comparisons, cash-flow forecast integration and budget-line ownership/comments as planned scope.
- Output: templates mapped to company COA without invented financial facts; company-scoped thresholds and deduplicated notifications; versioned forecast comparisons; transparent forecasting assumptions; permission-controlled collaboration.
- Dependencies: 4 accurate actuals, 12 permissions, core budgeting verification. Acceptance: actual/budget reconciliation, threshold boundaries, repeated jobs, template mismatch, scenario history, collaboration authorization and export parity tests. Choose approved subsets rather than treating all enhancements as launch blockers.

