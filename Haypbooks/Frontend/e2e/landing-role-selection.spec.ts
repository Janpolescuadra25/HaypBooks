import { test, expect } from '@playwright/test'

test('landing CTA navigates directly to signup form with role=business', async ({ page }) => {
  await page.goto('/landing')
  // Click CTA which should take user directly to signup pre-selected as business
  await page.getByRole('button', { name: /Start Your Journey Free/i }).click({ timeout: 10000 })

  // Should land on signup with role=business query param
  await page.waitForURL(/\/signup\?role=business/, { timeout: 15000 })
  expect(page.url()).toContain('/signup?role=business')

  // Ensure the signup form is visible (not the role selection prompt)
  await expect(page.getByRole('heading', { name: /Create your account/i })).toBeVisible()

  // Check expected form fields and placeholders
  await expect(page.getByLabel('First name')).toHaveAttribute('placeholder', 'Juan')
  await expect(page.getByLabel('Last name')).toHaveAttribute('placeholder', 'Dela Cruz')
  await expect(page.getByLabel('Email address')).toHaveAttribute('placeholder', /@/)
  await expect(page.getByLabel('Password')).toBeVisible()
  await expect(page.getByLabel('Confirm password')).toBeVisible()

  // Check helper text and links
  await expect(page.getByText(/Use at least 8 characters with uppercase, lowercase, and numbers/i)).toBeVisible()
  await expect(page.getByText(/Already have an account\?/i)).toBeVisible()
  await expect(page.getByRole('link', { name: /Sign in/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /Back to home/i })).toBeVisible()

  // Capture a screenshot of the signup form for visual review
  await page.screenshot({ path: 'e2e-results/signup-start-form.png', fullPage: false })
})