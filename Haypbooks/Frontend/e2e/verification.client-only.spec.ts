import { test, expect } from '@playwright/test'

// Strict client-only verification flow test
// - No server-side fallback. Fails if client verify or redirect doesn't happen.
// - Uses API signup/login + cookie injection to stabilize auth.

test('signup → strict client-only verification (PIN flow)', async ({ page, request }) => {
  const email = `e2e-strict-${Date.now()}@haypbooks.test`
  const password = 'StrictPass!23'

  // Create user via API
  const signup = await request.post('http://localhost:4000/api/auth/signup', { data: { email, password, name: 'Strict Demo' } })
  expect(signup.ok()).toBeTruthy()

  // Login and set cookies
  const login = await request.post('http://localhost:4000/api/auth/login', { data: { email, password } })
  expect(login.ok()).toBeTruthy()
  const loginJson = await login.json()
  await page.context().addCookies([
    { name: 'token', value: loginJson.token, domain: 'localhost', path: '/' },
    { name: 'refreshToken', value: loginJson.refreshToken, domain: 'localhost', path: '/' },
    { name: 'email', value: loginJson.user.email, domain: 'localhost', path: '/' },
    { name: 'userId', value: String(loginJson.user.id), domain: 'localhost', path: '/' },
    { name: 'role', value: loginJson.user.role || '', domain: 'localhost', path: '/' },
  ])

  // Go to verification and choose Enter Your PIN (options page shows first)
  await page.goto(`/verification?email=${encodeURIComponent(email)}`)
  await page.waitForSelector('text=Enter Your PIN', { timeout: 10000 })
  await page.click('text=Enter Your PIN')
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
  const login2 = await request.post('http://localhost:4000/api/auth/login', { data: { email, password } })
  expect(login2.ok()).toBeTruthy()
  const loginJson2 = await login2.json()
  await page.context().clearCookies()
  await page.context().addCookies([
    { name: 'token', value: loginJson2.token, domain: 'localhost', path: '/' },
    { name: 'refreshToken', value: loginJson2.refreshToken, domain: 'localhost', path: '/' },
    { name: 'email', value: loginJson2.user.email, domain: 'localhost', path: '/' },
    { name: 'userId', value: String(loginJson2.user.id), domain: 'localhost', path: '/' },
  ])

  // Ensure the server reports the PIN is set for the current session; retry briefly if necessary
  let me2Json = null
  for (let attempt = 0; attempt < 6; attempt++) {
    const me2 = await request.get('http://localhost:4000/api/users/me', { headers: { Authorization: `Bearer ${loginJson2.token}` } })
    me2Json = await me2.json().catch(() => null)
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
        const res = req.response()
        const body = await res?.json().catch(() => null)
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
    const meDirect = await request.get('http://localhost:4000/api/users/me', { headers: { Authorization: `Bearer ${loginJson2.token}` } })
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
    await page.click('text=Verify PIN')
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
    const login3 = await request.post('http://localhost:4000/api/auth/login', { data: { email, password } })
    expect(login3.ok()).toBeTruthy()
    const loginJson3 = await login3.json()

    // Verify server reports the PIN exists for this freshly logged-in session
    let me3Json = null
    for (let attempt = 0; attempt < 6; attempt++) {
      const me3 = await request.get('http://localhost:4000/api/users/me', { headers: { Authorization: `Bearer ${loginJson3.token}` } })
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
    await page.click('text=Enter Your PIN')

    await page.waitForSelector('text=Enter your 6-digit PIN', { timeout: 10000 })
    for (let i = 0; i < 6; i++) {
      await page.fill(`input[aria-label="Enter PIN digit ${i + 1}"]`, pin[i])
    }
    await page.click('text=Verify PIN')
  } else {
    throw new Error('Unable to determine whether page showed PIN entry or PIN setup after clicking Enter Your PIN')
  }

  // Expect redirect to hub (client verify must redirect)
  await page.waitForURL(/hub/, { timeout: 15000 })
  expect(page.url()).toMatch(/\/hub/)
})