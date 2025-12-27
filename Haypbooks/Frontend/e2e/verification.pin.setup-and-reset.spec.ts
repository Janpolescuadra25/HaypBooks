import { test, expect } from '@playwright/test'
import path from 'path'

const outDir = path.join(__dirname, 'screenshots')

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

test.skip('PIN setup -> login -> enter PIN -> reset -> OTP -> set new PIN end-to-end - SKIPPED (PIN removed)', async ({ page, request }) => {
  await waitForBackend(request)

  const ts = Date.now()
  const email = `e2e-pin-${ts}@haypbooks.test`
  const password = 'PinFlow!23'
  const firstPin = '135791'
  const secondPin = '246802'

  // Create user via API
  await request.post('http://127.0.0.1:4000/api/auth/signup', { data: { email, password, name: 'E2E Pin' } })
  // Ensure server-side test flags are explicit (email verified and no PIN) so we deterministically hit setup
  await request.post('http://127.0.0.1:4000/api/test/update-user', { data: { email, data: { isEmailVerified: true, hasPin: false } } }).catch(() => {})

  // Login to get token and cookies. Retry until server-side test flags are reflected on the user record.
  let loginJson: any = null
  for (let attempt = 0; attempt < 6; attempt++) {
    // Re-apply update-user to be resilient to eventual consistency
    await request.post('http://127.0.0.1:4000/api/test/update-user', { data: { email, data: { isEmailVerified: true, hasPin: false } } }).catch(() => {})
    const loginRes = await request.post('http://127.0.0.1:4000/api/auth/login', { data: { email, password } })
    if (!loginRes.ok()) { await new Promise((r) => setTimeout(r, 500)); continue }
    loginJson = await loginRes.json().catch(() => null)
    if (loginJson && loginJson.user && loginJson.user.isEmailVerified === true) break
    await new Promise((r) => setTimeout(r, 500))
  }
  if (!loginJson || !loginJson.token) throw new Error('Failed to login or set test flags')
  const token = loginJson.token
  // Ensure the client uses same-origin API for deterministic cookie behavior in tests
  await page.addInitScript(() => { (window as any).__API_BASE_URL = '' })

  // Instrument network responses and console messages for debugging flaky runs
  const events: any[] = []
  page.on('response', async (resp) => {
    try {
      const url = resp.url()
      if (url.includes('/api/users/me') || url.includes('/api/auth/pin/setup') || url.includes('/api/auth/refresh') || url.includes('/api/auth/login') || url.includes('/api/test/otp/latest') || url.includes('/api/auth/email/send-code')) {
        const body = await resp.text().catch(() => '<no-body>')
        events.push({ type: 'response', url, status: resp.status(), body })
      }
    } catch (e) { /* ignore */ }
  })
  page.on('console', async (msg) => {
    try {
      events.push({ type: 'console', text: msg.text(), loc: msg.location && msg.location() })
    } catch (e) {}
  })
  try {
    const fs = require('fs')
    const logPath = `e2e/logs/pin-flow-${ts}.log`
    fs.mkdirSync('e2e/logs', { recursive: true })
    const iv = setInterval(() => {
      try { fs.writeFileSync(logPath, JSON.stringify(events, null, 2)) } catch (e) {}
    }, 1000)
    process.on('exit', () => {
      try { fs.writeFileSync(logPath, JSON.stringify(events, null, 2)) } catch (e) {}
    })
  } catch (e) { /* ignore */ }

  // Set cookies for both hostnames including port so they attach correctly to the app server
  await page.context().addCookies([
    { name: 'token', value: token, url: 'http://localhost:3000', httpOnly: true },
    { name: 'refreshToken', value: loginJson.refreshToken, url: 'http://localhost:3000', httpOnly: true },
    { name: 'email', value: loginJson.user.email, url: 'http://localhost:3000' },
    { name: 'userId', value: String(loginJson.user.id), url: 'http://localhost:3000' },
    { name: 'token', value: token, url: 'http://127.0.0.1:3000', httpOnly: true },
    { name: 'refreshToken', value: loginJson.refreshToken, url: 'http://127.0.0.1:3000', httpOnly: true },
    { name: 'email', value: loginJson.user.email, url: 'http://127.0.0.1:3000' },
    { name: 'userId', value: String(loginJson.user.id), url: 'http://127.0.0.1:3000' },
  ])

  // Instead of relying on the flaky UI to set the initial PIN, set it directly via the API for determinism
  const setupRes = await request.post('http://127.0.0.1:4000/api/auth/pin/setup', { data: { pin: firstPin, pinConfirm: firstPin }, headers: { Authorization: `Bearer ${token}` } })
  const setupJson = await setupRes.json().catch(() => null)
  if (!setupRes.ok() || !setupJson || !setupJson.hasPin) {
    throw new Error('Failed to set PIN via API: ' + JSON.stringify({ status: setupRes.status(), body: setupJson }))
  }
  // confirm server-side state reflects hasPin
  const me = await request.get('http://127.0.0.1:4000/api/users/me', { headers: { Authorization: `Bearer ${token}` } })
  const meJson = await me.json().catch(() => null)
  if (!meJson || !meJson.hasPin) throw new Error('User does not have pin after setup')

  // Logout then login
  await page.goto('http://127.0.0.1:3000/auth/logout')
  const loginRes2 = await request.post('http://127.0.0.1:4000/api/auth/login', { data: { email, password } })
  const loginJson2 = await loginRes2.json()
  // Add cookies for the login session on the correct host+port
  await page.context().addCookies([
    { name: 'token', value: loginJson2.token, url: 'http://localhost:3000', httpOnly: true },
    { name: 'refreshToken', value: loginJson2.refreshToken, url: 'http://localhost:3000', httpOnly: true },
    { name: 'token', value: loginJson2.token, url: 'http://127.0.0.1:3000', httpOnly: true },
    { name: 'refreshToken', value: loginJson2.refreshToken, url: 'http://127.0.0.1:3000', httpOnly: true },
  ])

  // Visit verification and enter PIN
  await page.goto(`http://127.0.0.1:3000/verification?email=${encodeURIComponent(email)}`)
  await page.click('text=Enter Your PIN')
  await page.waitForSelector('text=Enter your 6-digit PIN', { timeout: 10000 })
  for (let i = 0; i < 6; i++) await page.fill(`input[aria-label="Enter PIN digit ${i + 1}"]`, firstPin[i])
  await page.waitForURL(/\/hub|\/hub\//, { timeout: 10000 })

  // Now simulate Reset PIN from the Enter PIN screen
  await page.goto(`http://127.0.0.1:3000/verification?email=${encodeURIComponent(email)}`)
  await page.click('text=Enter Your PIN')
  await page.waitForSelector('text=Forgot PIN? Reset', { timeout: 10000 })
  await page.click('text=Reset PIN')

  // Click send code and capture browser's send-code response which includes OTP in dev
  try {
    // Support both the options-label and the email-flow button text
    let sendBtn = page.locator('text=Send Code to Email')
    if ((await sendBtn.count()) === 0) sendBtn = page.locator('text=Send code')
    await sendBtn.waitFor({ state: 'visible', timeout: 15000 })
    // To make OTP retrieval deterministic in dev, trigger send-code via the backend first and use that OTP.
    let otp: string | null = null
    try {
      const apiSend = await request.post('http://127.0.0.1:4000/api/auth/email/send-code', { data: { email } }).catch(() => null)
      const apiSendJson = apiSend ? await apiSend.json().catch(() => null) : null
      if (apiSendJson && (apiSendJson.otp || apiSendJson.otpCode)) otp = String(apiSendJson.otp || apiSendJson.otpCode).padStart(6, '0')
    } catch (e) { /* ignore */ }

    // Click the button in the browser to advance UI state
    const respPromise = page.waitForResponse((r) => r.url().includes('/api/auth/email/send-code'))
    await sendBtn.click()
    try { await respPromise } catch (e) { /* ignore */ }

    // If backend send didn't include OTP, poll test endpoint for a few seconds
    if (!otp) {
      for (let attempt = 0; attempt < 10 && !otp; attempt++) {
        try {
          const purposes = ['MFA', 'VERIFY', 'RESET', '']
          for (const p of purposes) {
            const url = `http://127.0.0.1:4000/api/test/otp/latest?email=${encodeURIComponent(email)}${p ? `&purpose=${p}` : ''}`
            const testOtp = await request.get(url).catch(() => null)
            if (testOtp && testOtp.ok()) {
              const tjson = await testOtp.json().catch(() => null)
              if (tjson && (tjson.otp || tjson.otpCode)) {
                otp = String(tjson.otp || tjson.otpCode).padStart(6, '0')
                break
              }
            }
          }
        } catch (e) { /* ignore */ }
        if (!otp) await new Promise((r) => setTimeout(r, 500))
      }
    }

    // As a last resort, fallback to send-verification API which returns otp in dev
    if (!otp) {
      try {
        const sv = await request.post('http://127.0.0.1:4000/api/auth/send-verification', { data: { email } })
        const svj = await sv.json().catch(() => null)
        if (svj && (svj.otp || svj.otpCode)) otp = String(svj.otp || svj.otpCode).padStart(6, '0')
      } catch (e) {}
    }

    expect(otp).toHaveLength(6)
  } catch (err) {
    await page.screenshot({ path: path.join(outDir, `send-code-missing-${ts}.png`), fullPage: true }).catch(() => {})
    const html = await page.content().catch(() => '<no html>')
    // eslint-disable-next-line no-console
    console.log('[e2e][debug] send-code missing snapshot start')
    console.log(html.slice(0, 4000))
    // eslint-disable-next-line no-console
    console.log('[e2e][debug] send-code missing snapshot end')
    throw err
  }

  // Fill OTP in UI
  for (let i = 0; i < 6; i++) await page.fill(`input[aria-label="Verification code digit ${i + 1}"]`, otp[i])
  await page.getByRole('button', { name: /Verify OTP|Verify code/i }).click()

  // Now we should see Create a 6-digit PIN
  await page.waitForSelector('text=Create a 6-digit PIN', { timeout: 15000 })

  // Set new PIN
  for (let i = 0; i < 6; i++) await page.fill(`input[aria-label="Create PIN digit ${i + 1}"]`, secondPin[i])
  for (let i = 0; i < 6; i++) await page.fill(`input[aria-label="Confirm PIN digit ${i + 1}"]`, secondPin[i])
  await page.click('button:has-text("Set PIN")')

  // Logout and login again; verify new PIN works
  await page.goto('http://127.0.0.1:3000/auth/logout')
  const loginRes3 = await request.post('http://127.0.0.1:4000/api/auth/login', { data: { email, password } })
  const loginJson3 = await loginRes3.json()
  // Add cookies for the login session on the correct host+port
  await page.context().addCookies([
    { name: 'token', value: loginJson3.token, url: 'http://localhost:3000', httpOnly: true },
    { name: 'refreshToken', value: loginJson3.refreshToken, url: 'http://localhost:3000', httpOnly: true },
    { name: 'token', value: loginJson3.token, url: 'http://127.0.0.1:3000', httpOnly: true },
    { name: 'refreshToken', value: loginJson3.refreshToken, url: 'http://127.0.0.1:3000', httpOnly: true },
  ])

  await page.goto(`/verification?email=${encodeURIComponent(email)}`)
  await page.click('text=Enter Your PIN')
  await page.waitForSelector('text=Enter your 6-digit PIN', { timeout: 10000 })
  for (let i = 0; i < 6; i++) await page.fill(`input[aria-label="Enter PIN digit ${i + 1}"]`, secondPin[i])
  await page.waitForURL(/\/hub|\/hub\//, { timeout: 10000 })
})