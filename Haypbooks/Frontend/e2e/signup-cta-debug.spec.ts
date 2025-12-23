import { test, expect } from '@playwright/test'

test('debug: Start Your Journey CTA behavior', async ({ page }) => {
  await page.goto('/landing')

  const btn = page.getByRole('button', { name: /Start Your Journey Free/i })
  await expect(btn).toBeVisible()

  await btn.click()

  // small pause to allow handlers to run
  await page.waitForTimeout(500)

  // capture localStorage
  const hasSeen = await page.evaluate(() => localStorage.getItem('hasSeenIntro'))
  console.log('hasSeenIntro:', hasSeen)

  // check for cinematic intro indicator (skip hint)
  const introVisible = await page.locator('text=Skip Intro (ESC)').isVisible().catch(() => false)
  console.log('cinematicIntroVisible:', introVisible)

  console.log('current url:', page.url())

  await page.screenshot({ path: 'e2e/signup-cta-debug.png', fullPage: true })

  // Expectations for the debug run (will assert but we will inspect logs/screenshot)
  expect(hasSeen).toBe('true')
  expect(introVisible).toBe(false)
})