import { BadRequestException } from '@nestjs/common'
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

  it('matches transactions only when a candidate journal line exists in the date and amount window', async () => {
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
    prisma.bankAccount.findUnique.mockResolvedValue({ glAccountId: 'acct-1010' })
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
    prisma.bankAccount.findUnique.mockResolvedValue({ glAccountId: 'acct-1010' })
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
