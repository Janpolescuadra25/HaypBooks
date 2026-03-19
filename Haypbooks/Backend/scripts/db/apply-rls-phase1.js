#!/usr/bin/env node
const { Client } = require('pg')

const TABLES = ['Task', 'Attachment', 'Invoice']
const COMPANY_TABLES = ['Account', 'JournalEntry', 'JournalEntryLine']
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_dev'

async function ensure(client, sql) {
  try {
    await client.query(sql)
  } catch (e) {
    console.error('SQL error:', e.message)
    throw e
  }
}

async function hasColumn(client, table, column) {
  const res = await client.query(
    `SELECT 1 FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`,
    [table, column]
  )
  return res.rowCount > 0
}

async function main() {
  const client = new Client({ connectionString: DATABASE_URL })
  await client.connect()
  try {
    for (const t of TABLES) {
      console.log('Processing', t)
      // create tenant index if not exists
      await ensure(client, `CREATE INDEX IF NOT EXISTS "${t}_tenantId_idx" ON "${t}"("tenantId");`)

      // add FK tenantId -> Tenant(id) if not exists (check in JS to avoid $$ nesting)
      const fkRes = await client.query(`SELECT 1 FROM pg_constraint WHERE conname = $1`, [`${t}_tenantId_fkey`])
      if (fkRes.rowCount === 0) {
        await ensure(client, `ALTER TABLE \"${t}\" ADD CONSTRAINT \"${t}_tenantId_fkey\" FOREIGN KEY (\"tenantId\") REFERENCES \"Tenant\"(\"id\") ON DELETE RESTRICT ON UPDATE CASCADE`)
        console.log(`${t}: foreign key added`)
      } else {
        console.log(`${t}: foreign key exists`)
      }

      // enable RLS if not already
      const r = await client.query(`SELECT relrowsecurity FROM pg_class WHERE relname = $1`, [t])
      if (r.rows.length && !r.rows[0].relrowsecurity) {
        await ensure(client, `ALTER TABLE \"${t}\" ENABLE ROW LEVEL SECURITY`)
        console.log(`${t}: RLS enabled`)
      } else {
        console.log(`${t}: RLS already enabled or table not found`)
      }

      // add tenant policy rls_tenant if not exists (check first)
      const polRes = await client.query(`SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE c.relname = $1 AND p.polname = 'rls_tenant'`, [t])
      if (polRes.rowCount === 0) {
        const policySql = `CREATE POLICY rls_tenant ON "${t}" USING (current_setting('haypbooks.rls_bypass', true) = '1' OR ("tenantId")::text = current_setting('haypbooks.tenant_id', true)) WITH CHECK (current_setting('haypbooks.rls_bypass', true) = '1' OR ("tenantId")::text = current_setting('haypbooks.tenant_id', true))`
        await ensure(client, policySql)
        console.log(`${t}: policy created`)
      } else {
        console.log(`${t}: policy exists`)
      }

      // add workspace policy if column exists
      if (await hasColumn(client, t, 'workspaceId')) {
        const polResWs = await client.query(`SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE c.relname = $1 AND p.polname = 'rls_workspace'`, [t])
        if (polResWs.rowCount === 0) {
          const policySql = `CREATE POLICY rls_workspace ON "${t}" USING (current_setting('haypbooks.rls_bypass', true) = '1' OR ("workspaceId")::text = current_setting('haypbooks.workspace_id', true)) WITH CHECK (current_setting('haypbooks.rls_bypass', true) = '1' OR ("workspaceId")::text = current_setting('haypbooks.workspace_id', true))`
          await ensure(client, policySql)
          console.log(`${t}: workspace policy created`)
        } else {
          console.log(`${t}: workspace policy exists`)
        }
      }

      // add user policy if column exists
      if (await hasColumn(client, t, 'userId')) {
        const polResUser = await client.query(`SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE c.relname = $1 AND p.polname = 'rls_user'`, [t])
        if (polResUser.rowCount === 0) {
          const policySql = `CREATE POLICY rls_user ON "${t}" USING (current_setting('haypbooks.rls_bypass', true) = '1' OR ("userId")::text = current_setting('haypbooks.user_id', true)) WITH CHECK (current_setting('haypbooks.rls_bypass', true) = '1' OR ("userId")::text = current_setting('haypbooks.user_id', true))`
          await ensure(client, policySql)
          console.log(`${t}: user policy created`)
        } else {
          console.log(`${t}: user policy exists`)
        }
      }

      // add user-created-by policy if column exists
      if (await hasColumn(client, t, 'createdById')) {
        const polResCreatedBy = await client.query(`SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE c.relname = $1 AND p.polname = 'rls_created_by'`, [t])
        if (polResCreatedBy.rowCount === 0) {
          const policySql = `CREATE POLICY rls_created_by ON "${t}" USING (current_setting('haypbooks.rls_bypass', true) = '1' OR ("createdById")::text = current_setting('haypbooks.user_id', true)) WITH CHECK (current_setting('haypbooks.rls_bypass', true) = '1' OR ("createdById")::text = current_setting('haypbooks.user_id', true))`
          await ensure(client, policySql)
          console.log(`${t}: created-by policy created`)
        } else {
          console.log(`${t}: created-by policy exists`)
        }
      }

      console.log(`${t}: policy ensured`)
    }

    for (const t of COMPANY_TABLES) {
      console.log('Processing (company) ', t)
      // create company index if not exists
      await ensure(client, `CREATE INDEX IF NOT EXISTS "${t}_companyId_idx" ON "${t}"("companyId");`)

      // enable RLS if not already
      const r = await client.query(`SELECT relrowsecurity FROM pg_class WHERE relname = $1`, [t])
      if (r.rows.length && !r.rows[0].relrowsecurity) {
        await ensure(client, `ALTER TABLE \"${t}\" ENABLE ROW LEVEL SECURITY`)
        console.log(`${t}: RLS enabled`)
      } else {
        console.log(`${t}: RLS already enabled or table not found`)
      }

      // add company-level RLS policy if not exists
      const polRes = await client.query(`SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE c.relname = $1 AND p.polname = 'rls_company'`, [t])
      if (polRes.rowCount === 0) {
        const policySql = `CREATE POLICY rls_company ON "${t}" USING (current_setting('haypbooks.rls_bypass', true) = '1' OR ("companyId")::text = current_setting('haypbooks.company_id', true)) WITH CHECK (current_setting('haypbooks.rls_bypass', true) = '1' OR ("companyId")::text = current_setting('haypbooks.company_id', true))`
        await ensure(client, policySql)
        console.log(`${t}: company policy created`)
      } else {
        console.log(`${t}: policy exists`)
      }

      console.log(`${t}: policy ensured`)
    }

    console.log('RLS Phase 1 applied')
  } finally {
    await client.end()
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
