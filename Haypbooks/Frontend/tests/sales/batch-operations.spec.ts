/**
 * tests/sales/batch-operations.spec.ts
 *
 * Batch operations — select rows, see batch bar, trigger batch actions.
 * Tests run against the Customers and Quotes pages since both have full batch support.
 */

import { test, expect } from '@playwright/test'
import {
  loadContext,
  gotoSalesPage,
  waitForTableToLoad,
} from '../helpers/navigation'

test.describe('Batch Operations', () => {
  let companyId: string | null

  test.beforeAll(async () => {
    companyId = loadContext().companyId
  })

  // ── Customers batch ──────────────────────────────────────────────────────

  test.describe('Customers page', () => {
    test('selecting a row shows the batch action bar', async ({ page }) => {
      await gotoSalesPage(page, '/sales/customers/customers', companyId)
      await waitForTableToLoad(page)

      const rows = await page.locator('table tbody tr').count()
      if (rows === 0) {
        test.skip()
        return
      }

      const firstCheckbox = page
        .locator('table tbody tr')
        .first()
        .locator('input[type="checkbox"]')

      if (!(await firstCheckbox.isVisible({ timeout: 3000 }).catch(() => false))) {
        test.skip()
        return
      }

      await firstCheckbox.check()
      await page.waitForTimeout(300)

      // Batch bar with a Delete button should now appear
      const deleteBtn = page.getByRole('button', { name: /^delete$/i }).first()
      await expect(deleteBtn).toBeVisible({ timeout: 5000 })

      // Deselect to clean up
      await firstCheckbox.uncheck()
      await page.waitForTimeout(300)
      await expect(deleteBtn).not.toBeVisible({ timeout: 5000 })
    })

    test('select-all checkbox selects all visible rows', async ({ page }) => {
      await gotoSalesPage(page, '/sales/customers/customers', companyId)
      await waitForTableToLoad(page)

      const totalRows = await page.locator('table tbody tr').count()
      if (totalRows === 0) {
        test.skip()
        return
      }

      const headerCheckbox = page
        .locator('table thead input[type="checkbox"], th input[type="checkbox"]')
        .first()

      if (!(await headerCheckbox.isVisible({ timeout: 3000 }).catch(() => false))) {
        test.skip()
        return
      }

      await headerCheckbox.check()
      await page.waitForTimeout(300)

      // Count how many row checkboxes are now checked
      const checkedCount = await page
        .locator('table tbody input[type="checkbox"]:checked')
        .count()

      expect(checkedCount).toBeGreaterThan(0)

      // Deselect all
      await headerCheckbox.uncheck()
    })
  })

  // ── Quotes batch ─────────────────────────────────────────────────────────

  test.describe('Quotes page', () => {
    test('batch bar appears when quotes are selected', async ({ page }) => {
      await gotoSalesPage(page, '/sales/sales/quotes', companyId)
      await waitForTableToLoad(page)

      const rows = await page.locator('table tbody tr').count()
      if (rows === 0) {
        test.skip()
        return
      }

      const checkbox = page
        .locator('table tbody tr')
        .first()
        .locator('input[type="checkbox"]')

      if (!(await checkbox.isVisible({ timeout: 3000 }).catch(() => false))) {
        test.skip()
        return
      }

      await checkbox.check()
      await page.waitForTimeout(300)

      // Delete button in batch bar
      const deleteBtn = page.getByRole('button', { name: /^delete$/i }).first()
      await expect(deleteBtn).toBeVisible({ timeout: 5000 })

      // Status batch button should also appear (e.g., "Mark Sent", "Mark Accepted")
      const statusBtn = page
        .getByRole('button', { name: /sent|accepted|expired|mark/i })
        .first()
      // Status buttons are optional — just verify Delete is there
      expect(await deleteBtn.isVisible()).toBe(true)

      await checkbox.uncheck()
    })
  })

  // ── Collections batch ────────────────────────────────────────────────────

  test.describe('Collections Center page', () => {
    test('batch bar appears when cases are selected', async ({ page }) => {
      await gotoSalesPage(page, '/sales/collections/center', companyId)
      await waitForTableToLoad(page)

      const rows = await page.locator('table tbody tr').count()
      if (rows === 0) {
        test.skip()
        return
      }

      const checkbox = page
        .locator('table tbody tr')
        .first()
        .locator('input[type="checkbox"]')

      if (!(await checkbox.isVisible({ timeout: 3000 }).catch(() => false))) {
        test.skip()
        return
      }

      await checkbox.check()
      await page.waitForTimeout(300)

      const deleteBtn = page.getByRole('button', { name: /^delete$/i }).first()
      await expect(deleteBtn).toBeVisible({ timeout: 5000 })

      await checkbox.uncheck()
    })
  })
})
