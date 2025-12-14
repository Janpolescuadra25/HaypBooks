const { Client } = require('pg')
const DEFAULT_DB = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
;(async ()=>{
  const c = new Client({ connectionString: DEFAULT_DB })
  await c.connect()
  const table = process.argv[2]
  if (!table) {
    console.error('Usage: node read-policies.js <TableName>')
    process.exit(1)
  }
  const q = `SELECT polname, pg_get_expr(polqual, polrelid) AS def FROM pg_policy WHERE polrelid = 'public."${table}"'::regclass;`
  try {
    const res = await c.query(q)
    if (res.rowCount === 0) console.log('No policies')
    else console.log(res.rows)
  } catch (err) {
    console.error(err)
  }
  await c.end()
})().catch(e=>{console.error(e); process.exit(1)})