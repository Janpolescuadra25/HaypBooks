#!/bin/bash
# NOTE: Update the PROJECT_DIR path below to match the actual location on the VPS.
# This script is designed for the actual path /root/HaypBooks/Haypbooks.
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

echo "Building backend..."
npm run build

echo "Running database migrations..."
npx prisma migrate deploy
cd ..

# Restart both apps via pm2
echo "Restarting services..."
pm2 restart ecosystem.config.js --env production

echo "=== Deploy complete at: $(date) ==="
pm2 status
