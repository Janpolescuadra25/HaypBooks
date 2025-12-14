// Simple smoke test that expects the dev server to be running on localhost:3000
// It logs in, completes onboarding, and fetching a dashboard summary endpoint.
const { fetch } = require('undici')

const BASE = process.env.BASE_URL || 'http://localhost:3000'

function parseSetCookie(headers) {
  const out = {}
  const setCookies = headers['set-cookie'] || []
  for (const cookie of setCookies) {
    const first = cookie.split(';', 1)[0]
    const [k,v] = first.split('=')
    out[k.trim()] = v.trim()
  }
  return out
}

function cookieHeader(jar) {
  return Object.entries(jar).map(([k,v]) => `${k}=${v}`).join('; ')
}

async function run() {
  let jar = {}

  console.log('1) Logging in (mock)')
  let r = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email: 'smoke@haypbooks.test' }),
    headers: { 'Content-Type': 'application/json' },
  })
  if (r.status !== 200) throw new Error('Login failed: ' + r.status)
  jar = { ...jar, ...parseSetCookie(r.headers) }

  console.log('2) Mark onboarding complete')
  r = await fetch(`${BASE}/api/onboarding/complete`, { method: 'POST', headers: { cookie: cookieHeader(jar) } })
  if (r.status !== 200) throw new Error('Onboarding complete failed: ' + r.status)
  jar = { ...jar, ...parseSetCookie(r.headers) }

  console.log('3) Fetch dashboard summary')
  r = await fetch(`${BASE}/api/dashboard/summary`, { headers: { cookie: cookieHeader(jar) } })
  if (r.status !== 200) throw new Error('Dashboard fetch failed: ' + r.status)
  const json = await r.json()
  console.log('Dashboard summary OK:', Object.keys(json).slice(0,6))

  console.log('\n✔ Smoke test completed successfully')
}

run().catch(err => { console.error(err); process.exit(1) })
