# Database Migration to Self-Hosted PostgreSQL (Phase 18)

## 1. Executive Summary
- **Current State:** The active HaypBooks backend deployed under PM2 on VPS `haypbooks-dev` (`77.42.85.129`) is connected to a legacy Neon cloud PostgreSQL database (`ep-withered-bar-azgp40zd-pooler.c-3.ap-southeast-1.aws.neon.tech/haypbooks_db?sslmode=require`).
- **Target Architecture:** Dedicated self-hosted PostgreSQL instance running locally on `haypbooks-dev` (`localhost:5432/haypbooks_dev`), fully isolated, sovereign, and aligned with `Haypbooks/Backend/.env.example`.
- **Governing Phase:** Phase 18 (P1 mandatory prerequisite for Phase 10 VPS Release).

---

## 2. Migration Prerequisites
1. **Tooling:** `pg_dump`, `pg_restore`, and `psql` from a PostgreSQL client version compatible with both source and target, installed and accessible on the VPS or deployment executor.
2. **Access & Connectivity:**
   - Active read access to the source Neon database.
   - Administrative owner access to the target self-hosted PostgreSQL database on `haypbooks-dev`.
3. **Storage & Capacity:** Confirm sufficient free disk space for the source dump, restored database, validation artifacts, and rollback reserves before starting. The historically reported 80 GB VPS capacity is planning input and must be measured at execution time.
4. **Safety & Quarantine:** Working tree clean; all changes performed under isolated scripts without committing secrets to version control.
5. **Maintenance Window:** Establish a write-free cutover window or a tested delta-sync strategy so writes cannot occur between the final source snapshot and application cutover.

---

## 3. Migration Execution Lifecycle (6 Phases)

### Phase A: Pre-Flight & Snapshot
1. Verify source and target PostgreSQL versions, connectivity, available disk space, and backup directory permissions.
2. Re-count repository migration directories at cutover. The repository contains 51 Prisma migration directories as observed on 2026-10-28; the live migration ledger and repository history must agree before cutover.
3. Extract schema inventory, table counts, record statistics, and critical financial control totals from the source database, including users, workspaces, companies, accounts, journal entries, invoices, and bills.
4. Stop application writes or activate the approved delta-sync procedure.
5. Generate a full deterministic snapshot:
   ```bash
   pg_dump --format=custom --no-owner --no-privileges --dbname="<NEON_SOURCE_DATABASE_URL>" -f "/root/backups/neon_pre_migration_$(date +%Y%m%d_%H%M%S).dump"
   ```
6. Record the dump path, byte size, and SHA-256 checksum. Verify the dump is readable with `pg_restore --list`.

### Phase B: Target Database Initialization
1. Ensure PostgreSQL is active on `haypbooks-dev`:
   ```bash
   systemctl status postgresql
   ```
2. Create a dedicated least-privilege application role and target database if they do not already exist. Do not place real credentials in scripts or documentation:
   ```sql
   CREATE DATABASE haypbooks_dev;
   ```
3. Confirm the target is isolated from production traffic and that its encoding, locale, extensions, and timezone are compatible with the source.

### Phase C: Data Restoration & Parity Validation
1. Restore schema and data to the isolated target database:
   ```bash
   pg_restore --clean --if-exists --no-owner --no-privileges -d "postgresql://<user>:<password>@localhost:5432/haypbooks_dev" "/root/backups/<dump_file>"
   ```
2. Compare Prisma migration ledger entries, schemas, tables, columns, constraints, indexes, extensions, and row counts between source and target.
3. Validate sequence values for every sequence-backed identifier without advancing production sequences merely to inspect them.
4. Reconcile critical accounting controls: journal debits equal credits, sub-ledger totals reconcile to control accounts, and source/target financial totals match.
5. Run application migration/status checks against the target without applying unreviewed destructive migrations.

### Phase D: Application Configuration Cutover
1. Back up the current server `.env` with restrictive permissions:
   ```bash
   cp /root/HaypBooks/Haypbooks/Backend/.env /root/HaypBooks/Haypbooks/Backend/.env.backup.$(date +%Y%m%d_%H%M%S)
   ```
2. Update only `DATABASE_URL` in `/root/HaypBooks/Haypbooks/Backend/.env` to the approved localhost target; never print or commit the credential.
3. Restart the PM2 backend process only after all parity gates pass:
   ```bash
   pm2 restart haypbooks-backend
   ```
4. Record the exact application revision, backup filename, target database identity, and cutover timestamp.

### Phase E: Post-Cutover Verification & Smoke Tests
1. Inspect PM2 status and bounded logs for a clean boot:
   ```bash
   pm2 logs haypbooks-backend --lines 50 --nostream
   ```
2. Confirm the backend process resolves the localhost database host without displaying credentials.
3. Execute authenticated smoke tests for sign-in/session recovery, workspace and company isolation, reads and safe reversible writes, accounting posting/report reconciliation, billing reads, and Practice Hub access.
4. Re-run schema, row-count, and accounting control-total comparisons after cutover.
5. Observe error rate, connection pool health, CPU, memory, disk, and PostgreSQL logs through the approved stabilization window.

### Phase F: Rollback Procedure (Fail-Closed)
If data inconsistency, connection refusal, tenant leakage, accounting mismatch, or application degradation occurs:
1. Stop or isolate application writes to prevent split-brain data changes.
2. Restore the previous `.env` from the identified backup.
3. Restart the PM2 backend process:
   ```bash
   pm2 restart haypbooks-backend
   ```
4. Confirm the backend reconnects cleanly to the previous database endpoint and validate application health.
5. Quarantine the target database and preserve logs, checksums, validation output, and any post-cutover writes for reconciliation before retrying.

---

## 4. Hard Safety Invariants
- **No Secrets in Repo:** Real passwords, tokens, database dumps, and connection URLs with embedded credentials must never be committed or pushed.
- **Fail-Closed Verification:** Cutover is certified only when schema, migration ledger, row counts, constraints, sequences, and financial control totals match the approved acceptance evidence.
- **No Split-Brain Writes:** Do not permit concurrent writes to the source and target unless an explicitly tested replication or delta-sync design is in force.
- **Traceability:** Every snapshot and restore must record paths, byte sizes, SHA-256 checksums, timestamps, tool versions, operator, and exact application revision.
- **Rollback Readiness:** Do not change `DATABASE_URL` or restart PM2 until the source backup is verified and the rollback command sequence has been rehearsed.
