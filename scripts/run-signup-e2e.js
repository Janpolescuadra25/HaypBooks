#!/usr/bin/env node
const path = require('path')
const { chromium } = require(path.join(process.cwd(), 'node_modules', 'playwright'))
const { spawnSync } = require('child_process')
const waitScript = 'http://127.0.0.1:4000/api/health'

function waitForBackend() {
  // wait-for-backend moved into Haypbooks/Backend/scripts
  const waitPath = path.join(__dirname, '..', 'Haypbooks', 'Backend', 'scripts', 'wait-for-backend.js')
  const res = spawnSync('node', [waitPath, waitScript, '60'], { stdio: 'inherit' })
  if (res.status !== 0) {
    console.error('Backend not healthy; aborting')
    process.exit(1)
  }
}

;(async () => {
  waitForBackend()
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    // Accountant
    const acctEmail = `e2e-acct-${Date.now()}@haypbooks.test`
    await page.goto('http://localhost:3000/signup')
    await page.click('button:has-text("Accountant")')
    await page.fill('#firstName', 'E2E')
    await page.fill('#lastName', 'Accountant')
    await page.fill('#companyName', 'ACME Firm (E2E)')
    await page.fill('#email', acctEmail)
    await page.fill('#password', 'Playwright1!')
    await page.fill('#confirmPassword', 'Playwright1!')
    await Promise.all([
      page.waitForNavigation({ url: '**/hub/accountant', timeout: 15000 }),
      page.click('button:has-text("Create account")')
    ])
    console.log('Accountant signup => redirected to /hub/accountant: OK')

    // Business
    const bizEmail = `e2e-business-${Date.now()}@haypbooks.test`
    await page.goto('http://localhost:3000/signup')
    await page.click('button:has-text("My Business")')
    await page.fill('#firstName', 'E2E')
    await page.fill('#lastName', 'Owner')
    await page.fill('#companyName', 'ACME Corp (E2E)')
    await page.fill('#email', bizEmail)
    await page.fill('#password', 'Playwright1!')
    await page.fill('#confirmPassword', 'Playwright1!')
    await Promise.all([
      page.waitForNavigation({ url: '**/onboarding/tenant', timeout: 15000 }),
      page.click('button:has-text("Create account")')
    ])
    console.log('Business signup => redirected to /onboarding/tenant: OK')

    console.log('All signup role E2E checks passed')
  } catch (err) {
    console.error('E2E signup checks failed:', err)
    process.exit(2)
  } finally {
    await browser.close()
  }
})()
