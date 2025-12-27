const { Client } = require('pg')
;(async () => {
  const c = new Client({ connectionString: 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_test' })
  try {
    await c.connect()
    const r = await c.query("SELECT relname FROM pg_class WHERE relnamespace = 'public'::regnamespace AND relkind='r' ORDER BY relname")
    console.log('Tables:', r.rows.map(r=>r.relname))
  } catch (err) {
    console.error('Error:', err)
  } finally {
    await c.end()
  }
})()
