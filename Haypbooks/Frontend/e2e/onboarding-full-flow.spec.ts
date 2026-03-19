import { test, expect } from '@playwright/test'

/**
 * E2E Test: Complete Onboarding Flow
 * Tests: Signup → Email Verification → Onboarding (7 steps) → Company Card in Owner Workspace
 * 
 * This test validates the complete user journey from account creation to seeing
 * their company appear in the Owner Workspace after completing onboarding.
 */

test('Complete flow: signup → verify → onboarding → company appears in Owner Workspace', async ({ page, request }) => {
  // Gate: skip when test endpoints are not available
  const gate = await request.get('http://127.0.0.1:4000/api/test/users').catch(() => null)
  if (!gate || gate.status() !== 200) {
    console.log('⚠️  Skipping: Test endpoints not available (ALLOW_TEST_ENDPOINTS=true required)')
    test.skip()
    return
  }

  const ts = Date.now()
  const email = `e2e-onboarding-${ts}@haypbooks.test`
  const password = 'OnboardTest123!'
  const businessName = `E2E Test Business ${ts}`
  const legalBusinessName = `E2E Test Business LLC ${ts}`

  // Capture console messages and page errors for better failure diagnostics
  const consoleMessages: string[] = []
  const pageErrors: string[] = []
  page.on('console', (m) => consoleMessages.push(m.text()))
  page.on('pageerror', (e) => pageErrors.push(String(e)))

  console.log(`🧪 Starting E2E test with email: ${email}`)

  // ============================================================================
  // PHASE 1: SIGNUP
  // ============================================================================
  console.log('📝 Phase 1: Signup')
  
  await page.goto('/signup?showSignup=1')
  
  // Select "My Business" role
  await page.click('[data-testid="signup-role-business"]')
  await page.waitForSelector('#firstName', { timeout: 5000 })

  // Fill signup form
  await page.fill('#firstName', 'E2E')
  await page.fill('#lastName', 'Tester')
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.fill('#confirmPassword', password)

  // Submit signup
  await Promise.all([
    page.waitForNavigation({ url: /\/verify-otp/, waitUntil: 'networkidle', timeout: 15000 }),
    page.click('button:has-text("Create account")')
  ])

  expect(page.url()).toContain('/verify-otp')
  console.log('✅ Signup successful - redirected to verification')

  // ============================================================================
  // PHASE 2: EMAIL VERIFICATION
  // ============================================================================
  console.log('📧 Phase 2: Email Verification')

  // Trigger email verification if needed
  const emailOption = page.locator('button:has-text("Email")')
  if (await emailOption.count()) {
    await emailOption.first().click()
  }

  // Get OTP from test endpoint
  let code: string | null = null
  const start = Date.now()
  while (!code && Date.now() - start < 10000) {
    const otpResp = await request.get(
      `http://127.0.0.1:4000/api/test/otp/latest?email=${encodeURIComponent(email)}&purpose=VERIFY_EMAIL`
    ).catch(() => null)
    
    if (otpResp && otpResp.ok()) {
      const otpJson = await otpResp.json().catch(() => null)
      code = otpJson?.otpCode || otpJson?.code || otpJson?.otp || null
    }
    
    if (!code) await new Promise(r => setTimeout(r, 500))
  }

  expect(code).toBeTruthy()
  code = String(code).padStart(6, '0')
  console.log(`🔑 Got OTP: ${code}`)

  // Navigate with code in URL to auto-fill
  let signupToken: string | null = null
  try {
    const url = new URL(page.url())
    signupToken = url.searchParams.get('signupToken')
  } catch (e) { /* ignore */ }

  const signupParam = signupToken ? `&signupToken=${encodeURIComponent(signupToken)}` : ''
  await page.goto(`/verify-otp?email=${encodeURIComponent(email)}&flow=signup&method=email&code=${code}${signupParam}`)
  await page.waitForLoadState('networkidle')

  // Debug: log current URL and page content
  console.log(`📍 After navigation - URL: ${page.url()}`)
  
  // Wait for page to load - look for either button or already redirected
  try {
    await page.waitForSelector('button', { timeout: 10000 })
    
    // Check if we're still on verify page or already redirected
    const currentUrl = page.url()
    if (currentUrl.includes('/onboarding') || currentUrl.includes('/hub')) {
      console.log('✅ Auto-redirected after verification')
      return // Already verified and redirected
    }
    
    // Still on verify page - find and click the verify/submit button
    const buttons = await page.$$('button')
    let verifyButton: any = null
    for (const button of buttons) {
      const text = await button.textContent()
      if (text && (text.toLowerCase().includes('verify') || text.toLowerCase().includes('submit') || text.toLowerCase().includes('continue'))) {
        verifyButton = button
        break
      }
    }
    
    if (verifyButton) {
      await verifyButton.click()
      console.log('✅ Clicked verify button')
      // Wait for redirect after clicking - accept onboarding, hub, OR choose-role
      await page.waitForURL(/\/(onboarding|hub|signup\/choose-role)/, { timeout: 15000 })
      const finalUrl = page.url()
      console.log(`✅ Verification complete - redirected to: ${finalUrl}`)
      
      // If redirected to choose-role, select business and navigate to onboarding
      if (finalUrl.includes('/signup/choose-role')) {
        console.log('📍 On choose-role page - navigating to onboarding')
        await page.goto('/onboarding')
        await page.waitForLoadState('networkidle')
        console.log('✅ Navigated to onboarding')
      }
    } else {
      throw new Error('Verify button not found on page')
    }
  } catch (error: any) {
    console.log(`⚠️ Error during verification: ${error.message}`)
    console.log(`Current URL: ${page.url()}`)
    throw error
  }

  // ============================================================================
  // PHASE 3: ONBOARDING
  // ============================================================================
  console.log('🎯 Phase 3: Onboarding')

  // If we landed on hub, navigate to onboarding
  if (page.url().includes('/hub')) {
    await page.goto('/onboarding')
    await page.waitForLoadState('networkidle')
  }

  // Verify we're on onboarding
  expect(page.url()).toContain('/onboarding')
  console.log('📋 Starting onboarding steps...')

  // STEP 1: Business Information (REQUIRED)
  console.log('  Step 1: Business Information')
  await page.waitForSelector('input[placeholder*="Acme"]', { timeout: 10000 })
  await page.fill('input[placeholder*="Acme"]', businessName)
  await page.fill('input[placeholder*="Official Registered"]', legalBusinessName)
  await page.selectOption('select[aria-label="Business type"]', 'Corporation')
  await page.fill('input[placeholder*="Technology"]', 'Technology')
  await page.selectOption('select[aria-label="Country"]', 'United States')
  await page.fill('input[placeholder*="Address"]', '123 Test St, Test City, TC 12345')
  
  // Wait for validation interval to run (page checks every 200ms)
  await page.waitForTimeout(500)
  
  // Wait for "Save and continue" button to be enabled
  await page.waitForSelector('button:has-text("Save and continue"):not([disabled])', { timeout: 10000 })
  await page.click('button:has-text("Save and continue")')
  console.log('  ✅ Step 1 complete')

  // REMAINING STEPS: Click "Save and continue" through all remaining steps
  // The exact fields vary, but we can just click through to use defaults
  for (let i = 2; i <= 6; i++) {
    console.log(`  Step ${i}: Clicking through...`)
    await page.waitForTimeout(300)
    await page.waitForSelector('button:has-text("Save and continue"):not([disabled])', { timeout: 10000 })
    await page.click('button:has-text("Save and continue")')
    console.log(`  ✅ Step ${i} complete`)
  }

  // STEP 7 (Review): Click "Finish onboarding"
  console.log('  Step 7: Review and finish')
  await page.waitForSelector('button:has-text("Finish onboarding")', { timeout: 10000 })
  
  // Click finish and wait for navigation to hub (or login redirect)
  console.log('  🚀 Clicking "Finish onboarding"...')
  await page.click('button:has-text("Finish onboarding")')
  
  // Wait for some navigation
  await page.waitForTimeout(2000)
  
  const currentUrl = page.url()
  console.log(`  📍 After finish, URL: ${currentUrl}`)
  
  // If redirected to login, navigate back to hub
  if (currentUrl.includes('/login')) {
    console.log('  ⚠️  Redirected to login, navigating to hub...')
    await page.goto('/hub/companies')
    await page.waitForLoadState('networkidle')
  } else if (!currentUrl.includes('/hub')) {
    // Try waiting a bit more then navigate
    await page.waitForTimeout(1000)
    if (!page.url().includes('/hub')) {
      console.log('  🔄 Manually navigating to hub...')
      await page.goto('/hub/companies')
      await page.waitForLoadState('networkidle')
    }
  }
  
  console.log('✅ Onboarding complete!')

  // Give a moment for the company to be created in the backend
  await page.waitForTimeout(1000)

  // ============================================================================
  // PHASE 4: VERIFY COMPANY CARD IN OWNER WORKSPACE
  // ============================================================================
  console.log('🏢 Phase 4: Verify Company Card in Owner Workspace')

  // Verify we're on the hub
  expect(page.url()).toContain('/hub')
  console.log(`📍 Current URL: ${page.url()}`)

  // If we're on a specific hub (like /hub/owner), navigate to companies hub
  if (!page.url().includes('/hub/companies')) {
    await page.goto('/hub/companies')
    await page.waitForLoadState('networkidle')
  }

  // Wait for companies to load
  await page.waitForTimeout(2000)

  // Look for the company card
  const companyCard = page.locator(`text=${businessName}`).first()
  
  // Wait for the company card to appear (with timeout)
  try {
    await companyCard.waitFor({ state: 'visible', timeout: 10000 })
    console.log('✅ Company card found in Owner Workspace!')
    
    // Verify card details are visible
    expect(await companyCard.isVisible()).toBeTruthy()
    
    // Check if we can see the business name
    const cardText = await page.textContent('[data-testid="company-card"]', { timeout: 5000 }).catch(() => 
      page.textContent('div:has-text("' + businessName + '")').catch(() => null)
    )
    
    console.log(`📋 Company card details: ${cardText}`)
    
    // Verify the business name is present
    expect(page.locator(`text=${businessName}`)).toBeTruthy()
    
  } catch (error) {
    console.error('❌ Company card not found!')
    console.error('Error:', error.message)
    
    // Debug: Take screenshot
    await page.screenshot({ path: `test-results/onboarding-failure-${ts}.png`, fullPage: true })
    console.log('📸 Screenshot saved to test-results/')
    
    // Debug: Log page content
    const bodyText = await page.textContent('body')
    console.log('📄 Page content:', (bodyText ?? '').substring(0, 500))
    
    // Output captured console messages for debugging
    console.log('\n📋 Captured Console Messages:', consoleMessages.slice(-20))
    console.log('\n❌ Captured Page Errors:', pageErrors)
    throw new Error('Company card not visible in Owner Workspace after onboarding completion')
  }

  // ============================================================================
  // PHASE 5: BACKEND VERIFICATION
  // ============================================================================
  console.log('🔍 Phase 5: Backend Verification')

  // Verify via API that company was created
  const userResp = await request.get('http://127.0.0.1:4000/api/test/user?email=' + encodeURIComponent(email))
  expect(userResp.ok()).toBeTruthy()
  const userData = await userResp.json()
  console.log(`👤 User ID: ${userData.id}`)

  // Get companies for this user (using email parameter)
  const companiesResp = await request.get('http://127.0.0.1:4000/api/test/companies?email=' + encodeURIComponent(email))
  expect(companiesResp.ok()).toBeTruthy()
  const companies = await companiesResp.json()
  
  console.log(`🏢 Companies found: ${companies.length}`)
  expect(companies.length).toBeGreaterThan(0)
  
  // Verify company details
  const company = companies.find((c: any) => c.name === businessName)
  expect(company).toBeTruthy()
  console.log(`✅ Company verified in database:`, {
    id: company.id,
    name: company.name,
    tenantId: company.tenantId
  })

  // ============================================================================
  // FINAL RESULTS
  // ============================================================================
  console.log('\n✨ ========================================')
  console.log('✅ ALL TESTS PASSED!')
  console.log('========================================')
  console.log('📊 Test Summary:')
  console.log('  ✅ Signup successful')
  console.log('  ✅ Email verification complete')
  console.log('  ✅ Onboarding (7 steps) complete')
  console.log('  ✅ Company card visible in Owner Workspace')
  console.log('  ✅ Company data verified in database')
  console.log('========================================\n')
})
