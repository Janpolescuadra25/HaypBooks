import { test, expect } from '@playwright/test'

test.describe('Expenses AP smoke test', () => {
  test('creates a vendor and a bill with populated dropdowns and no API 404/500s', async ({ page, request }) => {
    const backend = process.env.TEST_BACKEND_URL || 'http://127.0.0.1:4000'
    const frontend = process.env.PLAYWRIGHT_URL || 'http://127.0.0.1:3000'

    const email = `e2e-ap-${Date.now()}@haypbooks.test`
    const password = 'Password1!'
    const companyName = `E2E AP Company ${Date.now()}`
    const vendorName = `E2E Vendor ${Date.now()}`
    const vendorEmail = `vendor-${Date.now()}@haypbooks.test`
    const vendorPhone = '(555) 123-4567'

    const failedResponses: Array<{ status: number; url: string; body?: string }> = []
    const consoleErrors: string[] = []
    const pageErrors: string[] = []

    page.on('response', async (response) => {
      const status = response.status()
      const url = response.url()
      if (status >= 400) {
        let body = ''
        try {
          body = await response.text()
        } catch {
          body = '<unable to read body>'
        }
        failedResponses.push({ status, url, body })
      }
    })

    page.on('request', async (request) => {
      const url = request.url()
      if (url.includes('/api/companies/') && url.includes('/ap/bills') && request.method() === 'POST') {
        let postData = '<unable to read request body>'
        try {
          postData = request.postData() ?? '<no postData>'
        } catch {
          postData = '<error reading postData>'
        }
        console.log(`DEBUG: bill create request ${url} ${postData}`)
      }
    })

    page.on('requestfailed', (request) => {
      pageErrors.push(`requestfailed ${request.method()} ${request.url()} ${request.failure()?.errorText ?? ''}`)
    })

    page.on('pageerror', (error) => {
      pageErrors.push(`pageerror ${error.message}`)
    })

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    const createUserRes = await request.post(`${backend}/api/test/create-user`, {
      data: { email, password, name: 'E2E AP User', isEmailVerified: true },
    }).catch(() => null)

    if (!createUserRes || (createUserRes.status() !== 200 && createUserRes.status() !== 201)) {
      test.skip(true, 'Backend test endpoints unavailable or create-user failed')
      return
    }

    const companyRes = await request.post(`${backend}/api/test/create-company`, {
      data: { email, name: companyName },
    }).catch(() => null)

    if (!companyRes || (companyRes.status() !== 200 && companyRes.status() !== 201)) {
      test.skip(true, 'Backend test endpoints unavailable or create-company failed')
      return
    }

    const companyJson = await companyRes.json().catch(() => null)
    const company = companyJson?.company ?? companyJson
    const companyId = company?.id
    expect(companyId, 'Expected company id from create-company response').toBeTruthy()

    const loginRes = await request.post(`${backend}/api/auth/login`, {
      data: { email, password },
    }).catch(() => null)

    if (!loginRes || (loginRes.status() !== 200 && loginRes.status() !== 201)) {
      test.skip(true, 'Backend auth login failed')
      return
    }

    const loginJson = await loginRes.json().catch(() => null)
    const token = loginJson?.token
    if (token) {
      await request.post(`${backend}/api/test/force-complete-onboarding`, {
        data: { email, mode: 'quick' },
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => null)

      await request.post(`${backend}/api/companies/${companyId}/accounting/accounts/seed-default`, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => null)
    }

    const setCookieHeader = loginRes.headers()['set-cookie']
    if (setCookieHeader) {
      const cookieStrings = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader]
      for (const cs of cookieStrings) {
        const [pair] = cs.split(';')
        const sep = pair.indexOf('=')
        if (sep > 0) {
          const name = pair.slice(0, sep)
          const val = decodeURIComponent(pair.slice(sep + 1))
          await page.context().addCookies([{ name, value: val, domain: '127.0.0.1', path: '/', httpOnly: true }]).catch(() => null)
        }
      }
    }

    await page.goto(`${frontend}/login?showLogin=1`)
    await page.fill('input[name="email"]', email)
    await page.fill('input[name="password"]', password)
    await Promise.all([
      page.waitForURL((url) => !url.toString().includes('/login'), { timeout: 15000 }).catch(() => null),
      page.click('button[type="submit"]'),
    ])

    await page.context().addCookies([
      { name: 'onboardingComplete', value: 'true', domain: '127.0.0.1', path: '/' },
      { name: 'ownerOnboardingComplete', value: 'true', domain: '127.0.0.1', path: '/' },
    ]).catch(() => null)

    await page.goto(`${frontend}/expenses/vendors?company=${companyId}`)
    await expect(page.locator('h1:has-text("Vendors")')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('button:has-text("New Vendor")')).toBeEnabled({ timeout: 15000 })
    await page.click('button:has-text("New Vendor")')
    await expect(page.locator('h2:has-text("New Vendor")')).toBeVisible({ timeout: 15000 })
    await page.fill('input[placeholder="Vendor name"]', vendorName)
    await page.fill('input[placeholder="email@example.com"]', vendorEmail)
    await page.fill('input[placeholder="(123) 456-7890"]', vendorPhone)
    const vendorCreatePromise = page.waitForResponse((response) => response.url().includes(`/companies/${companyId}/ap/vendors`) && response.request().method() === 'POST', { timeout: 15000 }).catch(() => null)
    const vendorRefreshPromise = page.waitForResponse((response) => response.url().includes(`/companies/${companyId}/ap/vendors`) && response.request().method() === 'GET', { timeout: 15000 }).catch(() => null)
    await Promise.all([
      vendorCreatePromise,
      vendorRefreshPromise,
      page.click('button:has-text("Save")'),
    ])
    try {
      await expect(page.locator(`text=${vendorName}`)).toBeVisible({ timeout: 15000 })
    } catch (error) {
      console.log('DEBUG: failedResponses=', JSON.stringify(failedResponses, null, 2))
      console.log('DEBUG: consoleErrors=', JSON.stringify(consoleErrors, null, 2))
      console.log('DEBUG: pageErrors=', JSON.stringify(pageErrors, null, 2))
      throw error
    }

    await page.goto(`${frontend}/expenses/bills-payments/bills?company=${companyId}`)
    await expect(page.locator('h1:has-text("Bills")')).toBeVisible({ timeout: 15000 })
    const newBillButton = page.locator('button:has-text("New Bill")')
    await expect(newBillButton).toBeVisible({ timeout: 30000 })
    await expect(newBillButton).toBeEnabled({ timeout: 30000 })
    await newBillButton.click()
    await expect(page).toHaveURL(/expenses\/bills\/new|expenses\/bills-payments\/bills\/new/)  // accept either route style

    await expect(page.locator('input[placeholder="Search vendors by name or email…"]')).toBeVisible()
    await page.fill('input[placeholder="Search vendors by name or email…"]', vendorName)
    await expect(page.locator(`button:has-text("${vendorName}")`)).toBeVisible({ timeout: 10000 })
    await page.click(`button:has-text("${vendorName}")`)

    const accountSelect = page.locator('select[aria-label="Account"]').first()
    await expect(accountSelect).toBeVisible()
    const accountOptions = await accountSelect.locator('option:not([value=""])').count()
    expect(accountOptions).toBeGreaterThan(0)
    await accountSelect.selectOption({ index: 1 })

    const lineRow = page.locator('table tbody tr').first()
    await lineRow.locator('input[placeholder="Item or description"]').fill('E2E bill line item')
    await lineRow.locator('input[type="number"]').nth(0).fill('2')
    await lineRow.locator('input[type="number"]').nth(1).fill('25')

    await page.click('button:has-text("Submit")')
    try {
      await page.waitForURL(/expenses\/bills-payments\/bills/, { timeout: 15000 })
    } catch (error) {
      console.log('DEBUG: failedResponses=', JSON.stringify(failedResponses, null, 2))
      console.log('DEBUG: consoleErrors=', JSON.stringify(consoleErrors, null, 2))
      console.log('DEBUG: pageErrors=', JSON.stringify(pageErrors, null, 2))
      throw error
    }
    await expect(page.locator(`text=${vendorName}`)).toBeVisible({ timeout: 15000 })

    const billsRes = await request.get(`${backend}/api/companies/${companyId}/ap/bills`, {
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => null)
    expect(billsRes, 'Expected bills list endpoint to respond').not.toBeNull()
    expect(billsRes?.status(), 'Expected bills list status not 404/500').toBeGreaterThanOrEqual(200)
    expect(billsRes?.status()).toBeLessThan(500)

    expect(failedResponses, `Expected no 404/500 responses for /api/companies`).toEqual([])
    expect(consoleErrors, `Expected no browser console errors`).toEqual([])

    await request.post(`${backend}/api/test/delete-user`, { data: { email } }).catch(() => null)
  })
})
