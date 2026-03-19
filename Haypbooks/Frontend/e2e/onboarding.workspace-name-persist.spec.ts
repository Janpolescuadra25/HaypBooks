import { test, expect } from '@playwright/test'

// This test requires a staging environment with DB access and the helper API to look up companies.
// Guarded to run only when E2E_ENV=staging (so it doesn't run in local CI without DB access).
// eslint-disable-next-line prefer-const
var isStaging = process.env.E2E_ENV === 'staging'

// eslint-disable-next-line @typescript-eslint/no-extra-semi
;(test as any)[isStaging ? 'describe' : 'skip']('Onboarding -> Owner Workspace persists to Tenant.workspace_name (staging only)', () => {
  test('fills owner workspace and verifies tenant workspace name persisted', async ({ page, request }) => {
    const ownerWorkspace = `Playwright Workspace ${Date.now()}`

    // Navigate to get-started page and fill Owner Workspace input
    await page.goto('/get-started')
    await page.fill('#workspace-name', ownerWorkspace)
    await page.click('button:has-text("Continue")')

    // Complete any minimal required flow to create tenant (may differ per environment)
    // Use an API endpoint exposed in staging for test verification (e.g. /api/test/companies-for-email)

    // Wait briefly for onboarding to complete and backend to persist
    await page.waitForTimeout(2000)

    // Verify via test helper that tenant.workspaceName exists
    const resp = await request.get(`/api/test/companies?workspaceName=${encodeURIComponent(ownerWorkspace)}`)
    expect(resp.ok()).toBeTruthy()
    const json = await resp.json()
    const found = Array.isArray(json) && json.some((c: any) => c.tenantWorkspaceName === ownerWorkspace)
    expect(found).toBe(true)
  })
})
