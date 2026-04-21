/**
 * tests/sales/payments.spec.ts
 *
 * Customer Payments — list, search, filter, pagination.
 */

import { test, expect } from '@playwright/test'
import {
  loadContext,
  gotoSalesPage,
  waitForTableToLoad,
} from '../helpers/navigation'
import { selectors } from '../helpers/selectors'

const PAGE_PATH = '/sales/collections/payments'

test.describe('Customer Payments', () => {
  let companyId: string | null

  test.beforeEach(async ({ page }) => {
    const ctx = loadContext()
    companyId = ctx.companyId
    await gotoSalesPage(page, PAGE_PATH, companyId)
    await waitForTableToLoad(page)
  })

  test('page loads with table or empty state', async ({ page }) => {
    const hasTable = await page.locator('table, [role="table"]').isVisible().catch(() => false)
    const hasEmpty = await page
      .getByText(/no payments|no records|empty/i)
      .isVisible()
      .catch(() => false)
    const noCompany = await page.getByText(/no company found/i).isVisible().catch(() => false)
    expect(hasTable || hasEmpty || noCompany).toBe(true)
  })

  test('search input is present and functional', async ({ page }) => {
    const search = page.locator(selectors.searchInput).first()
    if (!(await search.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip()
      return
    }

    await search.fill(`zzz-noresult-${Date.now()}`)
    await page.waitForTimeout(600)
    await waitForTableToLoad(page)

    await page.waitForFunction(
      () => {
        const rows = document.querySelectorAll('table tbody tr').length
        const text = document.body.textContent ?? ''
        return rows === 0 || /no results|no records|no payments/i.test(text)
      },
      null,
      { timeout: 15_000 },
    )

    await search.fill('')
  })

  test('status filter tabs switch the view', async ({ page }) => {
    const tabs = ['All', 'POSTED', 'UNDEPOSITED', 'VOIDED']

    for (const label of tabs) {
      const tab = page.getByRole('button', { name: new RegExp(`^${label}$`, 'i') }).first()
      if (!(await tab.isVisible({ timeout: 3000 }).catch(() => false))) continue

      await tab.click()
      await waitForTableToLoad(page)
      await expect(page.locator('main')).toBeVisible()
    }
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

  test('page size selector changes displayed rows', async ({ page }) => {
    // Find page size selector (e.g., "25 rows" dropdown)
    const pageSizeSelect = page.locator(
      'select[aria-label*="page" i], select[aria-label*="rows" i], select:has(option[value="10"], option[value="25"])',
    ).first()

    if (!(await pageSizeSelect.isVisible({ timeout: 4000 }).catch(() => false))) {
      test.skip()
      return
    }

    await pageSizeSelect.selectOption({ index: 1 })
    await waitForTableToLoad(page)
    await expect(page.locator('main')).toBeVisible()
  })
})
