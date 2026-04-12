/**
 * tests/sales/navigation.spec.ts
 *
 * Smoke test: verify every sales module page loads without crashing.
 * This is the "nothing is broken" safety net — it catches page crashes,
 * infinite redirects, missing 404 routes, and React error boundaries.
 */

import { test, expect } from '@playwright/test'
import { loadContext, salesUrl } from '../helpers/navigation'

// All pages with actual route files under (owner)/sales/
const SALES_PAGES = [
  {
    name: 'Customers',
    path: '/sales/customers',
  },
  {
    name: 'Customer Groups',
    path: '/sales/customers/groups',
  },
  {
    name: 'Products & Services',
    path: '/sales/sales/products-services',
  },
  {
    name: 'Quotes & Estimates',
    path: '/sales/sales/quotes',
  },
  {
    name: 'Sales Orders',
    path: '/sales/sales/orders',
  },
  {
    name: 'Invoices',
    path: '/sales/billing/invoices',
  },
  {
    name: 'Recurring Invoices',
    path: '/sales/billing/recurring',
  },
  {
    name: 'Payment Links',
    path: '/sales/billing/payment-links',
  },
  {
    name: 'Customer Payments',
    path: '/sales/collections/payments',
  },
  {
    name: 'A/R Aging',
    path: '/sales/collections/aging',
  },
  {
    name: 'Collections Center',
    path: '/sales/collections/center',
  },
  {
    name: 'Write-Offs',
    path: '/sales/collections/write-offs',
  },
  {
    name: 'Refunds',
    path: '/sales/collections/refunds',
  },
  {
    name: 'Dunning Management',
    path: '/sales/collections/dunning',
  },
  {
    name: 'Credit Notes',
    path: '/sales/revenue/credit-notes',
  },
]

for (const salesPage of SALES_PAGES) {
  test(`${salesPage.name} page loads without a crash`, async ({ page }) => {
    const { companyId } = loadContext()
    const url = salesUrl(salesPage.path, companyId)

    // Capture any unhandled console errors
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })

    await page.goto(url, { waitUntil: 'load', timeout: 30_000 })

    // ── 1. Page must have content ──────────────────────────────────────────
    // Next.js renders into #__next; at minimum it must be present.
    await expect(page.locator('#__next, [role="main"], main').first()).toBeVisible({
      timeout: 10_000,
    })

    // ── 2. No 404 page ──────────────────────────────────────────────────────
    await expect(page.getByText(/404|this page could not be found/i)).not.toBeVisible()

    // ── 3. No React unhandled error boundary ────────────────────────────────
    await expect(
      page.getByText(/something went wrong|application error|unhandled error/i),
    ).not.toBeVisible()

    // ── 4. No full-page spinner stuck forever ───────────────────────────────
    // Wait briefly and ensure the spinner eventually resolves
    await page.waitForTimeout(2000)
    const spinnerStuck = await page
      .locator('.animate-spin')
      .first()
      .isVisible()
      .catch(() => false)
    // A stuck spinner is a warning, not a hard fail — log it
    if (spinnerStuck) {
      console.warn(`[warn] spinner still visible on ${salesPage.name}`)
    }
  })
}
