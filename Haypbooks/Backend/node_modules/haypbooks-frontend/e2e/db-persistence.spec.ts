import { test, expect } from '@playwright/test'

test('DB persistence: create user -> forgot -> reset -> login -> session exists', async ({ request }) => {
  const email = `e2e-db-${Date.now()}@haypbooks.test`
  const startPassword = 'Start1234'
  const newPassword = 'NewPass123!'

  // Create a test user via backend test endpoint
  const create = await request.post('http://localhost:4000/api/test/create-user', { data: { email, password: startPassword, name: 'Playwright DB Test' } })
  expect(create.ok()).toBeTruthy()

  // Ensure user exists in DB via test endpoint
  const u1 = await request.get(`http://localhost:4000/api/test/user?email=${encodeURIComponent(email)}`)
  expect(u1.ok()).toBeTruthy()
  const userJson = await u1.json()
  expect(userJson?.email).toBe(email)
  const beforePasswordHash = userJson?.password || userJson?.passwordhash
  expect(beforePasswordHash).toBeTruthy()

  // Trigger forgot password to create a RESET OTP
  const forgot = await request.post('http://localhost:4000/api/auth/forgot-password', { data: { email } })
  expect(forgot.ok()).toBeTruthy()

  // Get latest OTP
  const otpResp = await request.get(`http://localhost:4000/api/test/otp/latest?email=${encodeURIComponent(email)}&purpose=RESET`)
  expect(otpResp.ok()).toBeTruthy()
  const otpJson = await otpResp.json()
  expect(otpJson?.otpCode).toBeTruthy()
  const otpCode = otpJson.otpCode

  // Reset using the OTP
  const reset = await request.post('http://localhost:4000/api/auth/reset-password', { data: { email, otpCode, password: newPassword } })
  expect(reset.ok()).toBeTruthy()
  const resetJson = await reset.json()
  expect(resetJson?.success).toBeTruthy()

  // Verify user password hash changed
  const u2 = await request.get(`http://localhost:4000/api/test/user?email=${encodeURIComponent(email)}`)
  expect(u2.ok()).toBeTruthy()
  const user2 = await u2.json()
  const afterHash = user2?.password || user2?.passwordhash
  expect(afterHash).toBeTruthy()
  expect(afterHash).not.toBe(beforePasswordHash)

  // Login with new password
  const login = await request.post('http://localhost:4000/api/auth/login', { data: { email, password: newPassword } })
  expect(login.ok()).toBeTruthy()
  const loginJson = await login.json()
  expect(loginJson?.user).toBeTruthy()

  // Ensure a session was created
  const sessionsResp = await request.get(`http://localhost:4000/api/test/sessions?email=${encodeURIComponent(email)}`)
  expect(sessionsResp.ok()).toBeTruthy()
  const sessions = await sessionsResp.json()
  expect(Array.isArray(sessions)).toBeTruthy()
  expect(sessions.length).toBeGreaterThanOrEqual(1)
})
