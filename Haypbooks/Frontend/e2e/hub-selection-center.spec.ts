import { test, expect } from '@playwright/test'

// Verify that the hub selection card is centered in the viewport on initial load.
// If zoomed or on very small viewports, the page may be scrollable but the initial position
// should place the card approximately in the vertical center of the viewport.
test('hub selection card is centered on load', async ({ page }) => {
  await page.goto('/hub/selection')
  const card = page.locator('main > div.bg-white')
  await expect(card).toBeVisible()
  const box = await card.boundingBox()
  const viewport = await page.evaluate(() => ({ height: window.innerHeight }))
  if (!box) throw new Error('Card bounding box not found')
  const centerY = box.y + box.height / 2
  const viewportCenter = viewport.height / 2
  // Expect the card to be positioned above the viewport center (moved upward by ~80px above center)
  expect(centerY).toBeLessThan(viewportCenter - 24)
})