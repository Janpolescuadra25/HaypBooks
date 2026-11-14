# HaypBooks End-to-End Completion Roadmap

- Current Checkpoint Date: 2026-11-14
**Provenance Pin:** Verified against local repository commit `740f1682b785eb46af4778fb89aceaa492eb41ed` (`HEAD^{tree}` `d60d82d590d25c400a8e3954ed1e3ceb67cbae30`) on branch `checkpoint/dev` (`origin/checkpoint/dev`).
- Authority: `HB-MASTER-2026-11-14-UI8` (`Haypbooks_plan.md`) & `Hydra 2026-11-14 Task 1060 Raw-Line Proof Audit`

## 0. Critical Path Execution Order
- **Status:** `UI8` Remediation Sequence (`U0–U10`) is ACTIVE. Historical phase archival below retains its original commit/mock scope and does **NOT** close `HB-MASTER-2026-11-14-UI8` source-level findings (`FIN-01–08`, `SEC-01–19`, `BILL-01–05`, `UX-01–12`, `OPS-01–10`, `ST01–08`) or `AC01–AC116`.
- **Active Next Step (`U0 Baseline`):** Repair test/gate safety (`OPS-07` in `Haypbooks/scripts/release-gate.ps1:58,61`, `TEST-01–07` acceptance/unit discovery & real-role E2E proof, `GOV-01` baseline pin) before opening parallel `U1` (Financial Safety), `U2` (Access & Secrets), and `U4` (Shared UX & Public Site) packets.
- **Task 1060 Verified-OPEN Source Blockers (Confirmed at `740f1682`):**
  - `OPS-07` (`U0/U8`): `Haypbooks/scripts/release-gate.ps1:58,61` permits `--passWithNoTests` and runs unguarded `prisma/seed.ts`.
  - `SEC-01` (`U2`): `Haypbooks/Backend/src/auth/guards/workspace-access.guard.ts:75-80` practice fallback omits active membership status/deleted checks.
  - `SEC-06` (`U2`): `Haypbooks/Frontend/middleware.ts:8,28` matches `'/'` with `startsWith`, bypassing route middleware checks.
  - `BILL-05` (`U3`): `Haypbooks/Frontend/src/app/api/subscriptions/create/route.ts:33-86` returns synthetic HTTP 201 `ACTIVE` when backend is absent, returns 404, or errors.
  - `ST02/ST03/ST06` (`U7` / Appendix 26): `Haypbooks/Backend/src/owner/owner.service.ts:22-23,61-62,95` hardcodes `dbStorageMb = 0` and adds a default `51200` buffer (`safetyNetMb`).
- **Execution Batches (`UI8` §U):**
  - `U0` Baseline (`OPS-07`, `TEST-01–07`, `GOV-01`) — **NEXT ACTIVE STEP**
  - `U1` Financial safety (`FIN-01–08`, `AP-02–04`, `REP-01–05`, `BANK-04/05`)
  - `U2` Access & secrets (`SEC-01–19`, `PRA-06`, `BANK-06`, `AST-02`, `NAV-03`)
  - `U3` Trial & billing (`BILL-01–05`, canonical 15-day / no-free catalog, USD/PHP)
  - `U4` Shared UX & public site (`UX-01/03–07/09–12`, `UI-01–04`, `ACT-01–12`, `LAND-01–08`, `NAV-01/02/04/05`)
  - `U5` Company & Practice (`UX-02`, `PRA-01–05`, `HOME-01`, `SET-01–03`)
  - `U6` Operational modules (`AP-01`, `AR-01`, `AST-01/03`, `BANK-01–03`)
  - `U7` Remaining capabilities & Appendix 26 (`API-01`, `DATA-01–02`, `REP-06`, `PLAT-01`, `UX-08`, 30-day nonpayment lifecycle, `ST01–08`, Gold Master Console `/platform-admin`)
  - `U8` DB/production rehearsal (`OPS-01–10`, `SEC-12`, Phase 18 Live Staging Drill on VPS `77.42.85.129` — gated by `U1/U2`)
  - `U9–U10` Whole-product acceptance (`AC01–AC116`) & controlled release

## Appendix: Completed & Archived Historical Milestones
*(Note: Each entry below preserves its original commit/scope record only; open `UI8` source defects remain tracked in Section 0 above until closed by independent Hydra runtime verification.)*

### Task 1058: Git History Sanitization & Remote Push Reconciliation (DONE — VERIFIED)
- **Status:** Verified Complete — Implementation README at `docs/implementations/task1058-history-sanitization/README.md`.
- **Outcome:** Pruned `docs/Stripes/Stripesdoc.md` across `cd3d30e8.....checkpoint/dev` (`204 -> 203` commits, dropping `eac38ecc9548ceffe00cc9395e61d3e84c1a2eec`), cleared `GH013` push protection with zero tree diff (`HEAD^{tree}` `d60d82d590d25c400a8e3954ed1e3ceb67cbae30`), and pushed `origin/checkpoint/dev` cleanly at `740f1682b785eb46af4778fb89aceaa492eb41ed`.

### Phase 10: Production Release Preparation (CODE COMPLETE — ARCHIVED)
- **Status:** Code Complete (historical config) — Implementation README verified at `docs/implementations/phase10-vps-release/README.md`.
- **Components:** PM2 fork runtime (`ecosystem.config.js` `instances: 1`), environment templates (`.env.example`), and database scripts (`verify-db-connection.js`, `generate-env.js`).
- **Operational Gate:** Live VPS cutover rehearsal now tracked under `U8` (`OPS-01–10`, Phase 18 Live Staging Drill on `77.42.85.129`), gated by `U1/U2`.

### Phase 11 Step 5A: Practice Hub Backend Task Routing (VERIFIED COMPLETE — ARCHIVED)
- **Status:** Verified Complete (historical scope) — Implementation README at `docs/implementations/phase11-step5a-backend-tasks/README.md`.

### Phase 11 Step 5B: Practice Hub Frontend Queue Views (VERIFIED COMPLETE — ARCHIVED)
- **Status:** Verified Complete (mocked E2E scope: Playwright 3/3 passed) — Implementation README at `docs/implementations/practice-hub-step5b-frontend-queues/README.md`. Real-actor/DB checks tracked under `TEST-07` (`U0`) & `PRA-01–06` (`U2/U5`).

### Phase 12: Security Containment (ARCHIVED — HISTORICAL SCOPE)
- **Status:** Historical Implementation README at `docs/implementations/phase12-security/README.md`. Reopened `UI8` access/secret gates (`SEC-01–19`) tracked under `U2`.

### Phase 17: Acceptance & Integration Testing (ARCHIVED — HISTORICAL SCOPE)
- **Status:** Historical Implementation README at `docs/implementations/phase17-acceptance/README.md`. Discovery/runtime gaps (`TEST-01–07`) tracked under `U0`.

### Phase 18: PostgreSQL Migration Tooling (MILESTONES 1 & 2 COMPLETE — ARCHIVED)
- **Status:** Milestones 1 & 2 Tooling Scripts Present (`staging-drill.sh`, `production-cutover.sh`, `validate-parity.ts` in `Haypbooks/Backend/scripts/`). Safety hardening (`OPS-01–04`) and live VPS drill tracked under `U8`.
