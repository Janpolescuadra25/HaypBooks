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
    mockPrisma.subscription.findUnique = jest.fn().mockResolvedValueOnce(null)
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

  test('is idempotent: returns existing company if name matches (case-insensitive) and does not create duplicate', async () => {
    const existing = { id: 'c3', tenantId: 't3', name: 'Acme' }
    mockPrisma.company.findFirst = jest.fn().mockResolvedValueOnce(existing)

    const res = await repo.createCompanyRecord({ tenantId: 't3', name: '  acme  ' })
    expect(res).toEqual(existing)
    // Should not call create or tenant.update since we returned early
    expect(mockPrisma.company.create).not.toHaveBeenCalled()
    expect(mockPrisma.tenant.update).not.toHaveBeenCalled()
  })
})