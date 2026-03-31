const fetch = require('node-fetch')
;(async () => {
  const email = process.argv[2] || 'e2e.owner+fix@test.local'
  const base = process.env.BACKEND_URL || 'http://localhost:4000'
  console.log('Using backend', base)
  const createRes = await fetch(base + '/api/test/create-user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password: 'Password1!', isEmailVerified: true, name: 'E2E Owner Fix' }) })
  console.log('create-user status', createRes.status)
  const createBody = await createRes.text()
  console.log('create-user body', createBody)

  const onboardRes = await fetch(base + '/api/test/force-run-onboarding', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, companyName: 'Test Company Inc' }) })
  console.log('force-run-onboarding status', onboardRes.status)
  const onboardBody = await onboardRes.text()
  console.log('force-run-onboarding body', onboardBody)

  const companiesRes = await fetch(base + '/api/test/companies?email=' + encodeURIComponent(email))
  console.log('companies status', companiesRes.status)
  console.log('companies:', await companiesRes.text())
})().catch(e => { console.error('err', e); process.exit(2) })
