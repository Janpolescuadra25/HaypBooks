const fetch = globalThis.fetch || require('undici').fetch;
const base = 'http://localhost:4000';
(async () => {
  const email = 'e2e-test-check-' + Date.now() + '@haypbooks.test';
  const password = 'Ninetails45***';

  const signup = await fetch(`${base}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name: 'Check', phone: '+15555501001' }),
  });
  const signupBody = await signup.json();
  const otp = signupBody.otp;

  const complete = await fetch(`${base}/api/auth/complete-signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ signupToken: signupBody.signupToken, code: otp, method: 'email' }),
  });
  const completeBody = await complete.json();
  const token = completeBody.token;
  console.log('token present', !!token);

  await fetch(`${base}/api/onboarding/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ step: 'business', data: { companyName: 'OwnerCo' } }),
  });
  const compCompleteResp = await fetch(`${base}/api/onboarding/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ type: 'full', hub: 'OWNER' }),
  });
  const compCompleteBody = await compCompleteResp.json();
  console.log('onboarding complete', compCompleteBody);
  const companyId = compCompleteBody.company?.id;
  console.log('companyId', companyId);

  const recent = await fetch(`${base}/api/companies/recent`, { headers: { Authorization: `Bearer ${token}` } });
  console.log('recent', recent.status, await recent.text());

  const seed = await fetch(`${base}/api/companies/${companyId}/accounting/accounts/seed-default`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  console.log('seed status', seed.status, await seed.text());
})();
