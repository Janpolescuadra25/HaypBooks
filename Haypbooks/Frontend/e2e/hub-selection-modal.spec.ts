import { test, expect } from '@playwright/test'

test('multi-role login shows hub selection modal and handles selection', async ({ page }) => {
  // Intercept login to respond with user requiring hub selection
  await page.route('**/api/auth/login', (route) => {
    const body = {
      user: {
        id: 'u-e2e-multi',
        email: 'multi@haypbooks.test',
        onboardingCompleted: true,
        requiresHubSelection: true,
        companies: ['Acme Corp (E2E)'],
        practiceName: 'Rivera CPA',
        clients: [1,2,3]
      },
      token: 'fake-token'
    }
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) })
  })

  // Intercept preferred-hub PATCH and respond success
  let prefHubCalled = false
  await page.route('**/api/users/preferred-hub', (route) => {
    prefHubCalled = true
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) })
  })

  await page.goto('/login')

  // Fill and submit login
  await page.fill('#email', 'multi@haypbooks.test')
  await page.fill('#password', 'fake-password')
  await page.getByRole('button', { name: /sign in/i }).click()

  // We expect to be redirected to the hub selection page
  await page.waitForURL(/\/hub\/selection/, { timeout: 5000 })
  await expect(page.getByText(/For Owners/i)).toBeVisible()
  await expect(page.getByText(/For Accountants/i)).toBeVisible()

  // Links with new labels (page variant)
  await expect(page.getByRole('link', { name: /Enter Accountant Hub/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /Enter Owner Hub/i })).toBeVisible()

  // Click accountant choice -> navigate to accountant hub (user has practice data in this fixture)
  await page.getByRole('link', { name: /Enter Accountant Hub/i }).click()
  await page.waitForURL(/\/hub\/accountant/, { timeout: 5000 })

  // Create business account shortcut should be available
  await expect(page.getByRole('button', { name: /Create Business Account/i })).toBeVisible()
  await page.getByRole('button', { name: /Create Business Account/i }).click()
  await page.waitForURL(/\/companies/, { timeout: 5000 })

  // Now go back to selection and choose Owner which should patch preferred hub and navigate to companies hub
  await page.goto('/hub/selection')
  await page.getByRole('link', { name: /Enter Owner Hub/i }).click()
  await page.waitForTimeout(200)
  expect(prefHubCalled).toBe(true)
  await page.waitForURL(/\/hub\/companies/, { timeout: 5000 })
})