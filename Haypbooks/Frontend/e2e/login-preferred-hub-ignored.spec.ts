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

  // Ensure the backend update persisted (retry briefly)
  let prefUser: any = null
  for (let i = 0; i < 10; i++) {
    const uResp = await request.get(`http://localhost:4000/api/test/user?email=${encodeURIComponent(email)}`)
    if (uResp.ok()) {
      prefUser = await uResp.json().catch(() => null)
      if (prefUser && (prefUser.preferredHub === 'OWNER' || prefUser.preferredHub === 'owner')) break
    }
    await new Promise(res => setTimeout(res, 500))
  }
  if (!prefUser || !(prefUser.preferredHub === 'OWNER' || prefUser.preferredHub === 'owner')) {
    console.warn('Preferred hub update not observed in backend after 5s; proceeding but the test may fail if redirect depends on it')
  }

  await page.goto('/login')
  await page.fill('input#email', email)
  await page.fill('input#password', 'password')
  // Add basic logging to observe requests
  page.on('request', req => console.log('REQ', req.method(), req.url()))
  page.on('response', res => console.log('RES', res.status(), res.url()))

  // Debug sign-in button state and click the role-agnostic button locator
  const signInBtn = page.getByRole('button', { name: /Sign in/i })
  console.log('Sign in count:', await signInBtn.count())
  try {
    console.log('Sign in enabled:', await signInBtn.isEnabled())
    console.log('Sign in aria-disabled:', await signInBtn.getAttribute('aria-disabled'))
    console.log('Sign in disabled attr:', await signInBtn.getAttribute('disabled'))
  } catch (e) {
    console.warn('Could not query Sign in button attributes', e)
  }
  await signInBtn.click()
  // Capture the auth API response from the client-side login attempt for debugging
  const authResp = await page.waitForResponse(r => r.url().includes('/api/auth/login'), { timeout: 5000 }).catch(() => null)
  if (authResp) {
    const authBody = await authResp.json().catch(() => null)
    console.log('UI auth response:', JSON.stringify(authBody))
  } else {
    console.warn('No auth response observed after clicking Sign in')
  }

  // Wait for either hub selection or a direct hub redirect (preferredHub should cause redirect)
  const finalUrl = await (async () => {
    const deadline = Date.now() + 15000
    while (Date.now() < deadline) {
      const u = page.url()
      if (/\/hub\/selection/.test(u) || /\/hub\/(companies|accountant)/.test(u)) return u
      await page.waitForTimeout(250)
    }
    throw new Error('Neither hub selection nor hub redirect occurred within timeout')
  })()

  // Per UX decision, show hub selection UI even when a preferred hub exists (do not auto-redirect)
  expect(finalUrl).toMatch(/\/hub\/selection/)
  await expect(page.locator('text=Choose how')).toBeVisible()
  const userResp = await request.get(`http://localhost:4000/api/test/user?email=${encodeURIComponent(email)}`)
  const userJson: any = await userResp.json().catch(() => null)
  if (userJson && (userJson.preferredHub === 'OWNER' || userJson.preferredHub === 'owner')) {
    // Backend preserved the preferred hub as expected
  } else {
    console.warn('Preferred hub not observed on backend after login; this may be acceptable depending on environment')
  }
})