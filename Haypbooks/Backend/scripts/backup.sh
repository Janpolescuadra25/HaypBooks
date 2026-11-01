#!/usr/bin/env bash
set -euo pipefail

# HaypBooks Fail-Closed Database Backup Script
# Usage: ./backup.sh
# Note: On Windows environments, execute via Git Bash or WSL with PostgreSQL client tools installed.

# 1. Validate required CLI tools
if ! command -v pg_dump >/dev/null 2>&1; then
  echo "ERROR: pg_dump client not found in PATH." >&2
  exit 1
fi

PGHOST="${PGHOST:-127.0.0.1}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-haypbooks}"
PGDATABASE="${PGDATABASE:-haypbooks_dev}"
BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="${BACKUP_DIR}/haypbooks_backup_${TIMESTAMP}.dump"
CHECKSUM_FILE="${BACKUP_FILE}.sha256"

mkdir -p "$BACKUP_DIR"

echo "Creating custom-format PostgreSQL dump for database $PGDATABASE..."
pg_dump -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -Fc -f "$BACKUP_FILE"

echo "Generating SHA-256 checksum..."
if command -v sha256sum >/dev/null 2>&1; then
  sha256sum "$BACKUP_FILE" > "$CHECKSUM_FILE"
elif command -v shasum >/dev/null 2>&1; then
  shasum -a 256 "$BACKUP_FILE" > "$CHECKSUM_FILE"
else
  echo "ERROR: Neither sha256sum nor shasum utility found in PATH." >&2
  exit 1
fi

echo "Pruning database backups older than 7 days in $BACKUP_DIR..."
find "$BACKUP_DIR" -type f \( -name "haypbooks_backup_*.dump" -o -name "haypbooks_backup_*.sha256" \) -mtime +7 -delete

echo "Backup completed successfully:"
echo "Dump: $BACKUP_FILE"
echo "Checksum: $CHECKSUM_FILE"
