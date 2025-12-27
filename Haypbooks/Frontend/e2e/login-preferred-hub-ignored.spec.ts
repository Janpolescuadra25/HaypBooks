import { test, expect } from '@playwright/test'

// Verify that when a user has a preferredHub set, we still show the hub selection UI first
test('preferredHub is not auto-redirected; show hub selection first', async ({ page, request }) => {
  const email = 'pref@haypbooks.test'
  const gate = await request.get('http://localhost:4000/api/test/users')
  if (gate.status() !== 200) {
    console.log('Test endpoints disabled; skipping')
    test.skip()
    return
  }

  // Create user and set preferredHub to OWNER
  await request.post('http://localhost:4000/api/test/create-user', { data: { email, password: 'password', name: 'Pref User', isEmailVerified: true, isAccountant: true, role: 'both' } }).catch(()=>{})
  await request.post('http://localhost:4000/api/test/update-user', { data: { email, data: { preferredHub: 'OWNER', isAccountant: true, role: 'both' } } }).catch(()=>{})

  await page.goto('/login')
  await page.fill('input#email', email)
  await page.fill('input#password', 'password')
  await Promise.all([
    page.waitForNavigation({ url: '**/hub/selection', timeout: 10000 }),
    page.click('text=Sign in')
  ])

  await expect(page.locator('text=Choose how you want to use HaypBooks today')).toBeVisible()
  // Ensure we didn't automatically land on the owner's hub
  expect(page.url()).not.toMatch(/\/hub\/companies/)
})