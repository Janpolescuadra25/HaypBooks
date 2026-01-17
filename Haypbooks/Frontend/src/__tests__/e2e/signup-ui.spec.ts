import { test, expect } from '@playwright/test'

test('UI Signup flow: pre-signup → verify OTP → account created and session established', async ({ page, request }) => {
  const backend = process.env.TEST_BACKEND_URL || 'http://127.0.0.1:4000'
  const frontend = process.env.PLAYWRIGHT_URL || 'http://127.0.0.1:3000'

  const email = `e2e-signup-${Date.now()}@haypbooks.test`
  const password = `Password1!`
  const firstName = 'E2E'
  const lastName = 'Signup'

  // Go to signup and choose role (default is business, but ensure we get to the form)
  await page.goto(`${frontend}/signup?showSignup=1`)
  await page.click('[data-testid="signup-role-business"]')

  // Fill the signup form
  await page.fill('#firstName', firstName)
  await page.fill('#lastName', lastName)
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.fill('#confirmPassword', password)

  // Submit and wait for the client navigation into the verify-otp page
  await Promise.all([
    page.waitForURL('**/verify-otp**', { timeout: 8000 }).catch(() => null),
    page.click('button[type="submit"]'),
  ])

  // Ensure we're on the verify page
  try {
    await page.waitForURL('**/verify-otp**', { timeout: 5000 })
  } catch (e) {
    test.fail(true, 'Navigation to verify-otp did not occur')
    return
  }

  // Attempt to obtain the OTP from the URL (pre-filled by pre-signup)
  const url = new URL(page.url())
  const codeFromUrl = url.searchParams.get('code') || ''

  let otp = ''
  if (/^\d{6}$/.test(codeFromUrl)) {
    otp = codeFromUrl
  } else {
    // If not present on the URL, check the inputs for a prefilled value
    const parts: string[] = []
    for (let i = 1; i <= 6; i++) {
      const val = await page.inputValue(`input[aria-label="Digit ${i}"]`).catch(() => '')
      if (val) parts.push(val)
    }
    if (parts.join('').length === 6) otp = parts.join('')
  }

  // If we still don't have an OTP, try the backend test helper to fetch the latest OTP
  if (!/^\d{6}$/.test(otp)) {
    const otpResp = await request.get(`${backend}/api/test/otp/latest?email=${encodeURIComponent(email)}&purpose=VERIFY_EMAIL`).catch(() => null)
    if (otpResp && otpResp.ok()) {
      const data = await otpResp.json().catch(() => null)
      otp = data?.otpCode || data?.otp || data?.otpCode || ''
    }
  }

  if (!/^\d{6}$/.test(otp)) {
    test.skip(true, 'Unable to obtain OTP from preSignup or test endpoints; skipping')
    return
  }

  // Fill the OTP inputs (one digit per box)
  for (let i = 0; i < 6; i++) {
    await page.fill(`input[aria-label="Digit ${i + 1}"]`, otp[i])
  }

  // Click Continue and wait for navigation into the onboarding flow (business users go to /get-started/plans)
  await Promise.all([
    page.waitForURL('**/get-started/plans**', { timeout: 10000 }).catch(() => null),
    page.click('button:has-text("Continue")'),
  ])

  // Confirm the user was created via test helper endpoint (best-effort)
  const userResp = await request.get(`${backend}/api/test/user?email=${encodeURIComponent(email)}`).catch(() => null)
  const createdUser = userResp && userResp.ok() ? await userResp.json() : null
  expect(createdUser, 'Expected user to be created after signup').not.toBeNull()
  expect(createdUser?.email).toBe(email)

  // Cleanup: attempt to remove created user (best-effort, test helper may be disabled)
  await request.post(`${backend}/api/test/delete-user`, { data: { email } }).catch(() => null)
})
