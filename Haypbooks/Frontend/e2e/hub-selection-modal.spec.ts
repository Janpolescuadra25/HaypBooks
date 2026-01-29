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


  await page.goto('/login')

  // Fill and submit login
  await page.fill('#email', 'multi@haypbooks.test')
  await page.fill('#password', 'fake-password')
  await page.getByRole('button', { name: /sign in/i }).click()

  // Wait for hub selection (allow page or modal variant) by waiting for Enter links or the heading
  await (async () => {
    const deadline = Date.now() + 10000
    while (Date.now() < deadline) {
      // Either the page contains a heading copy, or the new anchor links are present
      if ((await page.getByRole('link', { name: /Enter Accountant Hub/i }).count()) > 0) return
      if ((await page.getByRole('link', { name: /Enter Owner Workspace/i }).count()) > 0) return
      // As a fallback, look for generic copy
      if ((await page.locator('text=Choose how').count()) > 0) return
      await page.waitForTimeout(250)
    }
    throw new Error('Hub selection did not appear within timeout')
  })()

  // Links with new labels (page variant)
  await expect(page.getByRole('link', { name: /Enter Accountant Hub/i })).toBeVisible()
  await expect(page.getByRole('link', { name: /Enter Owner Workspace/i })).toBeVisible()

  // Click accountant choice -> navigate to accountant hub (user has practice data in this fixture)
  await page.getByRole('link', { name: /Enter Accountant Hub/i }).click()
  await page.waitForURL(/\/hub\/accountant/, { timeout: 5000 })

  // (Optional) The accountant hub may show a Create Business Account flow in some envs; we do not require it here

  // Now go back to selection and choose Owner Workspace which should patch preferred hub and navigate to companies hub
  await page.goto('/workspace')
  // Choose Owner Workspace and confirm navigation to companies hub
  await page.getByRole('link', { name: /Enter Owner Workspace/i }).click()
  await page.waitForURL(/\/hub\/companies/, { timeout: 5000 })
})