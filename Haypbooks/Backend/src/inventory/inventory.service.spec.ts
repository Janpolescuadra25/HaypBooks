import { BadRequestException, NotFoundException } from '@nestjs/common'
import { InventoryService } from './inventory.service'

describe('InventoryService voidInventoryTransaction', () => {
  let service: InventoryService
  let mockPrisma: any
  let mockRepo: any
  let mockSubLedger: any
  let tx: any

  beforeEach(() => {
    jest.resetAllMocks()

    tx = {
      inventoryTransaction: {
        update: jest.fn(),
      },
      stockLevel: {
        findUnique: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
      inventoryCostLayer: {
        findFirst: jest.fn(),
        delete: jest.fn(),
      },
      auditLog: {
        create: jest.fn(),
      },
    }

    mockPrisma = {
      inventoryTransaction: {
        findUnique: jest.fn(),
      },
      company: {
        findUnique: jest.fn(),
      },
      workspaceUser: {
        findFirst: jest.fn(),
      },
      $transaction: jest.fn(async (fn: any) => fn(tx)),
    }

    mockRepo = {}
    mockSubLedger = {
      reverseInventoryTransactionGL: jest.fn(),
    }

    service = new InventoryService(mockRepo as any, mockPrisma as any, mockSubLedger as any)
    ;(service as any).assertAccess = jest.fn().mockResolvedValue(undefined)
    ;(service as any).getWorkspaceId = jest.fn().mockResolvedValue('ws-1')
  })

  it('successfully voids a POSTED inventory transaction, reverses GL, updates status, and creates an audit log', async () => {
    const now = new Date('2026-10-18T00:00:00.000Z')
    mockPrisma.inventoryTransaction.findUnique.mockResolvedValue({
      id: 'txn-1',
      companyId: 'company-1',
      postingStatus: 'POSTED',
      type: 'SHIPMENT',
      lines: [{ id: 'line-1', itemId: 'item-1', stockLocationId: 'loc-1', qty: '5' }],
    })
    tx.stockLevel.findUnique.mockResolvedValue({ id: 'stock-1', quantity: 10 })
    mockSubLedger.reverseInventoryTransactionGL.mockResolvedValue('je-reversal-1')
    tx.inventoryTransaction.update.mockResolvedValue({
      id: 'txn-1',
      companyId: 'company-1',
      postingStatus: 'VOIDED',
      deletedAt: now,
      lines: [{ id: 'line-1', itemId: 'item-1', stockLocationId: 'loc-1', qty: '5' }],
    })

    const result = await service.voidInventoryTransaction('user-1', 'company-1', 'txn-1', 'Bad inventory entry')

    expect((service as any).assertAccess).toHaveBeenCalledWith('user-1', 'company-1')
    expect(tx.stockLevel.update).toHaveBeenCalledWith({
      where: { id: 'stock-1' },
      data: { quantity: { increment: 5 } },
    })
    expect(mockSubLedger.reverseInventoryTransactionGL).toHaveBeenCalledWith(
      'company-1',
      'txn-1',
      'Bad inventory entry',
      tx,
    )
    expect(tx.inventoryTransaction.update).toHaveBeenCalledWith({
      where: { id: 'txn-1' },
      data: {
        postingStatus: 'VOIDED',
        deletedAt: expect.any(Date),
      },
      include: { lines: true },
    })
    expect(tx.auditLog.create).toHaveBeenCalledWith({
      data: {
        workspaceId: 'ws-1',
        companyId: 'company-1',
        userId: 'user-1',
        action: 'VOID_INVENTORY_TRANSACTION',
        tableName: 'InventoryTransaction',
        recordId: 'txn-1',
        changes: {
          postingStatus: 'VOIDED',
          reversingJournalEntryId: 'je-reversal-1',
          reason: 'Bad inventory entry',
          stockRestored: true,
        },
      },
    })
    expect(result).toEqual({
      id: 'txn-1',
      companyId: 'company-1',
      postingStatus: 'VOIDED',
      deletedAt: now,
      lines: [{ id: 'line-1', itemId: 'item-1', stockLocationId: 'loc-1', qty: '5' }],
    })
  })

  it('throws NotFoundException when the inventory transaction does not exist or belongs to a different company', async () => {
    mockPrisma.inventoryTransaction.findUnique.mockResolvedValue(null)

    await expect(service.voidInventoryTransaction('user-1', 'company-1', 'txn-missing', 'Nope')).rejects.toThrow(
      new NotFoundException('Inventory transaction not found'),
    )

    mockPrisma.inventoryTransaction.findUnique.mockResolvedValue({
      id: 'txn-2',
      companyId: 'company-2',
      postingStatus: 'POSTED',
      type: 'SHIPMENT',
      lines: [],
    })

    await expect(service.voidInventoryTransaction('user-1', 'company-1', 'txn-2', 'Wrong company')).rejects.toThrow(
      new NotFoundException('Inventory transaction not found'),
    )
  })

  it('throws BadRequestException when the inventory transaction is in DRAFT status', async () => {
    mockPrisma.inventoryTransaction.findUnique.mockResolvedValue({
      id: 'txn-3',
      companyId: 'company-1',
      postingStatus: 'DRAFT',
      type: 'SHIPMENT',
      lines: [],
    })

    await expect(service.voidInventoryTransaction('user-1', 'company-1', 'txn-3')).rejects.toThrow(
      new BadRequestException('Only POSTED inventory transactions can be voided (current: DRAFT)'),
    )
  })

  it('throws BadRequestException when the inventory transaction is already VOIDED', async () => {
    mockPrisma.inventoryTransaction.findUnique.mockResolvedValue({
      id: 'txn-4',
      companyId: 'company-1',
      postingStatus: 'VOIDED',
      type: 'SHIPMENT',
      lines: [],
    })

    await expect(service.voidInventoryTransaction('user-1', 'company-1', 'txn-4')).rejects.toThrow(
      new BadRequestException('Only POSTED inventory transactions can be voided (current: VOIDED)'),
    )
  })

  it('throws BadRequestException when the GL reversal fails', async () => {
    mockPrisma.inventoryTransaction.findUnique.mockResolvedValue({
      id: 'txn-5',
      companyId: 'company-1',
      postingStatus: 'POSTED',
      type: 'SHIPMENT',
      lines: [],
    })
    mockSubLedger.reverseInventoryTransactionGL.mockResolvedValue(null)

    await expect(service.voidInventoryTransaction('user-1', 'company-1', 'txn-5')).rejects.toThrow(
      new BadRequestException('Inventory GL reversal failed: original journal entry not found or accounting period is closed'),
    )
  })

  it('voids a RECEIPT transaction by decrementing stock and removing the unconsumed cost layer', async () => {
    mockPrisma.inventoryTransaction.findUnique.mockResolvedValue({
      id: 'txn-receipt',
      companyId: 'company-1',
      postingStatus: 'POSTED',
      type: 'RECEIPT',
      lines: [{ id: 'line-receipt', itemId: 'item-1', stockLocationId: 'loc-1', qty: '3' }],
    })
    tx.stockLevel.findUnique.mockResolvedValue({ id: 'stock-1', quantity: 10 })
    tx.inventoryCostLayer.findFirst.mockResolvedValue({ id: 'layer-1', quantity: 3, remainingQty: 3 })
    mockSubLedger.reverseInventoryTransactionGL.mockResolvedValue('je-reversal-2')
    tx.inventoryTransaction.update.mockResolvedValue({
      id: 'txn-receipt',
      companyId: 'company-1',
      postingStatus: 'VOIDED',
      deletedAt: new Date(),
      lines: [{ id: 'line-receipt', itemId: 'item-1', stockLocationId: 'loc-1', qty: '3' }],
    })

    await service.voidInventoryTransaction('user-1', 'company-1', 'txn-receipt', 'Receipt adjustment')

    expect(tx.stockLevel.update).toHaveBeenCalledWith({
      where: { id: 'stock-1' },
      data: { quantity: { increment: -3 } },
    })
    expect(tx.inventoryCostLayer.delete).toHaveBeenCalledWith({
      where: { id: 'layer-1' },
    })
  })

  it('throws BadRequestException when voiding a receipt would create negative stock', async () => {
    mockPrisma.inventoryTransaction.findUnique.mockResolvedValue({
      id: 'txn-negative',
      companyId: 'company-1',
      postingStatus: 'POSTED',
      type: 'RECEIPT',
      lines: [{ id: 'line-negative', itemId: 'item-1', stockLocationId: 'loc-1', qty: '5' }],
    })
    tx.stockLevel.findUnique.mockResolvedValue({ id: 'stock-1', quantity: 2 })
    tx.inventoryCostLayer.findFirst.mockResolvedValue({ id: 'layer-1', quantity: 5, remainingQty: 5 })

    await expect(service.voidInventoryTransaction('user-1', 'company-1', 'txn-negative')).rejects.toThrow(
      new BadRequestException('Cannot void inventory transaction: item item-1 at location loc-1 would result in negative stock balance (-3). Current stock is 2.'),
    )
    expect(tx.stockLevel.update).not.toHaveBeenCalled()
    expect(tx.inventoryCostLayer.delete).not.toHaveBeenCalled()
  })

  it('throws BadRequestException when the receipt cost layer has already been consumed', async () => {
    mockPrisma.inventoryTransaction.findUnique.mockResolvedValue({
      id: 'txn-consumed',
      companyId: 'company-1',
      postingStatus: 'POSTED',
      type: 'RECEIPT',
      lines: [{ id: 'line-consumed', itemId: 'item-1', stockLocationId: 'loc-1', qty: '3' }],
    })
    tx.stockLevel.findUnique.mockResolvedValue({ id: 'stock-1', quantity: 10 })
    tx.inventoryCostLayer.findFirst.mockResolvedValue({ id: 'layer-1', quantity: 3, remainingQty: 1 })

    await expect(service.voidInventoryTransaction('user-1', 'company-1', 'txn-consumed')).rejects.toThrow(
      new BadRequestException('Cannot void receipt: inventory cost layer for item item-1 has already been partially or fully consumed (remaining: 1 of 3).'),
    )
    expect(tx.stockLevel.update).not.toHaveBeenCalled()
  })

  it('throws BadRequestException when the inventory transaction type is unsupported for voiding', async () => {
    mockPrisma.inventoryTransaction.findUnique.mockResolvedValue({
      id: 'txn-transfer',
      companyId: 'company-1',
      postingStatus: 'POSTED',
      type: 'TRANSFER',
      lines: [{ id: 'line-transfer', itemId: 'item-1', stockLocationId: 'loc-1', qty: '2' }],
    })

    await expect(service.voidInventoryTransaction('user-1', 'company-1', 'txn-transfer')).rejects.toThrow(
      new BadRequestException('Voiding TRANSFER inventory transactions is not supported in this phase. Only RECEIPT and SHIPMENT transactions may be voided.'),
    )
  })

  it('creates an audit log with the repository-scoped inventory transaction metadata', async () => {
    mockPrisma.inventoryTransaction.findUnique.mockResolvedValue({
      id: 'txn-audit',
      companyId: 'company-1',
      postingStatus: 'POSTED',
      type: 'SHIPMENT',
      lines: [{ id: 'line-audit', itemId: 'item-1', stockLocationId: 'loc-1', qty: '4' }],
    })
    tx.stockLevel.findUnique.mockResolvedValue({ id: 'stock-1', quantity: 10 })
    mockSubLedger.reverseInventoryTransactionGL.mockResolvedValue('je-reversal-audit')
    tx.inventoryTransaction.update.mockResolvedValue({
      id: 'txn-audit',
      companyId: 'company-1',
      postingStatus: 'VOIDED',
      deletedAt: new Date(),
      lines: [{ id: 'line-audit', itemId: 'item-1', stockLocationId: 'loc-1', qty: '4' }],
    })

    await service.voidInventoryTransaction('user-1', 'company-1', 'txn-audit', 'Audit void')

    expect(tx.auditLog.create).toHaveBeenCalledWith({
      data: {
        workspaceId: 'ws-1',
        companyId: 'company-1',
        userId: 'user-1',
        action: 'VOID_INVENTORY_TRANSACTION',
        tableName: 'InventoryTransaction',
        recordId: 'txn-audit',
        changes: {
          postingStatus: 'VOIDED',
          reversingJournalEntryId: 'je-reversal-audit',
          reason: 'Audit void',
          stockRestored: true,
        },
      },
    })
  })
})
