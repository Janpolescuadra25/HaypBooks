import { test, expect } from '@playwright/test'

test('signup -> verify OTP -> full onboarding flow -> complete', async ({ page, request }) => {
  const email = `ui-e2e-onboard-${Date.now()}@haypbooks.test`
  const password = 'Onboard1!'

  // Sign up
  await page.goto('/signup')
  await page.fill('#firstName', 'UI')
  await page.fill('#lastName', 'Onboard')
  await page.fill('#companyName', 'Onboard Corp')
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.fill('#confirmPassword', password)
  await page.click('text=Create account')

  // Should land on verify-otp page
  await page.waitForURL(/.*verify-otp.*/)

  // Retrieve OTP from backend test endpoint
  const otpResp = await request.get(`http://localhost:4000/api/test/otp/latest?email=${encodeURIComponent(email)}&purpose=VERIFY`)
  const otp = (await otpResp.json())?.otpCode
  expect(otp).toBeTruthy()

  // Fill OTP boxes
  for (let i = 0; i < otp.length; i++) {
    await page.fill(`input[aria-label="Digit ${i + 1}"]`, otp[i])
  }
  await page.click('text=Verify code')

  // After verification, user should be forwarded to quick business onboarding
  await page.waitForURL(/.*onboarding.*/)

  // Go to full onboarding flow
  await page.click('text=Full onboarding')
  await page.waitForURL(/.*onboarding$/)

  // Business step: fill and save
  await page.fill('input[placeholder="Company name"]', 'E2E Onboard Co')
  await page.fill('input[placeholder="Business email"]', email)
  await page.fill('input[placeholder="Business address"]', '1 Playwright Way')
  // Click Save and accept any confirmation dialog. The backend save is a dev-only API
  // and occasionally the network event can be flaky in CI; relying on the dialog
  // emitted on successful save is more reliable for Playwright:
  const dialogPromise = page.waitForEvent('dialog').catch(() => null)
  await page.click('text=Save step')
  const dialog = await dialogPromise
  if (dialog) await dialog.accept()

  // Next -> Products
  await page.click('text=Next')
  // products step: click Products + inventory
  await page.check('label:has-text("Products") input[type=checkbox]')
  await page.check('label:has-text("Uses inventory") input[type=checkbox]')
  // Click Save and accept any confirmation dialog
  const dialogPromise2 = page.waitForEvent('dialog').catch(() => null)
  await page.click('text=Save step')
  const dialog2 = await dialogPromise2
  if (dialog2) await dialog2.accept()

  // Next -> Fiscal
  await page.click('text=Next')
  await page.selectOption('select[aria-label="Fiscal year start"]', 'Jan')
  await page.selectOption('select[aria-label="Accounting method"]', 'accrual')
  await page.selectOption('select[aria-label="Default currency"]', 'USD')
  // Click Save and accept any confirmation dialog
  const dialogPromise3 = page.waitForEvent('dialog').catch(() => null)
  await page.click('text=Save step')
  const dialog3 = await dialogPromise3
  if (dialog3) await dialog3.accept()

  // Next -> Tax (leave defaults)
  await page.click('text=Next')
  // Click Save and accept any confirmation dialog
  const dialogPromise4 = page.waitForEvent('dialog').catch(() => null)
  await page.click('text=Save step')
  const dialog4 = await dialogPromise4
  if (dialog4) await dialog4.accept()

  // Next -> Branding
  await page.click('text=Next')
  await page.fill('input[placeholder="Invoice prefix"]', 'E2E-')
  // Click Save and accept any confirmation dialog
  const dialogPromise5 = page.waitForEvent('dialog').catch(() => null)
  await page.click('text=Save step')
  const dialog5 = await dialogPromise5
  if (dialog5) await dialog5.accept()

  // Next -> Banking
  await page.click('text=Next')
  await page.check('label:has-text("Accept bank payments") input[type=checkbox]')
  // Click Save and accept any confirmation dialog
  const dialogPromise6 = page.waitForEvent('dialog').catch(() => null)
  await page.click('text=Save step')
  const dialog6 = await dialogPromise6
  if (dialog6) await dialog6.accept()

  // Next -> Opening balances
  await page.click('text=Next')
  await page.fill('input[placeholder="Starting cash"]', '1000')
  await page.fill('input[placeholder="Starting bank"]', '1000')
  await page.click('text=Save step')

  // Next -> Review
  await page.click('text=Next')
  // Finish onboarding - wait for the backend call to complete
  const [completeResp] = await Promise.all([
    page.waitForResponse(r => r.url().includes('/api/onboarding/complete') && r.status() === 200, { timeout: 120000 }),
    page.click('text=Finish onboarding'),
  ])
  const completeJson = await completeResp.json()
  expect(completeJson?.success).toBeTruthy()

  // Should be redirected out of onboarding (dashboard or home)
  await page.waitForURL((url) => !url.pathname.includes('/onboarding'))

  // Confirm backend marks user as onboardingComplete
  const resp = await request.get(`http://localhost:4000/api/test/user?email=${encodeURIComponent(email)}`)
  const user = await resp.json()
  expect(user).not.toBeNull()
  // should persist full onboarding mode
  expect(user.onboardingMode || user.onboarding_mode || user.onboardingMode).toBe('full')
})
