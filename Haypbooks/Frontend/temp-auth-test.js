const fetch = globalThis.fetch || require('node-fetch');
const base = 'http://localhost:4000';
(async () => {
  const email = `e2e-test-${Date.now()}@haypbooks.test`;
  const password = 'Ninetails45***';
  console.log('Signup attempt', email);

  let res = await fetch(`${base}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name: 'E2E User', phone: '+15555501001' }),
  });
  console.log('signup status', res.status);
  const signupBody = await res.json();
  console.log('signup body', signupBody);
  if (!signupBody.signupToken) {
    console.log('No signupToken, exiting.');
    return;
  }

  res = await fetch(`${base}/api/auth/complete-signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ signupToken: signupBody.signupToken, code: signupBody.otp, method: 'email' }),
  });
  console.log('complete-signup status', res.status);
  const completeBody = await res.json();
  console.log('complete-signup body', completeBody);
  if (!completeBody.token) {
    console.log('No token from complete-signup.');
    return;
  }

  const token = completeBody.token;
  console.log('token length', token.length);

  res = await fetch(`${base}/api/companies/current`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('companies/current status', res.status);
  const companiesBody = await res.text();
  console.log('companies/current body', companiesBody);

  res = await fetch(`${base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: 'WrongPassword123' }),
  });
  console.log('invalid-password status', res.status);
  console.log('invalid-password body', await res.text());

  res = await fetch(`${base}/api/companies/current`, { method: 'GET' });
  console.log('no-token status', res.status);
  console.log('no-token body', await res.text());
})();
