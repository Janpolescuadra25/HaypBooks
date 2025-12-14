import { test, expect } from '@playwright/test'

test('signup -> verify OTP -> onboarding redirect', async ({ page, request }) => {
  const email = `ui-e2e-${Date.now()}@haypbooks.test`
  const password = 'Playwright1!'

  await page.goto('/signup')
  await page.fill('#firstName', 'UI')
  await page.fill('#lastName', 'E2E')
  await page.fill('#companyName', 'E2E Corp')
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.fill('#confirmPassword', password)
  await page.click('text=Create account')

  // We expect to land on verify-otp page
  await page.waitForURL(/.*verify-otp.*/)

  // Fetch the latest OTP from backend test endpoint
  const otpResp = await request.get(`http://localhost:4000/api/test/otp/latest?email=${encodeURIComponent(email)}&purpose=VERIFY`, { headers: { } })
  const otp = (await otpResp.json())?.otpCode
  expect(otp).toBeTruthy()

  // Fill OTP boxes (6 digits)
  for (let i = 0; i < otp.length; i++) {
    await page.fill(`input[aria-label="Digit ${i + 1}"]`, otp[i])
  }
  await page.click('text=Verify code')

  // After verification, user should be forwarded to onboarding (full flow)
  await page.waitForURL('/onboarding')

  // Confirm backend marks user as verified
  const userResp = await request.get(`http://localhost:4000/api/test/user?email=${encodeURIComponent(email)}`)
  const user = await userResp.json()
  expect(user).not.toBeNull()
  expect(user.isEmailVerified).toBe(true)
})
