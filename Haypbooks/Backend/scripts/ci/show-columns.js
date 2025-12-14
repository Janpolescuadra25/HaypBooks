const { Client } = require('pg')
const DEFAULT_DB = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
;(async ()=>{
  const c = new Client({ connectionString: DEFAULT_DB })
  await c.connect()
  const table = process.argv[2]
  if (!table) {
    console.error('Usage: node show-columns.js <TableName>')
    process.exit(1)
  }

  const res = await c.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position`, [table])
  console.log(res.rows)
  await c.end()
})().catch(e=>{console.error(e); process.exit(1)})
