import { test, expect } from '@playwright/test'

test('header Sign In link opens login form (showLogin=1) and not redirect', async ({ page }) => {
  await page.goto('/landing')
  // new header links
  await expect(page.getByRole('link', { name: /For accountants and bookkeepers/i })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Pricing' })).toBeVisible()

  await page.getByRole('link', { name: 'Sign In' }).click()
  await page.waitForURL(/\/login\?showLogin=1/, { timeout: 10000 })
  // login form visible
  await expect(page.locator('input#email')).toBeVisible()
})

test('pricing page shows landing header (no accounting sidebar) and top links', async ({ page }) => {
  await page.goto('/pricing')
  // header should still be present on pricing
  await expect(page.getByRole('link', { name: /For accountants and bookkeepers/i })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Pricing' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Sign In' })).toBeVisible()

  // the pricing hero should be visible and not hidden under the header
  await expect(page.getByRole('heading', { name: /Pricing Plans that scale with your business/i })).toBeVisible()

  // visiting the public accountants page should show the landing header
  await page.goto('/accountants')
  await expect(page.getByRole('heading', { name: /Accountants & Bookkeepers/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /For accountants and bookkeepers/i })).toBeVisible()
})