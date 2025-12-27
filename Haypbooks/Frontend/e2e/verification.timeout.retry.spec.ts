import { test, expect } from '@playwright/test'

// Simulate a slow /api/users/me on the first request to trigger client timeout
// Then ensure Retry recovers to setup view

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

test.skip('Enter PIN: slow /api/users/me triggers timeout and Retry recovers to setup - SKIPPED (PIN removed)', async ({ page, request }) => {
  const ts = Date.now()
  const email = `e2e-timeout-${ts}@haypbooks.test`
  const password = 'TimeoutDemo!23'

  await waitForBackend(request)

  // Create user and mark email verified and no PIN
  const signupRes = await request.post('http://127.0.0.1:4000/api/auth/signup', { data: { email, password, name: 'Timeout Demo' } })
  expect(signupRes.ok()).toBeTruthy()
  await request.post('http://127.0.0.1:4000/api/test/update-user', { data: { email, data: { isEmailVerified: true, hasPin: false } } }).catch(() => {})

  // Login via API and inject cookies
  const loginRes = await request.post('http://127.0.0.1:4000/api/auth/login', { data: { email, password } })
  expect(loginRes.ok()).toBeTruthy()
  const loginJson = await loginRes.json()
  await page.context().addCookies([
    { name: 'token', value: loginJson.token, url: 'http://localhost', httpOnly: true },
    { name: 'refreshToken', value: loginJson.refreshToken, url: 'http://localhost', httpOnly: true },
    { name: 'email', value: loginJson.user.email, url: 'http://localhost' },
    { name: 'userId', value: String(loginJson.user.id), url: 'http://localhost' },
    { name: 'token', value: loginJson.token, url: 'http://127.0.0.1', httpOnly: true },
    { name: 'refreshToken', value: loginJson.refreshToken, url: 'http://127.0.0.1', httpOnly: true },
    { name: 'email', value: loginJson.user.email, url: 'http://127.0.0.1' },
    { name: 'userId', value: String(loginJson.user.id), url: 'http://127.0.0.1' },
  ])

  // Force same-origin API calls in client
  await page.addInitScript(() => { (window as any).__API_BASE_URL = '' })

  // Instrument console + responses for debugging flaky behavior
  page.on('console', (msg) => { try { console.log('[pw]', msg.type(), msg.text()) } catch (e) {} })
  const events: any[] = []
  page.on('response', async (resp) => {
    try {
      const url = resp.url()
      if (url.includes('/api/users/me')) {
        const body = await resp.text().catch(() => '<no-body>')
        events.push({ type: 'response', url, status: resp.status(), body })
        console.log('[pw][resp]', url, resp.status())
      }
    } catch (e) {}
  })

  // Intercept /api/users/me: respond 500 on the first TWO requests (to trigger maxAttempts=2 failure),
  // then allow the next request to succeed (Retry flow should recover)
  let seen = 0
  await page.route('**/api/users/me', async (route) => {
    seen++
    console.log('[pw][route] users.me intercepted, count=', seen)
    if (seen <= 2) {
      await route.fulfill({
        status: 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'simulated transient failure' })
      })
    } else {
      await route.continue()
    }
  })

  // Navigate with small timeout and two attempts so initial click fails and shows Retry
  await page.goto(`/verification?email=${encodeURIComponent(email)}&verification_timeout=500&verification_attempts=2`)

  // Navigate with small timeout and single attempt so first slow call times out
  await page.goto(`/verification?email=${encodeURIComponent(email)}&verification_timeout=500&verification_attempts=1`)

  // Click Enter Your PIN
  const enter = page.locator('button:has-text("Enter Your PIN")')
  await enter.waitFor({ state: 'visible', timeout: 10000 })
  await enter.click()

  // Click Enter Your PIN unless the page already showed setup/entry immediately
  const enterBtnCount = await page.locator('button:has-text("Enter Your PIN")').count()
  if (enterBtnCount > 0) {
    await page.locator('button:has-text("Enter Your PIN")').click()
  }
  // Wait for either outcome (setup or entry) within 20s
  await Promise.race([
    page.waitForSelector('text=Create a 6-digit PIN', { timeout: 20000 }),
    page.waitForSelector('text=Enter your 6-digit PIN', { timeout: 20000 }),
  ])

  // Assert we reached setup (preferred deterministic path for this test)
  await expect(page.locator('text=Create a 6-digit PIN')).toBeVisible({ timeout: 20000 })

  // Sanity-check: the deterministic state indicator should show view:setup
  await page.waitForFunction(() => {
    const el = document.querySelector('[data-testid="verification-state"]')
    return el && el.textContent && el.textContent.includes('view:setup')
  }, { timeout: 5000 })

  // Success: the client recovered from transient failures and reached the setup flow
  await page.screenshot({ path: `e2e/screenshots/verification-timeout-recovered-${ts}.png`, fullPage: true })

})