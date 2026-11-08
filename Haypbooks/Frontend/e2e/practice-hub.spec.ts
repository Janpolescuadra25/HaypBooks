import { test, expect } from '@playwright/test'

test('Practice Hub loads with seeded data', async ({ page, request }) => {
  const email = 'demo@haypbooks.test'
  const password = 'password'

  // Ensure user is present either via test API or UI signup fallback
  const gate = await request.get('http://localhost:4000/api/test/users')
  if (gate.status() !== 403) {
    const resp = await request.post('http://localhost:4000/api/test/create-user', {
      data: {
        email,
        password,
        name: 'Demo User',
        isEmailVerified: true,
        isAccountant: true,
      },
    })
    expect([200, 201, 409]).toContain(resp.status())
  } else {
    // fallback: create the user through signup flow when test endpoint is locked down
    await page.goto('/signup')
    await page.click('button:has-text("Accountant")')
    await page.fill('input[name="firstName"]', 'Demo')
    await page.fill('input[name="lastName"]', 'User')
    await page.fill('input[name="companyName"]', 'Demo Accounting Firm')
    await page.fill('input[type="email"]', email)
    await page.fill('input[type="password"]', password)
    await page.fill('input[name="confirmPassword"]', password)
    await page.click('button:has-text("Create account")')

    // Onboard path may send to /hub/accountant or /workspace based on flow
    await Promise.race([
      page.waitForURL(/\/hub\/accountant/, { timeout: 30000 }),
      page.waitForURL(/\/workspace/, { timeout: 30000 }),
      page.waitForURL(/\/dashboard/, { timeout: 30000 }),
    ])

    // Reset to login route for consistency
    await page.goto('/login')
  }

  // 1) Login as demo user
  await page.goto('/login')
  await page.fill('input[type="email"]', email)
  await page.fill('input[type="password"]', password)
  await page.click('button:has-text("Sign in")')

  // After login, workspace/hub page should be chosen or fallback to /workspace
  await Promise.race([
    page.waitForURL(/\/workspace/, { timeout: 30000 }),
    page.waitForURL(/\/dashboard/, { timeout: 30000 }),
    page.waitForURL(/\/hub\//, { timeout: 30000 }),
  ])

  // 2) Navigate to Practice Hub explicitly
  await page.goto('/practice-hub')

  // 3) Verify seeded practice name is visible
  await expect(page.locator('text=Demo Accounting Firm')).toBeVisible({ timeout: 30000 })

  // 4) Verify client list is not empty
  await expect(page.locator('text=No clients yet. Connect a client to see this list.')).toHaveCount(0)

  // Optionally: check section exists in dashboard
  await expect(page.locator('text=My Clients')).toBeVisible({ timeout: 15000 })

  // Confirm at least one client row appears
  await expect(page.locator('div').filter({ hasText: 'Active' }).first()).toBeVisible({ timeout: 15000 })
})

test.describe('Practice Hub Step 5B - Work Queues & RBAC Workflows', () => {
  const mockPracticeTasks = [
    {
      id: 'task-ph-001',
      title: 'Monthly AP Accrual Verification',
      queue: 'UNASSIGNED',
      priority: 'HIGH',
      status: 'OPEN',
      assignedTo: null,
      clientName: 'Acme Accounting Corp',
      dueDate: '2026-11-15T00:00:00.000Z',
      createdAt: '2026-11-01T08:00:00.000Z',
    },
    {
      id: 'task-ph-002',
      title: 'Client Onboarding Review',
      queue: 'IN_REVIEW',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      assignedTo: 'Practice Staff Member',
      clientName: 'Globex Logistics',
      dueDate: '2026-11-20T00:00:00.000Z',
      createdAt: '2026-11-02T09:30:00.000Z',
    },
    {
      id: 'task-ph-003',
      title: 'Practice Workspace Approval',
      queue: 'APPROVAL',
      priority: 'CRITICAL',
      status: 'PENDING_APPROVAL',
      assignedTo: 'Practice Administrator',
      clientName: 'Soylent Financials',
      dueDate: '2026-11-10T00:00:00.000Z',
      createdAt: '2026-11-03T11:00:00.000Z',
    },
  ];

  test('PRACTICE_STAFF role can view work queues and task details', async ({ page }) => {
    await page.route('**/api/practice/hub/tasks*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: mockPracticeTasks,
          total: mockPracticeTasks.length,
        }),
      });
    });

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'user-staff-1',
          email: 'staff@haypbooks.test',
          role: 'STAFF',
          practiceRole: 'PRACTICE_STAFF',
        }),
      });
    });

    await page.goto('/practice/hub');
    await page.waitForLoadState('networkidle');

    // Verify page header and queues container
    await expect(page.locator('h1, [data-testid="practice-hub-title"]')).toContainText(/Practice Hub/i);
    await expect(page.locator('text=Monthly AP Accrual Verification')).toBeVisible();
    await expect(page.locator('text=Client Onboarding Review')).toBeVisible();

    // Inspect task detail modal
    await page.click('text=Monthly AP Accrual Verification');
    await expect(page.locator('role=dialog, [data-testid="task-modal"]')).toBeVisible();
    await expect(page.locator('text=Acme Accounting Corp')).toBeVisible();
  });

  test('Non-practice role receives 403 Forbidden boundary and audit feedback', async ({ page }) => {
    await page.route('**/api/practice/hub/tasks*', async (route) => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          statusCode: 403,
          message: 'Forbidden: Insufficient practice workspace privileges',
          error: 'Forbidden',
        }),
      });
    });

    await page.goto('/practice/hub');
    await page.waitForLoadState('networkidle');

    // Verify 403 Forbidden access boundary is handled gracefully
    const errorNotice = page.locator('[role="alert"], text=Forbidden, text=Insufficient practice workspace privileges');
    await expect(errorNotice.first()).toBeVisible();
  });
});
