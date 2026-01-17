#!/usr/bin/env node
const { Client } = require('pg')
;(async ()=>{
  const cs = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
  const c = new Client({ connectionString: cs })
  await c.connect()
  try {
    const res = await c.query("SELECT table_name FROM information_schema.columns WHERE table_schema='public' AND column_name='tenantId_old'")
    if (!res.rows.length) {
      console.log('No tenantId_old columns found in DB')
      return
    }
    console.log('Found tenantId_old in tables:')
    for (const r of res.rows) {
      const table = r.table_name
      // check constraints referencing this column via information_schema
      const fk = await c.query(`SELECT tc.constraint_name, tc.constraint_type FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_name = kcu.table_name WHERE kcu.table_name = $1 AND kcu.column_name = 'tenantId_old'`, [table])
      const fkinfo = fk.rows.length ? fk.rows.map(x=>`${x.constraint_name}(${x.constraint_type})`).join(', ') : 'none'
      // count non-null rows
      const cnt = await c.query(`SELECT COUNT(*)::int AS c FROM public."${table}" WHERE "tenantId_old" IS NOT NULL`)
      console.log(`- ${table}: non-null rows=${cnt.rows[0].c}; constraints=${fkinfo}`)
    }
  } catch (e) { console.error(e); process.exit(1) } finally { await c.end(); }
})().catch(e=>{ console.error(e); process.exit(1) })
