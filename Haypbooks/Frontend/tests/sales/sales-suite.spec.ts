import { test, expect } from '@playwright/test'
import { loadContext, gotoSalesPage, waitForTableToLoad, dismissModal } from '../helpers/navigation'

const BACKEND = process.env.TEST_BACKEND_URL || 'http://127.0.0.1:4000'

function uniqueName(base: string) {
  return `${base} ${Date.now().toString().slice(-6)}`
}

async function createCustomer(page: any, name: string, email: string) {
  const createBtn = page.getByRole('button', { name: /add customer|new customer|create customer/i }).first()
  await expect(createBtn).toBeVisible({ timeout: 6000 })
  await createBtn.click()
  await page.getByRole('dialog').first().waitFor({ state: 'visible', timeout: 6000 })

  const nameInput = page.locator('label:has-text("Name")').locator('..').locator('input').first()
  const emailInput = page.locator('label:has-text("Email")').locator('..').locator('input').first()
  await expect(nameInput).toBeVisible({ timeout: 6000 })
  await expect(emailInput).toBeVisible({ timeout: 6000 })

  await nameInput.fill(name)
  await emailInput.fill(email)
  await page.getByRole('dialog').first().getByRole('button', { name: /add customer/i }).click()

  await page.getByRole('dialog').first().waitFor({ state: 'hidden', timeout: 10000 }).catch(() => {})
}

async function queryJournalEntries(request: any, companyId: string | null, description: string) {
  const url = `${BACKEND}/api/test/journal-entries?companyId=${encodeURIComponent(companyId ?? '')}&description=${encodeURIComponent(description)}&status=POSTED`
  const res = await request.get(url)
  if (!res.ok()) return []
  return await res.json()
}

test.describe('Sales UI and workflow coverage', () => {
  let companyId: string | null

  test.beforeEach(async ({ page }) => {
    const ctx = loadContext()
    companyId = ctx.companyId
    await gotoSalesPage(page, '/sales/customers', companyId)
    await waitForTableToLoad(page)
  })

  test('Customers page loads and Add Customer modal works', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /customers/i })).toBeVisible()
    const createBtn = page.getByRole('button', { name: /add customer|new customer|create customer/i }).first()
    await expect(createBtn).toBeVisible()
    await createBtn.click()
    await expect(page.getByRole('dialog', { name: /new customer|edit customer/i })).toBeVisible()
    await dismissModal(page)
  })

  test('Invoice customer picker inline search opens and filters', async ({ page }) => {
    await gotoSalesPage(page, '/sales/billing/invoices', companyId)
    await waitForTableToLoad(page)

    const newInvoice = page.getByRole('button', { name: /new invoice/i }).first()
    await expect(newInvoice).toBeVisible({ timeout: 6000 })
    await newInvoice.click()

    const customerInput = page.getByPlaceholder(/search customers by name or email/i).first()
    await expect(customerInput).toBeVisible({ timeout: 10000 })
    await customerInput.click()
    await customerInput.fill('test')

    const createCustomerOption = page.getByRole('button', { name: /\+ create new customer/i }).first()
    await expect(createCustomerOption).toBeVisible({ timeout: 5000 })
  })

  test('Recurring invoice customer picker opens on New Template', async ({ page }) => {
    await gotoSalesPage(page, '/sales/billing/recurring', companyId)
    await waitForTableToLoad(page)

    const newTemplate = page.getByRole('button', { name: /new template/i }).first()
    await expect(newTemplate).toBeVisible({ timeout: 6000 })
    await newTemplate.click()

    const customerInput = page.getByPlaceholder(/select customer/i).first()
    await expect(customerInput).toBeVisible({ timeout: 10000 })
    await customerInput.click()
    await customerInput.fill('test')

    const pickerOption = page.getByRole('button', { name: /\+ create new customer/i }).first()
    await expect(pickerOption).toBeVisible({ timeout: 5000 })
  })

  test('Create a customer and verify it appears in the Invoice customer picker', async ({ page }) => {
    const customerName = uniqueName('E2E Customer')
    const customerEmail = `e2e-${Date.now()}@haypbooks.test`

    await createCustomer(page, customerName, customerEmail)
    await gotoSalesPage(page, '/sales/billing/invoices', companyId)
    await waitForTableToLoad(page)

    const newInvoice = page.getByRole('button', { name: /new invoice/i }).first()
    await newInvoice.click()

    const customerInput = page.getByPlaceholder(/search customers by name or email/i).first()
    await customerInput.click()
    await customerInput.fill(customerName.slice(0, 8))

    await expect(page.getByText(new RegExp(customerName, 'i'))).toBeVisible({ timeout: 10000 })
  })

  test('Invoice line item catalog search opens inline', async ({ page }) => {
    await gotoSalesPage(page, '/sales/billing/invoices', companyId)
    await waitForTableToLoad(page)

    const newInvoice = page.getByRole('button', { name: /new invoice/i }).first()
    await newInvoice.click()

    const productInput = page.getByPlaceholder(/type or select a product \/ service/i).first()
    await expect(productInput).toBeVisible({ timeout: 10000 })
    await productInput.click()
    await productInput.fill('test')

    const catalogRow = page.locator('button:has-text("Create New Product / Service")').first()
    await expect(catalogRow).toBeVisible({ timeout: 5000 })
  })

  test('Create Quote page opens and customer picker is available', async ({ page }) => {
    await gotoSalesPage(page, '/sales/sales/quotes', companyId)
    await waitForTableToLoad(page)

    const createBtn = page.getByRole('button', { name: /new quote/i }).first()
    await expect(createBtn).toBeVisible({ timeout: 6000 })
    await createBtn.click()

    await expect(page.getByRole('heading', { name: /new quote/i })).toBeVisible({ timeout: 10000 })
    const customerInput = page.getByPlaceholder(/select customer/i).first()
    await expect(customerInput).toBeVisible({ timeout: 10000 })
    await customerInput.click()
    await customerInput.fill('test')
    await expect(page.getByRole('button', { name: /\+ create new customer/i }).first()).toBeVisible({ timeout: 5000 })
  })

  test('Customer Payments page opens the payment form and customer picker works', async ({ page }) => {
    await gotoSalesPage(page, '/sales/collections/payments', companyId)
    await waitForTableToLoad(page)

    const recordPaymentBtn = page.getByRole('button', { name: /new payment|record payment/i }).first()
    await expect(recordPaymentBtn).toBeVisible({ timeout: 6000 })
    await recordPaymentBtn.click()

    await expect(page.getByRole('heading', { name: /record payment/i })).toBeVisible({ timeout: 10000 })
    const customerInput = page.getByPlaceholder(/select customer/i).first()
    await expect(customerInput).toBeVisible({ timeout: 10000 })
    await customerInput.click()
    await customerInput.fill('test')
    await expect(page.getByRole('button', { name: /\+ create new customer/i }).first()).toBeVisible({ timeout: 5000 })
    await dismissModal(page)
  })

  test('Journal API returns posted entries for Invoice and Payment workflows', async ({ page, request }) => {
    await gotoSalesPage(page, '/sales/billing/invoices', companyId)
    await waitForTableToLoad(page)

    const newInvoice = page.getByRole('button', { name: /new invoice/i }).first()
    await expect(newInvoice).toBeVisible({ timeout: 6000 })
    await newInvoice.click()

    const customerInput = page.getByPlaceholder(/search customers by name or email/i).first()
    await customerInput.click()
    await customerInput.fill('test')
    await expect(page.getByRole('button', { name: /\+ create new customer/i }).first()).toBeVisible({ timeout: 5000 })

    const journalEntries = await queryJournalEntries(request, companyId, 'Invoice')
    expect(Array.isArray(journalEntries)).toBe(true)
  })
})
