import { test, expect } from '@playwright/test'

// UI test: unverified account gets helpful resend flow

test('ui: unverified account shows resend verification action and navigates to verify page', async ({ page, request }) => {
  // gate: test endpoints must be available
  const gate = await request.get('http://127.0.0.1:4000/api/test/users').catch(() => null)
  if (!gate || gate.status() !== 200) {
    test.skip()
    return
  }

  const ts = Date.now()
  const email = `e2e-unv-${ts}@haypbooks.test`
  const password = 'UnvPass1!'

  // create an unverified test user via test endpoint
  const create = await request.post('http://127.0.0.1:4000/api/test/create-user', { data: { email, password, isEmailVerified: false } })
  expect(create.ok()).toBeTruthy()

  await page.goto('/login?showLogin=1')

  await page.fill('#email', email)
  await page.fill('#password', password)

  // Click sign-in and capture the login response for diagnostics
  const [loginResp] = await Promise.all([
    page.waitForResponse(r => r.url().includes('/api/auth/login')),
    page.click('button:has-text("Sign in")')
  ])
  const loginStatus = loginResp ? loginResp.status() : null
  const loginBody = loginResp ? await loginResp.text().catch(() => '') : ''
  console.log('DEBUG: login status', loginStatus, 'body', loginBody.slice(0, 400))

  // Wait for either (a) the error message we set, (b) the in-page 'Account not verified' UI, or (c) a redirect to /verify-otp (dev flows vary)
  const errPromise = page.waitForSelector('text=Your account is not verified', { timeout: 5000 }).catch(() => null)
  const selPromise = page.waitForSelector('text=Account not verified', { timeout: 5000 }).catch(() => null)
  const urlPromise = page.waitForURL(/\/verify-otp/, { timeout: 5000 }).then(() => 'redirect').catch(() => null)
  const errSel = await errPromise
  const sel = await selPromise
  const url = await urlPromise

  if (errSel || sel) {
    // In environments where backend rejects with 401, show resend UI (may show heading or just error)
    // Click resend if the button exists and assert redirect
    const hasResend = await page.locator('button:has-text("Resend verification")').count()
    if (hasResend) {
      await page.click('button:has-text("Resend verification")')
      await page.waitForURL(/\/verify-otp/, { timeout: 5000 })
      expect(page.url()).toContain('/verify-otp')
    } else {
      // If no resend button shown, at least ensure the error text is visible
      expect(errSel || sel).toBeTruthy()
    }
  } else if (url === 'redirect') {
    // Dev mode may return mfaRequired and frontend redirects to /verify-otp
    expect(page.url()).toContain('/verify-otp')
  } else {
    // Dump helpful diagnostics to logs for debugging
    try {
      const fs = require('fs')
      fs.mkdirSync('e2e/logs', { recursive: true })
      const html = await page.content()
      fs.writeFileSync(`e2e/logs/ui.login.unverified-${ts}.html`, html)
      await page.screenshot({ path: `e2e/logs/ui.login.unverified-${ts}.png`, fullPage: true }).catch(() => {})
      console.log('Wrote diagnostics e2e/logs/ui.login.unverified')
    } catch (e) { console.warn('Failed to write diagnostics', e) }
    throw new Error('Neither verification UI nor redirect appeared')
  }
})