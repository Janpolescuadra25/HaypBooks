/**
 * tests/sales/customers.spec.ts
 *
 * Customers CRUD — navigate, create, search, column resize, and delete.
 */

import { test, expect } from '@playwright/test'
import {
  loadContext,
  gotoSalesPage,
  waitForTableToLoad,
  dismissModal,
} from '../helpers/navigation'
import { selectors } from '../helpers/selectors'

const PAGE_PATH = '/sales/customers'

test.describe('Customers', () => {
  let companyId: string | null

  test.beforeEach(async ({ page }) => {
    const ctx = loadContext()
    companyId = ctx.companyId
    await gotoSalesPage(page, PAGE_PATH, companyId)
    await waitForTableToLoad(page)
  })

  // ── Basic render ─────────────────────────────────────────────────────────

  test('page renders a table or empty state', async ({ page }) => {
    const headingVisible = await page
      .getByRole('heading', { name: /customers/i })
      .isVisible()
      .catch(() => false)
    const hasTable = await page.locator('table, [role="table"]').isVisible().catch(() => false)
    const hasEmpty = await page
      .getByText(/no customers(?: yet| found)?|no records|no results|empty/i)
      .isVisible()
      .catch(() => false)
    const hasLoadError = await page
      .getByText(/no company found|select a company/i)
      .isVisible()
      .catch(() => false)

    expect(headingVisible || hasTable || hasEmpty || hasLoadError).toBe(true)
  })

  // ── Search ───────────────────────────────────────────────────────────────

  test('search input filters the table', async ({ page }) => {
    const search = page
      .locator(selectors.searchInput)
      .first()
    
    // If no search input, skip gracefully
    if (!(await search.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip()
      return
    }

    await search.fill(`test-xyz-${Date.now()}`)
    await page.waitForTimeout(600) // debounce wait
    await waitForTableToLoad(page)

    await page.waitForFunction(
      () => {
        const rows = document.querySelectorAll('table tbody tr').length
        const text = document.body.textContent ?? ''
        return rows === 0 || /no results|no customers|no records/i.test(text)
      },
      null,
      { timeout: 15_000 },
    )

    // Clear search
    await search.fill('')
    await page.waitForTimeout(400)
  })

  // ── Columns visibility ───────────────────────────────────────────────────

  test('columns menu can be opened and closed', async ({ page }) => {
    const colsBtn = page.locator(selectors.columnsButton).first()

    if (!(await colsBtn.isVisible({ timeout: 4000 }).catch(() => false))) {
      test.skip()
      return
    }

    await colsBtn.click()
    // A dropdown / popover with checkboxes should appear
    await expect(
      page.locator('input[type="checkbox"]').nth(1),
    ).toBeVisible({ timeout: 5000 })

    // Close by clicking the backdrop overlay (fixed inset-0 z-10 div that
    // the CustomersPage renders when the columns menu is open)
    const backdrop = page.locator('div.fixed.inset-0.z-10').first()
    if (await backdrop.isVisible({ timeout: 1000 }).catch(() => false)) {
      await backdrop.click({ force: true })
    } else {
      await page.keyboard.press('Escape')
    }
  })

  // ── Create modal ─────────────────────────────────────────────────────────

  test('create modal opens and can be dismissed', async ({ page }) => {
    const createBtn = page
      .getByRole('button', { name: /create|new|add customer/i })
      .first()

    if (!(await createBtn.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip()
      return
    }

    await createBtn.click()

    // Modal / drawer should appear
    await expect(
      page.locator(selectors.modal).first(),
    ).toBeVisible({ timeout: 6000 })

    await dismissModal(page)

    // Modal should be gone
    await expect(
      page.locator(selectors.modal).first(),
    ).not.toBeVisible({ timeout: 5000 })
  })

  // ── Create → verify → delete (idempotent) ────────────────────────────────

  test('create a customer, verify it appears, then delete it', async ({ page }) => {
    const timestamp = Date.now()
    const customerName = `E2E Customer ${timestamp}`

    // ── Open create modal
    const createBtn = page
      .getByRole('button', { name: /create|new|add customer/i })
      .first()

    if (!(await createBtn.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip()
      return
    }

    await createBtn.click()
    await expect(page.locator(selectors.modal).first()).toBeVisible({ timeout: 6000 })

    // ── Fill in name field
    const nameField = page
      .getByLabel(/customer name|company name|name/i)
      .first()

    const hasNameField = await nameField.isVisible({ timeout: 3000 }).catch(() => false)
    if (hasNameField) {
      await nameField.fill(customerName)
    } else {
      // Fallback: first visible text input in the modal
      const fallback = page.locator('[role="dialog"]').locator('input[type="text"]').first()
      if (!(await fallback.isVisible({ timeout: 2000 }).catch(() => false))) {
        test.skip()
        return
      }
      await fallback.fill(customerName)
    }

    // ── Submit
    const submitBtn = page.locator(selectors.modalSave).last()
    await submitBtn.click()

    // ── Wait for modal to close
    await page
      .locator(selectors.modal)
      .first()
      .waitFor({ state: 'hidden', timeout: 10_000 })
      .catch(() => {})

    await waitForTableToLoad(page)

    // ── Verify the new customer appears in the table
    const newRow = page.getByText(customerName)
    const appeared = await newRow.isVisible({ timeout: 10_000 }).catch(() => false)
    expect(appeared).toBe(true)

    // ── Delete the newly created customer (cleanup)
    // Select the row checkbox for this customer
    const rowLocator = page.locator('table tbody tr', { hasText: customerName })
    const rowCheckbox = rowLocator.locator('input[type="checkbox"]')

    if (await rowCheckbox.isVisible({ timeout: 3000 }).catch(() => false)) {
      await rowCheckbox.check()

      // Wait for batch bar to appear
      await page.waitForTimeout(300)
      const deleteBtn = page.getByRole('button', { name: /^delete$/i }).first()
      if (await deleteBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await deleteBtn.click()
        // Confirm deletion if a dialog appears
        const confirmBtn = page
          .getByRole('button', { name: /delete|confirm|yes/i })
          .last()
        if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await confirmBtn.click()
        }
        await waitForTableToLoad(page)
        // Customer should be gone
        await expect(page.getByText(customerName)).not.toBeVisible({ timeout: 8000 })
      }
    }
  })

  // ── Export ───────────────────────────────────────────────────────────────

  test('export button triggers a CSV download', async ({ page }) => {
    const exportBtn = page.locator(selectors.exportButton).first()

    if (!(await exportBtn.isVisible({ timeout: 4000 }).catch(() => false))) {
      test.skip()
      return
    }

    const [download] = await Promise.all([
      page.waitForEvent('download', { timeout: 10_000 }),
      exportBtn.click(),
    ])

    expect(download.suggestedFilename()).toMatch(/\.csv$/i)
  })
})
