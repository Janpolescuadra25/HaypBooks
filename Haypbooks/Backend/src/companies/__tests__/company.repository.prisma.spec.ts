import { CompanyRepository } from '../company.repository.prisma'

const mockPrisma: any = {
  subscription: { create: jest.fn() },
  tenantUser: { findMany: jest.fn() },
  $executeRaw: jest.fn(),
  $queryRawUnsafe: jest.fn(),
  $executeRawUnsafe: jest.fn(),
  $transaction: jest.fn(async (ops: any[]) => ops.map((o: any) => (typeof o === 'function' ? o() : o))),
  tenant: { create: jest.fn(), update: jest.fn(), findUnique: jest.fn() },
}

describe('CompanyRepository', () => {
  let repo: CompanyRepository
  beforeEach(() => {
    jest.resetAllMocks()
    const prismaWrapper: any = mockPrisma
    repo = new CompanyRepository(prismaWrapper)
  })

  test('create activates trial if tenant.trialUsed is false', async () => {
    const tenant = { id: 't1', name: 'ACME', trialUsed: false }
    mockPrisma.tenant.create.mockResolvedValueOnce(tenant)
    mockPrisma.subscription.create.mockResolvedValueOnce({ id: 's1' })
    mockPrisma.tenant.update.mockResolvedValueOnce({ id: 't1', trialUsed: true })

    const res = await repo.create({ name: 'ACME' })
    expect(res).toEqual(tenant)
    expect(mockPrisma.subscription.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ companyId: 't1' }) }))
    expect(mockPrisma.tenant.update).toHaveBeenCalledWith({ where: { id: 't1' }, data: expect.objectContaining({ trialUsed: true }) })
  })

  test('findForUser uses owned filter to require isOwner true', async () => {
    // Arrange
    mockPrisma.company = { findMany: jest.fn().mockResolvedValueOnce([]) }

    // Act
    await repo.findForUser('user-123', 'owned')

    // Assert: ensure prisma.company.findMany was called with the owned where clause
    expect(mockPrisma.company.findMany).toHaveBeenCalledTimes(1)
    const calledWith = mockPrisma.company.findMany.mock.calls[0][0]
    expect(calledWith.where).toBeDefined()
    expect(calledWith.where.isActive).toBe(true)
    expect(calledWith.where.tenant).toBeDefined()
    expect(calledWith.where.tenant.users).toBeDefined()
    expect(calledWith.where.tenant.users.some).toEqual({ userId: 'user-123', isOwner: true, status: 'ACTIVE' })
  })

  test('findForUser default (no filter) does not require isOwner', async () => {
    // Arrange
    mockPrisma.company = { findMany: jest.fn().mockResolvedValueOnce([]) }

    // Act
    await repo.findForUser('u-abc')

    // Assert
    expect(mockPrisma.company.findMany).toHaveBeenCalledTimes(1)
    const calledWith = mockPrisma.company.findMany.mock.calls[0][0]
    expect(calledWith.where).toBeDefined()
    expect(calledWith.where.tenant.users.some).toEqual({ userId: 'u-abc', status: 'ACTIVE' })
  })
})