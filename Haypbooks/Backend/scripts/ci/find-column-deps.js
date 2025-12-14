const { Client } = require('pg')
const DEFAULT_DB = process.env.DATABASE_URL || 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test'

;(async ()=>{
  const c = new Client({ connectionString: DEFAULT_DB })
  await c.connect()
  const tables = process.argv.slice(2).length ? process.argv.slice(2) : ['Budget']
  for (const t of tables) {
    console.log('\n== Column dependencies for', t, 'tenantId_uuid_old ==')
    const depQ = `
      SELECT dep.classid, dep.objid, dep.refobjid, dep.objsubid, dep.deptype, pc.relkind, pc.relname as refname, pn.nspname as refschema
      FROM pg_depend dep
      JOIN pg_attribute att ON att.attrelid = dep.objid AND att.attnum = dep.objsubid
      JOIN pg_class c ON c.oid = dep.objid
      LEFT JOIN pg_class pc ON dep.refobjid = pc.oid
      LEFT JOIN pg_namespace pn ON pc.relnamespace = pn.oid
      WHERE c.relname = $1 AND att.attname = 'tenantId_uuid_old'
    `
    const { rows } = await c.query(depQ, [t])
    if (rows.length === 0) {
      console.log('No dependencies found')
    } else {
      rows.forEach(r => console.log(JSON.stringify(r)))
    }
  }
  await c.end()
})().catch(e=>{ console.error(e); process.exit(1) })
