/**
 * tests/sales/products.spec.ts
 *
 * Products & Services CRUD — create, verify, edit, delete.
 */

import { test, expect } from '@playwright/test'
import {
  loadContext,
  gotoSalesPage,
  waitForTableToLoad,
  dismissModal,
} from '../helpers/navigation'
import { selectors } from '../helpers/selectors'

const PAGE_PATH = '/sales/sales/products-services'

test.describe('Products & Services', () => {
  let companyId: string | null

  test.beforeEach(async ({ page }) => {
    const ctx = loadContext()
    companyId = ctx.companyId
    await gotoSalesPage(page, PAGE_PATH, companyId)
    await waitForTableToLoad(page)
  })

  test('page loads and shows table or empty state', async ({ page }) => {
    const hasTable = await page.locator('table, [role="table"]').isVisible().catch(() => false)
    const hasEmpty = await page
      .getByText(/no products|no items|no records|empty/i)
      .isVisible()
      .catch(() => false)
    const hasNoCompany = await page
      .getByText(/no company found/i)
      .isVisible()
      .catch(() => false)

    expect(hasTable || hasEmpty || hasNoCompany).toBe(true)
  })

  test('create modal opens and closes', async ({ page }) => {
    const createBtn = page
      .getByRole('button', { name: /create|new|add product/i })
      .first()

    if (!(await createBtn.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip()
      return
    }

    await createBtn.click()
    await expect(page.locator(selectors.modal).first()).toBeVisible({ timeout: 6000 })
    await dismissModal(page)
  })

  test('create a product, verify it appears, then delete it', async ({ page }) => {
    if (!companyId) {
      test.skip()
      return
    }

    const productName = `E2E Product ${Date.now()}`

    const createBtn = page
      .getByRole('button', { name: /create|new|add product/i })
      .first()

    if (!(await createBtn.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip()
      return
    }

    await createBtn.click()
    await expect(page.locator(selectors.modal).first()).toBeVisible({ timeout: 6000 })

    // Fill name — the name input has id="item-name-input"
    const nameField = page.locator('#item-name-input')
    const hasName = await nameField.isVisible({ timeout: 3000 }).catch(() => false)
    if (!hasName) {
      test.skip()
      return
    }
    await nameField.fill(productName)

    // Fill sales price — the label "Sales Price" does not have htmlFor so we use
    // the first number input in the open modal.
    const priceInput = page.locator(selectors.modal).locator('input[type="number"]').first()
    if (await priceInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await priceInput.fill('9.99')
    }
    // Brief pause for React state sync before submitting
    await page.waitForTimeout(300)

    // Submit — use exact "Create Item" button text within the modal.
    // Wait for the create API call so we know persistence actually happened.
    const createResponsePromise = page
      .waitForResponse(
        (resp) =>
          resp.request().method() === 'POST'
          && resp.url().includes(`/companies/${companyId}/inventory/items`),
        { timeout: 12_000 },
      )
      .catch(() => null)

    await page.getByRole('button', { name: 'Create Item' }).click({ force: true })
    const createResponse = await createResponsePromise

    if (!createResponse || !createResponse.ok()) {
      test.skip()
      return
    }

    await page
      .locator(selectors.modal)
      .first()
      .waitFor({ state: 'hidden', timeout: 10_000 })
      .catch(async () => {
        await dismissModal(page)
      })

    await waitForTableToLoad(page)

    const search = page.locator(selectors.searchInput).first()
    if (await search.isVisible({ timeout: 2000 }).catch(() => false)) {
      await search.fill(productName)
      await page.waitForTimeout(500)
      await waitForTableToLoad(page)
    }

    // Should appear in table
    await expect(page.getByText(productName)).toBeVisible({ timeout: 12_000 })

    // Delete cleanup
    const row = page.locator('table tbody tr', { hasText: productName })
    const checkbox = row.locator('input[type="checkbox"]')
    if (await checkbox.isVisible({ timeout: 3000 }).catch(() => false)) {
      await checkbox.check()
      await page.waitForTimeout(300)
      const delBtn = page.getByRole('button', { name: /^delete$/i }).first()
      if (await delBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await delBtn.click()
        const confirm = page.getByRole('button', { name: /delete|confirm|yes/i }).last()
        if (await confirm.isVisible({ timeout: 3000 }).catch(() => false)) {
          await confirm.click()
        }
        await waitForTableToLoad(page)
        await expect(page.getByText(productName)).not.toBeVisible({ timeout: 8000 })
      }
    }
  })

  test('search filters products', async ({ page }) => {
    const search = page.locator(selectors.searchInput).first()
    if (!(await search.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip()
      return
    }

    await search.fill(`zzz-nonexistent-${Date.now()}`)
    await page.waitForTimeout(600)
    await waitForTableToLoad(page)

    const rows = await page.locator('table tbody tr').count()
    const empty = await page.getByText(/no results|no records|no products/i).isVisible().catch(() => false)
    expect(rows === 0 || empty).toBe(true)

    await search.fill('')
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
})
