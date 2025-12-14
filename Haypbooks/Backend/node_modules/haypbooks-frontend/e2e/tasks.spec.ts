import { test, expect } from '@playwright/test'

test('tasks page loads', async ({ page }) => {
  await page.goto('/tasks')
  await expect(page.locator('text=Tasks')).toBeVisible()
})
