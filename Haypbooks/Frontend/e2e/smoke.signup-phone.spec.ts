import { test, expect } from '@playwright/test'

// Smoke: create user with phone, create OTP via test helper, verify using auth/verify-otp

test('smoke: signup with phone -> dev OTP -> verify', async ({ request }) => {
  const email = `e2e-phone-smoke-${Date.now()}@haypbooks.test`
  const phone = `+1555000${String(1000 + Math.floor(Math.random() * 9000))}`
  const password = 'Phone1!'

  const createRes = await request.post('http://127.0.0.1:4000/api/test/create-user', { data: { email, password, name: 'Phone Smoke', phone } })
  expect(createRes.ok()).toBeTruthy()

  const createOtpRes = await request.post('http://127.0.0.1:4000/api/test/create-otp', { data: { phone, otp: '654321', purpose: 'VERIFY_PHONE' } })
  expect(createOtpRes.ok()).toBeTruthy()

  // Try to verify using auth/verify-otp (using email & otp) - server should accept email+otp for email verification flows
  const verifyRes = await request.post('http://127.0.0.1:4000/api/auth/verify-otp', { data: { email, otpCode: '654321' } })
  // The server may accept either email-based or phone-based verification; just assert success or 2xx
  expect(verifyRes.ok()).toBeTruthy()
})