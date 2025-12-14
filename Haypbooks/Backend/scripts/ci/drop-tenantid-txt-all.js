const { Client } = require('pg')
const DEFAULT_DB = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
;(async ()=>{
  const c = new Client({ connectionString: process.env.DATABASE_URL || DEFAULT_DB })
  await c.connect()
  const res = await c.query("SELECT table_name FROM information_schema.columns WHERE column_name = 'tenantId_txt' AND table_schema='public'")
  if (res.rowCount === 0) {
    console.log('No tenantId_txt columns present')
    await c.end()
    return
  }
  for (const r of res.rows) {
    const tbl = r.table_name
    process.stdout.write(`Processing ${tbl}... `)
    try {
      // Drop any FK constraints that reference this column explicitly
      const fkRes = await c.query(`SELECT conname FROM pg_constraint WHERE conrelid = (SELECT oid FROM pg_class WHERE relname = $1) AND pg_get_constraintdef(oid) ILIKE '%tenantId_txt%';`, [tbl])
      for (const fk of fkRes.rows) {
        await c.query(`ALTER TABLE public."${tbl}" DROP CONSTRAINT IF EXISTS "${fk.conname}"`)
      }
      // Drop indexes referencing the tenantId_txt
      const idxRes = await c.query(`SELECT indexname FROM pg_indexes WHERE tablename = $1 AND indexdef ILIKE '%tenantId_txt%';`, [tbl])
      for (const idx of idxRes.rows) {
        await c.query(`DROP INDEX IF EXISTS public."${idx.indexname}"`)
      }
      // Finally drop the column
      await c.query(`ALTER TABLE public."${tbl}" DROP COLUMN IF EXISTS "tenantId_txt" CASCADE`)
      console.log('OK')
    } catch (e) {
      console.error('FAILED', e.message)
    }
  }
  const remain = await c.query("SELECT table_name FROM information_schema.columns WHERE column_name = 'tenantId_txt' AND table_schema='public'")
  console.log('Remaining tenantId_txt columns:', remain.rows.map(r=>r.table_name))
  await c.end()
})().catch(e=>{ console.error(e); process.exit(1) })
