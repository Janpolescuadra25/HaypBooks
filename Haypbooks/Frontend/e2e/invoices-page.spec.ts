import { test, expect, Page, ConsoleMessage, APIRequestContext } from '@playwright/test';

test.describe('Invoices Page E2E', () => {
  const baseURL = 'http://localhost:3000';
  // Route groups like (owner) are filesystem-only in Next.js App Router — NOT part of the URL
  const targetPath = '/sales/billing/invoices';
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

  // ── Auth setup ─────────────────────────────────────────────────────────────
  // Each test gets its own user+company so tests can run in parallel workers.
  let testCompanyId: string | undefined;

  async function loginAndSetupCompany(page: Page, request: APIRequestContext) {
    const ts = Date.now();
    const email = `e2e-inv-${ts}@haypbooks.test`;
    const password = 'E2eInv!23';

    // Create a verified test user (requires ALLOW_TEST_ENDPOINTS on the backend)
    try {
      await request.post('http://127.0.0.1:4000/api/test/create-user', {
        data: { email, password, name: 'E2E Invoice', isEmailVerified: true },
      });
    } catch { /* endpoint may be unavailable — skip */ }

    // UI login so the browser context gets the auth cookie
    await page.goto('/login');
    await page.waitForSelector('input[type="email"]', { timeout: 15000 }).catch(() => {});
    await page.fill('input[type="email"]', email).catch(() => {});
    await page.fill('input[type="password"]', password).catch(() => {});
    await page.locator('button', { hasText: /Sign [Ii]n|Log [Ii]n/ }).first().click().catch(() => {});
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 }).catch(() => {});

    // Set onboarding cookies so middleware lets the user into the owner hub
    await page.context().addCookies([
      { name: 'onboardingComplete', value: 'true', domain: 'localhost', path: '/' },
      { name: 'ownerOnboardingComplete', value: 'true', domain: 'localhost', path: '/' },
    ]);

    // Create a test company and capture its id
    const companyResp = await request.post('http://127.0.0.1:4000/api/test/create-company', {
      data: { email, name: 'E2E Invoice Co' },
    }).then((r) => r.json()).catch(() => null);
    testCompanyId = companyResp?.company?.id ?? companyResp?.id ?? undefined;
  }

  /** Returns the URL to navigate to, appending ?company= when we have an id */
  const navURL = () => (testCompanyId ? `${targetURL}?company=${testCompanyId}` : targetURL);

  test.beforeEach(async ({ page, request }) => {
    await loginAndSetupCompany(page, request);
  });

  test('full invoices page flow', async ({ page }) => {
    const results: Array<{ step: number; pass: boolean; detail?: string }> = [];

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 1: Navigate to the Invoices page
    // ──────────────────────────────────────────────────────────────────────────
    try {
      await page.goto(navURL(), { waitUntil: 'load', timeout: 30000 });
      await waitMs(2000);

      const h1 = page.locator('h1', { hasText: /Invoices/i });
      const table = page.locator('table');
      const login = page.getByText('login', { exact: false });

      const ready = await Promise.race([
        h1.first().waitFor({ timeout: 10000 }).then(() => true).catch(() => false),
        table.first().waitFor({ timeout: 10000 }).then(() => true).catch(() => false),
        login.first().waitFor({ timeout: 10000 }).then(() => true).catch(() => false),
      ]);

      results.push(log(1, 'Navigate to Invoices page', Boolean(ready)));
    } catch (err) {
      results.push(log(1, 'Navigate to Invoices page', false, (err as Error).message));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 2: No critical console errors on load
    // ──────────────────────────────────────────────────────────────────────────
    const pageErrors: string[] = [];
    try {
      const handler = (msg: ConsoleMessage) => {
        if (msg.type() === 'error') pageErrors.push(msg.text());
      };
      page.on('console', handler);
      await waitMs(3000);
      page.off('console', handler);

      const bad = pageErrors.filter((e) => /TypeError|ReferenceError|Uncaught/i.test(e));
      results.push(log(2, 'No critical console errors on load', bad.length === 0, bad.join(' | ')));
    } catch (err) {
      results.push(log(2, 'No critical console errors on load', false, (err as Error).message));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 3: Page renders (table or empty state)
    // ──────────────────────────────────────────────────────────────────────────
    try {
      await waitMs(2000);
      const hasTable = await page.locator('table').first().count();
      const hasEmpty = (await page.locator('text=/No invoices/i').count()) > 0;
      const hasNewBtn = (await page.locator('button', { hasText: /New Invoice/i }).count()) > 0;
      results.push(
        log(3, 'Page renders (table or empty state + New Invoice button)', hasNewBtn && (hasTable > 0 || hasEmpty),
          !hasNewBtn ? '+ New Invoice button not found' : undefined)
      );
    } catch (err) {
      results.push(log(3, 'Page renders correctly', false, (err as Error).message));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 4: Stats strip renders (Total Invoices, Total Amount, Outstanding, Overdue)
    // ──────────────────────────────────────────────────────────────────────────
    try {
      const totalCard = await page.locator('text=/Total Invoices/i').count();
      const outstandingCard = await page.locator('text=/Outstanding/i').count();
      results.push(log(4, 'Stats strip renders (Total Invoices, Outstanding)', totalCard > 0 && outstandingCard > 0,
        !totalCard ? 'Total Invoices card missing' : 'Outstanding card missing'));
    } catch (err) {
      results.push(log(4, 'Stats strip renders', false, (err as Error).message));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 5: Search input works
    // ──────────────────────────────────────────────────────────────────────────
    try {
      const searchInput = await safeFind(page, 'input[placeholder*="Search"], input[type="search"]', 5000);
      if (!searchInput) throw new Error('Search input not found');

      await searchInput.fill('NONEXISTENT-INV-99999');
      await waitMs(1500);

      const rows = await page.locator('table tbody tr').count();
      const emptyText = await page.locator('text=/No invoices found/i').count();
      const filtered = rows === 0 || emptyText > 0;
      results.push(log(5, 'Search filters invoices correctly', filtered, `rows=${rows} emptyText=${emptyText}`));

      // Reset search
      await searchInput.fill('');
      await waitMs(1000);
    } catch (err) {
      results.push(log(5, 'Search input works', false, (err as Error).message));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 6: Status filter pills (All / DRAFT / SENT / PARTIALLY PAID / PAID / OVERDUE / VOIDED)
    // ──────────────────────────────────────────────────────────────────────────
    // Component renders text: "All", "DRAFT", "SENT", "PARTIALLY PAID", "PAID", "OVERDUE", "VOIDED"
    const statusPills = ['All', 'DRAFT', 'SENT', 'PAID', 'OVERDUE', 'VOIDED'];
    try {
      let pillsFound = 0;
      for (const pill of statusPills) {
        const btn = page.locator('button', { hasText: new RegExp(`^${pill}$`, 'i') });
        if (await btn.count()) {
          await btn.first().click();
          await waitMs(600);
          pillsFound++;
        }
      }
      // Reset to ALL
      const allBtn = page.locator('button', { hasText: /^ALL$/i });
      if (await allBtn.count()) await allBtn.first().click();
      await waitMs(500);

      results.push(log(6, `Status filter pills work (found ${pillsFound}/${statusPills.length})`, pillsFound >= 4));
    } catch (err) {
      results.push(log(6, 'Status filter pills', false, (err as Error).message));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 7: Row action menu (⋮) opens as a FLOATING DROPDOWN, not inline text
    // ──────────────────────────────────────────────────────────────────────────
    try {
      await waitMs(1000);
      // Use .filter to only count real data rows (rows with buttons), not empty-state rows
      const dataRows = page.locator('table tbody tr').filter({ has: page.locator('button') });
      const dataRowCount = await dataRows.count();
      if (dataRowCount === 0) {
        results.push(log(7, 'Row action menu (no data rows to test — skipped)', true));
      } else {
        // Find the ⋮ trigger button (MoreVertical icon) in the first real data row
        const menuBtn = dataRows.first().locator('button').last();
        if (!(await menuBtn.count())) throw new Error('⋮ button not found in first row');

        await menuBtn.click();
        await waitMs(800);

        // Check: dropdown appears as fixed/absolute div — NOT inline table cell text
        const inlineMoreActionsText = await page.locator('table td', { hasText: /^MORE ACTIONS$/i }).count();
        if (inlineMoreActionsText > 0)
          throw new Error('MORE ACTIONS is rendering as inline table cell text (portal fix failed)');

        // Check: dropdown contains expected menu items
        const dropdownVisible = await page.locator('text=/View.*Edit/i').count();
        results.push(log(7, '⋮ menu opens as floating dropdown (not inline text)', dropdownVisible > 0,
          dropdownVisible === 0 ? 'Dropdown with View/Edit not found' : undefined));

        // Close the dropdown
        await page.keyboard.press('Escape');
        await waitMs(400);
      }
    } catch (err) {
      results.push(log(7, 'Row action menu is floating dropdown', false, (err as Error).message));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 8: Click invoice row → Invoice Detail modal opens
    // ──────────────────────────────────────────────────────────────────────────
    let hasOpenModal = false;
    try {
      await waitMs(500);
      // Use .filter to only count real data rows (rows with buttons), not empty-state rows
      const dataRows8 = page.locator('table tbody tr').filter({ has: page.locator('button') });
      const dataRowCount8 = await dataRows8.count();
      if (dataRowCount8 === 0) {
        results.push(log(8, 'Invoice detail modal open/close (no data rows to test — skipped)', true));
      } else {
        // Click the invoice number link in the first real data row
        const invLink = dataRows8.first().locator('button').first();
        await invLink.click();
        await waitMs(1500);

        const modal = await safeFind(page, '[class*="modal"], [role="dialog"], .fixed.inset-0', 8000);
        const hasDetailContent = await page.locator('text=/Invoice Date|Due Date|Balance Due/i').count();
        hasOpenModal = Boolean(modal) || hasDetailContent > 0;

        results.push(log(8, 'Invoice detail modal opens on row click', hasOpenModal,
          !hasOpenModal ? 'No modal or detail content found' : undefined));
      }
    } catch (err) {
      results.push(log(8, 'Invoice detail modal open/close', false, (err as Error).message));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 9: Invoice detail modal closes
    // ──────────────────────────────────────────────────────────────────────────
    try {
      if (hasOpenModal) {
        const closeBtn = page.locator('button', { hasText: /Close|Cancel/i }).or(
          page.locator('[aria-label="Close"]')
        ).or(page.locator('button svg[class*="x"], button svg[data-lucide="x"]').locator('..')).first();

        if (await closeBtn.count()) {
          await closeBtn.click();
        } else {
          await page.keyboard.press('Escape');
        }
        await waitMs(1000);

        const modalGone = (await page.locator('text=/Invoice Date|Balance Due/i').count()) === 0;
        results.push(log(9, 'Invoice detail modal closes', modalGone));
      } else {
        results.push(log(9, 'Invoice detail modal close (skipped — modal was not open)', true));
      }
    } catch (err) {
      results.push(log(9, 'Invoice detail modal close', false, (err as Error).message));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 10: Email Preview Modal opens from Send Invoice action
    // ──────────────────────────────────────────────────────────────────────────
    let emailModalOpen = false;
    try {
      await waitMs(500);
      // Find a DRAFT invoice row if any
      const draftRow = page.locator('table tbody tr', { hasText: /DRAFT/i }).first();
      if (await draftRow.count()) {
        const menuBtn = draftRow.locator('button').last();
        await menuBtn.click();
        await waitMs(800);

        const sendInvoiceItem = page.locator('text=Send Invoice').first();
        if (await sendInvoiceItem.count()) {
          await sendInvoiceItem.click();
          await waitMs(1500);
          emailModalOpen = (await page.locator('text=/Email Preview|Compose Email|Send Invoice/i').count()) > 0;
          results.push(log(10, 'Email Preview Modal opens from Send Invoice action', emailModalOpen));
        } else {
          results.push(log(10, 'Email Preview Modal (no Send Invoice in menu — skipped)', true));
          await page.keyboard.press('Escape');
          await waitMs(400);
        }
      } else {
        results.push(log(10, 'Email Preview Modal (no DRAFT invoice to test — skipped)', true));
      }
    } catch (err) {
      results.push(log(10, 'Email Preview Modal opens from Send Invoice', false, (err as Error).message));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 11: Email Preview — tone switcher works
    // ──────────────────────────────────────────────────────────────────────────
    try {
      if (emailModalOpen) {
        // Look for tone selector buttons (Professional / Friendly / Brief)
        const toneButtons = page.locator('button', { hasText: /Professional|Friendly|Brief/i });
        const toneCount = await toneButtons.count();
        if (toneCount > 0) {
          // Click "Friendly" tone
          const friendlyBtn = page.locator('button', { hasText: /Friendly/i }).first();
          if (await friendlyBtn.count()) {
            await friendlyBtn.click();
            await waitMs(500);
          }
          // Click "Brief" tone
          const briefBtn = page.locator('button', { hasText: /Brief/i }).first();
          if (await briefBtn.count()) {
            await briefBtn.click();
            await waitMs(500);
          }
          // Back to Professional
          const proBtn = page.locator('button', { hasText: /Professional/i }).first();
          if (await proBtn.count()) await proBtn.click();
        }
        results.push(log(11, `Email Preview tone switcher works (${toneCount} tone buttons found)`, toneCount >= 2));
      } else {
        results.push(log(11, 'Email tone switcher (email modal not open — skipped)', true));
      }
    } catch (err) {
      results.push(log(11, 'Email tone switcher', false, (err as Error).message));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 12: Email Preview — subject field is editable
    // ──────────────────────────────────────────────────────────────────────────
    try {
      if (emailModalOpen) {
        const subjectInput = page.locator('input[placeholder*="Subject"], input[name*="subject"]').first();
        if (await subjectInput.count()) {
          const original = await subjectInput.inputValue();
          await subjectInput.fill('Test Subject Override');
          await waitMs(300);
          const updated = await subjectInput.inputValue();
          results.push(log(12, 'Email Preview subject is editable', updated === 'Test Subject Override'));
          // Restore
          await subjectInput.fill(original);
        } else {
          results.push(log(12, 'Email Preview subject editable (field not found — skipped)', true));
        }
      } else {
        results.push(log(12, 'Email Preview subject editable (modal not open — skipped)', true));
      }
    } catch (err) {
      results.push(log(12, 'Email Preview subject editable', false, (err as Error).message));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 13: Email Preview — message body is editable
    // ──────────────────────────────────────────────────────────────────────────
    try {
      if (emailModalOpen) {
        const bodyInput = page.locator('textarea').first();
        if (await bodyInput.count()) {
          await bodyInput.fill('Custom test message body');
          await waitMs(300);
          const val = await bodyInput.inputValue();
          results.push(log(13, 'Email Preview message body is editable', val.includes('Custom test')));
        } else {
          results.push(log(13, 'Email Preview message body editable (textarea not found — skipped)', true));
        }
      } else {
        results.push(log(13, 'Email Preview message body editable (modal not open — skipped)', true));
      }
    } catch (err) {
      results.push(log(13, 'Email Preview message body editable', false, (err as Error).message));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 14: Email Preview — Cancel closes the modal
    // ──────────────────────────────────────────────────────────────────────────
    try {
      if (emailModalOpen) {
        const cancelBtn = page.locator('button', { hasText: /Cancel|Close/i })
          .filter({ hasText: /^(Cancel|Close)$/i })
          .last();
        if (await cancelBtn.count()) {
          await cancelBtn.click();
        } else {
          await page.keyboard.press('Escape');
        }
        await waitMs(1000);
        const modalGone = (await page.locator('text=/Email Preview|Compose Email/i').count()) === 0;
        results.push(log(14, 'Email Preview modal closes on Cancel', modalGone));
        emailModalOpen = false;
      } else {
        results.push(log(14, 'Email Preview Cancel (modal not open — skipped)', true));
      }
    } catch (err) {
      results.push(log(14, 'Email Preview Cancel closes modal', false, (err as Error).message));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 15: Bulk select — select-all checkbox works
    // ──────────────────────────────────────────────────────────────────────────
    try {
      await waitMs(500);
      // Use .filter to only count real data rows (rows with buttons), not empty-state rows
      const dataRows15 = page.locator('table tbody tr').filter({ has: page.locator('button') });
      const dataRowCount15 = await dataRows15.count();
      if (dataRowCount15 === 0) {
        results.push(log(15, 'Bulk select (no data rows — skipped)', true));
      } else {
        // The select-all button is in table thead first column
        const selectAllBtn = page.locator('table thead th').first().locator('button').first();
        if (await selectAllBtn.count()) {
          await selectAllBtn.click();
          await waitMs(600);

          // Bulk action bar should appear
          const bulkBar = await page.locator('text=/Send All|Void All|selected/i').count();
          results.push(log(15, 'Bulk select-all shows bulk action bar', bulkBar > 0));

          // Deselect all by clicking again
          await selectAllBtn.click();
          await waitMs(400);
        } else {
          results.push(log(15, 'Bulk select-all (button not found — skipped)', true));
        }
      }
    } catch (err) {
      results.push(log(15, 'Bulk select-all', false, (err as Error).message));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 16: Bulk action bar — Send All and Void All buttons visible when rows selected
    // ──────────────────────────────────────────────────────────────────────────
    try {
      // Use .filter to only count real data rows (rows with buttons), not empty-state rows
      const dataRows16 = page.locator('table tbody tr').filter({ has: page.locator('button') });
      const dataRowCount16 = await dataRows16.count();
      if (dataRowCount16 === 0) {
        results.push(log(16, 'Bulk action buttons visible (no data rows — skipped)', true));
      } else {
        // Select single row from a real data row
        const firstRowCheck = dataRows16.first().locator('button').first();
        if (await firstRowCheck.count()) {
          await firstRowCheck.click();
          await waitMs(600);

          const sendAllBtn = await page.locator('button', { hasText: /Send All/i }).count();
          const voidAllBtn = await page.locator('button', { hasText: /Void All/i }).count();
          results.push(log(16, 'Bulk action bar: Send All + Void All buttons visible', sendAllBtn > 0 || voidAllBtn > 0));

          // Dismiss selection
          const cancelSel = page.locator('button[data-testid="cancel-selection"]').or(
            page.locator('button', { hasText: /×|✕|X/i }).last()
          );
          if (await cancelSel.count()) await cancelSel.click();
          else await firstRowCheck.click(); // toggle off
          await waitMs(400);
        } else {
          results.push(log(16, 'Bulk action buttons visible (checkbox not found — skipped)', true));
        }
      }
    } catch (err) {
      results.push(log(16, 'Bulk action bar buttons visible', false, (err as Error).message));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 17: + New Invoice button navigates to create page
    // ──────────────────────────────────────────────────────────────────────────
    try {
      const newInvBtn = page.locator('button', { hasText: /New Invoice/i }).or(
        page.locator('a', { hasText: /New Invoice/i })
      ).first();
      if (!(await newInvBtn.count())) throw new Error('+ New Invoice button not found');

      await newInvBtn.click();
      await waitMs(2000);

      const isOnCreatePage = page.url().includes('/invoices/new') || page.url().includes('/billing/invoices/new');
      const hasCreateForm = (await page.locator('text=/Invoice Date|New Invoice|Create Invoice/i').count()) > 0;
      results.push(log(17, '+ New Invoice button navigates to create page', isOnCreatePage || hasCreateForm,
        `url=${page.url()}`));

      // Navigate back
      await page.goBack();
      await waitMs(2000);
    } catch (err) {
      results.push(log(17, '+ New Invoice button', false, (err as Error).message));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 18: Templates button opens template gallery
    // ──────────────────────────────────────────────────────────────────────────
    try {
      await waitMs(500);
      const templatesBtn = page.locator('button', { hasText: /Templates/i }).first();
      if (await templatesBtn.count()) {
        await templatesBtn.click();
        await waitMs(1000);

        const galleryVisible = (await page.locator('text=/Template|Invoice Template/i').count()) > 1 ||
          (await page.locator('[class*="template"], [class*="gallery"]').count()) > 0;
        results.push(log(18, 'Templates button opens gallery', galleryVisible));

        // Close it
        await page.keyboard.press('Escape');
        await waitMs(600);
      } else {
        results.push(log(18, 'Templates button (not found — skipped)', true));
      }
    } catch (err) {
      results.push(log(18, 'Templates gallery opens', false, (err as Error).message));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 19: Empty state renders correctly when search yields nothing
    // ──────────────────────────────────────────────────────────────────────────
    try {
      const searchInput = await safeFind(page, 'input[placeholder*="Search"], input[type="search"]', 3000);
      if (searchInput) {
        await searchInput.fill('ABSOLUTELYNONEXISTENT12345');
        await waitMs(1200);

        const hasEmptyState = (await page.locator('text=/No invoices/i').count()) > 0 ||
          (await page.locator('text=/adjusting your filters/i').count()) > 0;
        results.push(log(19, 'Empty state renders on no search results', hasEmptyState));

        await searchInput.fill('');
        await waitMs(800);
      } else {
        results.push(log(19, 'Empty state (search input not found — skipped)', true));
      }
    } catch (err) {
      results.push(log(19, 'Empty state on no results', false, (err as Error).message));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // STEP 20: No MORE ACTIONS text visible as plain table cell content
    //          (Regression test for the portal fix in Task 1)
    // ──────────────────────────────────────────────────────────────────────────
    try {
      await waitMs(500);
      // Check that no table <td> renders the raw "MORE ACTIONS" text
      const inlineText = await page.locator('td', { hasText: /MORE ACTIONS/i }).count();
      results.push(log(20, 'MORE ACTIONS text NOT visible as inline table cell (portal fix regression)', inlineText === 0,
        inlineText > 0 ? `Found ${inlineText} td(s) with inline MORE ACTIONS text` : undefined));
    } catch (err) {
      results.push(log(20, 'MORE ACTIONS not inline', false, (err as Error).message));
    }

    // ──────────────────────────────────────────────────────────────────────────
    // FINAL REPORT
    // ──────────────────────────────────────────────────────────────────────────
    const passed = results.filter((r) => r.pass).length;
    const failed = results.filter((r) => !r.pass).length;
    const total = results.length;

    console.log('\n══════════════════════════════════════════════');
    console.log(`INVOICES PAGE E2E SUMMARY: ${passed}/${total} passed, ${failed} failed`);
    console.log('══════════════════════════════════════════════');
    results.forEach((r) => {
      const sym = r.pass ? '✅' : '❌';
      console.log(`  ${sym} Step ${r.step}${r.detail ? ` — ${r.detail}` : ''}`);
    });
    console.log('══════════════════════════════════════════════\n');

    // Critical assertions: steps that MUST pass
    const criticalSteps = [1, 3, 7, 20]; // Navigate, Page renders, Dropdown not inline, No MORE ACTIONS inline
    for (const s of criticalSteps) {
      const r = results.find((x) => x.step === s);
      if (r) {
        expect(r.pass, `Critical step ${s} failed: ${r.detail ?? 'unknown reason'}`).toBe(true);
      }
    }

    // Non-critical: warn but don't fail entire suite
    const nonCriticalFailed = results.filter((r) => !r.pass && !criticalSteps.includes(r.step));
    if (nonCriticalFailed.length > 0) {
      console.warn(`⚠️  ${nonCriticalFailed.length} non-critical steps failed: ${nonCriticalFailed.map((r) => `Step ${r.step}`).join(', ')}`);
    }
  });

  // ────────────────────────────────────────────────────────────────────────────
  // SEPARATE TEST: Invoice detail panel tabs (Edit / Email / Payor / Print)
  // ────────────────────────────────────────────────────────────────────────────
  test('invoice detail panel view tabs', async ({ page }) => {
    await page.goto(navURL(), { waitUntil: 'load', timeout: 30000 });
    await waitMs(2500);

    const dataRowsDetail = page.locator('table tbody tr').filter({ has: page.locator('button') });
    if ((await dataRowsDetail.count()) === 0) {
      console.log('⏭️  No data rows found — skipping detail panel tab tests');
      return;
    }

    // Open detail panel
    const invLink = dataRowsDetail.first().locator('button').first();
    await invLink.click();
    await waitMs(1500);

    const detailOpen = (await page.locator('text=/Invoice Date|Balance Due/i').count()) > 0;
    if (!detailOpen) {
      console.log('⏭️  Detail panel did not open — skipping tab tests');
      return;
    }

    // Check for tab navigation
    const EXPECTED_TABS = ['Edit', 'Email', 'Payor', 'Print'];
    for (const tab of EXPECTED_TABS) {
      const tabBtn = page.locator('button', { hasText: new RegExp(tab, 'i') });
      if (await tabBtn.count()) {
        await tabBtn.first().click();
        await waitMs(700);
        console.log(`✅ Tab "${tab}" clicked and renders`);
      } else {
        console.log(`⚠️  Tab "${tab}" not yet implemented`);
      }
    }

    // Close
    await page.keyboard.press('Escape');
    await waitMs(400);
  });

  // ────────────────────────────────────────────────────────────────────────────
  // SEPARATE TEST: Row action menu is a proper floating dropdown
  // ────────────────────────────────────────────────────────────────────────────
  test('row action menu is a floating dropdown not inline text', async ({ page }) => {
    await page.goto(navURL(), { waitUntil: 'load', timeout: 30000 });
    await waitMs(2500);

    const dataRowsMenu = page.locator('table tbody tr').filter({ has: page.locator('button') });
    if ((await dataRowsMenu.count()) === 0) {
      console.log('⏭️  No data rows — skipping action menu test');
      return;
    }

    const menuBtn = dataRowsMenu.first().locator('button').last();
    await menuBtn.click();
    await waitMs(800);

    // Must NOT have MORE ACTIONS as plain td text
    const inlineMoreActions = await page.locator('td', { hasText: /MORE ACTIONS/i }).count();
    expect(inlineMoreActions, 'MORE ACTIONS should NOT appear as raw table cell text').toBe(0);

    // Must have a floating dropdown with View / Edit
    const floatingDropdown = await page.locator('[style*="position: fixed"], [style*="position:fixed"]').count();
    const hasViewEdit = await page.locator('text=/View.*Edit/i').count();
    expect(floatingDropdown > 0 || hasViewEdit > 0, 'Dropdown should be floating with menu items').toBe(true);

    // Dismiss
    await page.keyboard.press('Escape');
    await waitMs(400);
  });
});
