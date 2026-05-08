import { test, expect } from '@playwright/test'
import { setupTestAuth } from './helpers'

const EMAIL = 'demo@haypbooks.test'
const PASSWORD = 'Dev@Seed#2026!Local'
const BACKEND = 'http://127.0.0.1:4000'
const COMPANY_ID = 'company-00000000-0000-0000-0000-000000000001'


test.describe('Expense management end-to-end', () => {
  test.beforeEach(async ({ context, request }) => {
    await setupTestAuth(context, request)
  })

  test('vendor, bill, purchase order, and expense report flows', async ({ page }) => {
    const vendorName = `E2E Vendor ${Date.now()}`
    const billDescription = `E2E bill ${Date.now()}`
    const poDescription = `E2E PO ${Date.now()}`
    const expenseReportName = `E2E Expense Report ${Date.now()}`
    const expenseAmount = Number((100 + (Date.now() % 900) + ((Date.now() % 100) / 100)).toFixed(2))

    // Vendor flow
    await page.goto(`/expenses/vendors?company=${COMPANY_ID}`)
    await expect(page.locator('button', { hasText: 'New Vendor' })).toBeVisible({ timeout: 20000 })

    await page.locator('button', { hasText: 'New Vendor' }).click()
    await expect(page.locator('text=Display name as')).toBeVisible({ timeout: 10000 })

    await page.locator('text=Display name as').locator('xpath=following::input[1]').fill(vendorName)
    await page.locator('input[placeholder="example@acme.com"]').fill('e2e-vendor@example.com')
    await page.locator('input[placeholder="(000) 000-0000"]').fill('555-010-2000')
    await page.locator('input[placeholder="https://..."]').fill('https://example.com')
    await page.locator('button', { hasText: 'Save Vendor' }).click()

    await expect(page.locator('text=E2E Vendor').first()).toBeVisible({ timeout: 20000 })
    console.log('[TEST] Vendor created and visible in list')

    // Bill flow
    await page.goto(`/expenses/bills/new?company=${COMPANY_ID}`)
    await expect(page).toHaveURL(/expenses\/bills\/new/) 

    const vendorInput = page.locator('input[placeholder="Search vendors by name or email…"]')
    await expect(vendorInput).toBeVisible({ timeout: 15000 })
    await vendorInput.click()
    await vendorInput.fill(vendorName)
    await page.locator('button', { hasText: vendorName }).first().click()

    const today = new Date()
    const billDate = today.toISOString().slice(0, 10)
    const dueDate = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    await page.locator('#billDate').fill(billDate)
    await page.locator('#dueDate').fill(dueDate)

    const descInput = page.locator('input[placeholder="Item or description"]').first()
    await expect(descInput).toBeVisible({ timeout: 8000 })
    await descInput.fill(billDescription)

    const lineRow = page.locator('table tbody tr').first()
    const accountBtn = lineRow.locator('button[aria-haspopup="listbox"]').first()
    await accountBtn.scrollIntoViewIfNeeded()
    await accountBtn.click()
    const accountListbox = page.locator('div[role="listbox"]', { hasText: '1000 Cash' }).first()
    await expect(accountListbox).toBeVisible({ timeout: 10000 })
    const accountOption = accountListbox.locator('div[role="option"]').first()
    await expect(accountOption).toBeVisible({ timeout: 8000 })
    await accountOption.evaluate((el) => (el as HTMLElement).click())

    await lineRow.locator('input[type="number"]').first().fill('1')
    await page.locator('input[type="number"]').nth(1).fill('500.00')

    await page.locator('button', { hasText: 'Save Draft' }).click()
    await page.waitForURL(/bills-payments\/bills/, { timeout: 20000 })
    await expect(page.locator(`text=${vendorName}`)).toBeVisible({ timeout: 20000 })
    console.log('[TEST] Bill created and list refreshed')

    // Purchase order flow
    await page.goto(`/expenses/procurement/purchase-orders?company=${COMPANY_ID}`)
    await expect(page.locator('button', { hasText: 'New PO' })).toBeVisible({ timeout: 15000 })
    await page.locator('button', { hasText: 'New PO' }).click()
    await page.waitForURL(/expenses\/procurement\/purchase-orders\/new/, { timeout: 20000 })

    const poVendorInput = page.locator('input[placeholder="Search vendors…"]')
    await expect(poVendorInput).toBeVisible({ timeout: 15000 })
    await poVendorInput.click()
    await poVendorInput.fill(vendorName)
    await page.locator('button', { hasText: vendorName }).first().click()

    const poDescInput = page.locator('input[placeholder="Item description"]').first()
    await expect(poDescInput).toBeVisible({ timeout: 10000 })
    await poDescInput.fill(poDescription)

    const poAccountBtn = page.locator('table').first().locator('button', { hasText: 'Select' }).first()
    await poAccountBtn.scrollIntoViewIfNeeded()
    await poAccountBtn.click()
    const poAccountListbox = page.locator('div[role="listbox"]', { hasText: '1000 Cash' }).first()
    await expect(poAccountListbox).toBeVisible({ timeout: 10000 })
    const poAccountOption = poAccountListbox.locator('div[role="option"]').first()
    await expect(poAccountOption).toBeVisible({ timeout: 8000 })
    await poAccountOption.evaluate((el) => (el as HTMLElement).click())

    await page.locator('table input[type="number"]').nth(0).fill('2')
    await page.locator('table input[type="number"]').nth(1).fill('250.00')

    await page.locator('button', { hasText: 'Save Draft' }).click()
    await page.waitForURL(/expenses\/procurement\/orders/, { timeout: 20000 })
    await expect(page.locator('h1', { hasText: 'Purchase Orders' })).toBeVisible({ timeout: 20000 })
    console.log('[TEST] Purchase order created and purchase orders list loaded')

    // Expense report flow
    await page.goto(`/expenses/employee-expenses/expenses?company=${COMPANY_ID}`, { waitUntil: 'networkidle' })
    await expect(page.locator('h1:has-text("Expenses")')).toBeVisible({ timeout: 20000 })
    const newExpenseBtn = page.getByRole('button', { name: /New Expense/i }).first()
    await expect(newExpenseBtn).toBeVisible({ timeout: 20000 })
    await Promise.all([
      page.waitForURL(/expenses\/new/, { timeout: 20000 }),
      newExpenseBtn.click(),
    ])

    await page.locator('#report-name').fill(expenseReportName)
    const reportFrom = page.locator('#report-from-date')
    const reportTo = page.locator('#report-to-date')
    await reportFrom.fill(billDate)
    await reportTo.fill(dueDate)

    await page.getByLabel('Employee').click()
    const employeeOption = page.locator('[role="option"]').first()
    await employeeOption.evaluate((el) => (el as HTMLElement).click())

    const expenseDescInput = page.locator('input[placeholder="Description"]').first()
    await expect(expenseDescInput).toBeVisible({ timeout: 10000 })
    await expenseDescInput.fill('Consulting services')

    const expenseVendorSelect = page.getByRole('button', { name: /Select vendor/i }).first()
    await expenseVendorSelect.click()
    const expenseVendorOption = page.locator('[role="option"]', { hasText: vendorName }).first()
    await expect(expenseVendorOption).toBeVisible({ timeout: 10000 })
    await expenseVendorOption.evaluate((el) => (el as HTMLElement).click())

    const expenseAccountSelect = page.getByRole('button', { name: /Select account/i }).first()
    await expenseAccountSelect.click()
    await page.locator('[role="listbox"]').last().locator('[role="option"]').first().evaluate((el) => (el as HTMLElement).click())

    await page.locator('input[aria-label="Expense amount"]').first().fill(expenseAmount.toFixed(2))

    await page.locator('button', { hasText: 'Save Draft' }).click()
    await page.waitForURL(/expenses\/employee-expenses\/expenses/, { timeout: 20000 })
    await expect(page.getByText(`$${expenseAmount.toFixed(2)}`).first()).toBeVisible({ timeout: 20000 })

    const reportRow = page.locator('div[role="row"]', { hasText: `$${expenseAmount.toFixed(2)}` }).first()
    const reportActionTrigger = reportRow.locator('[data-slot="dropdown-menu-trigger"]')
    await expect(reportActionTrigger).toBeVisible({ timeout: 10000 })
    await reportActionTrigger.scrollIntoViewIfNeeded()
    await reportActionTrigger.click()
    const viewDetailsItem = page.locator('[data-slot="dropdown-menu-item"]', { hasText: 'View details' }).first()
    await expect(viewDetailsItem).toBeVisible({ timeout: 10000 })
    await viewDetailsItem.click()
    await page.waitForURL(/expenses\/employee-expenses\/expenses\/[^/]+$/)
    await expect(page.getByText(expenseReportName, { exact: false }).first()).toBeVisible({ timeout: 20000 })
    console.log('[TEST] Expense report detail page loaded successfully')
  })
})
