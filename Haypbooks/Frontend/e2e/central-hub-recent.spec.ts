import { test, expect } from '@playwright/test'
console.log('📦 executing central-hub-recent.spec.ts (updated)')

test('Central Hub: CompanySwitcher updates last-accessed and ordering', async ({ page, request }) => {
  // use the seeded demo account which already has a workspace/company
  const email = 'demo@haypbooks.test'
  const password = 'password'

  // If test endpoints are disabled locally, skip this test (CI enables them)
  const gate = await request.get('http://127.0.0.1:4000/api/test/users')
  if (gate.status() === 403) {
    test.skip(true, 'Test endpoints disabled locally; enable ALLOW_TEST_ENDPOINTS or run in CI')
    return
  }

  // demo user already exists; ensure they have a workspace/company via helper
  const wsResp = await request.post('http://127.0.0.1:4000/api/test/create-new-workspace', { data: { email, name: 'A Co (E2E)' } })
  console.log('create-new-workspace status', wsResp.status())
  const wsJson = await wsResp.json().catch(() => null)
  console.log('create-new-workspace body', wsJson)
  // the helper returns workspaceId, but company list will be fetched below

  // optional: you could reset demo state via other test endpoints if needed

  // Programmatically login via the backend to obtain the session cookie, then attach it to the browser context
  const loginResp = await request.post('http://127.0.0.1:4000/api/auth/login', { data: { email, password } })
  // If login fails, surface server response body for debugging
  if (loginResp.status() !== 200) {
    const text = await loginResp.text()
    console.error('Login failed:', loginResp.status(), text)
  }
  expect(loginResp.status()).toBe(200)
  const loginJson = await loginResp.json()
  console.log('login response body', JSON.stringify(loginJson))
  const token = loginJson.token || loginJson.access_token
  console.log('extracted token', token)
  const refreshToken = loginJson.refreshToken || loginJson.refresh_token

  // fetch current companies for user to identify companyA
  const listResp = await request.get('http://localhost:4000/api/companies', { headers: { Authorization: `Bearer ${token}` } })
  expect(listResp.status()).toBe(200)
  const list = await listResp.json()
  expect(Array.isArray(list)).toBe(true)
  expect(list.length).toBeGreaterThan(0)
  const companyA = list[0]

  const setCookie = loginResp.headers()['set-cookie']
  expect(setCookie).toBeTruthy()
  // Parse the first cookie name/value and attach to context for completeness
  const cookiePair = setCookie.split(';')[0]
  const [cookieName, cookieValue] = cookiePair.split('=')
  await page.context().addCookies([
    { name: cookieName, value: cookieValue, url: 'http://127.0.0.1:3000' },
    { name: 'token', value: token, url: 'http://127.0.0.1:3000' },
    { name: 'refreshToken', value: refreshToken || '', url: 'http://127.0.0.1:3000' },
    { name: 'email', value: email, url: 'http://127.0.0.1:3000' },
  ])



  await page.goto('/dashboard')

  // Create two additional companies via the authenticated browser context
  // create a second company via backend API using bearer token
  const companyBResp = await request.post('http://localhost:4000/api/companies', {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    data: { name: 'B Co (E2E)' }
  })
  console.log('companyB creation status', companyBResp.status())
  const companyB = companyBResp.ok() ? await companyBResp.json() : null
  expect(companyB).not.toBeNull()

  // Ensure companyA is last-accessed first so we have deterministic ordering
  await page.evaluate(async (id) => {
    await fetch(`/api/companies/${id}/last-accessed`, { method: 'PATCH' })
  }, companyA.id)

  // --- additional check: workspace selection updates header -----
  // head to workspace page (simulate initial choice)
  await page.goto('/workspace')
  // wait for company tile to appear
  await page.waitForSelector(`text=${companyA.name}`)
  // click on it that opens modal
  await page.click(`text=${companyA.name}`)
  await page.waitForSelector('button[data-testid="confirm-company"]')
  await page.click('button[data-testid="confirm-company"]')
  // after modal confirm should navigate to dashboard with query param
  await page.waitForURL(new RegExp(`.*dashboard.*company=${companyA.id}`))
  // header should now show companyA
  const switcherBtn2 = page.locator('button[title="Switch company"]')
  await expect(switcherBtn2).toContainText(companyA.name)

  // end workspace-selection check ---

  // Navigate to dashboard and open company switcher
  await page.goto('/dashboard')

  // button should display the active company name (A is last-accessed)
  const switcherBtn = page.locator('button[title="Switch company"]')
  await expect(switcherBtn).toContainText('A Co (E2E)')

  await switcherBtn.click()
  await page.waitForSelector('#company-switcher')

  // Assert the first recent entry is company A
  const items = page.locator('#company-switcher button')
  await expect(items.first()).toContainText('A Co (E2E)')

  // Prepare to capture the PATCH request when we click company B
  const patchReqPromise = page.waitForRequest((req) => req.url().includes('/last-accessed') && req.method() === 'PATCH')

  // Click company B to visit it
  await items.nth(1).click()

  // Wait for navigation to include the company id
  await page.waitForURL(new RegExp(`.*dashboard.*company=${companyB.id}`))

  // Ensure PATCH request fired for company B
  const patchReq = await patchReqPromise
  expect(patchReq).toBeTruthy()
  expect(patchReq.url()).toContain(`/api/companies/${companyB.id}/last-accessed`)

  // After navigation, the button text should have updated
  await expect(switcherBtn).toContainText('B Co (E2E)')

  // open switcher again and assert B is now first
  await switcherBtn.click()
  await page.waitForSelector('#company-switcher')
  await expect(items.first()).toContainText('B Co (E2E)')
})