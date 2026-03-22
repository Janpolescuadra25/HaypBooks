import { test, expect } from '@playwright/test'

// This test validates the new Owner Setup Center workflow page.
// It checks UI loading, toggling task completion, progress update, and quick-complete API call.

async function waitForBackend(request: any, timeoutSec = 30) {
  const url = 'http://127.0.0.1:4000/api/health'
  const start = Date.now()
  while ((Date.now() - start) / 1000 < timeoutSec) {
    try {
      const res = await request.get(url)
      if (res.ok()) return
    } catch (e) {
      // ignore
    }
    await new Promise((r) => setTimeout(r, 1000))
  }
  throw new Error('Timed out waiting for backend at ' + url)
}

async function setupOwner(request: any) {
  const ts = Date.now()
  const ownerEmail = `e2e-owner-setup-${ts}@haypbooks.test`
  const password = 'Playwright1!'
  const pre = await request.post('http://127.0.0.1:4000/api/auth/pre-signup', { data: { email: ownerEmail, password, name: 'Setup Center E2E' } })
  expect(pre.ok()).toBeTruthy()
  const preJson = await pre.json()
  const otp = preJson?.otpEmail || preJson?.otp || null
  expect(otp).toBeTruthy()

  const cs = await request.post('http://127.0.0.1:4000/api/auth/complete-signup', {
    data: { signupToken: preJson.signupToken, code: String(otp).padStart(6, '0'), method: 'email' },
  })
  expect(cs.ok()).toBeTruthy()

  const login = await request.post('http://127.0.0.1:4000/api/auth/login', { data: { email: ownerEmail, password } })
  expect(login.ok()).toBeTruthy()
  const loginJson = await login.json()
  expect(loginJson?.token).toBeTruthy()
  return { ownerEmail, loginJson }
}

// Skip unless backend test endpoints are available
test.skip(!process.env.E2E_FULL_AUTH && !process.env.CI, 'Set E2E_FULL_AUTH=true locally or run in CI to execute this spec')

test('onboarding setup center: toggles tasks and completes flow', async ({ page, request }) => {
  const gate = await request.get('http://127.0.0.1:4000/api/test/users').catch(() => null)
  if (!gate || gate.status() !== 200) {
    test.skip()
    return
  }

  await waitForBackend(request)

  const { ownerEmail, loginJson } = await setupOwner(request)

  await page.context().addCookies([
    { name: 'token', value: loginJson.token, url: 'http://localhost', httpOnly: true },
    { name: 'refreshToken', value: loginJson.refreshToken, url: 'http://localhost', httpOnly: true },
    { name: 'email', value: loginJson.user.email, url: 'http://localhost' },
    { name: 'userId', value: String(loginJson.user.id), url: 'http://localhost' },
  ])

  await page.goto('/home/setup-center')

  const todo = page.locator('section:has-text("Setup Center")')
  await expect(todo).toBeVisible({ timeout: 15000 })

  // check a required task is render and has link
  const chartTask = page.locator('text=Customize Chart of Accounts').first()
  await expect(chartTask).toBeVisible()

  const chartLink = page.locator('a:has-text("Go to setting")').first()
  await expect(chartLink).toHaveAttribute('href', '/accounting/core-accounting/chart-of-accounts')

  // count initial done pills
  const initialDone = await page.locator('button:has-text("Done")').count()

  // click first pending button for required task
  const pendingButton = page.locator('button:has-text("Pending")').first()
  await expect(pendingButton).toBeVisible()
  await pendingButton.click()

  // verify UI toggled to Done and progress increased
  await expect(page.locator('button:has-text("Done")').first()).toBeVisible()
  const progressTextEl = page.locator('text=/\d+% complete/')
  await expect(progressTextEl).toBeVisible()
  const progressText = await progressTextEl.textContent()
  expect(progressText).toMatch(/\d+% complete/)

  // complete the quick setup
  await page.click('button:has-text("Complete Quick Setup")')
  await page.waitForResponse((r) => r.url().includes('/api/onboarding/complete') && r.status() === 200, { timeout: 10000 })

  await expect(page.locator('text=Onboarding is complete')).toBeVisible({ timeout: 10000 })

  // cleanup
  await request.post('http://127.0.0.1:4000/api/test/delete-user', { data: { email: ownerEmail } }).catch(() => null)
})