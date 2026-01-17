import { test, expect } from '@playwright/test'


test('trace Owner Workspace for demo user and capture /api/companies responses', async ({ page, request }) => {
  const backend = process.env.TEST_BACKEND_URL || 'http://127.0.0.1:4000'
  const frontendBase = process.env.PLAYWRIGHT_URL || 'http://127.0.0.1:3000'
  const email = 'demo@haypbooks.test'

  // Ensure clean demo user
  const delRes = await request.post(`${backend}/api/test/delete-user`, { data: { email } }).catch(() => null)
  await request.post(`${backend}/api/test/create-user`, { data: { email } }).catch(() => null)

  // Login to get token; if test endpoints are disabled, bail gracefully
  const loginRes = await request.post(`${backend}/api/auth/login`, { data: { email } }).catch(() => null)
  if (!loginRes || loginRes.status() !== 200) {
    console.log('Test endpoints disabled or backend unreachable; skipping Owner Workspace trace capture')
    return
  }
  const loginJson = await loginRes.json()
  const token = loginJson?.token || loginJson?.accessToken || loginJson?.access_token
  if (!token) throw new Error('No token returned for demo user')

  // Install token in localStorage before any page load
  await page.addInitScript((t) => {
    try { localStorage.setItem('authToken', t) } catch (e) { /*ignore*/ }
  }, token)

  // Capture API /api/companies responses
  const companyResponses: any[] = []
  page.on('response', async (resp) => {
    if (resp.url().includes('/api/companies')) {
      let json = null
      try { json = await resp.json() } catch (e) { json = null }
      companyResponses.push({ url: resp.url(), status: resp.status(), json })
    }
  })

  // Start Playwright tracing with snapshots and screenshots
  await page.context().tracing.start({ screenshots: true, snapshots: true })

  // Navigate to Owner Workspace
  await page.goto(`${frontendBase}/hub/companies`)

  // Wait for main workspace content to render or timeout
  await page.waitForTimeout(2500)

  // Take a screenshot and save
  await page.screenshot({ path: 'tmp_trace/owner-workspace-demo.png', fullPage: true }).catch(() => null)

  // Stop tracing (trace saved to file by Playwright runner artifacts if enabled). We'll also save an explicit trace
  await page.context().tracing.stop({ path: 'tmp_trace/trace-owner-workspace-demo.zip' }).catch(() => null)

  // Persist captured /api/companies responses
  const fs = require('fs')
  try { fs.mkdirSync('tmp_trace', { recursive: true }) } catch (e) {}
  fs.writeFileSync('tmp_trace/owner-workspace-companies-responses.json', JSON.stringify(companyResponses, null, 2))

  // Log to test output for quick inspection
  console.log('Captured companies responses:', JSON.stringify(companyResponses, null, 2))

  // Sanity: assert that the page did not show an unexpected company card if companies array is empty
  // (we do not fail the test here; we only capture evidence)
  const cards = await page.locator('text=Open Books').count().catch(() => 0)
  console.log('Owner Workspace company cards (Open Books count):', cards)
})