# HaypBooks — Project Road Map

> Single source of truth for phase status.
> Protocol: Cypra plans, Mantra executes, Hydra audits the actual repository.
> A phase may only be marked COMPLETED when Hydra's repository audit verifies its
> completion criteria — never by assumption or documentation alone.
> Legend: NEEDS SCOPING · NOT STARTED · IN PROGRESS · COMPLETED

## Active Phases

### Phase 1 — Landing, Intro & Login Design Port (Workstream 025-A)
- Status: **COMPLETED** (Hydra Stage-4 audit verified; JP visual smoke pending; jest e2e deferred — requires a live database environment)
- Description: Ported the new landing, intro, and login design from the read-only reference project (docs\HB_new* -> HB_clone) into the production frontend (Haypbooks\Frontend) with a port-don't-upgrade strategy: Tailwind v4->v3 adaptation, framer-motion imports adapted to the installed `motion` package (motion/react), Next 16->14-compatible code.
- Expected output: New landing served at both `/` and `/landing` from one shared orchestrator (LandingExperience); once-per-browser-session intro sequence (sessionStorage `hb-intro-seen`); new login skin (AuthShell + design fields) with the existing auth logic fully preserved.
- Requirements: Zero new npm dependencies; design folder read-only and untracked; explicit-path staging; local-only commits; never push; no prisma commands.
- Dependencies: `motion` 12.34.3 (pre-installed); Tailwind v3 configuration; existing `(public)` route group.
- Completion criteria: typecheck green; lint clean for changed files; build failure proven pre-existing (identical at baseline 83cec1ed); diff limited to the approved allowlist (plus one isolated analytics.ts type fix committed separately); design port committed locally; handoff notes delivered.
- Evidence: Hydra Stage-4 audit (025A); commits 7f45d9f (analytics fix), 8cbd442 (design port), <COMMIT-C> (this roadmap + section README). Restoration follow-up: a regression removed the shared LandingExperience orchestrator and reverted Hero/Footer to the old production shell; the fix restored those files and re-verified the frontend with `npm run typecheck` (green).

### Phase 2 — Journal Entry entryNumber Correctness Fix
- Status: NOT STARTED
- Description: Fix the entry-numbering defect in the `createAndPostJE` flow so journal entry numbers are generated correctly. Detailed defect mechanics to be pinned by a Hydra audit of the actual code before implementation.
- Expected output: Correct, unique entryNumbers for newly created/posted journal entries; existing data integrity preserved.
- Requirements: No schema changes unless Hydra's audit proves them necessary; no destructive prisma commands; targeted tests green.
- Dependencies: Backend NestJS journal-entry services.
- Completion criteria: Hydra audit of the fix; affected tests green; sample JE posting verification.

### Phase 3 — Documentation Batch (README Debt)
- Status: NOT STARTED
- Description: Clear the queued documentation debt across existing features; every implemented section gets a README with implementation details, architecture, decisions, and DONE marking.
- Expected output: Section READMEs for implemented features, statuses aligned with this roadmap.
- Requirements: Documentation only — no code changes.
- Dependencies: Hydra verification of what is actually implemented per section.
- Completion criteria: Hydra confirms the READMEs match the real implementation.

### Phase 4 — Balance Sheet: Current Year Earnings
- Status: NOT STARTED
- Description: Implement/fix the Current Year Earnings presentation on the Balance Sheet report. Scope to be pinned by a Hydra audit of the report builder.
- Expected output: Balance Sheet shows a Current Year Earnings figure consistent with current-year income/expense balances.
- Requirements: Accounting correctness; no data mutation in existing periods.
- Dependencies: Report/GL services.
- Completion criteria: Hydra audit; report output verified against GL balances.

### Phase 5 — Inventory GL Posting (postInventoryTransactionToGL)
- Status: NOT STARTED
- Description: Complete/fix `postInventoryTransactionToGL` so inventory transactions post correct GL entries. Scope to be pinned by Hydra audit.
- Expected output: Inventory transactions produce balanced, correct GL journal entries.
- Requirements: Balanced-entry discipline; no orphan JEs.
- Dependencies: Inventory services; SubLedgerService GL posting.
- Completion criteria: Hydra audit; unit/e2e tests for the posting path.

### Phase 6 — Banking Integrity
- Status: NOT STARTED
- Description: Audit-and-fix workstream for banking transaction integrity. Scope to be pinned by Hydra audit.
- Expected output: Banking flows verified consistent; defects fixed with tests.
- Requirements / Dependencies / Completion criteria: to be defined at scoping.

### Phase 7 — FX Revaluation
- Status: NOT STARTED
- Description: Foreign-exchange revaluation correctness. Scope to be pinned by Hydra audit.
- Expected output: FX revaluation entries correct and testable.
- Requirements / Dependencies / Completion criteria: to be defined at scoping.

### Phase 8 — AI Phase 2
- Status: NOT STARTED
- Description: Second phase of the AI feature track. Scope to be defined with JP + a Hydra audit of Phase 1 state.
- Expected output / Requirements / Dependencies / Completion criteria: to be defined at scoping.

### Phase 9 — Pre-existing Build Failure (prerender, error/404 route)
- Status: **COMPLETED** — verified 2026-09-03 by independent witnessed reproduction of npm run build (exit 0, 347/347 pages) at f256845d
- Description: Root-cause and fix the prerender failure in the error/404 route so `npm run build` passes.
- Expected output: Clean `npm run build` at HEAD.
- Requirements: Fix must not alter runtime behavior of real routes.
- Dependencies: Frontend error-page implementation.
- Completion criteria: `npm run build` green, verified by Hydra.
- Evidence: Build green restored by removing the stray 'use client' from src/app/(public)/layout.tsx (dynamic = 'force-dynamic' retained; see (public)/README.md attribution). Root cause not definitively isolated — candidate contributors: stale .next artifacts, NODE_ENV dev/prod mixing, Next 14.2.32 export machinery — corrections applied together; re-verified green 2026-09-03 via witnessed reproduction: exit 0, 347/347 pages, BUILD_ID 4drlmY5Pd3Rq-IJWCBRKfQ, ~115 s

### Phase 10 — VPS / PM2 Sync (Deployment Gate)
- Status: NOT STARTED — blocked by Phase 9.
- Description: Bring the VPS (PM2) up to date with GitHub. Two known gaps: the local repo has unpushed commits (origin/main itself is behind), and the VPS may not have pulled. Sequence: read-only VPS audit (git rev-parse/status, pm2 list) -> owner pushes (owner-only; no agent ever pushes) -> VPS pull -> install -> build -> pm2 restart -> verify.
- Expected output: VPS running current code, PM2 healthy, site verified.
- Requirements: Owner-only push; read-only audit first; build must pass (Phase 9).
- Dependencies: Phase 9; owner's push decision.
- Completion criteria: VPS serves the current build; PM2 status verified.

### Phase 11 — Practice System
- Status: NEEDS SCOPING
- Description: A companion "practice system" to HaypBooks, raised by the owner during the 025-A workstream. No banked scope yet.
- Expected output / Requirements / Dependencies / Completion criteria: to be defined at scoping (after the design and correctness tracks).

## Archived Phases
(none yet — a completed phase moves here once later phases supersede it and it is no longer useful for active tracking)
