import { test, expect, Page, ConsoleMessage } from '@playwright/test';

test.describe('Customers Page E2E', () => {
  const baseURL = 'http://localhost:3000';
  const targetPath = '/sales/customers/customers';
  const targetURL = `${baseURL}${targetPath}`;
  const newCustomerName = 'Test Customer';
  const editedCustomerName = 'Test Customer Edited';

  const log = (step: number, desc: string, pass: boolean, detail?: string) => {
    const symbol = pass ? '✅' : '❌';
    const msg = `${symbol} STEP ${step}: ${desc} — ${pass ? 'PASS' : `FAIL: ${detail || 'unknown'}`}`;
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

  async function waitForNoOverlay(page: Page, timeout = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const overlay = await page.$('div.fixed.inset-0.z-50');
      if (!overlay) return;
      await waitMs(200);
    }
  }

  test('full customers flow', async ({ page, request }) => {
    const results = [] as Array<{ step: number; pass: boolean; detail?: string }>;

    const email = `ui-e2e-customers-${Date.now()}@haypbooks.test`;
    const password = 'Playwright1!';

    try {
      const gate = await request.get('http://127.0.0.1:4000/api/test/users');
      if (gate.status() === 403) {
        throw new Error('Test user API endpoint disabled; ensure ALLOW_TEST_ENDPOINTS or fallback with UI signup');
      }

      const createResp = await request.post('http://127.0.0.1:4000/api/test/create-user', {
        data: {
          email,
          password,
          name: 'E2E Customer',
          isEmailVerified: true,
        },
      });
      expect([200, 201]).toContain(createResp.status());

      // Use UI login to set cookies and auth state for next page navigation.
      await page.goto('/login');
      await page.waitForSelector('input[type="email"]', { timeout: 15000 });
      await page.fill('input[type="email"]', email);
      await page.fill('input[type="password"]', password);
      // click sign in; the target may vary in label
      const signinBtn = page.locator('button:has-text("Sign in"), button:has-text("Sign In")').first();
      await signinBtn.click();
      await page.waitForURL(/(dashboard|hub|\/home|\/sales)/, { timeout: 30000 }).catch(() => {});

      // create active company
      const company = await request.post('http://127.0.0.1:4000/api/companies', {
        data: { name: 'E2E Test Company' },
      }).then((r) => r.json());
      expect(company).not.toBeNull();

      // set active company to avoid route auto-redirect issues
      await request.patch(`http://127.0.0.1:4000/api/companies/${company.id}/last-accessed`);

      await page.goto(targetURL, { waitUntil: 'load', timeout: 30000 });
      await waitForNoOverlay(page, 15000);
      await waitMs(2000);

      const h1 = page.locator('h1', { hasText: 'Customers' });
      const table = page.locator('table');
      const ready = await Promise.race([
        h1.first().waitFor({ timeout: 15000 }).then(() => true).catch(() => false),
        table.first().waitFor({ timeout: 15000 }).then(() => true).catch(() => false),
      ]);
      results.push(log(1, 'Navigate to Customers page', Boolean(ready)));
    } catch (err) {
      results.push(log(1, 'Navigate to Customers page', false, (err as Error).message));
    }

    const pageErrors: string[] = [];
    try {
      const handler = (msg: ConsoleMessage) => {
        if (msg.type() === 'error') {
          pageErrors.push(msg.text());
        }
      };
      page.on('console', handler);

      await waitMs(3000);
      page.off('console', handler);

      const bad = pageErrors.filter((err) => /badgeColors|ReferenceError/i.test(err));
      if (bad.length > 0) {
        results.push(log(2, 'Check for console errors on load', false, bad.join(' | ')));
      } else {
        results.push(log(2, 'Check for console errors on load', true));
      }
    } catch (err) {
      results.push(log(2, 'Check for console errors on load', false, (err as Error).message));
    }

    try {
      await waitMs(2000);
      const hasTable = await page.locator('table').first().count();
      const hasEmpty = (await page.locator('text=No customers found').count()) > 0 || (await page.locator('text=No customers yet').count()) > 0;
      if (hasTable > 0 || hasEmpty) {
        results.push(log(3, 'Check the page renders (no 500/white screen)', true));
      } else {
        results.push(log(3, 'Check the page renders (no 500/white screen)', false, 'Table and empty state not found'));
      }
    } catch (err) {
      results.push(log(3, 'Check the page renders (no 500/white screen)', false, (err as Error).message));
    }

    try {
      // (Re)open Create Customer modal and interact with real form selectors
      await waitForNoOverlay(page);
      await page.click('button:has-text("New Customer")', { timeout: 15000 });
      await page.waitForSelector('div.fixed.inset-0.z-50.flex.items-center.justify-center', { timeout: 15000 });
      await waitForNoOverlay(page, 10000);

      const formRoot = page.locator('div.fixed.inset-0.z-50.flex.items-center.justify-center').first();
      await expect(formRoot).toBeVisible({ timeout: 15000 });

      // precise input selectors from CrudModal structure
      await formRoot.locator('input[placeholder="Enter customer name..."]').fill(newCustomerName);
      await formRoot.locator('input[placeholder="Enter email..."]').fill('test.customer@haypbooks.test');
      await formRoot.locator('input[placeholder="Enter phone..."]').fill('09171234567');

      // Create record with valid fields
      await formRoot.locator('input[placeholder="Enter customer name..."]').fill(newCustomerName);
      await formRoot.locator('input[placeholder="Enter email..."]').fill('test.customer@haypbooks.test');
      await formRoot.locator('input[placeholder="Enter phone..."]').fill('09171234567');

      const createResp = page.waitForResponse((r) => r.url().includes('/contacts/customers') && r.request().method() === 'POST', { timeout: 20000 });
      await formRoot.click('button:has-text("Create")');
      await createResp;

      // wait for the modal to close and row display
      await page.waitForSelector('div.fixed.inset-0.z-50.flex.items-center.justify-center', { state: 'detached', timeout: 20000 });
      await expect(page.locator('table tbody tr', { hasText: newCustomerName })).toHaveCount(1, { timeout: 20000 });
      results.push(log(4, 'Create a customer', true));
    } catch (err) {
      await page.screenshot({ path: 'playwright-screenshots/customers-step4-fail.png', fullPage: true }).catch(() => {})
      results.push(log(4, 'Create a customer', false, (err as Error).message));
    }

    try {
      const searchInput = page.locator('input[placeholder*="Search customers"]');
      await expect(searchInput).toBeVisible({ timeout: 10000 });
      await searchInput.fill(newCustomerName);
      await waitMs(1500);

      const allRows = await page.locator('table tbody tr').allTextContents();
      if (allRows.length === 0) throw new Error('No rows found after search');
      const allContains = allRows.every((row) => row.includes(newCustomerName));
      if (!allContains) throw new Error('Table still shows rows not matching search');
      results.push(log(5, 'Search functionality', true));
    } catch (err) {
      await page.screenshot({ path: 'playwright-screenshots/customers-step5-fail.png', fullPage: true }).catch(() => {})
      results.push(log(5, 'Search functionality', false, (err as Error).message));
    }

    try {
      const filterBtn = page.locator('button:has-text("Filters")').first();
      await expect(filterBtn).toBeVisible({ timeout: 10000 });
      await waitForNoOverlay(page, 10000);
      await filterBtn.click();
      await waitForNoOverlay(page, 10000);
      await waitMs(500);

      const inactiveItem = page.locator('button:has-text("Inactive")').first();
      await expect(inactiveItem).toBeVisible({ timeout: 8000 });
      await inactiveItem.click();
      await waitForNoOverlay(page, 10000);
      await waitMs(1500);

      const filteredRows = await page.locator('table tbody tr').allTextContents();
      const inactiveBl = filteredRows.every((row) => row.toLowerCase().includes('inactive') || row.length === 0);
      if (!inactiveBl) throw new Error('Inactive filter not applied correctly');
      results.push(log(6, 'Status filter', true));
    } catch (err) {
      await page.screenshot({ path: 'playwright-screenshots/customers-step6-fail.png', fullPage: true }).catch(() => {})
      results.push(log(6, 'Status filter', false, (err as Error).message));
    }

    try {
      const row = page.locator('table tbody tr', { hasText: newCustomerName }).first();
      await expect(row).toBeVisible({ timeout: 10000 });

      // Use row action menu if present, otherwise click to view
      const editBtn = row.locator('button:has-text("Edit")').first();
      if (await editBtn.count()) {
        await editBtn.click();
      } else {
        await row.click();
        await page.waitForSelector('button:has-text("Save Changes")', { timeout: 10000 });
      }

      const modalRoot = page.locator('div.fixed.inset-0.z-50.flex.items-center.justify-center').first();
      await expect(modalRoot).toBeVisible({ timeout: 10000 });

      await modalRoot.fill('input[placeholder="Enter customer name..."]', editedCustomerName);
      await modalRoot.click('button:has-text("Save Changes")');
      await page.waitForResponse((r) => r.url().includes('/contacts/customers') && r.request().method() === 'PUT', { timeout: 20000 });
      await page.waitForSelector('div.fixed.inset-0.z-50.flex.items-center.justify-center', { state: 'detached', timeout: 15000 });
      await expect(page.locator('table tbody tr', { hasText: editedCustomerName })).toHaveCount(1, { timeout: 20000 });
      results.push(log(7, 'Edit a customer', true));
    } catch (err) {
      await page.screenshot({ path: 'playwright-screenshots/customers-step7-fail.png', fullPage: true }).catch(() => {})
      results.push(log(7, 'Edit a customer', false, (err as Error).message));
    }

    try {
      const delRow = page.locator('table tbody tr', { hasText: editedCustomerName }).first();
      await expect(delRow).toBeVisible({ timeout: 10000 });

      const delBtn = delRow.locator('button:has-text("Delete")').first();
      if (await delBtn.count()) {
        await delBtn.click();
      } else {
        await delRow.click();
        await page.waitForSelector('button:has-text("Delete")', { timeout: 10000 });
        await page.click('button:has-text("Delete")');
      }

      // delete confirmation flow
      await page.waitForSelector('div.fixed.inset-0.z-50.flex.items-center.justify-center', { timeout: 10000 });
      await page.click('button:has-text("Delete")');
      await page.waitForResponse((r) => r.url().includes('/contacts/customers') && r.request().method() === 'DELETE', { timeout: 20000 });
      await page.waitForSelector('div.fixed.inset-0.z-50.flex.items-center.justify-center', { state: 'detached', timeout: 15000 });
      const deleted = await page.locator('table tbody tr', { hasText: editedCustomerName }).count();
      if (deleted > 0) throw new Error('Customer row still present after delete');
      results.push(log(8, 'Delete a customer', true));
    } catch (err) {
      await page.screenshot({ path: 'playwright-screenshots/customers-step8-fail.png', fullPage: true }).catch(() => {})
      results.push(log(8, 'Delete a customer', false, (err as Error).message));
    }

    try {
      // Step 9: form validation checks for required and invalid email
      await page.click('button:has-text("New Customer")');
      await expect(page.locator('div.fixed.inset-0.z-50.flex.items-center.justify-center')).toBeVisible({ timeout: 15000 });
      const modalRoot = page.locator('div.fixed.inset-0.z-50.flex.items-center.justify-center').first();

      await modalRoot.locator('input[placeholder="Enter customer name..."]').fill('');
      await modalRoot.locator('input[placeholder="Enter email..."]').fill('invalid-email');
      await modalRoot.click('button:has-text("Create")');
      await waitMs(1000);

      const requiredError = await modalRoot.locator('text=/required/i').count();
      const invalidEmailError = await modalRoot.locator('text=/email/i').count();
      if (requiredError === 0 || invalidEmailError === 0) {
        throw new Error('Form validation messages not shown');
      }

      // close modal to continue
      await modalRoot.click('button:has-text("Cancel")');
      await page.waitForSelector('div.fixed.inset-0.z-50.flex.items-center.justify-center', { state: 'detached', timeout: 10000 });

      results.push(log(9, 'Form validation (empty/invalid)', true));
    } catch (err) {
      await page.screenshot({ path: 'playwright-screenshots/customers-step9-fail.png', fullPage: true }).catch(() => {})
      results.push(log(9, 'Form validation (empty/invalid)', false, (err as Error).message));
    }

    try {
      const toastErrors = await page.locator('div[role="alert"], div:has-text("Error"), p:has-text("failed")').allTextContents();
      if (toastErrors.some((t) => /error|failed/i.test(t))) {
        throw new Error(`Toast error detected: ${toastErrors.join('; ')}`);
      }
      results.push(log(10, 'Error toast/display testing', true));
    } catch (err) {
      await page.screenshot({ path: 'playwright-screenshots/customers-step10-fail.png', fullPage: true }).catch(() => {})
      results.push(log(10, 'Error toast/display testing', false, (err as Error).message));
    }

    try {
      // cleanup any left-over test customer
      const cleanupRow = page.locator('table tbody tr', { hasText: editedCustomerName }).first();
      if (await cleanupRow.count()) {
        await cleanupRow.locator('button:has-text("Delete")').first().click();
        await page.waitForSelector('button:has-text("Delete")', { timeout: 10000 });
        await page.click('button:has-text("Delete")');
        await waitForNoOverlay(page, 10000);
      }
      results.push(log(11, 'Cleanup test customer', true));
    } catch (err) {
      results.push(log(11, 'Cleanup test customer', false, (err as Error).message));
    }

    try {
      const finalErrors: string[] = [];
      const handler2 = (msg: ConsoleMessage) => {
        if (msg.type() === 'error') finalErrors.push(msg.text());
      };
      page.on('console', handler2);
      await waitMs(3000);
      page.off('console', handler2);

      const bad = finalErrors.filter((err) => /badgeColors|ReferenceError/i.test(err));
      if (bad.length > 0) {
        results.push(log(10, 'Final console error check', false, bad.join(' | ')));
      } else {
        results.push(log(10, 'Final console error check', true));
      }
    } catch (err) {
      results.push(log(10, 'Final console error check', false, (err as Error).message));
    }

    const passed = results.filter((r) => r.pass).length;
    const failed = results.length - passed;
    console.log('=== CUSTOMERS PAGE TEST SUMMARY ===');
    console.log(`Passed: ${passed}/${results.length}`);
    console.log(`Failed: ${failed}/${results.length}`);

    if (failed > 0) {
      const details = results
        .filter((r) => !r.pass)
        .map((r) => `STEP ${r.step}: ${r.detail || 'unknown'}`)
        .join(' | ');
      console.log('Details:', details);
    }

    expect(failed).toBe(0);
  });
});
