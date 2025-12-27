import { test, expect } from '@playwright/test'

// Clicking 'Switch Account' should log the user out and land them on the Sign in form
test('switch account logs out and navigates to sign in', async ({ page }) => {
  // Seed a stored user so the selection page behaves as a signed-in user
  await page.addInitScript(() => {
    localStorage.setItem('user', JSON.stringify({ id: 'e2e-user', email: 'e2e@haypbooks.test', name: 'E2E' }))
  })

  await page.goto('/hub/selection')
  await expect(page.locator('[data-testid="switch-account"]')).toBeVisible()
  await page.getByTestId('switch-account').click()

  // Wait for success toast, then expect navigation to login (give generous timeout for slow CI)
  await expect(page.getByText(/Signed out/i)).toBeVisible({ timeout: 10000 })
  await page.waitForURL('**/login', { timeout: 10000 })
  await expect(page.locator('input#email')).toBeVisible()
})