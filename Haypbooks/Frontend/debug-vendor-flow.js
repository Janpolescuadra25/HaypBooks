const { chromium } = require('playwright');

(async () => {
  const frontend = 'http://127.0.0.1:3000';
  const email = 'e2e-ap-debug-' + Date.now() + '@haypbooks.test';
  const password = 'Password1!';
  const companyId = 'fb9e86da-da3f-4668-a383-061fd644e43e';
  const vendorName = 'E2E Vendor ' + Date.now();
  const vendorEmail = 'vendor-' + Date.now() + '@haypbooks.test';
  const vendorPhone = '(555) 123-4567';
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('request', req => {
    if (req.url().includes('/api/companies/') || req.url().includes('/api/auth/')) {
      console.log('REQ', req.method(), req.url());
    }
  });

  page.on('response', async res => {
    if (res.url().includes('/api/companies/') || res.url().includes('/api/auth/')) {
      console.log('RES', res.status(), res.url());
      if (res.status() >= 400) {
        try { console.log(await res.text()); } catch (e) { console.log('RESPERR', e.message); }
      }
    }
  });

  await page.goto(`${frontend}/login?showLogin=1`);
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(url => !url.toString().includes('/login'), { timeout: 15000 }).catch(() => null);
  console.log('after login', page.url());

  await page.goto(`${frontend}/expenses/vendors?company=${companyId}`);
  console.log('vendors page', page.url());
  await page.waitForSelector('h1:has-text("Vendors")', { timeout: 15000 });
  await page.click('button:has-text("New Vendor")');
  await page.fill('input[placeholder="Vendor name"]', vendorName);
  await page.fill('input[placeholder="email@example.com"]', vendorEmail);
  await page.fill('input[placeholder="(123) 456-7890"]', vendorPhone);
  await Promise.all([
    page.waitForResponse(response => response.url().includes('/ap/vendors') && response.request().method() === 'GET', { timeout: 15000 }).catch(() => null),
    page.click('button:has-text("Save")'),
  ]);
  console.log('after save', await page.url());
  await page.screenshot({ path: 'debug-vendor-save.png', fullPage: true });
  await browser.close();
})();
