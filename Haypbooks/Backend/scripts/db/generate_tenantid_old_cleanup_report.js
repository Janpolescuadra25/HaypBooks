#!/usr/bin/env node
const { Client } = require('pg')
const fs = require('fs')
;(async ()=>{
  const cs = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
  const c = new Client({ connectionString: cs })
  await c.connect()
  try {
    const res = await c.query("SELECT table_name FROM information_schema.columns WHERE table_schema='public' AND column_name='tenantId_old'")
    if (!res.rows.length) {
      console.log('No tenantId_old columns found in DB')
      fs.writeFileSync('tenantid_old_cleanup_report.md','No tenantId_old columns found in DB\n')
      return
    }
    const lines = ['# TenantId_old cleanup report', '', `Generated: ${new Date().toISOString()}`, '']
    lines.push('Tables with tenantId_old and suggested action:')
    lines.push('')
    for (const r of res.rows) {
      const table = r.table_name
      const cntRes = await c.query(`SELECT COUNT(*)::int AS c FROM public."${table}" WHERE "tenantId_old" IS NOT NULL`)
      const nonNull = cntRes.rows[0].c
      const consRes = await c.query(`SELECT tc.constraint_name, tc.constraint_type FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name AND tc.table_name = kcu.table_name WHERE kcu.table_name = $1 AND kcu.column_name = 'tenantId_old'`, [table])
      const constraints = consRes.rows.map(x=>`${x.constraint_name} (${x.constraint_type})`)
      const safe = (nonNull === 0 && constraints.length === 0)
      lines.push(`- **${table}**: non-null rows=${nonNull}; constraints=${constraints.length ? constraints.join(', ') : 'none'} — **${safe ? 'Safe to drop' : 'Requires manual review**'}`)
    }
    const out = lines.join('\n')
    fs.writeFileSync('tenantid_old_cleanup_report.md', out)
    console.log('Report written to tenantid_old_cleanup_report.md')
  } catch (e) { console.error(e); process.exit(1) } finally { await c.end() }
})().catch(e=>{ console.error(e); process.exit(1) })
