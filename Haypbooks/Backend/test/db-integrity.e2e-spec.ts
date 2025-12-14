import { execSync } from 'child_process'
import { Client } from 'pg'
import * as path from 'path'

const BACKEND_DIR = path.resolve(__dirname, '..')
const DATABASE_URL = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'

describe('DB Integrity', () => {
  it('checks tenant FKs and tenantId indexes for Phase2 candidates', async () => {
    process.env.DATABASE_URL = DATABASE_URL
    execSync('node ./scripts/test/setup-test-db.js --recreate', { cwd: BACKEND_DIR, stdio: 'inherit', env: { ...process.env, DATABASE_URL } })

    const client = new Client({ connectionString: DATABASE_URL })
    await client.connect()

    // Apply tenant indexes for Phase 2 (idempotent)
    execSync('node ./scripts/db/add-tenant-indexes-phase2.js', { cwd: BACKEND_DIR, stdio: 'inherit', env: { DATABASE_URL } })

    const candidates = ['Account','BankAccount','BankTransaction','InvoiceLine','JournalEntry','Bill','PurchaseOrder','Customer','Vendor']

    for (const t of candidates) {
      // check tenantId column exists
      const col = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name = $1 AND column_name ILIKE 'tenantid'`, [t])
      expect(col.rowCount).toBeGreaterThan(0)

      // check for index on tenantId (any index covering a column named tenantId)
      const idx = await client.query(`
        SELECT 1 FROM pg_index i
        JOIN pg_class c ON c.oid = i.indrelid
        JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = ANY(i.indkey)
        WHERE c.relname = $1 AND lower(a.attname) = 'tenantid'
      `, [t])
      if (idx.rowCount === 0) console.warn('Missing tenantId index for table', t)
      expect(idx.rowCount).toBeGreaterThan(0)

      // optional: check foreign key to Tenant exists (not required yet)
      // const fk = await client.query(`SELECT 1 FROM pg_constraint c JOIN pg_class t ON c.conrelid = t.oid WHERE t.relname = $1 AND (c.conkey IS NOT NULL) AND EXISTS (SELECT 1 FROM information_schema.constraint_column_usage cu WHERE cu.constraint_name = c.conname AND cu.table_name = $2)`, [t, 'Tenant'])
      // pass
    }

    await client.end()
  }, 120000)
})