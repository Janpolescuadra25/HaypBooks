import { InventoryRepository } from './inventory.repository'

describe('InventoryRepository state transitions', () => {
  let prisma: any
  let subLedger: any
  let repo: InventoryRepository

  beforeEach(() => {
    prisma = {
      $transaction: jest.fn(async (fn: any) => fn(prisma)),
      inventoryTransaction: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      stockLevel: {
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
      auditLog: { create: jest.fn() },
    }
    subLedger = {
      postInventoryTransactionToGL: jest.fn().mockResolvedValue('je-posted-1'),
    }
    repo = new InventoryRepository(prisma, subLedger)
  })

  it('keeps DRAFT inventory transactions from mutating stock levels', async () => {
    prisma.inventoryTransaction.create.mockResolvedValue({ id: 'txn-draft', postingStatus: 'DRAFT' })

    await repo.createInventoryTransaction('ws-1', 'company-1', {
      type: 'RECEIPT',
      postingStatus: 'DRAFT',
      lines: [{ itemId: 'item-1', qty: 4, stockLocationId: 'loc-1' }],
    })

    expect(prisma.inventoryTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ postingStatus: 'DRAFT' }),
      }),
    )
    expect(prisma.stockLevel.findUnique).not.toHaveBeenCalled()
    expect(subLedger.postInventoryTransactionToGL).not.toHaveBeenCalled()
  })

  it('updates stock levels when a transaction is posted', async () => {
    prisma.inventoryTransaction.create.mockResolvedValue({ id: 'txn-posted', postingStatus: 'POSTED' })
    prisma.stockLevel.findUnique.mockResolvedValue({ id: 'stock-1', quantity: 5 })

    await repo.createInventoryTransaction('ws-1', 'company-1', {
      type: 'SHIPMENT',
      postingStatus: 'POSTED',
      lines: [{ itemId: 'item-1', qty: 2, stockLocationId: 'loc-1' }],
    })

    expect(prisma.stockLevel.update).toHaveBeenCalledWith({
      where: { id: 'stock-1' },
      data: { quantity: { increment: -2 } },
    })
  })

  it('synchronizes GL posting, journalEntryId, and POST_TO_GL audit log when created directly as POSTED', async () => {
    const createdDate = new Date('2026-02-01T00:00:00.000Z')
    prisma.inventoryTransaction.create.mockResolvedValue({
      id: 'txn-direct-posted',
      postingStatus: 'POSTED',
      type: 'RECEIPT',
      createdAt: createdDate,
      lines: [{ itemId: 'item-1', qty: 5, unitCost: 20, stockLocationId: 'loc-1' }],
    })
    prisma.stockLevel.findUnique.mockResolvedValue({ id: 'stock-1', quantity: 10 })
    prisma.inventoryTransaction.update.mockResolvedValue({
      id: 'txn-direct-posted',
      postingStatus: 'POSTED',
      journalEntryId: 'je-posted-1',
      lines: [{ itemId: 'item-1', qty: 5, unitCost: 20, stockLocationId: 'loc-1' }],
    })

    const result = await repo.createInventoryTransaction(
      'ws-1',
      'company-1',
      {
        type: 'RECEIPT',
        postingStatus: 'POSTED',
        userId: 'user-123',
        lines: [{ itemId: 'item-1', qty: 5, unitCost: 20, stockLocationId: 'loc-1' }],
      },
      'user-123',
    )

    expect(subLedger.postInventoryTransactionToGL).toHaveBeenCalledWith(
      'company-1',
      {
        id: 'txn-direct-posted',
        date: createdDate,
        type: 'RECEIPT',
        lines: [{ productId: 'item-1', qty: 5, unitCost: 20 }],
      },
      prisma,
    )
    expect(prisma.inventoryTransaction.update).toHaveBeenCalledWith({
      where: { id: 'txn-direct-posted' },
      data: { journalEntryId: 'je-posted-1' },
      include: { lines: true },
    })
    expect(prisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        workspaceId: 'ws-1',
        companyId: 'company-1',
        userId: 'user-123',
        action: 'POST_TO_GL',
        tableName: 'InventoryTransaction',
        recordId: 'txn-direct-posted',
        changes: { journalEntryId: 'je-posted-1', postingStatus: 'POSTED' },
      },
    })
    expect(result.journalEntryId).toBe('je-posted-1')
  })

  it('supports instantiating InventoryRepository with undefined optional SubLedgerService', async () => {
    const repoWithoutSubLedger = new InventoryRepository(prisma, undefined)
    prisma.inventoryTransaction.create.mockResolvedValue({ id: 'txn-opt', postingStatus: 'POSTED' })
    prisma.stockLevel.findUnique.mockResolvedValue({ id: 'stock-opt', quantity: 7 })

    const res = await repoWithoutSubLedger.createInventoryTransaction('ws-1', 'company-1', {
      type: 'RECEIPT',
      postingStatus: 'POSTED',
      lines: [{ itemId: 'item-2', qty: 1, stockLocationId: 'loc-2' }],
    })

    expect(res.id).toBe('txn-opt')
    expect(prisma.stockLevel.update).toHaveBeenCalledWith({
      where: { id: 'stock-opt' },
      data: { quantity: { increment: 1 } },
    })
  })

  it('rejects duplicate posting attempts', async () => {
    prisma.inventoryTransaction.findUnique.mockResolvedValue({ id: 'txn-1', postingStatus: 'POSTED' })

    await expect(repo.postInventoryTransaction('company-1', 'txn-1')).rejects.toThrow('already POSTED')
  })

  it('moves a draft transaction to POSTED and mutates stock once', async () => {
    prisma.inventoryTransaction.findUnique.mockResolvedValue({
      id: 'txn-2',
      companyId: 'company-1',
      workspaceId: 'ws-1',
      postingStatus: 'DRAFT',
      lines: [{ itemId: 'item-2', qty: 3, stockLocationId: 'loc-2' }],
    })
    prisma.stockLevel.findUnique.mockResolvedValue({ id: 'stock-2', quantity: 10 })

    await repo.postInventoryTransaction('company-1', 'txn-2')

    expect(prisma.inventoryTransaction.update).toHaveBeenCalledWith({
      where: { id: 'txn-2' },
      data: { postingStatus: 'POSTED', journalEntryId: undefined },
    })
    expect(prisma.stockLevel.update).toHaveBeenCalledWith({
      where: { id: 'stock-2' },
      data: { quantity: { increment: 3 } },
    })
  })
})
