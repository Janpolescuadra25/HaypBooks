import { CompanyRepository } from '../company.repository.prisma'

const mockPrisma: any = {
  subscription: { findUnique: jest.fn(), create: jest.fn() },
  company: { update: jest.fn() },
}

describe('CompanyRepository.ensureSubscriptionForCompany', () => {
  let repo: CompanyRepository
  beforeEach(() => {
    jest.resetAllMocks()
    repo = new CompanyRepository(mockPrisma as any)
  })

  test('creates subscription when none exists', async () => {
    mockPrisma.subscription.findUnique.mockResolvedValueOnce(null)
    mockPrisma.subscription.create.mockResolvedValueOnce({ id: 's1', companyId: 'c1' })
    mockPrisma.company.update.mockResolvedValueOnce({ id: 'c1', subscriptionId: 's1' })

    const res = await repo.ensureSubscriptionForCompany('c1', { companyId: 'c1', plan: 'FREE' })
    expect(res).toEqual({ id: 's1', companyId: 'c1' })
    expect(mockPrisma.subscription.create).toHaveBeenCalledWith({ data: expect.objectContaining({ companyId: 'c1' }) })
    expect(mockPrisma.company.update).toHaveBeenCalledWith({ where: { id: 'c1' }, data: { subscriptionId: 's1' } })
  })

  test('returns existing subscription if present', async () => {
    mockPrisma.subscription.findUnique.mockResolvedValueOnce({ id: 's2', companyId: 'c2' })
    mockPrisma.company.update.mockResolvedValueOnce({ id: 'c2', subscriptionId: 's2' })

    const res = await repo.ensureSubscriptionForCompany('c2', { companyId: 'c2', plan: 'FREE' })
    expect(res).toEqual({ id: 's2', companyId: 'c2' })
    expect(mockPrisma.subscription.create).not.toHaveBeenCalled()
    expect(mockPrisma.company.update).toHaveBeenCalledWith({ where: { id: 'c2' }, data: { subscriptionId: 's2' } })
  })

  test('handles race where create fails with P2002 by returning existing', async () => {
    mockPrisma.subscription.findUnique.mockResolvedValueOnce(null)
    const p2002Error: any = new Error('Unique violation')
    p2002Error.code = 'P2002'
    mockPrisma.subscription.create.mockRejectedValueOnce(p2002Error)
    mockPrisma.subscription.findUnique.mockResolvedValueOnce({ id: 's3', companyId: 'c3' })

    const res = await repo.ensureSubscriptionForCompany('c3', { companyId: 'c3', plan: 'FREE' })
    expect(res).toEqual({ id: 's3', companyId: 'c3' })
  })
})