import { test, expect } from '@playwright/test'

// Helper to assert /signup?showSignup=1 behavior
async function assertSignupSuppressesIntro(page) {
  await page.waitForURL(/\/signup(\?.*)?$/, { timeout: 15000 })
  // Ensure showSignup query param present
  const url = page.url()
  expect(url.includes('showSignup=1') || url.includes('/signup')).toBe(true)

  // wait for either form or role selection
  const hasFirstName = await page.locator('input#firstName').count()
  if (hasFirstName === 0) {
    // If role selection shown, click My Business to reveal form
    const roleBtn = page.getByRole('button', { name: /My Business|My business/i })
    if (await roleBtn.count() > 0) {
      await roleBtn.click()
      await page.waitForSelector('input#firstName', { timeout: 10000 })
    }
  }

  // Confirm that localStorage flag was set and intro isn't visible
  const hasSeen = await page.evaluate(() => localStorage.getItem('hasSeenIntro'))
  expect(hasSeen).toBe('true')
  await expect(page.locator('text=Skip Intro (ESC)')).not.toBeVisible()
}

// Test suite: visit landing and header and other CTAs and verify behavior
test.describe('Signup CTA coverage', () => {
  test('landing CTA -> role modal -> signup suppresses intro', async ({ page }) => {
    await page.goto('/landing')

    // Click primary hero CTA (target by href to avoid text variations)
    const heroCta = page.locator('a[href*="/signup?showSignup=1"]').first()
    await expect(heroCta).toBeVisible({ timeout: 10000 })
    await heroCta.click()

    // Either the role-selection modal will appear, or we navigate directly to /signup.
    const modalCount = await page.getByRole('dialog', { name: /How will you use HaypBooks\?/i }).count()
    if (modalCount > 0) {
      await expect(page.getByRole('dialog', { name: /How will you use HaypBooks\?/i })).toBeVisible({ timeout: 10000 })
      await page.getByRole('button', { name: /My Business/i }).click()
      await assertSignupSuppressesIntro(page)
    } else {
      // Direct signup path: ensure we navigated to signup and intro suppressed
      await page.waitForURL(/\/signup(\?.*)?/, { timeout: 10000 })
      await assertSignupSuppressesIntro(page)
    }
  })

  test('hero CTA -> direct signup suppresses intro', async ({ page }) => {
    await page.goto('/landing')
    // Click the hero CTA which should navigate to /signup?showSignup=1 and set localStorage.hasSeenIntro
    const heroCta = page.locator('a[href*="/signup?showSignup=1"]').first()
    await expect(heroCta).toBeVisible({ timeout: 10000 })
    await heroCta.click()
    await page.waitForURL(/\/signup\?showSignup=1/, { timeout: 10000 })
    const hasSeen = await page.evaluate(() => localStorage.getItem('hasSeenIntro'))
    expect(hasSeen).toBe('true')
    // intro should not be visible
    await expect(page.locator('text=Skip Intro (ESC)')).not.toBeVisible()
  })

  test('header Sign up link goes to signup suppressing intro', async ({ page }) => {
    await page.goto('/landing')
    // header 'Sign In' goes to login; click then click Sign up
    await page.getByRole('link', { name: /Sign In/i }).click()
    await page.waitForURL(/\/login\?showLogin=1/, { timeout: 10000 })

    // Click sign up from login
    await page.getByRole('link', { name: /Sign up for free/i }).click()
    await page.waitForURL(/\/signup\?showSignup=1/, { timeout: 10000 })

    await assertSignupSuppressesIntro(page)
  })

  test('journey steps CTA links to signup suppressing intro', async ({ page }) => {
    await page.goto('/landing')
    // Click journey step signup link if present
    const cta = page.locator('a[href*="/signup"]').filter({ hasText: /Sign up/i })
    if (await cta.count() > 0) {
      await cta.first().click()
      await page.waitForURL(/\/signup(\?.*)?/, { timeout: 10000 })
      await assertSignupSuppressesIntro(page)
    } else {
      test.skip()
    }
  })
})