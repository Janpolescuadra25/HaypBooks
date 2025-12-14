import { execSync } from 'child_process'
import { Client } from 'pg'
import * as path from 'path'
import { randomUUID } from 'crypto'

const BACKEND_DIR = path.resolve(__dirname, '..')
const DATABASE_URL = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'

async function setup() {
  process.env.DATABASE_URL = DATABASE_URL
  execSync('node ./scripts/test/setup-test-db.js --recreate', { cwd: BACKEND_DIR, stdio: 'inherit', env: { ...process.env, DATABASE_URL } })
  execSync('node ./scripts/db/apply-rls-phase1.js', { cwd: BACKEND_DIR, stdio: 'inherit', env: { DATABASE_URL } })
}

describe('RLS Enforcement Additional', () => {
  beforeAll(async () => {
    await setup()
  })

  test('Attachment is protected and bypass works', async () => {
    const client = new Client({ connectionString: DATABASE_URL })
    await client.connect()

    const tenantA = randomUUID()
    const tenantB = randomUUID()
    await client.query(`INSERT INTO "Tenant" (id, name, subdomain, "createdAt", "updatedAt") VALUES ($1, $2, $3, now(), now()), ($4, $5, $6, now(), now())`, [tenantA, 'Tenant A', `a-${tenantA.slice(0,8)}`, tenantB, 'Tenant B', `b-${tenantB.slice(0,8)}`])

    const userA = randomUUID()
    await client.query(`INSERT INTO "User" (id, email, passwordhash, "createdAt", "updatedAt") VALUES ($1, $2, $3, now(), now())`, [userA, `usera+${userA.slice(0,8)}@example.com`, 'password'])

    const attRes = await client.query(`INSERT INTO "Attachment" (id, "tenantId", "entityType", "entityId", "fileUrl", "uploadedById", "uploadedAt") VALUES (gen_random_uuid(), $1, 'Invoice', $2, 'https://example.com/f', $3, now()) RETURNING id`, [tenantA, 'inv-1', userA])
    const attId = attRes.rows[0].id

    // non-superuser connection for tenant B
    await client.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='app_test2') THEN CREATE ROLE app_test2 LOGIN PASSWORD 'test'; END IF; END$$;`)
    await client.query(`GRANT SELECT ON "Attachment" TO app_test2`)
    const connB = new Client({ connectionString: DATABASE_URL.replace('postgresql://postgres:Ninetails45@','postgresql://app_test2:test@') })
    await connB.connect()
    await connB.query(`SET haypbooks.tenant_id = '${tenantB}'`)

    const res = await connB.query(`SELECT id FROM "Attachment" WHERE id = $1`, [attId])
    expect(res.rowCount).toBe(0)

    await connB.query(`SET haypbooks.rls_bypass = '1'`)
    const resBypass = await connB.query(`SELECT id FROM "Attachment" WHERE id = $1`, [attId])
    expect(resBypass.rowCount).toBe(1)

    await connB.end()
    await client.end()
  }, 120000)

  test('Invoice is protected and bypass works', async () => {
    const client = new Client({ connectionString: DATABASE_URL })
    await client.connect()

    const tenantA = randomUUID()
    const tenantB = randomUUID()
    await client.query(`INSERT INTO "Tenant" (id, name, subdomain, "createdAt", "updatedAt") VALUES ($1, $2, $3, now(), now()), ($4, $5, $6, now(), now())`, [tenantA, 'Tenant A', `a-${tenantA.slice(0,8)}`, tenantB, 'Tenant B', `b-${tenantB.slice(0,8)}`])

    // need a customer contact to satisfy FK
    const custId = randomUUID()
    await client.query(`INSERT INTO "Contact" (id, "tenantId", "type", "displayName", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, now(), now())`, [custId, tenantA, 'CUSTOMER', 'Customer A'])
    // Customer table uses contactId as PK; create corresponding Customer row
    await client.query(`INSERT INTO "Customer" ("contactId", "tenantId") VALUES ($1, $2)`, [custId, tenantA])

    const invRes = await client.query(`INSERT INTO "Invoice" (id, "tenantId", "customerId", "total", "balance", "issuedAt") VALUES (gen_random_uuid(), $1, $2, 100, 100, now()) RETURNING id`, [tenantA, custId])
    const invId = invRes.rows[0].id

    // non-superuser connection for tenant B
    await client.query(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='app_test3') THEN CREATE ROLE app_test3 LOGIN PASSWORD 'test'; END IF; END$$;`)
    await client.query(`GRANT SELECT ON "Invoice" TO app_test3`)
    const connB = new Client({ connectionString: DATABASE_URL.replace('postgresql://postgres:Ninetails45@','postgresql://app_test3:test@') })
    await connB.connect()
    await connB.query(`SET haypbooks.tenant_id = '${tenantB}'`)

    const res = await connB.query(`SELECT id FROM "Invoice" WHERE id = $1`, [invId])
    expect(res.rowCount).toBe(0)

    await connB.query(`SET haypbooks.rls_bypass = '1'`)
    const resBypass = await connB.query(`SELECT id FROM "Invoice" WHERE id = $1`, [invId])
    expect(resBypass.rowCount).toBe(1)

    await connB.end()
    await client.end()
  }, 120000)
})