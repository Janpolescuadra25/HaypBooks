import { test, expect } from '@playwright/test'

// This test signs up a new user, captures the dev OTP returned by the backend
// in non-production mode, navigates to the verify OTP screen, enters the OTP via
// the UI and asserts successful navigation into onboarding/hub.

test('signup -> verify otp (dev flow)', async ({ page, request, browserName }) => {
  const email = `e2e-ui-verify-${Date.now()}@haypbooks.test`
  const password = 'Verify1!'

  // Create a user via standard signup API (dev returns _devOtp) and generate a deterministic OTP for verify flow
  const signupRes = await request.post('http://127.0.0.1:4000/api/auth/signup', { data: { email, password, name: 'E2E UI' } })
  expect(signupRes.ok()).toBeTruthy()
  let signupBody = null
  try { signupBody = await signupRes.json() } catch (e) { signupBody = null }
  let devOtp = signupBody?._devOtp || null

  // If dev OTP wasn't returned, fall back to test create-otp endpoint (if enabled in dev)
  if (!devOtp) {
    const createOtpRes = await request.post('http://127.0.0.1:4000/api/test/create-otp', { data: { email, otp: '654321', purpose: 'VERIFY' } })
    // ignore createOtpRes.ok() failing on servers without test endpoints
    const otpJson = await createOtpRes.json().catch(() => null)
    devOtp = otpJson?.otp || '654321'
  }

  // Navigate to verification page directly (use method param to skip selection UI)
  await page.goto(`/verify-otp?email=${encodeURIComponent(email)}&flow=signup&method=email`)
  console.log('DEBUG: navigated to', page.url())
  await page.waitForTimeout(500)
  await page.waitForURL(/\/verify-otp(\?.*)?/, { timeout: 15000 })

  // Fill the visible OTP inputs
  for (let i = 0; i < 6; i++) {
    await page.fill(`input[aria-label="Digit ${i + 1}"]`, devOtp![i])
  }

  // debug screenshot & inputs
  await page.screenshot({ path: 'test-results/verify-otp-before-click.png', fullPage: true })
  const inputsState = await page.evaluate(() => Array.from(document.querySelectorAll('input[aria-label^="Digit"]')).map(i => (i as HTMLInputElement).value))
  console.log('DEBUG inputs:', JSON.stringify(inputsState))

  // Click 'Verify OTP' and await the verify API call
  await page.getByRole('button', { name: /Verify OTP|Verify code/i }).click()
  const verifyResp = await page.waitForResponse(r => r.url().includes('/api/auth/verify-otp') && r.request().method() === 'POST', { timeout: 5000 }).catch(() => null)
  if (verifyResp) {
    const vjson = await verifyResp.json().catch(() => null)
    console.log('DEBUG verifyResp status=', verifyResp.status(), 'body=', JSON.stringify(vjson))
  } else {
    console.log('DEBUG: no verify API call observed')
  }

  // Wait a moment and capture post-verify state
  await page.waitForTimeout(500)
  console.log('DEBUG post-click URL', page.url())
  await page.screenshot({ path: 'test-results/verify-otp-after-click.png', fullPage: true })

  // Expect navigation - allow either UI redirect to onboarding/hub/get-started OR the app
  // may land on '/' and mark the user verified; in the latter case assert backend state.
  try {
    await expect(page).toHaveURL(/get-started\/plans|onboarding|hub|signup\/choose-role/, { timeout: 5000 })
  } catch {
    // If UI didn't redirect, confirm backend marked the user as verified
    const profile = await request.get('http://localhost:4000/api/test/user?email='+encodeURIComponent(email))
    if (profile.ok()) {
      const p = await profile.json()
      expect(p.isEmailVerified).toBe(true)
    } else {
      throw new Error('Neither UI redirect nor backend verification observed')
    }
  }

  // If we landed on the get-started page, assert the app chrome is hidden
  if ((await page.url()).includes('/get-started')) {
    await expect(page.locator('.glass-topbar')).toHaveCount(0)
    await expect(page.locator('.glass-sidebar')).toHaveCount(0)
  }

  // Optionally assert user is verified via test endpoint
  const latestOtpResp = await request.get(`http://localhost:4000/api/test/otp/latest?email=${encodeURIComponent(email)}&purpose=VERIFY`)
  let latest = null
  try { latest = await latestOtpResp.json() } catch (e) { latest = null }
  // OTP should not exist after successful verification (consumed) or user should be marked verified
  const profile = await request.get('http://localhost:4000/api/test/user?email='+encodeURIComponent(email))
  if (profile.ok()) {
    const p = await profile.json()
    expect(p.isEmailVerified).toBe(true)
  }
})
