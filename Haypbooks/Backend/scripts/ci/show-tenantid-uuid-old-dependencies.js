const { Client } = require('pg')
const DEFAULT_DB = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'

;(async ()=>{
  const c = new Client({ connectionString: DEFAULT_DB })
  await c.connect()
  const tables = ['Budget','Employee','FixedAsset','FixedAssetCategory','PaySchedule','Paycheck','PayrollRun','PayrollRunEmployee','TaxRate']
  for (const t of tables) {
    console.log('\n===', t, '===')
    const idxRes = await c.query(`SELECT indexname, indexdef FROM pg_indexes WHERE schemaname='public' AND tablename = $1 AND indexdef ILIKE '%tenantId_uuid_old%';`, [t])
    if (idxRes.rowCount > 0) {
      console.log('Indexes referencing tenantId_uuid_old:')
      idxRes.rows.forEach(r => console.log('  -', r.indexname, r.indexdef))
    } else {
      console.log('No indexes referencing tenantId_uuid_old')
    }
    const conRes = await c.query(`SELECT conname,pg_get_constraintdef(oid) as def FROM pg_constraint WHERE conrelid = (SELECT oid FROM pg_class WHERE relname = $1) AND pg_get_constraintdef(oid) ILIKE '%tenantId_uuid_old%';`, [t])
    if (conRes.rowCount > 0) {
      console.log('Constraints referencing tenantId_uuid_old:')
      conRes.rows.forEach(r => console.log('  -', r.conname, r.def))
    } else {
      console.log('No constraints referencing tenantId_uuid_old')
    }
  }
  await c.end()
})().catch(e=>{ console.error('error', e.message); process.exit(1) })
