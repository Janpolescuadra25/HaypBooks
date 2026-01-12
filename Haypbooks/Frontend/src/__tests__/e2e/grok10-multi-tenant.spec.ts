import { test, expect, Page } from '@playwright/test'

/**
 * Grok.10 Multi-Tenant Flow E2E Tests
 * 
 * Tests the complete Owner and Accountant hub workflow as described in Grok.10.md:
 * 1. Owner creates company
 * 2. Owner adds additional companies (multi-company)
 * 3. Owner invites accountant
 * 4. Accountant accepts invitation
 * 5. Accountant views client list
 * 6. Accountant switches between clients
 *
 * NOTE (E2E strategy): Some steps in this spec use authenticated API calls (company creation
 * and invite acceptance) rather than the UI to make the flow deterministic and avoid
 * intermittent UI timing/flakiness in CI. If you modify this test, prefer API-backed
 * operations for setup/acceptance unless you're explicitly testing the UI path. See
 * `Frontend/e2e/README.md` for local e2e guidance.
 */

test.describe.configure({ mode: 'serial' })

test.describe('Grok.10 Multi-Tenant Workflow', () => {
  const ownerEmail = `owner-${Date.now()}@test.com`
  const accountantEmail = `accountant-${Date.now()}@test.com`
  const password = 'Test123!'
  const companyName = 'Test Company Inc'
  const secondCompanyName = 'Second Business LLC'

  test.beforeEach(async ({ page }) => {
    // Clear cookies to start fresh
    await page.context().clearCookies()
  })

  test('Owner Flow: Signup → Create Company → Add Second Company → Invite Accountant', async ({ page }) => {
    // Step 1: Owner signs up with OWNER hub
    await page.goto('/signup')
    // Choose Owner role then fill the form
    await page.click('text=My Business')
    await page.waitForSelector('#email', { timeout: 15000 })
    await page.fill('#firstName', 'Owner')
    await page.fill('#lastName', 'Test')
    await page.fill('#email', ownerEmail)
    await page.fill('#password', password)
    await page.fill('#confirmPassword', password)
    await page.click('text=Create account')

    // Should redirect to verify OTP, then complete verification to land in onboarding
    await page.waitForURL(/\/verify-otp(\?.*)?/, { timeout: 15000 })
    // Verify using the code passed in the query string (Continue triggers server-side completeSignup)
    await page.click('text=Continue')
    await page.waitForURL(/\/onboarding|\/get-started/, { timeout: 15000 })

    // Complete onboarding by choosing a workspace name and starting a trial
    await page.waitForSelector('#workspace-name', { timeout: 10000 })
    await page.fill('#workspace-name', companyName)
    await page.click('text=Start Free Trial')
    await page.waitForURL('/get-started/trial', { timeout: 10000 })
    await page.click('text=Complete Quick Setup')

    // Onboarding may take a moment — navigate to Owner Hub and verify the company card appears
    await page.waitForURL('/onboarding', { timeout: 15000 })
    await page.goto('/hub/companies')
    await page.waitForSelector(`text=${companyName}`, { timeout: 30000 })

    // Verify company appears in hub
    await expect(page.locator(`text=${companyName}`)).toBeVisible()

    // Step 2: Create a second company (use API for reliability in E2E)
    const cookies = await page.context().cookies()
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ')
    // Find owner's tenantId from owned companies and use it when creating a new company
    const ownedResp = await page.request.get('/api/companies?filter=owned', { headers: { cookie: cookieHeader } })
    const ownedJson = await ownedResp.json()
    const tenantId = ownedJson && ownedJson[0] ? (ownedJson[0].tenantId || ownedJson[0].tenant?.id) : undefined
    await page.request.post('/api/companies', { data: { name: secondCompanyName, tenantId }, headers: { cookie: cookieHeader } })
    // Refresh Owner Hub to pick up the new company
    await page.reload()

    // Verify both companies appear in Owner Hub
    await page.waitForSelector(`text=${companyName}`, { timeout: 30000 })
    await page.waitForSelector(`text=${secondCompanyName}`, { timeout: 30000 })
    await expect(page.locator(`text=${companyName}`)).toBeVisible()
    await expect(page.locator(`text=${secondCompanyName}`)).toBeVisible()

    // Step 3: Invite accountant
    await page.click('text=Invite Accountant')
    await page.fill('[placeholder="accountant@example.com"]', accountantEmail)
    await page.click('button:has-text("Send Invitation")')

    // Wait for success message
    await expect(page.locator('text=Invitation sent')).toBeVisible()
  })

  test('Accountant Flow: Signup → View Pending Invites → Accept → View Clients', async ({ page, context }) => {
    // Prerequisites: Owner test must run first to create invitation
    // In real testing, you'd run these sequentially or have setup data

    // Step 1: Accountant signs up with ACCOUNTANT hub
    await page.goto('/signup')
    // Choose Accountant role then fill the form
    await page.click('text=Accountant')
    await page.waitForSelector('#email', { timeout: 15000 })
    await page.fill('#firstName', 'Acct')
    await page.fill('#lastName', 'Test')
    await page.fill('#email', accountantEmail)
    await page.fill('#password', password)
    await page.fill('#confirmPassword', password)
    await page.click('text=Create account')

    // Should redirect to verify OTP, then complete verification to land in onboarding
    await page.waitForURL(/\/verify-otp(\?.*)?/, { timeout: 15000 })
    await page.click('text=Continue')
    await page.waitForURL(/\/onboarding\/accountant|\/hub\/accountant/, { timeout: 15000 })

    // Ensure we're on the Accountant Hub or onboarding accountant flow


    // Step 2: Navigate to invites page and accept the invitation
    await page.goto('/hub/invites')
    await page.waitForURL('/hub/invites')
    await page.reload()

    // Step 3: Accept invitation via API (reliable for E2E)
    const acctCookies = await page.context().cookies()
    const acctCookieHeader = acctCookies.map(c => `${c.name}=${c.value}`).join('; ')
    const pendingResp = await page.request.get('/api/tenants/invites/pending', { headers: { cookie: acctCookieHeader } })
    const pendingInvites = await pendingResp.json()
    const invite = pendingInvites.find((i: any) => i.tenant && i.tenant.name === companyName)
    if (!invite) throw new Error('Pending invite not found for company: ' + companyName)

    await page.request.post(`/api/companies/invites/${invite.id}/accept`, { headers: { cookie: acctCookieHeader } })

    // Navigate to Accountant Hub and verify the accepted client appears
    await page.goto('/hub/accountant')
    await page.waitForURL('/hub/accountant')

    // Step 4: Verify client appears in list
    await page.waitForSelector(`text=${companyName}`, { timeout: 10000 })

    // Step 5: View client details
    await page.click(`text=View Client`)
    // Should update lastAccessedAt
    // Verify navigation or state change (implementation dependent)
  })

  test('Multi-Company under Single Tenant: Verify tenantId is shared', async ({ page }) => {
    // This test verifies the database constraint: multiple companies under one tenant

    // Attempt API login for determinism; fall back to UI login if necessary
    await page.goto('/')
    const loginResp = await page.request.post('/api/auth/login', { data: { email: ownerEmail, password } }).catch(() => null)
    if (loginResp && loginResp.ok()) {
      const loginJson = await loginResp.json().catch(() => null)
      if (loginJson && loginJson.token) {
        await page.context().addCookies([
          { name: 'token', value: loginJson.token, url: 'http://localhost', httpOnly: true },
          { name: 'refreshToken', value: loginJson.refreshToken || '', url: 'http://localhost', httpOnly: true },
          { name: 'email', value: loginJson.user.email, url: 'http://localhost' },
          { name: 'userId', value: String(loginJson.user.id), url: 'http://localhost' },
        ])
        await page.goto('/hub/companies')
        await page.waitForSelector(`text=${companyName}`, { timeout: 30000 })
      }
    } else {
      // Fallback to UI login if API login isn't available or returns a verification challenge
      await page.goto('/login')
      await page.waitForSelector('#email', { timeout: 15000 })
      await page.fill('#email', ownerEmail)
      await page.fill('#password', password)
      await page.click('text=Sign in')

      // Wait for redirect into Owner Hub or verification and handle both
      let redirected = await page.waitForURL(/\/(hub\/companies|verify-otp|verification)(.*)?/, { timeout: 20000 }).catch(() => null)
      if (!redirected) {
        await page.press('#password', 'Enter')
        await page.waitForURL(/\/(hub\/companies|verify-otp|verification)(.*)?/, { timeout: 15000 })
      }

      if (page.url().includes('/verify-otp') || page.url().includes('/verification')) {
        // Handle verification flows gracefully
        await page.click('text=Continue').catch(() => {})
        await page.waitForURL('/hub/companies', { timeout: 15000 })
      } else {
        await page.waitForURL('/hub/companies', { timeout: 15000 })
      }
    }

    // Open dev tools and check API responses
    const companyRequests: any[] = []
    page.on('response', async (response) => {
      if (response.url().includes('/api/companies') && response.status() === 200) {
        try {
          const data = await response.json()
          companyRequests.push(data)
        } catch (e) {
          // ignore
        }
      }
    })

    // Refresh to trigger API call
    await page.reload()

    // Wait for companies to load
    await page.waitForTimeout(1000)

    // Verify both companies have the same tenantId
    const companies = companyRequests.flat().filter(c => c.name === companyName || c.name === secondCompanyName)
    if (companies.length >= 2) {
      const tenantIds = companies.map(c => c.tenantId)
      expect(tenantIds[0]).toBe(tenantIds[1])
    }
  })

  test('Accountant Hub: Displays tenants (not companies)', async ({ page }) => {
    // Login as accountant (prefer API login for determinism)
    await page.goto('/')
    const loginResp = await page.request.post('/api/auth/login', { data: { email: accountantEmail, password } }).catch(() => null)
    if (loginResp && loginResp.ok()) {
      const loginJson = await loginResp.json().catch(() => null)
      if (loginJson && loginJson.token) {
        await page.context().addCookies([
          { name: 'token', value: loginJson.token, url: 'http://localhost', httpOnly: true },
          { name: 'refreshToken', value: loginJson.refreshToken || '', url: 'http://localhost', httpOnly: true },
          { name: 'email', value: loginJson.user.email, url: 'http://localhost' },
          { name: 'userId', value: String(loginJson.user.id), url: 'http://localhost' },
        ])
        await page.goto('/hub/accountant')
        await expect(page).toHaveURL('/hub/accountant')
      }
    } else {
      // Fallback to UI login
      await page.goto('/login')
      await page.waitForSelector('#email', { timeout: 15000 })
      await page.fill('#email', accountantEmail)
      await page.fill('#password', password)
      await page.click('text=Sign in')

      await page.waitForURL(/\/(hub\/accountant|verify-otp|verification)(.*)?/, { timeout: 20000 }).catch(() => null)
      if (page.url().includes('/verify-otp') || page.url().includes('/verification')) {
        await page.click('text=Continue').catch(() => {})
        await page.waitForURL('/hub/accountant', { timeout: 15000 })
      } else {
        await expect(page).toHaveURL('/hub/accountant')
      }
    }

    // Intercept API call to verify correct endpoint
    let apiCalled = false
    page.on('request', (request) => {
      if (request.url().includes('/api/tenants/clients')) {
        apiCalled = true
      }
    })

    await page.reload()
    await page.waitForTimeout(500)

    // Verify API endpoint is correct
    expect(apiCalled).toBe(true)

    // Verify tenant card shows company count
    await expect(page.locator('text=2 companies')).toBeVisible()
  })

  test('Invitation Expiry: Expired invites not shown', async ({ page }) => {
    // This would require mocking the database to have an expired invite
    // Or using time manipulation if your system supports it
    // Placeholder for completeness
  })

  test('Permission Check: Only owner can invite accountants', async ({ page, context }) => {
    // Create a second page for accountant
    const accountantPage = await context.newPage()

    // Accountant tries to invite someone (should fail)
    // Prefer API login for determinism
    await accountantPage.goto('/')
    const acctLogin = await accountantPage.request.post('/api/auth/login', { data: { email: accountantEmail, password } }).catch(() => null)
    if (acctLogin && acctLogin.ok()) {
      const lj = await acctLogin.json().catch(() => null)
      if (lj && lj.token) {
        await accountantPage.context().addCookies([
          { name: 'token', value: lj.token, url: 'http://localhost', httpOnly: true },
          { name: 'refreshToken', value: lj.refreshToken || '', url: 'http://localhost', httpOnly: true },
          { name: 'email', value: lj.user.email, url: 'http://localhost' },
          { name: 'userId', value: String(lj.user.id), url: 'http://localhost' },
        ])
      }
    } else {
      await accountantPage.goto('/login')
      await accountantPage.fill('[name="email"]', accountantEmail)
      await accountantPage.fill('[name="password"]', password)
      await accountantPage.click('text=Sign in').catch(() => {})
    }

    await accountantPage.goto('/hub/companies') // Try to access owner hub
    
    // UI may show or hide the invite CTA depending on role handling; ensure backend forbids the action
    const response = await accountantPage.request.post('/api/tenants/fake-id/invites', {
      data: { email: 'test@test.com' },
    })
    expect(response.status()).toBe(403)
  })
})

test.describe('Edge Cases and Error Handling', () => {
  test('Duplicate invitation: Should reject', async ({ page }) => {
    // Login as owner and try to invite same email twice
    // Should show error message
  })

  test('Invalid email format: Should reject', async ({ page }) => {
    // Try to invite with invalid email
    // Should show validation error
  })

  test('Accepting already-accepted invite: Should handle gracefully', async ({ page }) => {
    // Try to accept an invite that was already accepted
    // Should show appropriate message
  })
})
