import { CompanyRepository } from '../company.repository.prisma'

const mockPrisma: any = {
  company: { create: jest.fn() },
  tenant: { findUnique: jest.fn(), update: jest.fn() },
  subscription: { create: jest.fn() },
  $transaction: jest.fn(async (ops: any[]) => ops.map((o: any) => (typeof o === 'function' ? o() : o))),
}

describe('CompanyRepository.createCompanyRecord', () => {
  let repo: CompanyRepository
  beforeEach(() => {
    jest.resetAllMocks()
    repo = new CompanyRepository(mockPrisma as any)
  })

  test('activates tenant trial when tenant.trialUsed is false', async () => {
    const company = { id: 'c1', tenantId: 't1', name: 'ChildCo' }
    mockPrisma.company.create.mockResolvedValueOnce(company)
    mockPrisma.tenant.findUnique.mockResolvedValueOnce({ id: 't1', trialUsed: false })
    mockPrisma.subscription.create.mockResolvedValueOnce({ id: 's1' })
    mockPrisma.tenant.update.mockResolvedValueOnce({ id: 't1', trialUsed: true })

    const res = await repo.createCompanyRecord({ tenantId: 't1', name: 'ChildCo' })
    expect(res).toEqual(company)
    expect(mockPrisma.subscription.create).toHaveBeenCalled()
    expect(mockPrisma.tenant.update).toHaveBeenCalledWith({ where: { id: 't1' }, data: expect.objectContaining({ trialUsed: true }) })
  })

  test('does not activate trial when tenant.trialUsed is true', async () => {
    const company = { id: 'c2', tenantId: 't2', name: 'ChildCo2' }
    mockPrisma.company.create.mockResolvedValueOnce(company)
    mockPrisma.tenant.findUnique.mockResolvedValueOnce({ id: 't2', trialUsed: true })

    const res = await repo.createCompanyRecord({ tenantId: 't2', name: 'ChildCo2' })
    expect(res).toEqual(company)
    expect(mockPrisma.subscription.create).not.toHaveBeenCalled()
  })
})