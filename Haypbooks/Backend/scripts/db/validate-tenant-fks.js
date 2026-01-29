// Attempts to VALIDATE NOT VALID foreign key constraints that reference tenantId
// For constraints that cannot be validated, prints sample offending rows and suggested remediation SQL.

const { Client } = require('pg')

async function main() {
  const cliArg = process.argv[2]
  const connection = cliArg || process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
  const client = new Client({ connectionString: connection })
  await client.connect()

  const q = `
SELECT n.nspname as schema, c.relname as table, pc.conname, pa.attname as child_col
FROM pg_constraint pc
JOIN pg_class c ON pc.conrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
CROSS JOIN LATERAL unnest(pc.conkey) WITH ORDINALITY AS ck(attnum, ord)
JOIN pg_attribute pa ON pa.attrelid = pc.conrelid AND pa.attnum = ck.attnum
WHERE pc.convalidated = false
  AND pc.contype = 'f'
  AND pa.attname IN ('tenantId', 'tenantId_new')
ORDER BY n.nspname, c.relname
  `

  const res = await client.query(q)
  if (res.rows.length === 0) {
    console.log('No NOT VALID tenant FK constraints found.')
    await client.end()
    return
  }

  for (const r of res.rows) {
    const schema = r.schema
    const table = r.table
    const conname = r.conname
    const col = r.child_col

    console.log('\n---')
    console.log(`Constraint: ${conname}  Table: ${schema}.${table}  Column: ${col}`)

    // Skip if the relation does not exist in this DB (helps local/staging where not all tables are present)
    const existsRes = await client.query(`SELECT EXISTS(SELECT 1 FROM pg_class c JOIN pg_namespace n ON c.relnamespace = n.oid WHERE n.nspname = $1 AND c.relname = $2) as exists`, [schema, table])
    if (!existsRes.rows[0].exists) {
      console.log(`Skipping ${schema}.${table} — relation does not exist in this database.`)
      continue
    }

    // Try to validate
    try {
      const qi = s => s.replace(/"/g, '""')
      const alterSql = `ALTER TABLE "${qi(schema)}"."${qi(table)}" VALIDATE CONSTRAINT "${conname.replace(/"/g, '""')}"`
      await client.query(alterSql)
      console.log(`Validated constraint ${conname} on ${schema}.${table}`)
      continue
    } catch (err) {
      console.error(`Could not validate ${conname}: ${err.message}`)
    }

    // Fetch sample offending rows (where tenant not found)
    const sampleQuery = `SELECT row_to_json(t) AS row FROM (SELECT * FROM ${schema}."${table}" t WHERE t."${col}" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public."Tenant" p WHERE p.id::text = t."${col}"::text) LIMIT 20) t`
    try {
      const sample = await client.query(sampleQuery)
      if (sample.rows.length === 0) {
        console.log('No sample offending rows found (rows may be present but not visible due to row-level security or other constraints).')
      } else {
        console.log('Sample offending rows (up to 20):')
        for (const s of sample.rows) {
          console.log(JSON.stringify(s.row))
        }
      }
    } catch (err) {
      console.error('Error fetching sample rows:', err.message)
    }

    // Suggest remediation SQL (safe, manual review required)
    const remediation = `-- Suggested remediation (REVIEW BEFORE RUNNING):\n-- 1) Review offending rows:\nSELECT * FROM ${schema}."${table}" t WHERE t."${col}" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public."Tenant" p WHERE p.id::text = t."${col}"::text) LIMIT 100;\n\n-- 2) Possible fixes (pick one after review):\n-- a) Delete orphaned rows (destructive):\n-- DELETE FROM ${schema}."${table}" t WHERE t."${col}" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public."Tenant" p WHERE p.id::text = t."${col}"::text);\n\n-- b) Move to quarantine table for manual inspection:\n-- CREATE TABLE IF NOT EXISTS quarantine."${table}_orphaned_by_${col}" AS SELECT * FROM ${schema}."${table}" WHERE 1=0;\n-- INSERT INTO quarantine."${table}_orphaned_by_${col}" SELECT * FROM ${schema}."${table}" t WHERE t."${col}" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public."Tenant" p WHERE p.id::text = t."${col}"::text);\n-- DELETE FROM ${schema}."${table}" t WHERE t."${col}" IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public."Tenant" p WHERE p.id::text = t."${col}"::text);\n\n-- c) Assign a valid tenantId if you can map (non-trivial).` 

    console.log(remediation)
  }

  await client.end()
}

main().catch(e => {
  console.error('Fatal:', e.stack || e)
  process.exit(1)
})
