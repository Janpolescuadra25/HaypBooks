import { execSync } from 'child_process'
import { Client } from 'pg'
import * as path from 'path'
import { randomUUID } from 'crypto'

const BACKEND_DIR = path.resolve(__dirname, '..')
const DATABASE_URL = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'

describe('RLS Enforcement', () => {
  it('prevents cross-tenant access but allows bypass', async () => {
    process.env.DATABASE_URL = DATABASE_URL
    execSync('node ./scripts/test/setup-test-db.js --recreate', { cwd: BACKEND_DIR, stdio: 'inherit', env: { ...process.env, DATABASE_URL } })

    const client = new Client({ connectionString: DATABASE_URL })
    await client.connect()

    // Ensure Phase 1 RLS is applied (Task, Attachment, Invoice)
    execSync('node ./scripts/db/apply-rls-phase1.js', { cwd: BACKEND_DIR, stdio: 'inherit', env: { DATABASE_URL } })

    // Create two tenants
    const tenantA = randomUUID()
    const tenantB = randomUUID()
    const subA = `tenant-a-${tenantA.slice(0,8)}`
    const subB = `tenant-b-${tenantB.slice(0,8)}`
    await client.query(`INSERT INTO "Tenant" (id, name, subdomain, "createdAt", "updatedAt") VALUES ($1, $2, $3, now(), now()), ($4, $5, $6, now(), now())`, [tenantA, 'Tenant A', subA, tenantB, 'Tenant B', subB])

    // Create a user for tenant A and insert a Task for tenant A
    const userA = randomUUID()
    await client.query(`INSERT INTO "User" (id, email, passwordhash, "createdAt", "updatedAt") VALUES ($1, $2, $3, now(), now())`, [userA, `usera+${userA.slice(0,8)}@example.com`, 'password'])
    const taskRes = await client.query(`INSERT INTO "Task" (id, "tenantId", title, "createdById", "createdAt", "updatedAt") VALUES (gen_random_uuid(), $1, $2, $3, now(), now()) RETURNING id`, [tenantA, 'Tenant A Task', userA])
    const taskId = taskRes.rows[0].id

    // New non-superuser role representing tenant B (create role if needed)
    await client.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='app_test') THEN CREATE ROLE app_test LOGIN PASSWORD 'test'; END IF; END$$;`)
    const connBUrl = DATABASE_URL.replace('postgresql://postgres:Ninetails45@','postgresql://app_test:test@')
    const connB = new Client({ connectionString: connBUrl })
    await connB.connect()
    await connB.query(`SET haypbooks.tenant_id = '${tenantB}'`)

    // Give the test role SELECT permission (no RLS bypass)
    await client.query(`GRANT SELECT ON "Task" TO app_test`)

    // Tenant B should not see tenant A's task
    await connB.query(`SET haypbooks.tenant_id = '${tenantB}'`)
    // verify session setting is applied
    await connB.query("SELECT current_setting('haypbooks.tenant_id', true) as val")

    const resB = await connB.query(`SELECT id FROM "Task" WHERE id = $1`, [taskId])
    if (resB.rowCount > 0) {
      // fetch the row with bypass to inspect its tenantId
      await connB.query(`SET haypbooks.rls_bypass = '1'`)
      const debugRow = await connB.query(`SELECT id, "tenantId"::text as tenant FROM "Task" WHERE id = $1`, [taskId])
      console.warn('unexpected visible row for tenant B; task tenant:', debugRow.rows[0])
    }
    expect(resB.rowCount).toBe(0)

    // With rls_bypass set, it should be visible
    await connB.query(`SET haypbooks.rls_bypass = '1'`)
    const resBypass = await connB.query(`SELECT id FROM "Task" WHERE id = $1`, [taskId])
    expect(resBypass.rowCount).toBe(1)

    await connB.end()
    await client.end()
  }, 120000)
})