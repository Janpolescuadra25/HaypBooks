const { Client } = require('pg')
const DEFAULT_DB = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/haypbooks_test'

;(async ()=>{
  const table = process.argv[2]
  if (!table) {
    console.error('Usage: node list-triggers-for-table.js <TableName>')
    process.exit(1)
  }
  const c = new Client({ connectionString: DEFAULT_DB })
  await c.connect()
  const q = `SELECT t.tgname AS name, pg_get_triggerdef(t.oid) as def FROM pg_trigger t JOIN pg_class c ON t.tgrelid = c.oid WHERE c.relname = $1;`
  const res = await c.query(q, [table])
  if (res.rowCount === 0) {
    console.log('No triggers found for table', table)
  } else {
    for (const r of res.rows) {
      console.log('---', r.name, '---')
      console.log(r.def)
    }
  }
  await c.end()
})().catch(e=>{console.error(e); process.exit(1)})
