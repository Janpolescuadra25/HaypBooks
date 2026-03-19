import { test, expect } from '@playwright/test'

// test deductions page export functionality

test('deductions page can add deduction and export CSV', async ({ page, request }) => {
  const email = `e2e-ded-${Date.now()}@haypbooks.test`
  const password = 'Deduct123!'
  await request.post('http://localhost:4000/api/test/create-user', { data: { email, password, name: 'Deductions E2E', isEmailVerified: true } })
  const loginRes = await request.post('http://localhost:4000/api/auth/login', { data: { email, password } })
  const loginJson = await loginRes.json()
  const token = loginJson.token
  const refreshToken = loginJson.refreshToken
  await page.context().addCookies([
    { name: 'token', value: token, url: 'http://localhost', httpOnly: true },
    { name: 'refreshToken', value: refreshToken, url: 'http://localhost', httpOnly: true },
  ])

  const compResp = await request.post('http://localhost:4000/api/test/create-company', { data: { email, name: 'DeductionsCo E2E' } })
  const companyId = (await compResp.json()).company.id
  const empResp = await request.post(`http://localhost:4000/api/companies/${companyId}/payroll/employees`, {
    data: { firstName: 'Loan', lastName: 'User', employmentType: 'FULL_TIME', hireDate: new Date().toISOString().slice(0,10) },
    headers: { Authorization: `Bearer ${token}` }
  })
  const employeeId = (await empResp.json()).id

  // navigate UI and add deduction via modal
  await page.goto('/payroll-workforce/compensation/deductions')
  await expect(page.locator('text=Deductions')).toBeVisible()
  await page.click('button:has-text("Add Deduction")')
  await page.selectOption('select[aria-label="Employee"]', employeeId)
  await page.selectOption('select[aria-label="Type"]', 'SSS_LOAN')
  await page.fill('input[aria-label="Amount"]', '1000')
  await page.click('button:has-text("Add")')
  // wait for table refresh
  await page.waitForResponse(r => r.url().includes('/payroll/employees') && r.status()===200)
  await expect(page.locator('text=Loan User')).toBeVisible()

  // click Export
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('button:has-text("Export")')
  ])
  const path = await download.path()
  const fs = require('fs')
  const data = fs.readFileSync(path, 'utf8')
  expect(data).toContain('Loan User')
})