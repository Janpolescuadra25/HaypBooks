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

  it('returns the existing journal entry when the same idempotencyKey is reused with the identical payload', async () => {
    ;(assertPeriodOpen as jest.Mock).mockResolvedValue(undefined)

    const existing = {
      id: 'je-existing',
      companyId: 'company-1',
      lines: [
        { accountId: 'acct-1', debit: 100, credit: 0 },
        { accountId: 'acct-2', debit: 0, credit: 100 },
      ],
    }

    const tx: any = {
      journalEntry: {
        findUnique: jest.fn().mockResolvedValue(existing),
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
      lines: [
        { accountId: 'acct-1', debit: 100, credit: 0 },
        { accountId: 'acct-2', debit: 0, credit: 100 },
      ],
    })

    expect(created).toBe('je-existing')
    expect(tx.journalEntry.create).not.toHaveBeenCalled()
  })

  it('rejects a reused idempotencyKey when a retry changes the transaction payload', async () => {
    ;(assertPeriodOpen as jest.Mock).mockResolvedValue(undefined)

    const existing = {
      id: 'je-existing',
      companyId: 'company-1',
      lines: [
        { accountId: 'acct-1', debit: 100, credit: 0 },
        { accountId: 'acct-2', debit: 0, credit: 100 },
      ],
    }

    const tx: any = {
      journalEntry: {
        findUnique: jest.fn().mockResolvedValue(existing),
        create: jest.fn(),
        update: jest.fn(),
      },
      account: { findUnique: jest.fn(), update: jest.fn() },
    }

    await expect(
      createAndPostJE(tx, {
        workspaceId: 'ws-1',
        companyId: 'company-1',
        date: new Date('2026-02-10'),
        description: 'duplicate payload mismatch',
        currency: 'PHP',
        idempotencyKey: 'dup-124',
        lines: [
          { accountId: 'acct-1', debit: 150, credit: 0 },
          { accountId: 'acct-2', debit: 0, credit: 100 },
        ],
      }),
    ).rejects.toThrow("Idempotency key 'dup-124' reused with mismatched transaction payload.")
  })

  it('rejects an idempotencyKey collision across company boundaries', async () => {
    ;(assertPeriodOpen as jest.Mock).mockResolvedValue(undefined)

    const tx: any = {
      journalEntry: {
        findUnique: jest.fn().mockResolvedValue({ id: 'je-other', companyId: 'company-2' }),
        create: jest.fn(),
        update: jest.fn(),
      },
      account: { findUnique: jest.fn(), update: jest.fn() },
    }

    await expect(
      createAndPostJE(tx, {
        workspaceId: 'ws-1',
        companyId: 'company-1',
        date: new Date('2026-02-10'),
        description: 'cross-company collision',
        currency: 'PHP',
        idempotencyKey: 'dup-456',
        lines: [{ accountId: 'acct-1', debit: 100, credit: 0 }, { accountId: 'acct-2', debit: 0, credit: 100 }],
      }),
    ).rejects.toThrow('Idempotency key collision across company boundaries')
  })
})
