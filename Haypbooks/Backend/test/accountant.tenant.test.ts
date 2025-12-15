import { execSync } from 'child_process'
import { Client } from 'pg'
import * as path from 'path'

const BACKEND_DIR = path.resolve(__dirname, '..')
const DATABASE_URL = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'

describe('Accountant tenant RLS', () => {
  it('ensures RLS applied for accountant tables', async () => {
    process.env.DATABASE_URL = DATABASE_URL
    execSync('node ./scripts/test/setup-test-db.js --recreate', { cwd: BACKEND_DIR, stdio: 'inherit', env: { ...process.env, DATABASE_URL } })

    // apply phase2 RLS for candidates
    execSync('node ./scripts/db/apply-rls-phase2.js', { cwd: BACKEND_DIR, stdio: 'inherit', env: { DATABASE_URL } })

    const client = new Client({ connectionString: DATABASE_URL })
    await client.connect()

    const ac = await client.query(`SELECT p.polname FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE c.relname = 'AccountantClient'`) 
    const aa = await client.query(`SELECT p.polname FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE c.relname = 'AccountantActivity'`)

    const namesAc = ac.rows.map(r => r.polname)
    const namesAa = aa.rows.map(r => r.polname)

    expect(namesAc).toContain('rls_tenant')
    expect(namesAa).toContain('rls_tenant')

    await client.end()
  }, 120000)
})
