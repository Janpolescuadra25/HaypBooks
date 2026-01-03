import { test, expect } from '@playwright/test'

// Smoke: pre-signup with phone -> complete-signup accepts email OR phone -> login succeeds

test('smoke: pre-signup with phone → complete-signup (email OR phone) → login', async ({ request }) => {
  const email = `e2e-phone-smoke-${Date.now()}@haypbooks.test`
  const phone = `+1555000${String(1000 + Math.floor(Math.random() * 9000))}`
  const password = 'Phone1!'

  const pre = await request.post('http://127.0.0.1:4000/api/auth/pre-signup', { data: { email, password, name: 'Phone Smoke', phone } })
  expect(pre.ok()).toBeTruthy()
  const preJson = await pre.json().catch(() => null)
  expect(preJson && preJson.signupToken).toBeTruthy()
  const signupToken = preJson.signupToken

  let otpEmail = preJson.otpEmail || preJson.otp || null
  let otpPhone = preJson.otpPhone || null

  if (!otpEmail) {
    const otpRes = await request.get(`http://127.0.0.1:4000/api/test/otp/latest?email=${encodeURIComponent(email)}&purpose=VERIFY_EMAIL`).catch(() => null)
    const otpJson = otpRes ? await otpRes.json().catch(() => null) : null
    otpEmail = otpJson?.otpCode || null
  }
  if (!otpPhone) {
    const otpRes = await request.get(`http://127.0.0.1:4000/api/test/otp/latest?phone=${encodeURIComponent(phone)}&purpose=MFA`).catch(() => null)
    const otpJson = otpRes ? await otpRes.json().catch(() => null) : null
    otpPhone = otpJson?.otpCode || null
  }

  expect(otpEmail).toBeTruthy()
  expect(otpPhone).toBeTruthy()

  const c1 = await request.post('http://127.0.0.1:4000/api/auth/complete-signup', { data: { signupToken, code: String(otpEmail), method: 'email' } })
  expect(c1.ok()).toBeTruthy()
  const c1j = await c1.json().catch(() => null)

  // Under OR policy the first successful method may return a session token immediately.
  // If no token is returned, attempt the phone step as a fallback.
  if (!c1j?.token) {
    const c2 = await request.post('http://127.0.0.1:4000/api/auth/complete-signup', { data: { signupToken, code: String(otpPhone), method: 'phone' } })
    expect(c2.ok()).toBeTruthy()
    const c2j = await c2.json().catch(() => null)
    expect(c2j?.token).toBeTruthy()
  } else {
    expect(c1j?.token).toBeTruthy()
  }

  const login = await request.post('http://127.0.0.1:4000/api/auth/login', { data: { email, password } })
  expect(login.ok()).toBeTruthy()
  const loginJson = await login.json().catch(() => null)
  expect(loginJson?.token).toBeTruthy()
})