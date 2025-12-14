const { Client } = require('pg')
;(async function(){
  const conn = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_dev'
  const client = new Client({ connectionString: conn })
  await client.connect()
  const res = await client.query('SELECT * FROM "User" ORDER BY id DESC LIMIT 50')
  console.log('users rows ==', res.rows)
  await client.end()
})().catch(err=>{console.error(err); process.exit(1)})
