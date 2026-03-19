import { test, expect } from '@playwright/test'

const backend = process.env.TEST_BACKEND_URL || 'http://127.0.0.1:4000'

test('Rate limit: repeated failed logins eventually block further attempts', async ({ request }) => {
  const email = `e2e-rl-${Date.now()}@haypbooks.test`
  const password = 'Password1!'

  // Create a verified user
  const createRes = await request.post(`${backend}/api/test/create-user`, { data: { email, password, isEmailVerified: true } })
  expect(createRes.ok()).toBeTruthy()

  // Make 6 failed login attempts (wrong password)
  let last: any = null
  for (let i = 0; i < 6; i++) {
    const res = await request.post(`${backend}/api/auth/login`, { data: { email, password: 'wrong' } }).catch(() => null)
    last = res
  }

  // The last response should indicate rate limiting (401 or 429)
  expect(last).not.toBeNull()
  expect([401, 429]).toContain(last.status())
  const body = await last.json().catch(() => null)
  expect(String(JSON.stringify(body))).toMatch(/Too many|rate limit|login attempts/i)

  // Cleanup
  await request.post(`${backend}/api/test/delete-user`, { data: { email } }).catch(() => null)
})
