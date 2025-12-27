import { test, expect } from '@playwright/test'

test('signup -> verify OTP -> skip onboarding -> dashboard shows nav & persisted quick mode', async ({ page, request }) => {
  const email = `ui-e2e-skip-${Date.now()}@haypbooks.test`
  const password = 'Skip1!'

  // Sign up
  await page.goto('/signup')
  await page.fill('#firstName', 'UI')
  await page.fill('#lastName', 'Skip')
  await page.fill('#companyName', 'Skip Corp')
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

  // Fill OTP boxes and submit
  for (let i = 0; i < otp.length; i++) {
    await page.fill(`input[aria-label="Digit ${i + 1}"]`, otp[i])
  }
  await page.getByRole('button', { name: /Verify OTP|Verify code/i }).click()

  // Wait for onboarding page
  await page.waitForURL(/.*onboarding.*/)

  // Click Skip - the UI Skip handler now calls POST /api/onboarding/complete {type:'quick'}
  const [completeResp] = await Promise.all([
    page.waitForResponse(r => r.url().includes('/api/onboarding/complete') && r.status() === 200, { timeout: 120000 }),
    page.click('text=Skip for now'),
  ])
  const completeJson = await completeResp.json()
  expect(completeJson?.success).toBeTruthy()

  // Should be redirected out of onboarding
  await page.waitForURL((url) => !url.pathname.includes('/onboarding'))

  // Ensure dashboard top bar shows Edit Layout and Overview link
  await expect(page.locator('button:has-text("Edit layout")')).toBeVisible()
  await expect(page.locator('a[aria-label="Go to Dashboard"]')).toBeVisible()

  // Confirm backend marks user as onboardingComplete and onboardingMode 'quick'
  const userResp = await request.get(`http://localhost:4000/api/test/user?email=${encodeURIComponent(email)}`)
  const user = await userResp.json()
  expect(user).not.toBeNull()
  expect(user.onboardingComplete || user.onboardingCompleted || user.onboarding_complete).toBeTruthy()
  expect(user.onboardingMode || user.onboarding_mode || user.onboardingMode).toBe('quick')
})
