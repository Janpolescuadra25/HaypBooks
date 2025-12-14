const { Client } = require('pg')
const DEFAULT_DB = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'
;(async function(){
  const c = new Client({ connectionString: process.env.DATABASE_URL || DEFAULT_DB })
  await c.connect()
  const res = await c.query(`
    SELECT c.conname as constraint_name, cls.relname as table_name
    FROM pg_constraint c
    JOIN pg_class cls ON c.conrelid = cls.oid
    WHERE c.contype = 'f' AND c.convalidated = false
      AND c.confrelid = (SELECT oid FROM pg_class WHERE relname = 'Tenant')
    ORDER BY cls.relname
  `)
  if (res.rowCount === 0) {
    console.log('No unvalidated tenant FK constraints found')
    await c.end()
    return
  }

  for (const r of res.rows) {
    const sql = `ALTER TABLE public."${r.table_name.replace(/"/g,'')}" VALIDATE CONSTRAINT "${r.constraint_name}";`
    console.log('Running:', sql)
    try {
      await c.query(sql)
      console.log('Validated:', r.constraint_name)
    } catch (e) {
      console.error('Failed to validate:', r.constraint_name, e.message)
    }
  }
  await c.end()
})().catch(e=>{ console.error(e); process.exit(1) })
