const { Client } = require('pg')

async function run() {
  const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_dev'
  const client = new Client({ connectionString })
  await client.connect()
  try {
    // Create two tenants
    // Simple UUIDv4 generator (no external dependency)
    function uuidv4() { return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) { const r = Math.random()*16|0; const v = c=='x'? r : (r&0x3|0x8); return v.toString(16); }); }
    const tenantAId = uuidv4()
    const tenantBId = uuidv4()
    const now = new Date()
    // Upsert tenants to avoid duplication across runs
    let tenantA
    try {
      const ta = await client.query('INSERT INTO "Tenant" (id, name, subdomain, "createdAt", "updatedAt") VALUES($1,$2,$3,$4,$4) RETURNING id', [tenantAId, 'RLS Tenant A', 'rls-a', now])
      tenantA = ta.rows[0].id
    } catch (err) {
      if (err.code === '23505') { // unique_violation
        const ta = await client.query('SELECT id FROM "Tenant" WHERE subdomain=$1 LIMIT 1', ['rls-a'])
        tenantA = ta.rows[0].id
      } else throw err
    }

    let tenantB
    try {
      const tb = await client.query('INSERT INTO "Tenant" (id, name, subdomain, "createdAt", "updatedAt") VALUES($1,$2,$3,$4,$4) RETURNING id', [tenantBId, 'RLS Tenant B', 'rls-b', now])
      tenantB = tb.rows[0].id
    } catch (err) {
      if (err.code === '23505') {
        const tb = await client.query('SELECT id FROM "Tenant" WHERE subdomain=$1 LIMIT 1', ['rls-b'])
        tenantB = tb.rows[0].id
      } else throw err
    }

    // Create a minimal account type
    console.log('created tenants:', tenantA, tenantB)
    let typeId
    try {
      const t = await client.query("INSERT INTO \"AccountType\" (name) VALUES('RLS Test') RETURNING id")
      typeId = t.rows[0].id
    } catch (err) {
      if (err.code === '23505') {
        const t = await client.query("SELECT id FROM \"AccountType\" WHERE name='RLS Test' LIMIT 1")
        typeId = t.rows[0].id
      } else throw err
    }
    if (!typeId) {
      console.error('Failed to acquire AccountType id for RLS Test; query returned nothing')
      process.exit(1)
    }
    console.log('tenantA', tenantA, 'tenantB', tenantB, 'typeId', typeId)

    // Create an account belonging to tenantA
    // Provide explicit id and timestamps to avoid schema defaults/constraints differences
    const acctIdVal = uuidv4()
    const nowAcc = new Date()
    const acctCode = `RLS-A-${uuidv4().slice(0,8)}`
    let acctId
    try {
      const accResp = await client.query('INSERT INTO "Account" ("id", "tenantId", "code", "name", "typeId", "createdAt", "updatedAt") VALUES($1,$2,$3,$4,$5,$6,$6) RETURNING id', [acctIdVal, tenantA, acctCode, 'RLS A Account', typeId, nowAcc])
      acctId = accResp.rows[0].id
    } catch (err) {
      if (err.code === '23505') {
        const accRes = await client.query('SELECT id FROM "Account" WHERE "tenantId"=$1 AND "code"=$2 LIMIT 1', [tenantA, acctCode])
        acctId = accRes.rows[0].id
      } else throw err
    }
    console.log('acctId', acctId)
    console.log('acctId', acctId)

    // Create a non-superuser role to test RLS enforcement (superuser bypasses RLS)
    const testRole = 'rls_test_user'
    const testPass = 'rls_test_pass'
    try {
      await client.query(`CREATE ROLE ${testRole} LOGIN PASSWORD '${testPass}'`)
    } catch (e) {
      // ignore if exists
    }
    // Grant basic privileges so this role can connect/select/update the table
    const dbNameRes = await client.query('SELECT current_database() as db')
    const dbName = dbNameRes.rows[0].db
    await client.query(`GRANT CONNECT ON DATABASE "${dbName}" TO ${testRole}`)
    await client.query(`GRANT USAGE ON SCHEMA public TO ${testRole}`)
    await client.query(`GRANT SELECT, UPDATE ON TABLE "Account" TO ${testRole}`)

    // Connect as the limited role to verify RLS enforcement
    const { Client: TestClient } = require('pg')
    const url = new URL(process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_dev')
    url.username = testRole
    url.password = testPass
    const testClient = new TestClient({ connectionString: url.toString() })
    await testClient.connect()

    // As tenant A: set session and verify we can see the account
    await testClient.query(`SET hayp.tenant_id = '${tenantA}'`)
    const asA = await testClient.query('SELECT id FROM "Account" WHERE id=$1', [acctId])
    if (asA.rowCount !== 1) throw new Error('Tenant A (non-superuser) cannot see its own account')
    console.log('OK: tenant A (non-superuser) sees its account (rowCount=1)')

    // As tenant B: set session and verify we cannot see the account
    await testClient.query(`SET hayp.tenant_id = '${tenantB}'`)
    const asB = await testClient.query('SELECT id FROM "Account" WHERE id=$1', [acctId])
    if (asB.rowCount !== 0) throw new Error('Tenant B (non-superuser) can see tenant A account — RLS failed')
    console.log('OK: tenant B (non-superuser) cannot see tenant A account (rowCount=0)')

    // Attempt to update as tenant B (should affect 0 rows)
    const upd = await testClient.query('UPDATE "Account" SET name=$1 WHERE id=$2 RETURNING id', ['New Name', acctId])
    if (upd.rowCount !== 0) throw new Error('Tenant B (non-superuser) was able to update tenant A account — RLS failed')
    console.log('OK: tenant B (non-superuser) cannot update tenant A account (rowCount=0)')

    await testClient.end()

    console.log('RLS enforcement test passed')
    await client.end()
    process.exit(0)
  } catch (err) {
    console.error('RLS enforcement test failed:', err.message)
    try { await client.end() } catch (e) {}
    process.exit(1)
  }
}

run()
