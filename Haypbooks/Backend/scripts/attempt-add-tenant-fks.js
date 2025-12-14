const { Client } = require('pg')

const toTry = [
  { table: 'TaxRate', sql: `ALTER TABLE public."TaxRate" ADD CONSTRAINT "TaxRate_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE SET NULL NOT VALID;` },
  { table: 'TaxCodeAccount', sql: `ALTER TABLE public."TaxCodeAccount" ADD CONSTRAINT "TaxCodeAccount_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;` },
  { table: 'SearchIndexingQueue', sql: `ALTER TABLE public."SearchIndexingQueue" ADD CONSTRAINT "SearchIndexingQueue_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;` },
  { table: 'SearchIndexedDoc', sql: `ALTER TABLE public."SearchIndexedDoc" ADD CONSTRAINT "SearchIndexedDoc_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;` },
  { table: 'Budget', sql: `ALTER TABLE public."Budget" ADD CONSTRAINT "Budget_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;` },
  { table: 'FixedAsset', sql: `ALTER TABLE public."FixedAsset" ADD CONSTRAINT "FixedAsset_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;` },
  { table: 'FixedAssetCategory', sql: `ALTER TABLE public."FixedAssetCategory" ADD CONSTRAINT "FixedAssetCategory_tenant_fkey" FOREIGN KEY ("tenantId") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;` }
]

async function main() {
  const connection = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
  const c = new Client({ connectionString: connection })
  await c.connect()
  for (const item of toTry) {
    try {
      console.log(`Trying ${item.table}...`)
      await c.query(item.sql)
      console.log(`SUCCESS: Added FK for ${item.table}`)
    } catch (err) {
      console.error(`FAILED for ${item.table}: ${err.message}`)
      if (err.detail) console.error('  DETAIL:', err.detail)
      if (err.hint) console.error('  HINT:', err.hint)
      if (err.code) console.error('  CODE:', err.code)
    }
  }
  await c.end()
}

main().catch(e=>{console.error(e); process.exit(1)})
