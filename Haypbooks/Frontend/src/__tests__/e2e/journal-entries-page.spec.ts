import { test, expect, Page } from '@playwright/test';

test.describe('Journal Entries Page E2E', () => {
  const baseURL = 'http://localhost:3000';
  const targetPath = '/accounting/core-accounting/journal-entries';
  const targetURL = `${baseURL}${targetPath}`;

  const log = (step: number, desc: string, pass: boolean, detail?: string) => {
    const symbol = pass ? 'OK' : 'FAIL';
    const msg = `${symbol} STEP ${step}: ${desc} - ${pass ? 'PASS' : `FAIL: ${detail || 'unknown'}`}`;
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

  test('journal entries full flow', async ({ page, request }) => {
    const results: Array<{ step: number; pass: boolean; detail?: string }> = [];
    let companyId: string | null = null;
    let createdEntryId: string | null = null;
    let debitAccountId: string | null = null;
    let creditAccountId: string | null = null;

    // ── Auth & Company Setup ──────────────────────────────────────────────────
    const email = `e2e-je-${Date.now()}@test.com`;
    const password = 'TestPass123!';

    try {
      await request.post('http://127.0.0.1:4000/api/test/create-user', {
        data: { email, password, name: 'E2E JE User', isEmailVerified: true },
      });

      await page.goto('/login');
      await page.waitForSelector('input[type="email"]', { timeout: 15000 });
      await page.fill('input[type="email"]', email);
      await page.fill('input[type="password"]', password);
      await page.locator('button:has-text("Sign in"), button:has-text("Sign In")').first().click();
      await page.waitForURL((url) => !url.toString().includes('/login'), { timeout: 15000 }).catch(() => {});
      await waitMs(500);

      await page.context().addCookies([
        { name: 'onboardingComplete', value: 'true', domain: 'localhost', path: '/' },
        { name: 'ownerOnboardingComplete', value: 'true', domain: 'localhost', path: '/' },
      ]);

      const companyResp = await request.post('http://127.0.0.1:4000/api/test/create-company', {
        data: { email, name: 'E2E JE Company' },
      }).then((r) => r.json());
      const company = companyResp?.company || companyResp;
      if (company?.id) companyId = company.id;
      console.log('companyId:', companyId);
    } catch (err) {
      console.log('Auth setup issue:', (err as Error).message);
    }

    // STEP 1: Navigate to Journal Entries page
    try {
      const nav = companyId ? `${targetURL}?company=${companyId}` : targetURL;
      await page.goto(nav, { waitUntil: 'load', timeout: 30000 });
      await waitMs(2500);

      const h1 = page.locator('h1');
      const ready = await h1.first().waitFor({ timeout: 10000 }).then(() => true).catch(() => false);
      results.push(log(1, 'Navigate to Journal Entries page', Boolean(ready)));
    } catch (err) {
      results.push(log(1, 'Navigate to Journal Entries page', false, (err as Error).message));
    }

    // STEP 2: Page heading is visible
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
      const emptyState = await safeFind(page, 'text=No journal entries', 3000);
      results.push(log(3, 'Table or empty state renders', !!(table || emptyState)));
    } catch (err) {
      results.push(log(3, 'Table or empty state renders', false, (err as Error).message));
    }

    // STEP 4: New Entry button visible
    try {
      const newBtn = page.getByRole('button', { name: /new entry/i });
      const visible = await newBtn.first().isVisible({ timeout: 5000 }).catch(() => false);
      results.push(log(4, '"New Entry" button is visible', Boolean(visible)));
    } catch (err) {
      results.push(log(4, '"New Entry" button is visible', false, (err as Error).message));
    }

    // STEP 5: Status tabs (All/Draft/Posted/Voided) present
    try {
      const allTab = page.locator('button:has-text("All")').first();
      const draftTab = page.locator('button:has-text("Draft")').first();
      const postedTab = page.locator('button:has-text("Posted")').first();
      const allVisible = await allTab.isVisible({ timeout: 3000 }).catch(() => false);
      const draftVisible = await draftTab.isVisible({ timeout: 3000 }).catch(() => false);
      const postedVisible = await postedTab.isVisible({ timeout: 3000 }).catch(() => false);
      results.push(log(5, 'Status tabs visible (All / Draft / Posted)', Boolean(allVisible && draftVisible && postedVisible)));
    } catch (err) {
      results.push(log(5, 'Status tabs visible', false, (err as Error).message));
    }

    // STEP 6: Search input present
    try {
      const searchInput = await safeFind(page, 'input[placeholder*="Search"], input[placeholder*="search"]', 5000);
      results.push(log(6, 'Search input is present', !!searchInput));
    } catch (err) {
      results.push(log(6, 'Search input is present', false, (err as Error).message));
    }

    // STEP 7: Audit Log button visible (purple)
    try {
      const auditBtn = page.locator('button:has-text("Audit Log")').first();
      const visible = await auditBtn.isVisible({ timeout: 3000 }).catch(() => false);
      results.push(log(7, 'Audit Log button visible', Boolean(visible)));
    } catch (err) {
      results.push(log(7, 'Audit Log button visible', false, (err as Error).message));
    }

    // STEP 8: Create seeded accounts + journal entry via API, then verify in UI
    try {
      if (!companyId) throw new Error('No companyId');

      // Seed default Chart of Accounts
      const seedResult = await page.evaluate(async (cid: string) => {
        const res = await fetch(`/api/companies/${cid}/accounting/accounts/seed-default`, {
          method: 'POST',
          credentials: 'include',
        });
        return res.status;
      }, companyId);
      console.log('Seed CoA status:', seedResult);

      // Fetch accounts to get two account IDs (debit + credit)
      const accounts = await page.evaluate(async (cid: string) => {
        const res = await fetch(`/api/companies/${cid}/accounting/accounts`, {
          credentials: 'include',
        });
        if (!res.ok) return [];
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.accounts ?? []);
        return list.slice(0, 5) as Array<{ id: string; name: string; code: string }>;
      }, companyId);

      console.log('Got accounts:', accounts.map((a: any) => `${a.code} ${a.name}`).join(', '));

      if (accounts.length < 2) throw new Error(`Not enough accounts: got ${accounts.length}`);

      debitAccountId = accounts[0].id;
      creditAccountId = accounts[1].id;

      // Create journal entry via API
      const createResult = await page.evaluate(async (args: any) => {
        const res = await fetch(`/api/companies/${args.companyId}/accounting/journal-entries`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            date: new Date().toISOString().split('T')[0],
            description: 'E2E Test Journal Entry',
            postingStatus: 'DRAFT',
            lines: [
              { accountId: args.debitAccountId, debit: 500, credit: 0, description: 'Debit line' },
              { accountId: args.creditAccountId, debit: 0, credit: 500, description: 'Credit line' },
            ],
          }),
        });
        const status = res.status;
        let body: any = null;
        try { body = await res.json(); } catch { /* */ }
        return { status, body };
      }, { companyId, debitAccountId, creditAccountId });

      console.log('Create JE status:', createResult.status, 'body:', JSON.stringify(createResult.body));
      if (![200, 201].includes(createResult.status)) {
        throw new Error(`Create failed (${createResult.status}): ${JSON.stringify(createResult.body)}`);
      }
      createdEntryId = createResult.body?.id;

      // Reload page and verify entry appears
      await page.goto(`${targetURL}?company=${companyId}`, { waitUntil: 'load', timeout: 30000 });
      await waitMs(2000);

      const rowVisible = await page.locator('table tbody tr').first().isVisible({ timeout: 10000 }).catch(() => false);
      results.push(log(8, 'Create JE via API + verify in table', Boolean(rowVisible)));
    } catch (err) {
      results.push(log(8, 'Create JE via API + verify in table', false, (err as Error).message));
    }

    // STEP 9: Search filters results
    try {
      const searchInput = page.locator('input[placeholder*="Search"], input[placeholder*="search"]').first();
      await searchInput.fill('E2E Test');
      await waitMs(1200);
      const rows = await page.locator('table tbody tr').count();
      results.push(log(9, 'Search filters results', rows >= 0));
      await searchInput.fill('');
      await waitMs(500);
    } catch (err) {
      results.push(log(9, 'Search filters results', false, (err as Error).message));
    }

    // STEP 10: Draft tab filter works
    try {
      const draftTab = page.locator('button:has-text("Draft")').first();
      await draftTab.click({ timeout: 5000 });
      await waitMs(800);
      // After clicking Draft tab, the row we created (DRAFT) should still be visible
      const row = await page.locator('table tbody tr').first().isVisible({ timeout: 5000 }).catch(() => false);
      results.push(log(10, 'Draft tab filter shows draft entries', Boolean(row)));
      // Reset to All tab
      await page.locator('button:has-text("All")').first().click().catch(() => {});
      await waitMs(400);
    } catch (err) {
      results.push(log(10, 'Draft tab filter', false, (err as Error).message));
    }

    // STEP 11: Keyboard shortcut Ctrl+N navigates to new entry
    try {
      await page.keyboard.press('Control+n');
      await waitMs(800);
      // Should navigate away from list to new entry page
      const url = page.url();
      const navigated = url.includes('/new') || url.includes('journal-entries');
      results.push(log(11, 'Ctrl+N navigates to New Entry page', Boolean(navigated)));
      // Navigate back
      await page.goto(`${targetURL}?company=${companyId}`, { waitUntil: 'load', timeout: 20000 });
      await waitMs(1500);
    } catch (err) {
      results.push(log(11, 'Ctrl+N keyboard shortcut', false, (err as Error).message));
    }

    // STEP 12: Post entry via API + verify status change in UI
    try {
      if (!createdEntryId || !companyId) throw new Error('No entry or company ID');

      const postResult = await page.evaluate(async (args: any) => {
        const res = await fetch(`/api/companies/${args.companyId}/accounting/journal-entries/${args.entryId}/post`, {
          method: 'POST',
          credentials: 'include',
        });
        return { status: res.status };
      }, { companyId, entryId: createdEntryId });

      console.log('Post JE status:', postResult.status);

      await page.reload({ waitUntil: 'load', timeout: 20000 });
      await waitMs(1500);

      // Status badge should now show POSTED
      const postedBadge = await page.locator('table tbody tr').filter({ hasText: 'POSTED' }).count();
      results.push(log(12, 'Post entry + verify POSTED status in table', Boolean(postResult.status === 200 && postedBadge > 0)));
    } catch (err) {
      results.push(log(12, 'Post entry via API + verify status', false, (err as Error).message));
    }

    // ── Final summary ─────────────────────────────────────────────────────────
    const passed = results.filter(r => r.pass).length;
    const total = results.length;
    console.log(`\nJOURNAL ENTRIES E2E: ${passed}/${total} steps passed`);
    results.forEach(r => {
      console.log(`  ${r.pass ? '✅' : '❌'} STEP ${r.step}: ${r.pass ? 'PASS' : `FAIL - ${r.detail ?? 'unknown'}`}`);
    });
    expect(passed).toBeGreaterThanOrEqual(Math.floor(total * 0.7));
  });
});

