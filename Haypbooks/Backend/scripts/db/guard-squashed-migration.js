#!/usr/bin/env node
// Post-process a squashed migration SQL file to add idempotency guards
const fs = require('fs');
const path = require('path');

const fileArg = process.argv[2] || 'prisma/migrations/20251213202646_squashed_uuid/migration.sql';
const filePath = path.resolve(process.cwd(), fileArg);
if (!fs.existsSync(filePath)) {
  console.error('Migration file not found:', filePath);
  process.exit(1);
}
let sql = fs.readFileSync(filePath, 'utf8');

// Make CREATE TABLE idempotent
sql = sql.replace(/CREATE TABLE \"/g, 'CREATE TABLE IF NOT EXISTS "');

// Wrap CREATE INDEX and CREATE UNIQUE INDEX lines into DO $$ blocks checking pg_class
// Replace single-line CREATE INDEX statements
sql = sql.replace(/-- CreateIndex\nCREATE UNIQUE INDEX (\"[^"]+\") ON ([^;]+);/g, (m, idx, rest) => {
  const name = idx.replace(/\"/g, '');
  return `-- CreateIndex\nDO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = '${name}') THEN\n  CREATE UNIQUE INDEX ${idx} ON ${rest};\nEND IF; END $$;`;
});

sql = sql.replace(/-- CreateIndex\nCREATE INDEX (\"[^"]+\") ON ([^;]+);/g, (m, idx, rest) => {
  const name = idx.replace(/\"/g, '');
  return `-- CreateIndex\nDO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = '${name}') THEN\n  CREATE INDEX ${idx} ON ${rest};\nEND IF; END $$;`;
});

fs.writeFileSync(filePath, sql);
console.log('Guarded migration written to', filePath);
