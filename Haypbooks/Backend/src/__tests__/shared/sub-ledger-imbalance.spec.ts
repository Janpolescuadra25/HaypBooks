import { BadRequestException } from '@nestjs/common'
import { SubLedgerService } from '../../../src/shared/sub-ledger.service'

describe('SubLedgerService.createPostedJE imbalance handling', () => {
  let service: SubLedgerService

  beforeEach(() => {
    service = new SubLedgerService({} as any)
  })

  it('throws BadRequestException when the journal entry is unbalanced beyond tolerance', async () => {
    const tx = {
      journalEntry: { create: jest.fn() },
      account: { findUnique: jest.fn(), update: jest.fn() },
    }

    const data = {
      workspaceId: 'ws-1',
      companyId: 'company-1',
      date: new Date('2026-08-27'),
      description: 'Test JE',
      currency: 'PHP',
      entryNumber: 'JE-100',
      lines: [
        { accountId: 'a1', debit: 100.0, credit: 0, memo: 'Debit' },
        { accountId: 'a2', debit: 0, credit: 98.0, memo: 'Credit' },
      ],
    }

    await expect((service as any).createPostedJE(tx, data)).rejects.toThrow(BadRequestException)
    expect(tx.journalEntry.create).not.toHaveBeenCalled()
  })

  it('creates a journal entry when debit and credit are exactly balanced', async () => {
    const tx = {
      journalEntry: { create: jest.fn().mockResolvedValue({ id: 'je-1' }) },
      account: {
        findUnique: jest.fn().mockResolvedValue({ id: 'a1', normalSide: 'DEBIT' }),
        update: jest.fn().mockResolvedValue({ id: 'a1' }),
      },
    }

    const data = {
      workspaceId: 'ws-1',
      companyId: 'company-1',
      date: new Date('2026-08-27'),
      description: 'Balanced JE',
      currency: 'PHP',
      entryNumber: 'JE-101',
      lines: [
        { accountId: 'a1', debit: 50.0, credit: 0, memo: 'Debit' },
        { accountId: 'a2', debit: 0, credit: 50.0, memo: 'Credit' },
      ],
    }

    const result = await (service as any).createPostedJE(tx, data)

    expect(result).toEqual({ id: 'je-1' })
    expect(tx.journalEntry.create).toHaveBeenCalled()
    expect(tx.account.update).toHaveBeenCalledTimes(2)
  })

  it('creates a journal entry when the imbalance is within tolerance', async () => {
    const tx = {
      journalEntry: { create: jest.fn().mockResolvedValue({ id: 'je-2' }) },
      account: {
        findUnique: jest.fn().mockResolvedValue({ id: 'a1', normalSide: 'DEBIT' }),
        update: jest.fn().mockResolvedValue({ id: 'a1' }),
      },
    }

    const data = {
      workspaceId: 'ws-1',
      companyId: 'company-1',
      date: new Date('2026-08-27'),
      description: 'Tolerance JE',
      currency: 'PHP',
      entryNumber: 'JE-102',
      lines: [
        { accountId: 'a1', debit: 100.0, credit: 0, memo: 'Debit' },
        { accountId: 'a2', debit: 0, credit: 99.997, memo: 'Credit' },
      ],
    }

    const result = await (service as any).createPostedJE(tx, data)

    expect(result).toEqual({ id: 'je-2' })
    expect(tx.journalEntry.create).toHaveBeenCalled()
    expect(tx.account.update).toHaveBeenCalledTimes(2)
  })
})
