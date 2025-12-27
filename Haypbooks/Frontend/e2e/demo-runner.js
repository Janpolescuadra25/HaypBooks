const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function run() {
  const outDir = path.join(__dirname, 'screenshots')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  const email = `demo-run-${Date.now()}@haypbooks.test`
  const password = 'DemoPass!23'

  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext()
  const page = await context.newPage()

  console.log('Creating user via API and injecting auth cookies into browser context')
  // create user via API so server returns dev OTP and creates session cookies
  const signupRes = await fetch('http://localhost:4000/api/auth/signup', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password, name: 'Demo User' }) })
  const signupBody = await signupRes.json().catch(() => null)
  console.log('signup response ok=', signupRes.ok, 'devOtp=', signupBody?._devOtp)

  // Try logging in via API to get token and set cookies in the browser context
  try {
    const loginRes = await fetch('http://localhost:4000/api/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password }) })
    const loginBody = await loginRes.json().catch(() => null)
    if (loginRes.ok && loginBody?.token) {
      const token = loginBody.token
      const user = loginBody.user || {}
      const cookies = [
        { name: 'token', value: token, url: 'http://localhost', httpOnly: true },
        { name: 'email', value: String(user.email || email), url: 'http://localhost' },
        { name: 'userId', value: String(user.id || ''), url: 'http://localhost' },
        { name: 'role', value: String(user.role || ''), url: 'http://localhost' },
      ].filter(c => c.value !== '')
      console.log('Adding auth cookies to browser context:', cookies.map(c => c.name))
      await context.addCookies(cookies)
    } else {
      console.log('Login via API did not return token; continuing unauthenticated')
    }
  } catch (e) {
    console.log('Login API call failed:', e?.message || e)
  }

  // Now navigate to verification page with email param (we injected auth cookies above)
  await page.goto('http://localhost:3000/verification?email=' + encodeURIComponent(email))
  await page.waitForURL(/\/verification|\/verify-otp|\/hub|\/hub\/selection/, { timeout: 10000 })
  const currentUrl = page.url()
  console.log('Current URL after navigating to verification:', currentUrl)
  await page.screenshot({ path: path.join(outDir, 'verification-or-hub.png'), fullPage: true })

  if (!/\/verification/.test(currentUrl)) {
    console.log('Not on verification page. If the user was auto-redirected to hub, demo will capture and exit.')
    await browser.close()
    return
  }

  console.log('Attempt to open PIN flow')
  const pinBtn = await page.$('text=Enter Your PIN')
  if (!pinBtn) {
    console.log('Enter Your PIN button not present; checking for email code flow instead')
    const emailBtn = await page.$('text=Send Code to Email')
    if (emailBtn) {
      console.log('Email code flow available; capturing and proceeding with email code flow instead')
      await page.screenshot({ path: path.join(outDir, 'email-flow-options.png'), fullPage: true })
      // Send verification code via header endpoint so we can retrieve it (dev-only)
      const emailParam = new URL(page.url()).searchParams.get('email') || ''
      try {
        const resp = await fetch('http://localhost:4000/api/auth/send-verification', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: emailParam }) })
        const data = await resp.json().catch(() => null)
        console.log('send-verification returned', data)
      } catch (e) { console.log('send-verification failed', e?.message || e) }
      await page.click('text=Send Code to Email')
      await page.waitForSelector('text=Enter verification code', { timeout: 10000 }).catch(() => {})
      await page.screenshot({ path: path.join(outDir, 'email-code-form.png'), fullPage: true })
      console.log('Email flow captured; finishing demo here.')
      await browser.close()
      return
    }

    // If neither option exists, attempt to mark the user as verified server-side (use devOtp from signup if present)
    console.log('No verification options found; attempting to mark user verified via API (dev flow)')
    let otpToUse = signupBody?._devOtp || null
    if (!otpToUse) {
      try {
        const fetchLatest = await fetch(`http://localhost:4000/api/test/otp/latest?email=${encodeURIComponent(email)}&purpose=VERIFY`) 
        const latest = await fetchLatest.json().catch(() => null)
        otpToUse = latest?.otpCode || latest?.otp?.otpCode || null
        console.log('Got OTP from test endpoint:', otpToUse)
      } catch (e) { console.log('Failed to fetch latest OTP', e?.message || e) }
    }

    if (otpToUse) {
      try {
        const ver = await fetch('http://localhost:4000/api/auth/verify-otp', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, otpCode: otpToUse }) })
        const verBody = await ver.json().catch(() => null)
        console.log('verify-otp response:', ver.status, verBody)
      } catch (e) { console.log('verify-otp call failed', e?.message || e) }

      // reload verification page
      await page.goto('http://localhost:3000/verification?email=' + encodeURIComponent(email))
      // wait briefly for client-side to pick up the verified state
      await sleep(2000)
      await page.screenshot({ path: path.join(outDir, 'post-verify-redirect.png'), fullPage: true })
      // try again to find the PIN button
      const pinBtn2 = await page.$('text=Enter Your PIN')
      if (!pinBtn2) {
        console.log('Still no PIN button after verifying user; giving up and saving screenshot')
        await page.screenshot({ path: path.join(outDir, 'verification-still-missing.png'), fullPage: true })
        await browser.close()
        return
      }
      // proceed using found pin button
      await pinBtn2.click()
    } else {
      console.log('No OTP available (dev). Saving current page screenshot and aborting.')
      await page.screenshot({ path: path.join(outDir, 'verification-missing-options.png'), fullPage: true })
      await browser.close()
      return
    }
  }

  // If PIN button present proceed with PIN flow
  await pinBtn.click()
  await page.waitForSelector('text=Enter your 6-digit PIN')
  await page.screenshot({ path: path.join(outDir, 'pin-entry.png'), fullPage: true })

  console.log('Click Reset PIN to start the email-based reset flow')
  await page.click('text=Reset PIN')

  // Wait for either: Send Code to Email, Enter verification code, or direct setup
  const resetWhich = await Promise.race([
    page.waitForSelector('text=Send Code to Email', { timeout: 5000 }).then(() => 'send').catch(() => null),
    page.waitForSelector('text=Enter verification code', { timeout: 5000 }).then(() => 'enterCode').catch(() => null),
    page.waitForSelector('text=Create a 6-digit PIN', { timeout: 5000 }).then(() => 'setup').catch(() => null),
  ])

  if (resetWhich === 'send') {
    await page.click('text=Send Code to Email')
    const emailParam = new URL(page.url()).searchParams.get('email') || ''
    await fetch('http://localhost:4000/api/auth/send-verification', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: emailParam }) })
    await page.waitForSelector('text=Enter verification code', { timeout: 10000 }).catch(() => {})
  }

  if (await page.locator('text=Enter verification code').isVisible().catch(() => false)) {
    // Fetch OTP from test-only endpoint
    const fetchLatest = await fetch(`http://localhost:4000/api/test/otp/latest?email=${encodeURIComponent(email)}`)
    const latest = await fetchLatest.json().catch(() => null)
    const otp = latest?.otpCode || latest?.code || latest?.otp || null
    const otpStr = otp ? String(otp).padStart(6, '0') : ''
    if (otpStr.length === 6) {
      for (let i = 0; i < 6; i++) {
        await page.fill(`input[aria-label="Verification code digit ${i + 1}"]`, otpStr[i])
      }
    }
    await page.waitForSelector('text=Create a 6-digit PIN', { timeout: 10000 }).catch(() => {})
  }

  await page.screenshot({ path: path.join(outDir, 'pin-setup.png'), fullPage: true })

  const pin = '123456'
  // Fill inputs
  const createLabel = await page.$('label:has-text("Create a 6-digit PIN")')
  if (createLabel) {
    const input = await createLabel.evaluateHandle(el => el.nextElementSibling)
  }
  // Use label-based selectors
  await page.fill('label:has-text("Create a 6-digit PIN") + input', pin)
  await page.fill('label:has-text("Confirm PIN") + input', pin)
  await page.click('text=Set PIN')

  // wait briefly for navigation back to options
  await page.waitForSelector('text=Enter Your PIN')
  await page.screenshot({ path: path.join(outDir, 'pin-set-success.png'), fullPage: true })

  // Logout
  await page.goto('http://localhost:3000/auth/logout')
  await sleep(500)

  // Login again
  await page.goto('http://localhost:3000/(public)/login')
  await page.fill('#email', email)
  await page.fill('#password', password)
  await page.click('button[type="submit"]')
  await page.waitForURL(/\/verification/)

  // Enter PIN
  await page.click('text=Enter Your PIN')
  await page.fill('label:has-text("Enter your 6-digit PIN") + input', pin)
  await page.click('text=Verify PIN')

  console.log('Waiting for final hub redirect')
  await page.waitForURL(/\/hub\/selection|\/hub/, { timeout: 15000 })
  await page.screenshot({ path: path.join(outDir, 'post-verification-hub.png'), fullPage: true })

  console.log('Screenshots saved to', outDir)
  await browser.close()
}

run().catch(e => { console.error(e); process.exit(1) })
