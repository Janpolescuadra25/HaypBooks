import { test, expect } from '@playwright/test'

// Smoke: pre-signup with phone -> complete-signup using phone only -> login succeeds

test('smoke: pre-signup with phone → complete-signup (phone only) → login', async ({ request }) => {
  const email = `e2e-phone-only-${Date.now()}@haypbooks.test`
  const phone = `+1555000${String(1000 + Math.floor(Math.random() * 9000))}`
  const password = 'PhoneOnly1!'

  const pre = await request.post('http://127.0.0.1:4000/api/auth/pre-signup', { data: { email, password, name: 'Phone Only Smoke', phone } })
  expect(pre.ok()).toBeTruthy()
  const preJson = await pre.json().catch(() => null)
  expect(preJson && preJson.signupToken).toBeTruthy()
  const signupToken = preJson.signupToken

  let otpPhone = preJson.otpPhone || null
  if (!otpPhone) {
    const otpRes = await request.get(`http://127.0.0.1:4000/api/test/otp/latest?phone=${encodeURIComponent(phone)}&purpose=MFA`).catch(() => null)
    const otpJson = otpRes ? await otpRes.json().catch(() => null) : null
    otpPhone = otpJson?.otpCode || null
  }

  expect(otpPhone).toBeTruthy()

  const c = await request.post('http://127.0.0.1:4000/api/auth/complete-signup', { data: { signupToken, code: String(otpPhone), method: 'phone' } })
  expect(c.ok()).toBeTruthy()
  const cj = await c.json().catch(() => null)
  expect(cj?.token).toBeTruthy()

  const login = await request.post('http://127.0.0.1:4000/api/auth/login', { data: { email, password } })
  expect(login.ok()).toBeTruthy()
  const loginJson = await login.json().catch(() => null)
  expect(loginJson?.token).toBeTruthy()
})