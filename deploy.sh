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

echo "Running database migrations..."
npx prisma migrate deploy
cd ..

# Restart both apps via pm2
echo "Restarting services..."
cd /root/HaypBooks
pm2 delete ecosystem.config.js 2>/dev/null || true
pm2 start ecosystem.config.js --env production
pm2 save

echo "=== Deploy complete at: $(date) ==="
pm2 status
