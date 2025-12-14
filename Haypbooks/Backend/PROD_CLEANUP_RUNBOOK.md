# Production TenantId Cleanup Runbook

Goal: Ensure no `tenantId_txt` / `tenantId_uuid_old` backups remain, and schema+RLS are correct in production.

## Preconditions
- Maintenance window approved; DB snapshot/backup ready.
- App in read-only or low traffic (optional but recommended).
- Operator has DB access and can run Node scripts.

## Steps

### 1) Validate current state
```powershell
# Use appropriate DATABASE_URL for production
$env:DATABASE_URL = 'postgresql://<user>:<pass>@<host>:<port>/<db>'
npm --prefix C:\Users\HomePC\Desktop\Haypbooksv9\Haypbooks\Backend run ci:db-ship-check
```
- If "Found backup columns" appears, proceed to step 2.

### 2) Drop lingering backup columns (safe)
```powershell
$env:DATABASE_URL = 'postgresql://<user>:<pass>@<host>:<port>/<db>'
node C:\Users\HomePC\Desktop\Haypbooksv9\Haypbooks\Backend\scripts\drop-tenantid-txt-now.js
```
- Script drops any `tenantId_txt` on detected tables.
- Historical `tenantId_uuid_old` should already be gone; if detected, run ship checks and handle via a targeted SQL (contact maintainer).

### 3) Re-run ship checks (must pass)
```powershell
$env:DATABASE_URL = 'postgresql://<user>:<pass>@<host>:<port>/<db>'
npm --prefix C:\Users\HomePC\Desktop\Haypbooksv9\Haypbooks\Backend run ci:db-ship-check
```
- Confirms: RLS lint, tenant types (TEXT), schema completeness, expected schema, seeds smoke, and final validation. Expect "All DB Ship checks passed".

### 4) Post-checks
- Monitor app logs for RLS violations or FK errors.
- Optionally run backend e2e on staging/prod mirror.

## Rollback
- If checks fail or errors appear: restore from snapshot, collect logs, and open an incident ticket with output of ship checks and DB state.

## Notes
- CI enforces `lint:db:fail-on-backups`; PRs must pass ship checks before merge.
- Policies must reference final `tenantId` (TEXT). Avoid re-introducing backup columns in future migrations.
