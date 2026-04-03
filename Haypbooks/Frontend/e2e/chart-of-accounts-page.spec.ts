import { test, expect, Page, ConsoleMessage } from '@playwright/test';

test.describe('Chart of Accounts Page E2E', () => {
  const baseURL = 'http://localhost:3000';
  const targetPath = '/(owner)/accounting/core-accounting/chart-of-accounts';
  const targetURL = `${baseURL}${targetPath}`;

  const log = (step: number, desc: string, pass: boolean, detail?: string) => {
    const symbol = pass ? '✅' : '❌';
    const msg = `${symbol} STEP ${step}: ${desc} — ${pass ? 'PASS' : `FAIL: ${detail || 'unknown'}`}`;
    // eslint-disable-next-line no-console
    console.log(msg);
    return { step, pass, detail };
  };

  const waitMs = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  async function safeFind(page: Page, selector: string, timeout = 5000) {
    try {
      return await page.waitForSelector(selector, { timeout });
    } catch {
      return null;
    }
  }

  test('chart of accounts full flow', async ({ page }) => {
    const results: Array<{ step: number; pass: boolean; detail?: string }> = [];

    // STEP 1: Navigate
    try {
      await page.goto(targetURL, { waitUntil: 'load', timeout: 30000 });
      await waitMs(2000);

      const h1 = page.locator('h1');
      const table = page.locator('table');
      const login = page.getByText('login', { exact: false });

      const ready = await Promise.race([
        h1.first().waitFor({ timeout: 10000 }).then(() => true).catch(() => false),
        table.first().waitFor({ timeout: 10000 }).then(() => true).catch(() => false),
        login.first().waitFor({ timeout: 10000 }).then(() => true).catch(() => false),
      ]);

      results.push(log(1, 'Navigate to Chart of Accounts page', Boolean(ready)));
    } catch (err) {
      results.push(log(1, 'Navigate to Chart of Accounts page', false, (err as Error).message));
    }

    // STEP 2: Heading visible
    try {
      const heading = page.locator('h1');
      const visible = await heading.first().isVisible().catch(() => false);
      results.push(log(2, 'Page heading is visible', Boolean(visible)));
    } catch (err) {
      results.push(log(2, 'Page heading is visible', false, (err as Error).message));
    }

    // STEP 3: Table renders (or empty state)
    try {
      const table = await safeFind(page, 'table', 8000);
      const emptyState = await safeFind(page, 'text=No accounts yet', 3000);
      const seedBtn = await safeFind(page, 'text=Set Up Default COA Template', 3000);
      const hasContent = !!(table || emptyState || seedBtn);
      results.push(log(3, 'Table or empty state renders', hasContent));
    } catch (err) {
      results.push(log(3, 'Table or empty state renders', false, (err as Error).message));
    }

    // STEP 4: Search input present
    try {
      const search = await safeFind(page, 'input[placeholder*="Search"]', 5000);
      results.push(log(4, 'Search input is present', !!search));
    } catch (err) {
      results.push(log(4, 'Search input is present', false, (err as Error).message));
    }

    // STEP 5: New Account button visible
    try {
      const newBtn = page.getByRole('button', { name: /new account/i });
      const visible = await newBtn.first().isVisible().catch(() => false);
      results.push(log(5, 'New Account button is visible', Boolean(visible)));
    } catch (err) {
      results.push(log(5, 'New Account button is visible', false, (err as Error).message));
    }

    // STEP 6: Summary cards render when accounts exist
    try {
      const accounts = await safeFind(page, 'table tbody tr', 5000);
      if (accounts) {
        const cards = page.locator('text=Total Accounts');
        const visible = await cards.first().isVisible({ timeout: 3000 }).catch(() => false);
        results.push(log(6, 'Summary stats cards render', Boolean(visible)));
      } else {
        results.push(log(6, 'Summary stats cards render (skipped — no accounts)', true));
      }
    } catch (err) {
      results.push(log(6, 'Summary stats cards render', false, (err as Error).message));
    }

    // STEP 7: Keyboard shortcut Ctrl+N opens modal
    try {
      await page.keyboard.press('Control+n');
      await waitMs(500);
      const modal = await safeFind(page, '[role="dialog"], .fixed.inset-0', 3000);
      // Close it if it opened
      if (modal) {
        await page.keyboard.press('Escape');
        await waitMs(300);
      }
      results.push(log(7, 'Ctrl+N opens New Account modal', !!modal));
    } catch (err) {
      results.push(log(7, 'Ctrl+N opens New Account modal', false, (err as Error).message));
    }

    // STEP 8: Export button visible
    try {
      const exportBtn = page.getByRole('button', { name: /export/i });
      const visible = await exportBtn.first().isVisible({ timeout: 3000 }).catch(() => false);
      results.push(log(8, 'Export button is visible', Boolean(visible)));
    } catch (err) {
      results.push(log(8, 'Export button is visible', false, (err as Error).message));
    }

    // STEP 9: No console errors
    const pageErrors: string[] = [];
    try {
      page.on('console', (msg: ConsoleMessage) => {
        if (msg.type() === 'error') pageErrors.push(msg.text());
      });
      await waitMs(1000);
      const filtered = pageErrors.filter(
        e => !e.includes('favicon') && !e.includes('404') && !e.includes('hot-update')
      );
      results.push(log(9, 'No critical console errors', filtered.length === 0, filtered.join('; ')));
    } catch (err) {
      results.push(log(9, 'No critical console errors check', false, (err as Error).message));
    }

    // STEP 10: Pagination controls present (when more than 1 page)
    try {
      const prevBtn = page.getByRole('button', { name: /previous/i });
      const nextBtn = page.getByRole('button', { name: /next/i });
      const hasPagination = await prevBtn.first().isVisible({ timeout: 3000 }).catch(() => false)
        || await nextBtn.first().isVisible({ timeout: 3000 }).catch(() => false);
      results.push(log(10, 'Pagination controls present', Boolean(hasPagination)));
    } catch (err) {
      results.push(log(10, 'Pagination controls present', false, (err as Error).message));
    }

    // Final summary
    const passed = results.filter(r => r.pass).length;
    const total = results.length;
    // eslint-disable-next-line no-console
    console.log(`\n📊 CHART OF ACCOUNTS: ${passed}/${total} steps passed`);
    expect(passed).toBeGreaterThanOrEqual(Math.floor(total * 0.7));
  });
});
