import { test, expect } from '@playwright/test'
import { loadContext, gotoSalesPage, waitForTableToLoad } from '../helpers/navigation'

const PAGE_INVOICES = '/sales/billing/invoices'
const PAGE_PAYMENTS = '/sales/collections/payments'
const PAGE_CREDIT_NOTES = '/sales/revenue/credit-notes'
const PAGE_UNDEPOSITED = '/banking/transactions/undeposited-funds'

function uniqueName(base: string) {
  return `${base} ${Date.now().toString().slice(-6)}`
}

async function ensureCustomerSelected(page: any, customerName: string, customerEmail: string) {
  const customerInput = page.getByPlaceholder(/search customers by name or email/i).first()
  await expect(customerInput).toBeVisible({ timeout: 10000 })
  await customerInput.click()
  await customerInput.fill(customerName)

  const optionByEmail = page.getByRole('button', { name: new RegExp(customerEmail, 'i') }).first()
  const optionByName = page.getByRole('button', { name: new RegExp(customerName, 'i') }).first()
  if (await optionByEmail.isVisible({ timeout: 5000 }).catch(() => false)) {
    await optionByEmail.click()
  } else if (await optionByName.isVisible({ timeout: 5000 }).catch(() => false)) {
    await optionByName.click()
  } else {
    const createNew = page.getByRole('button', { name: /\+ Create New Customer/i }).first()
    await expect(createNew).toBeVisible({ timeout: 10000 })
    await createNew.click()
    await expect(page.getByRole('heading', { name: /new customer/i })).toBeVisible({ timeout: 10000 })
    await page.getByPlaceholder(/Full name or business name/i).fill(customerName)
    await page.getByPlaceholder(/customer@email\.com/i).fill(customerEmail)
    await page.getByRole('button', { name: /Create & Select/i }).click()
    await expect(page.getByRole('button', { name: /Change/i })).toBeVisible({ timeout: 10000 })
  }
}

async function selectCustomerInPayment(page: any, customerName: string, customerEmail: string) {
  const customerInput = page.getByPlaceholder(/select customer/i).first()
  await expect(customerInput).toBeVisible({ timeout: 10000 })
  await customerInput.click()
  await customerInput.fill(customerName)

  const optionByEmail = page.getByRole('button', { name: new RegExp(customerEmail, 'i') }).first()
  const optionByName = page.getByRole('button', { name: new RegExp(customerName, 'i') }).first()
  if (await optionByEmail.isVisible({ timeout: 5000 }).catch(() => false)) {
    await optionByEmail.click()
  } else if (await optionByName.isVisible({ timeout: 5000 }).catch(() => false)) {
    await optionByName.click()
  } else {
    const createNew = page.getByRole('button', { name: /\+ Create New Customer/i }).first()
    await expect(createNew).toBeVisible({ timeout: 10000 })
    await createNew.click()
    await expect(page.getByRole('heading', { name: /new customer/i })).toBeVisible({ timeout: 10000 })
    await page.getByPlaceholder(/Full name or business name/i).fill(customerName)
    await page.getByPlaceholder(/customer@email\.com/i).fill(customerEmail)
    await page.getByRole('button', { name: /Create & Select/i }).click()
    await expect(page.getByRole('button', { name: /Clear customer/i })).toBeVisible({ timeout: 10000 })
  }
}

async function createCreditNote(page: any, customerName: string, customerEmail: string, amount: string) {
  await page.getByRole('button', { name: /new credit note/i }).first().click()
  await expect(page.getByRole('heading', { name: /new credit note/i })).toBeVisible({ timeout: 10000 })

  const customerInput = page.getByPlaceholder(/select customer/i).first()
  await customerInput.click()
  await customerInput.fill(customerName)

  const optionByEmail = page.getByRole('button', { name: new RegExp(customerEmail, 'i') }).first()
  const optionByName = page.getByRole('button', { name: new RegExp(customerName, 'i') }).first()
  if (await optionByEmail.isVisible({ timeout: 5000 }).catch(() => false)) {
    await optionByEmail.click()
  } else if (await optionByName.isVisible({ timeout: 5000 }).catch(() => false)) {
    await optionByName.click()
  } else {
    const createNew = page.getByRole('button', { name: /\+ Create New Customer/i }).first()
    await expect(createNew).toBeVisible({ timeout: 15000 })
    await createNew.click()
    await expect(page.getByRole('heading', { name: /new customer/i })).toBeVisible({ timeout: 15000 })
    await page.getByPlaceholder(/Full name or business name/i).fill(customerName)
    await page.getByPlaceholder(/customer@email\.com/i).fill(customerEmail)
    await page.getByRole('button', { name: /Create & Select/i }).click()
    await expect(page.getByRole('button', { name: /Change/i })).toBeVisible({ timeout: 15000 })
  }

  const creditAmountInput = page.locator('form:has-text("Create Credit Note") input[placeholder="0.00"]').first()
  await expect(creditAmountInput).toBeVisible({ timeout: 10000 })
  await creditAmountInput.fill(amount)
  await page.getByRole('button', { name: /Create Credit Note/i }).click()
  await expect(page.getByText(/Credit note created/i).first()).toBeVisible({ timeout: 10000 })
}

async function applyCreditNoteToInvoice(page: any, invoiceNumber: string, amount: string) {
  const row = page.locator('table tbody tr').first()
  await expect(row).toBeVisible({ timeout: 10000 })
  await row.click()

  await page.getByRole('button', { name: /Apply to Invoice/i }).click()
  const modal = page.locator('div[role="dialog"], div.fixed.inset-0').filter({ hasText: /apply credit note/i }).first()
  await expect(modal).toBeVisible({ timeout: 15000 })

  const invoicePicker = page.getByPlaceholder(/search open invoices/i).first()
  await expect(invoicePicker).toBeVisible({ timeout: 15000 })
  await invoicePicker.click()
  await invoicePicker.fill(invoiceNumber)

  const invoiceOption = page.locator('button[id^="option-"]:visible').first()
  await expect(invoiceOption).toBeVisible({ timeout: 15000 })
  await invoiceOption.click()
  await expect(invoicePicker).not.toHaveValue('', { timeout: 15000 })

  const amountInput = modal.getByLabel(/Amount to apply/i).first()
  await expect(amountInput).toBeVisible({ timeout: 15000 })
  await amountInput.fill(amount)
  await modal.getByRole('button', { name: /^Apply$/i }).click()
  await expect(modal).not.toBeVisible({ timeout: 15000 })
}

async function depositUndepositedPayment(page: any, customerName: string) {
  const targetRow = page.locator('table tbody tr', { hasText: customerName }).first()
  await expect(targetRow).toBeVisible({ timeout: 10000 })
  await targetRow.getByRole('button', { name: /Deposit/i }).click()

  await expect(page.getByLabel('Destination Bank Account')).toBeVisible({ timeout: 10000 })
  const accountSelect = page.getByLabel('Destination Bank Account')
  await accountSelect.selectOption({ index: 1 })
  await page.getByRole('button', { name: /Create Deposit/i }).click()
  await expect(page.getByText(/Deposit created successfully/i)).toBeVisible({ timeout: 10000 })
}

test('end-to-end sales flow: invoice → payment → credit note → bank deposit', async ({ page }) => {
  const ctx = loadContext()
  const companyId = ctx.companyId
  const customerName = uniqueName('E2E Customer')
  const customerEmail = `e2e-fullflow-${Date.now()}@haypbooks.test`
  const invoiceDescription = uniqueName('E2E Invoice Item')
  const invoiceAmount = '110.00'
  const paymentAmount = '40.00'
  const creditAmount = '20.00'

  await gotoSalesPage(page, PAGE_INVOICES, companyId)
  await waitForTableToLoad(page)
  await page.getByRole('button', { name: /new invoice/i }).first().click()
  await page.waitForURL(/invoices\/new/, { timeout: 15000 })
  await expect(page.getByText(/INVOICE #NEW/i)).toBeVisible({ timeout: 10000 })

  await ensureCustomerSelected(page, customerName, customerEmail)

  const lineDescription = page.getByPlaceholder(/description/i).first()
  await expect(lineDescription).toBeVisible({ timeout: 15000 })
  await lineDescription.fill(invoiceDescription)

  const lineRow = page.locator('table tbody tr').first()
  const lineNumericInputs = lineRow.locator('input[type="number"]')
  await lineNumericInputs.nth(0).click()
  await lineNumericInputs.nth(0).fill('1')
  await lineNumericInputs.nth(1).click()
  await lineNumericInputs.nth(1).fill(invoiceAmount)

  await page.getByRole('button', { name: /Send Invoice/i }).first().click()
  await page.waitForURL(/sales\/billing\/invoices(?:$|\?)/, { timeout: 20000 })
  await expect(page.getByRole('heading', { name: /invoices/i })).toBeVisible({ timeout: 10000 })

  const invoiceRow = page.locator('table tbody tr', { hasText: customerName }).first()
  await expect(invoiceRow).toBeVisible({ timeout: 15000 })
  const invoiceNumber = (await invoiceRow.locator('td').nth(1).textContent())?.trim() ?? ''
  expect(invoiceNumber).toMatch(/INV-|\d+/)

  await gotoSalesPage(page, PAGE_PAYMENTS, companyId)
  await waitForTableToLoad(page)
  await page.getByRole('button', { name: /new payment/i }).first().click()
  await expect(page.getByRole('heading', { name: /record payment/i })).toBeVisible({ timeout: 10000 })

  await selectCustomerInPayment(page, customerName, customerEmail)

  const invoiceCheckbox = page.locator('label:has-text("INV-") input[type="checkbox"]').first()
  await expect(invoiceCheckbox).toBeVisible({ timeout: 15000 })
  await invoiceCheckbox.check()

  const paymentAmountInput = page.locator('form#record-payment-form input[type="number"]').first()
  await expect(paymentAmountInput).toBeVisible({ timeout: 15000 })
  await paymentAmountInput.fill(paymentAmount)
  await page.getByRole('button', { name: /Record Payment/i }).click()
  await expect(page.getByRole('heading', { name: /customer payments/i })).toBeVisible({ timeout: 15000 })

  await gotoSalesPage(page, PAGE_CREDIT_NOTES, companyId)
  await waitForTableToLoad(page)
  await createCreditNote(page, customerName, customerEmail, creditAmount)
  await applyCreditNoteToInvoice(page, invoiceNumber, creditAmount)

  await gotoSalesPage(page, PAGE_UNDEPOSITED, companyId)
  await waitForTableToLoad(page)
  await depositUndepositedPayment(page, customerName)
})
