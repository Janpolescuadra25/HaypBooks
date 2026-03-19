import { test, expect } from '@playwright/test'

// verify paychecks page shows entries after processing a run

test('paychecks page lists paychecks and opens detail panel', async ({ page, request }) => {
  // create and login
  const email = `e2e-paychek-${Date.now()}@haypbooks.test`
  const password = 'Paychk123!'
  await request.post('http://localhost:4000/api/test/create-user', { data: { email, password, name: 'Paychecks E2E', isEmailVerified: true } })
  const loginRes = await request.post('http://localhost:4000/api/auth/login', { data: { email, password } })
  const loginJson = await loginRes.json()
  const token = loginJson.token
  const refreshToken = loginJson.refreshToken

  await page.context().addCookies([
    { name: 'token', value: token, url: 'http://localhost', httpOnly: true },
    { name: 'refreshToken', value: refreshToken, url: 'http://localhost', httpOnly: true },
  ])

  // create company & employee
  const compResp = await request.post('http://localhost:4000/api/test/create-company', { data: { email, name: 'PaychekCo E2E' } })
  const companyId = (await compResp.json()).company.id
  const empResp = await request.post(`http://localhost:4000/api/companies/${companyId}/payroll/employees`, {
    data: { firstName: 'Sue', lastName: 'Payroll', employmentType: 'FULL_TIME', hireDate: new Date().toISOString().slice(0,10) },
    headers: { Authorization: `Bearer ${token}` }
  })
  const employeeId = (await empResp.json()).id

  // create run and process it to generate paychecks
  const start = new Date().toISOString().slice(0,10)
  const end = new Date(Date.now() + 86400000).toISOString().slice(0,10)
  const runResp = await request.post(`http://localhost:4000/api/companies/${companyId}/payroll/runs`, {
    data: { startDate: start, endDate: end, employeeIds: [employeeId] },
    headers: { Authorization: `Bearer ${token}` }
  })
  const runId = (await runResp.json()).id
  await request.post(`http://localhost:4000/api/companies/${companyId}/payroll/runs/${runId}/process`, { headers: { Authorization: `Bearer ${token}` } })

  // go to paychecks page
  await page.goto('/payroll-workforce/payroll-processing/paychecks')
  // expect paycheck row present
  await expect(page.locator(`text=${new Date(end).toLocaleDateString('en-PH')}`)).toBeVisible()

  // click first row to open detail
  await page.locator('tbody tr').first().click()
  await expect(page.locator('text=Gross')).toBeVisible()
})