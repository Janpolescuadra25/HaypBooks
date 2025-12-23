import { test, expect } from '@playwright/test'

test('Accountant login: selecting Accountant signs in to Accountant Hub', async ({ page, request }) => {
  const email = `acct-ui-${Date.now()}@haypbooks.test`
  const password = 'Playwright1!'

  const gate = await request.get('http://localhost:4000/api/test/users')
  let createdServerSide = false
  if (gate.status() === 403) {
    // Test endpoints disabled locally: fallback to UI signup flow
    await page.goto('/signup')
    await page.getByRole('button', { name: 'Accountant' }).click()
    await page.fill('#firstName', 'E2E')
    await page.fill('#lastName', 'Acct')
    await page.fill('#companyName', 'ACME Firm (E2E)')
    await page.fill('#email', email)
    await page.fill('#password', password)
    await page.fill('#confirmPassword', password)
    await page.getByRole('button', { name: 'Create account' }).click()
    // After signup, ensure we've reached the accountant hub
    await page.waitForURL(/\/hub\/accountant/, { timeout: 15000 })
    // Logout to prepare for the login flow (clear cookies via API)
    await page.evaluate(async () => { await fetch('/api/auth/logout', { method: 'POST' }) })
  } else {
    // Create an accountant user server-side
    const createResp = await request.post('http://localhost:4000/api/test/create-user', { data: { email, password, name: 'Acct E2E', isEmailVerified: true, isAccountant: true } })
    expect([200,201]).toContain(createResp.status())
    createdServerSide = true
  }

  await page.goto('/login')
  await page.fill('input[type=email]', email)
  await page.fill('input[type=password]', password)
  // Click accountant toggle
  await page.click('button:has-text("Accountant")')
  await page.click('button:has-text("Sign in")')

  // Expect either direct to accountant hub (if onboarding already complete) or onboarding page
  await Promise.race([
    page.waitForURL(/\/hub\/accountant/, { timeout: 15000 }),
    page.waitForURL(/\/onboarding\/accountant/, { timeout: 15000 }),
  ])

  if (page.url().includes('/onboarding/accountant')) {
    // Complete the accountant onboarding
    await page.fill('input[placeholder="Your firm name"]', 'Playwright Firm')
    await page.getByRole('button', { name: 'Finish setup' }).click()
    await page.waitForURL(/\/hub\/accountant/, { timeout: 15000 })
  }

  await expect(page.locator('text=Clients & Practice')).toBeVisible()
})
