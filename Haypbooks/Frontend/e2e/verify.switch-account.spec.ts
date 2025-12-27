import { test, expect } from '@playwright/test'

test('switch account from verification navigates to login with email pre-filled', async ({ page }) => {
  const email = `e2e-switch-${Date.now()}@haypbooks.test`

  await page.goto(`/verify-otp?email=${encodeURIComponent(email)}&flow=signup`)

  await page.click('text=Not you? Switch account')

  await page.waitForURL(/\/login/) 

  // Ensure email input exists and is pre-filled
  await expect(page.locator('#email')).toHaveValue(email)
})