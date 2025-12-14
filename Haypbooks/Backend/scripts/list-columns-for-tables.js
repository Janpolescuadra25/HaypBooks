const { Client } = require('pg')
;(async ()=>{
  const c = new Client({connectionString: process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'})
  await c.connect()
  const tables=['Budget','Employee','FixedAsset','FixedAssetCategory','PaySchedule','Paycheck','PayrollRun','PayrollRunEmployee','TaxRate']
  for (const t of tables) {
    const res = await c.query('SELECT column_name, udt_name FROM information_schema.columns WHERE table_schema = \'public\' AND table_name = $1', [t])
    console.log('\nTable', t)
    res.rows.forEach(r => console.log(r.column_name, r.udt_name))
  }
  await c.end()
})().catch(e=>{ console.error(e); process.exit(1) })
