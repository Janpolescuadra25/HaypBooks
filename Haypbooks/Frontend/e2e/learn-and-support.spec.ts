import { test, expect } from '@playwright/test'

test('public Learn & Support page shows landing header and hides app chrome', async ({ page }) => {
  await page.goto('/learn-and-support')

  // Page heading
  await expect(page.locator('h1')).toHaveText('Learn & Support')

  // Landing header contains Home / landing link
  await expect(page.locator('a[href="/landing"]')).toBeVisible()

  // Clicking header nav entry should navigate here (header link fix)
  await page.click('a:has-text("Learn & Support")')
  await expect(page).toHaveURL(/\/learn-and-support$/)

  // App shell elements should not be present
  await expect(page.locator('a[href="/dashboard"]')).toHaveCount(0)
  await expect(page.locator('.glass-sidebar')).toHaveCount(0)
})