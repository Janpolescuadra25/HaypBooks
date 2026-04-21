/**
 * tests/purchases/purchases.spec.ts
 *
 * Smoke tests for the new Purchases / Accounts Payable page stubs.
 */

import { test, expect } from '@playwright/test'
import { loadContext, gotoSalesPage, expectPageTitle } from '../helpers/navigation'

const VENDORS_PATH = '/purchases/vendors'
const BILLS_PATH = '/purchases/bills'
const NEW_BILL_PATH = '/purchases/bills/new'
const BILL_DETAIL_PATH = '/purchases/bills/test-bill-id'

test.describe('Purchases / Accounts Payable stubs', () => {
  let companyId: string | null

  test.beforeEach(async () => {
    const ctx = loadContext()
    companyId = ctx.companyId
  })

  test('vendors page loads', async ({ page }) => {
    await gotoSalesPage(page, VENDORS_PATH, companyId)
    await expectPageTitle(page, 'Vendor Management')
  })

  test('bills page loads and shows create button', async ({ page }) => {
    await gotoSalesPage(page, BILLS_PATH, companyId)
    await expectPageTitle(page, 'Bills')
    await expect(page.getByRole('link', { name: /Create Bill/i })).toBeVisible()
  })

  test('new bill page route loads', async ({ page }) => {
    await gotoSalesPage(page, NEW_BILL_PATH, companyId)
    await expectPageTitle(page, 'Create New Bill')
  })

  test('can approve a draft bill and post status updates', async ({ page }) => {
    const vendorRes = await page.request.post(`/api/companies/${companyId}/ap/vendors`, {
      data: {
        displayName: `E2E Vendor ${Date.now()}`,
        email: 'e2e-vendor@haypbooks.test',
        phone: '09171234567',
        status: 'ACTIVE',
      },
    })
    expect(vendorRes.ok()).toBeTruthy()
    const vendor = await vendorRes.json()

    const billRes = await page.request.post(`/api/companies/${companyId}/ap/bills`, {
      data: {
        vendorId: vendor.id,
        description: 'E2E approval bill',
        dueAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        lines: [
          { description: 'Consulting services', quantity: 1, rate: 2500, amount: 2500 },
        ],
      },
    })
    expect(billRes.ok()).toBeTruthy()
    const bill = await billRes.json()

    await gotoSalesPage(page, `/purchases/bills/${bill.id}`, companyId)
    await expectPageTitle(page, 'Bill Detail')
    await expect(page.getByRole('button', { name: /Approve Bill/i })).toBeVisible()

    await page.getByRole('button', { name: /Approve Bill/i }).click()
    await expect(page.getByText(/Bill approved successfully/i)).toBeVisible()
    await expect(page.getByText(/Approved/i)).toBeVisible()

    const approvedRes = await page.request.get(`/api/companies/${companyId}/ap/bills/${bill.id}`)
    expect(approvedRes.ok()).toBeTruthy()
    const approvedBill = await approvedRes.json()
    expect(approvedBill.status).toBe('APPROVED')
  })

  test('bill detail page route loads', async ({ page }) => {
    await gotoSalesPage(page, BILL_DETAIL_PATH, companyId)
    await expectPageTitle(page, 'Bill Detail')
  })
})
