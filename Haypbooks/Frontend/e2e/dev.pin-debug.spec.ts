import { test, expect } from '@playwright/test'

test.skip('dev pin debug page: signup, set pin, verify pin - SKIPPED (PIN removed)', async ({ page }) => {
  const ts = Date.now()
  const email = `dev-pin-${ts}@haypbooks.test`
  const password = 'DevPin!23'
  const pin = '121212'

  // Use 127.0.0.1 host to ensure cookies set for backend origin are sent correctly
  await page.goto(`http://127.0.0.1:3000/dev-pin-debug.html`)
  // Wait for page controls
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.fill('#pin', pin)

  // Click signup and wait for backend response
  const [signupResp] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/api/auth/signup'), { timeout: 5000 }).catch(() => null),
    page.click('#signup')
  ])
  if (!signupResp) throw new Error('Signup request not observed or timed out')
  const signupStatus = signupResp.status()
  const signupText = await signupResp.text().catch(() => '')
  // If signup didn't return 200/201, throw with helpful info
  if (!(signupStatus === 200 || signupStatus === 201)) throw new Error(`Signup returned ${signupStatus}: ${signupText}`)

  // then click login to set cookies for subsequent requests (login sets cookies server-side)
  const [loginResp] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/api/auth/login'), { timeout: 5000 }).catch(() => null),
    page.click('#login')
  ])
  if (!loginResp) throw new Error('Login request not observed or timed out')
  if (loginResp.status() !== 200) {
    const t = await loginResp.text().catch(() => '')
    throw new Error('Login failed: ' + t)
  }

  // click Set PIN, wait for log line showing "SetupPin OK"
  // Click Set PIN and verify the backend response
  const [setupResp] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/api/auth/pin/setup'), { timeout: 5000 }).catch(() => null),
    page.click('#setpin')
  ])
  const setupOk = setupResp && (setupResp.status() === 200 || setupResp.status() === 201)
  const setupBody = setupOk ? await setupResp.json().catch(() => null) : null
  if (!setupOk) throw new Error('Pin setup request failed or timed out')

  // Now Verify - send verify and confirm response
  const [verifyResp] = await Promise.all([
    page.waitForResponse((r) => r.url().includes('/api/auth/pin/verify'), { timeout: 5000 }).catch(() => null),
    page.click('#verifypin')
  ])
  const verifyOk = verifyResp && (verifyResp.status() === 200 || verifyResp.status() === 201)
  const verifyBody = verifyOk ? await verifyResp.json().catch(() => null) : null
  if (!verifyOk) throw new Error('Pin verify request failed or timed out')

  // Final check: fetch /api/users/me and assert pinSetAt or hasPin
  // Query /api/users/me from browser context so cookies are sent
  const me = await page.evaluate(async () => {
    try {
      const r = await fetch('http://127.0.0.1:4000/api/users/me', { credentials: 'include' })
      if (!r.ok) return { status: r.status }
      return await r.json()
    } catch (e) { return { error: String(e) } }
  })
  if (!me || !(me.hasPin || me.pinSetAt)) {
    throw new Error('User does not reflect hasPin/pinSetAt after setup; got: ' + JSON.stringify(me))
  }

  // Final check: /api/users/me log should include hasPin
  await page.click('#me')
  await page.waitForSelector('text=hasPin', { timeout: 5000 })
})