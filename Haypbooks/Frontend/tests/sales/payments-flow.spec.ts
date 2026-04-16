/**
 * tests/sales/payments-flow.spec.ts
 *
 * E2E flow coverage for recording a customer payment from the fullscreen editor,
 * including checkbox allocation behavior and payment details drawer verification.
 */

import { test, expect, type APIRequestContext } from '@playwright/test'
import { loadContext, gotoSalesPage, waitForTableToLoad } from '../helpers/navigation'

const PAGE_PATH = '/sales/collections/payments'

interface OpenInvoiceFixture {
  customerName: string
  invoiceNumber: string
  remainingBalance: number
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function listFromResponse(payload: any): any[] {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

async function apiJson(
  request: APIRequestContext,
  method: 'GET' | 'POST' | 'PUT',
  path: string,
  data?: any,
) {
  const response = await request.fetch(path, data === undefined ? { method } : { method, data })
  const raw = await response.text()

  if (!response.ok()) {
    throw new Error(`${method} ${path} failed (${response.status()}): ${raw.slice(0, 400)}`)
  }

  if (!raw) return {}
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

interface ReallocationFixture {
  customerName: string
  firstInvoiceNumber: string
  secondInvoiceNumber: string
}

async function createReallocationFixture(
  request: APIRequestContext,
  companyId: string,
  seed: string,
): Promise<ReallocationFixture> {
  const customerName = `00 E2E Realloc Customer ${seed}`
  const customerEmail = `e2e-realloc-${seed}@haypbooks.test`

  const customer = await apiJson(request, 'POST', `/api/companies/${companyId}/ar/customers`, {
    name: customerName,
    email: customerEmail,
  })

  const customerId = String(customer?.contactId ?? customer?.id ?? '').trim()
  if (!customerId) throw new Error('Customer creation did not return a customer id')

  const dueDate = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const createAndSendInvoice = async (suffix: string, amount: number) => {
    const created = await apiJson(request, 'POST', `/api/companies/${companyId}/ar/invoices`, {
      customerId,
      dueDate,
      items: [
        {
          description: `E2E reallocation invoice ${suffix}`,
          quantity: 1,
          unitPrice: amount,
          amount,
        },
      ],
    })

    const invoiceId = String(created?.id ?? '').trim()
    if (!invoiceId) throw new Error(`Invoice creation failed for ${suffix}`)

    await apiJson(request, 'POST', `/api/companies/${companyId}/ar/invoices/${invoiceId}/send`, {})
    const sent = await apiJson(request, 'GET', `/api/companies/${companyId}/ar/invoices/${invoiceId}`)

    return String(sent?.invoiceNumber ?? created?.invoiceNumber ?? `INV-${suffix}`).trim()
  }

  const firstInvoiceNumber = await createAndSendInvoice(`${seed}-A`, 120)
  const secondInvoiceNumber = await createAndSendInvoice(`${seed}-B`, 95)

  return {
    customerName,
    firstInvoiceNumber,
    secondInvoiceNumber,
  }
}

async function createOpenInvoiceFixture(
  request: APIRequestContext,
  companyId: string,
  seed: string,
): Promise<OpenInvoiceFixture> {
  const customerName = `00 E2E Payment Customer ${seed}`
  const customerEmail = `e2e-payment-${seed}@haypbooks.test`
  const invoiceAmount = 137.42

  const customer = await apiJson(request, 'POST', `/api/companies/${companyId}/ar/customers`, {
    name: customerName,
    email: customerEmail,
  })

  const customerId = String(customer?.contactId ?? customer?.id ?? '').trim()
  if (!customerId) {
    throw new Error('Customer creation did not return a customer id')
  }

  const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const invoice = await apiJson(request, 'POST', `/api/companies/${companyId}/ar/invoices`, {
    customerId,
    dueDate,
    items: [
      {
        description: `E2E allocation invoice ${seed}`,
        quantity: 1,
        unitPrice: invoiceAmount,
        amount: invoiceAmount,
      },
    ],
  })

  const invoiceId = String(invoice?.id ?? '').trim()
  if (!invoiceId) {
    throw new Error('Invoice creation did not return an invoice id')
  }

  await apiJson(request, 'POST', `/api/companies/${companyId}/ar/invoices/${invoiceId}/send`, {})
  const sentInvoice = await apiJson(request, 'GET', `/api/companies/${companyId}/ar/invoices/${invoiceId}`)

  const invoiceNumber = String(sentInvoice?.invoiceNumber ?? invoice?.invoiceNumber ?? '').trim() || `INV-${seed}`
  const parsedBalance = Number(sentInvoice?.amountDue ?? sentInvoice?.balance ?? invoiceAmount)
  const remainingBalance = Number.isFinite(parsedBalance) && parsedBalance > 0 ? parsedBalance : invoiceAmount

  return {
    customerName: String(customer?.name ?? customer?.displayName ?? customerName),
    invoiceNumber,
    remainingBalance,
  }
}

test.describe('Customer Payments - fullscreen payment flow', () => {
  let companyId: string | null

  test.beforeEach(async ({ page }) => {
    const ctx = loadContext()
    companyId = ctx.companyId
    await gotoSalesPage(page, PAGE_PATH, companyId)
    await waitForTableToLoad(page)
  })

  test('records a payment with checkbox allocations and shows details drawer data', async ({ page, request }) => {
    test.skip(!companyId, 'No companyId found in auth context')

    const seed = `${Date.now().toString().slice(-8)}`
    const paymentReference = `E2E-PAY-${seed}`

    const fixture = await createOpenInvoiceFixture(request, companyId!, seed)

    const newPaymentButton = page.getByRole('button', { name: /new payment/i }).first()
    await expect(newPaymentButton).toBeVisible({ timeout: 10_000 })
    await newPaymentButton.click()

    const heading = page.getByRole('heading', { name: /^record payment$/i }).first()
    await expect(heading).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('form#record-payment-form')).toBeVisible()

    const customerInput = page.locator('input[placeholder*="Select customer"]').first()
    await expect(customerInput).toBeVisible({ timeout: 10_000 })
    await customerInput.click()
    await customerInput.fill(fixture.customerName.slice(0, 24))

    const customerOption = page
      .getByRole('button', { name: new RegExp(escapeRegExp(fixture.customerName), 'i') })
      .first()
    await expect(customerOption).toBeVisible({ timeout: 10_000 })
    await customerOption.click()

    const invoiceRow = page.locator('label').filter({ hasText: fixture.invoiceNumber }).first()
    await expect(invoiceRow).toBeVisible({ timeout: 10_000 })

    const invoiceCheckbox = invoiceRow.locator('input[type="checkbox"]').first()
    await expect(invoiceCheckbox).not.toBeChecked()
    await invoiceCheckbox.check()

    const amountInput = page.locator('input[type="number"][min="0.01"]').first()
    await expect.poll(async () => Number(await amountInput.inputValue() || '0')).toBeGreaterThan(0)
    const autoAmount = Number(await amountInput.inputValue())
    expect(autoAmount).toBeCloseTo(fixture.remainingBalance, 2)

    const selectedAllocationsHeading = page.getByText(/selected allocations/i).first()
    await expect(selectedAllocationsHeading).toBeVisible()

    await invoiceCheckbox.uncheck()
    await expect(selectedAllocationsHeading).toBeHidden()
    await expect(amountInput).toHaveValue('')

    await invoiceCheckbox.check()
    await expect(amountInput).not.toHaveValue('')

    const referenceInput = page.locator('input[placeholder*="Check # or ref"]').first()
    await expect(referenceInput).toBeVisible()
    await referenceInput.fill(paymentReference)

    const submitButton = page.locator('button[form="record-payment-form"]').first()
    await submitButton.click()

    await expect(heading).toBeHidden({ timeout: 15_000 })
    await waitForTableToLoad(page)

    const searchInput = page.locator('input[placeholder*="Search by payment"]').first()
    await searchInput.fill(paymentReference)
    await page.waitForTimeout(400)

    const createdRow = page.locator('table tbody tr').filter({ hasText: paymentReference }).first()
    await expect(createdRow).toBeVisible({ timeout: 10_000 })
    await expect(createdRow).toContainText(fixture.invoiceNumber)

    await createdRow.click()

    const drawer = page.locator('div.fixed.inset-0.z-50.flex').last()
    await expect(drawer).toBeVisible({ timeout: 10_000 })
    await expect(drawer.getByRole('heading', { name: paymentReference })).toBeVisible()
    await expect(drawer.getByText(fixture.customerName).first()).toBeVisible()
    await expect(drawer.getByText(/total allocated/i)).toBeVisible()
    await expect(drawer.getByText(fixture.invoiceNumber).first()).toBeVisible()
  })

  test('reallocates unapplied cash to a second invoice', async ({ page, request }) => {
    test.skip(!companyId, 'No companyId found in auth context')

    const seed = `${Date.now().toString().slice(-8)}`
    const paymentReference = `E2E-REALLOC-${seed}`
    const fixture = await createReallocationFixture(request, companyId!, seed)

    const newPaymentButton = page.getByRole('button', { name: /new payment/i }).first()
    await expect(newPaymentButton).toBeVisible({ timeout: 10_000 })
    await newPaymentButton.click()

    const recordHeading = page.getByRole('heading', { name: /^record payment$/i }).first()
    await expect(recordHeading).toBeVisible({ timeout: 10_000 })

    const customerInput = page.locator('input[placeholder*="Select customer"]').first()
    await customerInput.click()
    await customerInput.fill(fixture.customerName.slice(0, 24))

    const customerOption = page
      .getByRole('button', { name: new RegExp(escapeRegExp(fixture.customerName), 'i') })
      .first()
    await expect(customerOption).toBeVisible({ timeout: 10_000 })
    await customerOption.click()

    const firstInvoiceRow = page.locator('label').filter({ hasText: fixture.firstInvoiceNumber }).first()
    await expect(firstInvoiceRow).toBeVisible({ timeout: 10_000 })
    await firstInvoiceRow.locator('input[type="checkbox"]').first().check()

    const amountInput = page.locator('input[type="number"][min="0.01"]').first()
    await expect(amountInput).toBeVisible({ timeout: 10_000 })
    await amountInput.fill('150')

    const referenceInput = page.locator('input[placeholder*="Check # or ref"]').first()
    await referenceInput.fill(paymentReference)

    await page.locator('button[form="record-payment-form"]').first().click()
    await expect(recordHeading).toBeHidden({ timeout: 15_000 })
    await waitForTableToLoad(page)

    const searchInput = page.locator('input[placeholder*="Search by payment"]').first()
    await searchInput.fill(paymentReference)
    await page.waitForTimeout(400)

    const createdRow = page.locator('table tbody tr').filter({ hasText: paymentReference }).first()
    await expect(createdRow).toBeVisible({ timeout: 10_000 })
    await createdRow.click()

    const drawer = page.locator('div.fixed.inset-0.z-50.flex').last()
    await expect(drawer).toBeVisible({ timeout: 10_000 })
    await expect(drawer.getByRole('button', { name: /reallocate/i })).toBeVisible()
    await drawer.getByRole('button', { name: /reallocate/i }).click()

    const reallocateHeading = page.getByRole('heading', { name: /^reallocate payment$/i }).first()
    await expect(reallocateHeading).toBeVisible({ timeout: 10_000 })

    const invoiceSearchInput = page.locator('input[placeholder*="Search open invoices"]').first()
    await invoiceSearchInput.fill(fixture.secondInvoiceNumber)

    const secondInvoiceRow = page.locator('label').filter({ hasText: fixture.secondInvoiceNumber }).first()
    await expect(secondInvoiceRow).toBeVisible({ timeout: 10_000 })
    await secondInvoiceRow.locator('input[type="checkbox"]').first().check()

    const secondAllocationInput = page.locator('input[type="number"][min="0"]').nth(1)
    await expect(secondAllocationInput).toBeVisible({ timeout: 10_000 })
    await secondAllocationInput.fill('30')

    const saveButton = page.locator('button[form="record-payment-form"]').first()
    await expect(saveButton).toHaveText(/save reallocation/i)
    await saveButton.click()

    await expect(reallocateHeading).toBeHidden({ timeout: 15_000 })
    await waitForTableToLoad(page)

    await searchInput.fill(paymentReference)
    await page.waitForTimeout(400)

    const updatedRow = page.locator('table tbody tr').filter({ hasText: paymentReference }).first()
    await expect(updatedRow).toBeVisible({ timeout: 10_000 })
    await expect(updatedRow).toContainText(/2 invoices/i)

    await updatedRow.click()
    const updatedDrawer = page.locator('div.fixed.inset-0.z-50.flex').last()
    await expect(updatedDrawer).toBeVisible({ timeout: 10_000 })
    await expect(updatedDrawer.getByText(fixture.firstInvoiceNumber).first()).toBeVisible()
    await expect(updatedDrawer.getByText(fixture.secondInvoiceNumber).first()).toBeVisible()
    await expect(updatedDrawer).toContainText(/unapplied amount/i)
    await expect(updatedDrawer).toContainText(/0\.00/)

    const payload = await apiJson(request, 'GET', `/api/companies/${companyId}/ar/payments?limit=50&offset=0`)
    const rows = listFromResponse(payload)
    const updated = rows.find((row: any) => String(row.referenceNumber ?? row.paymentNumber ?? '') === paymentReference)

    expect(updated).toBeTruthy()
    expect(Number(updated.unappliedAmount ?? -1)).toBeCloseTo(0, 2)
    expect(Array.isArray(updated.allocations)).toBe(true)
    expect(updated.allocations).toHaveLength(2)
  })

  test('payments list endpoint still returns records for smoke coverage', async ({ request }) => {
    test.skip(!companyId, 'No companyId found in auth context')

    const payload = await apiJson(request, 'GET', `/api/companies/${companyId}/ar/payments?limit=10&offset=0`)
    const rows = listFromResponse(payload)
    expect(Array.isArray(rows)).toBe(true)
  })
})
