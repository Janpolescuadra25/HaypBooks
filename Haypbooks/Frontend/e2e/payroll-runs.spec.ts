import { test, expect } from '@playwright/test'

test('payroll runs page shows created run and allows processing action', async ({ page, request }) => {
  // create user via test endpoint
  const email = `e2e-payroll-${Date.now()}@haypbooks.test`
  const password = 'Payroll123!'
  const create = await request.post('http://localhost:4000/api/test/create-user', { data: { email, password, name: 'Payroll E2E', isEmailVerified: true } })
  expect(create.ok()).toBeTruthy()

  // create a company for this user (required to access payroll APIs)
  const compResp = await request.post('http://localhost:4000/api/test/create-company', { data: { email, name: 'PayrollCo E2E' } })
  expect(compResp.status()).toBe(201)
  const compJson = await compResp.json()
  const companyId: string = compJson.company.id
  expect(companyId).toBeTruthy()

  // login and set cookies to bypass UI auth
  const loginRes = await request.post('http://localhost:4000/api/auth/login', { data: { email, password } })
  expect(loginRes.ok()).toBeTruthy()
  const loginJson = await loginRes.json()
  expect(loginJson.token).toBeTruthy()

  await page.context().addCookies([
    { name: 'token', value: loginJson.token, url: 'http://localhost', httpOnly: true },
    { name: 'refreshToken', value: loginJson.refreshToken, url: 'http://localhost', httpOnly: true },
    { name: 'email', value: loginJson.user.email, url: 'http://localhost' },
    { name: 'userId', value: String(loginJson.user.id), url: 'http://localhost' },
  ])

  // create an employee under the company (payroll frontend expects at least one employee)
  const empResp = await request.post(`http://localhost:4000/api/companies/${companyId}/payroll/employees`, { data: {
    firstName: 'Amy', lastName: 'Worker', employmentType: 'FULL_TIME', hireDate: new Date().toISOString().slice(0,10)
  }, headers: { Authorization: `Bearer ${loginJson.token}` } })
  expect(empResp.ok()).toBeTruthy()
  const empJson = await empResp.json()
  const employeeId: string = empJson.id
  expect(employeeId).toBeTruthy()

  // now create payroll run via API
  const start = new Date().toISOString().slice(0,10)
  const end = new Date(Date.now() + 2*24*60*60*1000).toISOString().slice(0,10)
  const runResp = await request.post(`http://localhost:4000/api/companies/${companyId}/payroll/runs`, {
    data: { startDate: start, endDate: end, employeeIds: [employeeId] },
    headers: { Authorization: `Bearer ${loginJson.token}` }
  })
  expect(runResp.status()).toBe(201)
  const runJson = await runResp.json()
  expect(runJson.id).toBeTruthy()

  // navigate to payroll runs page
  await page.goto('/payroll-workforce/payroll-processing/payroll-runs')
  // wait for run row to appear with period text
  const periodText = `${new Date(start).toLocaleDateString('en-PH')} – ${new Date(end).toLocaleDateString('en-PH')}`
  await expect(page.locator('text=' + periodText)).toBeVisible()

  // the row should have Draft status and a Process button
  const row = page.locator(`tr:has-text("${periodText}")`)
  await expect(row.locator('text=DRAFT')).toBeVisible()
  await expect(row.locator('button:has-text("Process")')).toBeVisible()

  // export results
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('button:has-text("Export")')
  ])
  const path = await download.path()
  const fs = require('fs')
  const data = fs.readFileSync(path, 'utf8')
  expect(data).toContain(periodText)

  // optionally click Process and verify status update via API or page reload
  await row.locator('button:has-text("Process")').click()
  // wait for API call to complete and table refresh (simple network wait)
  await page.waitForResponse(resp => resp.url().includes('/payroll/runs') && resp.status()===200)
  // run should now show SUBMITTED
  await expect(row.locator('text=SUBMITTED')).toBeVisible()
})
