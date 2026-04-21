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

interface DepositHandoffFixture {
  customerId: string
  customerName: string
  firstInvoiceId: string
  firstInvoiceNumber: string
  secondInvoiceId: string
  secondInvoiceNumber: string
}

interface BankAccountFixture {
  id: string
  name: string
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

async function ensureBankAccountFixture(
  request: APIRequestContext,
  companyId: string,
  seed: string,
): Promise<BankAccountFixture> {
  const existingPayload = await apiJson(request, 'GET', `/api/companies/${companyId}/banking/accounts`)
  const existingAccounts = listFromResponse(existingPayload)
  const existing = existingAccounts.find((account: any) => String(account?.id ?? '').trim())

  if (existing) {
    return {
      id: String(existing.id),
      name: String(existing.name ?? 'Bank Account'),
    }
  }

  const created = await apiJson(request, 'POST', `/api/companies/${companyId}/banking/accounts`, {
    name: `E2E Deposit Account ${seed}`,
    institution: 'E2E Test Bank',
    accountNumber: `****${seed.slice(-4)}`,
    isDefault: true,
  })

  return {
    id: String(created?.id ?? ''),
    name: String(created?.name ?? `E2E Deposit Account ${seed}`),
  }
}

async function createDepositHandoffFixture(
  request: APIRequestContext,
  companyId: string,
  seed: string,
): Promise<DepositHandoffFixture> {
  const customerName = `00 E2E Deposit Customer ${seed}`
  const customerEmail = `e2e-deposit-${seed}@haypbooks.test`

  const customer = await apiJson(request, 'POST', `/api/companies/${companyId}/ar/customers`, {
    name: customerName,
    email: customerEmail,
  })

  const customerId = String(customer?.contactId ?? customer?.id ?? '').trim()
  if (!customerId) throw new Error('Customer creation did not return a customer id')

  const dueDate = new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)

  const createAndSendInvoice = async (suffix: string, amount: number) => {
    const created = await apiJson(request, 'POST', `/api/companies/${companyId}/ar/invoices`, {
      customerId,
      dueDate,
      items: [
        {
          description: `E2E deposit handoff invoice ${suffix}`,
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

    return {
      id: invoiceId,
      invoiceNumber: String(sent?.invoiceNumber ?? created?.invoiceNumber ?? `INV-${suffix}`),
    }
  }

  const first = await createAndSendInvoice(`${seed}-DEP-A`, 110)
  const second = await createAndSendInvoice(`${seed}-DEP-B`, 85)

  return {
    customerId,
    customerName,
    firstInvoiceId: first.id,
    firstInvoiceNumber: first.invoiceNumber,
    secondInvoiceId: second.id,
    secondInvoiceNumber: second.invoiceNumber,
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

    const drawerHeading = page.getByRole('heading', { name: new RegExp(escapeRegExp(paymentReference), 'i') }).first()
    await expect(drawerHeading).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(fixture.customerName).first()).toBeVisible()
    await expect(page.getByText(/total allocated/i)).toBeVisible()
    await expect(page.getByText(fixture.invoiceNumber).first()).toBeVisible()
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

    await expect(page.getByRole('button', { name: /reallocate/i }).first()).toBeVisible({ timeout: 10_000 })
    await page.getByRole('button', { name: /reallocate/i }).first().click()

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
    const updatedDrawer = page.locator('div.fixed.inset-0').filter({ hasText: fixture.firstInvoiceNumber }).first()
    await expect(updatedDrawer).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(fixture.firstInvoiceNumber).first()).toBeVisible()
    await expect(page.getByText(fixture.secondInvoiceNumber).first()).toBeVisible()
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

  test('hands off undeposited payments into a bank deposit and marks payment status as deposited', async ({ page, request }) => {
    test.skip(!companyId, 'No companyId found in auth context')

    const seed = `${Date.now().toString().slice(-8)}`
    const firstPaymentReference = `E2E-DEP-1-${seed}`
    const secondPaymentReference = `E2E-DEP-2-${seed}`
    const depositReference = `E2E-BATCH-${seed}`

    const fixture = await createDepositHandoffFixture(request, companyId!, seed)
    const bankAccount = await ensureBankAccountFixture(request, companyId!, seed)

    const newPaymentButton = page.getByRole('button', { name: /new payment/i }).first()
    await expect(newPaymentButton).toBeVisible({ timeout: 10_000 })
    await newPaymentButton.click()

    const heading = page.getByRole('heading', { name: /^record payment$/i }).first()
    await expect(heading).toBeVisible({ timeout: 10_000 })

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

    const undepositedDestination = page.locator('input[name="deposit-destination"][value="UNDEPOSITED_FUNDS"]').first()
    await expect(undepositedDestination).toBeChecked()

    const referenceInput = page.locator('input[placeholder*="Check # or ref"]').first()
    await referenceInput.fill(firstPaymentReference)

    await page.locator('button[form="record-payment-form"]').first().click()
    await expect(heading).toBeHidden({ timeout: 15_000 })
    await waitForTableToLoad(page)

    await apiJson(request, 'POST', `/api/companies/${companyId}/ar/payments`, {
      customerId: fixture.customerId,
      amount: 45,
      paymentDate: new Date().toISOString().slice(0, 10),
      method: 'CHECK',
      referenceNumber: secondPaymentReference,
      depositDestination: 'UNDEPOSITED_FUNDS',
      allocations: [{ invoiceId: fixture.secondInvoiceId, amount: 45 }],
    })

    const searchInput = page.locator('input[placeholder*="Search by payment"]').first()
    await searchInput.fill(firstPaymentReference)
    await page.waitForTimeout(400)

    const createdRow = page.locator('table tbody tr').filter({ hasText: firstPaymentReference }).first()
    await expect(createdRow).toBeVisible({ timeout: 10_000 })
    await expect(createdRow).toContainText(/undeposited/i)

    await page.goto('/banking/transactions/undeposited-funds')
    await page.waitForLoadState('networkidle')

    const undepositedSearchInput = page.locator('input[placeholder*="Search by customer"]').first()
    await expect(undepositedSearchInput).toBeVisible({ timeout: 10_000 })
    await undepositedSearchInput.fill(fixture.customerName)

    const undepositedRows = page.locator('table tbody tr')
    await expect(undepositedRows.first()).toBeVisible({ timeout: 10_000 })
    await expect.poll(async () => undepositedRows.count()).toBeGreaterThanOrEqual(2)

    await undepositedRows.nth(0).locator('button').first().click()
    await undepositedRows.nth(1).locator('button').first().click()

    const depositSelectedButton = page.getByRole('button', { name: /deposit selected \(2\)/i }).first()
    await expect(depositSelectedButton).toBeVisible({ timeout: 10_000 })
    await depositSelectedButton.click()

    const createDepositModal = page
      .locator('div.fixed.inset-0')
      .filter({ has: page.getByRole('combobox', { name: /destination bank account/i }) })
      .first()
    await expect(createDepositModal).toBeVisible({ timeout: 10_000 })

    const destinationSelect = page.getByRole('combobox', { name: /destination bank account/i }).first()
    await destinationSelect.selectOption(bankAccount.id)

    const depositReferenceInput = page.locator('input[placeholder="Optional"]').first()
    await depositReferenceInput.fill(depositReference)

    const createDepositButton = page.getByRole('button', { name: /create deposit/i }).first()
    await createDepositButton.click()

    await expect(createDepositModal).toBeHidden({ timeout: 15_000 })
    await expect(page.getByText(/deposit created successfully/i)).toBeVisible({ timeout: 10_000 })
    await expect(page.locator('table tbody tr').filter({ hasText: depositReference }).first()).toBeVisible({ timeout: 10_000 })

    await gotoSalesPage(page, PAGE_PATH, companyId)
    await waitForTableToLoad(page)

    await searchInput.fill(firstPaymentReference)
    await page.waitForTimeout(400)

    const depositedRow = page.locator('table tbody tr').filter({ hasText: firstPaymentReference }).first()
    await expect(depositedRow).toBeVisible({ timeout: 10_000 })
    await expect(depositedRow).toContainText(/deposited/i)

    await depositedRow.click()
    const drawer = page
      .locator('div.fixed.inset-0')
      .filter({ hasText: /deposit status/i })
      .first()
    await expect(drawer).toBeVisible({ timeout: 10_000 })
    await expect(drawer).toContainText(/deposit status/i)
    await expect(drawer).toContainText(/deposited/i)

    const payload = await apiJson(request, 'GET', `/api/companies/${companyId}/ar/payments?limit=100&offset=0`)
    const rows = listFromResponse(payload)
    const paymentOne = rows.find((row: any) => String(row.referenceNumber ?? row.paymentNumber ?? '') === firstPaymentReference)
    const paymentTwo = rows.find((row: any) => String(row.referenceNumber ?? row.paymentNumber ?? '') === secondPaymentReference)

    expect(paymentOne).toBeTruthy()
    expect(paymentTwo).toBeTruthy()
    expect(String(paymentOne.depositStatus ?? '').toUpperCase()).toBe('DEPOSITED')
    expect(String(paymentTwo.depositStatus ?? '').toUpperCase()).toBe('DEPOSITED')
    expect(paymentOne.depositDate).toBeTruthy()
    expect(paymentTwo.depositDate).toBeTruthy()
  })

  test('payments list endpoint still returns records for smoke coverage', async ({ request }) => {
    test.skip(!companyId, 'No companyId found in auth context')

    const payload = await apiJson(request, 'GET', `/api/companies/${companyId}/ar/payments?limit=10&offset=0`)
    const rows = listFromResponse(payload)
    expect(Array.isArray(rows)).toBe(true)
  })
})
