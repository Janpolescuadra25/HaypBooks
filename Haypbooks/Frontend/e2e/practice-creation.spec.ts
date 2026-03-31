import { test, expect } from '@playwright/test'

test('Create practice via onboarding and verify practice hub name', async ({ page, request }) => {
  const email = 'e2e-practice-user@haypbooks.test'
  const password = 'Password123!'

  // Ensure user exists via test API endpoint to avoid manual signup paths
  const gate = await request.get('http://localhost:4000/api/test/users')
  if (gate.status() !== 403) {
    const resp = await request.post('http://localhost:4000/api/test/create-user', {
      data: {
        email,
        password,
        name: 'E2E Practice User',
        isEmailVerified: true,
        isAccountant: true,
      },
    })
    expect([200, 201, 409]).toContain(resp.status())
  } else {
    // Fallback flow: do nothing; assume existing user is already available via preseeded fixtures
  }

  // Login to the app
  await page.goto('/login')
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button:has-text("Sign in")')

  await Promise.race([
    page.waitForURL(/\/workspace/, { timeout: 30000 }),
    page.waitForURL(/\/dashboard/, { timeout: 30000 }),
    page.waitForURL(/\/hub\//, { timeout: 30000 }),
  ])

  // Navigate to workspace / practice onboarding path
  await page.goto('/workspace')

  // Click the "New Practice" CTA from My Practice card
  await page.click('button:has-text("New Practice")')

  // Should route into practice onboarding
  await page.waitForURL('/onboarding/practice', { timeout: 30000 })

  const uniquePracticeName = `E2E Test Practice ${new Date().toISOString()}`

  await page.fill('input#practice-name', uniquePracticeName)

  // Select required fields for the first onboarding step
  await page.click('button[id="practice-type"]')
  await page.click('text=Sole Practitioner')

  await page.click('button[id="industry"]')
  await page.click('text=General Practice')

  // Currency should be preselected (USD/PHP) by default according to location
  // Continue through the onboarding steps
  await page.click('button[data-testid="finish-onboarding-button"]')

  // Step 2: services offered selection has default selection; continue
  await page.click('button[data-testid="finish-onboarding-button"]')

  // Step 3: done step - navigate to practice hub
  await page.click('button:has-text("Choose your plan")')

  // When done, go to practice hub to verify the new practice is active in the UI
  await page.goto('/practice-hub')

  // The practice name should now be visible in the dashboard heading.
  await expect(page.locator('h2')).toContainText(uniquePracticeName)

  // Additional check: confirm the practice name is in practice list text or success indication
  await expect(page.locator(`text=${uniquePracticeName}`)).toBeVisible({ timeout: 15000 })
})
