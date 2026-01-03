const { chromium } = require('playwright');

async function okJson(req) {
  try { return await req.json(); } catch (e) { return { _text: await req.text() } }
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const ts = Date.now();
  const email = `e2e-refresh-${ts}@haypbooks.test`;
  const phone = '+15550009999';
  const password = 'RefreshPass!23';

  console.log('\n== Create user via test helper ==');
  await page.request.post('http://127.0.0.1:4000/api/test/create-user', { data: { email, password, name: 'Refresh Debug', phone, isEmailVerified: true } });

  // login via backend
  console.log('\n== Login -> token/refresh from backend ==');
  const loginRes = await page.request.post('http://127.0.0.1:4000/api/auth/login', { data: { email, password } });
  const loginJson = await okJson(loginRes);
  console.log('login tokens prefix:', loginJson.refreshToken ? loginJson.refreshToken.substring(0, 20) : null);

  console.log('\n== Inspect sessions for email (test endpoint) ==');
  const sessionsRes = await page.request.get(`http://127.0.0.1:4000/api/test/sessions?email=${encodeURIComponent(email)}`);
  const sessions = await okJson(sessionsRes);
  console.log('sessions:', sessions);
  // Quick sanity: ensure the refreshToken we saw in login equals the session's refresh token
  if (sessions && Array.isArray(sessions) && sessions.length > 0) {
    console.log('login.refreshToken equals session.refreshToken?', sessions[0].refreshToken === loginJson.refreshToken);
    console.log('login token prefix', String(loginJson.refreshToken || '').slice(0,24));
    console.log('session token prefix', String(sessions[0].refreshToken || '').slice(0,24));
  }

  // Add cookies for localhost:3000 so browser-based fetch uses them
  await context.addCookies([
    { name: 'token', value: loginJson.token, url: 'http://localhost:3000', httpOnly: true },
    { name: 'refreshToken', value: loginJson.refreshToken, url: 'http://localhost:3000', httpOnly: true }
  ]);

  // Confirm cookies exist in the context
  const currentCookies = await context.cookies();
  console.log('\ncontext cookies:', currentCookies.map(c => ({ name: c.name, domain: c.domain, path: c.path })));

  // Open a fresh page and navigate to base so cookies are attached in a stable context
  const page2 = await context.newPage();
  try {
    await page2.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 120000 });
  } catch (e) {
    console.warn('page2.goto timed out or failed, proceeding to fetch test and setting a minimal page content');
    try { await page2.setContent('<!doctype html><html><body></body></html>') } catch (e) { /* ignore */ }
  }

  // Try a page.evaluate fetch (should include cookies)
  const res = await page2.evaluate(async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const r = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include', signal: controller.signal });
      let body;
      try { body = await r.json(); } catch (e) { body = await r.text(); }
      return { status: r.status, body };
    } catch (err) {
      return { status: 0, body: String(err) };
    } finally { clearTimeout(timeout); }
  });

  console.log('\nrefresh via frontend (page evaluate) status:', res.status);
  console.log('refresh via frontend (page evaluate) body:', res.body);

  // Direct POST via Playwright request API with explicit Cookie header (debug only)
  console.log('\n== Direct requests to Next proxy (127.0.0.1:3000) and backend (127.0.0.1:4000) ==');
  const proxyDirect = await page.request.post('http://127.0.0.1:3000/api/auth/refresh', { headers: { cookie: `refreshToken=${loginJson.refreshToken}; token=${loginJson.token}` } });
  const proxyDirectBody = await okJson(proxyDirect);
  console.log('proxy direct status:', proxyDirect.status());
  console.log('proxy direct body:', proxyDirectBody);

  const backendDirect = await page.request.post('http://127.0.0.1:4000/api/auth/refresh', { headers: { cookie: `refreshToken=${loginJson.refreshToken}; token=${loginJson.token}` } });
  const backendDirectBody = await okJson(backendDirect);
  console.log('backend direct status:', backendDirect.status());
  console.log('backend direct body:', backendDirectBody);

  // Ask security-events for any refresh failure events (dev helps us debug)
  try {
    const eventsRes = await page.request.get('http://127.0.0.1:4000/api/auth/security-events', { headers: { Authorization: `Bearer ${loginJson.token}` } });
    const events = await okJson(eventsRes);
    console.log('security events (recent) filtered for REFRESH failures:', events.filter(e => e.type && String(e.type).startsWith('REFRESH')));
  } catch (e) {
    console.warn('security events fetch failed:', String(e))
  }

  // If refresh succeeded, try logout and ensure session gone
  if (backendDirect.status() === 200) {
    console.log('\n== Refresh success. Now try logout and verify session deleted ==');
    await page.request.post('http://127.0.0.1:4000/api/auth/logout');
    const afterLogoutSessions = await page.request.get(`http://127.0.0.1:4000/api/test/sessions?email=${encodeURIComponent(email)}`);
    console.log('sessions after logout:', await okJson(afterLogoutSessions));
  }

  // Test forgot-password + reset flow
  console.log('\n== Forgot-password & reset flow ==');
  await page.request.post('http://127.0.0.1:4000/api/auth/forgot-password', { data: { email } });
  const otpRow = await (await page.request.get(`http://127.0.0.1:4000/api/test/otp/latest?email=${encodeURIComponent(email)}&purpose=RESET`)).json();
  console.log('otpRow for reset:', otpRow);
  // Verify OTP (generic verify endpoint)
  await page.request.post('http://127.0.0.1:4000/api/auth/verify-otp', { data: { email, otpCode: otpRow.otpCode } });
  // Create a fresh OTP for final reset
  await page.request.post('http://127.0.0.1:4000/api/auth/forgot-password', { data: { email } });
  const otpRow2 = await (await page.request.get(`http://127.0.0.1:4000/api/test/otp/latest?email=${encodeURIComponent(email)}&purpose=RESET`)).json();
  const newPassword = 'NewPass123!';
  await page.request.post('http://127.0.0.1:4000/api/auth/reset-password', { data: { email, otpCode: otpRow2.otpCode, password: newPassword } });
  // Verify new password works
  const login2 = await page.request.post('http://127.0.0.1:4000/api/auth/login', { data: { email, password: newPassword } });
  console.log('login with new password status:', login2.status());

  // Test signup -> verify email OTP -> login
  console.log('\n== Signup + verify-email flow ==');
  const signEmail = `e2e-signup-${Date.now()}@haypbooks.test`;
  await page.request.post('http://127.0.0.1:4000/api/auth/signup', { data: { email: signEmail, password: 'SignupPass!23', name: 'Signup E2E', phone } });
  // Read latest OTP without specifying purpose (safer and matches how tests fetch it)
  const otpSign = await (await page.request.get(`http://127.0.0.1:4000/api/test/otp/latest?email=${encodeURIComponent(signEmail)}`)).json();
  console.log('signup otp:', otpSign);
  if (otpSign && otpSign.otpCode) {
    await page.request.post('http://127.0.0.1:4000/api/auth/verify-otp', { data: { email: signEmail, otpCode: otpSign.otpCode } });
  } else {
    console.warn('No OTP found for signup; skipping verify step')
  }
  const loginSignup = await page.request.post('http://127.0.0.1:4000/api/auth/login', { data: { email: signEmail, password: 'SignupPass!23' } });
  console.log('signup/login status:', loginSignup.status());

  // Security events check
  console.log('\n== Security events check ==');
  const tokenForEvents = (await login2.json()).token;
  const events = await (await page.request.get('http://127.0.0.1:4000/api/auth/security-events', { headers: { Authorization: `Bearer ${tokenForEvents}` } })).json();
  console.log('security events sample:', events.slice(0,3));

  await browser.close();
})();