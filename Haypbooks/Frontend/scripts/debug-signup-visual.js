const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE:', msg.text()));

  const email = `visual-e2e-${Date.now()}@haypbooks.test`;
  const password = 'Playwright1!';

  try {
    console.log('goto signup page');
    await page.goto('http://localhost:3000/signup?showSignup=1', { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);

    // If role selection present, click first
    const roleBtn = page.locator('button', { hasText: 'My Business' }).first();
    if (await roleBtn.count()) {
      console.log('clicking role');
      await roleBtn.click();
      await page.waitForTimeout(300);
    }

    // Fill form
    console.log('filling signup form');
    await page.fill('#firstName', 'Visual');
    await page.fill('#lastName', 'E2E');
    await page.fill('#phone', '+63 912 345 6789').catch(()=>{});
    await page.fill('#companyName', 'Visual Corp').catch(()=>{});
    await page.fill('#email', email);
    await page.fill('#password', password);
    await page.fill('#confirmPassword', password);

    // submit
    console.log('click create account');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(()=>{}),
      page.click('text=Create account')
    ]);

    await page.waitForTimeout(500);

    // Capture post-signup screen
    const url = page.url();
    console.log('URL after signup:', url);
    await page.screenshot({ path: 'test-results/visual-post-signup.png', fullPage: true });
    fs.writeFileSync('test-results/visual-post-signup.html', await page.content());

    // Check for selection text
    const selectionText = await page.locator('text=Choose how').first().count();
    console.log('selectionText count:', selectionText);

    if (selectionText) {
      console.log('Selection form present; capturing state');
    } else {
      console.log('Selection form NOT present');
    }

    // If selection present: test Email path
    if (selectionText) {
      await page.locator('label', { hasText: 'Email' }).first().click();
      await page.screenshot({ path: 'test-results/visual-selection-email.png', fullPage: true });
      // Log state for debugging
      const dbg1 = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input[name="method"]'));
        return inputs.map(i => ({ value: i.value, checked: i.checked }))
      });
      console.log('DBG selection inputs:', JSON.stringify(dbg1));
      const dbg2 = await page.evaluate(() => {
        const b = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.trim() === 'Continue');
        return { disabled: b ? b.disabled : null, outer: b ? b.outerHTML : null };
      });
      console.log('DBG continue button:', JSON.stringify(dbg2));
      // Wait for the Continue button within the selection panel to become enabled and click it
      const continueBtn = page.locator('.space-y-3').locator('text=Continue').first();
      await continueBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(()=>{});
      await continueBtn.waitFor({ state: 'enabled', timeout: 5000 }).catch(()=>{});
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(()=>{}),
        page.evaluate(() => { const b = document.querySelector('.space-y-3 button'); if (b) b.click(); })
      ]);
      await page.screenshot({ path: 'test-results/visual-email-otp.png', fullPage: true });
      fs.writeFileSync('test-results/visual-email-otp.html', await page.content());

      // go back and test Phone
      await page.goBack({ waitUntil: 'networkidle' }).catch(()=>{});
      await page.locator('label', { hasText: /SMS|Text|Text Message/i }).first().click();
      await page.screenshot({ path: 'test-results/visual-selection-phone.png', fullPage: true });
      const continueBtnPhone = page.locator('.space-y-3').locator('text=Continue').first();
      await continueBtnPhone.waitFor({ state: 'visible', timeout: 5000 }).catch(()=>{});
      await continueBtnPhone.waitFor({ state: 'enabled', timeout: 5000 }).catch(()=>{});
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(()=>{}),
        page.evaluate(() => { const b = document.querySelector('.space-y-3 button'); if (b) b.click(); })
      ]);
      await page.screenshot({ path: 'test-results/visual-phone-otp.png', fullPage: true });
      fs.writeFileSync('test-results/visual-phone-otp.html', await page.content());
    }

    // If selection not present, try direct navigation to verify page to capture OTP form
    if (!selectionText) {
      console.log('Try direct /verify-otp capture');
      await page.goto('/verify-otp', { waitUntil: 'networkidle' });
      await page.screenshot({ path: 'test-results/visual-verify-otp-direct.png', fullPage: true });
      fs.writeFileSync('test-results/visual-verify-otp-direct.html', await page.content());
    }

    console.log('done visual run');
    await browser.close();
  } catch (err) {
    console.error('ERROR', err);
    await page.screenshot({ path: 'test-results/visual-error.png', fullPage: true }).catch(()=>{});
    fs.writeFileSync('test-results/visual-error.txt', String(err.stack || err));
    await browser.close();
    process.exit(1);
  }
})();