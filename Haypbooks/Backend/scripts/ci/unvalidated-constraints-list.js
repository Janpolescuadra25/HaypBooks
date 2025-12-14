const { Client } = require('pg')
const DEFAULT_DB = 'postgresql://postgres:postgres@localhost:5432/haypbooks_test'

;(async function(){
  const c = new Client({ connectionString: process.env.DATABASE_URL || DEFAULT_DB })
  await c.connect()
  const res = await c.query(`
    SELECT n.nspname, cls.relname as table_name, c.conname as constraint_name
    FROM pg_constraint c
    JOIN pg_class cls ON c.conrelid = cls.oid
    JOIN pg_namespace n ON n.oid = cls.relnamespace
    WHERE c.contype = 'f' AND c.convalidated = false
    ORDER BY cls.relname, c.conname
  `)

  const rows = res.rows
  if (rows.length === 0) {
    console.log(JSON.stringify([]))
    await c.end()
    process.exit(0)
  }

  console.log(JSON.stringify(rows))
  await c.end()
  process.exit(0)
})().catch(e=>{ console.error(e); process.exit(1) })
