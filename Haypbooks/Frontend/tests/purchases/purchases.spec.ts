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

  test('bill detail page route loads', async ({ page }) => {
    await gotoSalesPage(page, BILL_DETAIL_PATH, companyId)
    await expectPageTitle(page, 'Bill Detail')
  })
})
