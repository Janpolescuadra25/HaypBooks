import { test, expect } from '@playwright/test'

test('fallback: full onboarding complete call fails -> client sets cookies and shows dashboard', async ({ page, request }) => {
  const email = `ui-e2e-fallback-${Date.now()}@haypbooks.test`
  const password = 'Fallback1!'

  // Sign up
  await page.goto('/signup')
  await page.fill('#firstName', 'UI')
  await page.fill('#lastName', 'Fallback')
  await page.fill('#companyName', 'Fallback Corp')
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.fill('#confirmPassword', password)
  await page.click('text=Create account')

  // Should land on verify-otp page
  await page.waitForURL(/.*verify-otp.*/)

  // Retrieve OTP
  const otpResp = await request.get(`http://localhost:4000/api/test/otp/latest?email=${encodeURIComponent(email)}&purpose=VERIFY`)
  const otp = (await otpResp.json())?.otpCode
  expect(otp).toBeTruthy()

  // Verify
  for (let i = 0; i < otp.length; i++) {
    await page.fill(`input[aria-label="Digit ${i + 1}"]`, otp[i])
  }
  await page.click('text=Verify code')

  // Arrive at onboarding
  await page.waitForURL(/.*onboarding.*/)

  // Intercept the complete API and force a 500 to simulate server-side auth/cookie issues
  await page.route('**/api/onboarding/complete', route => route.fulfill({ status: 500, body: 'Server fail' }))

  // Go through steps quickly to reach Finish
  await page.goto('/onboarding')
  // Fill only business step
  await page.fill('input[placeholder="Company name"]', 'Fallback Co')
  await page.fill('input[placeholder="Business email"]', email)
  await page.fill('input[placeholder="Business address"]', '123 Example')
  await page.click('text=Save step')
  // Move to review quickly
  for (let i = 0; i < 7; i++) await page.click('text=Next')

  // Click Finish which will hit the intercepted API and fail — but client should fallback and set cookies
  await page.click('text=Finish onboarding')

  // After fallback, the UI should navigate out of onboarding
  await page.waitForURL((url) => !url.pathname.includes('/onboarding'))

  // Confirm cookies in browser context reflect onboardingComplete and onboardingMode
  const cookies = await page.context().cookies()
  const found = (cookies.find(c => c.name === 'onboardingComplete' && c.value === 'true') != null)
  const modeFound = (cookies.find(c => c.name === 'onboardingMode') != null)
  expect(found).toBeTruthy()
  expect(modeFound).toBeTruthy()

  // Ensure dashboard top bar is present (Edit layout)
  await expect(page.locator('button:has-text("Edit layout")')).toBeVisible()
})
