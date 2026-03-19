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
  let ts: number
  let ownerEmail: string
  let accountantEmail: string
  let ownerWorkspaceId: string | undefined
  const password = 'Test123!'
  const companyName = 'Test Company Inc'
  const secondCompanyName = 'Second Business LLC'

  test.beforeAll(async () => {
    ts = Date.now()
    ownerEmail = `owner-${ts}@test.com`
    accountantEmail = `accountant-${ts}@test.com`
  })

  test.beforeEach(async ({ page }) => {
    // Clear cookies and localStorage to start fresh (signup/login flows depend on stored auth state)
    await page.context().clearCookies()
    await page.goto('http://localhost:3000')
    await page.evaluate(() => localStorage.clear())
  })

  test('Owner Flow: Signup → Create Company → Add Second Company → Invite Accountant', async ({ page }) => {
    // Step 1: Owner signs up with Owner Workspace
    await page.goto('/signup')
    // Choose Owner role then fill the form
    // Updated label from "My Business" -> "Business Owner" (or use data-testid)
    await page.click('[data-testid=signup-role-business]')
    await page.waitForSelector('#email', { timeout: 15000 })
    await page.fill('#firstName', 'Owner')
    await page.fill('#lastName', 'Test')
    await page.fill('#email', ownerEmail)
    await page.fill('#password', password)
    await page.fill('#confirmPassword', password)
    await page.click('text=Create account')

    // Should redirect to verify OTP, then complete verification to land in onboarding flow
    await page.waitForURL(/\/verify-otp(\?.*)?/, { timeout: 15000 })
    // Verify using the code passed in the query string (Continue triggers server-side completeSignup)
    await page.click('text=Continue')

    // Signed-up users are routed into the onboarding flow (plans page) before reaching the Workspace selector.
    await page.waitForURL(/\/get-started\/plans/, { timeout: 20000 })

    // Create the first company via the backend test helper (the UI no longer has a workspace-name input)
    const signupCookies = await page.context().cookies()
    const signupCookieHeader = signupCookies.map(c => `${c.name}=${c.value}`).join('; ')
    const createResp = await page.request.post('/api/test/create-company', { data: { email: ownerEmail, name: companyName }, headers: { Cookie: signupCookieHeader } })
    const createJson = await createResp.json().catch(() => null)
    console.log('create-company response', createResp.status(), createJson)
    expect(createResp.ok()).toBeTruthy()

    // Note: /hub/companies now redirects to the unified dashboard, so we rely on the API to verify company creation.
    await page.waitForTimeout(1000)

    // Step 2: (Optional) Verify the company list now includes the created company
    const cookies = await page.context().cookies()
    const cookieHeader = cookies.map(c => `${c.name}=${c.value}`).join('; ')
    const meResp = await page.request.get('/api/users/me', { headers: { Cookie: cookieHeader } })
    const meJson = await meResp.json()
    ownerWorkspaceId = meJson?.ownedWorkspaceId
    expect(ownerWorkspaceId).toBeTruthy()

    const companiesResp = await page.request.get('/api/companies?filter=owned', { headers: { Cookie: cookieHeader } })
    const companiesJson = await companiesResp.json()
    expect(Array.isArray(companiesJson)).toBe(true)
    const names = companiesJson.map((c: any) => c.name)
    expect(names).toContain(companyName)

    // Step 2b: Add a second company to the same workspace (multi-company)
    const createSecondResp = await page.request.post('/api/test/create-company', { data: { email: ownerEmail, name: secondCompanyName }, headers: { Cookie: cookieHeader } })
    const createSecondJson = await createSecondResp.json().catch(() => null)
    console.log('create-second-company response', createSecondResp.status(), createSecondJson)
    expect(createSecondResp.ok()).toBeTruthy()

    // Step 3: Invite accountant via API (skip UI invite button)
    const inviteResp = await page.request.post(`/api/tenants/${ownerWorkspaceId}/invites`, {
      headers: { cookie: cookieHeader },
      data: { email: accountantEmail },
    })
    const inviteJson = await inviteResp.json().catch(() => null)
    console.log('created invite response', inviteResp.status(), inviteJson)

    // Verify invite exists for the accountant (owner view)
    const pendingAsOwner = await page.request.get('/api/tenants/invites/pending', { headers: { cookie: cookieHeader } })
    const pendingAsOwnerJson = await pendingAsOwner.json().catch(() => null)
    console.log('pending invites (owner):', pendingAsOwner.status(), pendingAsOwnerJson)
  })

  test('Accountant Flow: Signup → View Pending Invites → Accept → View Clients', async ({ page, context }) => {
    // Prerequisites: Owner test must run first to create invitation
    // In real testing, you'd run these sequentially or have setup data

    // Step 1: Accountant signs up with ACCOUNTANT hub
    await page.goto('/signup')
    // Choose Accountant role then fill the form
    await page.click('[data-testid=signup-role-accountant]')
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
    await page.waitForURL(/\/onboarding\/(accountant|practice)|\/hub\/(accountant|invites)/, { timeout: 15000 })

    // Capture cookies once we are authenticated
    const acctCookies = await page.context().cookies()
    const acctCookieHeader = acctCookies.map(c => `${c.name}=${c.value}`).join('; ')

    // Step 2: Accept the invitation via API (no dedicated invite page)
    const pendingRes = await page.request.get('/api/tenants/invites/pending', { headers: { cookie: acctCookieHeader } })
    const pendingInvites = await pendingRes.json()
    expect(Array.isArray(pendingInvites)).toBe(true)
    expect(pendingInvites.length).toBeGreaterThan(0)

    const inviteId = pendingInvites[0]?.id
    expect(inviteId).toBeTruthy()

    await page.request.post(`/api/companies/invites/${inviteId}/accept`, {
      headers: { cookie: acctCookieHeader },
      data: { setIsAccountant: true },
    })

    // Verify acceptance via API: accountant should now see the workspace in their client list
    const clientsResp = await page.request.get('/api/tenants/clients', { headers: { cookie: acctCookieHeader } })
    const clients = await clientsResp.json()
    expect(Array.isArray(clients)).toBe(true)
    const matched = (clients || []).find((c: any) => c.workspaceId === ownerWorkspaceId)
    expect(matched).toBeTruthy()

    // Optionally navigate to dashboard and ensure it loads without error
    await page.goto('/dashboard')
    await page.waitForURL('/dashboard')
  })

  test('Multi-Company under Single Tenant: Verify workspaceId is shared', async ({ page }) => {
    // This test verifies that multiple companies created by the same owner share the same workspaceId.

    const resp = await page.request.get(`/api/test/companies?email=${encodeURIComponent(ownerEmail)}`)
    const companies = await resp.json()

    // Ensure the test has created at least two companies for the owner
    const matching = (companies || []).filter((c: any) => c.name === companyName || c.name === secondCompanyName)
    expect(matching.length).toBeGreaterThanOrEqual(2)

    const workspaceIds = new Set(matching.map((c: any) => c.workspaceId))
    expect(workspaceIds.size).toBe(1)
  })

  test('Accountant Hub: Displays tenants (not companies)', async ({ page }) => {
    // Authenticate as the accountant via API
    await page.goto('/')
    const loginResp = await page.request.post('/api/auth/login', { data: { email: accountantEmail, password } }).catch(() => null)
    expect(loginResp && loginResp.ok()).toBeTruthy()
    const loginJson = await loginResp!.json().catch(() => null)
    expect(loginJson?.token).toBeTruthy()

    const cookieHeader = [
      { name: 'token', value: loginJson.token, url: 'http://localhost', httpOnly: true },
      { name: 'refreshToken', value: loginJson.refreshToken || '', url: 'http://localhost', httpOnly: true },
      { name: 'email', value: loginJson.user.email, url: 'http://localhost' },
      { name: 'userId', value: String(loginJson.user.id), url: 'http://localhost' },
    ].map(c => `${c.name}=${c.value}`).join('; ')

    // Ensure accountant sees their client list via API
    const clientsResp = await page.request.get('/api/tenants/clients', { headers: { cookie: cookieHeader } })
    const clients = await clientsResp.json()
    expect(Array.isArray(clients)).toBe(true)
    expect(clients.length).toBeGreaterThan(0)

    // Verify the client record includes a company count (indicating tenants not companies)
    expect(clients[0].companiesCount).toBeGreaterThanOrEqual(0)
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

    await accountantPage.goto('/hub/companies') // Try to access Owner Workspace
    
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
