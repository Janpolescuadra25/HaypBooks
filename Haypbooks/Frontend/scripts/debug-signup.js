const playwright = require('playwright');

(async () => {
  const browser = await playwright.chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));

  console.log('navigating to /signup?showSignup=1');
  await page.goto('http://localhost:3000/signup?showSignup=1');
  await page.waitForTimeout(5000);
  const url = page.url();
  console.log('URL after load:', url);
  const html = await page.content();
  console.log('PAGE HTML length:', html.length);
  // Try to find firstName input
  const hasFirstName = await page.$('#firstName');
  console.log('Has #firstName element?', !!hasFirstName);

  await browser.close();
})();