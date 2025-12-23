import { test, expect } from '@playwright/test'

// This test signs up a new user, captures the dev OTP returned by the backend
// in non-production mode, navigates to the verify OTP screen, enters the OTP via
// the UI and asserts successful navigation into onboarding/hub.

test('signup -> verify otp (dev flow)', async ({ page, request, browserName }) => {
  const email = `e2e-ui-verify-${Date.now()}@haypbooks.test`
  const password = 'Verify1!'

  // Intercept the signup POST so we can read the JSON response and extract _devOtp
  let devOtp: string | null = null
  await page.route('**/api/auth/signup', route => route.continue())

  // Perform signup via UI (ensure form is visible)
  await page.goto('/signup?showSignup=1&role=business')
  await page.fill('#firstName', 'E2E')
  await page.fill('#lastName', 'UI')
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.fill('#confirmPassword', password)

  // Capture console logs and failed requests for debugging and click Create account
  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()))
  page.on('requestfailed', r => console.log('REQ FAILED:', r.url(), r.failure()?.errorText))

  // Start waiting for the signup response so we can extract _devOtp (if returned)
  const signupResponsePromise = page.waitForResponse(r => r.url().includes('/api/auth/signup') && r.request().method() === 'POST', { timeout: 10000 })

  await page.getByRole('button', { name: 'Create account' }).click()

  // Log whether the submit button is disabled after clicking
  const isDisabled = await page.getByRole('button', { name: 'Create account' }).isDisabled().catch(() => false)
  console.log('Create account button disabled after click:', isDisabled)

  // Attempt to read dev OTP from the signup response
  try {
    const signupResponse = await signupResponsePromise
    try { const b = await signupResponse.json(); devOtp = b?._devOtp || null } catch (e) { devOtp = null }
  } catch (e) {
    devOtp = null
  }

  // Take a screenshot to inspect the post-click state (debug)
  await page.screenshot({ path: 'tmp/signup-after-click.png', fullPage: true })

  // Log current URL and any visible form-level error to help debug why redirect didn't occur
  console.log('Post-click URL:', page.url())
  const formErrorEl = page.locator('.bg-red-50').first()
  if (await formErrorEl.count() > 0) {
    try { console.log('Form error text:', await formErrorEl.innerText()) } catch {}
  }

  // Wait for automatic redirect to verify-otp UI (this will be true for both roles)
  await page.waitForURL(/\/verify-otp(\?.*)?/, { timeout: 15000 }).catch(() => {})

  // If we didn't get the OTP from the signup response, try the backend test endpoint (dev-only)
  if (!devOtp) {
    // If a dev code was attached to the URL (dev mode), use that
    try {
      const u = new URL(page.url())
      const codeParam = u.searchParams.get('code') || u.searchParams.get('otp')
      if (codeParam && codeParam.length === 6) devOtp = codeParam
    } catch (e) {}
  }

  if (!devOtp) {
    const resp = await request.get(`http://localhost:4000/api/test/otp/latest?email=${encodeURIComponent(email)}`)
    let d = null
    try { d = await resp.json() } catch (e) { d = null }
    devOtp = d?.otpCode || d?.otp?.otpCode || null
  }

  expect(devOtp).toBeTruthy()

  // Fill the visible OTP inputs
  for (let i = 0; i < 6; i++) {
    await page.fill(`input[aria-label="Digit ${i + 1}"]`, devOtp![i])
  }

  // Click 'Verify OTP'
  await page.getByRole('button', { name: /Verify OTP|Verify code/i }).click()

  // Expect navigation - if signup flow sends to onboarding, assert URL contains onboarding, hub, or get-started
  await expect(page).toHaveURL(/onboarding|hub|get-started/)

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
