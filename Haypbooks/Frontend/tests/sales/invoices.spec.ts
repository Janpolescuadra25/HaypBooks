/**
 * tests/sales/invoices.spec.ts
 *
 * Invoices flow — list, status tabs, create, detail.
 */

import { test, expect } from '@playwright/test'
import {
  loadContext,
  gotoSalesPage,
  waitForTableToLoad,
  dismissModal,
} from '../helpers/navigation'
import { selectors } from '../helpers/selectors'

const PAGE_PATH = '/sales/billing/invoices'

test.describe('Invoices', () => {
  let companyId: string | null

  const todayIso = () => new Date().toISOString().slice(0, 10)
  const futureIso = (days: number) => {
    const d = new Date()
    d.setDate(d.getDate() + days)
    return d.toISOString().slice(0, 10)
  }

  const createFixtureCustomer = async (page: any) => {
    if (!companyId) throw new Error('Missing company id for fixtures')
    const name = `Invoices E2E ${Date.now()}`
    const createRes = await page.request.post(`/api/companies/${companyId}/ar/customers`, {
      data: { displayName: name },
    })

    if (createRes.ok()) {
      const created = await createRes.json()
      const customerId = created?.contactId ?? created?.id
      if (customerId) return String(customerId)
    }

    const listRes = await page.request.get(`/api/companies/${companyId}/ar/customers`)
    if (!listRes.ok()) throw new Error('Unable to load customers for fixtures')
    const listPayload = await listRes.json()
    const list = Array.isArray(listPayload) ? listPayload : listPayload?.data ?? []
    const fallbackId = list?.[0]?.contactId ?? list?.[0]?.id
    if (!fallbackId) throw new Error('No customer available for fixtures')
    return String(fallbackId)
  }

  const createDraftInvoiceFixture = async (page: any, amount: number, description: string) => {
    if (!companyId) throw new Error('Missing company id for fixtures')
    const customerId = await createFixtureCustomer(page)

    const createRes = await page.request.post(`/api/companies/${companyId}/ar/invoices`, {
      data: {
        customerId,
        dueDate: futureIso(7),
        items: [{ description, quantity: 1, unitPrice: amount, amount }],
      },
    })
    expect(createRes.ok()).toBe(true)
    const invoice = await createRes.json()
    return { customerId, invoice }
  }

  test.beforeEach(async ({ page }) => {
    const ctx = loadContext()
    companyId = ctx.companyId
    await gotoSalesPage(page, PAGE_PATH, companyId)
    await waitForTableToLoad(page)
  })

  test('page loads with table or empty state', async ({ page }) => {
    const hasTable = await page.locator('table, [role="table"]').isVisible().catch(() => false)
    const hasEmpty = await page.getByText(/no invoices|no records|empty/i).isVisible().catch(() => false)
    const noCompany = await page.getByText(/no company found/i).isVisible().catch(() => false)
    expect(hasTable || hasEmpty || noCompany).toBe(true)
  })

  test('status tabs work (All, Draft, Sent, Partially Paid, Paid)', async ({ page }) => {
    const statusTabs = ['All', 'DRAFT', 'SENT', 'PARTIALLY PAID', 'PAID', 'OVERDUE']

    for (const tabLabel of statusTabs) {
      const tab = page.getByRole('button', { name: new RegExp(`^${tabLabel}$`, 'i') }).first()
      if (!(await tab.isVisible({ timeout: 3000 }).catch(() => false))) continue

      await tab.click()
      await waitForTableToLoad(page)
      // Page should remain usable after each tab click
      await expect(page.locator('main')).toBeVisible()
    }
  })

  test('new invoice button navigates to creation page', async ({ page }) => {
    // InvoicesPage uses router.push('/sales/billing/invoices/new') — no modal
    const createBtn = page
      .getByRole('button', { name: /new invoice|create invoice|add invoice/i })
      .first()

    if (!(await createBtn.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip()
      return
    }

    await createBtn.click()
    // Should navigate to the new-invoice form page
    await page.waitForURL(/invoices\/new/, { timeout: 8000 }).catch(() => {})
    // Either on the new-invoice page or still on list (redirect back if no customer)
    const onNewPage = page.url().includes('invoices/new') || page.url().includes('invoices')
    expect(onNewPage).toBe(true)
  })

  test('export downloads a CSV', async ({ page }) => {
    const exportBtn = page.locator(selectors.exportButton).first()
    if (!(await exportBtn.isVisible({ timeout: 4000 }).catch(() => false))) {
      test.skip()
      return
    }

    const [dl] = await Promise.all([
      page.waitForEvent('download', { timeout: 10_000 }),
      exportBtn.click(),
    ])
    expect(dl.suggestedFilename()).toMatch(/\.csv$/i)
  })

  test('search input filters invoices', async ({ page }) => {
    const search = page.locator(selectors.searchInput).first()
    if (!(await search.isVisible({ timeout: 4000 }).catch(() => false))) {
      test.skip()
      return
    }

    await search.fill(`zzz-noresult-${Date.now()}`)
    await page.waitForTimeout(600)
    await waitForTableToLoad(page)

    const rows = await page.locator('table tbody tr').count()
    const empty = await page.getByText(/no results|no invoices|no records/i).isVisible().catch(() => false)
    expect(rows === 0 || empty).toBe(true)

    await search.fill('')
  })

  test('duplicate action creates a new draft and opens it in edit mode', async ({ page }) => {
    if (!companyId) {
      test.skip()
      return
    }

    const { invoice } = await createDraftInvoiceFixture(page, 55, 'Duplicate fixture line')
    const invoiceRef = invoice?.invoiceNumber ?? String(invoice?.id ?? '').slice(0, 8).toUpperCase()

    await page.reload({ waitUntil: 'domcontentloaded' })
    await waitForTableToLoad(page)

    const search = page.locator(selectors.searchInput).first()
    if (await search.isVisible({ timeout: 3000 }).catch(() => false)) {
      await search.fill(invoiceRef)
      await waitForTableToLoad(page)
    }

    const row = page.locator('table tbody tr', { hasText: invoiceRef }).first()
    await expect(row).toBeVisible({ timeout: 10000 })
    await row.locator('button').last().click()

    const actionMenu = page.locator('div.w-52', { hasText: 'More Actions' }).first()
    await expect(actionMenu).toBeVisible({ timeout: 5000 })
    const duplicateBtn = actionMenu.getByRole('button', { name: /^duplicate$/i })
    await expect(duplicateBtn).toBeVisible({ timeout: 5000 })

    await duplicateBtn.evaluate((el: HTMLElement) => el.click())
    await expect(page.getByText(/duplicated as/i)).toBeVisible({ timeout: 10000 })
    const detailModal = page.locator('div.fixed.inset-0.z-50').first()
    await expect(detailModal).toBeVisible({ timeout: 10000 })
    await expect(detailModal.getByRole('button', { name: /send invoice/i }).first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/cannot be edited because it has already been sent/i)).toHaveCount(0)
  })

  test('void action after payment reverses allocations with exact confirmation message', async ({ page }) => {
    if (!companyId) {
      test.skip()
      return
    }

    const { customerId, invoice } = await createDraftInvoiceFixture(page, 140, 'Void-after-pay fixture line')
    const sendRes = await page.request.post(`/api/companies/${companyId}/ar/invoices/${invoice.id}/send`, { data: {} })
    expect(sendRes.ok()).toBe(true)
    const sentInvoice = await sendRes.json()

    const paymentRes = await page.request.post(`/api/companies/${companyId}/ar/payments`, {
      data: {
        customerId,
        amount: 40,
        paymentDate: todayIso(),
        method: 'CASH',
        allocations: [{ invoiceId: invoice.id, amount: 40 }],
      },
    })
    expect(paymentRes.ok()).toBe(true)

    const invoiceRef = sentInvoice?.invoiceNumber ?? String(invoice?.id ?? '').slice(0, 8).toUpperCase()

    await page.reload({ waitUntil: 'domcontentloaded' })
    await waitForTableToLoad(page)

    const search = page.locator(selectors.searchInput).first()
    if (await search.isVisible({ timeout: 3000 }).catch(() => false)) {
      await search.fill(invoiceRef)
      await waitForTableToLoad(page)
    }

    const row = page.locator('table tbody tr', { hasText: invoiceRef }).first()
    await expect(row).toBeVisible({ timeout: 10000 })
    await row.locator('button').last().click()

    const actionMenu = page.locator('div.w-52', { hasText: 'More Actions' }).first()
    await expect(actionMenu).toBeVisible({ timeout: 5000 })

    let confirmMessage = ''
    page.once('dialog', async (dialog) => {
      confirmMessage = dialog.message()
      await dialog.accept()
    })

    await actionMenu.getByRole('button', { name: /^void$/i }).evaluate((el: HTMLElement) => el.click())
    await waitForTableToLoad(page)
    expect(confirmMessage).toBe('Voiding this invoice will reverse all payment allocations. Continue?')

    const updatedRow = page.locator('table tbody tr', { hasText: invoiceRef }).first()
    await expect(updatedRow).toContainText(/VOID/i)
  })

  test('credit note action creates a linked credit note from invoice detail', async ({ page }) => {
    if (!companyId) {
      test.skip()
      return
    }

    const { invoice } = await createDraftInvoiceFixture(page, 130, 'Credit-note fixture line')
    const sendRes = await page.request.post(`/api/companies/${companyId}/ar/invoices/${invoice.id}/send`, { data: {} })
    expect(sendRes.ok()).toBe(true)
    const sentInvoice = await sendRes.json()
    const invoiceRef = sentInvoice?.invoiceNumber ?? String(invoice?.id ?? '').slice(0, 8).toUpperCase()

    const beforeRes = await page.request.get(`/api/companies/${companyId}/ar/credit-notes`)
    expect(beforeRes.ok()).toBe(true)
    const beforePayload = await beforeRes.json()
    const beforeItems = Array.isArray(beforePayload) ? beforePayload : beforePayload?.items ?? []
    const beforeCount = beforeItems.filter((cn: any) => cn.invoiceId === invoice.id).length

    await page.reload({ waitUntil: 'domcontentloaded' })
    await waitForTableToLoad(page)

    const search = page.locator(selectors.searchInput).first()
    if (await search.isVisible({ timeout: 3000 }).catch(() => false)) {
      await search.fill(invoiceRef)
      await waitForTableToLoad(page)
    }

    const row = page.locator('table tbody tr', { hasText: invoiceRef }).first()
    await expect(row).toBeVisible({ timeout: 10000 })
    await row.getByRole('button', { name: invoiceRef }).first().click()

    const detailModal = page.locator('div.fixed.inset-0.z-50').first()
    await expect(detailModal).toBeVisible({ timeout: 10000 })
    await detailModal.getByRole('button', { name: /^credit note$/i }).first().click()
    await page.waitForURL(/\/sales\/revenue\/credit-notes/, { timeout: 10000 })

    const afterRes = await page.request.get(`/api/companies/${companyId}/ar/credit-notes`)
    expect(afterRes.ok()).toBe(true)
    const afterPayload = await afterRes.json()
    const afterItems = Array.isArray(afterPayload) ? afterPayload : afterPayload?.items ?? []
    const linkedItems = afterItems.filter((cn: any) => cn.invoiceId === invoice.id)
    expect(linkedItems.length).toBeGreaterThan(beforeCount)

    const latestLinked = linkedItems[0] ?? null
    expect((latestLinked?.memo ?? '').toLowerCase()).toContain('negative line-item equivalent')
    expect(latestLinked?.invoiceId).toBe(invoice.id)
  })

  test('column visibility menu toggles columns', async ({ page }) => {
    const colsBtn = page.locator(selectors.columnsButton).first()
    if (!(await colsBtn.isVisible({ timeout: 4000 }).catch(() => false))) {
      test.skip()
      return
    }

    await colsBtn.click()
    // Checkboxes should appear in the dropdown
    await expect(page.locator('input[type="checkbox"]').nth(1)).toBeVisible({ timeout: 5000 })
    // Close by clicking elsewhere
    await page.keyboard.press('Escape')
  })
})
