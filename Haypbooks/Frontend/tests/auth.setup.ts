/**
 * auth.setup.ts
 *
 * Runs before all sales E2E tests. Creates a test user + company via the backend
 * test API (if available), logs in via the UI, sets the required onboarding cookies,
 * and saves browser storage state so all other tests start already authenticated.
 *
 * Outputs:
 *   tests/.auth/user.json    – Playwright storageState (cookies + localStorage)
 *   tests/.auth/context.json – { companyId, email, password } for use in tests
 */

import { test as setup } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const AUTH_DIR = path.join('tests', '.auth')
const STORAGE_FILE = path.join(AUTH_DIR, 'user.json')
const CONTEXT_FILE = path.join(AUTH_DIR, 'context.json')

const BACKEND = process.env.TEST_BACKEND_URL || 'http://127.0.0.1:4000'
const DEMO_EMAIL = 'demo@haypbooks.test'
const DEMO_PASSWORD = 'Dev@Seed#2026!Local'

setup('authenticate and create company', async ({ page, request }) => {
  fs.mkdirSync(AUTH_DIR, { recursive: true })

  // ── 1. Check if backend test endpoints are available ──────────────────────
  const gate = await request
    .get(`${BACKEND}/api/test/users`, { timeout: 5000 })
    .catch(() => null)
  const testApiAvailable = gate != null && gate.status() === 200

  let email = DEMO_EMAIL
  let password = DEMO_PASSWORD
  let companyId: string | null = null

  // ── 2. Create ephemeral test user (if test API available) ─────────────────
  if (testApiAvailable) {
    email = `e2e-sales-${Date.now()}@haypbooks.test`
    password = 'Playwright1!'

    const createRes = await request
      .post(`${BACKEND}/api/test/create-user`, {
        data: { email, password, name: 'E2E Sales Tester', isEmailVerified: true },
      })
      .catch(() => null)

    if (!createRes || ![200, 201].includes(createRes.status())) {
      // Fall back to demo user if create-user fails
      email = DEMO_EMAIL
      password = DEMO_PASSWORD
    }
  }

  // ── 3. UI login ────────────────────────────────────────────────────────────
  await page.goto(`/login?showLogin=1`, { waitUntil: 'load', timeout: 30_000 })
  await page.fill('input[type="email"], input[id="email"]', email)
  await page.fill('input[type="password"], input[id="password"]', password)
  await page.click('button[type="submit"]')

  // Wait for navigation away from login (may land on /workspace, /verification, etc.)
  await page
    .waitForURL((url) => !url.pathname.includes('/login'), { timeout: 20_000 })
    .catch(() => {
      // If we're still on login, there may be a verification wall — continue anyway
    })

  console.log(`[auth.setup] post-login url=${page.url()}`)
  const postLoginCheck = await page.evaluate(async () => {
    try {
      const res = await fetch('/api/companies/current', { cache: 'no-store' })
      const text = await res.text()
      return { status: res.status, body: text }
    } catch (error) {
      return { error: String(error) }
    }
  })
  console.log(`[auth.setup] post-login /api/companies/current=${JSON.stringify(postLoginCheck)}`)

  // ── 4. Set mandatory onboarding cookies ───────────────────────────────────
  // Next.js middleware requires these to allow access to protected app routes.
  await page.context().addCookies([
    { name: 'onboardingComplete', value: 'true', domain: 'localhost', path: '/' },
    { name: 'ownerOnboardingComplete', value: 'true', domain: 'localhost', path: '/' },
  ])

  // ── 5. Create (or resolve) a company ──────────────────────────────────────
  if (testApiAvailable) {
    const companyRes = await request
      .post(`${BACKEND}/api/test/create-company`, {
        data: { email, name: 'E2E Sales Company' },
      })
      .catch(() => null)

    if (companyRes && companyRes.ok()) {
      const json = await companyRes.json().catch(() => null)
      companyId = json?.company?.id ?? json?.id ?? null
    }
  }

  // If we still have no companyId, try to resolve from the browser session
  if (!companyId) {
    // Navigate to app with onboarding cookies applied
    await page.goto('/sales/customers/customers', { waitUntil: 'load', timeout: 30_000 })
    companyId = await page
      .evaluate(async () => {
        try {
          const r = await fetch('/api/companies/recent', { cache: 'no-store' })
          if (r.ok) {
            const list = await r.json()
            if (Array.isArray(list) && list.length > 0) return list[0].id as string
          }
          const r2 = await fetch('/api/companies/current', { cache: 'no-store' })
          if (r2.ok) {
            const data = await r2.json()
            return (data?.id as string) ?? null
          }
        } catch {
          // ignore
        }
        return null
      })
      .catch(() => null)
  }

  // If no company is available, create one through the authenticated frontend API.
  if (!companyId) {
    const companyName = `E2E Sales Company ${Date.now()}`
    const created = await page
      .evaluate(async (name) => {
        try {
          const res = await fetch('/api/companies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, currency: 'USD' }),
          })
          const text = await res.text()
          let body: any = text
          try { body = JSON.parse(text) } catch { /* not JSON */ }
          return { status: res.status, ok: res.ok, body }
        } catch (error) {
          return { error: String(error) }
        }
      }, companyName)
      .catch(() => null)

    console.log(`[auth.setup] create-company response=${JSON.stringify(created)}`)
    companyId = created?.body?.id ?? created?.body?.company?.id ?? null
  }

  // ── 6. Save storage state ──────────────────────────────────────────────────
  await page.context().storageState({ path: STORAGE_FILE })

  // ── 7. Save shared context for tests ──────────────────────────────────────
  const ctx = { companyId, email, password }
  fs.writeFileSync(CONTEXT_FILE, JSON.stringify(ctx, null, 2))

  console.log(`[auth.setup] companyId=${companyId ?? 'none'} email=${email}`)
})
