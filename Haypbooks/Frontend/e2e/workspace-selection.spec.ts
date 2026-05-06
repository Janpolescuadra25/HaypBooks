import { test, expect } from '@playwright/test'

const EMAIL = 'demo@haypbooks.test'
const PASSWORD = 'Dev@Seed#2026!Local'
const BACKEND = 'http://127.0.0.1:4000'

test.describe('Workspace selection', () => {
  test('login with demo user, verify companies visible, click company to reach dashboard', async ({ page, request, context }) => {
    // ── 1. Login via backend API directly to get the auth cookie ────────────
    // This bypasses the frontend's post-login OTP/verification redirect that
    // the demo user triggers, letting us test the workspace page in isolation.
    const loginRes = await request.post(`${BACKEND}/api/auth/login`, {
      data: { email: EMAIL, password: PASSWORD },
    })
    expect(loginRes.ok(), `Backend login failed: ${loginRes.status()}`).toBeTruthy()

    // Extract the httpOnly 'token' cookie from Set-Cookie header
    const setCookieHeader = loginRes.headers()['set-cookie'] ?? ''
    const tokenMatch = setCookieHeader.match(/token=([^;]+)/)
    expect(tokenMatch, 'No token cookie in login response').toBeTruthy()
    const tokenValue = tokenMatch![1]

    // Inject the cookie into the browser context so Next.js routes use it
    await context.addCookies([{
      name: 'token',
      value: tokenValue,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
    }])

    // ── 2. Navigate directly to workspace page ───────────────────────────────
    await page.goto('/workspace')
    await page.waitForURL(/\/workspace/, { timeout: 20_000 })

    // ── 3. Verify at least one company is listed ─────────────────────────────
    // The BookCard for "My Companies" expands on click; expand it first.
    const companiesCard = page.locator('text=My Companies').first()
    await expect(companiesCard).toBeVisible({ timeout: 15_000 })

    // Click the card to expand it (BookCard toggles on click)
    await companiesCard.click()

    // At least one company row should appear (rendered as <td> with the company name)
    const companyRow = page.locator('tbody tr td span').first()
    await expect(companyRow).toBeVisible({ timeout: 10_000 })

    const companyName = await companyRow.textContent()
    expect(companyName?.trim().length).toBeGreaterThan(0)
    console.log('[TEST] Found company:', companyName?.trim())

    // ── 4. Click the first company → CompanyModal appears ───────────────────
    await companyRow.click()

    // Modal should appear with the "Continue to Dashboard" button
    const confirmBtn = page.locator('[data-testid="confirm-company"]')
    await expect(confirmBtn).toBeVisible({ timeout: 8_000 })
    await confirmBtn.click()

    // ── 5. Verify dashboard loaded ───────────────────────────────────────────
    await page.waitForURL(/\/dashboard/, { timeout: 20_000 })
    expect(page.url()).toContain('/dashboard')
    console.log('[TEST] ✅ Dashboard loaded at:', page.url())
  })
})
