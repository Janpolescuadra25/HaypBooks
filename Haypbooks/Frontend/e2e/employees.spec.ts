import { test, expect } from '@playwright/test'

// simple smoke of the employees page

async function createTestUser(request: any) {
  const email = `e2e-emp-${Date.now()}@haypbooks.test`
  const password = 'Emp12345!'
  await request.post('http://localhost:4000/api/test/create-user', { data: { email, password, name: 'Employees E2E', isEmailVerified: true } })
  const login = await request.post('http://localhost:4000/api/auth/login', { data: { email, password } })
  const loginJson = await login.json()
  return { email, token: loginJson.token, refreshToken: loginJson.refreshToken, user: loginJson.user }
}

async function createCompany(request: any, email: string) {
  const resp = await request.post('http://localhost:4000/api/test/create-company', { data: { email, name: 'EmployeesCo E2E' } })
  const json = await resp.json()
  return json.company.id
}

async function createEmployee(request: any, companyId: string, token: string) {
  const res = await request.post(`http://localhost:4000/api/companies/${companyId}/payroll/employees`, {
    data: { firstName: 'John', lastName: 'Doe', employmentType: 'FULL_TIME', hireDate: new Date().toISOString().slice(0,10) },
    headers: { Authorization: `Bearer ${token}` }
  })
  const j = await res.json()
  return j.id
}

async function terminateEmployee(request: any, companyId: string, token: string, empId: string) {
  await request.post(`http://localhost:4000/api/companies/${companyId}/payroll/employees/${empId}/terminate`, {
    data: { terminationDate: new Date().toISOString().slice(0,10) },
    headers: { Authorization: `Bearer ${token}` }
  })
}


// test

test('employees page: add and terminate employee via UI', async ({ page, request }) => {
  const { email, token, refreshToken } = await createTestUser(request)
  const companyId = await createCompany(request, email)

  await page.context().addCookies([
    { name: 'token', value: token, url: 'http://localhost', httpOnly: true },
    { name: 'refreshToken', value: refreshToken, url: 'http://localhost', httpOnly: true },
    { name: 'email', value: email, url: 'http://localhost' },
  ])

  // navigate to employees
  await page.goto('/payroll-workforce/workforce/employees')
  await expect(page.locator('text=Employees')).toBeVisible()

  // click Add Employee
  await page.click('button:has-text("New Employee")')
  await page.fill('input[name="firstName"]', 'Selena')
  await page.fill('input[name="lastName"]', 'Test')
  await page.click('button:has-text("Create")')
  // wait for table refresh
  await page.waitForResponse(r => r.url().includes('/payroll/employees') && r.status()===200)
  await expect(page.locator('text=Selena Test')).toBeVisible()

  // remember id by calling API (because UI row lacks id) to terminate
  const list = await request.get(`http://localhost:4000/api/companies/${companyId}/payroll/employees`, { headers: { Authorization: `Bearer ${token}` } })
  const arr = await list.json()
  const created = arr.find((e:any)=>e.firstName==='Selena' && e.lastName==='Test')
  expect(created).toBeTruthy()
  const empId = created.id

  // open row menu and click Terminate
  await page.locator(`tr:has-text("Selena Test") button:has-text("Terminate")`).click()
  await page.click('button:has-text("Confirm")')
  // verify via API
  const after = await request.get(`http://localhost:4000/api/companies/${companyId}/payroll/employees`, { headers: { Authorization: `Bearer ${token}` } })
  const afarr = await after.json()
  const terminated = afarr.find((e:any)=>e.id===empId)
  expect(terminated).toBeTruthy()
  expect(terminated.status).toBe('TERMINATED')
})
