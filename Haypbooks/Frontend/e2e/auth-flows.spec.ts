import { test, expect } from '@playwright/test'

const BACKEND = 'http://localhost:4000'

function makeEmail(prefix: string) {
  return `${prefix}-${Date.now()}@haypbooks.test`
}

async function createTestUser(request: any, email: string, password: string, name: string) {
  const response = await request.post(`${BACKEND}/api/test/create-user`, {
    data: { email, password, name },
  })
  expect(response.ok()).toBeTruthy()
}

async function fetchOtp(request: any, email: string, purpose: string) {
  const response = await request.get(`${BACKEND}/api/test/otp/latest?email=${encodeURIComponent(email)}&purpose=${purpose}`)
  expect(response.ok()).toBeTruthy()
  const payload = await response.json().catch(() => null)
  expect(payload?.otpCode).toBeTruthy()
  return payload.otpCode
}

test.describe('Auth flows', () => {
  test('login with valid credentials', async ({ page, request }) => {
    const email = makeEmail('ui-e2e-login')
    const password = 'Playwright1!'
    await createTestUser(request, email, password, 'E2E Login')

    await page.goto('/login')
    await page.fill('#email', email)
    await page.fill('#password', password)
    await page.getByRole('button', { name: /sign in/i }).click()

    await page.waitForURL(/\/(hub|onboarding|get-started|dashboard)/, { timeout: 20000 })
    expect(page.url()).toMatch(/\/(hub|onboarding|get-started|dashboard)/)
  })

  test('signup via UI and verify OTP', async ({ page, request }) => {
    const email = makeEmail('ui-e2e-signup')
    const password = 'Playwright1!'

    await page.goto('/signup?showSignup=1')
    await page.getByRole('button', { name: /My Business|Accountant/i }).first().click()
    await page.waitForSelector('#firstName', { timeout: 15000 })
    await page.fill('#firstName', 'E2E')
    await page.fill('#lastName', 'Signup')
    await page.waitForSelector('#phone', { timeout: 10000 })
    await page.fill('#phone', '+63 912 345 6789')
    await page.fill('#email', email)
    await page.fill('#password', password)
    await page.fill('#confirmPassword', password)
    await page.getByRole('button', { name: /Create account/i }).click()

    await page.waitForURL(/.*verify-otp.*/, { timeout: 20000 })
    if ((await page.locator('button:has-text("Email")').count()) > 0) {
      await page.getByRole('button', { name: /Email/i }).click()
    }

    const otp = await fetchOtp(request, email, 'VERIFY')
    await page.waitForSelector('input[aria-label="Digit 1"]', { timeout: 10000 })
    for (let i = 0; i < otp.length; i += 1) {
      await page.fill(`input[aria-label="Digit ${i + 1}"]`, otp[i])
    }
    await page.getByRole('button', { name: /Verify OTP|Verify code|Continue/i }).click()

    await page.waitForURL(/\/(onboarding|get-started|hub)/, { timeout: 20000 })
    expect(page.url()).toMatch(/\/(onboarding|get-started|hub)/)
  })

  test('forgot password can reset credentials', async ({ page, request }) => {
    const email = makeEmail('ui-e2e-forgot')
    const password = 'OrigPass1!'
    const newPassword = 'NewPass1!'
    await createTestUser(request, email, password, 'E2E Forgot')

    await page.goto('/forgot-password')
    await page.fill('#email', email)
    await page.getByRole('button', { name: /Send reset instructions/i }).click()

    await page.waitForURL(/.*verify-otp.*/, { timeout: 20000 })
    if ((await page.locator('button:has-text("Email")').count()) > 0) {
      await page.getByRole('button', { name: /Email/i }).click()
    }

    const otp = await fetchOtp(request, email, 'RESET')
    await page.waitForSelector('input[aria-label="Digit 1"]', { timeout: 10000 })
    for (let i = 0; i < otp.length; i += 1) {
      await page.fill(`input[aria-label="Digit ${i + 1}"]`, otp[i])
    }
    await page.getByRole('button', { name: /Verify OTP|Verify code|Continue/i }).click()
    await page.waitForURL(/.*reset-password.*/, { timeout: 20000 })

    await page.fill('#password', newPassword)
    await page.fill('#confirm', newPassword)
    await page.getByRole('button', { name: /Reset password|Set new password/i }).click()

    await page.waitForURL(/.*login.*/, { timeout: 20000 })
    await page.goto('/login')
    await page.fill('#email', email)
    await page.fill('#password', newPassword)
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForURL(/\/(hub|onboarding|get-started|dashboard)/, { timeout: 20000 })
    expect(page.url()).toMatch(/\/(hub|onboarding|get-started|dashboard)/)
  })
})
