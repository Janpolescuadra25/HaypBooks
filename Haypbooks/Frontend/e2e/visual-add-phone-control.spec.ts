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

// Visual regression test for AddPhoneForm control across breakpoints
// This test navigates to the verification page for a fresh test user with no phone, opens
// the phone add form and captures a screenshot of the control on desktop and mobile.

test.describe('Visual: AddPhoneForm control', () => {
  test('desktop - form control matches baseline', async ({ page, request }) => {
    await waitForBackend(request)

    // Gate: ensure backend test endpoints are enabled
    const gate = await request.get('http://127.0.0.1:4000/api/test/users').catch(() => null)
    if (!gate || gate.status() !== 200) {
      test.skip()
      return
    }

    const email = `e2e-visual-add-phone-${Date.now()}@haypbooks.test`
    const password = 'Passw0rd!'

    // Ensure an account exists and is email-verified so verification UI is reachable
    await request.post('http://127.0.0.1:4000/api/test/create-user', { data: { email, password, name: 'Visual Add Phone', isEmailVerified: true } }).catch(() => null)

    // Sign in so we can reach the verification page (ensures session/cookie present)
    await page.goto(`/login?showLogin=1&email=${encodeURIComponent(email)}`)
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="password"]', password)
    await page.click('button:has-text("Sign in")')

    // After sign-in we should be redirected to verification (or hub); ensure the verification query is present
    await page.waitForURL(/verification|hub|hub\/selection/, { timeout: 5000 })
    // If we were not redirected to verification automatically, navigate to it explicitly
    if (!/verification/.test(page.url())) {
      await page.goto(`/verification?email=${encodeURIComponent(email)}`)
    }

    await page.waitForSelector('button[data-testid="option-phone"]', { timeout: 5000 })

    // Click phone option to show AddPhoneForm
    await page.click('button[data-testid="option-phone"]')
    await page.waitForSelector('label:text("Phone number")')

    const el = page.locator('div.p-4.border.rounded-lg')
    await expect(el).toBeVisible()

    // Disable animations and capture a focused screenshot
    await expect(el).toHaveScreenshot('add-phone-desktop.png', { animations: 'disabled' })
  })

  test.use({ viewport: { width: 390, height: 844 }, isMobile: true })
  test('mobile - form control matches baseline', async ({ page, request }) => {
    await waitForBackend(request)

    const gate = await request.get('http://127.0.0.1:4000/api/test/users').catch(() => null)
    if (!gate || gate.status() !== 200) {
      test.skip()
      return
    }

    const email = `e2e-visual-add-phone-${Date.now()}@haypbooks.test`
    const password = 'Passw0rd!'

    await request.post('http://127.0.0.1:4000/api/test/create-user', { data: { email, password, name: 'Visual Add Phone', isEmailVerified: true } }).catch(() => null)

    // Sign in first to ensure session is established
    await page.goto(`/login?showLogin=1&email=${encodeURIComponent(email)}`)
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="password"]', password)
    await page.click('button:has-text("Sign in")')
    await page.waitForURL(/verification|hub|hub\/selection/, { timeout: 5000 })
    if (!/verification/.test(page.url())) {
      await page.goto(`/verification?email=${encodeURIComponent(email)}`)
    }

    await page.waitForSelector('button[data-testid="option-phone"]', { timeout: 5000 })
    await page.click('button[data-testid="option-phone"]')
    await page.waitForSelector('label:text("Phone number")')

    const el = page.locator('div.p-4.border.rounded-lg')
    await expect(el).toBeVisible()
    await expect(el).toHaveScreenshot('add-phone-mobile.png', { animations: 'disabled' })
  })
})
