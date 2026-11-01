# Database Migration to Self-Hosted PostgreSQL (Phase 18)

## 1. Executive Summary
- **Current State:** The active HaypBooks backend deployed under PM2 on VPS `haypbooks-dev` (`77.42.85.129`) is connected to a legacy Neon cloud PostgreSQL database (`ep-withered-bar-azgp40zd-pooler.c-3.ap-southeast-1.aws.neon.tech/haypbooks_db?sslmode=require`).
- **Target Architecture:** Dedicated self-hosted PostgreSQL instance running locally on `haypbooks-dev` (`localhost:5432/haypbooks_dev`), fully isolated, sovereign, and aligned with `Haypbooks/Backend/.env.example`.
- **Governing Phase:** Phase 18 (P1 mandatory prerequisite for Phase 10 VPS Release).

---

## Milestone 1: Local & Staging Infrastructure (COMPLETED & VERIFIED - 2026-11-01)
- **PostgreSQL Service:** Version `postgres:15-alpine` bound strictly to `127.0.0.1:5432` with persistent volume `haypbooks_pgdata` and `scram-sha-256` authentication initialization.
- **pgBouncer Service:** Version `edoburu/pgbouncer:v1.22.1` bound to `127.0.0.1:6432` using `POOL_MODE=transaction`, `MAX_CLIENT_CONN=1000`, `DEFAULT_POOL_SIZE=25`, `SERVER_IDLE_TIMEOUT=300`, and `AUTH_TYPE=scram-sha-256` with container healthcheck.
- **Connection Strings:**
  - Direct PostgreSQL (Migrations & Admin): `postgresql://haypbooks:haypbooks@127.0.0.1:5432/haypbooks_dev?sslmode=disable`
  - pgBouncer Pooled (Application Runtime): `postgresql://haypbooks:haypbooks@127.0.0.1:6432/haypbooks_dev?sslmode=disable&pgbouncer=true&connection_limit=10`
- **Automated Backup & Restore Scripts:**
  - Backup: `Haypbooks/Backend/scripts/backup.sh` (Custom-format `pg_dump -Fc`, SHA-256 checksumming, 7-day automated retention).
  - Restore: `Haypbooks/Backend/scripts/restore.sh` (Checksum integrity check, active connection termination, strict fail-closed error handling, safety confirmation gate).
- **Security & Port Hardening:** Ports 5432 and 6432 restricted to loopback (`127.0.0.1`) in `docker-compose.yml`; backup dumps excluded via `.gitignore`.

## Milestone 2: Staging Drill & Production Cutover Automation (IMPLEMENTED)

Milestone 2 adds the operational automation required to validate a restore, verify schema/data parity, and safely switch the application to the self-hosted PostgreSQL target.

### 2.1 `scripts/validate-parity.ts`
- Validates the Prisma migration ledger and the core operational tables.
- Audits row counts for `users`, `workspaces`, `companies`, `accounts`, `journal_entries`, `journal_lines`, `invoices`, and `bills`.
- Confirms the general ledger remains balanced by checking the total debit and credit amounts across `journal_lines`.
- Accepts `TARGET_DATABASE_URL` as the first argument and optionally a `SOURCE_DATABASE_URL` for direct parity comparison.

Example:
```bash
npx ts-node scripts/validate-parity.ts <TARGET_DATABASE_URL> [SOURCE_DATABASE_URL]
```

### 2.2 `scripts/staging-drill.sh`
- Creates a backup from the source database, saves a checksum, restores it to the staging target, and then executes the parity validator.
- Requires both the source and staging database URLs as arguments.
- Uses the repository `restore.sh` script as the fail-closed restore gate.

Example:
```bash
./scripts/staging-drill.sh <SOURCE_DATABASE_URL> <STAGING_DATABASE_URL>
```

### 2.3 `scripts/production-cutover.sh`
- Backs up the active `.env` file before cutover.
- Validates the target database connection through the parity script.
- Updates `DATABASE_URL` in the application env file and restarts the backend through PM2.
- Performs a smoke check against the local health endpoint and supports a 1-tap rollback path via `--rollback`.

Example:
```bash
./scripts/production-cutover.sh --confirm-cutover <NEW_DATABASE_URL>
./scripts/production-cutover.sh --rollback
```

### 2.4 `DIRECT_URL` guidance
- Local development keeps `DATABASE_URL` on port `5432` and is intended for the developer workstation flow.
- For Prisma migration execution, use the direct connection string in `DIRECT_URL` so migration commands remain session-safe and are not forced through pgBouncer.
- Application runtime traffic can continue to use the pooled `DATABASE_URL` path when the environment is configured through pgBouncer on port `6432`.

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

---

## 5. Production Connection Pooling Architecture

Phase 18 uses two connection paths because Prisma application traffic and Prisma migration commands have different session requirements.

### 5.1 pgBouncer transaction pool

- Run pgBouncer on port `6432` with `pool_mode = transaction` for normal NestJS/Prisma traffic.
- Use a bounded application pool (`max_client_conn = 1000`, `default_pool_size = 25`, `reserve_pool_size = 5`, and `server_idle_timeout = 60`). Measure and adjust these values against observed VPS load.
- The application URL may use `pgbouncer=true` and must never contain a committed password.
- Transaction pooling is unsuitable for session state and session-level advisory locks. Do not use it for Prisma migrations.

### 5.2 Direct session connection for migrations

- Keep PostgreSQL port `5432` bound to localhost or the private Docker network only.
- Run `prisma migrate deploy` and other schema operations through the direct session URL on port `5432`, where advisory locks and session semantics are preserved.
- Validate both URLs independently before cutover; a successful application connection does not prove migration connectivity.

## 6. Automated Backup and Restore Specification

### 6.1 `scripts/backup.sh`

- Validate the presence of `pg_dump` and a checksum utility (`sha256sum` or `shasum`) before creating archives.
- Create custom-format archives named `haypbooks_backup_YYYYMMDD_HHMMSS.dump` with `pg_dump -Fc --no-owner --no-privileges` into the local `./backups` directory unless `BACKUP_DIR` is overridden.
- Write a SHA-256 checksum beside each archive and verify it with `sha256sum --check` before retention cleanup.
- Retain backups for 7 days by pruning archived dumps and checksum files older than the threshold. Record the database identity, application revision, timestamp, archive size, and tool version without recording credentials.
- Fail closed when the source is unreachable, disk space is insufficient, the archive is empty, or checksum generation fails.
- On Windows, execute the script from Git Bash or WSL where the PostgreSQL client tools are installed and PATH is configured.

Example usage:

```bash
./scripts/backup.sh
BACKUP_DIR=./backups ./scripts/backup.sh
```

### 6.2 `scripts/restore.sh`

- Require an explicit dump path and a target database whose name is approved for restore testing; reject production targets unless a separately approved force flag and confirmation are supplied.
- Check PostgreSQL reachability, free disk space, archive readability, and checksum before restoring with `pg_restore --clean --if-exists --no-owner --no-privileges`.
- Restore into `haypbooks_restore_test` during drills, then compare migration ledgers, row counts, sequences, journal debit/credit totals, and representative tenant records.
- Preserve restore logs and validation output; never print the connection password.
- On Windows, execute the script from Git Bash or WSL where the PostgreSQL client tools are installed and PATH is configured.

Example usage:

```bash
./scripts/restore.sh ./backups/haypbooks_dev_20261101_120000.dump --confirm
./scripts/restore.sh ./backups/haypbooks_dev_20261101_120000.dump --confirm --force-production
```

## 7. VPS PostgreSQL Security Hardening

- Bind PostgreSQL to `127.0.0.1` and the private Docker bridge only. Deny public ingress to ports `5432` and `6432` at the host firewall.
- Require `scram-sha-256` in `pg_hba.conf`; do not use plaintext or legacy `md5` authentication.
- Run PostgreSQL under its dedicated non-root service account and keep `/var/lib/postgresql/data` permissions at `0700`.
- Store secrets in the VPS secret/environment mechanism with restrictive permissions. Do not place passwords in scripts, documentation, Git history, or command output.
- Enable bounded logging, disk monitoring, connection monitoring, backup alerts, and a tested rollback path before declaring Phase 18 complete.
