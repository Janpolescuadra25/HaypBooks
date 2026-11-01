#!/usr/bin/env bash
set -euo pipefail

# HaypBooks Phase 18 Milestone 2: Production Database Cutover Runbook
# Usage:
#   ./scripts/production-cutover.sh --confirm-cutover <NEW_DATABASE_URL>
#   ./scripts/production-cutover.sh --rollback

ENV_FILE=".env"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_ENV=".env.backup.${TIMESTAMP}"

if [[ " $* " =~ " --rollback " ]]; then
  echo "=== EXECUTING EMERGENCY ROLLBACK ==="
  LATEST_BACKUP="$(ls -t .env.backup.* 2>/dev/null | head -n 1 || true)"
  if [[ -z "$LATEST_BACKUP" ]]; then
    echo "ERROR: No .env backup file found to rollback to." >&2
    exit 1
  fi

  echo "Restoring from $LATEST_BACKUP..."
  cp "$LATEST_BACKUP" "$ENV_FILE"

  echo "Restarting PM2 backend service..."
  if command -v pm2 >/dev/null 2>&1; then
    pm2 restart haypbooks-backend || pm2 restart all
  fi

  echo "✓ Rollback executed. Service restored to previous environment."
  exit 0
fi

if [[ ! " $* " =~ " --confirm-cutover " || $# -lt 2 ]]; then
  echo "ERROR: Refusing to perform cutover without explicit --confirm-cutover flag and NEW_DATABASE_URL." >&2
  echo "Usage: $0 --confirm-cutover <NEW_DATABASE_URL>" >&2
  echo "       $0 --rollback" >&2
  exit 1
fi

NEW_DB_URL="$2"

echo "=== PHASE 18 MILESTONE 2: PRODUCTION DATABASE CUTOVER ==="
if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: Target $ENV_FILE file not found in current directory." >&2
  exit 1
fi

echo "1. Backing up current .env to $BACKUP_ENV..."
cp "$ENV_FILE" "$BACKUP_ENV"

echo "2. Validating connection to new database via validate-parity.ts..."
npx ts-node ./scripts/validate-parity.ts "$NEW_DB_URL"

echo "3. Updating DATABASE_URL in $ENV_FILE..."
node -e '
const fs = require("fs");
const newUrl = process.argv[1];
let env = fs.readFileSync(".env", "utf8");
if (env.includes("DATABASE_URL=")) {
  env = env.replace(/DATABASE_URL=.*/, `DATABASE_URL="${newUrl}"`);
} else {
  env += `\nDATABASE_URL="${newUrl}"\n`;
}
fs.writeFileSync(".env", env, "utf8");
' "$NEW_DB_URL"

echo "4. Restarting application backend under PM2..."
if command -v pm2 >/dev/null 2>&1; then
  if pm2 list | grep -q "haypbooks-backend"; then
    pm2 restart haypbooks-backend
  else
    echo "Notice: haypbooks-backend not found in PM2 list. Checking ecosystem config..."
    if [[ -f "ecosystem.config.js" ]]; then
      pm2 restart ecosystem.config.js
    else
      echo "Notice: Restart PM2 manually."
    fi
  fi
  pm2 status || true
else
  echo "Notice: PM2 command not found in local environment. Restart application manually."
fi

echo "5. Running post-cutover smoke health check..."
HEALTH_URL="http://127.0.0.1:3001/api/health"
if command -v curl >/dev/null 2>&1; then
  if curl -s -f "$HEALTH_URL" >/dev/null 2>&1 || curl -s -f "http://127.0.0.1:4000/api/health" >/dev/null 2>&1; then
    echo "✓ Health check passed."
  else
    echo "Warning: Health endpoint did not return HTTP 200. Check application logs."
  fi
fi

echo "✓ PRODUCTION CUTOVER COMPLETED."
echo "If issues arise, execute: ./scripts/production-cutover.sh --rollback"
