const fetch = require('node-fetch')
;(async () => {
  const base = process.env.BACKEND_URL || 'http://localhost:4000'
  const res = await fetch(base + '/api/test/create-company', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'e2e.owner+fix@test.local', name: 'Test Company Inc' }) })
  console.log('status', res.status)
  console.log(await res.text())
})().catch(e => { console.error('err', e); process.exit(2) })
