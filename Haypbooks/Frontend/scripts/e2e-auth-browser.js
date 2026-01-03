// Playwright script to exercise full browser-based auth flow: signup -> login -> refresh -> verify cookies
// Usage: node scripts/e2e-auth-browser.js --base http://localhost:3000

const { chromium } = require('playwright')

async function run() {
  const base = process.argv[2] || process.env.BASE_URL || 'http://127.0.0.1:3000'
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  const email = `play-${Date.now()}@haypbooks.test`
  const password = 'Playwright1!'

  console.log('Using base:', base)

  // Navigate to base origin so relative fetch() calls resolve correctly
  await page.goto(base, { waitUntil: 'networkidle' })

  // Use fetch in page to sign up (same-origin so Next proxy will forward to backend in dev)
  const signup = await page.evaluate(async (args) => {
    const { email, password } = args
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, name: 'E2E Play', phone: '+1 555 000 0000' }),
    })
    return { status: res.status, body: await res.json() }
  }, { base, email, password })

  console.log('signup', signup)

  // Login via fetch to ensure cookies set
  const login = await page.evaluate(async (args) => {
    const { email, password } = args
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })
    return { status: res.status, body: await res.json(), headers: Array.from(res.headers.entries()) }
  }, { email, password })

  console.log('login', login)

  // Confirm cookies present in browser context
  const cookies = await context.cookies()
  console.log('cookies', cookies)

  if (!cookies.some(c => c.name === 'refreshToken')) {
    console.error('No refreshToken cookie found after login - aborting')
    await browser.close()
    process.exit(2)
  }

  // Call refresh endpoint from page context (via Next proxy) and assert success
  const refresh = await page.evaluate(async () => {
    const res = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
    return { status: res.status, body: await (res.json().catch(() => Promise.resolve({}))) }
  })

  console.log('refresh', refresh)

  await browser.close()

  if (refresh.status !== 200) {
    console.error('Refresh failed in browser context, status=', refresh.status)
    process.exit(2)
  }

  console.log('Browser auth flow OK')
  process.exit(0)
}

run().catch(err => { console.error(err); process.exit(1) })
