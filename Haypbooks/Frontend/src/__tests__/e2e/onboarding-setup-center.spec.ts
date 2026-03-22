import { test, expect } from '@playwright/test'

async function waitForBackend(request: any, timeoutSec = 30) {
  const url = 'http://127.0.0.1:4000/api/health'
  const start = Date.now()
  while ((Date.now() - start) / 1000 < timeoutSec) {
    try {
      const res = await request.get(url)
      if (res.ok()) return
    } catch {
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

  await expect(page.locator('h1:has-text("Setup Center")')).toBeVisible({ timeout: 20000 })

  // Business Profile step
  const companyNameField = page.locator('label:has-text("Company Name")').locator('xpath=..').locator('input')
  const companyAddressField = page.locator('label:has-text("Company Address")').locator('xpath=..').locator('textarea')
  await companyNameField.fill(`Haypbooks Company ${Date.now()}`)
  await companyAddressField.fill('1234 Test St, Test City')
  await page.click('button:has-text("Save Business Profile")')
  await expect(page.locator('text=Business profile saved and marked complete.')).toBeVisible({ timeout: 10000 })

  // Ensure business profile step is marked complete
  await expect(page.locator('section:has-text("Business Profile") button:has-text("Done")')).toBeVisible({ timeout: 10000 })

  // COA seed step
  await page.click('button:has-text("Seed Default Accounts")')
  await expect(page.locator('text=Chart of Accounts has been initialized successfully.')).toBeVisible({ timeout: 10000 })

  // Mark all remaining pending steps as done for full completion
  while (await page.locator('button:has-text("Pending")').count() > 0) {
    await page.locator('button:has-text("Pending")').first().click()
  }

  // Expect auto-redirect to home dashboard after completion
  await page.waitForURL('**/home/dashboard', { timeout: 20000 })
  await expect(page).toHaveURL(/\/home\/dashboard$/)

  await expect(page.locator('button:has-text("Done")').first()).toBeVisible({ timeout: 5000 })

  const progressTextEl = page.locator('text=/\d+% complete/')
  await expect(progressTextEl).toBeVisible()

  await page.click('button:has-text("Complete Quick Setup")')
  await page.waitForResponse((r) => r.url().includes('/api/onboarding/complete') && r.status() === 200, { timeout: 10000 })

  await expect(page.locator('text=Onboarding is complete')).toBeVisible({ timeout: 10000 })

  await request.post('http://127.0.0.1:4000/api/test/delete-user', { data: { email: ownerEmail } }).catch(() => null)
})