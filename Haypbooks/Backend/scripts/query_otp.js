const { Client } = require('pg')
;(async function(){
  const conn = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_dev'
  const client = new Client({ connectionString: conn })
  await client.connect()
  const res = await client.query('SELECT * FROM "Otp" WHERE email=$1 ORDER BY "createdAt" DESC LIMIT 1', ['e2e-test-validate@example.com'])
  console.log('latest otp ==', res.rows[0])
  await client.end()
})().catch(err=>{console.error(err); process.exit(1)})
