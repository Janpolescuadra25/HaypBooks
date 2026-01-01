import { test, expect } from '@playwright/test'

test('login page Sign up for free navigates to /signup?showSignup=1', async ({ page }) => {
  await page.goto('/login')
  await page.getByRole('link', { name: 'Sign up for free' }).click()
  await page.waitForURL(/\/signup\?showSignup=1/, { timeout: 10000 })

  // Either the form is shown directly or the role selection step is shown first
  const hasFirstName = await page.locator('input#firstName').count()
  if (hasFirstName === 0) {
    // role selection present — choose My Business to reveal the form
    await page.waitForSelector('button[data-testid="signup-role-business"]', { timeout: 10000 })
    await page.click('button[data-testid="signup-role-business"]')
    await page.waitForSelector('input#firstName', { timeout: 10000 })
  }

  // confirm the signup page set the intro flag
  const hasSeen = await page.evaluate(() => localStorage.getItem('hasSeenIntro'))
  expect(hasSeen).toBe('true')

  // ensure the cinematic intro did not appear for this navigation
  await expect(page.locator('text=Skip Intro (ESC)')).not.toBeVisible()
})