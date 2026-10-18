import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common'
import { BankingRepository } from './banking.repository'
import { BankingService } from './banking.service'

describe('Banking E6 auto-match validation', () => {
  let prisma: any

  beforeEach(() => {
    prisma = {
      bankReconciliationLine: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      company: { findUnique: jest.fn() },
      workspaceUser: { findFirst: jest.fn() },
      bankTransaction: { findMany: jest.fn() },
      bankAccount: { findUnique: jest.fn() },
      journalEntryLine: { findFirst: jest.fn(), findMany: jest.fn() },
    }
  })

  it('throws BadRequestException when matchTransactionToJournalLine is called without a valid journalEntryLineId', async () => {
    const repo = new BankingRepository(prisma)

    await expect(
      repo.matchTransactionToJournalLine('ws-1', 'recon-1', {
        bankTransactionId: 'txn-1',
      }),
    ).rejects.toThrow(BadRequestException)

    await expect(
      repo.matchTransactionToJournalLine('ws-1', 'recon-1', {
        bankTransactionId: 'txn-1',
        journalEntryLineId: '   ',
      }),
    ).rejects.toThrow('Cannot mark a bank transaction as matched without a valid journalEntryLineId')
  })

  it('rejects reconciliation when the bank account has no GL account configured', async () => {
    const repo = {
      matchTransactionToJournalLine: jest.fn(),
      findReconciliationById: jest.fn().mockResolvedValue({
        id: 'recon-1',
        status: 'OPEN',
        bankAccountId: 'ba-1',
        statementDate: new Date('2026-03-31'),
        BankReconciliationLine: [],
      }),
    }
    prisma.company.findUnique.mockResolvedValue({ workspaceId: 'ws-1' })
    prisma.workspaceUser.findFirst.mockResolvedValue({ id: 'wu-1' })
    prisma.bankAccount.findUnique.mockResolvedValue({ id: 'ba-1', workspaceId: 'ws-1', glAccountId: null })

    const service = new BankingService(
      repo as any,
      prisma,
      {} as any,
      {} as any,
    )

    const promise = service.autoMatchReconciliation('user-1', 'company-1', 'recon-1')
    await expect(promise).rejects.toThrow(BadRequestException)
    await expect(promise).rejects.toThrow('Bank account does not have an associated GL account configured for reconciliation')
  })

  it('rejects reconciliation when the bank account belongs to another workspace', async () => {
    const repo = {
      matchTransactionToJournalLine: jest.fn(),
      findReconciliationById: jest.fn().mockResolvedValue({
        id: 'recon-1',
        status: 'OPEN',
        bankAccountId: 'ba-1',
        statementDate: new Date('2026-03-31'),
        BankReconciliationLine: [],
      }),
    }
    prisma.company.findUnique.mockResolvedValue({ workspaceId: 'ws-1' })
    prisma.workspaceUser.findFirst.mockResolvedValue({ id: 'wu-1' })
    prisma.bankAccount.findUnique.mockResolvedValue({ id: 'ba-1', workspaceId: 'ws-2', glAccountId: 'acct-1010' })

    const service = new BankingService(
      repo as any,
      prisma,
      {} as any,
      {} as any,
    )

    await expect(service.autoMatchReconciliation('user-1', 'company-1', 'recon-1')).rejects.toThrow(ForbiddenException)
  })

  it('matches transactions only when a candidate journal line exists in the company, GL account, and posted-status window', async () => {
    const repo = {
      matchTransactionToJournalLine: jest.fn(),
      findReconciliationById: jest.fn().mockResolvedValue({
        id: 'recon-1',
        status: 'OPEN',
        bankAccountId: 'ba-1',
        statementDate: new Date('2026-03-31'),
        BankReconciliationLine: [],
      }),
    }
    prisma.company.findUnique.mockResolvedValue({ workspaceId: 'ws-1' })
    prisma.workspaceUser.findFirst.mockResolvedValue({ id: 'wu-1' })
    prisma.bankTransaction.findMany.mockResolvedValue([
      { id: 'txn-1', amount: 125, date: new Date('2026-03-30') },
      { id: 'txn-2', amount: 999, date: new Date('2026-03-28') },
    ])
    prisma.bankAccount.findUnique.mockResolvedValue({ id: 'ba-1', workspaceId: 'ws-1', glAccountId: 'acct-1010' })
    prisma.journalEntryLine.findFirst
      .mockResolvedValueOnce({ id: 'je-line-1' })
      .mockResolvedValueOnce(null)

    const service = new BankingService(
      repo as any,
      prisma,
      {} as any,
      {} as any,
    )

    const result = await service.autoMatchReconciliation('user-1', 'company-1', 'recon-1')

    expect(result.matched).toBe(1)
    expect(repo.matchTransactionToJournalLine).toHaveBeenCalledTimes(1)
    expect(repo.matchTransactionToJournalLine).toHaveBeenCalledWith('ws-1', 'recon-1', {
      bankTransactionId: 'txn-1',
      journalEntryLineId: 'je-line-1',
      matchType: 'AUTO',
    })
    expect(prisma.journalEntryLine.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        companyId: 'company-1',
        accountId: 'acct-1010',
        journal: expect.objectContaining({
          companyId: 'company-1',
          postingStatus: 'POSTED',
        }),
      }),
    }))
  })

  it('throws NotFoundException when the bank account is missing in the workspace during import', async () => {
    const mockRepo = {
      findBankAccountById: jest.fn().mockResolvedValue(null),
      importTransactions: jest.fn(),
    }
    const service = new BankingService(mockRepo as any, prisma, {} as any, {} as any)
    jest.spyOn(service as any, 'getWorkspaceId').mockResolvedValue('ws-123')
    jest.spyOn(service as any, 'assertAccess').mockResolvedValue(undefined)

    await expect(
      service.importTransactions('user-1', 'comp-1', 'acc-999', []),
    ).rejects.toThrow(NotFoundException)
  })

  it('throws BadRequestException when an imported transaction date is invalid', async () => {
    const mockRepo = {
      findBankAccountById: jest.fn().mockResolvedValue({ id: 'acc-1' }),
      importTransactions: jest.fn(),
    }
    const service = new BankingService(mockRepo as any, prisma, {} as any, {} as any)
    jest.spyOn(service as any, 'getWorkspaceId').mockResolvedValue('ws-123')
    jest.spyOn(service as any, 'assertAccess').mockResolvedValue(undefined)

    await expect(
      service.importTransactions('user-1', 'comp-1', 'acc-1', [
        { date: 'not-a-valid-date', description: 'Test', amount: 100 },
      ]),
    ).rejects.toThrow(BadRequestException)
  })

  it('filters zero-amount transactions, tracks skipped, and preserves backward-compatible import payloads', async () => {
    const mockRepo = {
      findBankAccountById: jest.fn().mockResolvedValue({ id: 'acc-1' }),
      importTransactions: jest.fn().mockResolvedValue({
        count: 1,
        transactions: [{ id: 'tx-1', amount: 150.5 }],
      }),
    }
    const service = new BankingService(mockRepo as any, prisma, {} as any, {} as any)
    jest.spyOn(service as any, 'getWorkspaceId').mockResolvedValue('ws-123')
    jest.spyOn(service as any, 'assertAccess').mockResolvedValue(undefined)

    const payload = [
      { date: '2026-03-31T00:00:00.000Z', description: 'Zero tx', amount: 0 },
      { date: '2026-03-31T00:00:00.000Z', description: 'Valid tx', amount: 150.5 },
    ]

    const result = await service.importTransactions('user-1', 'comp-1', 'acc-1', payload)

    expect(result).toEqual({
      count: 1,
      imported: 1,
      skipped: 1,
      total: 2,
      transactions: [{ id: 'tx-1', amount: 150.5 }],
    })
    expect(mockRepo.importTransactions).toHaveBeenCalledWith('ws-123', 'acc-1', [
      {
        date: new Date('2026-03-31T00:00:00.000Z'),
        description: 'Valid tx',
        amount: 150.5,
      },
    ])
  })

  it('allows a manual match when a valid journalEntryLineId is provided', async () => {
    const repo = new BankingRepository(prisma)
    prisma.bankReconciliationLine.findFirst.mockResolvedValue(null)
    prisma.bankReconciliationLine.create.mockResolvedValue({
      id: 'recon-line-1',
      bankTransactionId: 'txn-1',
      journalEntryLineId: 'je-line-valid',
      matched: true,
      matchType: 'MANUAL',
    })

    const result = await repo.matchTransactionToJournalLine('ws-1', 'recon-1', {
      bankTransactionId: 'txn-1',
      journalEntryLineId: 'je-line-valid',
      matchType: 'MANUAL',
    })

    expect(result.journalEntryLineId).toBe('je-line-valid')
    expect(prisma.bankReconciliationLine.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          bankTransactionId: 'txn-1',
          journalEntryLineId: 'je-line-valid',
          matched: true,
          matchType: 'MANUAL',
        }),
      }),
    )
  })

  it('prevents matching multiple bank transactions to the same journalEntryLineId during auto-match', async () => {
    const repo = {
      matchTransactionToJournalLine: jest.fn(),
      findReconciliationById: jest.fn().mockResolvedValue({
        id: 'recon-1',
        status: 'OPEN',
        bankAccountId: 'ba-1',
        statementDate: new Date('2026-03-31'),
        BankReconciliationLine: [],
      }),
    }
    prisma.company.findUnique.mockResolvedValue({ workspaceId: 'ws-1' })
    prisma.workspaceUser.findFirst.mockResolvedValue({ id: 'wu-1' })
    prisma.bankTransaction.findMany.mockResolvedValue([
      { id: 'txn-1', amount: 150, date: new Date('2026-03-30T00:00:00.000Z') },
      { id: 'txn-2', amount: 150, date: new Date('2026-03-30T00:00:00.000Z') },
    ])
    prisma.bankAccount.findUnique.mockResolvedValue({ id: 'ba-1', workspaceId: 'ws-1', glAccountId: 'acct-1010' })
    prisma.journalEntryLine.findFirst
      .mockResolvedValueOnce({ id: 'jel-1' })
      .mockResolvedValueOnce(null)

    const service = new BankingService(
      repo as any,
      prisma,
      {} as any,
      {} as any,
    )

    const result = await service.autoMatchReconciliation('user-1', 'company-1', 'recon-1')

    expect(result.matched).toBe(1)
    expect(prisma.journalEntryLine.findFirst).toHaveBeenCalledTimes(2)
    expect(prisma.journalEntryLine.findFirst.mock.calls[1][0].where).toEqual(
      expect.objectContaining({
        id: { notIn: ['jel-1'] },
      }),
    )
  })
})
