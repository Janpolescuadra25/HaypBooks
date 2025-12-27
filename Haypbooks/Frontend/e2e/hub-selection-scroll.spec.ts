import { test, expect } from '@playwright/test'

// Sanity: the selection page should feel like a full-page experience and NOT show a page-level vertical scrollbar
// in normal desktop viewports — it should fit the viewport without needing to scroll.
test('hub selection page fits viewport (no page scroll)', async ({ page }) => {
  await page.goto('/hub/selection')
  const overflowY = await page.evaluate(() => getComputedStyle(document.documentElement).overflowY)
  const hasScroll = await page.evaluate(() => document.documentElement.scrollHeight > window.innerHeight)
  // we expect the page to allow native scrolling when needed (not forced hidden)
  expect(overflowY).not.toBe('hidden')
  // but the selection page should fit within typical viewport heights and not require scrolling
  expect(hasScroll).toBe(false)
})