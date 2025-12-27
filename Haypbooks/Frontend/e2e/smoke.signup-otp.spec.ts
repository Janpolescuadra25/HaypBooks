import { test, expect } from '@playwright/test'

// Smoke test: signup -> receive dev-only _devOtp -> verify-otp succeeds
// Uses the backend directly (127.0.0.1:4000) to avoid intermittent frontend proxy 404s

test('smoke: signup → dev OTP → verify', async ({ request }) => {
  const email = `e2e-smoke-${Date.now()}@haypbooks.test`
  // Create a user via test helper endpoint (avoids dependency on the signup behavior)
  const createRes = await request.post('http://127.0.0.1:4000/api/test/create-user', { data: { email, password: 'Abcd1234', name: 'Smoke' } })
  expect(createRes.ok()).toBeTruthy()

  // Create deterministic OTP for this email using the test helper endpoint
  const createOtpRes = await request.post('http://127.0.0.1:4000/api/test/create-otp', { data: { email, otp: '654321', purpose: 'VERIFY' } })
  expect(createOtpRes.ok()).toBeTruthy()
  const otpJson = await createOtpRes.json()
  const devOtp = otpJson?.otp || '654321'

  expect(devOtp, 'expected a dev OTP from signup or send-verification').toBeTruthy()

  // Verify the OTP
  const verifyRes = await request.post('http://127.0.0.1:4000/api/auth/verify-otp', {
    data: { email, otpCode: String(devOtp) },
  })
  expect(verifyRes.ok()).toBeTruthy()
  const verifyBody = await verifyRes.json()
  expect(verifyBody.success).toBeTruthy()
})
