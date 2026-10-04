import { CompanyRepository } from '../company.repository.prisma'
import { DEFAULT_TRIAL_PLAN_ID } from '../subscription.util'

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

  test('creates a subscription with the default trial planId when none exists', async () => {
    mockPrisma.subscription.findUnique.mockResolvedValueOnce(null)
    mockPrisma.subscription.create.mockResolvedValueOnce({
      id: 's1',
      companyId: 'c1',
      planId: DEFAULT_TRIAL_PLAN_ID,
      status: 'TRIAL',
    })
    mockPrisma.company.update.mockResolvedValueOnce({ id: 'c1', subscriptionId: 's1' })

    const payload = { companyId: 'c1', planId: DEFAULT_TRIAL_PLAN_ID, status: 'TRIAL' }
    const res = await repo.ensureSubscriptionForCompany('c1', payload)

    expect(res).toEqual({ id: 's1', companyId: 'c1', planId: DEFAULT_TRIAL_PLAN_ID, status: 'TRIAL' })
    expect(mockPrisma.subscription.create).toHaveBeenCalledWith({ data: payload })
    expect(mockPrisma.company.update).toHaveBeenCalledWith({ where: { id: 'c1' }, data: { subscription: { connect: { id: 's1' } } } })
  })

  test('returns existing subscription if present', async () => {
    mockPrisma.subscription.findUnique.mockResolvedValueOnce({
      id: 's2',
      companyId: 'c2',
      planId: DEFAULT_TRIAL_PLAN_ID,
      status: 'TRIAL',
    })
    mockPrisma.company.update.mockResolvedValueOnce({ id: 'c2', subscriptionId: 's2' })

    const res = await repo.ensureSubscriptionForCompany('c2', {
      companyId: 'c2',
      planId: DEFAULT_TRIAL_PLAN_ID,
      status: 'TRIAL',
    })

    expect(res).toEqual({ id: 's2', companyId: 'c2', planId: DEFAULT_TRIAL_PLAN_ID, status: 'TRIAL' })
    expect(mockPrisma.subscription.create).not.toHaveBeenCalled()
    expect(mockPrisma.company.update).toHaveBeenCalledWith({ where: { id: 'c2' }, data: { subscription: { connect: { id: 's2' } } } })
  })

  test('handles race where create fails with P2002 by returning existing', async () => {
    mockPrisma.subscription.findUnique.mockResolvedValueOnce(null)
    const p2002Error: any = new Error('Unique violation')
    p2002Error.code = 'P2002'
    mockPrisma.subscription.create.mockRejectedValueOnce(p2002Error)
    mockPrisma.subscription.findUnique.mockResolvedValueOnce({
      id: 's3',
      companyId: 'c3',
      planId: DEFAULT_TRIAL_PLAN_ID,
      status: 'TRIAL',
    })

    const res = await repo.ensureSubscriptionForCompany('c3', {
      companyId: 'c3',
      planId: DEFAULT_TRIAL_PLAN_ID,
      status: 'TRIAL',
    })

    expect(res).toEqual({ id: 's3', companyId: 'c3', planId: DEFAULT_TRIAL_PLAN_ID, status: 'TRIAL' })
  })

  test('throws when provided invalid subscription ownership', async () => {
    mockPrisma.subscription.findUnique.mockResolvedValueOnce(null)
    await expect(repo.ensureSubscriptionForCompany('c1', {
      companyId: 'c1',
      practiceId: 'p1',
      plan: 'PRO',
    })).rejects.toThrow(/exactly one owner/)
  })

  test('rejects deprecated FREE plan string', async () => {
    mockPrisma.subscription.findUnique.mockResolvedValueOnce(null)

    await expect(repo.ensureSubscriptionForCompany('c1', {
      companyId: 'c1',
      plan: 'FREE',
      status: 'TRIAL',
    })).rejects.toThrow('Deprecated FREE plan is not permitted')
  })
})