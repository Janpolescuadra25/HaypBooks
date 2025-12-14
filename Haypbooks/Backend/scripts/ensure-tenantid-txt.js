const { Client } = require('pg')

const tables = [
  'Budget','Employee','FixedAsset','FixedAssetCategory','PaySchedule','Paycheck','PayrollRun','PayrollRunEmployee','TaxRate'
]

async function main() {
  const connection = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
  const c = new Client({ connectionString: connection })
  await c.connect()

  for (const t of tables) {
    try {
      console.log('Processing', t)
      await c.query(`ALTER TABLE public."${t}" ADD COLUMN IF NOT EXISTS "tenantId_txt" text;`)
      await c.query(`UPDATE public."${t}" SET "tenantId_txt" = "tenantId"::text WHERE "tenantId" IS NOT NULL;`)
      await c.query(`CREATE INDEX IF NOT EXISTS ${t.toLowerCase()}_tenantid_txt_idx ON public."${t}" ("tenantId_txt");`)
      const fkName = `${t}_tenant_txt_fkey`
      const exists = await c.query(`SELECT 1 FROM pg_constraint WHERE conname = $1`, [fkName])
      if (exists.rowCount === 0) {
        await c.query(`ALTER TABLE public."${t}" ADD CONSTRAINT "${fkName}" FOREIGN KEY ("tenantId_txt") REFERENCES public."Tenant" ("id") ON DELETE RESTRICT NOT VALID;`)
        console.log('Added FK', fkName)
      } else {
        console.log('FK exists', fkName)
      }
    } catch (e) {
      console.error('Error processing', t, e.message)
    }
  }

  await c.end()
}

main().catch(e=>{console.error(e); process.exit(1)})
