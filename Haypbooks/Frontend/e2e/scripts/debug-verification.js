const { chromium } = require('playwright');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  // create user and login via backend API
  const email = `e2e-debug-${Date.now()}@haypbooks.test`;
  const phone = '+15551234567';
  const password = 'DemoPass!23';

  // create user
  let res = await (await page.request.post('http://127.0.0.1:4000/api/test/create-user', { data: { email, password, name: 'Debug', phone } })).json();
  console.log('create-user', res);

  // create otp
  res = await (await page.request.post('http://127.0.0.1:4000/api/test/create-otp', { data: { phone, otp: '654321', purpose: 'VERIFY_PHONE' } })).json();
  console.log('create-otp', res);

  // login
  const loginRes = await page.request.post('http://127.0.0.1:4000/api/auth/login', { data: { email, password } });
  const loginJson = await loginRes.json();
  console.log('login', loginJson.user && loginJson.user.email);

  await context.addCookies([
    { name: 'token', value: loginJson.token, url: 'http://localhost', httpOnly: true },
    { name: 'refreshToken', value: loginJson.refreshToken, url: 'http://localhost', httpOnly: true },
    { name: 'email', value: loginJson.user.email, url: 'http://localhost' },
    { name: 'userId', value: String(loginJson.user.id), url: 'http://localhost' },
    { name: 'role', value: loginJson.user.role || '', url: 'http://localhost' },
  ]);

  await page.addInitScript(() => { window.__API_BASE_URL = '' });
  await page.goto('http://localhost:3000/verification');
  await page.waitForLoadState('networkidle');
  await page.screenshot({ path: 'e2e/screenshots/debug-verification.png', fullPage: true });
  const html = await page.content();
  fs.writeFileSync('e2e/screenshots/debug-verification.html', html);
  console.log('Saved screenshot and html');
  await browser.close();
})();
