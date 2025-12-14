const { Client } = require('pg')

const fks = [
  'Budget_tenant_txt_fkey','Employee_tenant_txt_fkey','FixedAsset_tenant_txt_fkey','FixedAssetCategory_tenant_txt_fkey','PaySchedule_tenant_txt_fkey','Paycheck_tenant_txt_fkey','PayrollRun_tenant_txt_fkey','PayrollRunEmployee_tenant_txt_fkey','TaxRate_tenant_txt_fkey'
]

async function main() {
  const connection = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
  const c = new Client({ connectionString: connection })
  await c.connect()

  for (const fk of fks) {
    try {
      const getTableRes = await c.query(`SELECT conrelid::regclass::text AS table_name FROM pg_constraint WHERE conname = $1`, [fk])
      if (getTableRes.rowCount === 0) {
        console.log('Constraint not found:', fk)
        continue
      }
      const table = getTableRes.rows[0].table_name
      console.log('Validating', fk, 'on', table)
      await c.query(`ALTER TABLE ${table} VALIDATE CONSTRAINT "${fk}";`)
      console.log('Validated', fk)
    } catch (e) {
      console.error('Failed to validate', fk, e.message)
    }
  }

  await c.end()
}

main().catch(e=>{console.error(e); process.exit(1)})
