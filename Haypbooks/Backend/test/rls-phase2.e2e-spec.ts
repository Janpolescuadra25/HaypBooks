import { execSync } from 'child_process'
import { Client } from 'pg'
import * as path from 'path'

const BACKEND_DIR = path.resolve(__dirname, '..')
const DATABASE_URL = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'

describe('RLS Phase2', () => {
  it('applies tenant RLS to a larger set of tables', async () => {
    process.env.DATABASE_URL = DATABASE_URL
    execSync('node ./scripts/test/setup-test-db.js --recreate', { cwd: BACKEND_DIR, stdio: 'inherit', env: { ...process.env, DATABASE_URL } })

    const client = new Client({ connectionString: DATABASE_URL })
    await client.connect()

    // apply phase2
    execSync('node ./scripts/db/apply-rls-phase2.js', { cwd: BACKEND_DIR, stdio: 'inherit', env: { DATABASE_URL } })

    const after = await client.query(`
      SELECT table_name FROM information_schema.columns
      WHERE lower(column_name) IN ('tenant_id','tenantid') AND table_schema = 'public'
      GROUP BY table_name
      HAVING NOT EXISTS (
        SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE c.relname = information_schema.columns.table_name
      )
    `)
    const missingAfter = after.rows.map(r => r.table_name)

    // Expect a few priority tables to be fixed
    expect(missingAfter).not.toContain('BankTransaction')
    expect(missingAfter).not.toContain('JournalEntry')
    expect(missingAfter).not.toContain('InvoiceLine')

    await client.end()
  }, 120000)
})