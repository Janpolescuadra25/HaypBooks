#!/bin/bash
# NOTE: Update the PROJECT_DIR path below to match the actual location on the VPS.
# This script is designed for the actual path /root/HaypBooks, with the app code
# inside the nested Haypbooks directory.
# Make sure this script is executable (`chmod +x deploy.sh`) if you want to run it directly.

set -e

echo "=== HaypBooks Auto-Deploy ==="
echo "Started at: $(date)"

# Navigate to project directory
cd /root/HaypBooks/Haypbooks

# Pull latest code
echo "Pulling latest code..."
git pull origin main

# Deploy Frontend
echo "Installing frontend dependencies..."
cd Frontend
npm install

echo "Building frontend..."
npm run build
cd ..

# Deploy Backend
echo "Installing backend dependencies..."
cd Backend
npm install
npx prisma generate

echo "Building backend..."
npm run build

echo "Sync GEMINI_API_KEY from GitHub Secrets to VPS .env"
if [ -n "$GEMINI_API_KEY" ]; then
  if grep -q "^GEMINI_API_KEY=" /root/HaypBooks/Haypbooks/Backend/.env 2>/dev/null; then
    sed -i "s|^GEMINI_API_KEY=.*|GEMINI_API_KEY=$GEMINI_API_KEY|" /root/HaypBooks/Haypbooks/Backend/.env
  else
    echo "GEMINI_API_KEY=$GEMINI_API_KEY" >> /root/HaypBooks/Haypbooks/Backend/.env
  fi
fi

echo "Running database migrations..."
npx prisma migrate deploy

echo "Checking if seed is needed..."
cd /root/HaypBooks/Haypbooks/Backend
SEED_COUNT=$(npx prisma db execute --stdin <<'SQL' 2>/dev/null | tail -1
SELECT COUNT(*) FROM currencies;
SQL
)
if [ "$SEED_COUNT" -eq 0 ] 2>/dev/null; then
  echo "No currencies found, running seed..."
  npx prisma db seed
else
  echo "Currencies already exist ($SEED_COUNT rows), skipping seed."
fi
cd /root/HaypBooks/Haypbooks

# Restart both apps via pm2
echo "Restarting services..."
cd /root/HaypBooks
pm2 delete ecosystem.config.js 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save

echo "=== Deploy complete at: $(date) ==="
pm2 status
