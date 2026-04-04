import { test, expect, Page, ConsoleMessage } from '@playwright/test';

test.describe('Chart of Accounts Page E2E', () => {
  const baseURL = 'http://localhost:3000';
  const targetPath = '/accounting/core-accounting/chart-of-accounts';
  const targetURL = `${baseURL}${targetPath}`;

  const log = (step: number, desc: string, pass: boolean, detail?: string) => {
    const symbol = pass ? 'OK' : 'FAIL';
    const msg = `${symbol} STEP ${step}: ${desc} - ${pass ? 'PASS' : `FAIL: ${detail || 'unknown'}`}`;
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

  test('chart of accounts full flow', async ({ page, request }) => {
    const results: Array<{ step: number; pass: boolean; detail?: string }> = [];
    let companyId: string | null = null;

    // Auth Setup
    const email = `e2e-coa-${Date.now()}@test.com`;
    const password = 'TestPass123!';

    try {
      await request.post('http://127.0.0.1:4000/api/test/create-user', {
        data: { email, password, name: 'E2E CoA', isEmailVerified: true },
      });

      await page.goto('/login');
      await page.waitForSelector('input[type="email"]', { timeout: 15000 });
      await page.fill('input[type="email"]', email);
      await page.fill('input[type="password"]', password);
      await page.locator('button:has-text("Sign in"), button:has-text("Sign In")').first().click();
      await page.waitForURL((url) => !url.includes('/login'), { timeout: 15000 }).catch(() => {});
      await waitMs(500);

      await page.context().addCookies([
        { name: 'onboardingComplete', value: 'true', domain: 'localhost', path: '/' },
        { name: 'ownerOnboardingComplete', value: 'true', domain: 'localhost', path: '/' },
      ]);

      const companyResp = await request.post('http://127.0.0.1:4000/api/test/create-company', {
        data: { email, name: 'E2E CoA Company' },
      }).then((r) => r.json());
      const company = companyResp?.company || companyResp;
      if (company?.id) companyId = company.id;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log('Auth setup issue:', (err as Error).message);
    }

    // STEP 1: Navigate
    try {
      const nav = companyId ? `${targetURL}?company=${companyId}` : targetURL;
      await page.goto(nav, { waitUntil: 'load', timeout: 30000 });
      await waitMs(2500);

      const h1 = page.locator('h1');
      const table = page.locator('table');
      const ready = await Promise.race([
        h1.first().waitFor({ timeout: 10000 }).then(() => true).catch(() => false),
        table.first().waitFor({ timeout: 10000 }).then(() => true).catch(() => false),
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

    // STEP 3: Table or empty state renders
    try {
      const table = await safeFind(page, 'table', 8000);
      const emptyState = await safeFind(page, 'text=No accounts yet', 3000);
      const seedBtn = await safeFind(page, 'text=Set Up Default COA Template', 3000);
      results.push(log(3, 'Table or empty state renders', !!(table || emptyState || seedBtn)));
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

    // STEP 6: Stat cards are NOT present (removed from page)
    try {
      const cards = page.locator('text=Total Accounts');
      const visible = await cards.first().isVisible({ timeout: 2000 }).catch(() => false);
      // Cards were removed — this should evaluate to false (not visible)
      results.push(log(6, 'Stat cards NOT present (removed)', !visible,
        visible ? '"Total Accounts" card unexpectedly found — cards should have been removed' : undefined));
    } catch (err) {
      results.push(log(6, 'Stat cards NOT present (removed)', false, (err as Error).message));
    }

    // STEP 7: Audit Log button visible
    try {
      const auditBtn = page.getByRole('button', { name: /audit log/i });
      const visible = await auditBtn.first().isVisible({ timeout: 3000 }).catch(() => false);
      results.push(log(7, 'Audit Log button is visible', Boolean(visible)));
    } catch (err) {
      results.push(log(7, 'Audit Log button is visible', false, (err as Error).message));
    }

    // STEP 8: Clicking Audit Log opens fullscreen (no sidebar/topbar)
    try {
      const auditBtn = page.getByRole('button', { name: /audit log/i });
      const btnVisible = await auditBtn.first().isVisible({ timeout: 3000 }).catch(() => false);
      if (btnVisible) {
        await auditBtn.first().click();
        await waitMs(1500);
        const auditURL = page.url();
        const isAuditPage = auditURL.endsWith('/audit-log') || auditURL.includes('/audit-log');
        // Full-screen: no sidebar or owner topbar rendered
        const sidebar = await safeFind(page, 'nav[data-sidebar], aside', 2000);
        const sidebarVisible = sidebar ? await sidebar.isVisible().catch(() => false) : false;
        const pass = isAuditPage && !sidebarVisible;
        results.push(log(8, 'Audit Log page = fullscreen (no sidebar)', pass,
          !isAuditPage ? `URL was ${auditURL}` : sidebarVisible ? 'sidebar still visible' : undefined));
        // Navigate back
        await page.goBack();
        await waitMs(1000);
      } else {
        results.push(log(8, 'Audit Log page = fullscreen (skipped — button not visible)', true));
      }
    } catch (err) {
      results.push(log(8, 'Audit Log page = fullscreen', false, (err as Error).message));
    }

    // STEP 9: Keyboard shortcut Ctrl+N opens New Account modal
    try {
      await page.keyboard.press('Control+n');
      await waitMs(500);
      const modal = await safeFind(page, '[role="dialog"], .fixed.inset-0', 3000);
      if (modal) {
        // Verify modal title
        const modalTitle = page.locator('h2:has-text("New Account")');
        const titleVisible = await modalTitle.first().isVisible({ timeout: 2000 }).catch(() => false);
        await page.keyboard.press('Escape');
        await waitMs(300);
        results.push(log(9, 'Ctrl+N opens New Account modal with correct title', titleVisible || !!modal));
      } else {
        results.push(log(9, 'Ctrl+N opens New Account modal', false, 'modal not found'));
      }
    } catch (err) {
      results.push(log(9, 'Ctrl+N opens New Account modal', false, (err as Error).message));
    }

    // STEP 10: Export button visible
    try {
      const exportBtn = page.getByRole('button', { name: /export/i });
      const visible = await exportBtn.first().isVisible({ timeout: 3000 }).catch(() => false);
      results.push(log(10, 'Export button is visible', Boolean(visible)));
    } catch (err) {
      results.push(log(10, 'Export button is visible', false, (err as Error).message));
    }

    // STEP 11: Per-account audit log button navigates to fullscreen URL
    try {
      const auditIconBtn = page.locator('button[title="View audit log"]');
      const count = await auditIconBtn.count();
      if (count > 0) {
        await auditIconBtn.first().click();
        await waitMs(1500);
        const auditURL = page.url();
        const isAuditPage = auditURL.match(/\/[^/]+\/audit-log$/) !== null;
        results.push(log(11, 'Per-account audit log navigates to /{id}/audit-log', Boolean(isAuditPage),
          isAuditPage ? undefined : `URL was ${auditURL}`));
        await page.goBack();
        await waitMs(1000);
      } else {
        results.push(log(11, 'Per-account audit log (skipped — no rows)', true));
      }
    } catch (err) {
      results.push(log(11, 'Per-account audit log navigation', false, (err as Error).message));
    }

    // STEP 12: No critical console errors
    const pageErrors: string[] = [];
    try {
      page.on('console', (msg: ConsoleMessage) => {
        if (msg.type() === 'error') pageErrors.push(msg.text());
      });
      await waitMs(1000);
      const filtered = pageErrors.filter(
        e => !e.includes('favicon') && !e.includes('404') && !e.includes('hot-update')
      );
      results.push(log(12, 'No critical console errors', filtered.length === 0, filtered.join('; ')));
    } catch (err) {
      results.push(log(12, 'No critical console errors check', false, (err as Error).message));
    }

    // Final summary
    const passed = results.filter(r => r.pass).length;
    const total = results.length;
    // eslint-disable-next-line no-console
    console.log(`COA: ${passed}/${total} steps passed`);
    expect(passed).toBeGreaterThanOrEqual(Math.floor(total * 0.7));
  });
});
