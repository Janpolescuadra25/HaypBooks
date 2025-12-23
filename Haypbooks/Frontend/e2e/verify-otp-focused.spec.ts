import { test, expect } from '@playwright/test'

// Focused test: create user via API, get dev OTP, navigate directly to verify page
// and assert the frontend input and verify action work.

test('verify-otp UI accepts code and verifies user', async ({ page, request }) => {
  const email = `e2e-verify-focused-${Date.now()}@haypbooks.test`
  const password = 'verify-pass'

  // Create via API to avoid depending on signup UI (call backend directly)
  const signupRes = await request.post('http://localhost:4000/api/auth/signup', { data: { email, password, name: 'E2E Focus' } })
  expect(signupRes.ok()).toBeTruthy()
  let signupBody = null
  try { signupBody = await signupRes.json() } catch (e) { signupBody = null }
  const devOtp = signupBody?._devOtp

  // fallback to test endpoint (call backend directly)
  let otp = devOtp
  if (!otp) {
    const otpResp = await request.get(`http://localhost:4000/api/test/otp/latest?email=${encodeURIComponent(email)}&purpose=VERIFY`)
    let d = null
    try { d = await otpResp.json() } catch (e) { d = null }
    otp = d?.otpCode || d?.otp?.otpCode || null
  }

  expect(otp).toBeTruthy()

  await page.goto(`/verify-otp?email=${encodeURIComponent(email)}&flow=signup`)

  // Fill digits
  for (let i = 0; i < otp.length; i++) {
    await page.fill(`input[aria-label="Digit ${i + 1}"]`, otp[i])
  }

  await page.click('text=Verify OTP')

  // Expect to be redirected to the Get Started page for business owners, or hub/role chooser as fallback
  await expect(page).toHaveURL(/get-started\/plans|onboarding|hub|signup\/choose-role/)

  // If we are on the get-started page, ensure the app chrome (header/sidebar) is not rendered
  if ((await page.url()).includes('/get-started')) {
    await expect(page.locator('.glass-topbar')).toHaveCount(0)
    await expect(page.locator('.glass-sidebar')).toHaveCount(0)
  }

  // As an additional check, the OTP should be consumed after verification; a second verify should fail
  const verifyAgain = await request.post('http://localhost:4000/api/auth/verify-otp', { data: { email, otpCode: otp } })
  let againBody = null
  try { againBody = await verifyAgain.json() } catch (e) { againBody = null }
  // expect failure (consumed)
  const againStatus = verifyAgain.status()
  expect(againStatus === 200 ? (againBody?.success === false) : true).toBeTruthy()
})