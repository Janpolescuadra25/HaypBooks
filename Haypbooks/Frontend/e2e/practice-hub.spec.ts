import { test, expect } from '@playwright/test'

test('Practice Hub loads with seeded data', async ({ page, request }) => {
  const email = 'demo@haypbooks.test'
  const password = 'password'

  // Ensure user is present either via test API or UI signup fallback
  const gate = await request.get('http://localhost:4000/api/test/users')
  if (gate.status() !== 403) {
    const resp = await request.post('http://localhost:4000/api/test/create-user', {
      data: {
        email,
        password,
        name: 'Demo User',
        isEmailVerified: true,
        isAccountant: true,
      },
    })
    expect([200, 201, 409]).toContain(resp.status())
  } else {
    // fallback: create the user through signup flow when test endpoint is locked down
    await page.goto('/signup')
    await page.click('button:has-text("Accountant")')
    await page.fill('input[name="firstName"]', 'Demo')
    await page.fill('input[name="lastName"]', 'User')
    await page.fill('input[name="companyName"]', 'Demo Accounting Firm')
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    await page.fill('input[name="confirmPassword"]', password)
    await page.click('button:has-text("Create account")')

    // Onboard path may send to /hub/accountant or /workspace based on flow
    await Promise.race([
      page.waitForURL(/\/hub\/accountant/, { timeout: 30000 }),
      page.waitForURL(/\/workspace/, { timeout: 30000 }),
      page.waitForURL(/\/dashboard/, { timeout: 30000 }),
    ])

    // Reset to login route for consistency
    await page.goto('/login')
  }

  // 1) Login as demo user
  await page.goto('/login')
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button:has-text("Sign in")')

  // After login, workspace/hub page should be chosen or fallback to /workspace
  await Promise.race([
    page.waitForURL(/\/workspace/, { timeout: 30000 }),
    page.waitForURL(/\/dashboard/, { timeout: 30000 }),
    page.waitForURL(/\/hub\//, { timeout: 30000 }),
  ])

  // 2) Navigate to Practice Hub explicitly
  await page.goto('/practice-hub')

  // 3) Verify seeded practice name is visible
  await expect(page.locator('text=Demo Accounting Firm')).toBeVisible({ timeout: 30000 })

  // 4) Verify client list is not empty
  await expect(page.locator('text=No clients yet. Connect a client to see this list.')).toHaveCount(0)

  // Optionally: check section exists in dashboard
  await expect(page.locator('text=My Clients')).toBeVisible({ timeout: 15000 })

  // Confirm at least one client row appears
  await expect(page.locator('div').filter({ hasText: 'Active' }).first()).toBeVisible({ timeout: 15000 })
})