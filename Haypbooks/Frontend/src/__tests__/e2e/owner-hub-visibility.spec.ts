import { test, expect } from '@playwright/test'

const backend = process.env.E2E_BACKEND || 'http://127.0.0.1:4000'
const password = 'password'

test.describe('Owner Hub visibility (Playwright)', () => {
  test('Owner sees only their tenant companies (no cross-tenant leak)', async ({ page, request }) => {
    // Create two users and companies on separate tenants
    const userA = `e2e-owner-a-${Date.now()}@haypbooks.test`
    const userB = `e2e-owner-b-${Date.now()}@haypbooks.test`
    const companyA = `A Company ${Date.now()}`
    const companyB = `B Company ${Date.now()}`

    // Ensure users exist
    await request.post(`${backend}/api/test/create-user`, { data: { email: userA, password, name: 'Owner A', isEmailVerified: true } }).catch(() => null)
    await request.post(`${backend}/api/test/create-user`, { data: { email: userB, password, name: 'Owner B', isEmailVerified: true } }).catch(() => null)

    // Create a company for each user (ensures different tenant association)
    const createA = await request.post(`${backend}/api/test/create-company`, { data: { email: userA, name: companyA } }).catch(() => null)
    const createB = await request.post(`${backend}/api/test/create-company`, { data: { email: userB, name: companyB } }).catch(() => null)

    // Sanity checks for created companies
    if (!createA || !createA.ok()) throw new Error('Failed to create company A via test helper')
    if (!createB || !createB.ok()) throw new Error('Failed to create company B via test helper')

    // Login as user A via UI
    await page.goto('/login')
    await page.fill('[name="email"]', userA)
    await page.fill('[name="password"]', password)
    await page.click('text=Login')

    // If hub selection appears, ensure we enter Owner Hub (best-effort)
    const enterOwner = page.getByRole('link', { name: /Enter Owner Hub|Owner Hub/i })
    if (await enterOwner.isVisible().catch(() => false)) {
      await enterOwner.click()
    }

    // Navigate to Owner Hub companies page and wait for content
    await page.goto('/hub/companies')

    // Wait for the Owner Hub to render
    await page.waitForTimeout(500)

    // Assert: company A is visible, company B is not
    await expect(page.getByText(companyA)).toBeVisible()
    await expect(page.getByText(companyB)).not.toBeVisible()
  })
})
