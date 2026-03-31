const { Client } = require('pg')
;(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL })
  try {
    await c.connect()
    const r = await c.query("SELECT table_name, column_name, udt_name, data_type FROM information_schema.columns WHERE column_name='tenantId' ORDER BY table_name")
    console.log(JSON.stringify(r.rows, null, 2))
    await c.end()
  } catch (e) {
    console.error(e)
    try { await c.end() } catch (er) {}
    process.exit(1)
  }
})()
