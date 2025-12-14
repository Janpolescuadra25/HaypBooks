const { Client } = require('pg')
;(async function(){
  const conn = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_dev'
  const client = new Client({ connectionString: conn })
  await client.connect()
  const email = process.argv[2] || 'e2e-created-now@example.com'
  const res = await client.query('SELECT s.* FROM "Session" s JOIN "User" u ON u.id = s."userId" WHERE u.email = $1 ORDER BY s."createdAt" DESC', [email])
  console.log('sessions for', email, '==', res.rows)
  await client.end()
})().catch(err=>{console.error(err); process.exit(1)})
