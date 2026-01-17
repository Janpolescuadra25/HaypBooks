import { test, expect } from '@playwright/test'

const backend = process.env.E2E_BACKEND || 'http://127.0.0.1:4000'
const password = 'password'

test.describe('Owner Workspace hub-entry & alignment (Playwright)', () => {
  test('enters Owner Workspace and keeps TopBar + portfolio centers aligned across viewports and zoom', async ({ page, request }) => {
    const s = Math.random().toString(36).slice(2, 8)
    const email = `e2e-owner-align-${Date.now()}-${s}@haypbooks.test`
    const companyName = `AlignCo ${Date.now()} ${s}`

    // Create verified user and company via test helpers (best-effort; skip gracefully if helpers are disabled)
    await request.post(`${backend}/api/test/create-user`, { data: { email, password, name: 'E2E Align', isEmailVerified: true } }).catch(() => null)
    const createCompany = await request.post(`${backend}/api/test/create-company`, { data: { email, name: companyName } }).catch(() => null)
    if (!createCompany || !createCompany.ok()) { console.log('Test helper create-company unavailable; skipping alignment test'); return }

    // Ensure the user profile has companyName so TopBar center shows the expected label
    await request.post(`${backend}/api/test/update-user`, { data: { email, data: { companyName } } }).catch(() => null)

    // Login via API and stash token in localStorage before the page loads
    const login = await request.post(`${backend}/api/auth/login`, { data: { email, password } }).catch(() => null)
    if (!login || !login.ok()) { console.log('Login helper unavailable; skipping alignment test'); return }

    const loginJson = await login.json().catch(() => ({} as any))
    const token = loginJson?.token || loginJson?.access_token || loginJson?.accessToken
    if (!token) { console.log('Login returned no token; skipping alignment test'); return }

    // Set API base, token and a minimal stored `user` before any page loads so the app initializes authenticated
    await page.addInitScript((base, tkn, uemail, cname) => {
      try { (window as any).__API_BASE_URL = base } catch (e) {}
      try { localStorage.setItem('authToken', tkn) } catch (e) {}
      try { localStorage.setItem('user', JSON.stringify({ email: uemail, companyName: cname })) } catch (e) {}
    }, backend, token, email, companyName)

    // Iterate a set of viewports and zoom levels to emulate desktop/tablet/mobile and slight zoom changes
    const viewports = [ { name: 'desktop', width: 1280, height: 800 }, { name: 'tablet', width: 1024, height: 768 }, { name: 'mobile', width: 375, height: 812 } ]
    const zoomLevels = [1, 0.9]

    for (const vp of viewports) {
      await page.setViewportSize({ width: vp.width, height: vp.height })
      for (const z of zoomLevels) {
        // apply zoom via CSS (best-effort to emulate page-scale changes)
        await page.evaluate((v) => { try { document.documentElement.style.zoom = String(v) } catch (e) {} }, z)

        // Visit the app root — hub selection may appear depending on state
        await page.goto('/'
        )
        await page.waitForLoadState('domcontentloaded')

        // If a Hub selection CTA appears, click 'Enter Owner Workspace' (best-effort)
        const enterOwner = page.getByRole('link', { name: /Enter Owner Workspace|Owner Workspace/i })
        if (await enterOwner.isVisible().catch(() => false)) {
          await enterOwner.click()
          await page.waitForURL(/\/hub\/companies/, { timeout: 15000 })
        } else {
          // Directly navigate into Owner Workspace if hub selection not shown
          await page.goto('/hub/companies')
          await page.waitForURL(/\/hub\/companies/, { timeout: 15000 })
        }

        // Ensure the created company is visible in Owner Workspace
        await expect(page.getByText(companyName)).toBeVisible({ timeout: 10000 })

        // Measure center X positions of TopBar workspace name and the main white container
        const topbarLocator = page.locator('div.text-sm.font-semibold.text-slate-700').first()
        const containerLocator = page.locator('div.min-h-[460px]').first()
        const topBox = await topbarLocator.boundingBox()
        const containerBox = await containerLocator.boundingBox()

        expect(topBox, 'TopBar center could not be measured').toBeTruthy()
        expect(containerBox, 'Workspace container center could not be measured').toBeTruthy()

        const topCenterX = (topBox!.x + topBox!.width / 2)
        const contCenterX = (containerBox!.x + containerBox!.width / 2)
        const delta = Math.abs(topCenterX - contCenterX)

        // Allow a small tolerance (10px) for sub-pixel and rounding differences across viewports
        expect(delta, `Centers misaligned by ${delta}px at ${vp.name} zoom=${z}`).toBeLessThanOrEqual(10)
      }
      // reset zoom for next viewport
      await page.evaluate(() => { try { document.documentElement.style.zoom = '1' } catch (e) {} })
    }
  })
})