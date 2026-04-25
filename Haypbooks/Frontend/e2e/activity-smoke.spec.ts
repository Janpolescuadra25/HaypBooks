import { test, expect } from '@playwright/test'

test('Activity tab lazy-loads on bill edit page', async ({ page, request, context }) => {
  const email = `test-activity+${Date.now()}@haypbooks.test`
  const password = 'password'

  // Ensure test user and workspace exist (dev-only test endpoints)
  await request.post('http://localhost:4000/api/test/create-user', { data: { email, password, isEmailVerified: true } }).catch(() => {})

  // Login via backend test credentials (retry after create-user if necessary)
  let loginResp = await request.post('http://localhost:4000/api/auth/login', { data: { email, password } })
  if (!loginResp.ok()) {
    const bodyText = await loginResp.text()
    console.log('LOGIN_FAIL', loginResp.status(), bodyText)
    await request.post('http://localhost:4000/api/test/create-user', { data: { email, password, isEmailVerified: true } }).catch(() => {})
    loginResp = await request.post('http://localhost:4000/api/auth/login', { data: { email, password } })
    const bodyText2 = await loginResp.text()
    console.log('LOGIN_RETRY', loginResp.status(), bodyText2)
  }
  expect(loginResp.ok()).toBeTruthy()
  const loginJson = await loginResp.json()
  const token = loginJson.token

  // Ensure a workspace/company exists for the test user
  await request.post('http://localhost:4000/api/test/create-new-workspace', { data: { email, name: 'Test Company', currency: 'USD' }, headers: { Authorization: `Bearer ${token}` } }).catch(() => {})

  // Get current company
  const companyResp = await request.get('http://localhost:4000/api/companies/current', { headers: { Authorization: `Bearer ${token}` } })
  expect(companyResp.ok()).toBeTruthy()
  const company = await companyResp.json()
  const companyId = company.id

  // Create a vendor to attach the bill to
  const vendorResp = await request.post(`http://localhost:4000/api/companies/${companyId}/ap/vendors`, {
    data: { name: 'PW Vendor', displayName: 'PW Vendor' },
    headers: { Authorization: `Bearer ${token}` },
  })
  expect(vendorResp.ok()).toBeTruthy()
  const vendor = await vendorResp.json()
  const vendorId = vendor.id || vendor.contactId || vendor.data?.id || vendor.contact?.id || vendor.contact?.contactId

  // Create a bill via API so the edit page exists
  const billPayload = { vendorId: vendorId, lines: [{ description: 'PW test', amount: 10 }] }
  const billResp = await request.post(`http://localhost:4000/api/companies/${companyId}/ap/bills`, {
    data: billPayload,
    headers: { Authorization: `Bearer ${token}` },
  })
  expect(billResp.ok()).toBeTruthy()
  const bill = await billResp.json()
  const billId = bill.id || bill.data?.id || ''
  expect(billId).toBeTruthy()

  // Set auth cookies for the browser context (mimic login cookies)
  const expires = Math.floor(Date.now() / 1000) + 60 * 60
  await context.addCookies([
    { name: 'token', value: token, domain: 'localhost', path: '/', httpOnly: true, secure: false, sameSite: 'Lax', expires },
    { name: 'userId', value: loginJson.user.id, domain: 'localhost', path: '/', httpOnly: false, secure: false, sameSite: 'Lax', expires },
    { name: 'email', value: loginJson.user.email, domain: 'localhost', path: '/', httpOnly: false, secure: false, sameSite: 'Lax', expires },
    { name: 'role', value: 'admin', domain: 'localhost', path: '/', httpOnly: false, secure: false, sameSite: 'Lax', expires },
  ])

  // Navigate directly to the bill edit page (edit mode)
  await page.goto(`/expenses/bills/${billId}/edit`)
  await expect(page.locator('text=Edit Bill')).toBeVisible({ timeout: 10000 })

  // Click the Activity tab (should be enabled for edit mode)
  await page.getByRole('button', { name: 'Activity' }).click()

  // Activity section should appear and either show entries or the empty message
  const activitySection = page.locator('section:has-text("Activity")')
  await expect(activitySection).toBeVisible({ timeout: 8000 })

  // Debug: fetch audit logs for this bill and log UI text for diagnosis
  const auditResp = await request.get(`http://localhost:4000/api/companies/${companyId}/integrations/audit-logs?tableName=Bill&recordId=${billId}`, { headers: { Authorization: `Bearer ${token}` } })
  const auditJson = await auditResp.json().catch(() => null)
  console.log('AUDIT_LOGS', auditResp.status(), JSON.stringify(auditJson))

  const activityText = await activitySection.innerText()
  console.log('ACTIVITY_UI_TEXT', activityText)

  // Wait until either entries are shown or the empty message appears
  const timeout = 10000
  const start = Date.now()
  let createdCount = 0
  let emptyCount = 0
  while (Date.now() - start < timeout) {
    createdCount = await activitySection.locator('text=Created').count()
    emptyCount = await activitySection.locator('text=No activity for this bill yet.').count()
    if (createdCount + emptyCount > 0) break
    await page.waitForTimeout(250)
  }
  expect(createdCount + emptyCount).toBeGreaterThan(0)
})
