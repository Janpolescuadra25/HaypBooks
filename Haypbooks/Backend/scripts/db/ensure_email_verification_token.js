#!/usr/bin/env node
// Idempotently ensure EmailVerificationToken table exists with expected columns/indexes
const { Client } = require('pg')
const path = require('path')
require('dotenv').config({ path: path.resolve(process.cwd(), '.env') })

async function main() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('DATABASE_URL not set; cannot ensure EmailVerificationToken table')
    process.exit(1)
  }
  const client = new Client({ connectionString })
  await client.connect()
  try {
    // Create table if not exists (idempotent)
    const createSql = `
CREATE TABLE IF NOT EXISTS public."EmailVerificationToken" (
  id text PRIMARY KEY,
  email varchar(320) NOT NULL,
  tokenHash text NOT NULL,
  data jsonb,
  expiresAt timestamptz NOT NULL,
  consumedAt timestamptz,
  createdAt timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS "EmailVerificationToken_email_idx" ON public."EmailVerificationToken" (email);
-- Use quoted identifiers for mixed-case columns created by Prisma
CREATE INDEX IF NOT EXISTS "EmailVerificationToken_expiresAt_idx" ON public."EmailVerificationToken" ("expiresAt");
CREATE INDEX IF NOT EXISTS "EmailVerificationToken_createdAt_idx" ON public."EmailVerificationToken" ("createdAt");
`
    await client.query(createSql)
    console.log('Ensured EmailVerificationToken table exists (idempotent)')
  } catch (e) {
    console.error('Failed to ensure EmailVerificationToken table:', e && e.message ? e.message : e)
    process.exit(1)
  } finally {
    await client.end()
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
