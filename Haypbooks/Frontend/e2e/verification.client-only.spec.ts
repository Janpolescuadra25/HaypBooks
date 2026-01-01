import { test, expect } from '@playwright/test'

// Strict client-only verification flow test
// - No server-side fallback. Fails if client verify or redirect doesn't happen.
// - Uses API signup/login + cookie injection to stabilize auth.

async function waitForBackend(request: any, timeoutSec = 30) {
  const url = 'http://127.0.0.1:4000/api/health'
  const start = Date.now()
  while ((Date.now() - start) / 1000 < timeoutSec) {
    try {
      const res = await request.get(url)
      if (res.ok()) return
    } catch (e) {
      // ignore and retry
    }
    await new Promise((r) => setTimeout(r, 1000))
  }
  throw new Error('Timed out waiting for backend at ' + url)
}

test.skip('signup → strict client-only verification (PIN flow) - SKIPPED (PIN removed)', async ({ page, request }) => {
  const email = `e2e-strict-${Date.now()}@haypbooks.test`
  const password = 'StrictPass!23'

  // Wait for backend to be ready (forces IPv4 to avoid ::1 issues)
  await waitForBackend(request)

  // Create user via API
  const phone = '+15550009999'
  const signup = await request.post('http://127.0.0.1:4000/api/auth/signup', { data: { email, password, name: 'Strict Demo', phone } })
  expect(signup.ok()).toBeTruthy()

  // Login and set cookies
  const login = await request.post('http://127.0.0.1:4000/api/auth/login', { data: { email, password } })
  expect(login.ok()).toBeTruthy()
  const loginJson = await login.json()
  await page.context().addCookies([
    { name: 'token', value: loginJson.token, url: 'http://localhost', httpOnly: true },
    { name: 'refreshToken', value: loginJson.refreshToken, url: 'http://localhost', httpOnly: true },
    { name: 'email', value: loginJson.user.email, url: 'http://localhost' },
    { name: 'userId', value: String(loginJson.user.id), url: 'http://localhost' },
    { name: 'role', value: loginJson.user.role || '', url: 'http://localhost' },
    // Also set cookies for 127.0.0.1 for robustness
    { name: 'token', value: loginJson.token, url: 'http://127.0.0.1', httpOnly: true },
    { name: 'refreshToken', value: loginJson.refreshToken, url: 'http://127.0.0.1', httpOnly: true },
    { name: 'email', value: loginJson.user.email, url: 'http://127.0.0.1' },
    { name: 'userId', value: String(loginJson.user.id), url: 'http://127.0.0.1' },
    { name: 'role', value: loginJson.user.role || '', url: 'http://127.0.0.1' },
  ])

  // Ensure client uses same-origin API for deterministic cookie behavior
  await page.addInitScript(() => { (window as any).__API_BASE_URL = '' })

  // Go to verification and choose Enter Your PIN (options page shows first)
  await page.goto(`/verification?email=${encodeURIComponent(email)}`)
  await page.waitForSelector('text=Enter Your PIN', { timeout: 10000 })
  const enterBtn = page.locator('button:has-text("Enter Your PIN")')
  await enterBtn.waitFor({ state: 'visible', timeout: 10000 })
  await enterBtn.click()
  await page.waitForSelector('text=Create a 6-digit PIN', { timeout: 10000 })

  // Fill create + confirm and rely on auto-submit on last confirm input
  const pin = '222222'
  for (let i = 0; i < 6; i++) {
    await page.fill(`input[aria-label="Create PIN digit ${i + 1}"]`, pin[i])
  }
  for (let i = 0; i < 6; i++) {
    await page.fill(`input[aria-label="Confirm PIN digit ${i + 1}"]`, pin[i])
  }

  // Wait for UI to return to verification options explicitly
  await page.waitForSelector('text=Enter Your PIN', { timeout: 15000 })

  // Logout then re-login to exercise login-time flags
  await page.goto('/auth/logout')
  const login2 = await request.post('http://127.0.0.1:4000/api/auth/login', { data: { email, password } })
  expect(login2.ok()).toBeTruthy()
  const loginJson2 = await login2.json()
  await page.context().clearCookies()
  await page.context().addCookies([
    { name: 'token', value: loginJson2.token, url: 'http://localhost', httpOnly: true },
    { name: 'refreshToken', value: loginJson2.refreshToken, url: 'http://localhost', httpOnly: true },
    { name: 'email', value: loginJson2.user.email, url: 'http://localhost' },
    { name: 'userId', value: String(loginJson2.user.id), url: 'http://localhost' },
  ])

  // Ensure the server reports the PIN is set for the current session; retry briefly if necessary
  let me2Json: any = null
  for (let attempt = 0; attempt < 6; attempt++) {
const me = await request.get('http://127.0.0.1:4000/api/users/me', { headers: { Authorization: `Bearer ${loginJson2.token}` } })
    me2Json = await me.json().catch(() => null)
    if (me2Json && me2Json.hasPin) break
    // wait 500ms and retry
    await page.waitForTimeout(500)
  }
  if (!me2Json || !me2Json.hasPin) {
    throw new Error('Server did not report hasPin=true for user after setup within timeout')
  }

  // Capture the /api/users/me response used by the client to decide view and console logs
  let meResponseBody: any = null
  page.on('requestfinished', async (req) => {
    try {
      const url = req.url()
      if (url.includes('/api/users/me')) {
        const res = await req.response()
        const body = res ? await res.json().catch(() => null) : null
        meResponseBody = body
        console.log('Captured /api/users/me via page requestfinished:', body)
      }
    } catch (e) { /* ignore */ }
  })
  page.on('console', (msg) => {
    // Print client-side logs so we can see the debug output from the verification page
    console.log('[page console]', msg.type(), msg.text())
  })

  // Navigate to verification and assert Enter Your PIN is shown
  await page.goto(`/verification?email=${encodeURIComponent(email)}`)
  await page.waitForSelector('text=Enter Your PIN', { timeout: 10000 })

  // Force a reload to ensure the page loads with the latest cookies/session
  await page.reload()
  await page.waitForSelector('text=Enter Your PIN', { timeout: 10000 })
  await page.waitForTimeout(500)

  // If the page didn't fetch /api/users/me in the browser, fall back to checking server state directly for diagnostics
  if (!meResponseBody) {
    const meDirect = await request.get('http://127.0.0.1:4000/api/users/me', { headers: { Authorization: `Bearer ${loginJson2.token}` } })
    const meDirectJson = await meDirect.json().catch(() => null)
    if (!meDirectJson || !meDirectJson.hasPin) {
      throw new Error('Server did not report hasPin=true for user after setup (direct check): ' + JSON.stringify(meDirectJson))
    }
  } else if (!meResponseBody.hasPin) {
    throw new Error('Client GET /api/users/me on initial load did not report hasPin=true (meResponse=' + JSON.stringify(meResponseBody) + ')')
  }

  await page.click('text=Enter Your PIN')

  // Decide which view we hit (entry vs setup) and handle accordingly
  const whichAfterClick = await Promise.race([
    page.waitForSelector('text=Enter your 6-digit PIN', { timeout: 5000 }).then(() => 'entry').catch(() => null),
    page.waitForSelector('text=Create a 6-digit PIN', { timeout: 5000 }).then(() => 'setup').catch(() => null),
  ])

  if (whichAfterClick === 'entry') {
    // Fill PIN and verify
    for (let i = 0; i < 6; i++) {
      await page.fill(`input[aria-label="Enter PIN digit ${i + 1}"]`, pin[i])
    }
    // Wait for Verify button to become attached. If enabled, click; otherwise treat navigation as success (auto-submit case)
    const verifyBtn = page.locator('button:has-text("Verify PIN")')
    const attached = await Promise.race([
      verifyBtn.waitFor({ state: 'attached', timeout: 10000 }).then(() => true).catch(() => false),
      page.waitForURL(/hub/, { timeout: 10000 }).then(() => false).catch(() => false),
    ])
    if (attached) {
      const enabled = await verifyBtn.isEnabled().catch(() => false)
      if (enabled) {
        await verifyBtn.click()
      } else {
        // Button disabled likely due to auto-submit or immediate redirect; wait for hub navigation
        await page.waitForURL(/hub/, { timeout: 10000 }).catch(() => {})
      }
    } else {
      // Already redirected; proceed
    }
  } else if (whichAfterClick === 'setup') {
    // Complete setup then re-login and perform verify
    for (let i = 0; i < 6; i++) {
      await page.fill(`input[aria-label="Create PIN digit ${i + 1}"]`, pin[i])
    }
    for (let i = 0; i < 6; i++) {
      await page.fill(`input[aria-label="Confirm PIN digit ${i + 1}"]`, pin[i])
    }
    await page.waitForSelector('text=Enter Your PIN', { timeout: 15000 })

    await page.goto('/auth/logout')
    const login3 = await request.post('http://127.0.0.1:4000/api/auth/login', { data: { email, password } })
    expect(login3.ok()).toBeTruthy()
    const loginJson3 = await login3.json()

    // Verify server reports the PIN exists for this freshly logged-in session
    let me3Json: any = null
    for (let attempt = 0; attempt < 6; attempt++) {
      const me3 = await request.get('http://127.0.0.1:4000/api/users/me', { headers: { Authorization: `Bearer ${loginJson3.token}` } })
      me3Json = await me3.json().catch(() => null)
      if (me3Json && me3Json.hasPin) break
      await new Promise((r) => setTimeout(r, 500))
    }
    if (!me3Json || !me3Json.hasPin) {
      throw new Error('Server did not report hasPin=true after completing setup (login3 check): ' + JSON.stringify(me3Json))
    }

    await page.context().clearCookies()
    await page.context().addCookies([
      { name: 'token', value: loginJson3.token, domain: 'localhost', path: '/' },
      { name: 'refreshToken', value: loginJson3.refreshToken, domain: 'localhost', path: '/' },
      { name: 'email', value: loginJson3.user.email, domain: 'localhost', path: '/' },
      { name: 'userId', value: String(loginJson3.user.id), domain: 'localhost', path: '/' },
    ])

    await page.goto(`/verification?email=${encodeURIComponent(email)}`)
    await page.waitForSelector('text=Enter Your PIN', { timeout: 10000 })
    const enterBtn3 = page.locator('button:has-text("Enter Your PIN")')
    await enterBtn3.waitFor({ state: 'visible', timeout: 10000 })
    await enterBtn3.click()

    await page.waitForSelector('text=Enter your 6-digit PIN', { timeout: 10000 })
    for (let i = 0; i < 6; i++) {
      await page.fill(`input[aria-label="Enter PIN digit ${i + 1}"]`, pin[i])
    }
    const verifyBtn = page.locator('button:has-text("Verify PIN")')
    await verifyBtn.waitFor({ state: 'attached', timeout: 10000 })
    const enabled = await verifyBtn.isEnabled().catch(() => false)
    if (enabled) {
      await verifyBtn.click()
    } else {
      await page.waitForURL(/hub/, { timeout: 10000 }).catch(() => {})
    }
  } else {
    throw new Error('Unable to determine whether page showed PIN entry or PIN setup after clicking Enter Your PIN')
  }

  // Expect redirect to hub (client verify must redirect)
  await page.waitForURL(/hub/, { timeout: 15000 })
  await page.waitForSelector('text=My Companies', { timeout: 10000 })
  await page.waitForSelector('text=My Practice', { timeout: 10000 })
  expect(page.url()).toMatch(/\/hub/)
})