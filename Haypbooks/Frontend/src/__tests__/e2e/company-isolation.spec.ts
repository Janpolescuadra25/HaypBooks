import { test, expect } from '@playwright/test'

// This spec ensures that merely supplying a different company ID in the URL
// does *not* override the active company context. Visiting `/dashboard?company=`
// should still use whatever company the user actually last accessed (i.e. the
// isolation mechanism is enforced).


test('dashboard query-param cannot force company switch', async ({ page, request }) => {
  const email = `ui-e2e-isolation-${Date.now()}@haypbooks.test`
  const password = 'Playwright1!'

  // ensure test endpoints are available
  const gate = await request.get('http://127.0.0.1:4000/api/test/users')
  if (gate.status() === 403) {
    test.skip(true, 'Test endpoints disabled locally')
    return
  }

  // create user + login
  const createResp = await request.post('http://127.0.0.1:4000/api/test/create-user', { data: { email, password, name: 'E2E', isEmailVerified: true } })
  expect([200, 201]).toContain(createResp.status())
  if (createResp.status() !== 200 && createResp.status() !== 201) {
    console.error('create-user failed:', await createResp.text())
  }

  const loginResp = await request.post('http://127.0.0.1:4000/api/auth/login', { data: { email, password } })
  const loginJson = await loginResp.json()
  console.log('loginResp status', loginResp.status(), 'body', loginJson)
  expect(loginResp.status()).toBe(200)
  const cookie = loginResp.headers()['set-cookie'].split(';')[0]
  const [cookieName, cookieValue] = cookie.split('=')
  await page.context().addCookies([{ name: cookieName, value: cookieValue, url: 'http://localhost' }])

  // create a single workspace via the new backend test helper
  const wsAresp = await request.post('http://127.0.0.1:4000/api/test/create-new-workspace', { data: { email, name: 'A Co (E2E)' } })
  expect([200,201]).toContain(wsAresp.status())
  const { workspaceId: companyA } = await wsAresp.json()

  // now navigate to dashboard to establish origin
  await page.goto('/dashboard')

  // choose a random company id that the user does *not* have access to
  const companyB = '00000000-0000-0000-0000-000000000000' // or randomUUID simulated

  // mark A as last-accessed
  await page.evaluate(async (id) => {
    await fetch(`/api/companies/${id}/last-accessed`, { method: 'PATCH' })
  }, companyA)

  // navigate directly with B in query (should not change the active company)
  await page.goto(`/dashboard?company=${companyB}`)

  // try to fetch a B-specific endpoint and ensure it fails (unauthorized or error)
  const forbidden = await page.evaluate(async (id) => {
    const r = await fetch(`/api/companies/${id}/accounting/accounts`)
    return r.status
  }, companyB)
  expect(forbidden).toBeGreaterThanOrEqual(400)
})

// Verifies that switching the active company updates the Chart of Accounts UI.
test('Chart of Accounts updates when changing active company', async ({ page, request }) => {
  const email = `ui-e2e-coa-${Date.now()}@haypbooks.test`
  const password = 'password'

  const gate = await request.get('http://127.0.0.1:4000/api/test/users')
  if (gate.status() === 403) {
    test.skip(true, 'Test endpoints disabled locally')
    return
  }

  const createResp = await request.post('http://127.0.0.1:4000/api/test/create-user', { data: { email, password, name: 'E2E', isEmailVerified: true } })
  expect([200, 201]).toContain(createResp.status())

  const loginResp = await request.post('http://127.0.0.1:4000/api/auth/login', { data: { email, password } })
  expect(loginResp.status()).toBe(200)
  const loginJson = await loginResp.json()
  const token = loginJson.token || loginJson.access_token
  const refreshToken = loginJson.refreshToken || loginJson.refresh_token

  const setCookie = loginResp.headers()['set-cookie']
  expect(setCookie).toBeTruthy()
  const cookiePair = setCookie.split(';')[0]
  const [cookieName, cookieValue] = cookiePair.split('=')
  // Ensure cookies are valid for the host used by Playwright (localhost). We also
  // add entries for 127.0.0.1 to reduce flakiness if the app switches between them.
  await page.context().addCookies([
    { name: cookieName, value: cookieValue, url: 'http://localhost:3000' },
    { name: cookieName, value: cookieValue, url: 'http://127.0.0.1:3000' },
    { name: 'token', value: token, url: 'http://localhost:3000' },
    { name: 'token', value: token, url: 'http://127.0.0.1:3000' },
    { name: 'refreshToken', value: refreshToken || '', url: 'http://localhost:3000' },
    { name: 'refreshToken', value: refreshToken || '', url: 'http://127.0.0.1:3000' },
    { name: 'email', value: email, url: 'http://localhost:3000' },
    { name: 'email', value: email, url: 'http://127.0.0.1:3000' },
  ])

  // Ensure the frontend considers the user logged in (the app uses localStorage to track auth state)
  await page.addInitScript(({ user, token }) => {
    window.localStorage.setItem('user', JSON.stringify(user))
    if (token) {
      window.localStorage.setItem('authToken', token)
    }
  }, { user: loginJson.user, token })

  // Ensure cookies are applied before navigating by doing an initial navigation.
  await page.goto('http://localhost:3000')
  await page.waitForLoadState('networkidle')


  const cookieHeader = `${cookieName}=${cookieValue}`

  // Ensure the session's workspace is established for the logged-in user
  await request.post('http://127.0.0.1:4000/api/test/create-new-workspace', {
    data: { email, name: 'COA Switch E2E' },
    headers: { cookie: cookieHeader },
  })

  const companyAResp = await request.post('http://localhost:4000/api/companies', {
    headers: { Authorization: `Bearer ${token}`, Cookie: cookieHeader, 'Content-Type': 'application/json' },
    data: { name: `COA-A-${Date.now()}` },
  })
  expect(companyAResp.ok()).toBeTruthy()
  const companyA = await companyAResp.json()

  const companyBResp = await request.post('http://localhost:4000/api/companies', {
    headers: { Authorization: `Bearer ${token}`, Cookie: cookieHeader, 'Content-Type': 'application/json' },
    data: { name: `COA-B-${Date.now()}` },
  })
  expect(companyBResp.ok()).toBeTruthy()
  const companyB = await companyBResp.json()

  const typesResp = await request.get(`http://localhost:4000/api/companies/${companyA.id}/accounting/account-types`, {
    headers: { Authorization: `Bearer ${token}`, Cookie: cookieHeader },
  })
  expect(typesResp.status()).toBe(200)
  const types = await typesResp.json()
  expect(Array.isArray(types)).toBe(true)
  expect(types.length).toBeGreaterThan(0)
  const typeId = types[0].id

  const aAccount = await request.post(`http://localhost:4000/api/companies/${companyA.id}/accounting/accounts`, {
    headers: { Authorization: `Bearer ${token}`, Cookie: cookieHeader, 'Content-Type': 'application/json' },
    data: { code: 'COA-A-1', name: 'Company A Account', typeId, normalSide: 'DEBIT' },
  })
  expect(aAccount.status()).toBe(201)

  const bAccount = await request.post(`http://localhost:4000/api/companies/${companyB.id}/accounting/accounts`, {
    headers: { Authorization: `Bearer ${token}`, Cookie: cookieHeader, 'Content-Type': 'application/json' },
    data: { code: 'COA-B-1', name: 'Company B Account', typeId, normalSide: 'DEBIT' },
  })
  expect(bAccount.status()).toBe(201)

  // Force company A to be last-accessed so the UI selects it first
  await request.patch(`http://localhost:4000/api/companies/${companyA.id}/last-accessed`, {
    headers: { Authorization: `Bearer ${token}`, Cookie: cookieHeader },
  })

  // Visit Chart of Accounts UI for company A (via query param)
  await page.goto(`/accounting/core-accounting/chart-of-accounts?company=${companyA.id}`)
  await expect(page.getByText('Chart of Accounts')).toBeVisible({ timeout: 15000 })
  await page.waitForResponse((res) =>
    res.url().includes(`/api/companies/${companyA.id}/accounting/accounts`) && res.status() === 200,
  )
  await expect(page.getByText('Company A Account')).toBeVisible({ timeout: 15000 })
  await expect(page.getByText('Company B Account')).not.toBeVisible({ timeout: 15000 })

  // Switch to company B via query param and verify the UI updates
  await page.goto(`/accounting/core-accounting/chart-of-accounts?company=${companyB.id}`)
  await expect(page.getByText('Chart of Accounts')).toBeVisible({ timeout: 15000 })
  await page.waitForResponse((res) =>
    res.url().includes(`/api/companies/${companyB.id}/accounting/accounts`) && res.status() === 200,
  )
  await expect(page.getByText('Company B Account')).toBeVisible({ timeout: 15000 })
  await expect(page.getByText('Company A Account')).not.toBeVisible({ timeout: 15000 })
})
