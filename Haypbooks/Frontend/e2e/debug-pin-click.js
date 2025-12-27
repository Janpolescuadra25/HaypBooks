const { chromium } = require('playwright');
const fs = require('fs');
(async function() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const email = `debug-${Date.now()}@haypbooks.test`;
  const password = 'DebugPass!23';

  // create user and login
  const signupRes = await fetch('http://localhost:4000/api/auth/signup', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password, name: 'Debug User' }) });
  const signup = await signupRes.json().catch(() => null);
  console.log('signup ok', signupRes.ok, 'devOtp', signup?._devOtp);

  const loginRes = await fetch('http://localhost:4000/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password }) });
  const loginJson = await loginRes.json();
  console.log('login ok', loginRes.ok, 'token?', !!loginJson.token);

  await context.addCookies([
    { name: 'token', value: loginJson.token, domain: 'localhost', path: '/' },
    { name: 'email', value: loginJson.user.email, domain: 'localhost', path: '/' },
    { name: 'userId', value: String(loginJson.user.id), domain: 'localhost', path: '/' },
  ]);

  await page.goto('http://localhost:3000/verification?email=' + encodeURIComponent(email));
  await page.screenshot({ path: 'verification-before.png', fullPage: true });
  console.log('before screenshot saved');

  const pinBtn = await page.$('text=Enter Your PIN');
  console.log('pinBtn found?', !!pinBtn);
  if (pinBtn) await pinBtn.click();

  await page.screenshot({ path: 'verification-after-click.png', fullPage: true });
  console.log('after screenshot saved');

  // Print visible text in main content
  const mainText = await page.evaluate(() => document.querySelector('main')?.innerText || 'NO MAIN');
  console.log('main text:', mainText.substr(0, 1000));

  await browser.close();
})();