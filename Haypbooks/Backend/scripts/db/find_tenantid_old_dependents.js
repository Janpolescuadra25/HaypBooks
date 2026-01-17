#!/usr/bin/env node
const { Client } = require('pg')
;(async ()=>{
  const cs = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
  const c = new Client({ connectionString: cs })
  await c.connect()
  try {
    const res = await c.query("SELECT table_name FROM information_schema.columns WHERE table_schema='public' AND column_name='tenantId_old'")
    for (const r of res.rows) {
      const table = r.table_name
      console.log(`\n== Dependents for ${table} ==`) 
      // constraints
      const cons = await c.query(`SELECT tc.constraint_name, tc.constraint_type, pg_get_constraintdef(con.oid) as def FROM information_schema.table_constraints tc JOIN pg_constraint con ON tc.constraint_name = con.conname WHERE tc.table_name = $1`, [table])
      if (cons.rows.length) {
        console.log('Constraints:')
        for (const cRow of cons.rows) console.log(' -', cRow.constraint_name, cRow.constraint_type, cRow.def)
      }
      // indexes that reference the column
      try {
        const idx = await c.query(`SELECT indexname, indexdef FROM pg_indexes WHERE schemaname='public' AND tablename=$1 AND indexdef ILIKE '%' || 'tenantId_old' || '%'`, [table])
        if (idx.rows.length) { console.log('Indexes:'); idx.rows.forEach(x => console.log(' -', x.indexname, x.indexdef)) }
      } catch (e) {}
      // triggers
      const trg = await c.query(`SELECT tgname, pg_get_triggerdef(t.oid) as def FROM pg_trigger t JOIN pg_class c ON t.tgrelid = c.oid WHERE c.relname = $1 AND NOT t.tgisinternal`, [table])
      if (trg.rows.length) { console.log('Triggers:'); trg.rows.forEach(x => console.log(' -', x.tgname, x.def)) }
      // views that reference the column
      const views = await c.query(`SELECT table_schema, table_name FROM information_schema.view_column_usage WHERE column_name='tenantId_old' AND table_schema='public' AND table_name IS NOT NULL`) 
      if (views.rows.length) { console.log('Views referencing column:'); views.rows.forEach(v=>console.log(' -', v.table_schema + '.' + v.table_name)) }
    }
  } catch (e) { console.error(e); process.exit(1) } finally { await c.end() }
})().catch(e=>{ console.error(e); process.exit(1) })
