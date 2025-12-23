import { test, expect } from '@playwright/test'

// Ensure that when a signed-in user clicks the landing "Start" CTA, they are prompted
// and after accepting are logged out and taken to the signup flow with intro suppressed.

test('signed-in user clicking Start CTA prompts logout and proceeds to signup', async ({ page, request }) => {
  // Create a test user via test API if available, otherwise sign up via UI
  const email = `pw-user-${Date.now()}@example.com`
  const password = 'Playwright1!'

  const gate = await request.get('http://localhost:4000/api/test/users')
  if (gate.status() === 403) {
    // Test endpoints disabled locally: fallback to UI signup
    await page.goto('/signup')
    await page.getByRole('button', { name: /My Business/i }).click()
    await page.fill('#firstName', 'PW')
    await page.fill('#lastName', 'User')
    await page.fill('#companyName', 'PW Co')
    await page.fill('#email', email)
    await page.fill('#password', password)
    await page.fill('#confirmPassword', password)
    await page.getByRole('button', { name: /Create account|Create your account/i }).click()
    await Promise.race([
      page.waitForURL(/\/hub\//, { timeout: 15000 }),
      page.waitForURL(/\/onboarding\//, { timeout: 15000 }),
    ])
    // Ensure we are in hub
    await page.goto('/landing')
  } else {
    // Create user server-side for fast login
    const createResp = await request.post('http://localhost:4000/api/test/create-user', { data: { email, password, name: 'PW Test', isEmailVerified: true } })
    if (![200,201].includes(createResp.status())) throw new Error('failed to create test user')

    // Login via UI
    await page.goto('/login')
    await page.fill('input[type=email]', email)
    await page.fill('input[type=password]', password)
    await page.click('button:has-text("Sign in")')

    // Wait for hub (companies) or onboarding
    await Promise.race([
      page.waitForURL(/\/hub\//, { timeout: 15000 }),
      page.waitForURL(/\/onboarding\//, { timeout: 15000 }),
    ])

    // Now navigate to landing to click CTA from hub context
    await page.goto('/landing')
  }

  // Intercept confirm dialogs (window.confirm) and accept
  page.on('dialog', async (dialog) => {
    await dialog.accept()
  })

  // Click the Start CTA (StoryHero button)
  const btn = page.getByRole('button', { name: /Start Your Journey Free/i })
  await expect(btn).toBeVisible()

  await btn.click()

  // Wait for navigation to signup
  await page.waitForURL(/\/signup(\?.*)?/, { timeout: 5000 })

  // ensure hasSeenIntro set and cinematic intro suppressed
  const hasSeen = await page.evaluate(() => localStorage.getItem('hasSeenIntro'))
  expect(hasSeen).toBe('true')
  const introVisible = await page.locator('text=Skip Intro (ESC)').isVisible().catch(() => false)
  expect(introVisible).toBe(false)
})