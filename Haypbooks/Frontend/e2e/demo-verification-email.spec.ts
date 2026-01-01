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

// Demo test: signup/login → verification flow (email-only) with screenshots
// Stores screenshots under e2e/screenshots/

test('demo: signup → verification (email flow) demo', async ({ page, request }) => {
  // Ensure backend is ready
  await waitForBackend(request)
  const outDir = path.join(__dirname, 'screenshots')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  const email = `e2e-demo-${Date.now()}@haypbooks.test`
  const password = 'DemoPass!23'

  // Try creating a user via test helper endpoint; if disabled, fall back to normal signup
  let createRes = await request.post('http://127.0.0.1:4000/api/test/create-user', { data: { email, password, name: 'Demo User' } })
  if (!createRes.ok()) {
    const txt = await createRes.text().catch(() => null)
    console.warn('create-user test endpoint failed', createRes.status(), txt)
    // If endpoints are disabled, use standard signup API and rely on dev OTP behavior
    const phone = '+15550009999'
    const signupRes = await request.post('http://127.0.0.1:4000/api/auth/signup', { data: { email, password, name: 'Demo User', phone } })
    expect(signupRes.ok()).toBeTruthy()
  } else {
    expect(createRes.ok()).toBeTruthy()
  }

  // Sign in via backend API and set cookies in the browser context to avoid CSR timing fragility
  const loginRes = await request.post('http://127.0.0.1:4000/api/auth/login', { data: { email, password } })
  expect(loginRes.ok()).toBeTruthy()
  const loginJson = await loginRes.json()
  await page.context().addCookies([
    { name: 'token', value: loginJson.token, url: 'http://localhost', httpOnly: true },
    { name: 'refreshToken', value: loginJson.refreshToken, url: 'http://localhost', httpOnly: true },
    { name: 'email', value: loginJson.user.email, url: 'http://localhost' },
    { name: 'userId', value: String(loginJson.user.id), url: 'http://localhost' },
    { name: 'role', value: loginJson.user.role || '', url: 'http://localhost' },
    // Also set cookies for 127.0.0.1 to be robust against client code that calls that host directly
    { name: 'token', value: loginJson.token, url: 'http://127.0.0.1', httpOnly: true },
    { name: 'refreshToken', value: loginJson.refreshToken, url: 'http://127.0.0.1', httpOnly: true },
    { name: 'email', value: loginJson.user.email, url: 'http://127.0.0.1' },
    { name: 'userId', value: String(loginJson.user.id), url: 'http://127.0.0.1' },
    { name: 'role', value: loginJson.user.role || '', url: 'http://127.0.0.1' },
  ])

  // Ensure client uses same-origin API for deterministic cookie behavior
  await page.addInitScript(() => { (window as any).__API_BASE_URL = '' })

  // Go directly to verification page (server should honor cookies and show verification options)
  await page.goto(`/verification?email=${encodeURIComponent(email)}`)
  await page.waitForURL(/\/verification/)
  await page.screenshot({ path: path.join(outDir, 'verification-options.png'), fullPage: true })

  // Choose email flow (new UI shows Email option + Continue)
  await page.click('label:has-text("Email")')
  const continueBtn = page.locator('button:has-text("Continue")')
  await continueBtn.waitFor({ state: 'visible', timeout: 10000 })
  await continueBtn.click()
  const emailParam = new URL(page.url()).searchParams.get('email') || ''

  // Trigger send-verification (dev-only: returns OTP). Capture dev OTP in response when available.
  const sendRes = await request.post('http://127.0.0.1:4000/api/auth/send-verification', { data: { email: emailParam } })
  let devOtp: string | null = null
  try { const sj = await sendRes.json(); devOtp = sj?.otp || sj?.otpCode || null } catch (e) { devOtp = null }

  // Wait for code entry
  await page.waitForSelector('text=Enter verification code', { timeout: 10000 })
  await page.screenshot({ path: path.join(outDir, 'verification-enter-code.png'), fullPage: true })

  // Retrieve OTP: prefer OTP returned by send-verification response (dev mode), otherwise query test endpoint
  let code = ''
  if (devOtp) {
    code = String(devOtp).padStart(6, '0')
  } else {
    const otpRes = await request.get(`http://127.0.0.1:4000/api/test/otp/latest?email=${encodeURIComponent(email)}`)
    const otpJson = await otpRes.json().catch(() => null)
    code = (otpJson && (otpJson.otpCode || otpJson.code)) ? String(otpJson.otpCode || otpJson.code).padStart(6, '0') : ''
  }
  expect(code.length).toBe(6)
  for (let i = 0; i < 6; i++) {
    await page.fill(`input[aria-label="Verification code digit ${i + 1}"]`, code[i])
  }

  // Click verify
  await page.getByRole('button', { name: /Verify OTP|Verify code/i }).click()

  // Wait for redirect to hub selection and assert the selection options are visible
  await page.waitForURL(/\/hub\/selection/, { timeout: 15000 })
  await page.waitForSelector('text=My Companies', { timeout: 10000 })
  await page.waitForSelector('text=My Practice', { timeout: 10000 })
  await page.screenshot({ path: path.join(outDir, 'post-verification-hub-selection.png'), fullPage: true })
})