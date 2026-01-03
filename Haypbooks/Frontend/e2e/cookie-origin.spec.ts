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
  const phone = '+15550009999'
  await request.post('http://127.0.0.1:4000/api/auth/signup', { data: { email, password, name: 'Cookie E2E', phone } })

  // Navigate without cookies on `localhost` -> should show cookie hint after probe
  // (some environments scope cookies differently between localhost and 127.0.0.1)
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

  // Now open the same page at 127.0.0.1 where cookies should attach.
  await page.goto(`http://127.0.0.1:3000/verification?email=${encodeURIComponent(email)}`)
  await expect(page.locator('text=Session cookies may not be attaching for this host')).toHaveCount(0)

  // Verification UI should load (options view by default)
  await expect(page.getByTestId('option-email')).toBeVisible({ timeout: 10000 })
})