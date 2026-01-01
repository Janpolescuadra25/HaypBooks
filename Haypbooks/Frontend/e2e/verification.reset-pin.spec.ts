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

// Reset PIN end-to-end
// - create user
// - set initial PIN server-side
// - go to verification -> Enter Your PIN -> Reset PIN
// - Send Code to Email -> fetch OTP via test endpoint -> verify
// - On success, complete PIN Setup (create new PIN)
// - Login and verify new PIN redirects to /hub

test('Reset PIN → OTP → Set PIN end-to-end', async ({ page, request }) => {
  await waitForBackend(request)

  const ts = Date.now()
  const email = `e2e-reset-${ts}@haypbooks.test`
  const password = 'ResetDemo!23'
  const initialPin = '111222'
  const newPin = '333444'
  const outDir = path.join(__dirname, 'screenshots')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  // Create user
  const phone = '+15550009999'
  const signupRes = await request.post('http://127.0.0.1:4000/api/auth/signup', { data: { email, password, name: 'Reset Demo', phone } })
  expect(signupRes.ok()).toBeTruthy()

  // Login to get token
  const loginRes = await request.post('http://127.0.0.1:4000/api/auth/login', { data: { email, password } })
  expect(loginRes.ok()).toBeTruthy()
  const loginJson = await loginRes.json()
  const token = loginJson.token

  // Set an initial PIN server-side so the 'Enter Your PIN' path is active
  const setupRes = await request.post('http://127.0.0.1:4000/api/auth/pin/setup', { data: { pin: initialPin, pinConfirm: initialPin }, headers: { Authorization: `Bearer ${token}` } })
  expect(setupRes.ok()).toBeTruthy()

  // Add cookies into the browser context (both localhost and 127.0.0.1)
  await page.context().addCookies([
    { name: 'token', value: token, url: 'http://localhost', httpOnly: true },
    { name: 'refreshToken', value: loginJson.refreshToken, url: 'http://localhost', httpOnly: true },
    { name: 'email', value: loginJson.user.email, url: 'http://localhost' },
    { name: 'userId', value: String(loginJson.user.id), url: 'http://localhost' },
    { name: 'token', value: token, url: 'http://127.0.0.1', httpOnly: true },
    { name: 'refreshToken', value: loginJson.refreshToken, url: 'http://127.0.0.1', httpOnly: true },
    { name: 'email', value: loginJson.user.email, url: 'http://127.0.0.1' },
    { name: 'userId', value: String(loginJson.user.id), url: 'http://127.0.0.1' },
  ])

  // Ensure same-origin usage
  await page.addInitScript(() => { (window as any).__API_BASE_URL = '' })

  // Relay browser console logs to the test for easier debugging
  page.on('console', (msg) => {
    // eslint-disable-next-line no-console
    console.log('[browser]', msg.type(), msg.text())
  })
  page.on('requestfailed', (req) => {
    // eslint-disable-next-line no-console
    console.warn('[browser][requestfailed]', req.method(), req.url(), req.failure()?.errorText)
  })
  page.on('request', (req) => {
    try {
      const url = req.url()
      if (url.includes('/api/auth/email/verify-code') || url.includes('/api/auth/verify-otp')) {
        // eslint-disable-next-line no-console
        console.log('[browser][request]', url, req.method(), req.postData())
      }
    } catch (e) {}
  })
  page.on('response', async (res) => {
    try {
      const url = res.url()
      if (url.includes('/api/auth/email/verify-code') || url.includes('/api/auth/verify-otp') || url.includes('/api/auth/email/send-code') || url.includes('/api/auth/send-verification')) {
        // eslint-disable-next-line no-console
        console.log('[browser][response]', url, res.status(), await res.text().catch(() => '<no body>'))
      }
    } catch (e) {}
  })

  // Navigate to verification
  await page.goto(`/verification?email=${encodeURIComponent(email)}`)
  await page.waitForURL(/\/verification/)
  await page.screenshot({ path: path.join(outDir, 'reset-start.png'), fullPage: true })

  // Click Enter Your PIN
  const enterBtn = page.locator('button:has-text("Enter Your PIN")')
  await enterBtn.waitFor({ state: 'visible', timeout: 10000 })
  await enterBtn.click()

  // Wait for PIN entry
  await page.waitForSelector('text=Enter your 6-digit PIN', { timeout: 10000 })
  await page.screenshot({ path: path.join(outDir, 'pin-entry-before-reset.png'), fullPage: true })

  // Click Reset PIN -> should open email flow
  await page.click('text=Reset PIN')

  // Wait for send code option
  const sendWhich = await Promise.race([
    page.waitForSelector('text=Send Code to Email', { timeout: 5000 }).then(() => 'send').catch(() => null),
    page.waitForSelector('text=Enter verification code', { timeout: 5000 }).then(() => 'enterCode').catch(() => null),
    page.waitForSelector('text=Create a 6-digit PIN', { timeout: 5000 }).then(() => 'setup').catch(() => null),
  ])

  if (sendWhich === 'send') {
    await page.click('text=Send Code to Email')
  }

  // Wait for the verification code entry
  await page.waitForSelector('text=Enter verification code', { timeout: 10000 })

  // Click the 'Send code' button in the email form to ensure OTP is generated
  const sendCodeBtn = page.locator('button:has-text("Send code")')
  let sendEmailOtp: string | null = null
  if (await sendCodeBtn.isVisible().catch(() => false)) {
    // Wait for the client to call email/send-code and capture its response (dev returns OTP in body)
    const respPromise = page.waitForResponse((r) => r.url().includes('/api/auth/email/send-code'))
    await sendCodeBtn.click()
    const sendRes = await respPromise
    try {
      const sendJson = await sendRes.json().catch(() => null)
      // debug
      // eslint-disable-next-line no-console
      console.log('[e2e] captured email/send-code response from browser call', sendJson)
      if (sendJson && (sendJson.otp || sendJson.code || sendJson.otpCode)) sendEmailOtp = String(sendJson.otp || sendJson.code || sendJson.otpCode || sendJson.otp?.otpCode).padStart(6, '0')
    } catch (e) { /* ignore */ }
  }

  // Try to fetch MFA OTP from the test-only endpoint (explicit purpose=MFA) if not captured via the browser
  let otpJson: any = null
  let otpFromSendVerification: string | null = null
  if (!sendEmailOtp) {
    try {
      const maybe = await request.get(`http://127.0.0.1:4000/api/test/otp/latest?email=${encodeURIComponent(email)}&purpose=MFA`).catch(() => null)
      otpJson = maybe ? await maybe.json().catch(() => null) : null
      // debug
      // eslint-disable-next-line no-console
      console.log('[e2e] test/otp/latest(MFA) response (initial)', otpJson)
    } catch (e) { /* ignore */ }
  }

    // If we didn't capture sendEmailOtp from the browser call, poll test endpoint for MFA OTP (if enabled) and fallback to send-verification
  if (!sendEmailOtp && (!otpJson || !otpJson.otpCode) && !otpFromSendVerification) {
    let got = ''
    for (let i = 0; i < 12 && got.length !== 6; i++) {
      await page.waitForTimeout(500)
      const r = await request.get(`http://127.0.0.1:4000/api/test/otp/latest?email=${encodeURIComponent(email)}&purpose=MFA`).catch(() => null)
      const j = r ? await r.json().catch(() => null) : null
      // debug
      // eslint-disable-next-line no-console
      if (j) console.log('[e2e] poll MFA', i, j)
      got = (j && (j.code || j.otpCode || (j.otp && j.otp.otpCode))) ? String(j.code || j.otpCode || j.otp?.otpCode).padStart(6, '0') : ''
      if (got.length === 6) { otpJson = j; break }

      // fallback: also trigger send-verification to ensure something exists
      if (i === 4) {
        const sv = await request.post('http://127.0.0.1:4000/api/auth/send-verification', { data: { email } }).catch(() => null)
        const svj = sv ? await sv.json().catch(() => null) : null
        // eslint-disable-next-line no-console
        if (svj) console.log('[e2e] send-verification (fallback) response', svj)
        if (svj && (svj.otp || svj.code || svj.otpCode)) {
          otpFromSendVerification = String(svj.otp || svj.code || svj.otpCode || svj.otp?.otpCode).padStart(6, '0')
          break
        }
      }
    }
    if (!otpJson && !otpFromSendVerification) {
      // As a last resort, try the generic latest (no purpose), log, and fail if nothing found
      const r2 = await request.get(`http://127.0.0.1:4000/api/test/otp/latest?email=${encodeURIComponent(email)}`).catch(() => null)
      const j2 = r2 ? await r2.json().catch(() => null) : null
      // eslint-disable-next-line no-console
      console.log('[e2e] test/otp/latest fallback', j2)
      if (j2 && (j2.code || j2.otpCode || (j2.otp && j2.otp.otpCode))) otpJson = j2
    }
  }

  // Derive final code: prefer sendEmailOtp (MFA) if present, then otpFromSendVerification (VERIFY_EMAIL), then otpJson
  let code = ''
  if (sendEmailOtp) code = sendEmailOtp
  else if (otpFromSendVerification) code = otpFromSendVerification
  else if (otpJson && (otpJson.code || otpJson.otpCode || (otpJson.otp && otpJson.otp.otpCode))) code = String(otpJson.code || otpJson.otpCode || otpJson.otp?.otpCode).padStart(6, '0')

  if (!code || code.length !== 6) {
    // If test endpoint didn't expose it yet, try wait+retry a few times (more tolerant)
    let got = ''
    for (let i = 0; i < 12 && got.length !== 6; i++) {
      await page.waitForTimeout(500)
      const r = await request.get(`http://127.0.0.1:4000/api/test/otp/latest?email=${encodeURIComponent(email)}&purpose=`).catch(() => null)
      const j = r ? await r.json().catch(() => null) : null
      got = (j && (j.code || j.otpCode || (j.otp && j.otp.otpCode))) ? String(j.code || j.otpCode || j.otp?.otpCode).padStart(6, '0') : ''
      if (got.length === 6) { code = got; break }

      // If halfway through retries and no OTP, explicitly call send-verification to ensure OTP exists
      if (i === 4) {
        const sv = await request.post('http://127.0.0.1:4000/api/auth/send-verification', { data: { email } }).catch(() => null)
        const svj = sv ? await sv.json().catch(() => null) : null
        if (svj) console.log('[e2e] send-verification (mid-retry) response', svj)
        if (svj && (svj.otp || svj.code || svj.otpCode)) {
          code = String(svj.otp || svj.code || svj.otpCode || svj.otp?.otpCode).padStart(6, '0')
          break
        }
      }
    }
    if (!code || code.length !== 6) throw new Error('Could not retrieve test OTP')
  }

  // Fill the code inputs
  let otpCode = ''
  if (code && code.length === 6) otpCode = code
  else if (otpJson && (otpJson.code || otpJson.otpCode || otpJson.otp?.otpCode)) otpCode = String(otpJson.code || otpJson.otpCode || otpJson.otp?.otpCode).padStart(6, '0')
  if (!otpCode || otpCode.length !== 6) throw new Error('Invalid OTP code computed')
  // debug
  // eslint-disable-next-line no-console
  console.log('[e2e] using OTP code for verification', otpCode)
  for (let i = 0; i < 6; i++) {
    await page.fill(`input[aria-label="Verification code digit ${i + 1}"]`, otpCode[i])
    // small delay to mimic user typing and avoid triggering premature auto-submit
    await page.waitForTimeout(50)
  }

  await page.screenshot({ path: path.join(outDir, 'otp-filled.png'), fullPage: true })

  // Ensure server-side verify is run (call directly to break any client-side race)
  try {
    let verifyOk = false
    // Try verify via email/verify-code first (verification controller), then fallback to auth/verify-otp
    for (let attempt = 0; attempt < 4 && !verifyOk; attempt++) {
      const verifyRes = await request.post('http://127.0.0.1:4000/api/auth/email/verify-code', { data: { email, code: otpCode } }).catch(() => null)
      const verifyJson = verifyRes ? await verifyRes.json().catch(() => null) : null
      if (verifyRes && verifyRes.ok()) { verifyOk = true; break }
      // eslint-disable-next-line no-console
      console.warn('[e2e] email/verify-code attempt', attempt, { status: verifyRes ? verifyRes.status : 'no-res', body: verifyJson })
      // Try auth/verify-otp as well since client often uses that
      const genericRes = await request.post('http://127.0.0.1:4000/api/auth/verify-otp', { data: { email, otpCode: otpCode } }).catch(() => null)
      const genericJson = genericRes ? await genericRes.json().catch(() => null) : null
      if (genericRes && genericRes.ok()) { verifyOk = true; break }
      // eslint-disable-next-line no-console
      console.warn('[e2e] auth/verify-otp attempt', attempt, { status: genericRes ? genericRes.status : 'no-res', body: genericJson })
      if (attempt < 3) await page.waitForTimeout(300)
    }
    if (!verifyOk) {
      // eslint-disable-next-line no-console
      console.error('[e2e] server-side verify did not succeed after retries')
    }
  } catch (e) { /* ignore */ }

  // Click Verify (or rely on auto-submit). Use robust selector for either copy.
  const verifyBtn = page.getByRole('button', { name: /Verify OTP|Verify code/i })
  if (await verifyBtn.isVisible().catch(() => false)) {
    await verifyBtn.click()
  }

  // After verification we should navigate to setup (since purpose was reset)
  await page.waitForSelector('text=Create a 6-digit PIN', { timeout: 15000 })
  await page.screenshot({ path: path.join(outDir, 'pin-setup-after-otp.png'), fullPage: true })

  // Fill new PIN
  for (let i = 0; i < 6; i++) {
    await page.fill(`input[aria-label="Create PIN digit ${i + 1}"]`, newPin[i])
  }
  for (let i = 0; i < 6; i++) {
    await page.fill(`input[aria-label="Confirm PIN digit ${i + 1}"]`, newPin[i])
  }

  // Submit Set PIN
  const setBtn = page.locator('button:has-text("Set PIN")')
  await setBtn.waitFor({ state: 'attached', timeout: 10000 })
  if (await setBtn.isEnabled().catch(() => false)) {
    await Promise.all([
      page.waitForSelector('text=Enter Your PIN', { timeout: 15000 }).catch(() => null),
      setBtn.click(),
    ])
  } else {
    // If disabled, ensure we allow time for auto-submit behavior
    await page.waitForSelector('text=Enter Your PIN', { timeout: 15000 })
  }

  await page.screenshot({ path: path.join(outDir, 'pin-set-success.png'), fullPage: true })

  // Logout and login again, then verify new PIN works
  await page.goto('/auth/logout')
  // Login via API and set cookies
  const loginRes2 = await request.post('http://127.0.0.1:4000/api/auth/login', { data: { email, password } })
  expect(loginRes2.ok()).toBeTruthy()
  const loginJson2 = await loginRes2.json()
  await page.context().addCookies([
    { name: 'token', value: loginJson2.token, url: 'http://localhost', httpOnly: true },
    { name: 'refreshToken', value: loginJson2.refreshToken, url: 'http://localhost', httpOnly: true },
    { name: 'token', value: loginJson2.token, url: 'http://127.0.0.1', httpOnly: true },
    { name: 'refreshToken', value: loginJson2.refreshToken, url: 'http://127.0.0.1', httpOnly: true },
  ])

  await page.goto(`/verification?email=${encodeURIComponent(email)}`)
  await page.waitForSelector('text=Enter Your PIN', { timeout: 10000 })
  await page.click('text=Enter Your PIN')

  // Fill the new PIN and verify redirect to /hub
  await page.waitForSelector('text=Enter your 6-digit PIN', { timeout: 10000 })
  for (let i = 0; i < 6; i++) {
    await page.fill(`input[aria-label="Enter PIN digit ${i + 1}"]`, newPin[i])
  }

  // Click Verify PIN or allow auto-submit
  const verifyBtn2 = page.locator('button:has-text("Verify PIN")')
  if (await verifyBtn2.isVisible().catch(() => false)) {
    if (await verifyBtn2.isEnabled().catch(() => false)) await verifyBtn2.click()
  }

  // Wait for hub redirect
  await page.waitForURL(/\/hub/, { timeout: 15000 })
  await page.screenshot({ path: path.join(outDir, 'post-reset-hub.png'), fullPage: true })

  // Final checks
  await page.waitForSelector('text=My Companies', { timeout: 10000 })
  await page.waitForSelector('text=My Practice', { timeout: 10000 })
})
