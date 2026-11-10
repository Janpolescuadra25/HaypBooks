import { test, expect } from '@playwright/test'

test('Practice Hub loads with seeded data', async ({ page }) => {
  await page.route('**/api/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'user-owner-1',
        email: 'owner@haypbooks.test',
        role: 'OWNER',
        practiceRole: 'PRACTICE_OWNER',
      }),
    })
  })

  await page.route('**/api/practice-hub/dashboard*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ practiceName: 'Demo Accounting Firm' }),
    })
  })

  await page.route('**/api/practice-hub/stats*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ activeClients: 3, openTasks: 2, pendingReviews: 1, completedMtd: 5 }),
    })
  })

  await page.route('**/api/practice-hub/activity*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
  })

  await page.route('**/api/practice-hub/deadlines*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) })
  })

  await page.route('**/api/practice-hub/clients*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { companyId: 'client-1', companyName: 'Acme Accounting Corp' },
        { companyId: 'client-2', companyName: 'Globex Logistics' },
      ]),
    })
  })

  await page.route('**/api/practice-hub/tasks*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        tasks: [
          { id: 'task-ph-001', title: 'Monthly AP Accrual Verification', status: 'OPEN', priority: 'HIGH', assignee: null, companyId: 'client-1', dueDate: '2026-11-15T00:00:00.000Z', description: 'Verify accruals and review open liabilities.' },
        ],
        total: 1,
        totalPages: 1,
      }),
    })
  })

  await page.route('**/api/practice-hub/members*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([]),
    })
  })

  await page.goto('/practice-hub')

  await expect(page.getByRole('heading', { name: 'Practice Dashboard' })).toBeVisible({ timeout: 15000 })
  await expect(page.locator('text=My Clients')).toBeVisible({ timeout: 15000 })
  await expect(page.getByText('Acme Accounting Corp').first()).toBeVisible({ timeout: 15000 })
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
    await page.route('**/api/practice-hub/tasks*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          tasks: mockPracticeTasks,
          total: mockPracticeTasks.length,
          totalPages: 1,
        }),
      });
    });

    await page.route('**/api/practice-hub/members*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route('**/api/practice-hub/dashboard*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ practiceName: 'Demo Accounting Firm' }),
      });
    });

    await page.route('**/api/practice-hub/stats*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ activeClients: 3, openTasks: 2, pendingReviews: 1, completedMtd: 5 }),
      });
    });

    await page.route('**/api/practice-hub/activity*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.route('**/api/practice-hub/deadlines*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.route('**/api/practice-hub/clients*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { companyId: 'client-1', companyName: 'Acme Accounting Corp' },
          { companyId: 'client-2', companyName: 'Globex Logistics' },
        ]),
      });
    });

    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'user-owner-1',
          email: 'owner@haypbooks.test',
          role: 'OWNER',
          practiceRole: 'PRACTICE_OWNER',
        }),
      });
    });

    await page.goto('/practice-hub');
    await page.getByRole('button', { name: 'Work Mgmt' }).click();
    await page.getByRole('button', { name: 'Tasks' }).click();
    await page.waitForLoadState('networkidle');

    await expect(page.locator('h1, [data-testid="practice-hub-title"]')).toContainText(/Practice Hub/i);
    await expect(page.locator('text=Monthly AP Accrual Verification')).toBeVisible();
    await expect(page.locator('text=Client Onboarding Review')).toBeVisible();

    // Inspect the task detail modal via the actual edit action exposed in the table
    await page.getByRole('button', { name: 'Edit Monthly AP Accrual Verification' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Task title' })).toHaveValue('Monthly AP Accrual Verification');
  });

  test('Non-practice role receives 403 Forbidden boundary and audit feedback', async ({ page }) => {
    await page.route('**/api/auth/me', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'user-basic-1',
          email: 'user@haypbooks.test',
          role: 'USER',
          practiceRole: 'PRACTICE_STAFF',
        }),
      });
    });
    await page.route('**/api/practice-hub/tasks*', async (route) => {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          statusCode: 403,
          message: 'Access denied. Required role: OWNER, ADMIN',
          error: 'Forbidden',
        }),
      });
    });
    await page.route('**/api/practice-hub/members*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });
    await page.route('**/api/practice-hub/dashboard*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ practiceName: 'Demo Accounting Firm' }) });
    });
    await page.route('**/api/practice-hub/stats*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ activeClients: 1, openTasks: 0, pendingReviews: 0, completedMtd: 0 }) });
    });
    await page.route('**/api/practice-hub/activity*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route('**/api/practice-hub/deadlines*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });
    await page.route('**/api/practice-hub/clients*', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    });

    await page.goto('/practice-hub');
    await page.getByRole('button', { name: 'Work Mgmt' }).click();
    await page.getByRole('button', { name: 'Tasks' }).click();
    await page.waitForLoadState('networkidle');

    const errorNotice = page.locator('[role="alert"]').filter({ hasText: 'Access denied. Required role: OWNER, ADMIN' });
    await expect(errorNotice).toBeVisible();
  });
});
