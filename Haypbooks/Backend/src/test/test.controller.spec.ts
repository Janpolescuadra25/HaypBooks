import { TestController } from './test.controller'

describe('TestController delete-company', () => {
  let controller: TestController
  let mockPrisma: any
  const pending: any = { get: jest.fn() }
  const auth: any = {}
  const onboarding: any = { complete: jest.fn() }

  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    mockPrisma = {
      user: { findUnique: jest.fn() },
      workspaceUser: { findMany: jest.fn() },
      company: { findMany: jest.fn(), findUnique: jest.fn(), delete: jest.fn() },
      workspace: { delete: jest.fn() },
      $queryRaw: jest.fn(),
      $queryRawUnsafe: jest.fn(),
      $executeRawUnsafe: jest.fn()
    }

    controller = new TestController(mockPrisma as any, pending as any, auth as any, onboarding as any)
    jest.clearAllMocks()
  })

  test('deletes test-created company found by email+name and deletes tenant when requested', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1' })
    // First call: find tenant associations
    mockPrisma.workspaceUser.findMany.mockResolvedValueOnce([{ workspaceId: 't1' }])
    // First raw query should return the matching company (prisma.$queryRawUnsafe used in controller)
    mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([{ id: 'c1', workspaceId: 't1', name: 'Acme E2E' }])
    mockPrisma.company.delete.mockResolvedValue({ id: 'c1' })
    // Ensure account lookup returns empty (no system accounts)
    mockPrisma.account = { findMany: jest.fn() }
    mockPrisma.account.findMany.mockResolvedValueOnce([])
    // Subsequent checks for tenant deletion: no other users/company rows
    mockPrisma.workspaceUser.findMany.mockResolvedValueOnce([{ workspaceId: 't1' }])
    mockPrisma.company.findMany.mockResolvedValueOnce([])

    const res = await controller.deleteCompany({ email: 'u@e.test', name: 'Acme E2E', deleteTenant: true })
    expect(res.deleted).toBe(1)
    expect(mockPrisma.company.delete).toHaveBeenCalled()
    // tenant delete may be attempted via raw DELETE (best-effort) or via prisma.workspace.delete
    const execCalled = mockPrisma.$executeRawUnsafe.mock && mockPrisma.$executeRawUnsafe.mock.calls.length > 0
    const tenantDeleteCalled = mockPrisma.workspace.delete.mock && mockPrisma.workspace.delete.mock.calls.length > 0
    expect(execCalled || tenantDeleteCalled).toBeTruthy()
  })

  test('does not delete non-test companies (safety check)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1' })
    mockPrisma.workspaceUser.findMany.mockResolvedValue([{ workspaceId: 't1' }])
    mockPrisma.$queryRawUnsafe.mockResolvedValue([{ id: 'c2', workspaceId: 't1', name: 'Acme' }])

    const res = await controller.deleteCompany({ email: 'u@e.test', name: 'Acme' })
    expect(res.deleted).toBe(0)
    expect(res.message).toMatch(/none appear to be test-created/i)
    expect(mockPrisma.company.delete).not.toHaveBeenCalled()
  })

  test('delete by companyId deletes when company appears test-created', async () => {
    mockPrisma.company.findUnique.mockResolvedValue({ id: 'c3', name: 'ById E2E', tenant: { id: 't3', subdomain: 'e2e-zzz', name: 'ById (E2E)' } })
    mockPrisma.company.delete.mockResolvedValue({ id: 'c3' })

    const res = await controller.deleteCompany({ companyId: 'c3' })
    expect(res.deleted).toBe(1)
    expect(mockPrisma.company.delete).toHaveBeenCalledWith({ where: { id: 'c3' } })
  })

  test('does not attempt to delete tenant when tenant has system accounts', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1' })
    mockPrisma.workspaceUser.findMany.mockResolvedValueOnce([{ workspaceId: 't1' }])
    mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([{ id: 'c1', workspaceId: 't1', name: 'Acme E2E' }])
    mockPrisma.company.delete.mockResolvedValue({ id: 'c1' })
    // Simulate a system account present for tenant
    mockPrisma.account = { findMany: jest.fn() }
    mockPrisma.account.findMany.mockResolvedValueOnce([{ id: 'a1' }])

    const res = await controller.deleteCompany({ email: 'u@e.test', name: 'Acme E2E', deleteTenant: true })
    expect(res.deleted).toBe(1)
    expect(mockPrisma.company.delete).toHaveBeenCalled()
    expect(mockPrisma.workspace.delete).not.toHaveBeenCalled()
  })

  test('swallows tenant.delete errors and continues', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1' })
    mockPrisma.workspaceUser.findMany.mockResolvedValueOnce([{ workspaceId: 't1' }])
    mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([{ id: 'c2', workspaceId: 't1', name: 'Acme E2E' }])
    mockPrisma.company.delete.mockResolvedValue({ id: 'c2' })
    // No system accounts, allow tenant deletion attempt
    mockPrisma.account = { findMany: jest.fn() }
    mockPrisma.account.findMany.mockResolvedValueOnce([])
    // Subsequent checks for tenant deletion: no other users/company rows
    mockPrisma.workspaceUser.findMany.mockResolvedValueOnce([{ workspaceId: 't1' }])
    mockPrisma.company.findMany.mockResolvedValueOnce([])
    // But tenant.delete throws
    mockPrisma.workspace.delete.mockRejectedValue(new Error('boom'))

    const res = await controller.deleteCompany({ email: 'u@e.test', name: 'Acme E2E', deleteTenant: true })
    expect(res.deleted).toBe(1)
    expect(mockPrisma.company.delete).toHaveBeenCalled()
    const execCalled = mockPrisma.$executeRawUnsafe.mock && mockPrisma.$executeRawUnsafe.mock.calls.length > 0
    const tenantDeleteCalled = mockPrisma.workspace.delete.mock && mockPrisma.workspace.delete.mock.calls.length > 0
    expect(execCalled || tenantDeleteCalled).toBeTruthy()
  })

  test('ignores failing company.delete for some companies and returns count of successful deletes', async () => {
    // Simulate user -> tenant -> multiple companies; first delete fails, second succeeds
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'uX' })
    mockPrisma.workspaceUser.findMany.mockResolvedValueOnce([{ workspaceId: 'tX' }])
    mockPrisma.$queryRawUnsafe.mockResolvedValueOnce([
      { id: 'c4', workspaceId: 'tX', name: 'A E2E' },
      { id: 'c5', workspaceId: 'tX', name: 'A E2E' }
    ])
    mockPrisma.company.delete.mockImplementationOnce(() => { throw new Error('boom') }).mockResolvedValueOnce({ id: 'c5' })

    const res = await controller.deleteCompany({ email: 'u@e.test', name: 'A E2E' })
    expect(res.deleted).toBe(1)
    expect(mockPrisma.company.delete).toHaveBeenCalled()
  })
})
