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
    expect(mockPrisma.subscription.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ tenantId: 't1', companyId: 't1' }) }))
    expect(mockPrisma.tenant.update).toHaveBeenCalledWith({ where: { id: 't1' }, data: expect.objectContaining({ trialUsed: true }) })
  })
})