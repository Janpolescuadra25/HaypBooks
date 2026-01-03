import { test, expect } from '@playwright/test'

// Skip when test endpoints are disabled locally (CI sets ALLOW_TEST_ENDPOINTS=true)
const enabled = process.env.ALLOW_TEST_ENDPOINTS === 'true' || process.env.CI === 'true' || process.env.NODE_ENV === 'test'

test.describe('Proxy refresh (same-origin cookie forwarding)', () => {
  test.skip(!enabled, 'Test endpoints disabled locally; enable ALLOW_TEST_ENDPOINTS or run in CI')

  test('smoke: proxy refresh via frontend works and returns 200', async ({ page, request, browser }) => {
    const backend = process.env.BACKEND_URL || 'http://127.0.0.1:4000'
    const frontend = process.env.FRONTEND_URL || 'http://localhost:3000'
    const ts = Date.now()
    const email = `e2e-refresh-${ts}@haypbooks.test`
    const password = 'RefreshPass!23'

    // Create a verified user via backend test endpoint
    const create = await request.post(`${backend}/api/test/create-user`, { data: { email, password, name: 'Refresh Debug', isEmailVerified: true } })
    expect(create.ok()).toBeTruthy()

    // Login via backend to obtain tokens
    const loginRes = await request.post(`${backend}/api/auth/login`, { data: { email, password } })
    expect(loginRes.ok()).toBeTruthy()
    const loginJson = await loginRes.json()
    expect(loginJson.refreshToken).toBeTruthy()
    expect(loginJson.token).toBeTruthy()

    // Add cookies to the browser context for the frontend origin (same as how browser would store them)
    const context = page.context()
    await context.addCookies([
      { name: 'token', value: loginJson.token, url: frontend, httpOnly: true },
      { name: 'refreshToken', value: loginJson.refreshToken, url: frontend, httpOnly: true },
    ])

    // Open a page on the frontend and call the refresh endpoint via same-origin fetch
    await page.goto(frontend, { waitUntil: 'domcontentloaded' })

    const res = await page.evaluate(async () => {
      try {
        const r = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
        try { const b = await r.json(); return { status: r.status, body: b } } catch (e) { return { status: r.status, body: null } }
      } catch (e) {
        return { status: 0, body: String(e) }
      }
    })

    expect(res.status).toBe(200)
    expect(res.body && res.body.token).toBeTruthy()

    // Also sanity-check backend session exists
    const sessions = await request.get(`${backend}/api/test/sessions?email=${encodeURIComponent(email)}`)
    expect(sessions.ok()).toBeTruthy()
    const sJson = await sessions.json()
    expect(Array.isArray(sJson)).toBeTruthy()
  })
})
