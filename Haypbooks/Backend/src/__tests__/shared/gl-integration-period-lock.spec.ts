import { BadRequestException } from '@nestjs/common'
import { createAndPostJE } from '../../shared/gl-integration'
import { assertPeriodOpen } from '../../shared/period-validation'

jest.mock('../../shared/period-validation', () => ({
  assertPeriodOpen: jest.fn(),
}))

describe('GL integration guardrails', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('rejects posting when the accounting period is closed or locked', async () => {
    ;(assertPeriodOpen as jest.Mock).mockRejectedValueOnce(new BadRequestException('Period closed'))

    const tx: any = {
      journalEntry: { findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
      account: { findUnique: jest.fn(), update: jest.fn() },
    }

    await expect(
      createAndPostJE(tx, {
        workspaceId: 'ws-1',
        companyId: 'company-1',
        date: new Date('2026-02-01'),
        description: 'closed period test',
        currency: 'PHP',
        lines: [{ accountId: 'acct-1', debit: 100, credit: 0 }, { accountId: 'acct-2', debit: 0, credit: 100 }],
      }),
    ).rejects.toThrow(BadRequestException)

    expect(assertPeriodOpen).toHaveBeenCalledWith(
      tx,
      { companyId: 'company-1', workspaceId: 'ws-1' },
      expect.any(Date),
    )
  })

  it('returns the existing journal entry when the same idempotencyKey is reused', async () => {
    ;(assertPeriodOpen as jest.Mock).mockResolvedValue(undefined)

    const existing = {
      id: 'je-existing',
      lines: [{ accountId: 'acct-1', debit: 100, credit: 0 }],
    }

    const tx: any = {
      journalEntry: {
        findFirst: jest.fn()
          .mockResolvedValueOnce(existing)
          .mockResolvedValueOnce(existing),
        create: jest.fn(),
        update: jest.fn(),
      },
      account: { findUnique: jest.fn(), update: jest.fn() },
    }

    const created = await createAndPostJE(tx, {
      workspaceId: 'ws-1',
      companyId: 'company-1',
      date: new Date('2026-02-10'),
      description: 'duplicate test',
      currency: 'PHP',
      idempotencyKey: 'dup-123',
      lines: [{ accountId: 'acct-1', debit: 100, credit: 0 }, { accountId: 'acct-2', debit: 0, credit: 100 }],
    })

    expect(created).toBe('je-existing')
    expect(tx.journalEntry.create).not.toHaveBeenCalled()
  })
})
