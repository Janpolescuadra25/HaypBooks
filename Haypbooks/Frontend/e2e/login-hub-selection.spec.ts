import { test, expect } from '@playwright/test'

// Ensure that a multi-role user lands on hub selection and sees both hub cards
test('after sign-in shows hub selection with two hubs', async ({ page, request }) => {
  // Create or ensure a demo user who is both an owner and accountant
  const email = 'demo@haypbooks.test'
  // For this test, use the test backend create-user endpoint to ensure the user exists
  // Ensure demo user exists and set them to be both an owner and accountant
  // Gate: ensure backend test endpoints are enabled; if not, skip the integrated assertions
  const gate = await request.get('http://localhost:4000/api/test/users')
  if (gate.status() !== 200) {
    console.log('Test endpoints are disabled on backend; skipping integrated hub-selection test. Enable ALLOW_TEST_ENDPOINTS to run full integration.')
    test.skip()
    return
  }

  // Prepare demo user: create and ensure multi-role (owner + accountant) with no preferredHub
  await request.post('http://localhost:4000/api/test/create-user', { data: { email, password: 'password', name: 'Demo User', isEmailVerified: true, isAccountant: true, role: 'both' } }).catch(()=>{})
  await request.post('http://localhost:4000/api/test/update-user', { data: { email, data: { isAccountant: true, role: 'both', preferredHub: null } } }).catch(()=>{})

  // Quick backend check: call login directly to inspect whether server marks requiresHubSelection
  const loginResp = await request.post('http://localhost:4000/api/auth/login', { data: { email, password: 'password' } })
  const loginJson = await loginResp.json()
  // Helpful debug if the server doesn't indicate hub selection
  if (!loginJson.user || !loginJson.user.requiresHubSelection) {
    console.log('DEBUG: login response user:', JSON.stringify(loginJson.user || {}))
  }
  expect(loginJson.user?.requiresHubSelection).toBeTruthy()

  await page.goto('/login')
  await page.fill('input#email', email)
  await page.fill('input#password', 'password')
  await Promise.all([
    page.waitForNavigation({ url: '**/hub/selection', timeout: 10000 }),
    page.click('text=Sign in')
  ])

  // Assertions: hub selection page visible with both cards
  await expect(page.locator('text=Choose how you want to use HaypBooks today')).toBeVisible()
  await expect(page.locator('text=My Companies')).toBeVisible()
  await expect(page.locator('text=My Practice')).toBeVisible()
  // The hub selection page intentionally omits the global 'Central Hub' header so the two-card choice stays focused
  await expect(page.locator('text=Central Hub')).not.toBeVisible()
  await expect(page.getByRole('link', { name: /Enter Owner Hub/ })).toBeVisible()
  await expect(page.getByRole('link', { name: /Enter Accountant Hub/ })).toBeVisible()

  // Click Owner and confirm backend persistence + navigation
  await page.getByRole('link', { name: /Enter Owner Hub/ }).click()
  await page.waitForURL(/\/hub\/companies/, { timeout: 5000 })
  // Backend: confirm preferredHub set
  const userResp = await request.get(`http://localhost:4000/api/test/user?email=${encodeURIComponent(email)}`)
  const userJson = await userResp.json()
  expect(userJson.preferredHub === 'OWNER' || userJson.preferredHub === 'owner').toBeTruthy()

})