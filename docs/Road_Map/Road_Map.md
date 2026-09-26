# HaypBooks â€” End-to-End Completion Roadmap

Updated 2026-09-12. Canonical location: docs/Road_Map/Road_Map.md. This file consolidates both former roadmaps; there is no separate root roadmap. This update is based on inspected source, not a claim that the application passes a complete runtime audit. The attached audit is a checklist, not an existing findings report. Browser, live database, Stripe, VPS, performance and restore validation remain outstanding.

Single source of truth: docs\Road_Map\Road_Map.md. The former root-level Road_Map.md has been removed from the working tree (Hydra repo audit, 2026-09-12).

## Current audit findings

Paths below are repository-relative. Rediscover anchors before implementation.

| Evidence | Confirmed source behavior | Priority / phase |
|---|---|---|
| E2: `Haypbooks/Frontend/src/app/get-started/subscribe/page.tsx:60â€“67`; practice equivalent `get-started/practice/subscribe/page.tsx:40â€“46` | Company errors swallowed and timer sets success independently; practice uses simulated success. | P0 / 13 |
| E4: `Haypbooks/Backend/src/reporting/reporting.service.ts:514â€“546` | Balance sheet classifies asset/liability/equity without explicit current-year income/expense earnings presentation. | P0 reports / 4 |
| E5: `Haypbooks/Backend/src/inventory/inventory.repository.ts:237â€“278` | DRAFT transaction creation changes stock without a GL call inside that transaction. | P0 inventory / 5 |
| E6: `Haypbooks/Backend/src/banking/banking.service.ts:611â€“636`; `banking.repository.ts:237â€“255` | Auto-match selects by date, supplies no journal line, and repository permits matched=true with null journal reference. | P0 banking / 6 |
| E7: `Haypbooks/Backend/src/accounting/accounting.service.ts:1092â€“1110` | Revaluation is a journal-entry proxy; upper date filter overwrites lower filter; query failure becomes empty data. | P1 / 7 |
| E8: `Haypbooks/Frontend/next.config.js:14,19`; backend package scripts | Build skips lint/type errors; backend E2E script runs migrations and seed. | P0 validation / 9 |
| E9: `Haypbooks/Backend/src/companies/company.repository.prisma.ts:97,678`; frontend public signup line 150 | FREE/TRIAL bootstrap and 14-day copy conflict with four paid plans/30-day direction. | P0 billing / 13 |
| E10: `Haypbooks/Backend/src/practice-hub/practice-hub.service.ts:214` | Existing invitation acceptance checks identity/company access and transactionally creates engagement plus invite update. Stats/client/invite functionality exists. | Existing foundation / 11 |
| E12: `Haypbooks/Backend/src/ap/ap.repository.ts`; `src/shared/sub-ledger.service.ts` | Posting/reversal foundations and conditional audit writes exist. Uniform lifecycle enforcement remains unverified. | Audit / 14 |

## Audit review (attachment Aâ€“W)

**A â€” Executive summary:** Real product foundations exist, but security, payment truthfulness and accounting integrity block a readiness claim. No live compromise, customer loss or actual erroneous charge is established by this source audit.

**B â€” Repository:** Next.js/React frontend and NestJS/Prisma backend already contain accounting, auth, subscriptions and practice structures. Complete existing workflows rather than replace them.

**C â€” Major findings:** E1/E2 are immediate release gates. E3â€“E7 require targeted reproduction and correction. E8 invalidates build-only assurance. E9 contradicts owner direction.

**D â€” Accounting:** Balance validation/reversals exist. Verify precision, posting dates, periods, tax rounding, allocation, source links and ledger effects across all transaction producers.

**E â€” Auditor:** Require actor/company/source/reason and reversal traceability for financial mutations. Distinguish draft deletion from posted-history controls. Historical evidence records are not independent execution proof.

**F â€” Security:** Existing ValidationPipe/CORS/helmet in backend main.ts and access guards do not prove complete coverage. Audit company/practice ownership, roles, sessions, OTP/reset, uploads, exports and logs. Fix E1; deployed exposure is UNKNOWN.

**G â€” UX:** Browser parity with HB_clone remains UNKNOWN. Audit every shipped action, responsive/keyboard behavior and loading/error/retry/cancel/success states. E2 demonstrates false success risk.

**H â€” Financial analysis:** Reconcile balance sheet, profit/loss, trial balance, cash flow and aging on shared dated fixtures before adding dashboards. Broader report accuracy is UNKNOWN.

**I â€” Business:** Complete company and practice onboarding/billing separately. Four paid levels/30 days are direction; prices, capacities, tax and trial-card policy still need decisions.

**J â€” Backend:** Trace service/repository transaction boundaries, idempotency, errors and concurrent requests. Reuse existing ledger services; avoid speculative rewrites.

**K â€” Frontend:** Server-confirmed state must drive financial/subscription success. Audit API contracts, persistence after reload, validation and shared components. Build is not typecheck.

**L â€” Structure:** Keep reference repositories and ignored evidence distinct from product code. Change folder/package structure only for demonstrated maintenance or operational benefit.

**M â€” Testing:** Unit/integration/Playwright infrastructure exists; this update does not claim passing suites. Inspect setup before running migration/seed-bearing tests; use disposable databases and assert financial outcomes, not just response codes.

**N â€” Workflows:** Trace screen â†’ validation â†’ authorization â†’ service â†’ transaction â†’ persistence â†’ GL/report â†’ visible outcome. Include cancel, failure, duplicate, concurrent, edit/reversal and reload cases.

**O â€” ERPNext:** Inspected `docs/erpnext/erpnext/accounts/general_ledger.py:34â€“75` validates periods/disabled accounts and updates payment ledger, with separate cancellation handling. Essential concept: uniform posting invariants and linked reversals. HaypBooks has shared posting but equivalent coverage is not established. Adopt concepts within NestJS/Prisma; do not copy source/UI.

**P â€” QuickBooks:** Local `docs/Quickbooks_api/quickbooks.api.md:78â€“83` describes SyncToken rejection of stale updates. Evaluate equivalent optimistic concurrency for financial edits: transactions alone do not prevent lost updates. No literal SyncToken requirement and no full QuickBooks parity claim.

**Q â€” Missing:** Actual revaluation calculation is NOT FOUND in the inspected endpoint; inventory GL is NOT FOUND in the inspected create transaction. These are scoped findings, not repository-wide absence claims.

**R â€” Partial:** Public/auth, practice, subscription onboarding, GL, banking, inventory and reporting have real code; improve it rather than duplicate it.

**S â€” Maturity:** Public/auth and practice are PARTIALLY IMPLEMENTED; checkout/GL/banking/inventory/reports IMPLEMENTED BUT INCOMPLETE; FX endpoint PARTIALLY IMPLEMENTED. Security/tenancy only PARTIALLY VERIFIED. Payroll/assets/tax/AI and operations remain UNKNOWN pending dedicated audits. No module is certified MATURE or PRODUCTION-READY.

**T â€” Improvements:** Active phases specify required outputs and gates. P0/P1 apply to released scope; progression and AI expansion can remain optional.

**U â€” Order:** 12 + 9 first; then 2/14 â†’ 6/5 â†’ 4, with 7 if FX offered. Scope 13 immediately and finish before paid onboarding. Complete 1/15, 11, 16 â†’ 17 â†’ 10. Documentation 3 accompanies every phase; AI 8 follows core stability.

**V â€” Risks:** Unknown deployment config, historical evidence corruption, data drift, silent failures, concurrent mutations and inconsistent plans. Never seed an unknown database or delete history to resolve capacity/accounting issues.

**W â€” Recommendation:** Next bounded task is test-endpoint audit/containment with production-mode negative tests (12), supported by reproducible baseline (9). This roadmap update does not implement those fixes.

## Active completion plan

Status vocabulary: AUDIT REQUIRED, NOT STARTED, PARTIAL, IN PROGRESS, BLOCKED, DONE. P0 means release-blocking for affected scope, not proof of a live incident. VERIFIED means inspected source; UNKNOWN must not be silently promoted to passing behavior.

### 1 â€” Landing, intro and auth (PARTIAL, P1 - only L4-L6 remaining)

- Audit first: map every reference page/state in `docs/HB_new_(landingpage, intro, & login)/HB_clone` to production; compare desktop/mobile screenshots and interactions. Record intentional differences for real auth and approved pricing.
- Deliver: approved visual parity through shared LandingExperience/AuthShell plus per-page hub composition (server page composing Navbar + hub component + Footer); retain `/` and `/landing`, `hb-intro-seen`, real OTP/reset/login behavior. Never copy simulated success.
- Requirements: preserve zero-new-dependency, read-only/untracked reference, Next14/Tailwind3/motion-react and no-Prisma constraints; explicit staging/local-only commit when authorized. Reverify historical baseline 83cec1ed/analytics-fix claims.
- Depends on: 9 validation and 13 copy. Done: route/state matrix, responsive/keyboard/reduced-motion, auth success/error/retry, lint/typecheck and handoff verified. Historical build failure is not release acceptance.
- L4: verify the landing link matrix against the reference (top bar/nav targets, Learn & Support route, Accountant/Bookkeeper click targets).
- L5: compare landing scroll and runtime behavior against the reference (user visual checks; scroll animations preserved).
- L6 (LAST): remove the old accountant/bookkeeper pages and components once L1-L5 are verified.

### 3 â€” Section READMEs and evidence (PARTIAL, P1 continuous)

- Audit: distinguish source presence, observed execution and historical claims. Auth artifact has corrupted excerpts; any rebuild remains separately scoped. Never invent timestamps/transcripts.
- Deliver: update/create each implemented section's README in its existing documentation location; link frontend/backend, architecture, files, APIs, decisions, permissions, behavior, validation results and limits.
- Depends on: verified phase results. Done: each completed section has reproducible evidence and matching roadmap status. Only then mark DONE, preserve durable README and remove completed active-phase detail. Documentation-only within this phase.

### 4 â€” Reports and current-year earnings (NOT STARTED, P0 reports)

- Audit: posted-only balances, fiscal dates, retained earnings, closing journals, currency/sign/rounding and alternative earnings paths.
- Deliver: correct earnings without double-counting closed years; verify balance sheet/P&L/trial balance/cash flow/aging/drill-down/export. No report mutation of closed periods; query error distinct from empty result.
- Depends on: 2/14 and 5/6/7 effects. Done: accountant-reviewed opening/year-close/profit-loss/reversal/partial-payment/FX fixtures reconcile; assets equal liabilities plus equity; screen/export agree.

### 5 â€” Inventory lifecycle and GL (NOT STARTED, P0 inventory)

- Audit: receipt/shipment/return/adjustment/transfer, draft/post rules, valuation, accounts and negative stock.
- Deliver: atomic stock/valuation/financially applicable GL with linked reversals and no duplicate posting; reuse subledger. No invented cost or silent retrospective correction.
- Depends on: 2/14 and approved costing policy. Done: concurrency, insufficient stock, retry, rollback, returns/transfers pass; valuation reconciles to GL; company/item/location references validated.

### 6 â€” Banking (NOT STARTED, P0 banking)

- Audit: imports, deduplication, ownership, matching/unmatch and completion; distinguish clearing from ledger matching.
- Deliver: company/account/currency/amount/date-aware candidates; ambiguous results reviewed; no unsupported matched flag. Prevent duplicate reuse except explicit split/group rules.
- Depends on: 2/14. Done: duplicate imports, ambiguity, supported splits, unmatch and concurrent completion pass; statement differences explained and audit history retained.

### 7 â€” FX (AUDIT REQUIRED, P1; gate if offered)

- Audit: rates, monetary scope, existing engines and realized/unrealized policy; reproduce E7.
- Deliver: correct filters/errors, dated-rate preview, approval, gain/loss posting and policy-defined reversal; explicit precision/missing-rate behavior and idempotency.
- Depends on: 2/4/14 and accountant policy. Done: date bounds/rate changes/rounding/missing rate/closed period/retry/reversal pass. If deferred, do not advertise proxy results as functioning revaluation.

### 8 â€” AI Phase 2 (AUDIT REQUIRED, P3 optional)

- Audit: existing AI, tenant data exposure, provider cost, failures and owner/JP goals.
- Deliver: agreed assistance with source traceability, uncertainty and human review for financial writes; permissions/budgets/secrets enforced. Autonomous posting requires separate approved controls.
- Depends on: 12/14/17. Done: agreed evaluations, cross-tenant denial, incorrect answer, outage and cost-limit cases pass. Does not block non-AI release.

### 10 â€” VPS release (BLOCKED, P1 final gate)

- Audit: read-only local/remote revisions, server checkout, PM2, TLS/proxy, environment/migration state. Historical drift claims are not fresh facts.
- Deliver: reviewed revision â†’ owner push â†’ controlled pull/install/build/migration if approved â†’ restart/health check, with rollback. No blind overwrite of server changes.
- Requirements: backup/restore, secrets, logs, monitoring/resource limits. Reported 4vCPU/8GB/80GB is planning input, not measured capacity.
- Depends on: 9/12/13/16/17 and released accounting phases. Done: exact revision served, TLS/API/auth/jobs healthy, load/restore/rollback verified, no P0 unresolved.

### 11 â€” Practice Hub (PARTIAL, P1 core; P2 progression)

- Audit: owner/staff/client roles, invite expiry/races, engagements/tasks/reviews/switching/revocation. Reuse E10 foundation.
- Deliver: reliable client work and server-enforced capacities. Proposed XP needs approved qualifying activities, thresholds, event ledger and anti-abuse rules before implementation.
- Recommendation: guarantee paid base capacity; earn separate bonuses. Prefer grace/gradual bonus decay over resetting XP to zero. Preserve historical read/export access when over capacity; disclose restrictions on new additions. Paid boosts disclose quantity/duration/renewal/refunds and remain distinct from earned XP.
- Depends on: 12/13/16 and owner economics. Done: permissions/invite races/revocation/capacity pass; if progression ships, replay/earning/decay/grace/boost tests pass. Paid entitlements never silently shrink; core can ship without gamification.

### 12 â€” Security and tenant isolation (AUDIT REQUIRED, P0)

> **Status:** ACTIVE (Phase 12 E1 complete & verified; active focus: workspace-scoped tenant isolation boundary enforcement).

- Audit: test/admin routes, production conditions, auth/OTP/reset/session, company/practice object access, exports/uploads, logs/secrets/input validation.
- Deliver: implement `WorkspaceAccessGuard` to validate active `WorkspaceUser` membership server-side; bind it to workspace-scoped routes in `PracticeHubController` and `PracticeController`; preserve fail-closed cross-tenant denial for remaining company/practice access edge cases.
- Requirements: never reproduce credentials in evidence; inspect `docs/Stripes/Stripesdoc.md` hygiene without assuming key validity/exposure.
- Depends on: existing Phase 12 E1 enforcement and negative-test harness. Remaining scope excludes completed production test endpoint hardening.

### 13 â€” Paid plans, trials and Stripe (PARTIAL, P0 - scoped pricing fixed, legacy copy cleanup complete; remaining: Stripe webhooks, checkout sessions, plan capacity matrix)

- Audit: every public/company/practice price/copy/seed/model/capacity/checkout/webhook/portal path; planId and FREE compatibility. Consult local Stripe material critically and current official provider docs during implementation.
- Contract: four paid levels, no permanent free tier, 30-day trial. Approve whether company/practice use separate catalogs; prices/currency/monthly-annual terms/tax/card requirement/conversion/cancellation are unresolved decisions.
- Deliver: authoritative catalog shared by landing/checkout/settings/backend. Capacity matrix specifies company seats/storage/documents or transactions/AI/features and practice staff/active clients/engagements/storage, units/reset periods/add-ons/overage.
- Provider-confirmed state drives success; authenticated idempotent webhook handling covers trial/active/overdue/canceled/expired, delays/out-of-order events. No timer-based payment success.
- Requirements: explicit existing-customer migration, no silent charge/conversion/data deletion; trial distinct from free plan, bonuses distinct from paid base.
- Depends on: 9/12, owner economics, 11 bonuses. Done: sandbox trial expiry/payment failure/challenge/canceled checkout/duplicate events/upgrade/downgrade/proration/cancel/over-limit pass and all surfaces agree.

### 14 â€” Accounting lifecycle controls (AUDIT REQUIRED, P0)

- Audit: JE, AR invoice/payment/credit/refund, AP bill/payment/credit, expenses/transfers and offered payroll/assets. Trace callers before judging repository helpers in isolation.
- Deliver: explicit states, uniform company/account/period/balance/precision checks, atomic source+GL, idempotency, stale-edit protection, source/actor/reason audit history and linked reversals; reuse services.
- Depends on: 2/9/12. Done: applicable draft/submit/post/pay/partial/void/reverse cases for each producer; duplicate/concurrent/forced failures leave no partial writes; subledger/GL reconcile; no silent lost updates.

### 15 â€” Every shipped route/action (AUDIT REQUIRED, P1)

- Audit: inventory owner/staff/accountant/client routes and actions, real data sources and release/finish/defer disposition, including settings/reports/exports.
- Deliver: fix dead buttons, mock-live data, persistence, navigation/validation; reuse shared tables/forms/status patterns where beneficial. Keyboard/mobile and loading/error/success/retry/cancel required.
- Depends on: 1/11/13/14. Done: no unexplained shipped placeholders; reload restores server truth; realistic company/accountant/practice tasks and permission failures pass; visual differences documented.

### 16 â€” Data, performance and remaining modules (AUDIT REQUIRED, P1)

- Audit: schema/migrations/isolated DB, FKs/indexes/RLS, precision/timezone, retention/import/export/jobs; tax/payroll/assets and every advertised module not covered. Select jurisdictions with owner; do not invent compliance scope.
- Deliver: demonstrated defects repaired with reviewed reversible changes, bounded queries, retry-safe jobs, secure storage and recovery. Restructure only for demonstrated benefit.
- Requirements: read-only profiling before explicit data-repair plan; no blanket reseed/delete. Depends on: 9/12/14.
- Done: migration rehearsal, pre/post counts/balances, restore, realistic large-tenant load and job recovery pass; other advertised modules verified or excluded from release.

### 17 â€” Integrated acceptance (NOT STARTED, P1 mandatory)

- Deliver: deterministic full-workflow fixtures connecting UI/API/persistence/ledger/reports/billing/permissions; independently review results and route defects to owning phases.
- Requirements: realistic roles/data sizes, revision/environment/commands/expected-actual results and honest limitations. No inferred passes.
- Depends on: every phase required for release scope. Done: matrix below passes, no P0, residual risks scoped/accepted, READMEs/support/rollback ready; then release 10.

## End-to-end acceptance matrix

For each row: success, invalid input, permission denial, network/server failure, cancel, repeated/concurrent submission, reload and permitted edit/reversal. Verify persisted and displayed states agree; assert financial/audit effects where applicable.

| Journey | Outcome |
|---|---|
| Signup â†’ OTP â†’ company/practice â†’ trial â†’ login/reset | Correct identity/workspace; no duplicate ownership/subscription |
| Trial â†’ paid â†’ change plan â†’ overdue/cancel | Provider/UI/entitlements/history agree; no permanent free tier |
| Customer â†’ invoice â†’ post â†’ partial/full payment â†’ credit/refund | Source/allocation/AR/cash/revenue/tax/reports reconcile |
| Vendor â†’ bill â†’ post â†’ payment â†’ credit/void | AP/expense or asset/cash/tax/reversal reconcile |
| JE â†’ approve/post â†’ reverse â†’ close | Balanced, numbered, traceable and period-protected |
| Inventory receipt/shipment/return/adjustment | Quantity/valuation/applicable GL agree |
| Bank import â†’ match â†’ reconcile â†’ correct | No duplicate import/false match; differences explained |
| FX preview â†’ approve/post â†’ reverse | Correct rate/date/currency/gain-loss/idempotency |
| Practice invite â†’ staff/client work â†’ revoke | Correct tenant access throughout |
| Report â†’ filter â†’ drill-down â†’ export | Same posted dataset and totals |
| Tax/payroll/assets/other released modules | Approved business rules and downstream effects |
| Backup â†’ restore â†’ deploy â†’ health â†’ rollback | Recoverable data and exact monitored revision |

## Appendix: Completed Tasks


### Phase 9 — Lint & Type Baseline Enforcement (DONE, 2026-09-26)
- **Status:** COMPLETED & VERIFIED (Commit `e6dad610`).
- **Scope:** Enforced strict build gates in `next.config.js` (`ignoreDuringBuilds: false`). Resolved 24 `react/no-unescaped-entities` errors in `error-queue/page.tsx`, fixed unescaped apostrophes across 15+ frontend files, and corrected hook-order violation in `ChartOfAccountsPage.tsx`.
- **Quality Gates:** `npm run lint -- --quiet` exit code 0; `npm run typecheck` exit code 0; Backend `tsc --noEmit` exit code 0.
- **Documentation:** `Haypbooks/Frontend/docs/implementations/lint-baseline-enforcement/README.md`.

- ✅ **Finding E3: Backend Accounting Engine Journal Entry Numbering Gap (COMPLETED, P0)**
  - *Location:* `Haypbooks/Backend/src/shared/gl-integration.ts`
  - *Fix:* Added `entryNumber: data.entryNumber` persistence to `tx.journalEntry.create()` payload.
  - *Documentation:* Section README created and marked DONE at `Haypbooks/Backend/docs/implementations/journal-entry-numbering/README.md`.
  - *Verification:* Verified callers pass `entryNumber`; backend and frontend TypeScript verification gates passed.
- ✅ **Landing Page scroll freeze resolution (Task 266):** Resolved scroll locking and phase activation boundaries in LandingExperience.tsx, BossFight.tsx, and Classes.tsx.
- ✅ **L1 AccountantsHub subtask (Completed 2026-09-13):** Route and component verified active and functional.
- ✅ **L2 LearnSupport subtask (Completed 2026-09-14):** Route and component verified active and functional.
- ✅ **Phase 9 Quality Baseline Finalized (Task 318):** 26 react/no-unescaped-entities fixed, strict build gates documented.
- ✅ **Phase 9 Client requests hook memoization (Task 333):** useCallback memoization implemented in client-requests/page.tsx, section README verified.
- ✅ **Intro sequence background & pricing alignment (Task 342):** SlideTwo background set to bg-white, root occlusion enforced with fixed inset-0 z-[100] bg-white, all scoped pricing tiers aligned to 15-day trials with zero free-forever tiers. Section README verified at `Haypbooks/Frontend/docs/implementations/landing-fixes/README.md`.

### Phase 12 E1 — Test Endpoint Security Guard & Hardening (DONE, 2026-09-26)
- **Status:** COMPLETED & VERIFIED (Commit `4a1a3625`).
- **Scope:** Conditional `TestModule` mounting in `src/app.module.ts`; `@UseGuards(TestEndpointGuard)` applied to `TestController`; fail-closed production containment (throws `403 Forbidden` without matching `X-Test-Token` or Bearer token); full 8-test Jest unit test suite in `src/test/test.guard.spec.ts`.
- **Quality Gates:** Jest unit tests 8/8 passed; Backend `tsc --noEmit` exit code 0; Frontend `npm run lint` and `typecheck` exit code 0.
- **Documentation:** `Haypbooks/Backend/src/test/README.md`.

## Definition of finished

Declared release scope has verified functionality, accounting integrity, permissions, usable failures, concurrency safety, tests, READMEs and operational recovery. Optional features may remain deferred. Unsupported features must not be advertised as working. Do not claim 100% functional or production-ready without scope-specific evidence.

## Consolidation decisions and original-plan crosswalk

Reviewed both complete roadmaps on 2026-09-12. The former root active phases 1â€“17 are retained above. Unique work from the August 29 documentation roadmap is integrated below; these supplements are part of the same active plan. Historical completion claims are preserved separately and are not fresh verification.

The governing [Product Maturity Standard](../standards/PRODUCT_MATURITY_STANDARD.md) remains authoritative for formal maturity audits: S1 accounting, S2 security, S3 persistence, S4 concurrency, S5 UX/API, S6 operations; formal tiers T1â€“T5 require evidence. The descriptive labels and attachment-shaped Aâ€“W summary above are planning assessments, not formal tier awards or a substitute for the standard's audit report. Defect priorities must be assessed under that standard; phase labels indicate scheduling urgency. Reference-inspired product expansion requires its prescribed proposal and owner approval.

| Previous plan/backlog | Active destination |
|---|---|
| Plan A self-hosted database | 16A below; optional infrastructure decision, not assumed necessary |
| Plan B multicurrency completion claim | 4/7/14 regression verification; does not establish revaluation completion |
| Plan C-3 budgeting | 16B below |
| Plan D approvals | 14A below |
| Plan E fixed assets | 16C below |
| Plan F-1/F-2 AI | 8 plus supplement below |
| Plan G / S1â€“S6 | 2/4/5/6/7/14 (S1), 12 (S2), 16 (S3), 9/14/16 (S4), 1/15 (S5), 3/9/10/17 (S6) |
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
- Old 4 GB server and fixed 512â€“1024 MB heap advice is not a current sizing decision. Measure the actual server and workloads; owner reported 8 GB. Preserve 24â€“48-hour memory monitoring as a validation task.
- Automatic deployment was historically claimed operational. Audit workflow triggers before any push; owner-only push still applies and may initiate a live deployment.
- Existing models must be reused: current Prisma schema includes FixedAsset, Approval, ApprovalWorkflow and ApprovalRequest. Do not execute old instructions to create duplicate models. Practice XP fields exist; field presence alone does not prove a working progression system.
- Current owner controller uses SystemRoleGuard/SUPER_ADMIN declarations. Do not replace existing owner APIs based on older blank-feature claims. Trace endpoint and frontend coverage first.
- The older '22 stubs' count and test counts are historical inventory claims, not verified current totals. Re-enumerate actual implementations before classifying missing work.

### 14A â€” Approval workflow completion (legacy Plan D; AUDIT REQUIRED)

- Scope: configurable action/amount/role approval matrix, JE thresholds, reconciliation sign-off, pending dashboard and single/sequential approval as actually required. Inspect existing approval models, services and states first.
- Output: server-enforced transitions including pending/approved/rejected/canceled, reasons and actor/source audit linkage; no self-approval or bypass where policy forbids it. Approved content cannot change unnoticed afterward.
- Dependencies: 12 identity/permissions, 14 posting lifecycle, owner/accountant policy. Acceptance: threshold boundaries, rejected/canceled/replayed requests, changed documents, concurrent approvers and unauthorized approval tests; accepted records post once. Reuse existing models and README.

### 15A â€” Platform administration and three-role navigation (legacy H-3; PARTIAL / AUDIT REQUIRED)

- 15A â€” PARTIAL: server-side RBAC is implemented and verified for the owner controller; broader authorization coverage is pending further audit.
- Distinguish SUPER_ADMIN platform administration, company administration and practice administration. Build an authorized dashboard switcher; hiding navigation is not authorization. Platform administration itself is not a paid customer plan; any bypass must be server-side, auditable and limited to platform operations. Company/practice tenant access still needs explicit policy.
- Verify workspace creation choices, no-company layout, useCompanyId behavior, stale demo identities, and platform links shown to ordinary workspace owners. Company/practice crossover follows owner-approved membership/plan policy, not a blanket role-name assumption.
- Dependencies: 12/13/15. Acceptance: full role/route/API matrix, denied direct URLs/requests, persistent status changes, pagination/filtering, consistent metrics and audit entries. No blanket cascade user/file deletion.

### 16A â€” Database hosting decision (legacy Plan A; AUDIT REQUIRED, optional)

- Compare current hosted database with VPS/dedicated hosting for cost, capacity, availability, maintenance and recovery. Do not migrate just because a prior plan proposed it.
- If selected: document PostgreSQL/pooling/resource configuration, network restrictions, backup/WAL retention and restore process, migration compatibility and explicit cutover/rollback procedure. A pg_dump plus DNS change does not guarantee zero downtime; define allowable downtime or a proven replication strategy.
- Dependencies: 9/16/17 data-layer evidence and owner infrastructure decision. Acceptance: rehearsal on isolated data, reconciled counts/balances, restore and rollback, measured downtime, verified connection/security settings. Production migration requires its own bounded authorization.

### 16B â€” Budget enhancements (legacy C-3; AUDIT REQUIRED, P2)

- Reverify existing budgets and claimed CSV/PDF exports before adding them. Preserve industry templates, configurable variance alerts, original/revised/forecast comparisons, cash-flow forecast integration and budget-line ownership/comments as planned scope.
- Output: templates mapped to company COA without invented financial facts; company-scoped thresholds and deduplicated notifications; versioned forecast comparisons; transparent forecasting assumptions; permission-controlled collaboration.
- Dependencies: 4 accurate actuals, 12 permissions, core budgeting verification. Acceptance: actual/budget reconciliation, threshold boundaries, repeated jobs, template mismatch, scenario history, collaboration authorization and export parity tests. Choose approved subsets rather than treating all enhancements as launch blockers.

### 16C â€” Fixed assets (legacy Plan E; AUDIT REQUIRED)

- Audit existing asset/category/schedule/depreciation models and GL integration. Complete register/filter/summary, acquisition, straight-line/declining-balance methods where supported, scheduled depreciation, disposal proceeds/gain-loss and approved revaluation/impairment scope.
- Requirements: accountant-approved useful life/salvage/rounding/proration and revaluation policy; no duplicate asset schema or postings. Dependencies: 2/4/14 core accounting verification.
- Acceptance: schedule totals, partial periods, disposal, retry, reversal, closed periods and asset-to-GL reconciliation; unsupported methods clearly excluded from released scope.

### 16D â€” Explicit remaining-module inventory and retention

- Recheck each old stub claim: inventory CRUD/adjustments/valuation/warehouses/movements/reports (5); employees/payroll/tax/payslips/contributions (14/16); projects/time/billing/profitability/milestones/reports (16); asset insurance, period-close sign-offs, advanced reports and import/export (14/16).
- Output: one item per real capability with route, controller, service, repository/model, current behavior, tests, owning phase and release/defer decision. The old payroll list repeats payslip generation; do not count it twice.
- Audit role-interface versus preferredHub/systemRole/RBAC mappings, WorkspaceType PRACTICE assignment and practiceId in audit records. Renaming values needs migration/compatibility proof, not cosmetic cleanup.
- Account deletion: define requester authority, shared versus personal ownership, retention holds, export/grace/recovery and idempotent cleanup before implementation. Do not cascade-delete company evidence because one user leaves. Subscription expiry is not deletion consent.
- Done when every advertised capability has verified implementation or explicit exclusion; schema/data/retention changes have isolated migration and negative-permission tests.

### Existing-phase supplements retained from the older roadmap

- Phase 8: specifically scope persistent company/user-bound chat history, document Q&A, anomaly insights and context-aware responses; any quick-action execution requires review and existing financial controls. These are inherited goals, not evidence they already work.
- Phase 9: capture a full backend unit-suite run, not a log that stops before suites start; re-evaluate historical empty JSON output and claimed seed-race/sidebar timing flakes. Record current inventory/coverage and risk-based CI thresholds; do not reuse the old approximate 87-test count.
- Phase 10/16: verify metrics accumulation and currency cache behavior, observe memory for 24â€“48 hours, inspect connection pooling and deployment cache handling. Reconfirm registrar/DNS ownership before documenting Porkbun/Cloudflare as current operational facts.
- Phase 12/15: unify API authentication/error handling using existing apiClient or a justified shared wrapper after inventory; avoid indiscriminate fetch replacement. Test login/logout/refresh through the actual production routing arrangement.
- Phase 14: carry forward invoice/payment/deposit atomicity, credit-note/document-number concurrency and banking account-to-GL mapping audits; older allegations remain audit inputs until current paths are traced.
- Phase 3: retain module-root README policy and link the canonical roadmap from future documentation. Read historical completion claims before rebuilding any functionality, but require current evidence before re-certifying it.

---

## Appendix: Completed Resolutions & Historical Verifications

## Historical completion index from the documentation roadmap

The following entries were labeled complete in the August 29 document. They are retained as historical context only, not new verification of source, deployed configuration or tests. Regressions belong in the owning active phase. Checked boxes or deployment claims here do not override current release gates.

### Historical claims (not re-certified)
<details>
<summary>Archived completed projects (older)</summary>

- Ã¢Å“â€¦ **Memory Leak Fix** Ã¢â‚¬â€ Resolved unbounded metrics accumulation in `Backend/src/common/metrics.ts` with hourly `counts.clear()` + PM2 `max_memory_restart 1G` mitigation
- Ã¢Å“â€¦ **Slow Currency Endpoint Fix** Ã¢â‚¬â€ Fixed `GET /api/currency/currencies` latency with 1-hour TTL in-memory cache in `exchange-rate.service.ts:82-88`
- Ã¢Å“â€¦ **Fix 401 on Dashboard (Auth Cookie Routing)** Ã¢â‚¬â€ Changed `NEXT_PUBLIC_API_URL` from `https://api.haypbooks.com` to empty string in `.env.production` on VPS so axios requests stay same-origin through nginx proxy.
- Ã¢Å“â€¦ **Fix 403 on Dashboard (RolesGuard)** Ã¢â‚¬â€ Updated `Backend/src/auth/guards/roles.guard.ts` line 33 to treat `role='business'` as equivalent to `'owner'` (case-insensitive + businessÃ¢â€ â€™owner mapping). Committed to git and deployed to VPS.
- Ã¢Å“â€¦ **Fix Undeposited Funds Account Code Mismatch** Ã¢â‚¬â€ Replaced hardcoded `'1050'` in `Backend/src/shared/sub-ledger.service.ts` with `SYSTEM_ACCOUNTS.UNDEPOSITED_FUNDS.code` for `postBankDepositToGL`. This fixes bank deposit GL posting by using the current COA code `'1170'` instead of the legacy, missing `'1050'` account.
- Ã¢Å“â€¦ **Fail-fast unbalanced JE postings** Ã¢â‚¬â€ Changed `Backend/src/shared/sub-ledger.service.ts` so `createPostedJE()` throws `BadRequestException` when total debits and credits differ by more than 0.005 instead of quietly returning null and skipping the journal entry. Ã¢â‚¬â€ The P1 workstream item on silent unbalanced postings is closed by this fix; removed from the active P1 list (roadmap reconciliation, August 2026).
- Ã¢Å“â€¦ **Fix Void/Reversal JE Dating** Ã¢â‚¬â€ All void/reversal methods (createReversingJE + 8 callers, reverseInvoiceGL, reversePaymentReceivedGL, reverseCreditNoteGL, reverseWriteOffGL, reverseRefundGL, reverseRevenueRecognitionGL, voidJournalEntry) now use the original entry's date instead of `new Date()`, preventing accounting period corruption. Voids in closed periods now correctly fail.
- Ã¢Å“â€¦ **Fix voidDeposit Missing GL Reversal** Ã¢â‚¬â€ Added `createReversingJE` call to `voidDeposit` in `banking.repository.ts`, creating a proper GL reversal JE when a bank deposit is voided. Previously the original deposit JE remained posted, permanently overstating cash and understating undeposited funds.
- Ã¢Å“â€¦ **Fix DB Connection Limit** Ã¢â‚¬â€ Added `&connection_limit=10` to DATABASE_URL in `Backend/.env` on VPS.
- Ã¢Å“â€¦ **Fix CORS on api.haypbooks.com** Ã¢â‚¬â€ Added port 80 proxy block in nginx for `api.haypbooks.com`.
- Ã¢Å“â€¦ **Onboarding Re-Trigger Fix** Ã¢â‚¬â€ Fixed: added `getOnboardingStatus()` helper in `prisma-auth.service.ts` (L100-111) that queries `OnboardingData.complete` instead of non-existent `user.onboardingComplete` field. All 4 auth response locations (signup L54, login L184, createSessionForUser L255, refresh L318) updated. Build passes. Ã¢Å“â€¦ Deployed to VPS (committed in `c238607f`, auto-deployed via GitHub Actions).
- Ã¢Å“â€¦ **Dashboard Banner Bug Fix** Ã¢â‚¬â€ Resolved stale error state in `useCompanyId()` hook and fixed `OwnerDashboard.tsx` condition that incorrectly showed "No company linked" banner despite valid API responses
- Ã¢Å“â€¦ **Onboarding Transaction Timeout Fix** Ã¢â‚¬â€ Moved COA seeding outside the onboarding Prisma interactive transaction and replaced 40+ sequential `account.create()` calls with a single batched `createMany()` operation. Transaction duration reduced from 60+ seconds to under 2 seconds, resolving the production onboarding blocker.
- Ã¢Å“â€¦ **PDFKit Build Fix** Ã¢â‚¬â€ Added missing `@types/pdfkit` dev dependency to package.json, resolving VPS build error TS2307: Cannot find module 'pdfkit'.
- Ã¢Å“â€¦ **VPS Auto-Deploy Pipeline** Ã¢â‚¬â€ GitHub Actions Ã¢â€ â€™ SSH Ã¢â€ â€™ deploy.sh Ã¢â€ â€™ PM2 restart. Fully operational. Every push to main auto-deploys to production.
- Ã¢Å“â€¦ **Logo Replacement** Ã¢â‚¬â€ All placeholder logos replaced with HB_Logo.png. Favicon and metadata configured.
- Ã¢Å“â€¦ **Repo Cleanup** Ã¢â‚¬â€ Removed stray root files, malformed filenames, and all "open source" references. HaypBooks is proprietary.
- Ã¢Å“â€¦ **Build Error Fixes** Ã¢â‚¬â€ Resolved TypeScript/Prisma build errors in owner.service.ts.
</details>

- Ã¢Å“â€¦ **Multi-Currency Support (Plan B)** Ã¢â‚¬â€ Full end-to-end multi-currency accounting: Currency/ExchangeRate models with 15 seeded currencies, ExchangeRateService with enforceCurrency() helper and live API rate fetching, currency enforcement in transaction services, shared formatCurrency() utility, company base currency selector, multi-currency financial reporting with display currency selector on P&L/Balance Sheet/Cash Flow/Trial Balance.
- Ã¢Å“â€¦ **Zypra AI Assistant (Plan F, Phase 1)** Ã¢â‚¬â€ Floating chat widget with Gemini-powered accounting Q&A, lazy initialization, quick actions, system prompt guardrails.
- Ã¢Å“â€¦ **Cinematic Intro Restoration** Ã¢â‚¬â€ Reverted intro animation from HB logo back to "Haypbooks" text via git history.
- Ã¢Å“â€¦ **Owner Module DI Fix** Ã¢â‚¬â€ Added CompaniesModule to OwnerModule imports, resolving 478-restart crash loop in production.

- Ã¢Å“â€¦ **Hub Selection Screen Redesign** Ã¢â‚¬â€ Fixed: Added `isHubSelection` check to `client-root.tsx` (L102, L119) to exclude `/workspace` from the OwnerTopBar + OwnerSidebar layout. The hub selection page now renders as a clean full-page experience. The existing WorkspacePage component already had all three panels (Companies list, Practice list, Owner Dashboard button). No git history revert needed.
- Ã¢Å“â€¦ **Fix JWT Payload** Ã¢â‚¬â€ Completed August 25, 2026: Added `systemRole` and `isOwner` to JWT payload at all 4 sign locations in `prisma-auth.service.ts`. Added `getIsOwner()` helper querying `Workspace.ownerUserId`. Updated `jwt.strategy.ts` validate() return. Added `systemRole` to User interface.
- Ã¢Å“â€¦ **Fix `mapRoleForFrontend` Inconsistency** Ã¢â‚¬â€ Completed August 24, 2026: Confirmed NOT a bug. Three orthogonal role layers exist: hub role (JWT `role`), RBAC role (cookie `role`), platform role (JWT `systemRole`). The `mapRoleForFrontend` function correctly maps workspace owners to `'admin'` RBAC permissions. Documented in `docs/architecture/ROLE_SYSTEM.md`.
- Ã¢Å“â€¦ **Deploy.sh Stale Cache Fix** Ã¢â‚¬â€ Completed August 26, 2026: Added `rm -rf .next` to deploy.sh before `npm run build` to prevent corrupted Next.js incremental builds from causing 400 errors on static assets.
- Ã¢Å“â€¦ **Onboarding Page Syntax Fix** Ã¢â‚¬â€ Completed August 26, 2026: Fixed malformed `saveCurrentStep()` function in `onboarding/page.tsx` that was causing build failures on the VPS.
- Ã¢Å“â€¦ **Phase H-0 Three-Role Foundation (SUPER_ADMIN Provisioning)** Ã¢â‚¬â€ Completed August 27, 2026: All code changes previously verified (systemRole + isOwner in JWT at all sign locations in prisma-auth.service.ts, jwt.strategy validate(), RolesGuard SUPER_ADMIN check). VPS tasks executed: ADMIN_EMAIL and ADMIN_DEFAULT_PASSWORD added to Backend .env, seed-admin run via `npm run db:seed:admin` (required transient NODE_OPTIONS=--max-old-space-size=8192 after OOM), SUPER_ADMIN login verified Ã¢â‚¬â€ decoded JWT contains systemRole: 'SUPER_ADMIN' and isOwner: true. All three H-0 boxes now closed.
H-0 addendum: The duplicate H-0 completion entry dated 2026-09-12 (which cited stale anchors prisma-auth.service.ts:45-62 and jwt.strategy.ts:31-47) was identified by the Hydra repository audit and removed as erroneous. The retained H-0 entry above remains the authoritative record.

---

---
