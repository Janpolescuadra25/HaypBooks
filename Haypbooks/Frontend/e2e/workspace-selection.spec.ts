import { test, expect } from '@playwright/test'
import { setupTestAuth } from './helpers'

const EMAIL = 'demo@haypbooks.test'
const PASSWORD = 'Dev@Seed#2026!Local'
const BACKEND = 'http://127.0.0.1:4000'

test.describe('Workspace selection', () => {
  test('login with demo user, verify companies visible, click company to reach dashboard', async ({ page, request, context }) => {
    await setupTestAuth(context, request)

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
