const { Client } = require('pg')
const DEFAULT_DB = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/haypbooks_test'
;(async ()=>{
  const c = new Client({ connectionString: DEFAULT_DB })
  await c.connect()
  const table = process.argv[2]
  const col = process.argv[3]
  if (!table || !col) { console.error('Usage: node check-column-nullability.js <TableName> <column>'); process.exit(1)}
  const res = await c.query(`SELECT column_name, is_nullable FROM information_schema.columns WHERE table_name = $1 AND column_name = $2`, [table, col])
  console.log(res.rows)
  await c.end()
})().catch(e=>{console.error(e);process.exit(1)})
