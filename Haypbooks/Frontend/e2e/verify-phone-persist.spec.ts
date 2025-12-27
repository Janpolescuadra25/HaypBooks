import { test, expect } from '@playwright/test'

test('phone verification persists to DB (dev test endpoints)', async ({ request }) => {
  const gate = await request.get('http://127.0.0.1:4000/api/test/users')
  if (gate.status() === 403 || gate.status() === 404) {
    test.skip('Backend test endpoints are disabled; skipping phone-persist test')
  }

  const now = Date.now()
  const email = `e2e-phone-verify-${now}@haypbooks.test`
  const phone = `+1555${String(now).slice(-7)}` // unique-ish

  // Create user with phone
  const createResp = await request.post('http://127.0.0.1:4000/api/test/create-user', {
    data: { email, password: 'Abcd1234', name: 'Phone Verify', phone },
  })
  expect([200, 201]).toContain(createResp.status())

  // Try to create a deterministic OTP (if endpoint exists). Some servers accept a create-otp test endpoint.
  await request.post('http://127.0.0.1:4000/api/test/create-otp', { data: { phone, otp: '123456' } }).catch(() => {})

  // Fetch latest OTP for the phone
  const otpResp = await request.get(`http://127.0.0.1:4000/api/test/otp/latest?phone=${encodeURIComponent(phone)}`)
  let otp = '123456'
  if (otpResp.ok()) {
    const j = await otpResp.json()
    otp = (j?.otp?.otpCode) || otp
  }

  // Verify via auth endpoint
  const verifyResp = await request.post('http://127.0.0.1:4000/api/auth/verify-otp', {
    data: { phone, otpCode: String(otp) },
  })

  expect(verifyResp.status()).toBe(200)

  // Fetch user and assert persistence
  const profileResp = await request.get(`http://127.0.0.1:4000/api/test/user?email=${encodeURIComponent(email)}`)
  expect(profileResp.ok()).toBeTruthy()
  const profile = await profileResp.json()
  expect(profile).toBeTruthy()
  expect(profile.isPhoneVerified).toBe(true)
  expect(profile.phoneVerifiedAt).toBeTruthy()

  // phoneVerifiedAt should be a parsable recent date
  const then = new Date(profile.phoneVerifiedAt)
  expect(Number(then)).toBeGreaterThan(0)
  expect(Date.now() - Number(then)).toBeLessThan(1000 * 60 * 5) // within 5 minutes
})