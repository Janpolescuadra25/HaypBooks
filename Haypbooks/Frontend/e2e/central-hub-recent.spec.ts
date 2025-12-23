import { test, expect } from '@playwright/test'

test('Central Hub: CompanySwitcher updates last-accessed and ordering', async ({ page, request }) => {
  const email = `ui-e2e-central-${Date.now()}@haypbooks.test`
  const password = 'Playwright1!'

  // If test endpoints are disabled locally, skip this test (CI enables them)
  const gate = await request.get('http://127.0.0.1:4000/api/test/users')
  if (gate.status() === 403) {
    test.skip(true, 'Test endpoints disabled locally; enable ALLOW_TEST_ENDPOINTS or run in CI')
    return
  }

  // Create a verified test user server-side (skip OTP for stability) and then login via the UI
  const createResp = await request.post('http://127.0.0.1:4000/api/test/create-user', { data: { email, password, name: 'E2E', isEmailVerified: true } })
  expect([200, 201]).toContain(createResp.status())

  // Confirm user exists via test endpoint
  const userResp = await request.get(`http://127.0.0.1:4000/api/test/user?email=${encodeURIComponent(email)}`)
  const createdUser = await userResp.json()
  expect(createdUser).not.toBeNull()

  // Programmatically login via the backend to obtain the session cookie, then attach it to the browser context
  const loginResp = await request.post('http://127.0.0.1:4000/api/auth/login', { data: { email, password } })
  // If login fails, surface server response body for debugging
  if (loginResp.status() !== 200) {
    const text = await loginResp.text()
    console.error('Login failed:', loginResp.status(), text)
  }
  expect(loginResp.status()).toBe(200)
  const setCookie = loginResp.headers()['set-cookie']
  expect(setCookie).toBeTruthy()

  // Parse the first cookie name/value and attach to context (sufficient for session cookie)
  const cookiePair = setCookie.split(';')[0]
  const [cookieName, cookieValue] = cookiePair.split('=')
  await page.context().addCookies([{ name: cookieName, value: cookieValue, url: 'http://localhost' }])

  // Confirm authenticated endpoint now returns 200
  const probe = await page.evaluate(async () => {
    const r = await fetch('/api/companies/recent')
    return r.status
  })
  expect(probe).toBe(200)

  await page.goto('/dashboard')

  // Create two additional companies via the authenticated browser context
  const companyA = await page.evaluate(async () => {
    const res = await fetch('/api/companies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'A Co (E2E)' }) })
    return res.ok ? res.json() : null
  })
  expect(companyA).not.toBeNull()

  const companyB = await page.evaluate(async () => {
    const res = await fetch('/api/companies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'B Co (E2E)' }) })
    return res.ok ? res.json() : null
  })
  expect(companyB).not.toBeNull()

  // Ensure companyA is last-accessed first so we have deterministic ordering
  await page.evaluate(async (id) => {
    await fetch(`/api/companies/${id}/last-accessed`, { method: 'PATCH' })
  }, companyA.id)

  // Navigate to dashboard and open company switcher
  await page.goto('/dashboard')
  await page.click('button[title="Switch company"]')
  await page.waitForSelector('#company-switcher')

  // Assert the first recent entry is company A
  const items = page.locator('#company-switcher button')
  await expect(items.first()).toContainText('A Co (E2E)')

  // Prepare to capture the PATCH request when we click company B
  const patchReqPromise = page.waitForRequest((req) => req.url().includes('/last-accessed') && req.method() === 'PATCH')

  // Click company B to visit it
  await items.nth(1).click()

  // Wait for navigation to include the company id
  await page.waitForURL(new RegExp(`.*dashboard.*company=${companyB.id}`))

  // Ensure PATCH request fired for company B
  const patchReq = await patchReqPromise
  expect(patchReq).toBeTruthy()
  expect(patchReq.url()).toContain(`/api/companies/${companyB.id}/last-accessed`)

  // After navigation, open switcher again and assert B is now first
  await page.click('button[title="Switch company"]')
  await page.waitForSelector('#company-switcher')
  await expect(items.first()).toContainText('B Co (E2E)')
})