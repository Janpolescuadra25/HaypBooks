const playwright = require('playwright');

(async () => {
  const browser = await playwright.chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('navigating to /signup?showSignup=1');
  await page.goto('http://localhost:3000/signup?showSignup=1');
  await page.waitForTimeout(1000);
  console.log('clicking role button');
  const roleBtn = await page.locator('button', { hasText: 'My Business' }).first();
  if (await roleBtn.count() === 0) {
    console.log('No role button found');
  } else {
    await roleBtn.click();
  }
  await page.waitForTimeout(2000);
  const html = await page.content();
  require('fs').writeFileSync('test-results/signup-after-role.html', html);
  await page.screenshot({ path: 'test-results/signup-after-role.png', fullPage: true });
  console.log('wrote artifacts');
  await browser.close();
})();