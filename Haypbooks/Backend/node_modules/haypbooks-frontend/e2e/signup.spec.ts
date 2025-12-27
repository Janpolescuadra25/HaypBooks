import { test, expect } from '@playwright/test'

test('signup -> verify OTP -> onboarding redirect', async ({ page, request }) => {
  const email = `ui-e2e-${Date.now()}@haypbooks.test`
  const password = 'Playwright1!'

  await page.goto('/signup?showSignup=1')
  // Choose role (UI shows a role selection step before the signup form)
  await page.getByRole('button', { name: /My Business|Accountant/i }).first().click()
  await page.waitForSelector('#firstName', { timeout: 15000 })
  await page.fill('#firstName', 'UI')
  await page.fill('#lastName', 'E2E')
  // New signup form includes phone field; wait for it and fill
  await page.waitForSelector('#phone', { timeout: 10000 })
  await page.fill('#phone', '+63 912 345 6789')
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.fill('#confirmPassword', password)
  await page.click('text=Create account')

  // We expect to land on verify-otp page
  await page.waitForURL(/.*verify-otp.*/)

  // Fetch the latest OTP from backend test endpoint
  let otpResp = await request.get(`http://localhost:4000/api/test/otp/latest?email=${encodeURIComponent(email)}&purpose=VERIFY`)
  let otp = (await otpResp.json())?.otpCode
  if (!otp) {
    // Try to create a deterministic dev OTP via the test helper endpoint; if disabled, fall back to send-verification
    const createOtpRes = await request.post('http://127.0.0.1:4000/api/test/create-otp', { data: { email, otp: '654321', purpose: 'VERIFY' } })
    if (createOtpRes.ok()) {
      const created = await createOtpRes.json().catch(() => null)
      otp = created?.otp || '654321'
    } else {
      console.warn('create-otp test endpoint failed', createOtpRes.status())
      const sendRes = await request.post('http://127.0.0.1:4000/api/auth/send-verification', { data: { email } })
      try {
        const sjson = await sendRes.json().catch(() => null)
        otp = sjson?.otp || sjson?.otpCode || null
      } catch (e) { otp = null }
    }
  }
  expect(otp).toBeTruthy()

  // Fill OTP boxes (6 digits)
  for (let i = 0; i < otp.length; i++) {
    await page.fill(`input[aria-label="Digit ${i + 1}"]`, otp[i])
  }
  await page.getByRole('button', { name: /Verify OTP|Verify code/i }).click()

  // After verification, user should be forwarded to onboarding or get-started
  await page.waitForURL(/\/(?:onboarding|get-started|hub)/, { timeout: 15000 })

  // Confirm backend marks user as verified
  const userResp = await request.get(`http://127.0.0.1:4000/api/test/user?email=${encodeURIComponent(email)}`)
  const user = await userResp.json()
  expect(user).not.toBeNull()
  expect(user.isEmailVerified).toBe(true)
})
