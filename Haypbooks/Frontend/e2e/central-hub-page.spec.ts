import { test, expect } from '@playwright/test'

test('Central Hub page: shows owned companies and tabs', async ({ page, request }) => {
  const email = `ui-e2e-hub-page-${Date.now()}@haypbooks.test`
  const password = 'Playwright1!'

  const gate = await request.get('http://127.0.0.1:4000/api/test/users')
  if (gate.status() === 403) {
    test.skip(true, 'Test endpoints disabled locally; enable ALLOW_TEST_ENDPOINTS or run in CI')
    return
  }

  const createResp = await request.post('http://127.0.0.1:4000/api/test/create-user', { data: { email, password, name: 'E2E', isEmailVerified: true } })
  expect([200, 201]).toContain(createResp.status())

  const loginResp = await request.post('http://localhost:4000/api/auth/login', { data: { email, password } })
  expect(loginResp.status()).toBe(200)
  const setCookie = loginResp.headers()['set-cookie']
  const cookiePair = setCookie.split(';')[0]
  const [cookieName, cookieValue] = cookiePair.split('=')
  await page.context().addCookies([{ name: cookieName, value: cookieValue, url: 'http://127.0.0.1' }])

  // Create a company
  const company = await page.evaluate(async () => {
    const res = await fetch('/api/companies', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Hub Co (E2E)' }) })
    return res.ok ? res.json() : null
  })
  expect(company).not.toBeNull()

  await page.goto('/hub/companies')
  await expect(page).toHaveURL(/\/hub\/companies/) 

  // Owned tab should show our company
  await expect(page.locator('text=Hub Co (E2E)')).toBeVisible()
  // Switch to invited tab (should be empty)
  await page.click('button:has-text("Invited Companies")')
  await expect(page.locator('text=No invitations yet')).toBeVisible()
})
