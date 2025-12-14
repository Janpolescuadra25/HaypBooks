import { test, expect } from '@playwright/test'

test('signup -> verify OTP -> quick business onboarding -> complete', async ({ page, request }) => {
  const email = `ui-e2e-quick-${Date.now()}@haypbooks.test`
  const password = 'Quick1!'

  // Sign up
  await page.goto('/signup')
  await page.fill('#firstName', 'UI')
  await page.fill('#lastName', 'Quick')
  await page.fill('#companyName', 'Quick Corp')
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.fill('#confirmPassword', password)
  await page.click('text=Create account')

  // Should land on verify-otp page
  await page.waitForURL(/.*verify-otp.*/)

  // Retrieve OTP from backend test endpoint
  const otpResp = await request.get(`http://localhost:4000/api/test/otp/latest?email=${encodeURIComponent(email)}&purpose=VERIFY`)
  const otp = (await otpResp.json())?.otpCode
  expect(otp).toBeTruthy()

  // Fill OTP boxes
  for (let i = 0; i < otp.length; i++) {
    await page.fill(`input[aria-label="Digit ${i + 1}"]`, otp[i])
  }
  await page.click('text=Verify code')

  // After verification, user should be forwarded to onboarding
  await page.waitForURL(/.*onboarding.*/)

  // Go to quick business onboarding
  await page.goto('/onboarding/business')

  // Fill some business details and save
  await page.fill('input[placeholder="Company name"]', 'Quick E2E Co')
  await page.fill('input[placeholder="Business email"]', email)
  await page.fill('input[placeholder="Business address"]', '1 Playwright Street')
  const dialogPromise = page.waitForEvent('dialog').catch(() => null)
  await page.click('text=Save step')
  const dialog = await dialogPromise
  if (dialog) await dialog.accept()

  // Click Done which should call /api/onboarding/complete with type='quick'
  const [completeResp] = await Promise.all([
    page.waitForResponse(r => r.url().includes('/api/onboarding/complete') && r.status() === 200, { timeout: 120000 }),
    page.click('text=Done (Go to Dashboard)'),
  ])
  const completeJson = await completeResp.json()
  expect(completeJson?.success).toBeTruthy()

  // Should be redirected out of onboarding
  await page.waitForURL((url) => !url.pathname.includes('/onboarding'))

  // Confirm backend marks user onboardingComplete and onboardingMode
  const userResp = await request.get(`http://localhost:4000/api/test/user?email=${encodeURIComponent(email)}`)
  const user = await userResp.json()
  expect(user).not.toBeNull()
  expect(user.onboardingComplete || user.onboardingCompleted || user.onboarding_complete).toBeTruthy()
  expect(user.onboardingMode || user.onboarding_mode || user.onboardingMode).toBe('quick')
})
