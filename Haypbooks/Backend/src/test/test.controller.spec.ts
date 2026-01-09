import { TestController } from './test.controller'

describe('TestController delete-company', () => {
  let controller: TestController
  let mockPrisma: any
  const pending: any = { get: jest.fn() }
  const auth: any = {}

  beforeEach(() => {
    process.env.NODE_ENV = 'test'
    mockPrisma = {
      user: { findUnique: jest.fn() },
      tenantUser: { findMany: jest.fn() },
      company: { findMany: jest.fn(), findUnique: jest.fn(), delete: jest.fn() },
      tenant: { delete: jest.fn() }
    }

    controller = new TestController(mockPrisma as any, pending as any, auth as any)
    jest.clearAllMocks()
  })

  test('deletes test-created company found by email+name and deletes tenant when requested', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1' })
    // First call: find tenant associations
    mockPrisma.tenantUser.findMany.mockResolvedValueOnce([{ tenantId: 't1' }])
    // First company.findMany call should return the matching company
    mockPrisma.company.findMany.mockResolvedValueOnce([{ id: 'c1', name: 'Acme E2E', tenant: { id: 't1', subdomain: 'e2e-abc', name: 'Acme (E2E)' } }])
    mockPrisma.company.delete.mockResolvedValue({ id: 'c1' })
    // Ensure account lookup returns empty (no system accounts)
    mockPrisma.account = { findMany: jest.fn() }
    mockPrisma.account.findMany.mockResolvedValueOnce([])
    // Subsequent checks for tenant deletion: no other users/company rows
    mockPrisma.tenantUser.findMany.mockResolvedValueOnce([{ tenantId: 't1' }])
    mockPrisma.company.findMany.mockResolvedValueOnce([])

    const res = await controller.deleteCompany({ email: 'u@e.test', name: 'Acme E2E', deleteTenant: true })
    expect(res.deleted).toBe(1)
    expect(mockPrisma.company.delete).toHaveBeenCalled()
    // tenant.delete may be called as best-effort
    expect(mockPrisma.tenant.delete).toHaveBeenCalled()
  })

  test('does not delete non-test companies (safety check)', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1' })
    mockPrisma.tenantUser.findMany.mockResolvedValue([{ tenantId: 't1' }])
    mockPrisma.company.findMany.mockResolvedValue([{ id: 'c2', name: 'Acme', tenant: { id: 't1', subdomain: 'acct-1', name: 'Acme Inc' } }])

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
    mockPrisma.tenantUser.findMany.mockResolvedValueOnce([{ tenantId: 't1' }])
    mockPrisma.company.findMany.mockResolvedValueOnce([{ id: 'c1', name: 'Acme E2E', tenant: { id: 't1', subdomain: 'e2e-abc', name: 'Acme (E2E)' } }])
    mockPrisma.company.delete.mockResolvedValue({ id: 'c1' })
    // Simulate a system account present for tenant
    mockPrisma.account = { findMany: jest.fn() }
    mockPrisma.account.findMany.mockResolvedValueOnce([{ id: 'a1' }])

    const res = await controller.deleteCompany({ email: 'u@e.test', name: 'Acme E2E', deleteTenant: true })
    expect(res.deleted).toBe(1)
    expect(mockPrisma.company.delete).toHaveBeenCalled()
    expect(mockPrisma.tenant.delete).not.toHaveBeenCalled()
  })

  test('swallows tenant.delete errors and continues', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'u1' })
    mockPrisma.tenantUser.findMany.mockResolvedValueOnce([{ tenantId: 't1' }])
    mockPrisma.company.findMany.mockResolvedValueOnce([{ id: 'c2', name: 'Acme E2E', tenant: { id: 't1', subdomain: 'e2e-abc', name: 'Acme (E2E)' } }])
    mockPrisma.company.delete.mockResolvedValue({ id: 'c2' })
    // No system accounts, allow tenant deletion attempt
    mockPrisma.account = { findMany: jest.fn() }
    mockPrisma.account.findMany.mockResolvedValueOnce([])
    // Subsequent checks for tenant deletion: no other users/company rows
    mockPrisma.tenantUser.findMany.mockResolvedValueOnce([{ tenantId: 't1' }])
    mockPrisma.company.findMany.mockResolvedValueOnce([])
    // But tenant.delete throws
    mockPrisma.tenant.delete.mockRejectedValue(new Error('boom'))

    const res = await controller.deleteCompany({ email: 'u@e.test', name: 'Acme E2E', deleteTenant: true })
    expect(res.deleted).toBe(1)
    expect(mockPrisma.company.delete).toHaveBeenCalled()
    expect(mockPrisma.tenant.delete).toHaveBeenCalled()
  })

  test('ignores failing company.delete for some companies and returns count of successful deletes', async () => {
    // Simulate user -> tenant -> multiple companies; first delete fails, second succeeds
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'uX' })
    mockPrisma.tenantUser.findMany.mockResolvedValueOnce([{ tenantId: 'tX' }])
    mockPrisma.company.findMany.mockResolvedValueOnce([
      { id: 'c4', name: 'A E2E', tenant: { id: 'tX', subdomain: 'e2e-111', name: 'A (E2E)' } },
      { id: 'c5', name: 'A E2E', tenant: { id: 'tX', subdomain: 'e2e-111', name: 'A (E2E)' } }
    ])
    mockPrisma.company.delete.mockImplementationOnce(() => { throw new Error('boom') }).mockResolvedValueOnce({ id: 'c5' })

    const res = await controller.deleteCompany({ email: 'u@e.test', name: 'A E2E' })
    expect(res.deleted).toBe(1)
    expect(mockPrisma.company.delete).toHaveBeenCalled()
  })
})
