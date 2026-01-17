#!/usr/bin/env node
const { Client } = require('pg')
;(async ()=>{
  const cs = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
  const c = new Client({ connectionString: cs })
  await c.connect()
  try {
    const res = await c.query("SELECT table_name FROM information_schema.columns WHERE table_schema='public' AND column_name='tenantId_old'")
    const tables = res.rows.map(r=>r.table_name)
    for (const table of tables) {
      const cntRes = await c.query(`SELECT COUNT(*)::int AS c FROM public."${table}" WHERE "tenantId_old" IS NOT NULL`)
      const nonNull = cntRes.rows[0].c
      const consRes = await c.query(`SELECT tc.constraint_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_name = kcu.table_name WHERE kcu.table_name = $1 AND kcu.column_name = 'tenantId_old'`, [table])
      if (nonNull === 0 && consRes.rows.length === 0) {
        try {
          await c.query(`ALTER TABLE public."${table}" DROP COLUMN IF EXISTS "tenantId_old"`)
          console.log(`Dropped tenantId_old from ${table}`)
        } catch (e) {
          console.warn(`Failed to drop tenantId_old from ${table}:`, e.message)
        }
      } else {
        console.log(`Skipping ${table} (nonNull=${nonNull}, constraints=${consRes.rows.length})`)
      }
    }
    console.log('Safe drops complete')
  } catch (e) { console.error(e); process.exit(1) } finally { await c.end() }
})().catch(e=>{ console.error(e); process.exit(1) })
