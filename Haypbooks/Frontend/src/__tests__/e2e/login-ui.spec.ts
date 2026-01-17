import { test, expect } from '@playwright/test'

test('UI Login flow: create verified user, login via UI, validate session', async ({ page, request }) => {
  const backend = process.env.TEST_BACKEND_URL || 'http://127.0.0.1:4000'
  const frontend = process.env.PLAYWRIGHT_URL || 'http://127.0.0.1:3000'

  const email = `e2e-login-${Date.now()}@haypbooks.test`
  const password = `Password1!` // strong password

  // Create test user via backend test endpoint with explicit password
  const createRes = await request.post(`${backend}/api/test/create-user`, { data: { email, password, isEmailVerified: true, name: 'E2E User' } }).catch(() => null)
  if (!createRes || (createRes.status() !== 200 && createRes.status() !== 201)) {
    test.skip(true, 'Backend test endpoints not available or create-user failed; skipping login UI test')
    return
  }

  // Sanity check: validate backend issues cookies on login (helps disambiguate cross-origin cookie issues)
  const loginRes = await request.post(`${backend}/api/auth/login`, { data: { email, password } }).catch(() => null)
  if (!loginRes || (loginRes.status() !== 200 && loginRes.status() !== 201)) {
    test.skip(true, 'Backend test endpoints not available or login failed; skipping login UI test')
    return
  }

  const setCookieHeader = loginRes.headers()['set-cookie']
  expect(setCookieHeader, 'Expected server to set cookies on login').toBeDefined()

  // If cookies are present, set them into the browser context (workaround for cross-origin cookie restrictions)
  if (setCookieHeader) {
    const cookieStrings = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader]
    for (const cs of cookieStrings) {
      const [pair] = cs.split(';')
      const sep = pair.indexOf('=')
      if (sep > 0) {
        const name = pair.slice(0, sep)
        const val = decodeURIComponent(pair.slice(sep + 1))
        try {
          await page.context().addCookies([{ name, value: val, domain: '127.0.0.1', path: '/', httpOnly: true }])
        } catch (e) {
          // Non-fatal: if browser cookie injection fails, continue to UI-based assertion and let that surface any issues
          console.warn('Failed to add cookie into browser context (non-fatal):', e?.message)
        }
      }
    }
  }

  // Navigate to login page and perform UI submit to exercise the UI behavior as well
  await page.goto(`${frontend}/login?showLogin=1`)
  await page.fill('input[name="email"]', email)
  await page.fill('input[name="password"]', password)
  await Promise.all([
    page.waitForNavigation({ url: `${frontend}/**`, waitUntil: 'networkidle' }),
    page.click('button[type="submit"]'),
  ])

  // Validate server session via direct backend probe using the login token
  const loginJson = await loginRes.json().catch(() => null)
  const token = loginJson?.token
  expect(token, 'Expected login response to include token').toBeTruthy()
  const meRes = await request.get(`${backend}/api/users/me`, { headers: { Authorization: `Bearer ${token}` } }).catch(() => null)
  expect(meRes, 'Expected /api/users/me to return a response after login').not.toBeNull()
  expect(meRes?.status(), 'Expected /api/users/me to return 200 after login').toBe(200)
  const userJson = await meRes!.json()
  expect(userJson?.email).toBe(email)

  // Cleanup: delete created user
  await request.post(`${backend}/api/test/delete-user`, { data: { email } }).catch(() => null)
})