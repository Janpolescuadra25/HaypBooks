# Phase 18 Milestone 2: Database Migration Automation & Staging Tooling

**Status:** COMPLETED & VERIFIED IN CODE (2026-11-01)  
**Verified Commit:** `f079a7448a03a2f86af24fd613d9dc84cc067f03`  
**Target Branch:** `checkpoint/dev`

## 1. Overview & Objective
Milestone 2 delivers automated, fail-closed operational tooling for the self-hosted PostgreSQL migration:
- Automated staging backup and restoration drill
- Database schema parity and accounting ledger balance validation
- Production cutover runbook with safe environment updates and 1-tap rollback

## 2. Implemented Scripts & Tools
| Script / File | Path | Purpose |
|---|---|---|
| Parity Validator | `Haypbooks/Backend/scripts/validate-parity.ts` | Compares migration counts (≥50), core table row counts, and verifies general ledger debits equal credits (`debit == credit` within 0.001 tolerance). |
| Staging Drill Automation | `Haypbooks/Backend/scripts/staging-drill.sh` | Extracts connection parameters from `STAGING_URL`, exports `PGHOST/PGPORT/PGUSER/PGDATABASE`, executes `restore.sh --confirm`, and invokes `validate-parity.ts`. |
| Production Cutover Runbook | `Haypbooks/Backend/scripts/production-cutover.sh` | Backs up `.env`, validates target database connectivity, updates `DATABASE_URL`, restarts PM2 backend service, runs health checks, and supports `--rollback`. |
| Connection String Documentation | `Haypbooks/Backend/.env.example` | Documents `DIRECT_URL` (port 5432 for migrations) and `DATABASE_URL` (port 6432 for pooled application traffic) while preserving local development defaults. |

## 3. Operational Next Step
The automation tooling is 100% complete in the repository. The only remaining operational step is the execution of the live staging drill in the VPS environment prior to final Phase 10 production deployment.
