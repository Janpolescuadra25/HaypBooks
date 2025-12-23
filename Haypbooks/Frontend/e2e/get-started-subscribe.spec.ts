import { test, expect } from '@playwright/test'

// Smoke test: landing on plans, clicking Get Started with Plans, verify navigation to subscribe flow

test('plans -> subscribe 3-step flow shows tabs and hides app chrome', async ({ page }) => {
  await page.goto('/get-started/plans')
  await page.click('text=Get Started with Plans')
  await expect(page).toHaveURL(/get-started\/subscribe/)
  await expect(page.locator('text=Step 1: Choose Your Plan')).toHaveCount(1)
  await expect(page.locator("text=Select the plan that fits your business. Payment will be processed in the next steps.")).toHaveCount(1)

  // Plans page should show both CTAs side-by-side with an "or" separator
  await page.goto('/get-started/plans')
  await expect(page.getByRole('button', { name: 'Get Started with Plans' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Start free trial' })).toBeVisible()
  await expect(page.locator('text=or')).toHaveCount(1)

  // Emulate mobile viewport and ensure stacked buttons and sticky trial CTA present
  await page.setViewportSize({ width: 375, height: 812 })
  await expect(page.getByRole('button', { name: 'Get Started with Plans' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Start free trial' })).toBeVisible()
  await expect(page.locator('a[aria-label="Start free trial"]').nth(0)).toBeVisible()
  // reset viewport
  await page.setViewportSize({ width: 1280, height: 800 })

  // Go to Step 2 and assert billing copy
  await page.click('text=Continue')
  await expect(page.locator('text=Step 2: Billing Details')).toHaveCount(1)
  await expect(page.locator("text=Add your payment method securely. Your card will be charged today after confirmation.")).toHaveCount(1)

  // Proceed to Step 3 and assert Review & Purchase header and Confirm purchase CTA
  await page.click('text=Continue')
  await expect(page.locator('text=Step 3: Review & Purchase')).toHaveCount(1)
  await expect(page.getByRole('button', { name: 'Confirm purchase' })).toHaveCount(1)

  // Check monetary amounts reflect immediate payment for the selected plan (default Growth $49)
  await expect(page.locator('text=Plan cost')).toHaveCount(1)
  await expect(page.locator('text=$49.00')).toHaveCount(1)
  await expect(page.locator('text=Total due today')).toHaveCount(1)
  await expect(page.locator('text=$49.00')).toHaveCount(1)
  await expect(page.locator("text=Your card will be charged $49 today. You can cancel anytime.")).toHaveCount(1)

  // Ensure no trial-specific text is present
  await expect(page.locator('text=after trial')).toHaveCount(0)
  await expect(page.locator('text=30-day')).toHaveCount(0)

  // App chrome should be hidden for public pages
  await expect(page.locator('.glass-topbar')).toHaveCount(0)
  await expect(page.locator('.glass-sidebar')).toHaveCount(0)
})