import { test, expect } from '@playwright/test'

// Validates that the Chart of Accounts UI is tied to the active company context.
// When the user switches company, the COA list should update to show the new company's accounts.

test('Chart of Accounts reflects active company selection', async ({ page, request }) => {
  const email = `ui-e2e-company-switch-${Date.now()}@haypbooks.test`
  const password = 'Playwright1!'

  // Skip if test endpoints are disabled locally
  const gate = await request.get('http://127.0.0.1:4000/api/test/users')
  if (gate.status() === 403) {
    test.skip(true, 'Test endpoints disabled locally; enable ALLOW_TEST_ENDPOINTS or run in CI')
    return
  }

  // Ensure the demo user exists
  await request.post('http://127.0.0.1:4000/api/test/create-user', { data: { email, password, name: 'E2E', isEmailVerified: true } })

  // Log in via API and attach session cookies to the browser context
  const loginResp = await request.post('http://127.0.0.1:4000/api/auth/login', { data: { email, password } })
  expect(loginResp.status()).toBe(200)
  const loginJson = await loginResp.json()
  const token = loginJson.token || loginJson.access_token
  const refreshToken = loginJson.refreshToken || loginJson.refresh_token

  const meResp = await request.get('http://127.0.0.1:4000/api/users/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  expect(meResp.status()).toBe(200)
  const meJson = await meResp.json()
  let workspaceId: string | undefined = meJson?.ownedWorkspaceId

  // Ensure a workspace exists (create if needed / missing)
  if (!workspaceId) {
    const wsResp = await request.post('http://127.0.0.1:4000/api/test/create-new-workspace', {
      data: { email, name: 'COA Switch E2E' },
    })
    expect([200, 201]).toContain(wsResp.status())
    const wsJson = await wsResp.json()
    console.log('create-new-workspace response:', JSON.stringify(wsJson))

    // Refresh profile after workspace creation
    const me2 = await request.get('http://127.0.0.1:4000/api/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(me2.status()).toBe(200)
    const me2Json = await me2.json()
    console.log('me after ws create:', JSON.stringify(me2Json))
    workspaceId = me2Json?.ownedWorkspaceId
  }

  expect(workspaceId).toBeTruthy()

  const setCookie = loginResp.headers()['set-cookie']
  expect(setCookie).toBeTruthy()
  const cookiePair = setCookie.split(';')[0]
  const [cookieName, cookieValue] = cookiePair.split('=')
  await page.context().addCookies([
    { name: cookieName, value: cookieValue, url: 'http://127.0.0.1:3000' },
    { name: cookieName, value: cookieValue, url: 'http://localhost:3000' },
    { name: 'token', value: token, url: 'http://127.0.0.1:3000' },
    { name: 'token', value: token, url: 'http://localhost:3000' },
    { name: 'refreshToken', value: refreshToken || '', url: 'http://127.0.0.1:3000' },
    { name: 'refreshToken', value: refreshToken || '', url: 'http://localhost:3000' },
    { name: 'email', value: email, url: 'http://127.0.0.1:3000' },
    { name: 'email', value: email, url: 'http://localhost:3000' },
  ])

  // Ensure the frontend considers the user logged in (the app uses localStorage to track auth state)
  await page.addInitScript(({ user, token }) => {
    window.localStorage.setItem('user', JSON.stringify(user));
    if (token) {
      window.localStorage.setItem('authToken', token);
    }
  }, { user: meJson, token });

  // Create two companies within the user's workspace
  const companyAResp = await request.post('http://localhost:4000/api/companies', {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    data: { workspaceId, name: `COA-A-${Date.now()}` },
  })
  expect(companyAResp.ok()).toBeTruthy()
  const companyA = await companyAResp.json()

  const companyBResp = await request.post('http://localhost:4000/api/companies', {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    data: { workspaceId, name: `COA-B-${Date.now()}` },
  })
  expect(companyBResp.ok()).toBeTruthy()
  const companyB = await companyBResp.json()

  // Pick an AccountType for creating accounts
  const typesResp = await request.get(`http://localhost:4000/api/companies/${companyA.id}/accounting/account-types`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  expect(typesResp.status()).toBe(200)
  const types = await typesResp.json()
  expect(Array.isArray(types)).toBe(true)
  expect(types.length).toBeGreaterThan(0)
  const typeId = types[0].id

  // Create one account per company via API
  const aAccount = await request.post(`http://localhost:4000/api/companies/${companyA.id}/accounting/accounts`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    data: { code: 'COA-A-1', name: 'Company A Account', typeId, normalSide: 'DEBIT' },
  })
  expect(aAccount.status()).toBe(201)

  const bAccount = await request.post(`http://localhost:4000/api/companies/${companyB.id}/accounting/accounts`, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    data: { code: 'COA-B-1', name: 'Company B Account', typeId, normalSide: 'DEBIT' },
  })
  expect(bAccount.status()).toBe(201)

  // Visit Chart of Accounts UI for company A (via query param)
  await page.goto(`/accounting/core-accounting/chart-of-accounts?company=${companyA.id}`)
  await expect(page.getByText('Chart of Accounts')).toBeVisible({ timeout: 15000 })
  await page.waitForResponse((res) =>
    res.url().includes(`/api/companies/${companyA.id}/accounting/accounts`) && res.status() === 200,
  )

  // Now switch to company B via query param and verify the UI requests company B's accounts
  await page.goto(`/accounting/core-accounting/chart-of-accounts?company=${companyB.id}`)
  await expect(page.getByText('Chart of Accounts')).toBeVisible({ timeout: 15000 })
  await page.waitForResponse((res) =>
    res.url().includes(`/api/companies/${companyB.id}/accounting/accounts`) && res.status() === 200,
  )
})
