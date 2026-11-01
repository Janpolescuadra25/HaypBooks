#!/usr/bin/env bash
# ============================================================================== 
# HaypBooks PostgreSQL Safe Restore Script
# Verifies SHA-256 checksum, terminates active connections, and restores dump
# Fail-closed execution: zero error suppression allowed
# ============================================================================== 
set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <path_to_backup_dump> [--confirm]"
  echo "Example: $0 ./backups/haypbooks_dev_20261101_120000.dump --confirm"
  exit 1
fi

BACKUP_FILE="$1"
CONFIRM_FLAG="${2:-}"
CHECKSUM_FILE="${BACKUP_FILE}.sha256"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-haypbooks}"
PGPASSWORD="${PGPASSWORD:-haypbooks}"
DB_NAME="${DB_NAME:-haypbooks_dev}"

if [[ ! -f "${BACKUP_FILE}" ]]; then
  echo "ERROR: Backup file '${BACKUP_FILE}' does not exist!"
  exit 1
fi

if [[ "${CONFIRM_FLAG}" != "--confirm" ]]; then
  echo "SAFETY WARNING: This operation will overwrite database '${DB_NAME}' on ${DB_HOST}:${DB_PORT}!"
  echo "To proceed, pass '--confirm' as the second argument."
  exit 1
fi

if [[ -f "${CHECKSUM_FILE}" ]]; then
  echo "Verifying SHA-256 integrity checksum..."
  sha256sum -c "${CHECKSUM_FILE}"
  echo "Checksum verification PASSED."
else
  echo "WARNING: No checksum file found at '${CHECKSUM_FILE}'. Proceeding with caution."
fi

echo "Verifying target database exists..."
TARGET_EXISTS="$(PGPASSWORD="${PGPASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d postgres -Atqc "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}';")"
if [[ -z "${TARGET_EXISTS}" ]]; then
  echo "ERROR: Target database '${DB_NAME}' does not exist."
  exit 1
fi

echo "Terminating active connections to '${DB_NAME}'..."
PGPASSWORD="${PGPASSWORD}" psql \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d postgres \
  -v ON_ERROR_STOP=1 \
  -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '${DB_NAME}' AND pid <> pg_backend_pid();"

echo "Restoring database from '${BACKUP_FILE}'..."
PGPASSWORD="${PGPASSWORD}" pg_restore \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -d "${DB_NAME}" \
  --clean \
  --if-exists \
  --no-owner \
  --no-privileges \
  -v \
  "${BACKUP_FILE}"

echo "=== [RESTORE COMPLETED SUCCESSFULLY] ==="
