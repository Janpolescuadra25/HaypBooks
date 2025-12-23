import { test, expect } from '@playwright/test'

// This test finds all signup CTAs on the landing page and asserts clicking each:
// - sets localStorage.hasSeenIntro = 'true'
// - suppresses the cinematic intro
// - shows the role selector or signup role step, selecting roles leads to the right form
// - 'Back' button returns to role selector

async function assertIntroSuppressed(page) {
  // hasSeenIntro flag
  const hasSeen = await page.evaluate(() => localStorage.getItem('hasSeenIntro'))
  expect(hasSeen).toBe('true')
  // Intro suppression: the cinematic intro shows "Skip Intro (ESC)"; it should not be visible
  await expect(page.locator('text=Skip Intro (ESC)')).not.toBeVisible()
}

async function chooseRoleAndAssert(page, role: 'business' | 'accountant') {
  // If a role modal appears, it is a dialog
  const modal = page.getByRole('dialog', { name: /How will you use HaypBooks\?/i })
  if (await modal.count() > 0) {
    await expect(modal).toBeVisible()
    await page.getByRole('button', { name: /My Business/i }).click()
    if (role === 'accountant') await page.getByRole('button', { name: /Accountant/i }).click()
    else await page.getByRole('button', { name: /My Business/i }).click()
  } else {
    // If no modal, perhaps the signup page shows role selection buttons
    const signupRoleBtn = page.getByRole('button', { name: /My Business|Accountant/i })
    if (await signupRoleBtn.count() > 0) {
      if (role === 'accountant') await page.getByRole('button', { name: /Accountant/i }).click()
      else await page.getByRole('button', { name: /My Business/i }).click()
    }
  }

  // Now we should be on the signup form step
  await page.waitForSelector('form', { timeout: 5000 })

  if (role === 'accountant') {
    await expect(page.getByLabel('Firm name')).toBeVisible()
  } else {
    await expect(page.getByLabel('Company name')).toBeVisible()
  }

  // Back button should exist and return to role selection
  const backBtn = page.getByRole('button', { name: /Back to role selection|Back/i }).first()
  await expect(backBtn).toBeVisible()
  await backBtn.click()

  // After clicking back, the role choice should be visible again (either modal or signup role step)
  if (await modal.count() > 0) {
    await expect(page.getByRole('dialog', { name: /How will you use HaypBooks\?/i })).toBeVisible()
  } else {
    await expect(page.getByRole('button', { name: /My Business/i })).toBeVisible()
  }
}

test('all landing signup CTAs set hasSeenIntro and respect role selection and back button', async ({ page }) => {
  await page.goto('/landing')

  // Collect signup anchors on the landing page
  const ctas = page.locator('a[href*="/signup"]').filter({ hasText: /Sign up|Start|Free|Trial|Join|Get started|Start Your Free/i })
  const count = await ctas.count()
  expect(count).toBeGreaterThan(0)

  for (let i = 0; i < count; i++) {
    // reset state
    await page.goto('/landing')
    await page.evaluate(() => localStorage.removeItem('hasSeenIntro'))

    const cta = ctas.nth(i)
    await expect(cta).toBeVisible()

    await cta.click()

    // Wait for landing -> role selection or signup
    await page.waitForURL(/\/signup(\?.*)?/, { timeout: 5000 }).catch(() => {})

    // Assertions
    await assertIntroSuppressed(page)

    // Try accountant path then back
    await chooseRoleAndAssert(page, 'accountant')

    // Now try business path (navigate back to landing and re-click CTA)
    await page.goto('/landing')
    await page.evaluate(() => localStorage.removeItem('hasSeenIntro'))
    await ctas.nth(i).click()
    await page.waitForURL(/\/signup(\?.*)?/, { timeout: 5000 }).catch(() => {})
    await assertIntroSuppressed(page)
    await chooseRoleAndAssert(page, 'business')
  }
})