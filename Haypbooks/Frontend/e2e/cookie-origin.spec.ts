import { test, expect } from '@playwright/test'

async function waitForBackend(request: any, timeoutSec = 30) {
  const url = 'http://127.0.0.1:4000/api/health'
  const start = Date.now()
  while ((Date.now() - start) / 1000 < timeoutSec) {
    try {
      const res = await request.get(url)
      if (res.ok()) return
    } catch (e) {}
    await new Promise((r) => setTimeout(r, 1000))
  }
  throw new Error('Timed out waiting for backend')
}

test('Shows cookie hint when cookies are not attached and clears when cookies set', async ({ page, request }) => {
  await waitForBackend(request)
  const ts = Date.now()
  const email = `e2e-cookie-${ts}@haypbooks.test`
  const password = 'CookieFlow!23'

  // Create user via API
  await request.post('http://127.0.0.1:4000/api/auth/signup', { data: { email, password, name: 'Cookie E2E' } })

  // Navigate without cookies -> should show cookie hint after probe
  await page.goto(`http://localhost:3000/verification?email=${encodeURIComponent(email)}`)
  // Wait for cookie hint (.bg-yellow-50) to appear
  await expect(page.locator('text=Session cookies may not be attaching for this host')).toBeVisible({ timeout: 10000 })

  // Now login via API and attach cookies for 127.0.0.1:3000
  const loginRes = await request.post('http://127.0.0.1:4000/api/auth/login', { data: { email, password } })
  const loginJson = await loginRes.json()
  await page.context().addCookies([
    { name: 'token', value: loginJson.token, url: 'http://127.0.0.1:3000', httpOnly: true },
    { name: 'refreshToken', value: loginJson.refreshToken, url: 'http://127.0.0.1:3000', httpOnly: true },
  ])

  // Reload and assert hint is not shown and options load
  await page.reload()
  await expect(page.locator('text=Session cookies may not be attaching for this host')).toHaveCount(0)
  await expect(page.locator('text=Enter Your PIN')).toBeVisible()
})