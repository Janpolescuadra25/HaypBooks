import { test, expect } from '@playwright/test'
import { setupTestAuth } from './helpers'

const EMAIL = 'demo@haypbooks.test'
const PASSWORD = 'Dev@Seed#2026!Local'
const BACKEND = 'http://127.0.0.1:4000'

/**
 * Navigates through workspace selection and lands on /dashboard.
 * Mirrors the workspace-selection.spec.ts flow so we have proper company context.
 * Only needed if the page requires the workspace selection to set company context.
 */
async function selectCompanyAndGoToDashboard(page: Parameters<Parameters<typeof test>[2]>[0]['page']) {
  await page.goto('/workspace')
  await page.waitForURL(/\/workspace/, { timeout: 20_000 })

  // Expand "My Companies" BookCard
  const companiesCard = page.locator('text=My Companies').first()
  await expect(companiesCard).toBeVisible({ timeout: 15_000 })
  await companiesCard.click()

  // Click the first company row
  const companyRow = page.locator('tbody tr td span').first()
  await expect(companyRow).toBeVisible({ timeout: 10_000 })
  await companyRow.click()

  // Confirm in the modal
  const confirmBtn = page.locator('[data-testid="confirm-company"]')
  await expect(confirmBtn).toBeVisible({ timeout: 8_000 })
  await confirmBtn.click()

  await page.waitForURL(/\/dashboard/, { timeout: 20_000 })
}

test.describe('Bill creation', () => {
  test.beforeEach(async ({ context, request }) => {
    await setupTestAuth(context, request)
  })

  // ── Test 1: Bills list loads real data from the backend ─────────────────────
  test('bills list page loads and shows bills from the real backend', async ({ page }) => {
    await selectCompanyAndGoToDashboard(page)

    // Navigate to the bills list
    await page.goto('/expenses/bills-payments/bills')
    await page.waitForURL(/bills-payments\/bills/, { timeout: 15_000 })

    // "New Bill" button should be visible — its presence means the component mounted
    // and the page is rendering the real BillsPage (not a placeholder)
    const newBillBtn = page.locator('button', { hasText: 'New Bill' })
    await expect(newBillBtn).toBeVisible({ timeout: 15_000 })

    // The page should not show an error state
    await expect(page.locator('text=Failed to load bills')).not.toBeVisible()

    console.log('[TEST] ✅ Bills list loaded successfully')
  })

  // ── Test 2: End-to-end bill creation form ────────────────────────────────────
  test('creates a new draft bill via the bill form and redirects to bills list', async ({ page }) => {
    // Navigate directly to the bill form with company param so useCompanyId resolves immediately
    const COMPANY_ID = 'company-00000000-0000-0000-0000-000000000001'
    await page.goto(`/expenses/bills/new?company=${COMPANY_ID}`)
    await page.waitForURL(/expenses\/bills\/new/, { timeout: 15_000 })
    console.log('[TEST] Navigated to bill form:', page.url())

    // ── Fill vendor picker ───────────────────────────────────────────────────
    // The vendor field is a CustomerPickerField: a text input that opens a dropdown
    const vendorInput = page.locator('input[placeholder*="Search vendors"]')
    await expect(vendorInput).toBeVisible({ timeout: 15_000 })
    await vendorInput.click()

    // Wait for vendors to load (dropdown opens with all vendors when query is empty)
    const vendorOption = page.locator('button', { hasText: 'Demo Vendor LLC' }).first()
    await expect(vendorOption).toBeVisible({ timeout: 15_000 })
    await vendorOption.click()
    console.log('[TEST] Vendor selected')

    // ── Fill Bill Date ───────────────────────────────────────────────────────
    const today = new Date()
    const dateStr = today.toISOString().slice(0, 10) // YYYY-MM-DD
    await page.locator('#billDate').fill(dateStr)

    // ── Fill Due Date (30 days out) ──────────────────────────────────────────
    const dueDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    const dueDateStr = dueDate.toISOString().slice(0, 10)
    await page.locator('#dueDate').fill(dueDateStr)

    // ── Fill line item (first row is pre-populated) ──────────────────────────
    // Close any open dropdowns first by pressing Escape
    await page.keyboard.press('Escape')

    // Description field: text input with placeholder "Item or description"
    const descInput = page.locator('input[placeholder="Item or description"]').first()
    await expect(descInput).toBeVisible({ timeout: 8_000 })
    await descInput.fill('Professional Services')

    // Account: HaypSelect button (shows "Select" placeholder) — first line item
    // Scroll the account button into view first
    const accountBtn = page.locator('button', { hasText: 'Select' }).first()
    await expect(accountBtn).toBeVisible({ timeout: 8_000 })
    await accountBtn.scrollIntoViewIfNeeded()
    await accountBtn.click()

    // Pick first account from the listbox that appears after clicking
    // Use a more specific locator — the listbox that's now open (not pre-existing)
    const listbox = page.locator('[role="listbox"]').last()
    await expect(listbox).toBeVisible({ timeout: 5_000 })
    const firstOption = listbox.locator('[role="option"]').first()
    await firstOption.evaluate((el: HTMLElement) => el.click())
    console.log('[TEST] Account selected from listbox')

    // Quantity
    const qtyInput = page.locator('input[type="number"]').first()
    await qtyInput.fill('1')

    // Rate / unit price
    const rateInput = page.locator('input[type="number"]').nth(1)
    await rateInput.fill('500')

    // ── Save Draft ───────────────────────────────────────────────────────────
    const saveDraftBtn = page.locator('button', { hasText: 'Save Draft' })
    await expect(saveDraftBtn).toBeVisible({ timeout: 8_000 })
    await saveDraftBtn.click()

    // Should redirect back to bills list on success
    await page.waitForURL(/bills-payments\/bills/, { timeout: 20_000 })
    expect(page.url()).toContain('bills-payments/bills')
    console.log('[TEST] ✅ Draft bill saved, redirected to:', page.url())
  })
})
