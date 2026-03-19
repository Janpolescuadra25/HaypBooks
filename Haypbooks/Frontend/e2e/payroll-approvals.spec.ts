import { test, expect } from '@playwright/test'

// test approvals page including export functionality

test('payroll approvals page lists pending run and can export', async ({ page, request }) => {
  // setup user, company, employee, run, process
  const email = `e2e-approv-${Date.now()}@haypbooks.test`
  const password = 'Approve123!'
  await request.post('http://localhost:4000/api/test/create-user', { data: { email, password, name: 'Approvals E2E', isEmailVerified: true } })
  const loginRes = await request.post('http://localhost:4000/api/auth/login', { data: { email, password } })
  const loginJson = await loginRes.json()
  const token = loginJson.token
  await page.context().addCookies([
    { name: 'token', value: token, url: 'http://localhost', httpOnly: true },
    { name: 'refreshToken', value: loginJson.refreshToken, url: 'http://localhost', httpOnly: true },
  ])

  const compResp = await request.post('http://localhost:4000/api/test/create-company', { data: { email, name: 'ApprovalsCo E2E' } })
  const companyId = (await compResp.json()).company.id
  const empResp = await request.post(`http://localhost:4000/api/companies/${companyId}/payroll/employees`, {
    data: { firstName: 'Eva', lastName: 'Pending', employmentType: 'FULL_TIME', hireDate: new Date().toISOString().slice(0,10) },
    headers: { Authorization: `Bearer ${token}` }
  })
  const employeeId = (await empResp.json()).id

  const start = new Date().toISOString().slice(0,10)
  const end = new Date(Date.now() + 86400000).toISOString().slice(0,10)
  const runResp = await request.post(`http://localhost:4000/api/companies/${companyId}/payroll/runs`, {
    data: { startDate: start, endDate: end, employeeIds: [employeeId] },
    headers: { Authorization: `Bearer ${token}` }
  })
  const runId = (await runResp.json()).id
  await request.post(`http://localhost:4000/api/companies/${companyId}/payroll/runs/${runId}/process`, { headers: { Authorization: `Bearer ${token}` } })

  // navigate to approvals page
  await page.goto('/payroll-workforce/payroll-processing/payroll-approvals')
  await expect(page.locator('text=Payroll Approvals')).toBeVisible()

  // expect row for run exists
  const periodText = `${new Date(start).toLocaleDateString('en-PH')} — ${new Date(end).toLocaleDateString('en-PH')}`
  await expect(page.locator(`text=${periodText}`)).toBeVisible()

  // export file
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('button:has-text("Export")')
  ])
  const path = await download.path()
  expect(path).toBeTruthy()
  // read file from disk to assert contains period text
  const fs = require('fs')
  const data = fs.readFileSync(path, 'utf8')
  expect(data).toContain(periodText)
})