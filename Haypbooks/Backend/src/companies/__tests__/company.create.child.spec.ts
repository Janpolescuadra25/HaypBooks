import { CompanyRepository } from '../company.repository.prisma'
import { DEFAULT_TRIAL_PLAN_ID } from '../subscription.util'

const mockPrisma: any = {
  company: { create: jest.fn(), update: jest.fn() },
  workspace: { findUnique: jest.fn(), update: jest.fn() },
  subscription: { findUnique: jest.fn().mockResolvedValue(null), create: jest.fn().mockResolvedValue({ id: 's1' }) },
  $transaction: jest.fn(async (ops: any[]) => ops.map((o: any) => (typeof o === 'function' ? o() : o))),
}

describe('CompanyRepository.createCompanyRecord', () => {
  let repo: CompanyRepository
  beforeEach(() => {
    jest.resetAllMocks()
    mockPrisma.tenant = { update: jest.fn() }
    repo = new CompanyRepository(mockPrisma as any)
  })

  test('activates tenant trial when tenant.trialUsed is false', async () => {
    const company = { id: 'c1', workspaceId: 't1', name: 'ChildCo' }
    mockPrisma.company.create.mockResolvedValueOnce(company)
    mockPrisma.workspace.findUnique.mockResolvedValueOnce({ id: 't1', trialUsed: false })
    mockPrisma.subscription.findUnique.mockResolvedValueOnce(null)
    mockPrisma.subscription.create.mockResolvedValueOnce({ id: 's1' })
    mockPrisma.tenant.update.mockResolvedValueOnce({ id: 't1', trialUsed: true })

    const res = await repo.createCompanyRecord({ workspaceId: 't1', name: 'ChildCo' })
    expect(res).toEqual(company)
    expect(mockPrisma.subscription.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        companyId: 'c1',
        planId: DEFAULT_TRIAL_PLAN_ID,
        status: 'TRIAL',
      }),
    })
    expect(mockPrisma.tenant.update).toHaveBeenCalledWith({ where: { id: 't1' }, data: expect.objectContaining({ trialUsed: true }) })
  })

  test('does not activate trial when tenant.trialUsed is true', async () => {
    const company = { id: 'c2', workspaceId: 't2', name: 'ChildCo2' }
    mockPrisma.company.create.mockResolvedValueOnce(company)
    mockPrisma.workspace.findUnique.mockResolvedValueOnce({ id: 't2', trialUsed: true })

    const res = await repo.createCompanyRecord({ workspaceId: 't2', name: 'ChildCo2' })
    expect(res).toEqual(company)
    expect(mockPrisma.subscription.create).not.toHaveBeenCalled()
  })

  test('is idempotent: returns existing company if name matches (case-insensitive) and does not create duplicate', async () => {
    const existing = { id: 'c3', workspaceId: 't3', name: 'Acme' }
    mockPrisma.company.findFirst = jest.fn().mockResolvedValueOnce(existing)

    const res = await repo.createCompanyRecord({ workspaceId: 't3', name: '  acme  ' })
    expect(res).toEqual(existing)
    expect(mockPrisma.company.create).not.toHaveBeenCalled()
    expect(mockPrisma.tenant.update).not.toHaveBeenCalled()
  })
})