// Scans all user tables with a column named tenantId (or tenantId_new) and reports counts of rows
// where tenantId is not null but does not match any Tenant.id. Accepts DB URL as CLI arg.

const { Client } = require('pg')

async function main() {
  const cliArg = process.argv[2]
  const connection = cliArg || process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
  const client = new Client({ connectionString: connection })
  await client.connect()

  const tablesRes = await client.query(`
    SELECT table_schema, table_name, column_name
    FROM information_schema.columns
    WHERE column_name IN ('tenantId', 'tenantId_new')
      AND table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
    ORDER BY table_schema, table_name
  `)

  if (tablesRes.rows.length === 0) {
    console.log('No tables with tenantId or tenantId_new columns found.')
    await client.end()
    return
  }

  for (const row of tablesRes.rows) {
    const schema = row.table_schema
    const table = row.table_name
    const col = row.column_name

    try {
      const countQ = `SELECT COUNT(*) AS cnt FROM "${schema}"."${table}" t WHERE t."${col}" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public."Tenant" p WHERE p.id::text = t."${col}"::text)`
      const countRes = await client.query(countQ)
      const cnt = parseInt(countRes.rows[0].cnt, 10)
      if (cnt === 0) continue

      console.log('\n---')
      console.log(`${schema}.${table} (${col}) -> ${cnt} orphaned rows`)

      const sampleQ = `SELECT row_to_json(t) AS row FROM (SELECT * FROM "${schema}"."${table}" t WHERE t."${col}" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public."Tenant" p WHERE p.id::text = t."${col}"::text) LIMIT 5) t`
      const sampleRes = await client.query(sampleQ)
      for (const s of sampleRes.rows) console.log(JSON.stringify(s.row))

      console.log('\n-- Suggested remediation example (review before running):')
      console.log(`-- CREATE TABLE IF NOT EXISTS quarantine."${table}_orphaned_by_${col}" AS SELECT * FROM "${schema}"."${table}" WHERE 1=0;`)
      console.log(`-- INSERT INTO quarantine."${table}_orphaned_by_${col}" SELECT * FROM "${schema}"."${table}" t WHERE t."${col}" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public."Tenant" p WHERE p.id::text = t."${col}"::text);`)
      console.log(`-- DELETE FROM "${schema}"."${table}" t WHERE t."${col}" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public."Tenant" p WHERE p.id::text = t."${col}"::text);`)
    } catch (err) {
      console.error(`Error checking ${schema}.${table}:`, err.message)
    }
  }

  await client.end()
}

main().catch(e => {
  console.error('Fatal:', e.stack || e)
  process.exit(1)
})
