const { Client } = require('pg')
;(async function(){
  const conn = 'postgresql://postgres:Ninetails45@localhost:5432/haypbooks_dev'
  const client = new Client({ connectionString: conn })
  await client.connect()
  const expires = new Date(Date.now() + 1000 * 60 * 60).toISOString() // 1 hour
  const code = Math.floor(Math.random()*1000000).toString().padStart(6,'0')
  const res = await client.query('INSERT INTO "Otp" ("email","otpCode","purpose","attempts","createdAt","expiresAt") VALUES ($1,$2,$3,$4,$5,$6) RETURNING *', ['e2e-test-validate@example.com', code, 'RESET', 0, new Date().toISOString(), expires])
  console.log('inserted otp', res.rows[0])
  await client.end()
})().catch(err=>{console.error(err); process.exit(1)})
