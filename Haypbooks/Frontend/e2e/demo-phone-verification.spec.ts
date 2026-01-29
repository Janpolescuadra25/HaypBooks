import { test, expect } from '@playwright/test'
import fs from 'fs'
import path from 'path'

async function waitForBackend(request: any, timeoutSec = 30) {
  const url = 'http://127.0.0.1:4000/api/health'
  const start = Date.now()
  while ((Date.now() - start) / 1000 < timeoutSec) {
    try {
      const res = await request.get(url)
      if (res.ok()) return
    } catch (e) {
      // ignore and retry
    }
    await new Promise((r) => setTimeout(r, 1000))
  }
  throw new Error('Timed out waiting for backend at ' + url)
}

// Demo: sign up with phone, create deterministic OTP via test endpoint, verify via phone flow UI
test('demo: signup → phone verification demo', async ({ page, request }) => {
  // Ensure backend is ready
  await waitForBackend(request)
  const outDir = path.join(__dirname, 'screenshots')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  const email = `e2e-phone-${Date.now()}@haypbooks.test`
  const phone = `+1555${String(1000000 + Math.floor(Math.random() * 9000000)).slice(1)}`
  const password = 'DemoPass!23'

  // Create user via test helper endpoint (createUser). If disabled, fall back to standard signup API
  let createUser = await request.post('http://127.0.0.1:4000/api/test/create-user', { data: { email, password, name: 'Demo Phone', phone } })
  if (!createUser.ok()) {
    const txt = await createUser.text().catch(() => null)
    console.warn('createUser test endpoint failed', createUser.status(), txt)
    // If disabled (403) fall back to signup API
    const signupRes = await request.post('http://127.0.0.1:4000/api/auth/signup', { data: { email, password, name: 'Demo Phone', phone } })
    expect(signupRes.ok()).toBeTruthy()
  } else {
    expect(createUser.ok()).toBeTruthy()
  }

  // Create deterministic OTP for this phone using the test helper endpoint when available. If not, call the phone send-code endpoint to trigger a dev OTP
  let create = await request.post('http://127.0.0.1:4000/api/test/create-otp', { data: { phone, otp: '654321', purpose: 'VERIFY_PHONE' } })
  let devOtp: string | null = null
  if (!create.ok()) {
    const txt = await create.text().catch(() => null)
    console.warn('create-otp test endpoint failed', create.status(), txt)
    // Trigger phone send-code which returns dev OTP in dev mode
    const send = await request.post('http://127.0.0.1:4000/api/auth/phone/send-code', { data: { phone } })
    if (send.ok()) {
      const sjson = await send.json().catch(() => null)
      devOtp = sjson?.otp || sjson?.otpCode || null
    }
  } else {
    expect(create.ok()).toBeTruthy()
    const j = await create.json().catch(() => null)
    devOtp = j?.otp || j?.otpCode || null
  }

  // Login via backend API and set cookies in browser
  const loginRes = await request.post('http://127.0.0.1:4000/api/auth/login', { data: { email, password } })
  expect(loginRes.ok()).toBeTruthy()
  const loginJson = await loginRes.json()
  await page.context().addCookies([
    { name: 'token', value: loginJson.token, url: 'http://localhost', httpOnly: true },
    { name: 'refreshToken', value: loginJson.refreshToken, url: 'http://localhost', httpOnly: true },
    { name: 'email', value: loginJson.user.email, url: 'http://localhost' },
    { name: 'userId', value: String(loginJson.user.id), url: 'http://localhost' },
    { name: 'role', value: loginJson.user.role || '', url: 'http://localhost' },
  ])

  // Ensure client uses same-origin API for deterministic cookie behavior
  await page.addInitScript(() => { (window as any).__API_BASE_URL = '' })

  // Go to verification page
  await page.goto(`/verification`)
  await page.waitForURL(/\/verification/)
  await page.screenshot({ path: path.join(outDir, 'verification-options-phone.png'), fullPage: true })

  // Ensure masked phone is visible in options (last 4 digits) and then click Send Code to Phone
  const last4 = phone.slice(-4)
  await page.waitForSelector(`text=${last4}`, { timeout: 10000 })

  // Select the phone option and continue (UI uses 'Continue' primary button)
  await page.click('label:has-text("Text Message")')
  const sendBtn = page.locator('button:has-text("Continue")')
  await sendBtn.waitFor({ state: 'visible', timeout: 10000 })
  await sendBtn.click()

  // Ensure phone form visible
  await page.waitForSelector('text=Enter verification code', { timeout: 5000 })

  // Fill the deterministic OTP (prefer devOtp from send/create endpoints)
  const code = devOtp ? String(devOtp).padStart(6, '0') : '654321'
  for (let i = 0; i < 6; i++) {
    await page.fill(`input[aria-label="Verification code digit ${i + 1}"]`, code[i])
  }

  // Click verify
  await page.getByRole('button', { name: /Verify OTP|Verify code/i }).click()

  // Expect redirect to hub selection
  await page.waitForURL('/workspace')
  await page.screenshot({ path: path.join(outDir, 'verification-complete-phone.png'), fullPage: true })

})
