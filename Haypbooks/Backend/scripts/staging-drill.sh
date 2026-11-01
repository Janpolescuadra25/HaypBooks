#!/usr/bin/env bash
set -euo pipefail

# HaypBooks Phase 18 Milestone 2: Automated Staging Backup/Restore Drill
# Usage: ./scripts/staging-drill.sh <SOURCE_DATABASE_URL> <STAGING_DATABASE_URL>

if [[ $# -lt 2 ]]; then
  echo "ERROR: Missing required arguments." >&2
  echo "Usage: $0 <SOURCE_DATABASE_URL> <STAGING_DATABASE_URL>" >&2
  exit 1
fi

SOURCE_URL="$1"
STAGING_URL="$2"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
DUMP_FILE="${BACKUP_DIR}/staging_drill_${TIMESTAMP}.dump"
RESTORE_SCRIPT="./scripts/restore.sh"

if [[ ! -f "$RESTORE_SCRIPT" ]]; then
  echo "FAIL-CLOSED: $RESTORE_SCRIPT not found." >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"

echo "=== PHASE 18 MILESTONE 2: STAGING BACKUP & RESTORE DRILL ==="
echo "1. Exporting backup from source database..."
pg_dump --format=custom --no-owner --no-privileges --dbname="$SOURCE_URL" -f "$DUMP_FILE"

echo "2. Generating SHA-256 checksum..."
if command -v sha256sum >/dev/null 2>&1; then
  sha256sum "$DUMP_FILE" > "${DUMP_FILE}.sha256"
elif command -v shasum >/dev/null 2>&1; then
  shasum -a 256 "$DUMP_FILE" > "${DUMP_FILE}.sha256"
else
  echo "ERROR: Neither sha256sum nor shasum utility found in PATH." >&2
  exit 1
fi

echo "Backup created: $DUMP_FILE"

echo "3. Parsing STAGING_URL and configuring restore environment variables..."
eval "$(node -e '
  const u = new URL(process.argv[1]);
  console.log("export PGHOST=" + JSON.stringify(u.hostname || "127.0.0.1") + ";");
  console.log("export PGPORT=" + JSON.stringify(u.port || "5432") + ";");
  console.log("export PGUSER=" + JSON.stringify(decodeURIComponent(u.username || "haypbooks")) + ";");
  if (u.password) {
    console.log("export PGPASSWORD=" + JSON.stringify(decodeURIComponent(u.password)) + ";");
  }
  const dbName = u.pathname.replace(/^\//, "");
  console.log("export PGDATABASE=" + JSON.stringify(dbName || "haypbooks_dev") + ";");
' "$STAGING_URL")"

echo "Restoring backup to staging database ($PGDATABASE on $PGHOST:$PGPORT)..."
"$RESTORE_SCRIPT" "$DUMP_FILE" --confirm

echo "4. Running schema parity and data integrity audit..."
npx ts-node ./scripts/validate-parity.ts "$STAGING_URL" "$SOURCE_URL"

echo "✓ STAGING DRILL COMPLETED SUCCESSFULLY."
