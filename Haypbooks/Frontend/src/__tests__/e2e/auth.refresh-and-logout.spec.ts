import { test, expect } from '@playwright/test'

const backend = process.env.TEST_BACKEND_URL || 'http://127.0.0.1:4000'

test.describe('Auth session lifecycle', () => {
  test('refresh via debug exec header returns new token and user', async ({ request }) => {
    const email = `e2e-refresh-${Date.now()}@haypbooks.test`
    const password = 'Password1!'

    // Create verified user
    const createRes = await request.post(`${backend}/api/test/create-user`, { data: { email, password, isEmailVerified: true } })
    expect(createRes.ok()).toBeTruthy()

    // Login to obtain refreshToken
    const loginRes = await request.post(`${backend}/api/auth/login`, { data: { email, password } })
    expect(loginRes.ok()).toBeTruthy()
    const loginJson = await loginRes.json()
    const refreshToken = loginJson?.refreshToken
    expect(refreshToken).toBeTruthy()

    // Call refresh endpoint using debug exec with cookie header
    const refreshRes = await request.post(`${backend}/api/auth/refresh`, {
      headers: { 'x-debug-allow': 'exec', 'cookie': `refreshToken=${refreshToken}` },
      data: {}
    })
    expect(refreshRes.ok()).toBeTruthy()
    const j = await refreshRes.json()
    expect(j.debug).toBeTruthy()
    expect(j.token).toBeTruthy()
    expect(j.user).toBeTruthy()

    // Cleanup
    await request.post(`${backend}/api/test/delete-user`, { data: { email } }).catch(() => null)
  })

  test('logout clears auth cookies (set-cookie header contains cleared cookies)', async ({ request }) => {
    const email = `e2e-logout-${Date.now()}@haypbooks.test`
    const password = 'Password1!'

    // Create verified user and login
    await request.post(`${backend}/api/test/create-user`, { data: { email, password, isEmailVerified: true } })
    const loginRes = await request.post(`${backend}/api/auth/login`, { data: { email, password } })
    expect(loginRes.ok()).toBeTruthy()
    const loginJson = await loginRes.json()
    const refreshToken = loginJson?.refreshToken

    // Call logout with cookie header
    const logoutRes = await request.post(`${backend}/api/auth/logout`, { headers: { 'cookie': `refreshToken=${refreshToken}` } })
    expect(logoutRes.ok()).toBeTruthy()
    const setCookies = logoutRes.headers()['set-cookie'] || ''
    // Expect token and refreshToken cookies to be cleared
    expect(String(setCookies)).toContain('token=')
    expect(String(setCookies)).toContain('refreshToken=')

    // Cleanup
    await request.post(`${backend}/api/test/delete-user`, { data: { email } }).catch(() => null)
  })
})
