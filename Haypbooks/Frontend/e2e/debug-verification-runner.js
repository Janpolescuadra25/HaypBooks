const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const outDir = path.join(__dirname, 'screenshots-debug')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()

  // Inject a fake authenticated user into localStorage
  await context.addInitScript(({ user }) => {
    try { window.localStorage.setItem('user', JSON.stringify(user)) } catch (e) {}
  }, { user: { id: 'u_test', email: 'test@haypbooks.test', requiresPinSetup: true, hasPin: false } })

  const page = await context.newPage()
  console.log('Opening verification page...')
  await page.goto('http://localhost:3000/verification?email=test%40haypbooks.test', { waitUntil: 'domcontentloaded', timeout: 30000 })
  await page.waitForTimeout(1000)
  const html = await page.content()
  fs.writeFileSync(path.join(outDir, 'verification-page.html'), html, 'utf8')
  await page.screenshot({ path: path.join(outDir, 'verification-page.png'), fullPage: true })

  console.log('Saved verification screenshot & HTML to', outDir)
  await browser.close()
})().catch(e => { console.error(e); process.exit(1) })