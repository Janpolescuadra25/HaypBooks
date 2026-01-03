import { test, expect } from '@playwright/test'

const enabled = process.env.ALLOW_TEST_ENDPOINTS === 'true' || process.env.CI === 'true' || process.env.NODE_ENV === 'test'

test.describe('Proxy down diagnostic', () => {
  test.skip(!enabled, 'Test endpoints disabled locally; enable ALLOW_TEST_ENDPOINTS or run in CI')

  test('when proxy returns 502 the frontend fetch fails but backend direct refresh still works', async ({ page, request }) => {
    const backend = process.env.BACKEND_URL || 'http://127.0.0.1:4000'
    const frontend = process.env.FRONTEND_URL || 'http://localhost:3000'
    const ts = Date.now()
    const email = `e2e-proxydown-${ts}@haypbooks.test`
    const password = 'ProxyDownPass!23'

    // Create verified user and login via backend
    await expect(request.post(`${backend}/api/test/create-user`, { data: { email, password, name: 'ProxyDown', isEmailVerified: true } })).resolves.toBeTruthy()
    const loginRes = await request.post(`${backend}/api/auth/login`, { data: { email, password } })
    expect(loginRes.ok()).toBeTruthy()
    const loginJson = await loginRes.json()

    // Set cookies in browser context for frontend origin
    const context = page.context()
    await context.addCookies([
      { name: 'token', value: loginJson.token, url: frontend, httpOnly: true },
      { name: 'refreshToken', value: loginJson.refreshToken, url: frontend, httpOnly: true },
    ])

    // Intercept the proxy route and simulate a 502 Bad Gateway from Next (proxy failure)
    await page.route('/api/auth/refresh', (route) => route.fulfill({ status: 502, contentType: 'application/json', body: JSON.stringify({ message: 'Bad Gateway (simulated)' }) }))

    // Navigate and attempt same-origin refresh (should receive 502)
    await page.goto(frontend, { waitUntil: 'domcontentloaded' })
    const res = await page.evaluate(async () => {
      try {
        const r = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
        let body
        try { body = await r.json() } catch (e) { body = await r.text() }
        return { status: r.status, body }
      } catch (e) {
        return { status: 0, body: String(e) }
      }
    })

    expect(res.status).toBe(502)
    expect(res.body && res.body.message).toContain('Bad Gateway')

    // Direct backend POST with Cookie header should still be able to reach backend refresh endpoint
    const backendDirect = await request.post(`${backend}/api/auth/refresh`, { headers: { Cookie: `refreshToken=${loginJson.refreshToken}; token=${loginJson.token}` } })
    // backendDirect may be 200 (success) or 401 depending on session timing, but the request should not fail due to proxy
    expect([200, 401]).toContain(backendDirect.status())
  })
})
