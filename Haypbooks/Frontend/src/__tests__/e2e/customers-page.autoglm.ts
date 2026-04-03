// AutoGLM E2E script for Customers page
// This script is intended for the AutoGLM browser extension environment.

async function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function safeQuery(selector, timeoutMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const el = document.querySelector(selector);
    if (el) return el;
    await wait(250);
  }
  return null;
}

async function safeQueryAll(selector, timeoutMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const els = Array.from(document.querySelectorAll(selector));
    if (els.length > 0) return els;
    await wait(250);
  }
  return [];
}

function log(step, desc, pass, errMsg = '') {
  const symbol = pass ? '✅' : '❌';
  const message = `${symbol} STEP ${step}: ${desc} — ${pass ? 'PASS' : 'FAIL'}`;
  if (pass) {
    console.log(message);
  } else {
    console.error(`${message}: ${errMsg}`);
  }
  return { step, pass, errMsg: errMsg || null };
}

async function runCustomerPageFlow() {
  const results = [];

  // Cleanup at beginning
  try {
    const rows = Array.from(document.querySelectorAll('table tbody tr'));
    for (const row of rows) {
      const text = row.textContent || '';
      if (text.includes('Test Customer') || text.includes('Test Customer Edited')) {
        const deleteBtn = row.querySelector('button[aria-label="Delete"]') || row.querySelector('button:contains("Delete")');
        if (deleteBtn) {
          deleteBtn.click();
          await wait(500);
          const confirmBtn = document.querySelector('button:contains("Confirm")') || document.querySelector('button:contains("Yes")');
          if (confirmBtn) confirmBtn.click();
          await wait(1000);
        }
      }
    }
    results.push(log('0', 'cleanup pre-existing test customer rows', true));
  } catch (err) {
    results.push(log('0', 'cleanup pre-existing test customer rows', false, `${err}`));
  }

  // STEP 1
  try {
    window.location.href = 'http://localhost:3000/sales/customers/customers';
    await wait(2000);

    const loaded = await new Promise(async (resolve) => {
      const start = Date.now();
      while (Date.now() - start < 10000) {
        const h1 = document.querySelector('h1');
        const table = document.querySelector('table');
        if ((h1 && h1.textContent?.includes('Customers')) || table) {
          resolve(true);
          return;
        }
        if (window.location.pathname.includes('/login')) {
          resolve(true);
          return;
        }
        await wait(250);
      }
      resolve(false);
    });

    results.push(log(1, 'Navigate to Customers page', loaded));
  } catch (err) {
    results.push(log(1, 'Navigate to Customers page', false, `${err}`));
  }

  // STEP 2
  let step2Errors = [];
  try {
    const errors = [];
    const origError = console.error;
    console.error = (...args) => {
      errors.push(args);
      origError(...args);
    };

    await wait(3000);

    console.error = origError;

    const bad = errors.filter(e => e.some(el => String(el).includes('badgeColors') || String(el).includes('ReferenceError')));
    if (bad.length > 0) {
      results.push(log(2, 'Check for console errors on load', false, JSON.stringify(bad)));
      step2Errors = bad;
    } else {
      results.push(log(2, 'Check for console errors on load', true));
    }
  } catch (err) {
    results.push(log(2, 'Check for console errors on load', false, `${err}`));
  }

  // STEP 3
  try {
    const contentOk = await new Promise(async (resolve) => {
      const start = Date.now();
      while (Date.now() - start < 5000) {
        const table = document.querySelector('table');
        const empty = document.querySelector('text=No customers found') || [...document.querySelectorAll('*')].find(el => el.textContent?.includes('No customers found'));
        if (table || empty) {
          resolve(true);
          return;
        }
        await wait(250);
      }
      resolve(false);
    });
    results.push(log(3, 'Check the page renders (no 500 or white screen)', contentOk));
  } catch (err) {
    results.push(log(3, 'Check the page renders (no 500 or white screen)', false, `${err}`));
  }

  // STEP 4
  try {
    const newBtn = document.querySelector('button:enabled, button') && ([...document.querySelectorAll('button')].find(b => /New Customer|\+ New Customer/i.test(b.textContent || '')));
    if (!newBtn) throw new Error('New Customer button not found');
    (newBtn as HTMLElement).click();
    await wait(2000);

    const modal = await safeQuery('dialog, [role="dialog"], .modal', 5000);
    if (!modal) throw new Error('Modal did not appear');

    const inputDisplay = modal.querySelector('input[name="displayName"], input[name="name"]');
    const inputEmail = modal.querySelector('input[name="email"]');
    const inputPhone = modal.querySelector('input[name="phone"]');
    if (!inputDisplay || !inputEmail || !inputPhone) throw new Error('Required form inputs not found');

    (inputDisplay as HTMLInputElement).value = 'Test Customer';
    (inputEmail as HTMLInputElement).value = 'test@example.com';
    (inputPhone as HTMLInputElement).value = '09171234567';
    inputDisplay.dispatchEvent(new Event('input', { bubbles: true }));
    inputEmail.dispatchEvent(new Event('input', { bubbles: true }));
    inputPhone.dispatchEvent(new Event('input', { bubbles: true }));

    const saveBtn = modal.querySelector('button:enabled, button') && ([...modal.querySelectorAll('button')].find(b => /Save|Create|Submit/i.test(b.textContent || '')));
    if (!saveBtn) throw new Error('Save/Create button not found');
    (saveBtn as HTMLElement).click();

    await wait(3000);

    const toastError = [...document.querySelectorAll('*')].find(el => /error/i.test(el.textContent || '') && /toast|alert/i.test(el.className || ''));
    if (toastError) {
      results.push(log(4, 'Create a customer', false, `Error toast: ${(toastError.textContent || '').trim()}`));
    } else {
      await wait(1000);
      const row = [...document.querySelectorAll('table tbody tr')].find(row => (row.textContent || '').includes('Test Customer'));
      if (row) results.push(log(4, 'Create a customer', true));
      else results.push(log(4, 'Create a customer', false, 'Created row not found'));;
    }
  } catch (err) {
    results.push(log(4, 'Create a customer', false, `${err}`));
  }

  // STEP 5
  try {
    const searchInput = document.querySelector('input[placeholder*="Search" i], input[type="search"], input[name="search"]');
    if (!searchInput) throw new Error('Search input not found');
    (searchInput as HTMLInputElement).value = '';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    await wait(250);
    (searchInput as HTMLInputElement).value = 'Test Customer';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    await wait(2000);

    const rows = [...document.querySelectorAll('table tbody tr')];
    if (rows.length === 0) throw new Error('No rows in table after filtering');
    const good = rows.every(row => (row.textContent || '').includes('Test Customer'));
    if (!good) throw new Error('Some rows do not match filter');
    results.push(log(5, 'Search functionality', true));
  } catch (err) {
    results.push(log(5, 'Search functionality', false, `${err}`));
  }

  // STEP 6
  try {
    const statusSelect = document.querySelector('select[name="status"], select[aria-label*="status" i], select');
    if (!statusSelect) throw new Error('Status select not found');
    (statusSelect as HTMLSelectElement).value = 'Inactive';
    statusSelect.dispatchEvent(new Event('change', { bubbles: true }));
    await wait(2000);

    const rows = [...document.querySelectorAll('table tbody tr')];
    const allInactive = rows.every(row => (row.textContent || '').includes('Inactive') || rows.length === 0);
    if (!allInactive) throw new Error('Not all rows are Inactive after filter');

    (statusSelect as HTMLSelectElement).value = 'All';
    statusSelect.dispatchEvent(new Event('change', { bubbles: true }));
    await wait(2000);

    const rowsAll = [...document.querySelectorAll('table tbody tr')];
    if (rowsAll.length === 0) throw new Error('All customers not shown after clearing status filter');

    results.push(log(6, 'Status filter', true));
  } catch (err) {
    results.push(log(6, 'Status filter', false, `${err}`));
  }

  // STEP 7
  try {
    const row = [...document.querySelectorAll('table tbody tr')].find(r => (r.textContent || '').includes('Test Customer'));
    if (!row) throw new Error('Test Customer row not found for edit');

    const editBtn = row.querySelector('button:enabled') && ([...row.querySelectorAll('button')].find(b => /edit/i.test(b.textContent || '') || /view/i.test(b.textContent || '')));
    if (editBtn) {
      (editBtn as HTMLElement).click();
    } else {
      (row as HTMLElement).click();
    }
    await wait(2000);

    const editModal = await safeQuery('dialog, [role="dialog"], .modal', 5000);
    if (!editModal) throw new Error('Edit modal not found');

    const displayInput = editModal.querySelector('input[name="displayName"], input[name="name"]');
    if (!displayInput) throw new Error('Display name input not found in edit modal');
    (displayInput as HTMLInputElement).value = 'Test Customer Edited';
    displayInput.dispatchEvent(new Event('input', { bubbles: true }));

    const saveBtn = editModal.querySelector('button:enabled, button') && ([...editModal.querySelectorAll('button')].find(b => /save|update|submit/i.test(b.textContent || '')));
    if (!saveBtn) throw new Error('Save button not found in edit modal');
    (saveBtn as HTMLElement).click();

    await wait(3000);

    const editedRow = [...document.querySelectorAll('table tbody tr')].find(r => (r.textContent || '').includes('Test Customer Edited'));
    if (!editedRow) throw new Error('Edited row not found');
    results.push(log(7, 'Edit a customer', true));
  } catch (err) {
    results.push(log(7, 'Edit a customer', false, `${err}`));
  }

  // STEP 8
  try {
    const row = [...document.querySelectorAll('table tbody tr')].find(r => (r.textContent || '').includes('Test Customer Edited'));
    if (!row) throw new Error('Test Customer Edited row not found for delete');

    const delBtn = row.querySelector('button:enabled') && ([...row.querySelectorAll('button')].find(b => /delete/i.test(b.textContent || '') || /remove/i.test(b.textContent || '')));
    if (!delBtn) throw new Error('Delete button not found');
    (delBtn as HTMLElement).click();
    await wait(1000);

    const confirm = document.querySelector('button:contains("Confirm")') || document.querySelector('button:contains("Yes")') || document.querySelector('button:contains("Delete")');
    if (confirm) (confirm as HTMLElement).click();
    await wait(3000);

    const gone = ![...document.querySelectorAll('table tbody tr')].some(r => (r.textContent || '').includes('Test Customer Edited'));
    if (gone) results.push(log(8, 'Delete a customer', true));
    else results.push(log(8, 'Delete a customer', false, 'Row still exists after delete'));
  } catch (err) {
    results.push(log(8, 'Delete a customer', false, `${err}`));
  }

  // STEP 9
  try {
    const totalCard = [...document.querySelectorAll('*')].find(el => el.textContent?.includes('Total Customers'));
    const activeCard = [...document.querySelectorAll('*')].find(el => el.textContent?.includes('Active'));
    if (!totalCard || !activeCard) throw new Error('Summary cards missing');

    const totalMatch = /\d+/.test(totalCard.textContent || '');
    const activeMatch = /\d+/.test(activeCard.textContent || '');
    if (!totalMatch || !activeMatch) throw new Error('Summary values are not numeric');
    results.push(log(9, 'Check summary cards', true));
  } catch (err) {
    results.push(log(9, 'Check summary cards', false, `${err}`));
  }

  // STEP 10
  try {
    const errors = [];
    const origError = console.error;
    console.error = (...args) => {
      errors.push(args);
      origError(...args);
    };
    await wait(3000);
    console.error = origError;

    const bad = errors.filter(e => e.some(el => String(el).includes('badgeColors') || String(el).includes('ReferenceError')));
    if (bad.length > 0) {
      results.push(log(10, 'Final console error check', false, JSON.stringify(bad)));
    } else {
      results.push(log(10, 'Final console error check', true));
    }
  } catch (err) {
    results.push(log(10, 'Final console error check', false, `${err}`));
  }

  const passed = results.filter(r => r.pass).length;
  const failed = results.length - passed;
  console.log('=== CUSTOMERS PAGE TEST SUMMARY ===');
  console.log(`Passed: ${passed}/${results.length}`);
  console.log(`Failed: ${failed}/${results.length}`);
  if (failed > 0) {
    const detail = results.filter(r => !r.pass).map(r => `STEP ${r.step}: ${r.errMsg}`).join(' | ');
    console.log('Details:', detail);
  }

  return { results, passed, failed };
}

runCustomerPageFlow().catch(err => {
  console.error('Uncaught error in customers-page.autoglm.ts', err);
});
