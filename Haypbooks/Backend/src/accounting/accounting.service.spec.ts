import { BadRequestException, NotFoundException } from '@nestjs/common'
import { AccountingService } from './accounting.service'

describe('AccountingService - COA validation rules', () => {
  let service: AccountingService
  let mockRepo: any
  let mockPrisma: any

  beforeEach(() => {
    mockRepo = {
      findAccountById: jest.fn(),
      updateAccount: jest.fn(),
      softDeleteAccount: jest.fn(),
    }
    mockPrisma = {
      workspaceUser: { findFirst: jest.fn().mockResolvedValue({ id: 'u1' }) },
      account: { findFirst: jest.fn(), findUnique: jest.fn() },
    }
    service = new AccountingService(mockRepo as any, mockPrisma as any)
  })

  it('prevents changing account type once balance is non-zero', async () => {
    mockRepo.findAccountById.mockResolvedValue({ id: 'a1', typeId: 1, balance: 100, isSystem: false })
    await expect(service.updateAccount('u1', 'c1', 'a1', { typeId: 2 })).rejects.toThrow(BadRequestException)
  })

  it('prevents deactivating an account with active children', async () => {
    mockRepo.findAccountById.mockResolvedValue({
      id: 'a1',
      balance: 0,
      isSystem: false,
      children: [{ id: 'c1', isActive: true }],
    })
    await expect(service.deactivateAccount('u1', 'c1', 'a1')).rejects.toThrow(BadRequestException)
  })

  it('prevents setting a child as parent creating a cycle', async () => {
    mockRepo.findAccountById.mockResolvedValue({ id: 'a1', balance: 0, typeId: 1, isSystem: false })
    // Simulate the new parent is a child whose parent is the account being edited
    mockPrisma.account.findUnique
      .mockResolvedValueOnce({ parentId: 'a1' })  // c1 -> a1
      .mockResolvedValueOnce({ parentId: null })  // a1 has no parent

    await expect(service.updateAccount('u1', 'c1', 'a1', { parentId: 'c1' })).rejects.toThrow(BadRequestException)
  })

  it('validates COA template structure before saving', async () => {
    const invalidTemplates = [{ id: 'x', name: 'X', description: 'X', industryKeywords: [], lines: [{ code: 'abc', name: 'Bad', typeKey: 'ASSET', normalSide: 'DEBIT', isHeader: true }] }]
    await expect(service.saveCoaTemplates(invalidTemplates)).rejects.toThrow(BadRequestException)
  })

  it('returns real close workflow checks', async () => {
    mockRepo.countAccounts = jest.fn().mockResolvedValue(5)
    mockRepo.countJournalEntries = jest.fn((companyId: string, status: string) => {
      if (status === 'DRAFT') return Promise.resolve(0)
      if (status === 'POSTED') return Promise.resolve(12)
      return Promise.resolve(0)
    })
    jest.spyOn(service, 'getTrialBalance').mockResolvedValue({ rows: [], totalDebits: 1000, totalCredits: 1000, balanced: true, asOf: new Date().toISOString() } as any)
    jest.spyOn(service, 'listPeriods').mockResolvedValue([{ id: 'p1', name: '2026-01' } as any])

    const result = await service.getCloseWorkflow('u1', 'c1')

    expect(result.checks).toEqual({ coa: true, journalEntries: true, trialBalance: true })
    const coa = result.steps.find((step: any) => step.id === 'coa')
    const trial = result.steps.find((step: any) => step.id === 'trial-balance')
    const journal = result.steps.find((step: any) => step.id === 'journal')

    expect(coa).toBeDefined()
    expect(journal).toBeDefined()
    expect(trial).toBeDefined()

    expect(coa!.status).toBe('Completed')
    expect(coa!.valid).toBe(true)
    expect(journal!.status).toBe('Completed')
    expect(journal!.valid).toBe(true)
    expect(trial!.status).toBe('Completed')
    expect(trial!.valid).toBe(true)
  })
})
