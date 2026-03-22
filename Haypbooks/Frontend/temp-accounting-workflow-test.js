const fetch = globalThis.fetch || require('undici').fetch;
const base = 'http://localhost:4000';

async function run() {
  const email = `e2e-test-${Date.now()}@haypbooks.test`;
  const password = 'Ninetails45***';
  console.log('Starting end-to-end accounting workflow with user:', email);

  // Signup + complete signup
  let res = await fetch(`${base}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name: 'E2E Accounting User', phone: '+15555501001' }),
  });
  const signupText = await res.text();
  console.log('signup status', res.status, 'body', signupText);
  let signupBody;
  try { signupBody = JSON.parse(signupText); } catch (e) { throw new Error('Signup body not JSON: ' + signupText); }
  if (!signupBody.signupToken) throw new Error('Signup did not return signupToken: ' + JSON.stringify(signupBody));

  res = await fetch(`${base}/api/auth/complete-signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ signupToken: signupBody.signupToken, code: signupBody.otp, method: 'email' }),
  });
  const completeText = await res.text();
  console.log('complete-signup status', res.status, 'body', completeText);
  let completeBody;
  try { completeBody = JSON.parse(completeText); } catch (e) { throw new Error('Complete signup body not JSON: ' + completeText); }
  if (!completeBody.token) throw new Error('Complete-signup did not return token: ' + JSON.stringify(completeBody));

  const token = completeBody.token;
  console.log('Token received (length):', token.length);

  // Run onboarding for company creation before accessing company endpoints
  res = await fetch(`${base}/api/onboarding/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ step: 'business', data: { companyName: 'E2E Company' } }),
  });
  console.log('onboarding/save status', res.status, await res.text());

  res = await fetch(`${base}/api/onboarding/complete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ type: 'full', hub: 'OWNER' }),
  });
  const onboardText = await res.text();
  console.log('onboarding/complete status', res.status, onboardText);
  let onboardingCompleteBody;
  try { onboardingCompleteBody = JSON.parse(onboardText); } catch (e) { throw new Error('onboarding complete body not JSON: ' + onboardText); }

  // Step 1: Company ID is taken from onboarding complete response if available
  let companyId = onboardingCompleteBody?.company?.id || completeBody.company?.id
  if (!companyId) {
    // Fallback: try companies/current
    res = await fetch(`${base}/api/companies/current`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    });
    const companyText = await res.text();
    console.log('companies/current status', res.status, 'body', companyText);
    if (res.status === 200 && companyText && companyText.trim()) {
      const companyObj = JSON.parse(companyText);
      companyId = companyObj?.id;
    }
  }
  if (!companyId) {
    throw new Error('No accessible company found after onboarding')
  }
  console.log('Using companyId', companyId);

  // Step 2: Seed default accounts
  res = await fetch(`${base}/api/companies/${companyId}/accounting/accounts/seed-default`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const seedText = await res.text();
  console.log('seed-default status', res.status, 'body', seedText);
  if (res.status !== 200) throw new Error('seed-default failed: ' + seedText);
  const seedBody = JSON.parse(seedText);

  // Step 3: List accounts
  res = await fetch(`${base}/api/companies/${companyId}/accounting/accounts`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  const accountsText = await res.text();
  console.log('accounts list status', res.status, 'body', accountsText.substring(0, 1000));
  if (res.status !== 200) throw new Error('accounts list failed: ' + accountsText);
  const accounts = JSON.parse(accountsText);
  if (!Array.isArray(accounts) || accounts.length < 2) throw new Error('accounts list validation failed');

  const cash = accounts.find((a) => /cash/i.test(a.name));
  const revenue = accounts.find((a) => /sales|revenue/i.test(a.name));
  if (!cash || !revenue) throw new Error('Missing expected accounts in COA for cash/revenue');

  // Step 4: Create journal entry
  const jePayload = {
    date: new Date().toISOString().substring(0, 10),
    description: 'Test Journal Entry via script',
    lines: [
      { accountId: cash.id, debit: 100, credit: 0 },
      { accountId: revenue.id, debit: 0, credit: 100 },
    ],
  };
  res = await fetch(`${base}/api/companies/${companyId}/accounting/journal-entries`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(jePayload),
  });
  const createdJE = await res.json();
  console.log('create journal entry status', res.status, createdJE);
  if (res.status !== 201 || !createdJE.id) throw new Error('journal entry create failed');

  // Step 5: Post journal entry
  res = await fetch(`${base}/api/companies/${companyId}/accounting/journal-entries/${createdJE.id}/post`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const postBody = await res.json();
  console.log('post journal entry status', res.status, postBody);
  if (res.status !== 200) throw new Error('journal entry post failed');

  // Optional: verify user can retrieve trial balance and journal entry status
  res = await fetch(`${base}/api/companies/${companyId}/accounting/journal-entries/${createdJE.id}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  const retrieved = await res.json();
  console.log('get journal entry status', res.status, retrieved.status);
  if (res.status !== 200 || retrieved.Status && retrieved.Status !== 'POSTED') {
    console.log('journal entry may not be posted yet');
  }

  res = await fetch(`${base}/api/companies/${companyId}/accounting/trial-balance`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });
  const tb = await res.json();
  console.log('trial balance status', res.status, 'entries', Array.isArray(tb) ? tb.length : 'no-array');

  console.log('All accounting workflow steps succeeded.');
}

run().catch((err) => {
  console.error('Workflow failed:', err.message || err);
  process.exit(1);
});
