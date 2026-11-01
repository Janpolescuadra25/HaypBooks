#!/usr/bin/env bash
set -euo pipefail

# HaypBooks Fail-Closed Database Restore Script
# Usage: ./restore.sh <path_to_dump_file> --confirm [--force-production]
# Note: On Windows development environments, run via Git Bash or WSL with PostgreSQL client tools installed.

# 1. Validate --confirm flag presence anywhere in arguments
if [[ ! " $* " =~ " --confirm " ]]; then
  echo "ERROR: Refusing to restore without explicit --confirm flag." >&2
  echo "Usage: $0 <path_to_dump_file> --confirm [--force-production]" >&2
  exit 1
fi

# 2. Extract dump file path (first non-flag argument)
DUMP_FILE=""
for arg in "$@"; do
  if [[ "$arg" != --* ]]; then
    DUMP_FILE="$arg"
    break
  fi
done

if [[ -z "$DUMP_FILE" || ! -f "$DUMP_FILE" ]]; then
  echo "ERROR: Valid dump file path not provided or file not found: $DUMP_FILE" >&2
  exit 1
fi

CHECKSUM_FILE="${DUMP_FILE}.sha256"
if [[ ! -f "$CHECKSUM_FILE" ]]; then
  echo "ERROR: Accompanying checksum file not found: $CHECKSUM_FILE" >&2
  exit 1
fi

# 3. Validate required CLI tools
if ! command -v psql >/dev/null 2>&1; then
  echo "ERROR: psql command-line client not found in PATH." >&2
  exit 1
fi

if ! command -v pg_restore >/dev/null 2>&1; then
  echo "ERROR: pg_restore command-line client not found in PATH." >&2
  exit 1
fi

# 4. Verify SHA-256 checksum
echo "Verifying SHA-256 checksum for $DUMP_FILE..."
if command -v sha256sum >/dev/null 2>&1; then
  sha256sum -c "$CHECKSUM_FILE"
elif command -v shasum >/dev/null 2>&1; then
  shasum -a 256 -c "$CHECKSUM_FILE"
else
  echo "ERROR: Neither sha256sum nor shasum utility found in PATH." >&2
  exit 1
fi

PGHOST="${PGHOST:-127.0.0.1}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-haypbooks}"
PGDATABASE="${PGDATABASE:-haypbooks_dev}"

# 5. Production database safety safeguard
if [[ "$PGDATABASE" =~ (prod|production) ]] && [[ ! " $* " =~ " --force-production " ]]; then
  echo "ERROR: Target database name appears to be production ($PGDATABASE)." >&2
  echo "Refusing to overwrite without explicit --force-production flag." >&2
  exit 1
fi

# 6. Terminate active connections with zero error suppression
echo "Terminating active connections on $PGDATABASE..."
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d postgres -v ON_ERROR_STOP=1 -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$PGDATABASE' AND pid <> pg_backend_pid();"

# 7. Perform database restoration
echo "Restoring database $PGDATABASE from $DUMP_FILE..."
pg_restore -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" --clean --if-exists --no-owner --no-privileges "$DUMP_FILE"

echo "Database restore completed successfully."
