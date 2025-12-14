const { Client } = require('pg')
const DEFAULT_DB = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
;(async ()=>{
  const c = new Client({ connectionString: DEFAULT_DB })
  await c.connect()
  const res = await c.query(`SELECT p.polname, n.nspname AS schema_name, c.relname AS table_name, pg_get_expr(p.polqual, p.polrelid) AS qual, pg_get_expr(p.polwithcheck, p.polrelid) AS withcheck FROM pg_policy p JOIN pg_class c ON p.polrelid = c.oid JOIN pg_namespace n ON c.relnamespace = n.oid WHERE (pg_get_expr(p.polqual, p.polrelid) ILIKE '%tenantId_uuid_old%') OR (pg_get_expr(p.polwithcheck, p.polrelid) ILIKE '%tenantId_uuid_old%')`) 
  if (res.rowCount === 0) {
    console.log('No policies to alter')
    await c.end()
    return
  }
  for (const r of res.rows) {
    const newQual = r.qual ? r.qual.replace(/tenantId_uuid_old/g, 'tenantId') : null
    const newWith = r.withcheck ? r.withcheck.replace(/tenantId_uuid_old/g, 'tenantId') : null
    console.log(`Altering policy ${r.polname} on ${r.schema_name}.${r.table_name}`)
    const policyNameQuoted = '"' + r.polname.replace(/"/g, '""') + '"'
    const tableNameQuoted = '"' + r.table_name.replace(/"/g, '""') + '"'
    const schemaQuoted = '"' + r.schema_name.replace(/"/g, '""') + '"'
    try {
      if (newQual && newQual.trim()) {
        if (newWith && newWith.trim()) {
          await c.query(`ALTER POLICY ${policyNameQuoted} ON ${schemaQuoted}.${tableNameQuoted} USING (${newQual}) WITH CHECK (${newWith})`)
        } else {
          await c.query(`ALTER POLICY ${policyNameQuoted} ON ${schemaQuoted}.${tableNameQuoted} USING (${newQual})`)
        }
        console.log(`Altered ${r.polname}`)
      } else {
        console.log(`No usable qual for ${r.polname}, dropping instead`)
        await c.query(`DROP POLICY IF EXISTS ${policyNameQuoted} ON ${schemaQuoted}.${tableNameQuoted}`)
      }
    } catch (err) {
      console.error(`Failed to alter/dorp policy ${r.polname} on ${r.schema_name}.${r.table_name}:`, err.message || err)
    }
  }
  await c.end()
})().catch(e=>{ console.error(e); process.exit(1) })
