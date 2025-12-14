#!/usr/bin/env node
const { Client } = require('pg')

// Phase 2 default batch - can be overridden by editing this file or passing in ENV
const TABLES = process.env.RLS_PHASE2_TABLES ? process.env.RLS_PHASE2_TABLES.split(',') : [
  'Account','BankAccount','BankTransaction','BankReconciliation','InvoiceLine','InvoicePaymentApplication','PaymentReceived','JournalEntry','JournalEntryLine','Bill','BillLine','PurchaseOrder','PurchaseOrderLine','Customer','Vendor','VendorCredit','VendorCreditLine','StockLevel','StockLocation','Item','InventoryTransaction','InventoryTransactionLine'
]

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_dev'

async function ensure(client, sql) {
  try { await client.query(sql) } catch (e) { console.error('SQL error:', e.message); throw e }
}

async function main() {
  const client = new Client({ connectionString: DATABASE_URL })
  await client.connect()
  try {
    for (const t of TABLES) {
      console.log('Processing', t)
      // create tenant index
      await ensure(client, `CREATE INDEX IF NOT EXISTS "${t}_tenantId_idx" ON "${t}"("tenantId");`)

      // add FK if missing
      const fkRes = await client.query(`SELECT 1 FROM pg_constraint WHERE conname = $1`, [`${t}_tenantId_fkey`])
      if (fkRes.rowCount === 0) {
        try {
          await ensure(client, `ALTER TABLE \"${t}\" ADD CONSTRAINT \"${t}_tenantId_fkey\" FOREIGN KEY (\"tenantId\") REFERENCES \"Tenant\"(\"id\") ON DELETE RESTRICT ON UPDATE CASCADE`)
          console.log(`${t}: foreign key added`)
        } catch (e) { console.log(`${t}: could not add FK - ${e.message}`) }
      } else console.log(`${t}: foreign key exists`)

      // enable RLS
      const r = await client.query(`SELECT relrowsecurity FROM pg_class WHERE relname = $1`, [t])
      if (r.rows.length && !r.rows[0].relrowsecurity) {
        try { await ensure(client, `ALTER TABLE \"${t}\" ENABLE ROW LEVEL SECURITY`) ; console.log(`${t}: RLS enabled`) } catch (e) { console.log(`${t}: could not enable RLS - ${e.message}`) }
      } else console.log(`${t}: RLS already enabled or table not found`)

      // add policy if missing
      const polRes = await client.query(`SELECT 1 FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid WHERE c.relname = $1 AND p.polname = 'rls_tenant'`, [t])
      if (polRes.rowCount === 0) {
        try {
          const policySql = `CREATE POLICY rls_tenant ON \"${t}\" USING (current_setting('haypbooks.rls_bypass', true) = '1' OR \"tenantId\" = current_setting('haypbooks.tenant_id', true)) WITH CHECK (current_setting('haypbooks.rls_bypass', true) = '1' OR \"tenantId\" = current_setting('haypbooks.tenant_id', true))`
          await ensure(client, policySql)
          console.log(`${t}: policy created`)
        } catch (e) { console.log(`${t}: could not create policy - ${e.message}`) }
      } else console.log(`${t}: policy exists`)
    }
    console.log('RLS Phase 2 applied')
  } finally { await client.end() }
}

main().catch(e => { console.error(e); process.exit(1) })
