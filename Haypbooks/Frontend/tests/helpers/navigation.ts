/**
 * tests/helpers/navigation.ts
 *
 * Reusable navigation helpers for sales module E2E tests.
 */

import * as fs from 'fs'
import * as path from 'path'
import type { Page } from '@playwright/test'

// ── Shared context ─────────────────────────────────────────────────────────

export interface TestContext {
  companyId: string | null
  email: string
  password: string
}

/**
 * Reads the context saved by auth.setup.ts.
 * Falls back to demo credentials if the file is not yet available.
 */
export function loadContext(): TestContext {
  try {
    const raw = fs.readFileSync(path.join('tests', '.auth', 'context.json'), 'utf-8')
    return JSON.parse(raw) as TestContext
  } catch {
    return {
      companyId: null,
      email: 'demo@haypbooks.test',
      password: 'Dev@Seed#2026!Local',
    }
  }
}

/**
 * Builds the full URL for a sales page, optionally appending the companyId
 * as a query param so useCompanyId resolves it immediately.
 */
export function salesUrl(pagePath: string, companyId?: string | null): string {
  return companyId ? `${pagePath}?company=${companyId}` : pagePath
}

// ── Page helpers ───────────────────────────────────────────────────────────

/**
 * Navigate to a sales page with the auth context's companyId.
 */
export async function gotoSalesPage(
  page: Page,
  pagePath: string,
  companyId?: string | null,
): Promise<void> {
  const url = salesUrl(pagePath, companyId)
  await page.goto(url, { waitUntil: 'load', timeout: 30_000 })
}

/**
 * Waits for the table to finish loading (spinner gone, no busy state).
 * Falls through gracefully if no spinner is present.
 */
export async function waitForTableToLoad(page: Page): Promise<void> {
  // Wait for the main content to settle
  await page.waitForLoadState('domcontentloaded')

  // Wait for any visible spinner / loading indicator to disappear
  await page
    .locator('[aria-busy="true"], [data-loading="true"], .animate-spin')
    .first()
    .waitFor({ state: 'hidden', timeout: 10_000 })
    .catch(() => {
      /* no spinner present — fine */
    })

  // Brief pause for React state updates
  await page.waitForTimeout(300)
}

/**
 * Asserts the page heading matches the expected title (case-insensitive partial match).
 */
export async function expectPageTitle(page: Page, title: string): Promise<void> {
  const heading = page.getByRole('heading', { name: new RegExp(title, 'i') }).first()
  await heading.waitFor({ timeout: 10_000 })
}

/**
 * Attempts to dismiss an open modal by pressing Escape, then clicking a Cancel button.
 */
export async function dismissModal(page: Page): Promise<void> {
  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)

  // If a modal is still visible, try clicking Cancel
  const cancel = page.getByRole('button', { name: /cancel|close/i }).first()
  if (await cancel.isVisible({ timeout: 1000 }).catch(() => false)) {
    await cancel.click()
  }
}
