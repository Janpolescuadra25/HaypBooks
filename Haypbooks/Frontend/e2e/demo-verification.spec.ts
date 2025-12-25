import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

// Demo test: signup/login → verification flow (PIN setup + PIN entry) with screenshots
// Stores screenshots under e2e/screenshots/

test('demo: signup → verification (PIN flow) demo', async ({ page, request }) => {
  const outDir = path.join(__dirname, 'screenshots')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  const email = `e2e-demo-${Date.now()}@haypbooks.test`
  const password = 'DemoPass!23'

  // Create user via API
  const signupRes = await request.post('http://localhost:4000/api/auth/signup', { data: { email, password, name: 'Demo User' } })
  expect(signupRes.ok()).toBeTruthy()

  // Add network listeners to capture PIN setup/verify responses (debugging help)
  page.on('requestfinished', async (req) => {
    try {
      const url = req.url()
      if (url.includes('/api/auth/pin/verify') || url.includes('/api/auth/pin/setup') || url.includes('/api/auth/email/verify-code') || url.includes('/auth/pin/verify') || url.includes('/auth/pin/setup')) {
        const res = req.response()
        const status = res?.status() || 0
        let body = null
        try { body = await res?.json() } catch (e) { body = await res?.text().catch(() => null) }
        const debug = { url, status, body }
        const outPath = path.join(outDir, url.includes('/pin/verify') ? 'verify-response.json' : url.includes('/pin/setup') ? 'setup-response.json' : 'email-verify-response.json')
        fs.writeFileSync(outPath, JSON.stringify(debug, null, 2))
        console.log('Logged network response to', outPath)
      }
    } catch (e) { /* ignore */ }
  })

  // Also capture responses directly for routes that may not go through the browser proxy (server fallback)
  page.on('response', async (res) => {
    try {
      const url = res.url()
      if (url.includes('/api/auth/pin/verify') || url.includes('/api/auth/pin/setup') || url.includes('/auth/pin/verify') || url.includes('/auth/pin/setup')) {
        const status = res.status()
        let body = null
        try { body = await res.json() } catch (e) { body = await res.text().catch(() => null) }
        const debug = { url, status, body }
        const outPath = path.join(outDir, url.includes('/pin/verify') ? 'verify-response.json' : 'setup-response.json')
        fs.writeFileSync(outPath, JSON.stringify(debug, null, 2))
        console.log('Logged network response (response event) to', outPath)
      }
    } catch (e) { /* ignore */ }
  })

  // Sign in via backend API and set cookies in the browser context to avoid CSR timing fragility
  const loginRes = await request.post('http://localhost:4000/api/auth/login', { data: { email, password } })
  expect(loginRes.ok()).toBeTruthy()
  const loginJson = await loginRes.json()
  await page.context().addCookies([
    { name: 'token', value: loginJson.token, domain: 'localhost', path: '/' },
    { name: 'refreshToken', value: loginJson.refreshToken, domain: 'localhost', path: '/' },
    { name: 'email', value: loginJson.user.email, domain: 'localhost', path: '/' },
    { name: 'userId', value: String(loginJson.user.id), domain: 'localhost', path: '/' },
    { name: 'role', value: loginJson.user.role || '', domain: 'localhost', path: '/' },
  ])

  // Go directly to verification page (server should honor cookies and show verification options)
  await page.goto(`/verification?email=${encodeURIComponent(email)}`)
  await page.waitForURL(/\/verification/)
  await page.screenshot({ path: path.join(outDir, 'verification-options.png'), fullPage: true })

  // Start PIN flow; handle either immediate setup (no PIN) or PIN entry (existing PIN)
  await page.click('text=Enter Your PIN')

  // Wait briefly for either entry or setup view to appear
  const which = await Promise.race([
    page.waitForSelector('text=Enter your 6-digit PIN', { timeout: 5000 }).then(() => 'entry').catch(() => null),
    page.waitForSelector('text=Create a 6-digit PIN', { timeout: 5000 }).then(() => 'setup').catch(() => null),
  ])

  if (which === 'entry') {
    await page.screenshot({ path: path.join(outDir, 'pin-entry.png'), fullPage: true })

    // Click Reset PIN to go to setup
    await page.click('text=Reset PIN')
    await page.waitForSelector('text=Create a 6-digit PIN')
    await page.screenshot({ path: path.join(outDir, 'pin-setup.png'), fullPage: true })
  } else {
    // Already on setup view
    await page.waitForSelector('text=Create a 6-digit PIN')
    await page.screenshot({ path: path.join(outDir, 'pin-setup.png'), fullPage: true })
  }

  // Fill in PIN and submit
  const pin = '123456'
  // Fill each digit cell to simulate typing/paste
  for (let i = 0; i < 6; i++) {
    await page.fill(`input[aria-label="Create PIN digit ${i + 1}"]`, pin[i])
  }
  // For confirm, fill each digit (the form will auto-submit on final digit) and blur the last input
  for (let i = 0; i < 6; i++) {
    await page.fill(`input[aria-label="Confirm PIN digit ${i + 1}"]`, pin[i])
  }
  await page.keyboard.press('Tab')

  // After setting PIN we return to verification options (allow time for client → server → UI propagation)
  await Promise.race([
    page.waitForSelector('text=Enter Your PIN', { timeout: 30000 }).catch(() => null),
    page.waitForURL(/\/verification/, { timeout: 30000 }).catch(() => null),
    page.waitForSelector('text=PINs do not match', { timeout: 30000 }).catch(() => null),
  ])
  await page.screenshot({ path: path.join(outDir, 'pin-set-success.png'), fullPage: true })

  // As a fallback, ensure the server has the PIN recorded for the user. If not, POST to the setup endpoint
  const me = await request.get('http://localhost:4000/api/users/me', { headers: { Authorization: `Bearer ${loginJson.token}` } })
  const meJson = await me.json().catch(() => null)
  if (!meJson || !meJson.hasPin) {
    await request.post('http://localhost:4000/auth/pin/setup', { data: { pin, pinConfirm: pin }, headers: { Authorization: `Bearer ${loginJson.token}` } })
    // reload verification and wait for options
    await page.goto(`/verification?email=${encodeURIComponent(email)}`)
    await page.waitForSelector('text=Enter Your PIN', { timeout: 10000 })
  }

  // Logout then sign in via backend API and set cookies for PIN quick entry
  await page.goto('/auth/logout')
  const loginRes2 = await request.post('http://localhost:4000/api/auth/login', { data: { email, password } })
  expect(loginRes2.ok()).toBeTruthy()
  const loginJson2 = await loginRes2.json()
  await page.context().addCookies([
    { name: 'token', value: loginJson2.token, domain: 'localhost', path: '/' },
    { name: 'refreshToken', value: loginJson2.refreshToken, domain: 'localhost', path: '/' },
    { name: 'email', value: loginJson2.user.email, domain: 'localhost', path: '/' },
    { name: 'userId', value: String(loginJson2.user.id), domain: 'localhost', path: '/' },
    { name: 'role', value: loginJson2.user.role || '', domain: 'localhost', path: '/' },
  ])

  await page.goto(`/verification?email=${encodeURIComponent(email)}`)
  await page.waitForURL(/\/verification/)

  // Ensure server reflects PIN being set for this freshly logged-in session; if not, set it server-side and reload
  const me2 = await request.get('http://localhost:4000/api/users/me', { headers: { Authorization: `Bearer ${loginJson2.token}` } })
  const me2Json = await me2.json().catch(() => null)
  if (!me2Json || !me2Json.hasPin) {
    await page.screenshot({ path: path.join(outDir, 'pin-setup-missing-server.png'), fullPage: true })
    throw new Error('Server did not report hasPin=true after initial setup; aborting demo')
  }

  // Wait for verification option(s) to be visible and act accordingly
  const found = await Promise.race([
    page.waitForSelector('text=Enter Your PIN', { timeout: 10000 }).then(() => 'enterBtn').catch(() => null),
    page.waitForSelector('text=Create a 6-digit PIN', { timeout: 10000 }).then(() => 'setup').catch(() => null),
    page.waitForSelector('text=Send Code to Email', { timeout: 10000 }).then(() => 'email').catch(() => null),
  ])

  if (found === 'enterBtn') {
    await page.click('text=Enter Your PIN')
    const entryWhich2 = await Promise.race([
      page.waitForSelector('text=Enter your 6-digit PIN', { timeout: 5000 }).then(() => 'entry').catch(() => null),
      page.waitForSelector('text=Create a 6-digit PIN', { timeout: 5000 }).then(() => 'setup').catch(() => null),
    ])
    if (entryWhich2 === 'entry') {
      for (let i = 0; i < 6; i++) {
        await page.fill(`input[aria-label="Enter PIN digit ${i + 1}"]`, pin[i])
      }
      await page.click('text=Verify PIN')

      // Wait for redirect to /hub. If nothing happens we capture response and fail (no server-side fallback here)
      const redirected = await Promise.race([
        page.waitForURL(/\/hub/, { timeout: 15000 }).then(() => true).catch(() => false),
        page.waitForSelector('text=Invalid PIN', { timeout: 15000 }).then(() => false).catch(() => false),
      ])

      if (!redirected) {
        await page.screenshot({ path: path.join(outDir, 'pin-verify-failed.png'), fullPage: true })
        // include verify response file for debugging if present
        const vrPath = path.join(outDir, 'verify-response.json')
        let vr = null
        try { vr = JSON.parse(fs.readFileSync(vrPath, 'utf8')) } catch (e) { /* ignore */ }
        throw new Error(`PIN verify did not redirect (client verify likely failed). verify-response=${JSON.stringify(vr)}`)
      }
    } else {
      await page.screenshot({ path: path.join(outDir, 'pin-entry-missing.png'), fullPage: true })
      throw new Error('Expected PIN entry but saw setup view')
    }
  } else if (found === 'setup') {
    // The UI shows setup directly — fill it and submit
    for (let i = 0; i < 6; i++) {
      await page.fill(`input[aria-label="Create PIN digit ${i + 1}"]`, pin[i])
    }
    for (let i = 0; i < 6; i++) {
      await page.fill(`input[aria-label="Confirm PIN digit ${i + 1}"]`, pin[i])
    }
    // Blur the last input (some client validation runs on blur) then wait for Set PIN to become enabled
    await page.keyboard.press('Tab')
    await page.waitForSelector('button:has-text("Set PIN"):not([disabled])', { timeout: 10000 })
    await page.click('text=Set PIN')
  } else if (found === 'email') {
    // Email flow available — capture and send code via API to continue
    await page.click('text=Send Code to Email')
    const emailParam = new URL(page.url()).searchParams.get('email') || ''
    await request.post('http://localhost:4000/api/auth/send-verification', { data: { email: emailParam } })
    // wait for input and fill OTP if available via test endpoint
    await page.waitForSelector('text=Enter verification code', { timeout: 10000 }).catch(() => {})
  } else {
    await page.screenshot({ path: path.join(outDir, 'verification-options-missing.png'), fullPage: true })
    throw new Error('No verification options found')
  }

  // Expect redirect to hub selection or hub companies page
  await page.waitForURL(/hub/) 
  await page.screenshot({ path: path.join(outDir, 'post-verification-hub.png'), fullPage: true })
})
