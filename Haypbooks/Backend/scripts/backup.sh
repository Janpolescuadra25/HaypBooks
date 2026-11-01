#!/usr/bin/env bash
# ============================================================================== 
# HaypBooks Automated PostgreSQL Backup Script
# Fail-closed custom-format pg_dump with SHA-256 verification and retention
# ============================================================================== 
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP="$(date +"%Y%m%d_%H%M%S")"
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"
DB_USER="${DB_USER:-haypbooks}"
PGPASSWORD="${PGPASSWORD:-haypbooks}"
DB_NAME="${DB_NAME:-haypbooks_dev}"
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.dump"
CHECKSUM_FILE="${BACKUP_FILE}.sha256"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

mkdir -p "${BACKUP_DIR}"

echo "=== [STARTING POSTGRESQL BACKUP] ==="
echo "Target Host: ${DB_HOST}:${DB_PORT}"
echo "Database:    ${DB_NAME}"
echo "User:        ${DB_USER}"
echo "Output File: ${BACKUP_FILE}"

PGPASSWORD="${PGPASSWORD}" pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -Fc \
  -b \
  -v \
  -f "${BACKUP_FILE}" \
  "${DB_NAME}"

if [[ ! -s "${BACKUP_FILE}" ]]; then
  echo "ERROR: Backup file is empty or missing! Aborting."
  exit 1
fi

echo "Generating SHA-256 checksum..."
sha256sum "${BACKUP_FILE}" > "${CHECKSUM_FILE}"
echo "Checksum created: $(cat "${CHECKSUM_FILE}")"

echo "Applying retention policy: removing dumps older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "${DB_NAME}_*.dump" -mtime +"${RETENTION_DAYS}" -exec rm -f {} \;
find "${BACKUP_DIR}" -name "${DB_NAME}_*.dump.sha256" -mtime +"${RETENTION_DAYS}" -exec rm -f {} \;

echo "=== [BACKUP COMPLETED SUCCESSFULLY] ==="
