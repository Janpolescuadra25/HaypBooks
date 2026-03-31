const { Client } = require('pg')
;(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL })
  await c.connect()
  const res = await c.query('SELECT id, "tenantId", name, "createdAt" FROM public."Company" ORDER BY "createdAt" DESC LIMIT 20')
  console.log('recent companies:')
  for (const r of res.rows) console.log(JSON.stringify(r))
  await c.end()
})().catch(e => { console.error('err', e); process.exit(2) })
