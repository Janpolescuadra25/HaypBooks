const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const outDir = path.join(__dirname, 'screenshots-debug')
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext()
  const page = await context.newPage()

  // Capture browser console and page errors
  const logs = []
  page.on('console', msg => {
    const txt = `[console:${msg.type()}] ${msg.text()}`
    logs.push(txt)
    console.log(txt)
  })
  page.on('pageerror', err => {
    const txt = `[pageerror] ${err.message}`
    logs.push(txt)
    console.error(txt)
  })
  page.on('requestfailed', req => {
    const txt = `[requestfailed] ${req.url()} ${req.failure()?.errorText || ''}`
    logs.push(txt)
    console.log(txt)
  })

  console.log('Navigating to login page...')
  // Try networkidle first, fall back to domcontentloaded with longer timeout if busy
  try {
    await page.goto('http://localhost:3000/(public)/login', { waitUntil: 'networkidle', timeout: 30000 })
  } catch (e) {
    console.log('networkidle timed out, retrying with domcontentloaded and longer timeout...')
    await page.goto('http://localhost:3000/(public)/login', { waitUntil: 'domcontentloaded', timeout: 60000 })
  }

  // Save full HTML
  const html = await page.content()
  fs.writeFileSync(path.join(outDir, 'login-page.html'), html, 'utf8')
  await page.screenshot({ path: path.join(outDir, 'login-page.png'), fullPage: true })

  // Check for #email
  const hasEmail = await page.$('#email') !== null
  console.log('Has #email element:', hasEmail)

  // Dump a short list of inputs
  const inputs = await page.$$eval('input', nodes => nodes.map(n => ({ id: n.id, name: n.name, type: n.type, ariaLabel: n.getAttribute('aria-label') })))
  fs.writeFileSync(path.join(outDir, 'inputs.json'), JSON.stringify(inputs, null, 2), 'utf8')
  console.log('Wrote debug artifacts to', outDir)

  await browser.close()
})().catch(e => { console.error(e); process.exit(1) })