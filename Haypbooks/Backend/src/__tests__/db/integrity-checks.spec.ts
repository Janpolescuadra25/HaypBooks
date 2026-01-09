import { runIntegrityChecks } from '../../../scripts/db/integrity-checks'

describe('runIntegrityChecks', () => {
  test('returns no issues when all queries return empty sets', async () => {
    const mockPrisma: any = {
      user: { findMany: jest.fn().mockResolvedValue([]) },
      $queryRawUnsafe: jest.fn().mockResolvedValue([]),
    }

    const issues = await runIntegrityChecks(mockPrisma)
    expect(issues).toEqual([])
    expect(mockPrisma.user.findMany).toHaveBeenCalled()
    expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalled()
  })

  test('detects users_missing_tenant when user.findMany returns rows', async () => {
    const mockUsers = [{ id: 'u1', email: 'a@x.com', companyName: 'ACME' }]
    const mockPrisma: any = {
      user: { findMany: jest.fn().mockResolvedValue(mockUsers) },
      $queryRawUnsafe: jest.fn().mockResolvedValue([]),
    }

    const issues = await runIntegrityChecks(mockPrisma)
    expect(issues.some(i => i.check === 'users_missing_tenant')).toBe(true)
    const umt = issues.find(i => i.check === 'users_missing_tenant')
    expect(umt).toBeDefined()
    expect(umt!.rows).toEqual(mockUsers)
  })

  test('detects tenants_without_owner when $queryRawUnsafe returns rows for that query', async () => {
    const mockPrisma: any = {
      user: { findMany: jest.fn().mockResolvedValue([]) },
      $queryRawUnsafe: jest.fn()
        .mockImplementationOnce(async () => [{ id: 't1', name: 'ACME' }]) // tenantsWithoutOwners
        .mockImplementationOnce(async () => [])
        .mockImplementationOnce(async () => [])
        .mockImplementationOnce(async () => [])
        .mockImplementationOnce(async () => []),
    }

    const issues = await runIntegrityChecks(mockPrisma)
    expect(issues.some(i => i.check === 'tenants_without_owner')).toBe(true)
    const two = issues.find(i => i.check === 'tenants_without_owner')
    expect(two).toBeDefined()
    expect(two!.rows[0].id).toBe('t1')
  })
})