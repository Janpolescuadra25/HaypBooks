import { BadRequestException } from '@nestjs/common'
import { SubLedgerService } from './sub-ledger.service'

jest.mock('./gl-integration', () => ({
  createAndPostJE: jest.fn(),
  createReversingJE: jest.fn(),
  resolveAccount: jest.fn(),
  SYSTEM_ACCOUNTS: {
    INVENTORY_ASSET: { code: '1400', name: 'Inventory Asset', typeId: 1 },
    COST_OF_GOODS_SOLD: { code: '5000', name: 'Cost of Goods Sold', typeId: 2 },
    INVENTORY_CLEARING: { code: '2050', name: 'Inventory Clearing', typeId: 4 },
  },
}))

const { createAndPostJE, createReversingJE, resolveAccount } = jest.requireMock('./gl-integration') as {
  createAndPostJE: jest.Mock
  createReversingJE: jest.Mock
  resolveAccount: jest.Mock
}

describe('SubLedgerService inventory GL posting', () => {
  let prisma: any
  let service: SubLedgerService

  beforeEach(() => {
    jest.clearAllMocks()
    prisma = {
      auditLog: { create: jest.fn().mockResolvedValue({ id: 'audit-1' }) },
      journalEntry: {
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      company: { findUnique: jest.fn().mockResolvedValue({ workspaceId: 'ws-1' }) },
    }
    service = new SubLedgerService(prisma)
    ;(service as any).assertPeriodOpen = jest.fn().mockResolvedValue(undefined)
  })

  it('posts a receipt journal entry and records an audit log', async () => {
    resolveAccount.mockImplementation(async (_tx: any, _companyId: string, def: any) => ({ id: def.code === '1400' ? 'acc-inv' : def.code === '5000' ? 'acc-cogs' : 'acc-clear', typeId: 1, normalSide: 'DEBIT' }))
    createAndPostJE.mockResolvedValue('je-123')

    const result = await service.postInventoryTransactionToGL('company-1', {
      id: 'txn-1',
      date: new Date('2026-06-01'),
      type: 'RECEIPT',
      lines: [{ qty: 5, unitCost: 10 }],
    }, prisma)

    expect(result).toBe('je-123')
    expect(createAndPostJE).toHaveBeenCalledWith(
      prisma,
      expect.objectContaining({
        companyId: 'company-1',
        workspaceId: 'ws-1',
        description: expect.stringContaining('Inventory RECEIPT'),
        lines: expect.arrayContaining([
          expect.objectContaining({ accountId: 'acc-inv', debit: 50, credit: 0 }),
          expect.objectContaining({ accountId: 'acc-clear', debit: 0, credit: 50 }),
        ]),
      }),
    )
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: 'POST_TO_GL',
          tableName: 'InventoryTransaction',
          recordId: 'txn-1',
        }),
      }),
    )
  })

  it('rejects closed periods before posting inventory activity', async () => {
    ;(service as any).assertPeriodOpen = jest.fn().mockRejectedValueOnce(new BadRequestException('Period closed'))

    await expect(
      service.postInventoryTransactionToGL('company-1', {
        id: 'txn-2',
        date: new Date('2026-06-02'),
        type: 'SHIPMENT',
        lines: [{ qty: 2, unitCost: 15 }],
      }, prisma),
    ).rejects.toThrow(BadRequestException)
  })

  it('reverses an existing inventory journal entry', async () => {
    prisma.journalEntry.findFirst.mockResolvedValue({
      id: 'je-456',
      companyId: 'company-1',
      workspaceId: 'ws-1',
      description: 'Inventory receipt txn-3',
      date: new Date('2026-06-03'),
      lines: [
        { accountId: 'acc-inv', debit: 100, credit: 0, description: 'Inventory receipt' },
        { accountId: 'acc-clear', debit: 0, credit: 100, description: 'Inventory clearing' },
      ],
    })
    createReversingJE.mockResolvedValue('je-789')

    const result = await service.reverseInventoryTransactionGL('company-1', 'txn-3', 'duplicate reversal', prisma)

    expect(result).toBe('je-789')
    expect(createReversingJE).toHaveBeenCalledWith(
      prisma,
      'company-1',
      'je-456',
      'duplicate reversal',
      undefined,
    )
  })
})
