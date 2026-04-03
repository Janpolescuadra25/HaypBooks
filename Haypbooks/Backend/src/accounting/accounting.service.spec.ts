import { BadRequestException, NotFoundException } from '@nestjs/common'
import { AccountingService } from './accounting.service'
import { AccountingRepository } from './accounting.repository'

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

// ─── Regression tests: JE edit/void entryNumber uniqueness bug ───────────────

describe('AccountingRepository - JE edit/void entryNumber uniqueness', () => {
  let mockPrisma: any
  let repo: AccountingRepository

  const postedJe = {
    id: 'je1',
    workspaceId: 'ws1',
    companyId: 'c1',
    entryNumber: 'JE-100',
    date: new Date('2025-01-15'),
    description: 'Original entry',
    currency: 'PHP',
    postingStatus: 'POSTED',
    deletedAt: null,
    lines: [
      { id: 'l1', accountId: 'a1', debit: 100, credit: 0, description: null },
      { id: 'l2', accountId: 'a2', debit: 0, credit: 100, description: null },
    ],
  }

  beforeEach(() => {
    // tx mock — capture calls to verify behaviour inside transaction
    const txJournalEntry = {
      update: jest.fn().mockResolvedValue({}),
      create: jest.fn().mockResolvedValue({
        id: 'je2',
        entryNumber: 'JE-100',
        lines: [],
        workspaceId: 'ws1',
        companyId: 'c1',
      }),
    }
    const txAccount = { findUnique: jest.fn().mockResolvedValue({ id: 'a1', normalSide: 'DEBIT', balance: 200 }), update: jest.fn().mockResolvedValue({}) }

    mockPrisma = {
      journalEntry: {
        findFirst: jest.fn().mockResolvedValue({ ...postedJe }),
        update: jest.fn().mockResolvedValue({}),
        create: jest.fn().mockResolvedValue({ id: 'je2', entryNumber: 'JE-100', lines: [] }),
      },
      $transaction: jest.fn().mockImplementation(async (cb: any) => {
        return cb({ journalEntry: txJournalEntry, account: txAccount })
      }),
      auditLog: { create: jest.fn().mockResolvedValue({}) },
      _txJournalEntry: txJournalEntry,
    }

    repo = new AccountingRepository(mockPrisma as any)
  })

  test('editing a POSTED entry clears entryNumber on original and assigns it to replacement', async () => {
    await repo.updateJournalEntry('c1', 'je1', {
      date: new Date('2025-02-01'),
      description: 'Updated',
      updatedById: 'u1',
      lines: [
        { accountId: 'a1', debit: 200, credit: 0 },
        { accountId: 'a2', debit: 0, credit: 200 },
      ],
    })

    const txJournalEntry = mockPrisma._txJournalEntry

    // The tx.journalEntry.update MUST have been called with entryNumber: null
    const updateCalls: any[] = txJournalEntry.update.mock.calls
    const voidCall = updateCalls.find((args: any[]) =>
      args[0]?.where?.id === 'je1'
    )
    expect(voidCall).toBeDefined()
    expect(voidCall[0].data.postingStatus).toBe('VOIDED')
    expect(voidCall[0].data.entryNumber).toBeNull()

    // The tx.journalEntry.create MUST carry the original entryNumber
    const createCalls: any[] = txJournalEntry.create.mock.calls
    expect(createCalls).toHaveLength(1)
    expect(createCalls[0][0].data.entryNumber).toBe('JE-100')
  })

  test('voiding a POSTED entry creates reversal with VOID- prefix entryNumber', async () => {
    // Override findFirst to return a POSTED entry with entryNumber JE-200
    const voidJe = { ...postedJe, id: 'je3', entryNumber: 'JE-200' }
    mockPrisma.journalEntry.findFirst.mockResolvedValue(voidJe)

    // Reconfigure txJournalEntry inside $transaction for this test
    const txCreate = jest.fn().mockResolvedValue({ id: 'je4', entryNumber: 'VOID-JE-200', lines: [] })
    const txUpdate = jest.fn().mockResolvedValue({})
    const txAccount = {
      findUnique: jest.fn().mockResolvedValue({ id: 'a1', normalSide: 'DEBIT', balance: 500 }),
      update: jest.fn().mockResolvedValue({}),
    }
    mockPrisma.$transaction = jest.fn().mockImplementation(async (cb: any) => {
      return cb({
        journalEntry: { update: txUpdate, create: txCreate },
        account: txAccount,
      })
    })

    await repo.voidJournalEntry('c1', 'je3', 'u1', 'Mistake')

    const createCalls: any[] = txCreate.mock.calls
    expect(createCalls).toHaveLength(1)
    const createdEntryNumber: string = createCalls[0][0].data.entryNumber
    expect(createdEntryNumber).toMatch(/^VOID-/)
    expect(createdEntryNumber).toContain('JE-200')
  })
})
