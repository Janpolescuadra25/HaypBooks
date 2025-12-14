#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const migrationsDir = path.resolve(__dirname, '../../prisma/migrations');
const sourceDir = path.join(migrationsDir, '20251213202646_squashed');
const destDir = path.join(migrationsDir, '20251213202646_squashed_uuid');

if (!fs.existsSync(sourceDir)) {
  console.error('Source squashed migration not found:', sourceDir);
  process.exit(1);
}

if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });

const src = path.join(sourceDir, 'migration.sql');
const dest = path.join(destDir, 'migration.sql');
const content = fs.readFileSync(src, 'utf8');

let out = content;
// Replace Tenant.id TEXT with uuid
out = out.replace(/CREATE TABLE "Tenant" \([\s\S]*?CONSTRAINT "Tenant_pkey" PRIMARY KEY \("id"\)\n\);/m, (match) => {
  return match.replace(/"id" TEXT NOT NULL DEFAULT gen_random_uuid\(\)::text,/g, '"id" uuid NOT NULL DEFAULT gen_random_uuid(),')
              .replace(/"id" uuid NOT NULL DEFAULT gen_random_uuid\(\),/g, '"id" uuid NOT NULL DEFAULT gen_random_uuid(),');
});

// Replace tenantId column types
out = out.replace(/\"tenantId\" TEXT NOT NULL/g, '\"tenantId\" uuid NOT NULL');
out = out.replace(/\"tenantId\" TEXT,/g, '\"tenantId\" uuid,');

fs.writeFileSync(dest, out);
console.log('Generated squashed UUID migration:', dest);
