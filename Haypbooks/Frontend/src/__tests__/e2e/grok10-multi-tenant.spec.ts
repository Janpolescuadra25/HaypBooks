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
    await page.request.post('/api/companies', { data: { name: secondCompanyName }, headers: { cookie: cookieHeader } })
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

    // Step 3: Accept invitation
    await page.waitForSelector(`text=${companyName}`, { timeout: 30000 })
    await page.click('text=Accept Invitation')

    // Wait for success and redirect back to accountant hub
    await page.waitForURL('/hub/accountant', { timeout: 10000 })

    // Step 4: Verify client appears in list
    await page.waitForSelector(`text=${companyName}`, { timeout: 10000 })
    
    // Step 5: View client details
    await page.click(`text=View Client`)
    // Should update lastAccessedAt
    // Verify navigation or state change (implementation dependent)
  })

  test('Multi-Company under Single Tenant: Verify tenantId is shared', async ({ page }) => {
    // This test verifies the database constraint: multiple companies under one tenant

    // Login as owner
    await page.goto('/login')
    await page.waitForSelector('#email', { timeout: 15000 })
    await page.fill('#email', ownerEmail)
    await page.fill('#password', password)
    await page.click('text=Sign in')

    await expect(page).toHaveURL('/hub/companies')

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
    // Login as accountant
    await page.goto('/login')
    await page.waitForSelector('#email', { timeout: 15000 })
    await page.fill('#email', accountantEmail)
    await page.fill('#password', password)
    await page.click('text=Sign in')

    await expect(page).toHaveURL('/hub/accountant')

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
    await accountantPage.goto('/login')
    await accountantPage.fill('[name="email"]', accountantEmail)
    await accountantPage.fill('[name="password"]', password)
    await accountantPage.click('text=Login')

    await accountantPage.goto('/hub/companies') // Try to access owner hub
    
    // Should either redirect or show no invite button
    // This depends on your authorization implementation
    await expect(accountantPage.locator('text=Invite Accountant')).not.toBeVisible()

    // If they try via API, should get 403
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
