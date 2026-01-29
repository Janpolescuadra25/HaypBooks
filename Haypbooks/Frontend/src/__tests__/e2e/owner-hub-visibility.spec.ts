import { test } from '@playwright/test'

// Owner Workspace related tests are skipped because Owner Workspace and Accountant Hub
// were consolidated into a single Dashboard. Keeping a placeholder test so CI remains
// aware of the change and to avoid accidental regressions.

test('Owner Workspace tests skipped (consolidated into Dashboard)', async () => {
  console.log('Owner Workspace and Accountant Hub removed — test skipped')
})
