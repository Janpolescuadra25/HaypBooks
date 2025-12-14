const { Client } = require('pg')

const DEFAULT_DB = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'

async function main() {
  const connection = process.env.DATABASE_URL || DEFAULT_DB
  const c = new Client({ connectionString: connection })
  await c.connect()

  // Check actual column types
  const colRes = await c.query(`
    SELECT table_name, column_name, udt_name
    FROM information_schema.columns
    WHERE column_name IN ('tenantId', 'tenantId_txt', 'tenantId_uuid_old')
      AND table_schema = 'public'
    ORDER BY table_name, column_name
  `)

  console.log('\n=== Column Status ===')
  const tables = {}
  for (const r of colRes.rows) {
    if (!tables[r.table_name]) tables[r.table_name] = {}
    tables[r.table_name][r.column_name] = r.udt_name
  }
  for (const [tbl, cols] of Object.entries(tables)) {
    console.log(`${tbl}:`, cols)
  }

  // Check FK constraints on tenantId
  const fkRes = await c.query(`
    SELECT 
      tc.table_name,
      kcu.column_name,
      tc.constraint_name,
      pg_c.convalidated AS validated
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
    JOIN pg_constraint pg_c ON pg_c.conname = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name LIKE '%tenant%'
      AND tc.table_schema = 'public'
    ORDER BY tc.table_name, kcu.column_name
  `)

  console.log('\n=== FK Constraints on Tenant Columns ===')
  for (const r of fkRes.rows) {
    console.log(`${r.table_name}.${r.column_name} → ${r.constraint_name} (validated: ${r.validated})`)
  }

  await c.end()
}

main().catch(e => { console.error(e); process.exit(1) })
