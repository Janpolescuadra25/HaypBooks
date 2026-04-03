import { test, expect, Page, ConsoleMessage } from '@playwright/test';

test.describe('Customers Page E2E', () => {
  const baseURL = 'http://localhost:3000';
  const targetPath = '/(owner)/sales/customers/customers';
  const targetURL = `${baseURL}${targetPath}`;
  const newCustomerName = 'Test Customer';
  const editedCustomerName = 'Test Customer Edited';

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

  test('full customers flow', async ({ page }) => {
    const results = [] as Array<{ step: number; pass: boolean; detail?: string }>;

    // STEP 1: Navigate
    try {
      await page.goto(targetURL, { waitUntil: 'load', timeout: 30000 });
      await waitMs(2000);

      const h1 = page.locator('h1', { hasText: 'Customers' });
      const table = page.locator('table');
      const login = page.locator('text=login', { exact: false });

      const ready = await Promise.race([
        h1.first().waitFor({ timeout: 10000 }).then(() => true).catch(() => false),
        table.first().waitFor({ timeout: 10000 }).then(() => true).catch(() => false),
        login.first().waitFor({ timeout: 10000 }).then(() => true).catch(() => false),
      ]);

      results.push(log(1, 'Navigate to Customers page', Boolean(ready)));
    } catch (err) {
      results.push(log(1, 'Navigate to Customers page', false, (err as Error).message));
    }

    // STEP 2: Console errors on load
    const pageErrors: string[] = [];
    const removeListener = () => {};
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
    } finally {
      await removeListener();
    }

    // STEP 3: Page render sanity check
    try {
      await waitMs(2000);
      const hasTable = await page.locator('table').first().count();
      const hasEmpty = (await page.locator('text=No customers found').count()) > 0 || (await page.locator('text=No customers yet').count()) > 0;
      if (hasTable > 0 || hasEmpty) {
        results.push(log(3, 'Check the page renders (no 500/white screen)', true));
      } else {
        results.push(log(3, 'Check the page renders (no 500/white screen)', false, 'Table and empty state not found')); }
    } catch (err) {
      results.push(log(3, 'Check the page renders (no 500/white screen)', false, (err as Error).message));
    }

    // STEP 4: Create customer
    try {
      const newCustomer = await page.locator('button', { hasText: '+ New Customer' }).first().count() ? page.locator('button', { hasText: '+ New Customer' }).first() : page.locator('button', { hasText: 'New Customer' }).first();
      if (!(await newCustomer.count())) throw new Error('New Customer button not found');
      await newCustomer.click();
      await waitMs(2000);

      const modal = await safeFind(page, 'dialog, [role="dialog"], .modal', 8000);
      if (!modal) throw new Error('Modal did not appear');

      await page.fill('input[name="displayName"], input[name="name"]', newCustomerName);
      await page.fill('input[name="email"]', 'test@example.com');
      await page.fill('input[name="phone"]', '09171234567');

      const saveButton = page.locator('button', { hasText: /Save|Create|Submit/i }).first();
      if (!(await saveButton.count())) throw new Error('Save/Create button not found');
      await saveButton.click();
      await waitMs(3000);

      const toastError = await page.locator('text=/error/i').first().count();
      if (toastError > 0) {
        const errText = await page.locator('text=/error/i').first().innerText();
        throw new Error(`Error toast displayed: ${errText}`);
      }

      await expect(page.locator('table tbody tr', { hasText: newCustomerName })).toHaveCount(1, { timeout: 8000 });
      results.push(log(4, 'Create a customer', true));
    } catch (err) {
      results.push(log(4, 'Create a customer', false, (err as Error).message));
    }

    // STEP 5: Search functionality
    try {
      const searchInput = await safeFind(page, 'input[type="search"], input[placeholder*="Search"], input[name="search"]', 5000);
      if (!searchInput) throw new Error('Search input not found');
      await searchInput.fill('');
      await waitMs(250);
      await searchInput.fill(newCustomerName);
      await waitMs(2000);

      const allRows = await page.locator('table tbody tr').allTextContents();
      if (allRows.length === 0) throw new Error('No rows found after search');
      const allContains = allRows.every((row) => row.includes(newCustomerName));
      if (!allContains) throw new Error('Table still shows rows not matching search');
      results.push(log(5, 'Search functionality', true));
    } catch (err) {
      results.push(log(5, 'Search functionality', false, (err as Error).message));
    }

    // STEP 6: Status filter
    try {
      const statusSelect = await safeFind(page, 'select[name="status"], select', 5000);
      if (!statusSelect) throw new Error('Status dropdown not found');

      await statusSelect.selectOption({ label: 'Inactive' }).catch(() => statusSelect.selectOption('inactive').catch(() => undefined));
      await waitMs(2000);

      const inactiveRows = await page.locator('table tbody tr').allTextContents();
      const inactiveOK = inactiveRows.length === 0 || inactiveRows.every((row) => row.toLowerCase().includes('inactive'));
      if (!inactiveOK) throw new Error('Inactive filter not applied correctly');

      await statusSelect.selectOption({ label: 'All Status' }).catch(() => statusSelect.selectOption('all').catch(() => statusSelect.selectOption('')));
      await waitMs(2000);

      const allRows2 = await page.locator('table tbody tr').count();
      if (allRows2 === 0) throw new Error('All status not shown after resetting filter');

      results.push(log(6, 'Status filter', true));
    } catch (err) {
      results.push(log(6, 'Status filter', false, (err as Error).message));
    }

    // STEP 7: Edit customer
    try {
      let row = page.locator('table tbody tr', { hasText: newCustomerName }).first();
      if (!(await row.count())) throw new Error('Test Customer row not found for edit');

      const editBtn = row.locator('button', { hasText: /Edit|View/i }).first();
      if (await editBtn.count()) {
        await editBtn.click();
      } else {
        await row.click();
      }

      await waitMs(2000);
      const editModal = await safeFind(page, 'dialog, [role="dialog"], .modal', 8000);
      if (!editModal) throw new Error('Edit modal did not appear');

      await editModal.fill('input[name="displayName"], input[name="name"]', editedCustomerName);
      const saveBtn = editModal.locator('button', { hasText: /Save|Update|Submit/i }).first();
      if (!(await saveBtn.count())) throw new Error('Save button not found in edit modal');
      await saveBtn.click();
      await waitMs(3000);

      await expect(page.locator('table tbody tr', { hasText: editedCustomerName })).toHaveCount(1, { timeout: 8000 });
      results.push(log(7, 'Edit a customer', true));
    } catch (err) {
      results.push(log(7, 'Edit a customer', false, (err as Error).message));
    }

    // STEP 8: Delete a customer
    try {
      const row = page.locator('table tbody tr', { hasText: editedCustomerName }).first();
      if (!(await row.count())) throw new Error('Edited row not found for delete');
      const deleteBtn = row.locator('button', { hasText: /Delete|Remove/i }).first();
      if (!(await deleteBtn.count())) throw new Error('Delete button not found');
      await deleteBtn.click();

      await waitMs(1000);
      const confirmButton = page.locator('button', { hasText: /Confirm|Yes/i }).first();
      if (await confirmButton.count()) {
        await confirmButton.click();
      }
      await waitMs(3000);

      const isGone = (await page.locator('table tbody tr', { hasText: editedCustomerName }).count()) === 0;
      if (!isGone) throw new Error('Row still exists after delete');
      results.push(log(8, 'Delete a customer', true));
    } catch (err) {
      results.push(log(8, 'Delete a customer', false, (err as Error).message));
    }

    // STEP 9: Check summary cards
    try {
      const totalCard = await page.locator('text=Total Customers').first();
      const activeCard = await page.locator('text=Active').first();
      if (!(await totalCard.count()) || !(await activeCard.count())) throw new Error('Summary cards not found');

      const totalText = await totalCard.textContent();
      const activeText = await activeCard.textContent();
      const totalMatch = /\d+/.test(totalText || '');
      const activeMatch = /\d+/.test(activeText || '');
      if (!totalMatch || !activeMatch) throw new Error('Summary card values invalid');

      results.push(log(9, 'Check summary cards', true));
    } catch (err) {
      results.push(log(9, 'Check summary cards', false, (err as Error).message));
    }

    // STEP 10: Final console errors
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
    // eslint-disable-next-line no-console
    console.log('=== CUSTOMERS PAGE TEST SUMMARY ===');
    // eslint-disable-next-line no-console
    console.log(`Passed: ${passed}/${results.length}`);
    // eslint-disable-next-line no-console
    console.log(`Failed: ${failed}/${results.length}`);

    if (failed > 0) {
      const details = results
        .filter((r) => !r.pass)
        .map((r) => `STEP ${r.step}: ${r.detail || 'unknown'}`)
        .join(' | ');
      // eslint-disable-next-line no-console
      console.log('Details:', details);
    }

    expect(failed).toBe(0);
  });
});
