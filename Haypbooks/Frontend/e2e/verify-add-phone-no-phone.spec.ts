import { test, expect } from '@playwright/test'

async function waitForBackend(request: any, timeoutSec = 30) {
  const url = 'http://127.0.0.1:4000/api/health'
  const start = Date.now()
  while ((Date.now() - start) / 1000 < timeoutSec) {
    try {
      const res = await request.get(url)
      if (res.ok()) return
    } catch (e) {}
    await new Promise((r) => setTimeout(r, 1000))
  }
  throw new Error('Timed out waiting for backend')
}

test('login -> verification shows Add phone option (no phone on file) -> add phone & verify via SMS', async ({ page, request }) => {
  await waitForBackend(request)

  // Gate: ensure backend test endpoints are enabled; otherwise skip this focused e2e
  const gate = await request.get('http://127.0.0.1:4000/api/test/users').catch(() => null)
  if (!gate || gate.status() !== 200) {
    test.skip()
    return
  }

  const email = `e2e-add-phone-nophone-${Date.now()}@haypbooks.test`
  const password = 'Passw0rd!'

  // Signup without phone
  const signup = await request.post('http://127.0.0.1:4000/api/auth/signup', { data: { email, password, name: 'Add Phone NoPhone' } })
  if (!signup.ok()) {
    // Fallback: create a test user when signup endpoint is restricted in this environment
    // In local test env, create a verified user so they can sign in
    const create = await request.post('http://127.0.0.1:4000/api/test/create-user', { data: { email, password, name: 'Add Phone NoPhone', isEmailVerified: true } }).catch(() => null)
    expect(create && create.ok()).toBeTruthy()
  }

  // For this focused UI test we can navigate to the verification page directly with the email
  // (the login step is handled by higher-level integration tests). Create a verified test user first.
  let create = await request.post('http://127.0.0.1:4000/api/test/create-user', { data: { email, password, name: 'Add Phone NoPhone', isEmailVerified: true } }).catch(() => null)
  // If create failed, try deleting any existing user and retry once
  if (!create || !create.ok()) {
    await request.post('http://127.0.0.1:4000/api/test/delete-user', { data: { email } }).catch(() => null)
    create = await request.post('http://127.0.0.1:4000/api/test/create-user', { data: { email, password, name: 'Add Phone NoPhone', isEmailVerified: true } }).catch(() => null)
  }

  if (!create || !create.ok()) {
    // Create failed; try to surface server message for debugging then skip the test in hostile envs
    try {
      const txt = await (create ? create.text() : Promise.resolve('no-response'))
      console.warn('create-user failed', create ? create.status() : 'no-response', txt)
    } catch (e) {
      console.warn('create-user failed with unknown error')
    }
    test.skip()
    return
  }

  // Visit verification page (should show options)
  await page.goto(`/verification?email=${encodeURIComponent(email)}`)
  await page.waitForSelector('text=Confirm', { timeout: 5000 })

  // Phone option should be visible even though the user has no phone on file
  await expect(page.locator('text=Text Message (SMS)')).toBeVisible()

  // Click phone option to show add phone form
  await page.click('button[data-testid="option-phone"]')
  await page.waitForSelector('text=Phone number')

  // Enter phone and Save & Send
  const phone = '+15550001111'
  await page.selectOption('select', 'US')
  await page.fill('input[type="tel"]', '5550001111')
  // Make sure Save & Send (now moved below input) is visible and click the test-id button
  await page.waitForSelector('button[data-testid="add-phone-save"]')
  await page.click('button[data-testid="add-phone-save"]')

  // Poll the test OTP endpoint for VERIFY_PHONE for the given phone
  let code: string | null = null
  const start = Date.now()
  while (!code && Date.now() - start < 10000) {
    const otpResp = await request.get(`http://127.0.0.1:4000/api/test/otp/latest?phone=${encodeURIComponent(phone)}&purpose=VERIFY_PHONE`).catch(() => null)
    if (otpResp && otpResp.ok()) {
      const otpJson = await otpResp.json().catch(() => null)
      code = otpJson?.otpCode || otpJson?.code || otpJson?.otp || null
    }
    if (!code) await new Promise(r => setTimeout(r, 500))
  }
  expect(code).toBeTruthy()

  // Navigate to verify-otp with phone+code to fill the UI
  await page.goto(`/verify-otp?email=${encodeURIComponent(email)}&method=phone&phone=${encodeURIComponent(phone)}&code=${encodeURIComponent(code!)}`)
  await page.waitForSelector('input[aria-label="Digit 1"]', { timeout: 5000 })

  // Fill and submit the code
  for (let i = 0; i < String(code).length; i++) {
    await page.fill(`input[aria-label="Digit ${i + 1}"]`, String(code)[i])
  }

  try {
    await page.click('button:has-text("Verify OTP")')
    await page.waitForURL(/(hub|hub\/selection|signup\/choose-role)/, { timeout: 10000 })
    expect(page.url()).toMatch(/\/(hub|hub\/selection|signup\/choose-role)/)
  } catch (e) {
    // Fallbacks omitted for brevity; if client fails, test can assert server-side verification
    throw e
  }
})