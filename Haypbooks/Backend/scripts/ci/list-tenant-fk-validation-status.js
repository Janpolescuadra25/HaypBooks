const { Client } = require('pg')

const DEFAULT_DB = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'

async function main() {
  const c = new Client({ connectionString: process.env.DATABASE_URL || DEFAULT_DB })
  await c.connect()

  const res = await c.query(`
    SELECT c.conname, c.convalidated, cls.relname as table_name, a.attname as column_name
    FROM pg_constraint c
    JOIN pg_class cls ON c.conrelid = cls.oid
    JOIN pg_attribute a ON a.attrelid = cls.oid AND a.attnum = ANY(c.conkey)
    WHERE c.contype = 'f' AND c.confrelid = (SELECT oid FROM pg_class WHERE relname = 'Tenant')
    ORDER BY cls.relname, c.conname
  `)

  console.log('Tenant FK constraints:')
  res.rows.forEach(r => console.log(`  - table=${r.table_name} constraint=${r.conname} column=${r.column_name} validated=${r.convalidated}`))

  await c.end()
}

main().catch(e => { console.error(e); process.exit(1) })
