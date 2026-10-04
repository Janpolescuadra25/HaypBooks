# HaypBooks  End-to-End Completion Roadmap

## Current verification checkpoint - 2026-09-26

This checkpoint supersedes stale statements below only for the items verified here. Full findings, source anchors, commands, limitations and acceptance order: [September 26 audit](../audits/2026-09-26-current-status.md).

- Status: substantial implementation; release blocked for affected accounting, billing and security scope. No production-readiness certification.
- Working tree at HEAD b00f0710 plus existing uncommitted changes; GitHub main cd3d30e8, 41 commits behind local HEAD. Deployment revision unknown.
- Verified today: frontend typecheck PASS; backend typecheck PASS; frontend lint exit 0 with 166 warning lines; five selected backend suites PASS (41 tests). Frontend checkout suites BLOCKED before execution by missing tmpl/lib/tmpl. Full builds, DB integration and browser parity remain unverified in this checkpoint.
- Progress: test helpers now authenticate caller tokens and have conditional module registration; workspace guard added to practice controllers; createAndPostJE now persists supplied entryNumber; frontend build skips are disabled. Historical E8 bypass wording and earlier test-token-presence-only descriptions are superseded.
- Numbering is only partially accepted: company-local sequence generation conflicts with schema-wide unique entryNumber and needs concurrent/cross-company tests. Do not infer complete Phase 2 acceptance from the one-field fix.
- Required security work: tracked credential settings (S1), attachment object ownership (S2), guard/controller workspace-context agreement (S3 ✓).
- Required financial work: journal reversal/report consistency (A1), earnings (A2), period close (A3), payroll void (A4), inventory lifecycle (A5), bank matching (A6), numbering (A7). IDs refer to the linked audit.
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

### 1  Landing, intro and auth (PARTIAL, P1 - only L4-L6 remaining)

- Audit first: map every reference page/state in `docs/HB_new_(landingpage, intro, & login)/HB_clone` to production; compare desktop/mobile screenshots and interactions. Record intentional differences for real auth and approved pricing.
- Deliver: approved visual parity through shared LandingExperience/AuthShell plus per-page hub composition (server page composing Navbar + hub component + Footer); retain `/` and `/landing`, `hb-intro-seen`, real OTP/reset/login behavior. Never copy simulated success.
- Requirements: preserve zero-new-dependency, read-only/untracked reference, Next14/Tailwind3/motion-react and no-Prisma constraints; explicit staging/local-only commit when authorized. Reverify historical baseline 83cec1ed/analytics-fix claims.
- Depends on: 9 validation and 13 copy. Done: route/state matrix, responsive/keyboard/reduced-motion, auth success/error/retry, lint/typecheck and handoff verified. Historical build failure is not release acceptance.
- L4: verify the landing link matrix against the reference (top bar/nav targets, Learn & Support route, Accountant/Bookkeeper click targets).
- L5: compare landing scroll and runtime behavior against the reference (user visual checks; scroll animations preserved).
- L6 (LAST): remove the old accountant/bookkeeper pages and components once L1-L5 are verified.

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
---

## Active & Remaining Implementation Phases

### 7  FX (AUDIT REQUIRED, P1; gate if offered)

- Audit: rates, monetary scope, existing engines and realized/unrealized policy; reproduce E7.
- Deliver: correct filters/errors, dated-rate preview, approval, gain/loss posting and policy-defined reversal; explicit precision/missing-rate behavior and idempotency.
- Depends on: 2/4/14 and accountant policy. Done: E7 is remediated and verified; dedicated `CurrencyRevaluation` queries use a single `createdAt` filter object, preserve both `gte` and `lte` bounds, and rethrow DB failures instead of returning empty data silently. If deferred, do not advertise proxy results as functioning revaluation.

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
- Deliver: reliable client work and server-enforced capacities. Proposed XP needs approved qualifying activities, thresholds, event ledger and anti-abuse rules before implementation.
- Recommendation: guarantee paid base capacity; earn separate bonuses. Prefer grace/gradual bonus decay over resetting XP to zero. Preserve historical read/export access when over capacity; disclose restrictions on new additions. Paid boosts disclose quantity/duration/renewal/refunds and remain distinct from earned XP.
- Depends on: 12/13/16 and owner economics. Done: permissions/invite races/revocation/capacity pass; if progression ships, replay/earning/decay/grace/boost tests pass. Paid entitlements never silently shrink; core can ship without gamification.
- Step 1 status: practice models exist, engagement flow is implemented, and tenant delegation in `WorkspaceAccessGuard` is active for active `Engagement` relationships between a practice and a client workspace.
- Step 2 status: invite creation now enforces the practice plan's `maxClients` limit, preventing new client invitations beyond the active plan capacity.

### 15  Every shipped route/action (AUDIT REQUIRED, P1)

- Audit: inventory owner/staff/accountant/client routes and actions, real data sources and release/finish/defer disposition, including settings/reports/exports.
- Deliver: fix dead buttons, mock-live data, persistence, navigation/validation; reuse shared tables/forms/status patterns where beneficial. Keyboard/mobile and loading/error/success/retry/cancel required.
- Depends on: 1/11/13/14. Done: no unexplained shipped placeholders; reload restores server truth; realistic company/accountant/practice tasks and permission failures pass; visual differences documented.

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

### 14A  Approval workflow completion (legacy Plan D; AUDIT REQUIRED)

- Scope: configurable action/amount/role approval matrix, JE thresholds, reconciliation sign-off, pending dashboard and single/sequential approval as actually required. Inspect existing approval models, services and states first.
- Output: server-enforced transitions including pending/approved/rejected/canceled, reasons and actor/source audit linkage; no self-approval or bypass where policy forbids it. Approved content cannot change unnoticed afterward.
- Dependencies: 12 identity/permissions, 14 posting lifecycle, owner/accountant policy. Acceptance: threshold boundaries, rejected/canceled/replayed requests, changed documents, concurrent approvers and unauthorized approval tests; accepted records post once. Reuse existing models and README.

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

### 16C  Fixed assets (legacy Plan E; AUDIT REQUIRED)

- Audit existing asset/category/schedule/depreciation models and GL integration. Complete register/filter/summary, acquisition, straight-line/declining-balance methods where supported, scheduled depreciation, disposal proceeds/gain-loss and approved revaluation/impairment scope.
- Requirements: accountant-approved useful life/salvage/rounding/proration and revaluation policy; no duplicate asset schema or postings. Dependencies: 2/4/14 core accounting verification.
- Acceptance: schedule totals, partial periods, disposal, retry, reversal, closed periods and asset-to-GL reconciliation; unsupported methods clearly excluded from released scope.

### Existing-phase supplements retained from the older roadmap

- Phase 8: specifically scope persistent company/user-bound chat history, document Q&A, anomaly insights and context-aware responses; any quick-action execution requires review and existing financial controls. These are inherited goals, not evidence they already work.

- Phase 10/16: verify metrics accumulation and currency cache behavior, observe memory for 2448 hours, inspect connection pooling and deployment cache handling. Reconfirm registrar/DNS ownership before documenting Porkbun/Cloudflare as current operational facts.
- Phase 12/15: unify API authentication/error handling using existing apiClient or a justified shared wrapper after inventory; avoid indiscriminate fetch replacement. Test login/logout/refresh through the actual production routing arrangement.
- Phase 3: retain module-root README policy and link the canonical roadmap from future documentation. Read historical completion claims before rebuilding any functionality, but require current evidence before re-certifying it.

---

## Appendix: Completed Resolutions & Historical Verifications

## Historical completion index from the documentation roadmap

The following entries were labeled complete in the August 29 document. They are retained as historical context only, not new verification of source, deployed configuration or tests. Regressions belong in the owning active phase. Checked boxes or deployment claims here do not override current release gates.

### Historical claims (not re-certified)
<details>
<summary>Archived completed projects (older)</summary>

-  **Memory Leak Fix**  Resolved unbounded metrics accumulation in `Backend/src/common/metrics.ts` with hourly `counts.clear()` + PM2 `max_memory_restart 1G` mitigation
-  **Slow Currency Endpoint Fix**  Fixed `GET /api/currency/currencies` latency with 1-hour TTL in-memory cache in `exchange-rate.service.ts:82-88`
-  **Fix 401 on Dashboard (Auth Cookie Routing)**  Changed `NEXT_PUBLIC_API_URL` from `https://api.haypbooks.com` to empty string in `.env.production` on VPS so axios requests stay same-origin through nginx proxy.
-  **Fix 403 on Dashboard (RolesGuard)**  Updated `Backend/src/auth/guards/roles.guard.ts` line 33 to treat `role='business'` as equivalent to `'owner'` (case-insensitive + businessowner mapping). Committed to git and deployed to VPS.
-  **Fix Undeposited Funds Account Code Mismatch**  Replaced hardcoded `'1050'` in `Backend/src/shared/sub-ledger.service.ts` with `SYSTEM_ACCOUNTS.UNDEPOSITED_FUNDS.code` for `postBankDepositToGL`. This fixes bank deposit GL posting by using the current COA code `'1170'` instead of the legacy, missing `'1050'` account.
-  **Fail-fast unbalanced JE postings**  Changed `Backend/src/shared/sub-ledger.service.ts` so `createPostedJE()` throws `BadRequestException` when total debits and credits differ by more than 0.005 instead of quietly returning null and skipping the journal entry.  The P1 workstream item on silent unbalanced postings is closed by this fix; removed from the active P1 list (roadmap reconciliation, August 2026).
-  **Fix Void/Reversal JE Dating**  All void/reversal methods (createReversingJE + 8 callers, reverseInvoiceGL, reversePaymentReceivedGL, reverseCreditNoteGL, reverseWriteOffGL, reverseRefundGL, reverseRevenueRecognitionGL, voidJournalEntry) now use the original entry's date instead of `new Date()`, preventing accounting period corruption. Voids in closed periods now correctly fail.
-  **Fix voidDeposit Missing GL Reversal**  Added `createReversingJE` call to `voidDeposit` in `banking.repository.ts`, creating a proper GL reversal JE when a bank deposit is voided. Previously the original deposit JE remained posted, permanently overstating cash and understating undeposited funds.
-  **Fix DB Connection Limit**  Added `&connection_limit=10` to DATABASE_URL in `Backend/.env` on VPS.
-  **Fix CORS on api.haypbooks.com**  Added port 80 proxy block in nginx for `api.haypbooks.com`.
-  **Onboarding Re-Trigger Fix**  Fixed: added `getOnboardingStatus()` helper in `prisma-auth.service.ts` (L100-111) that queries `OnboardingData.complete` instead of non-existent `user.onboardingComplete` field. All 4 auth response locations (signup L54, login L184, createSessionForUser L255, refresh L318) updated. Build passes.  Deployed to VPS (committed in `c238607f`, auto-deployed via GitHub Actions).
-  **Dashboard Banner Bug Fix**  Resolved stale error state in `useCompanyId()` hook and fixed `OwnerDashboard.tsx` condition that incorrectly showed "No company linked" banner despite valid API responses
-  **Onboarding Transaction Timeout Fix**  Moved COA seeding outside the onboarding Prisma interactive transaction and replaced 40+ sequential `account.create()` calls with a single batched `createMany()` operation. Transaction duration reduced from 60+ seconds to under 2 seconds, resolving the production onboarding blocker.
-  **PDFKit Build Fix**  Added missing `@types/pdfkit` dev dependency to package.json, resolving VPS build error TS2307: Cannot find module 'pdfkit'.
-  **VPS Auto-Deploy Pipeline**  GitHub Actions  SSH  deploy.sh  PM2 restart. Fully operational. Every push to main auto-deploys to production.
-  **Logo Replacement**  All placeholder logos replaced with HB_Logo.png. Favicon and metadata configured.
-  **Repo Cleanup**  Removed stray root files, malformed filenames, and all "open source" references. HaypBooks is proprietary.
-  **Build Error Fixes**  Resolved TypeScript/Prisma build errors in owner.service.ts.
</details>

-  **Multi-Currency Support (Plan B)**  Full end-to-end multi-currency accounting: Currency/ExchangeRate models with 15 seeded currencies, ExchangeRateService with enforceCurrency() helper and live API rate fetching, currency enforcement in transaction services, shared formatCurrency() utility, company base currency selector, multi-currency financial reporting with display currency selector on P&L/Balance Sheet/Cash Flow/Trial Balance.
-  **Zypra AI Assistant (Plan F, Phase 1)**  Floating chat widget with Gemini-powered accounting Q&A, lazy initialization, quick actions, system prompt guardrails.
-  **Cinematic Intro Restoration**  Reverted intro animation from HB logo back to "Haypbooks" text via git history.
-  **Owner Module DI Fix**  Added CompaniesModule to OwnerModule imports, resolving 478-restart crash loop in production.

-  **Hub Selection Screen Redesign**  Fixed: Added `isHubSelection` check to `client-root.tsx` (L102, L119) to exclude `/workspace` from the OwnerTopBar + OwnerSidebar layout. The hub selection page now renders as a clean full-page experience. The existing WorkspacePage component already had all three panels (Companies list, Practice list, Owner Dashboard button). No git history revert needed.
-  **Fix JWT Payload**  Completed August 25, 2026: Added `systemRole` and `isOwner` to JWT payload at all 4 sign locations in `prisma-auth.service.ts`. Added `getIsOwner()` helper querying `Workspace.ownerUserId`. Updated `jwt.strategy.ts` validate() return. Added `systemRole` to User interface.
-  **Fix `mapRoleForFrontend` Inconsistency**  Completed August 24, 2026: Confirmed NOT a bug. Three orthogonal role layers exist: hub role (JWT `role`), RBAC role (cookie `role`), platform role (JWT `systemRole`). The `mapRoleForFrontend` function correctly maps workspace owners to `'admin'` RBAC permissions. Documented in `docs/architecture/ROLE_SYSTEM.md`.
-  **Deploy.sh Stale Cache Fix**  Completed August 26, 2026: Added `rm -rf .next` to deploy.sh before `npm run build` to prevent corrupted Next.js incremental builds from causing 400 errors on static assets.
-  **Onboarding Page Syntax Fix**  Completed August 26, 2026: Fixed malformed `saveCurrentStep()` function in `onboarding/page.tsx` that was causing build failures on the VPS.
---

---

### Phase 12 E2  Workspace-Scoped Tenant Isolation
- **Completion Date:** 2026-09-26
- **Status:** COMPLETE & VERIFIED
- **Commit Hash:** aee9a7c7
- **Deliverables & Verified Artifacts:**
  - Implemented WorkspaceAccessGuard at Haypbooks/Backend/src/auth/guards/workspace-access.guard.ts enforcing real-time Prisma WorkspaceUser active membership (status: 'ACTIVE', deletedAt: null).
  - Attached @UseGuards(JwtAuthGuard, WorkspaceAccessGuard) across all workspace-scoped routes in both PracticeHubController (src/practice-hub/practice-hub.controller.ts) and PracticeController (src/practice/practice.controller.ts).
  - Propagated asynchronous request context via setRequestContext({ workspaceId, userId }).
  - Added unit test suite workspace-access.guard.spec.ts.
  - Authored implementation README at Haypbooks/Backend/docs/implementations/workspace-access-guard/README.md.
  - Verified by HYDRA on-disk audit (Task 389).
