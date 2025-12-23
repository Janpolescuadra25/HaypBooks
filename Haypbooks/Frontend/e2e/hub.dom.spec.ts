import { test, expect } from '@playwright/test'

test.describe('Central Hub (DOM smoke)', () => {
  test('renders hub layout without requiring backend', async ({ page, baseURL }) => {
    // Intercept API calls so test doesn't depend on backend availability
    await page.route('**/api/**', async (route) => {
      const url = route.request().url()
      if (url.endsWith('/api/companies/recent') || url.includes('/api/companies')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
        return
      }
      // Generic empty OK for other API calls
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) })
    })

    // Visit Hub companies page
    await page.goto('/hub/companies')

    // Expect the hub header and main elements present
    const hubHeader = page.locator('header.bg-white.border-b')
    await expect(hubHeader).toBeVisible()
    const hubMain = page.locator('main.p-8.max-w-7xl')
    await expect(hubMain).toBeVisible()
    // CompanySwitcher should be in the hub header
    await expect(hubHeader.locator('text=HaypBooks')).toBeVisible()
  })
})
