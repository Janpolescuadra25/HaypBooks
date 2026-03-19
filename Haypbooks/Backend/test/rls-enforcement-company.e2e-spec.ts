import { execSync } from 'child_process'
import { Client } from 'pg'
import * as path from 'path'
import { randomUUID } from 'crypto'

const BACKEND_DIR = path.resolve(__dirname, '..')
const DATABASE_URL = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'

describe('RLS Enforcement - company-level', () => {
  it('prevents cross-company read from Account when RLS enabled', async () => {
    process.env.DATABASE_URL = DATABASE_URL
    execSync('node ./scripts/test/setup-test-db.js --recreate', { cwd: BACKEND_DIR, stdio: 'inherit', env: { ...process.env, DATABASE_URL } })

    const client = new Client({ connectionString: DATABASE_URL })
    await client.connect()

    // Apply RLS policies for company scoped tables (Account etc.)
    execSync('node ./scripts/db/apply-rls-phase1.js', { cwd: BACKEND_DIR, stdio: 'inherit', env: { DATABASE_URL } })

    // Ensure there is an AccountType for creating accounts
    await client.query(`INSERT INTO 