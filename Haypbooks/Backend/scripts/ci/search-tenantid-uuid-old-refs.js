const { Client } = require('pg')
const DEFAULT_DB = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'

;(async ()=>{
  const c = new Client({ connectionString: DEFAULT_DB })
  await c.connect()

  console.log('Searching for references to tenantId_uuid_old in views, functions, triggers, rules, and policies...')

  const checks = [
    {
      name: 'views',
      q: `SELECT table_schema||'.'||table_name AS object, view_definition as def FROM information_schema.views WHERE view_definition ILIKE '%tenantId_uuid_old%';`
    },
    {
      name: 'functions',
      q: `SELECT n.nspname||'.'||p.proname AS object, pg_get_functiondef(p.oid) as def FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid WHERE p.oid = p.oid; -- intentional no-op, fetch with safe method below`
    },
    {
      name: 'triggers',
      q: `SELECT t.tgname AS object, pg_get_triggerdef(t.oid) AS def FROM pg_trigger t WHERE pg_get_triggerdef(t.oid) ILIKE '%tenantId_uuid_old%';`
    },
    {
      name: 'rules',
      q: `SELECT r.rulename AS object, pg_get_ruledef(r.oid) as def FROM pg_rewrite r JOIN pg_class c ON r.ev_class = c.oid WHERE pg_get_ruledef(r.oid) ILIKE '%tenantId_uuid_old%';`
    },
    {
      name: 'policies',
      q: `SELECT polname AS object, pg_get_expr(polqual, polrelid) AS def FROM pg_policy WHERE pg_get_expr(polqual, polrelid) ILIKE '%tenantId_uuid_old%';`
    }
  ]

  for (const check of checks) {
    let res
    try {
      res = await c.query(check.q)
    } catch (err) {
      // For functions, try a safer approach: iterate functions and filter by pg_get_functiondef
      if (check.name === 'functions') {
        res = { rows: [] }
        const funcs = await c.query(`SELECT n.nspname, p.proname, p.oid FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid`)
        for (const f of funcs.rows) {
          try {
            const def = await c.query(`SELECT pg_get_functiondef($1) as def`, [f.oid])
            if (def.rows[0].def && def.rows[0].def.toLowerCase().includes('tenantid_uuid_old')) {
              res.rows.push({ object: `${f.nspname}.${f.proname}`, def: def.rows[0].def })
            }
          } catch (innerErr) { /* ignore function def errors */ }
        }
      } else {
        throw err
      }
    }
    if (res.rowCount === 0) {
      console.log(`- ${check.name}: no matches`)
    } else {
      console.log(`- ${check.name}:`)
      for (const r of res.rows) {
        console.log(`  - ${r.object}: ${String(r.def).slice(0, 200).replace(/\n/g, ' ')}${String(r.def).length>200?'...':''}`)
      }
    }
  }

  await c.end()
})().catch(e=>{console.error(e); process.exit(1)})
