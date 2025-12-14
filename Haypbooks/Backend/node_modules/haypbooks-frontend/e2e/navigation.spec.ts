import { test, expect } from '@playwright/test'

test('navigation and primary theme variable present on developers page', async ({ page }) => {
  await page.goto('/developers')
  // Ensure the Open API Explorer CTA exists and is visible
  await expect(page.locator('text=Open API Explorer')).toBeVisible()
  // Check the CSS var on document root
  const primary = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--hb-primary').trim())
  expect(primary).toBe('#0d9488')
})
