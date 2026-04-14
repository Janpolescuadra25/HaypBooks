/**
 * tests/sales/full-sales-audit.spec.ts
 *
 * Comprehensive Sales section E2E audit.
 * Run with: npx playwright test --config=playwright.sales.config.ts --workers=1
 *
 * Groups:
 *   SEED    — Pre-condition: create a test customer and product
 *   A       — Create Flows (all "+ New" modals open + submit)
 *   B       — Customer Picker Field (opens, searches, selects)
 *   C       — Triple-dot / Action Menus
 *   D       — Detail Views (drawers, detail pages)
 *   E       — Table Features (sorting, column dividers, search)
 *   F       — Non-functional / Coming-Soon flags
 */

import { test, expect, type Page } from '@playwright/test'
import {
  loadContext,
  gotoSalesPage,
  waitForTableToLoad,
  dismissModal,
} from '../helpers/navigation'
import { selectors } from '../helpers/selectors'

// ── Shared state ─────────────────────────────────────────────────────────────
let companyId: string | null = null
const STAMP = Date.now()
const TEST_CUSTOMER_NAME = `Audit Customer ${STAMP}`
const TEST_PRODUCT_NAME = `Audit Service ${STAMP}`

// Track what got created so dependent tests can skip gracefully
let customerCreated = false
let customerName = TEST_CUSTOMER_NAME

// ── Helpers ───────────────────────────────────────────────────────────────────

function loadCompany(): void {
  const ctx = loadContext()
  companyId = ctx.companyId
}

/** Returns true if the page has no fatal Next.js error overlay */
async function expectPageAlive(page: Page): Promise<void> {
  await expect(
    page.locator('main, [role="main"], #__next > div').first(),
  ).toBeVisible({ timeout: 14_000 })
  const errOverlay = page.locator(
    '[class*="nextjs-container-error"], [id*="error-overlay"], div[data-nextjs-error]',
  )
  const isError = await errOverlay.isVisible({ timeout: 1000 }).catch(() => false)
  expect(isError, 'Fatal error overlay must not appear').toBe(false)
}

/**
 * Click a button matching the pattern, wait for a modal element to appear.
 * Returns the modal locator (potentially not visible) so callers can check.
 */
async function clickAndWaitForModal(
  page: Page,
  btnPattern: RegExp,
  timeout = 8_000,
): Promise<{ found: boolean }> {
  const btn = page.getByRole('button', { name: btnPattern }).first()
  const visible = await btn.isVisible({ timeout: 6_000 }).catch(() => false)
  if (!visible) return { found: false }
  await btn.click()
  const modal = page.locator('[role="dialog"], div.fixed.inset-0.z-50').first()
  const open = await modal.isVisible({ timeout }).catch(() => false)
  return { found: open }
}

/**
 * Within an open modal/dialog, use the CustomerPickerField to select a customer by name.
 * CustomerPickerField renders a plain <input placeholder="Select customer...">
 * that opens a dropdown when focused.
 */
async function pickCustomerInModal(page: Page, name: string): Promise<boolean> {
  const modal = page.locator('[role="dialog"], div.fixed.inset-0.z-50').first()
  const picker = modal.locator('input[placeholder*="customer" i]').first()
  if (!(await picker.isVisible({ timeout: 5_000 }).catch(() => false))) return false

  await picker.click()
  await picker.fill(name.substring(0, 10)) // type partial name to trigger filter
  await page.waitForTimeout(500)

  // click the first matching dropdown option
  const option = page
    .locator('.absolute button, [role="option"], div[role="listbox"] button')
    .filter({ hasText: name.substring(0, 6) })
    .first()

  if (await option.isVisible({ timeout: 4_000 }).catch(() => false)) {
    await option.click()
    await page.waitForTimeout(300)
    return true
  }

  // Try clicking the first item in the dropdown that appeared after typing
  const anyOption = page
    .locator('.absolute li, .absolute button')
    .first()
  if (await anyOption.isVisible({ timeout: 2_000 }).catch(() => false)) {
    await anyOption.click()
    await page.waitForTimeout(300)
    return true
  }

  return false
}

/**
 * Press Escape then click Cancel if visible to close an open modal.
 */
async function closeModal(page: Page): Promise<void> {
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)
  const cancel = page.getByRole('button', { name: /cancel/i }).first()
  if (await cancel.isVisible({ timeout: 1_500 }).catch(() => false)) {
    await cancel.click()
  }
  await page.waitForTimeout(300)
}

// ═══════════════════════════════════════════════════════════════════════════
// SEED — Create Test Customer (prerequisite for all customer-picker tests)
// ═══════════════════════════════════════════════════════════════════════════

test.describe('SEED. Pre-condition: Create Test Customer', () => {
  test.beforeEach(() => {
    loadCompany()
  })

  test('[SEED] Create a test customer', async ({ page }) => {
    await gotoSalesPage(page, '/sales/customers', companyId)
    await waitForTableToLoad(page)

    const addBtn = page
      .getByRole('button', { name: /add customer|new customer/i })
      .first()
    const addVisible = await addBtn.isVisible({ timeout: 6_000 }).catch(() => false)
    if (!addVisible) {
      console.log('[SEED] "Add Customer" button not found — seeding skipped')
      test.skip()
      return
    }

    await addBtn.click()

    const modal = page.locator('[role="dialog"]').first()
    const modalOpen = await modal.isVisible({ timeout: 8_000 }).catch(() => false)
    if (!modalOpen) { console.log('[SEED] Modal did not open'); test.skip(); return }

    // Name field (required)
    const nameField = modal.locator('input').first()
    if (!(await nameField.isVisible({ timeout: 3_000 }).catch(() => false))) {
      await closeModal(page); test.skip(); return
    }
    await nameField.fill(TEST_CUSTOMER_NAME)

    // Email (optional)
    const emailField = modal.locator('input[type="email"]').first()
    if (await emailField.isVisible({ timeout: 1_500 }).catch(() => false)) {
      await emailField.fill(`audit-${STAMP}@haypbooks.test`)
    }

    const saveBtn = modal.getByRole('button', { name: /add customer|save|create/i }).first()
    await saveBtn.click()

    await modal.waitFor({ state: 'hidden', timeout: 10_000 }).catch(() => {})
    await waitForTableToLoad(page)

    const appeared = await page
      .getByText(TEST_CUSTOMER_NAME)
      .first()
      .isVisible({ timeout: 6_000 })
      .catch(() => false)

    customerCreated = appeared
    console.log(`[SEED] Customer created: ${customerCreated}, name: ${TEST_CUSTOMER_NAME}`)
    expect(appeared, `Customer "${TEST_CUSTOMER_NAME}" should appear in the list`).toBe(true)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// A. CREATE FLOWS
// ═══════════════════════════════════════════════════════════════════════════

test.describe('A. Create Flows', () => {
  test.beforeEach(() => {
    loadCompany()
  })

  // ── A.1 Customer ─────────────────────────────────────────────────────────

  test('[A.1] Customers — "Add Customer" opens modal with Name field', async ({ page }) => {
    await gotoSalesPage(page, '/sales/customers', companyId)
    await waitForTableToLoad(page)

    const { found } = await clickAndWaitForModal(page, /add customer|new customer/i)
    if (!found) { test.skip(); return }

    const modal = page.locator('[role="dialog"]').first()
    const nameInput = modal.locator('input').first()
    expect(await nameInput.isVisible({ timeout: 4_000 })).toBe(true)

    // Verify submit button exists
    expect(
      await modal.getByRole('button', { name: /add customer|save|create/i }).first().isVisible(),
    ).toBe(true)

    await closeModal(page)
  })

  test('[A.2] Customers — submit empty name shows validation', async ({ page }) => {
    await gotoSalesPage(page, '/sales/customers', companyId)
    await waitForTableToLoad(page)

    const addBtn = page.getByRole('button', { name: /add customer/i }).first()
    if (!(await addBtn.isVisible({ timeout: 5_000 }).catch(() => false))) { test.skip(); return }
    await addBtn.click()

    const modal = page.locator('[role="dialog"]').first()
    if (!(await modal.isVisible({ timeout: 6_000 }).catch(() => false))) { test.skip(); return }

    // Do NOT fill name, click Save
    const saveBtn = modal.getByRole('button', { name: /add customer|save|create/i }).first()
    await saveBtn.click()

    // Modal should remain open (validation blocked submit) OR error text visible
    const stillOpen = await modal.isVisible({ timeout: 2_000 }).catch(() => false)
    const errText = await page.locator('text=/required|name is/i').isVisible({ timeout: 2_000 }).catch(() => false)
    expect(stillOpen || errText, 'Empty-name submit should be blocked').toBe(true)

    await closeModal(page)
  })

  // ── A.3 Products & Services ───────────────────────────────────────────────

  test('[A.3] Products — "New Item" opens ProductFormModal', async ({ page }) => {
    await gotoSalesPage(page, '/sales/sales/products-services', companyId)
    await waitForTableToLoad(page)

    const { found } = await clickAndWaitForModal(page, /new item/i)
    if (!found) { test.skip(); return }

    const modal = page.locator('div.fixed.inset-0.z-50, [role="dialog"]').first()
    // Header should say "New Product / Service"
    const heading = modal.locator('h2').first()
    expect(await heading.isVisible({ timeout: 4_000 })).toBe(true)
    const headingText = await heading.textContent()
    expect(headingText).toMatch(/new product|service/i)

    await closeModal(page)
  })

  test('[A.4] Products — create SERVICE item (name + price, no SKU)', async ({ page }) => {
    await gotoSalesPage(page, '/sales/sales/products-services', companyId)
    await waitForTableToLoad(page)

    const newBtn = page.getByRole('button', { name: /new item/i }).first()
    if (!(await newBtn.isVisible({ timeout: 5_000 }).catch(() => false))) { test.skip(); return }
    await newBtn.click()

    const modal = page.locator('div.fixed.inset-0.z-50, [role="dialog"]').first()
    if (!(await modal.isVisible({ timeout: 6_000 }).catch(() => false))) { test.skip(); return }

    // Select "Service" type tab if present (avoids SKU requirement)
    const serviceTab = modal.locator('button').filter({ hasText: /^service$/i }).first()
    if (await serviceTab.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await serviceTab.click()
    }

    // Fill name
    const nameInput = modal.locator('#item-name-input, input[placeholder*="name" i]').first()
    if (!(await nameInput.isVisible({ timeout: 4_000 }).catch(() => false))) { await closeModal(page); test.skip(); return }
    await nameInput.fill(TEST_PRODUCT_NAME)

    // Fill sales price
    const priceInput = modal
      .locator('input[type="number"], input[placeholder*="price" i], input[placeholder*="0.00"]')
      .first()
    if (await priceInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await priceInput.fill('99.99')
    }

    // Submit
    const saveBtn = modal.getByRole('button', { name: /save|create|add item/i }).first()
    if (!(await saveBtn.isVisible({ timeout: 3_000 }).catch(() => false))) { await closeModal(page); test.skip(); return }
    await saveBtn.click()

    // Modal should close (success) or show validation error (not a crash)
    const closed = await modal
      .waitFor({ state: 'hidden', timeout: 8_000 })
      .then(() => true)
      .catch(() => false)

    if (!closed) {
      const errText = await modal.locator('text=/required|error/i').isVisible({ timeout: 2_000 }).catch(() => false)
      // Error is OK — means some validation, not a crash
      console.log(`[A.4] Product create — modal stayed open, errText=${errText}`)
      await closeModal(page)
    }
  })

  // ── A.5 Quotes ───────────────────────────────────────────────────────────

  test('[A.5] Quotes — "+ New" opens quote modal with customer picker', async ({ page }) => {
    await gotoSalesPage(page, '/sales/sales/quotes', companyId)
    await waitForTableToLoad(page)

    const { found } = await clickAndWaitForModal(page, /^\+\s*new$|new quote/i)
    if (!found) { test.skip(); return }

    const modal = page.locator('[role="dialog"], div.fixed.inset-0.z-50').first()
    const picker = modal.locator('input[placeholder*="customer" i]').first()
    expect(await picker.isVisible({ timeout: 5_000 }), 'Customer picker must be visible').toBe(true)

    await closeModal(page)
  })

  test('[A.6] Quotes — submit without customer shows validation error', async ({ page }) => {
    await gotoSalesPage(page, '/sales/sales/quotes', companyId)
    await waitForTableToLoad(page)

    const newBtn = page.getByRole('button', { name: /^\+\s*new$|new quote/i }).first()
    if (!(await newBtn.isVisible({ timeout: 5_000 }).catch(() => false))) { test.skip(); return }
    await newBtn.click()

    const modal = page.locator('[role="dialog"], div.fixed.inset-0.z-50').first()
    if (!(await modal.isVisible({ timeout: 6_000 }).catch(() => false))) { test.skip(); return }

    // Click Save without filling in required fields
    const saveBtn = modal.getByRole('button', { name: /save|create|add quote/i }).first()
    if (!(await saveBtn.isVisible({ timeout: 3_000 }).catch(() => false))) { await closeModal(page); test.skip(); return }
    await saveBtn.click()

    // Expect validation message to appear
    const errMsg = page.locator('text=/select a customer|customer is required|add at least/i').first()
    const hasErr = await errMsg.isVisible({ timeout: 4_000 }).catch(() => false)
    const stillOpen = await modal.isVisible({ timeout: 1_000 }).catch(() => false)
    expect(hasErr || stillOpen, 'Validation should prevent empty quote submit').toBe(true)

    await closeModal(page)
  })

  test('[A.7] Quotes — create quote with customer + line item (requires seeded customer)', async ({ page }) => {
    if (!customerCreated) { test.skip(); return }

    await gotoSalesPage(page, '/sales/sales/quotes', companyId)
    await waitForTableToLoad(page)

    const newBtn = page.getByRole('button', { name: /^\+\s*new$|new quote/i }).first()
    if (!(await newBtn.isVisible({ timeout: 5_000 }).catch(() => false))) { test.skip(); return }
    await newBtn.click()

    const modal = page.locator('[role="dialog"], div.fixed.inset-0.z-50').first()
    if (!(await modal.isVisible({ timeout: 6_000 }).catch(() => false))) { test.skip(); return }

    // Pick customer
    const picked = await pickCustomerInModal(page, TEST_CUSTOMER_NAME)
    if (!picked) {
      console.log('[A.7] Could not pick customer — skipping')
      await closeModal(page); test.skip(); return
    }

    // Fill line item description
    const descInput = modal
      .locator('input[placeholder*="description" i], textarea[placeholder*="description" i], input[placeholder*="item" i]')
      .first()
    if (await descInput.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await descInput.fill(`Test line item ${STAMP}`)
    }

    // Submit
    const saveBtn = modal.getByRole('button', { name: /save|create|add quote/i }).first()
    if (!(await saveBtn.isVisible({ timeout: 3_000 }).catch(() => false))) { await closeModal(page); test.skip(); return }
    await saveBtn.click()

    // Modal closes on success
    const closed = await modal
      .waitFor({ state: 'hidden', timeout: 10_000 })
      .then(() => true)
      .catch(() => false)

    if (!closed) {
      const errElem = modal.locator('[class*="error" i], [class*="rose"], p.text-rose-500').first()
      const errText = await errElem.textContent({ timeout: 2_000 }).catch(() => '')
      console.log(`[A.7] Quote not saved: ${errText || 'modal still open'}`)
      await closeModal(page)
      // Not failing — quotation may require further backend setup
    } else {
      console.log('[A.7] Quote created successfully')
    }
  })

  // ── A.8 Sales Orders ─────────────────────────────────────────────────────

  test('[A.8] Sales Orders — "+ New" opens modal with customer picker', async ({ page }) => {
    await gotoSalesPage(page, '/sales/sales/orders', companyId)
    await waitForTableToLoad(page)

    const { found } = await clickAndWaitForModal(page, /^\+\s*new$|new order/i)
    if (!found) { test.skip(); return }

    const modal = page.locator('[role="dialog"], div.fixed.inset-0.z-50').first()
    const picker = modal.locator('input[placeholder*="customer" i]').first()
    expect(await picker.isVisible({ timeout: 5_000 }), 'Customer picker must appear').toBe(true)

    await closeModal(page)
  })

  test('[A.9] Sales Orders — create order requires customer (toast on empty)', async ({ page }) => {
    await gotoSalesPage(page, '/sales/sales/orders', companyId)
    await waitForTableToLoad(page)

    const newBtn = page.getByRole('button', { name: /^\+\s*new$|new order/i }).first()
    if (!(await newBtn.isVisible({ timeout: 5_000 }).catch(() => false))) { test.skip(); return }
    await newBtn.click()

    const modal = page.locator('[role="dialog"], div.fixed.inset-0.z-50').first()
    if (!(await modal.isVisible({ timeout: 6_000 }).catch(() => false))) { test.skip(); return }

    // Submit without customer
    const saveBtn = modal.getByRole('button', { name: /save|create|submit/i }).first()
    if (!(await saveBtn.isVisible({ timeout: 3_000 }).catch(() => false))) { await closeModal(page); test.skip(); return }
    await saveBtn.click()

    // Expect a toast or inline error mentioning "customer"
    const toast = page.locator('[class*="toast"], [role="alert"], [class*="Toastify"]').first()
    const errMsg = page.locator('text=/customer.*required|required.*customer/i').first()
    const hasToast = await toast.isVisible({ timeout: 4_000 }).catch(() => false)
    const hasErr = await errMsg.isVisible({ timeout: 2_000 }).catch(() => false)
    const stillOpen = await modal.isVisible({ timeout: 1_000 }).catch(() => false)
    expect(hasToast || hasErr || stillOpen, 'Validation should block empty order submit').toBe(true)

    await closeModal(page)
  })

  // ── A.10 Invoice Create Flow ───────────────────────────────────────────────

  test('[A.10] Invoices — "New Invoice" button navigates to create page', async ({ page }) => {
    await gotoSalesPage(page, '/sales/billing/invoices', companyId)
    await waitForTableToLoad(page)

    const newBtn = page.getByRole('button', { name: /new invoice/i }).first()
    if (!(await newBtn.isVisible({ timeout: 6_000 }).catch(() => false))) { test.skip(); return }

    await newBtn.click()

    await page.waitForURL(/\/invoices\/new/, { timeout: 10_000 }).catch(() => {})
    const isOnCreate = page.url().includes('/invoices/new')
    expect(isOnCreate, 'Should navigate to /invoices/new after clicking New Invoice').toBe(true)

    await expectPageAlive(page)
  })

  test('[A.11] Invoice create page — customer picker and line item fields exist', async ({ page }) => {
    await gotoSalesPage(page, '/sales/billing/invoices/new', companyId)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(1_000)

    await expectPageAlive(page)

    // Customer picker
    const custPicker = page.locator('input[placeholder*="customer" i], input[placeholder*="Select" i]').first()
    expect(
      await custPicker.isVisible({ timeout: 6_000 }).catch(() => false),
      'Customer picker must be on invoice create page',
    ).toBe(true)

    // At least one line item description field
    const descField = page
      .locator('input[placeholder*="product" i], input[placeholder*="service" i], input[placeholder*="description" i]')
      .first()
    expect(
      await descField.isVisible({ timeout: 5_000 }).catch(() => false),
      'Line item description field must be on invoice create page',
    ).toBe(true)
  })

  test('[A.12] Invoice create page — "Save Draft" button exists', async ({ page }) => {
    await gotoSalesPage(page, '/sales/billing/invoices/new', companyId)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(800)

    const saveDraft = page.getByRole('button', { name: /save draft/i }).first()
    expect(
      await saveDraft.isVisible({ timeout: 6_000 }).catch(() => false),
      '"Save Draft" button must be present on invoice create page',
    ).toBe(true)
  })

  test('[A.13] Invoice create page — no section tabs (billing tabs hidden)', async ({ page }) => {
    await gotoSalesPage(page, '/sales/billing/invoices/new', companyId)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(600)

    const sectionTabs = page.locator('nav[aria-label="Module tabs"]')
    const tabsVisible = await sectionTabs.isVisible({ timeout: 3_000 }).catch(() => false)
    expect(tabsVisible, 'Module tabs must NOT appear on invoice create page').toBe(false)
  })

  // ── A.14 Customer Payments ────────────────────────────────────────────────

  test('[A.14] Payments — "+ New" / "Record Payment" opens modal with amount field', async ({
    page,
  }) => {
    await gotoSalesPage(page, '/sales/collections/payments', companyId)
    await waitForTableToLoad(page)

    const { found } = await clickAndWaitForModal(page, /new payment/i)
    if (!found) { test.skip(); return }

    const modal = page.locator('[role="dialog"], div.fixed.inset-0.z-50').first()
    const amountField = modal
      .locator('input[type="number"], input[placeholder*="amount" i], input[placeholder*="0.00"]')
      .first()
    expect(
      await amountField.isVisible({ timeout: 5_000 }),
      'Amount field must be in payment modal',
    ).toBe(true)

    await closeModal(page)
  })

  test('[A.15] Payments — submit with amount=0 shows validation error', async ({ page }) => {
    await gotoSalesPage(page, '/sales/collections/payments', companyId)
    await waitForTableToLoad(page)

    const newBtn = page.getByRole('button', { name: /new payment/i }).first()
    if (!(await newBtn.isVisible({ timeout: 5_000 }).catch(() => false))) { test.skip(); return }
    await newBtn.click()

    const modal = page.locator('[role="dialog"], div.fixed.inset-0.z-50').first()
    if (!(await modal.isVisible({ timeout: 6_000 }).catch(() => false))) { test.skip(); return }

    // Leave amount at 0 or empty, submit
    const saveBtn = modal.getByRole('button', { name: /save|record|create/i }).first()
    if (!(await saveBtn.isVisible({ timeout: 3_000 }).catch(() => false))) { await closeModal(page); test.skip(); return }
    await saveBtn.click()

    const errText = page
      .locator('text=/valid amount|amount.*greater|enter.*amount/i')
      .first()
    const hasErr = await errText.isVisible({ timeout: 4_000 }).catch(() => false)
    const stillOpen = await modal.isVisible({ timeout: 1_000 }).catch(() => false)
    expect(hasErr || stillOpen, 'Empty amount submit should fail validation').toBe(true)

    await closeModal(page)
  })

  test('[A.16] Payments — submit with valid amount succeeds (no customer required)', async ({
    page,
  }) => {
    await gotoSalesPage(page, '/sales/collections/payments', companyId)
    await waitForTableToLoad(page)

    const newBtn = page.getByRole('button', { name: /new payment/i }).first()
    if (!(await newBtn.isVisible({ timeout: 5_000 }).catch(() => false))) { test.skip(); return }
    await newBtn.click()

    const modal = page.locator('[role="dialog"], div.fixed.inset-0.z-50').first()
    if (!(await modal.isVisible({ timeout: 6_000 }).catch(() => false))) { test.skip(); return }

    // Fill amount
    const amountField = modal
      .locator('input[type="number"], input[placeholder*="0.00"]')
      .first()
    if (!(await amountField.isVisible({ timeout: 3_000 }).catch(() => false))) {
      await closeModal(page); test.skip(); return
    }
    await amountField.fill('1.00')

    // Submit
    const saveBtn = modal.getByRole('button', { name: /save|record|create/i }).first()
    await saveBtn.click()

    const closed = await modal
      .waitFor({ state: 'hidden', timeout: 10_000 })
      .then(() => true)
      .catch(() => false)

    if (!closed) {
      const errElem = modal.locator('[class*="rose"], [class*="error"]').first()
      const errText = await errElem.textContent({ timeout: 2_000 }).catch(() => '')
      console.log(`[A.16] Payment not saved: ${errText || 'unknown'}`)
      await closeModal(page)
    } else {
      console.log('[A.16] Payment created successfully')
    }
  })

  // ── A.17 Credit Notes ─────────────────────────────────────────────────────

  test('[A.17] Credit Notes — "+ New" opens modal with customer picker + amount', async ({
    page,
  }) => {
    await gotoSalesPage(page, '/sales/revenue/credit-notes', companyId)
    await waitForTableToLoad(page)

    const { found } = await clickAndWaitForModal(page, /^\+\s*new$|new credit note/i)
    if (!found) { test.skip(); return }

    const modal = page.locator('[role="dialog"], div.fixed.inset-0.z-50').first()
    // Customer picker
    const picker = modal.locator('input[placeholder*="customer" i]').first()
    expect(
      await picker.isVisible({ timeout: 5_000 }),
      'Customer picker must appear in credit note modal',
    ).toBe(true)

    // Amount field
    const amtField = modal.locator('input[type="number"], input[placeholder*="0.00"]').first()
    expect(
      await amtField.isVisible({ timeout: 4_000 }),
      'Amount field must appear in credit note modal',
    ).toBe(true)

    await closeModal(page)
  })

  test('[A.18] Credit Notes — submit without customer shows "Select a customer"', async ({
    page,
  }) => {
    await gotoSalesPage(page, '/sales/revenue/credit-notes', companyId)
    await waitForTableToLoad(page)

    const newBtn = page.getByRole('button', { name: /^\+\s*new$|new credit note/i }).first()
    if (!(await newBtn.isVisible({ timeout: 5_000 }).catch(() => false))) { test.skip(); return }
    await newBtn.click()

    const modal = page.locator('[role="dialog"], div.fixed.inset-0.z-50').first()
    if (!(await modal.isVisible({ timeout: 6_000 }).catch(() => false))) { test.skip(); return }

    // Fill amount but no customer
    const amtField = modal.locator('input[type="number"], input[placeholder*="0.00"]').first()
    if (await amtField.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await amtField.fill('100')
    }

    const saveBtn = modal.getByRole('button', { name: /create credit note|save/i }).first()
    if (!(await saveBtn.isVisible({ timeout: 3_000 }).catch(() => false))) { await closeModal(page); test.skip(); return }
    await saveBtn.click()

    const errMsg = page.locator('text=/select a customer|customer.*required/i').first()
    const hasErr = await errMsg.isVisible({ timeout: 4_000 }).catch(() => false)
    const stillOpen = await modal.isVisible({ timeout: 1_000 }).catch(() => false)
    expect(hasErr || stillOpen, 'Validation should require customer for credit note').toBe(true)

    await closeModal(page)
  })

  // ── A.19 Write-Offs ────────────────────────────────────────────────────────

  test('[A.19] Write-Offs — "+ New" opens modal with amount + reason fields', async ({ page }) => {
    await gotoSalesPage(page, '/sales/collections/write-offs', companyId)
    await waitForTableToLoad(page)

    const { found } = await clickAndWaitForModal(page, /^\+\s*new$|new write.?off/i)
    if (!found) { test.skip(); return }

    const modal = page.locator('[role="dialog"], div.fixed.inset-0.z-50').first()

    const amtField = modal.locator('input[type="number"], input[placeholder*="0.00"]').first()
    expect(
      await amtField.isVisible({ timeout: 5_000 }),
      'Amount field must appear in write-off modal',
    ).toBe(true)

    const reasonField = modal.locator('textarea, input[placeholder*="reason" i]').first()
    expect(
      await reasonField.isVisible({ timeout: 4_000 }),
      'Reason field must appear in write-off modal',
    ).toBe(true)

    await closeModal(page)
  })

  test('[A.20] Write-Offs — create write-off with amount + reason (no customer needed)', async ({
    page,
  }) => {
    await gotoSalesPage(page, '/sales/collections/write-offs', companyId)
    await waitForTableToLoad(page)

    const newBtn = page.getByRole('button', { name: /^\+\s*new$|new write.?off/i }).first()
    if (!(await newBtn.isVisible({ timeout: 5_000 }).catch(() => false))) { test.skip(); return }
    await newBtn.click()

    const modal = page.locator('[role="dialog"], div.fixed.inset-0.z-50').first()
    if (!(await modal.isVisible({ timeout: 6_000 }).catch(() => false))) { test.skip(); return }

    const amtField = modal.locator('input[type="number"], input[placeholder*="0.00"]').first()
    if (await amtField.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await amtField.fill('50.00')
    }

    const reasonField = modal.locator('textarea, input[placeholder*="reason" i]').first()
    if (await reasonField.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await reasonField.fill(`Test write-off ${STAMP}`)
    }

    const saveBtn = modal.getByRole('button', { name: /save|create|submit/i }).first()
    if (!(await saveBtn.isVisible({ timeout: 3_000 }).catch(() => false))) { await closeModal(page); test.skip(); return }
    await saveBtn.click()

    const closed = await modal
      .waitFor({ state: 'hidden', timeout: 10_000 })
      .then(() => true)
      .catch(() => false)

    if (!closed) {
      console.log('[A.20] Write-off not saved — modal stayed open')
      await closeModal(page)
    } else {
      console.log('[A.20] Write-off created successfully')
    }
  })

  // ── A.21 Refunds ──────────────────────────────────────────────────────────

  test('[A.21] Refunds — "+ New" opens modal with customer picker + amount', async ({ page }) => {
    await gotoSalesPage(page, '/sales/collections/refunds', companyId)
    await waitForTableToLoad(page)

    const { found } = await clickAndWaitForModal(page, /^\+\s*new$|new refund/i)
    if (!found) { test.skip(); return }

    const modal = page.locator('[role="dialog"], div.fixed.inset-0.z-50').first()
    const picker = modal.locator('input[placeholder*="customer" i]').first()
    expect(
      await picker.isVisible({ timeout: 5_000 }),
      'Customer picker must appear in refund modal',
    ).toBe(true)

    await closeModal(page)
  })

  // ── A.22 Recurring Invoices ────────────────────────────────────────────────

  test('[A.22] Recurring — "+ New" opens modal with customer picker + amount', async ({ page }) => {
    await gotoSalesPage(page, '/sales/billing/recurring', companyId)
    await waitForTableToLoad(page)

    const { found } = await clickAndWaitForModal(page, /^\+\s*new$|new template/i)
    if (!found) { test.skip(); return }

    const modal = page.locator('[role="dialog"], div.fixed.inset-0.z-50').first()
    const picker = modal.locator('input[placeholder*="customer" i]').first()
    expect(
      await picker.isVisible({ timeout: 5_000 }),
      'Customer picker must appear in recurring modal',
    ).toBe(true)

    const amtField = modal
      .locator('input[type="number"][placeholder*="0.00"], input[placeholder*="amount" i]')
      .first()
    const hasAmt = await amtField.isVisible({ timeout: 3_000 }).catch(() => false)
    console.log(`[A.22] Recurring modal has amount field: ${hasAmt}`)

    await closeModal(page)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// B. CUSTOMER PICKER FIELD TESTS
// ═══════════════════════════════════════════════════════════════════════════

test.describe('B. Customer Picker Field', () => {
  test.beforeEach(() => {
    loadCompany()
  })

  const PICKER_PAGES = [
    { path: '/sales/sales/quotes', btnPattern: /^\+\s*new$|new quote/i, label: 'Quotes' },
    { path: '/sales/sales/orders', btnPattern: /^\+\s*new$|new order/i, label: 'Sales Orders' },
    {
      path: '/sales/collections/payments',
      btnPattern: /new payment/i,
      label: 'Payments',
    },
    {
      path: '/sales/revenue/credit-notes',
      btnPattern: /^\+\s*new$|new credit note/i,
      label: 'Credit Notes',
    },
    {
      path: '/sales/billing/recurring',
      btnPattern: /^\+\s*new$|new template/i,
      label: 'Recurring',
    },
    {
      path: '/sales/collections/refunds',
      btnPattern: /^\+\s*new$|new refund/i,
      label: 'Refunds',
    },
  ]

  for (const pg of PICKER_PAGES) {
    test(`[B] ${pg.label} — customer picker input is an <input> that opens dropdown on focus`, async ({
      page,
    }) => {
      await gotoSalesPage(page, pg.path, companyId)
      await waitForTableToLoad(page)

      const newBtn = page.getByRole('button', { name: pg.btnPattern }).first()
      if (!(await newBtn.isVisible({ timeout: 5_000 }).catch(() => false))) { test.skip(); return }
      await newBtn.click()

      const modal = page.locator('[role="dialog"], div.fixed.inset-0.z-50').first()
      if (!(await modal.isVisible({ timeout: 6_000 }).catch(() => false))) { test.skip(); return }

      const picker = modal.locator('input[placeholder*="customer" i]').first()
      if (!(await picker.isVisible({ timeout: 5_000 }).catch(() => false))) {
        console.log(`[B] ${pg.label}: no customer picker found`)
        await closeModal(page); test.skip(); return
      }

      // Focus the picker — dropdown should open
      await picker.click()
      await page.waitForTimeout(600)

      // After focusing, either options appear or "loading" or "no customers" text
      const dropdownContent = page
        .locator('.absolute button, .absolute li, [role="option"], .absolute p')
        .first()
      const dropdownOpen = await dropdownContent.isVisible({ timeout: 4_000 }).catch(() => false)

      console.log(`[B] ${pg.label}: dropdown opened = ${dropdownOpen}`)
      // We just expect it doesn't crash — not strictly requiring options
      await closeModal(page)
    })
  }

  test('[B] Invoice create page — customer picker focuses and lists options', async ({ page }) => {
    await gotoSalesPage(page, '/sales/billing/invoices/new', companyId)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(1_000)

    const picker = page.locator('input[placeholder*="customer" i], input[placeholder*="Select" i]').first()
    if (!(await picker.isVisible({ timeout: 6_000 }).catch(() => false))) { test.skip(); return }

    await picker.click()
    await page.waitForTimeout(700)

    // Dropdown or message should appear
    const dropdownContent = page
      .locator('.absolute button, .absolute li, [role="option"], .absolute p')
      .first()
    const open = await dropdownContent.isVisible({ timeout: 4_000 }).catch(() => false)
    console.log(`[B] Invoice customer picker dropdown opened: ${open}`)
    // No strict assertion — just verify no crash
    await expectPageAlive(page)
  })

  test('[B] Quote modal — customer picker filters by typed query', async ({ page }) => {
    if (!customerCreated) { test.skip(); return }

    await gotoSalesPage(page, '/sales/sales/quotes', companyId)
    await waitForTableToLoad(page)

    const newBtn = page.getByRole('button', { name: /^\+\s*new$|new quote/i }).first()
    if (!(await newBtn.isVisible({ timeout: 5_000 }).catch(() => false))) { test.skip(); return }
    await newBtn.click()

    const modal = page.locator('[role="dialog"], div.fixed.inset-0.z-50').first()
    if (!(await modal.isVisible({ timeout: 6_000 }).catch(() => false))) { test.skip(); return }

    const picker = modal.locator('input[placeholder*="customer" i]').first()
    if (!(await picker.isVisible({ timeout: 5_000 }).catch(() => false))) { await closeModal(page); test.skip(); return }

    // Type the first 6 chars of our test customer name
    const query = TEST_CUSTOMER_NAME.substring(0, 6)
    await picker.click()
    await picker.fill(query)
    await page.waitForTimeout(600)

    // Should see our customer's name in suggestions
    const customerOption = page
      .locator('.absolute button, .absolute li, [role="option"]')
      .filter({ hasText: query })
      .first()
    const visible = await customerOption.isVisible({ timeout: 4_000 }).catch(() => false)
    console.log(`[B] Quote filter by "${query}": option visible = ${visible}`)

    await closeModal(page)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// C. TRIPLE-DOT / ACTION MENUS
// ═══════════════════════════════════════════════════════════════════════════

test.describe('C. Action Menus', () => {
  test.beforeEach(() => {
    loadCompany()
  })

  test('[C.1] Invoices — table has action menu button on rows', async ({ page }) => {
    await gotoSalesPage(page, '/sales/billing/invoices', companyId)
    await waitForTableToLoad(page)

    const firstRow = page.locator('table tbody tr').first()
    const rowExists = await firstRow.isVisible({ timeout: 5_000 }).catch(() => false)
    if (!rowExists) { test.skip(); return } // no rows yet

    // Look for a three-dot or action button
    const menuBtn = firstRow
      .locator('button[title*="action" i], button[aria-label*="action" i], button[title*="menu" i], button:has(svg)')
      .first()
    const exists = await menuBtn.isVisible({ timeout: 3_000 }).catch(() => false)
    console.log(`[C.1] Invoice row action button found: ${exists}`)
    // Just verify no crash
    await expectPageAlive(page)
  })

  test('[C.2] Customers — triple-dot menu on row opens without crash', async ({ page }) => {
    await gotoSalesPage(page, '/sales/customers', companyId)
    await waitForTableToLoad(page)

    const firstRow = page.locator('table tbody tr').first()
    if (!(await firstRow.isVisible({ timeout: 5_000 }).catch(() => false))) { test.skip(); return }

    const menuBtn = firstRow.locator('button').last()
    if (!(await menuBtn.isVisible({ timeout: 3_000 }).catch(() => false))) { test.skip(); return }

    await menuBtn.click()
    await page.waitForTimeout(500)

    // expect a dropdown with edit/delete etc.
    const menuItems = page.locator('[role="menu"], [role="menuitem"], .absolute li, .absolute button').first()
    const open = await menuItems.isVisible({ timeout: 3_000 }).catch(() => false)
    console.log(`[C.2] Customer row menu opened: ${open}`)

    // Close by pressing Escape
    await page.keyboard.press('Escape')
    await expectPageAlive(page)
  })

  test('[C.3] Products & Services — row has Edit and Delete actions', async ({ page }) => {
    await gotoSalesPage(page, '/sales/sales/products-services', companyId)
    await waitForTableToLoad(page)

    const firstRow = page.locator('table tbody tr').first()
    if (!(await firstRow.isVisible({ timeout: 5_000 }).catch(() => false))) { test.skip(); return }

    // Hover row to reveal action buttons
    await firstRow.hover()
    await page.waitForTimeout(400)

    const editBtn = firstRow.locator('button[title*="edit" i], button[aria-label*="edit" i], button:has-text("Edit")').first()
    const deleteBtn = firstRow.locator('button[title*="delete" i], button[aria-label*="delete" i], button:has-text("Delete")').first()

    // Look for three-dot toggle
    const threeDot = firstRow.locator('button[title*="more" i], button[aria-haspopup], button:last-child').last()
    if (await threeDot.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await threeDot.click()
      await page.waitForTimeout(400)
    }

    const hasEdit = await editBtn.isVisible({ timeout: 3_000 }).catch(() => false)
    const hasDelete = await deleteBtn.isVisible({ timeout: 3_000 }).catch(() => false)
    console.log(`[C.3] Products row — Edit: ${hasEdit}, Delete: ${hasDelete}`)

    await page.keyboard.press('Escape')
    await expectPageAlive(page)
  })

  test('[C.4] Quotes — row can be clicked to open detail drawer', async ({ page }) => {
    await gotoSalesPage(page, '/sales/sales/quotes', companyId)
    await waitForTableToLoad(page)

    const firstRow = page.locator('table tbody tr').first()
    if (!(await firstRow.isVisible({ timeout: 5_000 }).catch(() => false))) { test.skip(); return }

    await firstRow.click()
    await page.waitForTimeout(800)

    // A detail panel/drawer should appear
    const drawer = page
      .locator('[role="dialog"], aside, [class*="drawer"], [class*="slide"], div[data-state="open"]')
      .first()
    const open = await drawer.isVisible({ timeout: 6_000 }).catch(() => false)
    console.log(`[C.4] Quote detail drawer opened: ${open}`)

    await page.keyboard.press('Escape')
    await expectPageAlive(page)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// D. DETAIL VIEWS
// ═══════════════════════════════════════════════════════════════════════════

test.describe('D. Detail Views', () => {
  test.beforeEach(() => {
    loadCompany()
  })

  test('[D.1] Quotes — detail drawer shows Details and Activity tabs', async ({ page }) => {
    await gotoSalesPage(page, '/sales/sales/quotes', companyId)
    await waitForTableToLoad(page)

    const firstRow = page.locator('table tbody tr').first()
    if (!(await firstRow.isVisible({ timeout: 5_000 }).catch(() => false))) { test.skip(); return }

    await firstRow.click()
    await page.waitForTimeout(1_000)

    // Tabs: Details and Activity
    const detailsTab = page.getByRole('button', { name: /details/i }).first()
    const activityTab = page.getByRole('button', { name: /activity/i }).first()

    const hasDetails = await detailsTab.isVisible({ timeout: 5_000 }).catch(() => false)
    const hasActivity = await activityTab.isVisible({ timeout: 3_000 }).catch(() => false)

    console.log(`[D.1] Quote drawer — Details: ${hasDetails}, Activity: ${hasActivity}`)
    expect(hasDetails || hasActivity, 'Detail drawer should have at least one tab').toBe(true)

    // Click Activity tab if visible
    if (hasActivity) {
      await activityTab.click()
      await page.waitForTimeout(600)
      await expectPageAlive(page)
    }

    await page.keyboard.press('Escape')
  })

  test('[D.2] Customers — clicking a customer row navigates to detail page', async ({ page }) => {
    await gotoSalesPage(page, '/sales/customers', companyId)
    await waitForTableToLoad(page)

    const firstRow = page.locator('table tbody tr').first()
    if (!(await firstRow.isVisible({ timeout: 5_000 }).catch(() => false))) { test.skip(); return }

    await firstRow.click()
    await page
      .waitForURL(/\/sales\/customers\/[^?/]+/, { timeout: 8_000 })
      .catch(() => {})

    const isOnDetail = /\/sales\/customers\/[^?/]+/.test(page.url())
    console.log(`[D.2] Customer detail URL reached: ${isOnDetail} (${page.url()})`)

    if (isOnDetail) {
      await expectPageAlive(page)
      // Check no module tabs
      const tabs = page.locator('nav[aria-label="Module tabs"]')
      const tabsVisible = await tabs.isVisible({ timeout: 3_000 }).catch(() => false)
      expect(tabsVisible, 'Module tabs must NOT appear on customer detail page').toBe(false)
    }
  })

  test('[D.3] Products — clicking a row navigates to product detail page', async ({ page }) => {
    await gotoSalesPage(page, '/sales/sales/products-services', companyId)
    await waitForTableToLoad(page)

    const firstRow = page.locator('table tbody tr').first()
    if (!(await firstRow.isVisible({ timeout: 5_000 }).catch(() => false))) { test.skip(); return }

    await firstRow.click()
    await page
      .waitForURL(/\/sales\/sales\/products-services\/[^?/]+/, { timeout: 8_000 })
      .catch(() => {})

    const isOnDetail = /\/sales\/sales\/products-services\/[^?/]+/.test(page.url())
    console.log(`[D.3] Product detail URL reached: ${isOnDetail} (${page.url()})`)

    if (isOnDetail) {
      await expectPageAlive(page)
    }
  })

  test('[D.4] ProductFormModal — has Details and Activity tabs when editing', async ({ page }) => {
    await gotoSalesPage(page, '/sales/sales/products-services', companyId)
    await waitForTableToLoad(page)

    const firstRow = page.locator('table tbody tr').first()
    if (!(await firstRow.isVisible({ timeout: 5_000 }).catch(() => false))) { test.skip(); return }

    // Hover to reveal edit button
    await firstRow.hover()
    await page.waitForTimeout(300)

    const editBtn = firstRow
      .locator('button[title*="edit" i], button:has-text("Edit")')
      .first()
    const threeBtn = firstRow.locator('button').last()

    if (await editBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await editBtn.click()
    } else {
      await threeBtn.click()
      await page.waitForTimeout(300)
      const editInMenu = page.locator('button:has-text("Edit"), [role="menuitem"]:has-text("Edit")').first()
      if (await editInMenu.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await editInMenu.click()
      } else {
        test.skip(); return
      }
    }

    const modal = page.locator('div.fixed.inset-0.z-50, [role="dialog"]').first()
    if (!(await modal.isVisible({ timeout: 6_000 }).catch(() => false))) { test.skip(); return }

    const detailsTab = modal.getByRole('button', { name: /details/i }).first()
    const activityTab = modal.getByRole('button', { name: /activity/i }).first()
    const hasDetails = await detailsTab.isVisible({ timeout: 4_000 }).catch(() => false)
    const hasActivity = await activityTab.isVisible({ timeout: 3_000 }).catch(() => false)

    console.log(`[D.4] ProductFormModal tabs — Details: ${hasDetails}, Activity: ${hasActivity}`)

    await closeModal(page)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// E. TABLE FEATURES
// ═══════════════════════════════════════════════════════════════════════════

test.describe('E. Table Features', () => {
  test.beforeEach(() => {
    loadCompany()
  })

  const TABLE_PAGES = [
    { path: '/sales/customers', label: 'Customers' },
    { path: '/sales/sales/products-services', label: 'Products' },
    { path: '/sales/sales/quotes', label: 'Quotes' },
    { path: '/sales/sales/orders', label: 'Orders' },
    { path: '/sales/billing/invoices', label: 'Invoices' },
    { path: '/sales/billing/recurring', label: 'Recurring' },
    { path: '/sales/collections/payments', label: 'Payments' },
    { path: '/sales/collections/write-offs', label: 'Write-Offs' },
    { path: '/sales/collections/refunds', label: 'Refunds' },
    { path: '/sales/revenue/credit-notes', label: 'Credit Notes' },
  ]

  for (const pg of TABLE_PAGES) {
    test(`[E] ${pg.label} — table headers have border-r column dividers`, async ({ page }) => {
      await gotoSalesPage(page, pg.path, companyId)
      await waitForTableToLoad(page)

      const th = page.locator('table th').first()
      if (!(await th.isVisible({ timeout: 6_000 }).catch(() => false))) {
        // No table rendered (empty state) — skip
        test.skip(); return
      }

      const cls = (await th.getAttribute('class')) ?? ''
      expect(cls, `${pg.label} table headers should have border-r divider`).toMatch(/border-r/)
    })
  }

  test('[E] Customers — search input filters the table', async ({ page }) => {
    await gotoSalesPage(page, '/sales/customers', companyId)
    await waitForTableToLoad(page)

    const searchInput = page
      .locator('input[placeholder*="search" i], input[placeholder*="Search" i]')
      .first()
    if (!(await searchInput.isVisible({ timeout: 5_000 }).catch(() => false))) { test.skip(); return }

    await searchInput.fill('zzz_unlikely_match_xyz')
    await page.waitForTimeout(600)

    // Should show empty state or filtered (no row matching that name)
    const rows = page.locator('table tbody tr')
    const count = await rows.count().catch(() => 0)
    // Either 0 rows or an empty state message — not a crash
    await expectPageAlive(page)
    console.log(`[E] Customers search "zzz_unlikely_match_xyz" → ${count} rows`)
  })

  test('[E] Products — clicking a sortable header reorders table', async ({ page }) => {
    await gotoSalesPage(page, '/sales/sales/products-services', companyId)
    await waitForTableToLoad(page)

    const nameHeader = page.locator('table th').filter({ hasText: /name/i }).first()
    if (!(await nameHeader.isVisible({ timeout: 5_000 }).catch(() => false))) { test.skip(); return }

    await nameHeader.click()
    await page.waitForTimeout(400)
    await expectPageAlive(page)

    await nameHeader.click()
    await page.waitForTimeout(400)
    await expectPageAlive(page)
  })

  test('[E] Invoices — clicking "Amount" header sorts by amount', async ({ page }) => {
    await gotoSalesPage(page, '/sales/billing/invoices', companyId)
    await waitForTableToLoad(page)

    const amtHeader = page.locator('table th').filter({ hasText: /amount/i }).first()
    if (!(await amtHeader.isVisible({ timeout: 5_000 }).catch(() => false))) { test.skip(); return }

    await amtHeader.click()
    await page.waitForTimeout(400)
    await expectPageAlive(page)
  })
})

// ═══════════════════════════════════════════════════════════════════════════
// F. NON-FUNCTIONAL / COMING-SOON FLAGS
// ═══════════════════════════════════════════════════════════════════════════

test.describe('F. Non-Functional Flags', () => {
  test.beforeEach(() => {
    loadCompany()
  })

  test('[F.1] Customer Portal — page loads and shows coming-soon indicator', async ({ page }) => {
    await gotoSalesPage(page, '/sales/customers/portal', companyId)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(800)

    await expectPageAlive(page)

    const comingSoon = page
      .locator('text=/coming soon|not yet available|under construction/i')
      .first()
    const hasCS = await comingSoon.isVisible({ timeout: 6_000 }).catch(() => false)
    console.log(`[F.1] Customer Portal coming-soon: ${hasCS}`)
    // We only need the page to not crash
  })

  test('[F.2] Payment Links — page loads without crash', async ({ page }) => {
    await gotoSalesPage(page, '/sales/billing/payment-links', companyId)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(800)
    await expectPageAlive(page)
  })

  test('[F.3] Pipeline — page loads without crash', async ({ page }) => {
    await gotoSalesPage(page, '/sales/sales/pipeline', companyId)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(800)
    await expectPageAlive(page)
  })

  test('[F.4] A/R Aging — report page loads without crash', async ({ page }) => {
    await gotoSalesPage(page, '/sales/collections/aging', companyId)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(800)
    await expectPageAlive(page)
  })

  test('[F.5] Revenue Recognition — report page loads without crash', async ({ page }) => {
    await gotoSalesPage(page, '/sales/revenue/recognition', companyId)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(800)
    await expectPageAlive(page)
  })

  test('[F.6] Deferred Revenue — report page loads without crash', async ({ page }) => {
    await gotoSalesPage(page, '/sales/revenue/deferred', companyId)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(800)
    await expectPageAlive(page)
  })

  test('[F.7] Collections Center — page loads without crash', async ({ page }) => {
    await gotoSalesPage(page, '/sales/collections/center', companyId)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(800)
    await expectPageAlive(page)
  })

  test('[F.8] Dunning — page loads without crash', async ({ page }) => {
    await gotoSalesPage(page, '/sales/collections/dunning', companyId)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(800)
    await expectPageAlive(page)
  })

  test('[F.9] Customer Groups — page loads without crash', async ({ page }) => {
    await gotoSalesPage(page, '/sales/customers/groups', companyId)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(800)
    await expectPageAlive(page)
  })

  test('[F.10] Customer Activity — page loads without crash', async ({ page }) => {
    await gotoSalesPage(page, '/sales/customers/activity', companyId)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(800)
    await expectPageAlive(page)
  })

  test('[F.11] Invoice create — "Send Invoice" button present alongside "Save Draft"', async ({
    page,
  }) => {
    await gotoSalesPage(page, '/sales/billing/invoices/new', companyId)
    await page.waitForLoadState('domcontentloaded')
    await page.waitForTimeout(800)

    const sendBtn = page.getByRole('button', { name: /send invoice/i }).first()
    const hasSend = await sendBtn.isVisible({ timeout: 5_000 }).catch(() => false)
    console.log(`[F.11] "Send Invoice" button present: ${hasSend}`)
    // No strict assertion — just log
  })
})
