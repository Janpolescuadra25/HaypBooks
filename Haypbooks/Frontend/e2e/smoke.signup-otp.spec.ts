import { test, expect } from '@playwright/test'

// Smoke test: pre-signup -> complete-signup (email OTP) -> login succeeds

test('smoke: pre-signup → complete-signup (email) → login', async ({ request }) => {
  const email = `e2e-smoke-${Date.now()}@haypbooks.test`
  const password = 'Abcd1234'

  const pre = await request.post('http://127.0.0.1:4000/api/auth/pre-signup', { data: { email, password, name: 'Smoke' } })
  expect(pre.ok()).toBeTruthy()
  const preJson = await pre.json().catch(() => null)
  expect(preJson && preJson.signupToken).toBeTruthy()

  const signupToken = preJson.signupToken
  let otp = preJson.otpEmail || preJson.otp || null
  if (!otp) {
    const otpRes = await request.get(`http://127.0.0.1:4000/api/test/otp/latest?email=${encodeURIComponent(email)}&purpose=VERIFY_EMAIL`).catch(() => null)
    const otpJson = otpRes ? await otpRes.json().catch(() => null) : null
    otp = otpJson?.otpCode || null
  }
  expect(otp).toBeTruthy()

  const complete = await request.post('http://127.0.0.1:4000/api/auth/complete-signup', { data: { signupToken, code: String(otp), method: 'email' } })
  expect(complete.ok()).toBeTruthy()

  const login = await request.post('http://127.0.0.1:4000/api/auth/login', { data: { email, password } })
  expect(login.ok()).toBeTruthy()
  const loginJson = await login.json().catch(() => null)
  expect(loginJson?.token).toBeTruthy()
})
