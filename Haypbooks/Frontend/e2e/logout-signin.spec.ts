import { test, expect } from '@playwright/test'

const password = 'Playwright1!'

test('logout then click Sign in shows sign-in form and not redirect to hub', async ({ page, request }) => {
  const email = `e2e-logout-${Date.now()}@haypbooks.test`

  // Sign up as business
  await page.goto('/signup')
  await page.getByRole('button', { name: 'My Business' }).click()
  await page.fill('#firstName', 'E2E')
  await page.fill('#lastName', 'Logout')
  await page.fill('#companyName', 'E2E Corp')
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.fill('#confirmPassword', password)
  await page.getByRole('button', { name: 'Create account' }).click()

  // After signup, immediately perform server logout to avoid waiting for onboarding flows
  // Use Playwright request context to call the API directly so CORS/proxy rules are respected
  await request.post('/api/auth/logout')

  // Now navigate to the login page and assert it shows the signin form (no redirect to hub)
  await page.goto('/login')
  await expect(page.locator('input#email')).toBeVisible()
  await expect(page.locator('button[type="submit"]')).toHaveText(/Sign in/i)

  // Also assert we are not redirected into a hub
  expect(page.url()).not.toContain('/hub')

  // Ensure we are not auto-redirected into a hub
  expect(page.url()).not.toContain('/hub')
})