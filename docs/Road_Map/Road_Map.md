# HaypBooks  End-to-End Completion Roadmap

## Current verification checkpoint - 2026-09-26

This checkpoint supersedes stale statements below only for the items verified here. Full findings, source anchors, commands, limitations and acceptance order: [September 26 audit](../audits/2026-09-26-current-status.md).

- Status: substantial implementation; release blocked for affected accounting, billing and security scope. No production-readiness certification.
- Working tree at HEAD b00f0710 plus existing uncommitted changes; GitHub main cd3d30e8, 41 commits behind local HEAD. Deployment revision unknown.
- Verified today: frontend typecheck PASS; backend typecheck PASS; frontend lint exit 0 with 166 warning lines; five selected backend suites PASS (41 tests). Frontend checkout suites BLOCKED before execution by missing tmpl/lib/tmpl. Full builds, DB integration and browser parity remain unverified in this checkpoint.
- Progress: test helpers now authenticate caller tokens and have conditional module registration; workspace guard added to practice controllers; createAndPostJE now persists supplied entryNumber; frontend build skips are disabled. Historical E8 bypass wording and earlier test-token-presence-only descriptions are superseded.
- Numbering is only partially accepted: company-local sequence generation conflicts with schema-wide unique entryNumber and needs concurrent/cross-company tests. Do not infer complete Phase 2 acceptance from the one-field fix.
- Required security work: tracked credential settings (S1), attachment object ownership (S2), guard/controller workspace-context agreement (S3 ✓).
- Required financial work: journal reversal/report consistency (A1), earnings (A2), payroll void (A4), inventory lifecycle (A5), bank matching (A6): BANK-02 ingestion guards completed, remaining matching algorithm work outstanding, numbering (A7). IDs refer to the linked audit.
- Required product work: real payment confirmation (B1), real analytics (F1), FX behavior (F2), and browser-verified intro/navigation/login parity. Intro slide two is white again in source; global CSS and scroll/font integration still require acceptance.
- Next order: security containment -> reproducible checks -> accounting invariants and report reconciliation -> truthful billing/analytics -> reference parity -> integrated acceptance/restore/deployment verification. Keep existing phase IDs and historical work; reopen validation acceptance where fresh checks remain blocked.


Updated 2026-09-12. Canonical location: docs/Road_Map/Road_Map.md. This file consolidates both former roadmaps; there is no separate root roadmap. This update is based on inspected source, not a claim that the application passes a complete runtime audit. The attached audit is a checklist, not an existing findings report. Browser, live database, Stripe, VPS, performance and restore validation remain outstanding.

Single source of truth: docs\Road_Map\Road_Map.md. The former root-level Road_Map.md has been removed from the working tree (Hydra repo audit, 2026-09-12).

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

### 3  Section READMEs and evidence (PARTIAL, P1 continuous)

- Audit: distinguish source presence, observed execution and historical claims. Auth artifact has corrupted excerpts; any rebuild remains separately scoped. Never invent timestamps/transcripts.
- Deliver: update/create each implemented section's README in its existing documentation location; link frontend/backend, architecture, files, APIs, decisions, permissions, behavior, validation results and limits.
- Depends on: verified phase results. Done: each completed section has reproducible evidence and matching roadmap status. Only then mark DONE, preserve durable README and remove completed active-phase detail. Documentation-only within this phase.

## Completed & Verified Implementation Phases (Archived)

The following core accounting modules and defects have been fully resolved, tested, verified by Hydra audit, and documented in dedicated implementation records:

| Phase | Module & Scope | Resolution Summary | Authoritative Implementation Documentation |
|---|---|---|---|
| **Phase 14** | Accounting lifecycle controls | Period-lock validation (`assertPeriodOpen`), GL idempotency deduplication, exact payload-conflict validation, and deterministic caller wiring for bill/inventory/bank categorization flows | [Accounting Lifecycle README](Haypbooks/Backend/docs/implementations/accounting-lifecycle-controls/README.md) |
| **Phase 9** | Lint & Type Baseline Enforcement | Full codebase ESLint and TypeScript baseline restored with clean exit code 0 | [Lint Baseline README](Haypbooks/Frontend/docs/implementations/lint-baseline-enforcement/README.md) |
| **Phase 12 E1** | Test Endpoint Security Guard & Hardening | ensureEnabled() environment guard, test tokens, 8/8 tests green | [Test Security README](Haypbooks/Backend/src/test/README.md) |
| **Phase H-0** | SUPER_ADMIN provisioning | JWT `systemRole` and `isOwner` claims, strategy validation, verified seed script | [Auth Module](Haypbooks/Backend/src/auth/prisma-auth.service.ts) |
| **Phase 12 E2** | WorkspaceAccessGuard implementation | Centralized tenant context guard across 10 core controllers, Batch 1 rollout completed 2026-10-02, array workspace ID rejection bug fix, request context propagation, 10/10 unit tests passing | [Workspace Access Guard README](Haypbooks/Backend/docs/implementations/workspace-access-guard/README.md) |
| **Phase 12** | Security and tenant isolation | DONE & VERIFIED | 19/19 tenant controllers guarded, test endpoints blocked in prod, admin routes restricted, auth rate limiting and session revocation complete |
| **Phase 16D** | Explicit remaining-module inventory and retention | Comprehensive backend module inventory created 2026-10-02, 39 controllers documented, Batch 1/Batch 2 mapped | [Module Inventory README](Haypbooks/Backend/docs/implementations/module-inventory/README.md) |
| **Phase 13 — Paid Plans, Trials & Stripe Billing** | **DONE & VERIFIED (2026-10-03)** | Four canonical paid plans + 30-day non-destructive trial (`planId: DEFAULT_TRIAL_PLAN_ID`), `/api/subscriptions/create` onboarding route & inline `role="alert"` error handling (E2), trial bootstrap & 30-day ticker alignment (E9), Stripe SDK checkout/portal/webhook lifecycle (`docs/implementations/subscription-onboarding/README.md`, `docs/implementations/billing-trial-alignment/README.md`, `docs/implementations/module-inventory/README.md`). | |
| **Phase 5 — E5 Inventory Stock & GL Atomic Synchronization** | **DONE & VERIFIED (2026-10-04)** | Fixed `DRAFT` stock mutation, added double-posting guard, and enforced atomic `POSTED` stock updates + `SubLedgerService.postInventoryTransactionToGL` + `journalEntryId` linking + `POST_TO_GL` audit logging inside a single Prisma `$transaction` (`docs/implementations/inventory-gl-sync/README.md`). | |
| **Phase 4 — E4 Balance Sheet Current-Year Earnings Presentation** | **DONE & VERIFIED (2026-10-04)** | Added fiscal-year-start calculation, year-to-date revenue/expense aggregation (`_getAccountBalancesForPeriod`), and synthetic equity line `Current-Year Earnings (Net Income)` (`accountCode: '3999'`) in `_buildBalanceSheet` with `isBalanced` verification (`docs/implementations/balance-sheet-earnings/README.md`). | |
| **E10 — Practice Hub Invitation Acceptance (`practice-hub.service.ts:214`)** | **DONE & VERIFIED (2026-10-04)** | Verified transactional `acceptInvite` implementation in `src/practice-hub/practice-hub.service.ts:214` (identity/company access checks, atomic engagement creation + invite `ACCEPTED` status update; `docs/implementations/practice-hub-invites/README.md`). | |
| **E12 — Sub-Ledger & AP/AR Posting/Reversal Lifecycle (`ap.repository.ts`, `sub-ledger.service.ts`)** | **DONE & VERIFIED (2026-10-04)** | Verified transactional posting/reversal foundations, `assertPeriodOpen` enforcement, `createReversingJE` in `ap.repository.ts:voidBill`, conditional audit writes, and AP/sub-ledger unit test suites (`gl-integrity.spec.ts`, `bill-lifecycle.spec.ts`, `void-lifecycle.spec.ts`, `approval-workflow.spec.ts`; `docs/implementations/sub-ledger-lifecycle/README.md`). | |
| **14A — Approval workflow completion** | **DONE & VERIFIED (2026-10-05)** | Added `listPendingApprovals`, pending-approval route exposure, creator/requester self-approval prevention, replay protection for already posted bills, and company/workspace-scoped authorization checks for the approval queue (`docs/implementations/approval-workflow-completion/README.md`). | [Approval Workflow README](../implementations/approval-workflow-completion/README.md) |
| **Phase A3 (Period-Close Sign-Offs & Hardening)** | **DONE & VERIFIED (2026-10-10)** | Consolidated close-workflow routes under company-scoped `AccountingController`, enforced server-side `OWNER`/`ADMIN`/`ACCOUNTANT` authorization (`assertPeriodClosePermission`, `VIEWER` blocked with `403`), added explicit `periodId` selection across backend and frontend, added `COMPLETE_CLOSE_WORKFLOW` audit logging, and verified the backend/unit and type-check regression gates | [Period Close Sign-Offs README](../implementations/period-close-sign-offs/README.md) |
| **Phase 7 — Multi-Currency FX Revaluation** | **DONE & VERIFIED (2026-10-12)** | Verified end-to-end period-end FX revaluation: date-aware preview, accountant policy ratification (`ratifyFxAccountPolicy`), fail-closed gate (`canPostOrFinalize`), atomic GL journal posting (`finalizeMultiCurrencyRevaluation`), and reversal workflow (`reverseMultiCurrencyRevaluation`) in `Haypbooks/Backend/src/accounting/accounting.service.ts` (L1780-L2079). Full backend test suite passing at 43/43 tests in `accounting.service.spec.ts`. Frontend owner period-close UI wired in `Haypbooks/Frontend/src/app/(owner)/accounting/period-close/multi-currency-revaluation/page.tsx`. Documented in `docs/implementations/fx-revaluation/README.md`. | [FX Revaluation README](../implementations/fx-revaluation/README.md) |
| **Phase 13E1 — Billing Hardening (Task 719)** | **DONE & VERIFIED (2026-10-14)** | Resolved critical vulnerabilities: removed frontend rogue ACTIVE subscription fallback, added Stripe webhook 0-row update validation, and added unit test coverage for non-existent subscription events | [Billing Hardening README](../implementations/billing-hardening-task719/README.md) |
| **Phase 16C Step 2 — Fixed Assets Depreciation Engine & GL Integration** | **DONE & VERIFIED (2026-10-12)** | Implemented straight-line depreciation calculation engine, GL journal integration via createAndPostJE with FIXED_ASSET_DEPRECIATION source, role-based authorization for OWNER/ADMIN/ACCOUNTANT, duplicate run prevention, idempotency key support, asset account status validation, audit logging, and 18 passing unit tests; documented in docs/implementations/fixed-assets-step2/README.md. |
| **Phase 16C Step 3 — Fixed Assets Disposal & Write-Off Flow** | **DONE & VERIFIED (2026-10-15)** | Implemented disposal quote calculation, sale processing with gain/loss GL posting, write-off journal workflow, asset status transitions to SOLD/DISPOSED, role enforcement for OWNER/ADMIN/ACCOUNTANT, audit logging, and 7 passing unit tests; transactional Prisma $transaction ensures atomicity of all disposal mutations | [Fixed Assets Step 3 README](../implementations/fixed-assets-step3/README.md) |
| **Phase 11 P2** | Practice Hub Progression & XP System — **DONE & VERIFIED (2026-10-15)** | Zero-database-migration XP tracking with deterministic replay prevention, dynamic tier calculations, and practice-wide leaderboards | [Practice Hub P2 Progression README](../implementations/practice-hub-p2-progression/README.md) |
| **Financial Invariants U1** | Core Financial & Workflow Invariant Fixes — **DONE & VERIFIED (2026-10-17)** | P0 fixes for FIN-01 (FX carrying-value), REP-01 (Deferred revenue BS net income), and AP-01 (Role-based bill approval authorization) with 109 passing unit tests | [Financial Invariants U1 README](../implementations/financial-invariants-u1/README.md) |
| **Phase 1** | Landing, Intro & Public Experience (L1–L6) — **DONE & VERIFIED (2026-10-17)** | Full landing page overhaul, intro animation sequences, responsive layout, dark/light theme, verified public route pruning (L6), and footer authenticated workspace link remediation (L4) | [Landing L4 README](../implementations/landing-l4-footer-links/README.md) · [Landing L6 README](../implementations/landing-l6-route-pruning/README.md) |
---

## Active & Remaining Implementation Phases

### 8  AI Phase 2 (AUDIT REQUIRED, P3 optional)

- Audit: existing AI, tenant data exposure, provider cost, failures and owner/JP goals.
- Deliver: agreed assistance with source traceability, uncertainty and human review for financial writes; permissions/budgets/secrets enforced. Autonomous posting requires separate approved controls.
- Depends on: 12/14/17. Done: agreed evaluations, cross-tenant denial, incorrect answer, outage and cost-limit cases pass. Does not block non-AI release.

### 10  VPS release (BLOCKED, P1 final gate)

- Audit: read-only local/remote revisions, server checkout, PM2, TLS/proxy, environment/migration state. Historical drift claims are not fresh facts.
- Deliver: reviewed revision -> owner push -> controlled pull/install/build/migration if approved -> restart/health check, with rollback. No blind overwrite of server changes.
- Requirements: backup/restore, secrets, logs, monitoring/resource limits. Reported 4vCPU/8GB/80GB is planning input, not measured capacity.
- Depends on: 9/12/13/16/17 and released accounting phases. Done: exact revision served, TLS/API/auth/jobs healthy, load/restore/rollback verified, no P0 unresolved.

### 11  Practice Hub (PARTIAL, P1 core; P2 progression)

- Audit: owner/staff/client roles, invite expiry/races, engagements/tasks/reviews/switching/revocation. Reuse E10 foundation.
- Deliver: reliable client work and server-enforced capacities. P2 progression & XP tracking delivered and verified (see archived Phase 11 P2).
- Recommendation: guarantee paid base capacity; earn separate bonuses. Prefer grace/gradual bonus decay over resetting XP to zero. Preserve historical read/export access when over capacity; disclose restrictions on new additions. Paid boosts disclose quantity/duration/renewal/refunds and remain distinct from earned XP.
- Depends on: 12/13/16 and owner economics. Done: permissions/invite races/revocation/capacity pass; if progression ships, replay/earning/decay/grace/boost tests pass. Paid entitlements never silently shrink; core can ship without gamification.
- Step 1 status: practice models exist, engagement flow is implemented, and tenant delegation in `WorkspaceAccessGuard` is active for active `Engagement` relationships between a practice and a client workspace.
- Step 2 status: invite creation now enforces the practice plan's `maxClients` limit, preventing new client invitations beyond the active plan capacity.
- Step 3 status: invite acceptance now enforces `maxClients` capacity and atomic `PENDING` race protection inside `$transaction`, and practice invite/engagement revocation (`revokeInvite` / `revokeEngagement`, archiving engagements so active-relationship checks in `WorkspaceAccessGuard` fail closed and capacity slots release) is implemented and unit-tested in `practice-hub.service.spec.ts` (Phase 11 remains `PARTIAL` while owner/staff/client roles, tasks, reviews, switching, and progression remain open).
- Step 4 status: canonical `PracticeUser.role` and `PracticeUser.status` model, deterministic single-owner SQL migration backfill (`DISTINCT ON ("practiceId")`), onboarding owner seeding, and strict fail-closed runtime authorization are implemented and unit-tested via public service methods in `practice-hub.service.spec.ts`.
- Step 5A status: backend task queue, review queue, and practice-switch context contract are implemented in `practice-hub.service.ts` and `practice-hub.controller.ts`, with fail-closed status/role and client-engagement guards covered in `practice-hub.service.spec.ts` and verified by the targeted backend Jest suite (21/21 passing).
- Step 5B status: the live frontend task queue, review queue, client context switcher, sidebar `TASKS`/`REVIEWS` navigation entries, and aligned `PracticeHubPage.test.tsx` are implemented in the live frontend and verified by `npx tsc --noEmit --pretty false` and the targeted `PracticeHubPage.test.tsx` suite; Phase 11 remains `PARTIAL` until progression/XP and broader acceptance validation are complete.

### 15  Every shipped route/action (AUDIT REQUIRED, P1)

- Audit: inventory owner/staff/accountant/client routes and actions, real data sources and release/finish/defer disposition, including settings/reports/exports.
- Deliver: fix dead buttons, mock-live data, persistence, navigation/validation; reuse shared tables/forms/status patterns where beneficial. Keyboard/mobile and loading/error/success/retry/cancel required.
- Depends on: 1/11/13/14. Done: no unexplained shipped placeholders; reload restores server truth; realistic company/accountant/practice tasks and permission failures pass; visual differences documented.
- Verified update: the Period-Close Sign-Offs sub-module is COMPLETE & VERIFIED. The company-scoped workflow is now exposed through `AccountingController` as GET/POST endpoints under `/api/companies/:companyId/accounting/period-close/workflow*`, the stale close-checklist link was corrected to `/accounting/period-close/sign-offs`, the mutation path enforces server-side `OWNER`/`ADMIN`/`ACCOUNTANT` authorization while blocking `VIEWER` with `403`, and the live sign-offs page is wired to the backend with explicit `periodId` selection and `COMPLETE_CLOSE_WORKFLOW` audit logging. Phase 15 remains PARTIAL overall because the broader shipped-action inventory still includes other non-period-close modules awaiting audit; the period-close sign-offs sub-module itself is fully verified.

### 16  Data, performance and remaining modules (AUDIT REQUIRED, P1)

- Audit: schema/migrations/isolated DB, FKs/indexes/RLS, precision/timezone, retention/import/export/jobs; tax/payroll/assets and every advertised module not covered. Select jurisdictions with owner; do not invent compliance scope.
- Deliver: demonstrated defects repaired with reviewed reversible changes, bounded queries, retry-safe jobs, secure storage and recovery. Restructure only for demonstrated benefit.
- Requirements: read-only profiling before explicit data-repair plan; no blanket reseed/delete. Depends on: 9/12/14.
- Done: migration rehearsal, pre/post counts/balances, restore, realistic large-tenant load and job recovery pass; other advertised modules verified or excluded from release.

### 17  Integrated acceptance (NOT STARTED, P1 mandatory)

- Deliver: deterministic full-workflow fixtures connecting UI/API/persistence/ledger/reports/billing/permissions; independently review results and route defects to owning phases.
- Requirements: realistic roles/data sizes, revision/environment/commands/expected-actual results and honest limitations. No inferred passes.
- Depends on: every phase required for release scope. Done: matrix below passes, no P0, residual risks scoped/accepted, READMEs/support/rollback ready; then release 10.

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

## Appendix: Completed Tasks


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
| Plan E fixed assets | 16C below |
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
- Four paid plans and a 30-day trial replace the older FREE-plan proposal. Trial expiry must not trigger automatic permanent deletion. Data retention/deletion needs explicit ownership, retention and recovery policy; historical financial records and other members' shared files are protected.
- The old recommendation to broaden cookie domain/change SameSite is now audit-first. Verify actual same-origin/proxy requirements and CSRF defenses; do not weaken cookie boundaries by rote.
- Old 4 GB server and fixed 5121024 MB heap advice is not a current sizing decision. Measure the actual server and workloads; owner reported 8 GB. Preserve 2448-hour memory monitoring as a validation task.
- Automatic deployment was historically claimed operational. Audit workflow triggers before any push; owner-only push still applies and may initiate a live deployment.
- Existing models must be reused: current Prisma schema includes FixedAsset, Approval, ApprovalWorkflow and ApprovalRequest. Do not execute old instructions to create duplicate models. Practice XP fields exist; field presence alone does not prove a working progression system.
- Current owner controller uses SystemRoleGuard/SUPER_ADMIN declarations. Do not replace existing owner APIs based on older blank-feature claims. Trace endpoint and frontend coverage first.
- The older '22 stubs' count and test counts are historical inventory claims, not verified current totals. Re-enumerate actual implementations before classifying missing work.

### 15A  Platform administration and three-role navigation (legacy H-3; PARTIAL / AUDIT REQUIRED)

- 15A  PARTIAL: server-side RBAC is implemented and verified for the owner controller; broader authorization coverage is pending further audit.
- Distinguish SUPER_ADMIN platform administration, company administration and practice administration. Build an authorized dashboard switcher; hiding navigation is not authorization. Platform administration itself is not a paid customer plan; any bypass must be server-side, auditable and limited to platform operations. Company/practice tenant access still needs explicit policy.
- Verify workspace creation choices, no-company layout, useCompanyId behavior, stale demo identities, and platform links shown to ordinary workspace owners. Company/practice crossover follows owner-approved membership/plan policy, not a blanket role-name assumption.
- Dependencies: 12/13/15. Acceptance: full role/route/API matrix, denied direct URLs/requests, persistent status changes, pagination/filtering, consistent metrics and audit entries. No blanket cascade user/file deletion.

### 16A  Database hosting decision (legacy Plan A; AUDIT REQUIRED, optional)

- Compare current hosted database with VPS/dedicated hosting for cost, capacity, availability, maintenance and recovery. Do not migrate just because a prior plan proposed it.
- If selected: document PostgreSQL/pooling/resource configuration, network restrictions, backup/WAL retention and restore process, migration compatibility and explicit cutover/rollback procedure. A pg_dump plus DNS change does not guarantee zero downtime; define allowable downtime or a proven replication strategy.
- Dependencies: 9/16/17 data-layer evidence and owner infrastructure decision. Acceptance: rehearsal on isolated data, reconciled counts/balances, restore and rollback, measured downtime, verified connection/security settings. Production migration requires its own bounded authorization.

### 16B  Budget enhancements (legacy C-3; AUDIT REQUIRED, P2)

- Reverify existing budgets and claimed CSV/PDF exports before adding them. Preserve industry templates, configurable variance alerts, original/revised/forecast comparisons, cash-flow forecast integration and budget-line ownership/comments as planned scope.
- Output: templates mapped to company COA without invented financial facts; company-scoped thresholds and deduplicated notifications; versioned forecast comparisons; transparent forecasting assumptions; permission-controlled collaboration.
- Dependencies: 4 accurate actuals, 12 permissions, core budgeting verification. Acceptance: actual/budget reconciliation, threshold boundaries, repeated jobs, template mismatch, scenario history, collaboration authorization and export parity tests. Choose approved subsets rather than treating all enhancements as launch blockers.



| **Phase A6 (Partial: BANK-01, BANK-02)** | Banking Reconciliation: Auto-Match Invariants & Statement Ingestion Hardening — **DONE & VERIFIED (2026-10-18)** | Auto-match invariants, duplicate line protection, zero-amount filtering, invalid date validation, and workspace isolation; 9/9 unit tests passing | [Banking Reconciliation README](../implementations/banking-reconciliation/README.md) |
