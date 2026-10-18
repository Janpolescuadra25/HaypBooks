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
      lines: [{ id: 'line-1', itemId: 'item-1' }],
    })
    mockSubLedger.reverseInventoryTransactionGL.mockResolvedValue('je-reversal-1')
    tx.inventoryTransaction.update.mockResolvedValue({
      id: 'txn-1',
      companyId: 'company-1',
      postingStatus: 'VOIDED',
      deletedAt: now,
      lines: [{ id: 'line-1', itemId: 'item-1' }],
    })

    const result = await service.voidInventoryTransaction('user-1', 'company-1', 'txn-1', 'Bad inventory entry')

    expect((service as any).assertAccess).toHaveBeenCalledWith('user-1', 'company-1')
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
        },
      },
    })
    expect(result).toEqual({
      id: 'txn-1',
      companyId: 'company-1',
      postingStatus: 'VOIDED',
      deletedAt: now,
      lines: [{ id: 'line-1', itemId: 'item-1' }],
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
      lines: [],
    })
    mockSubLedger.reverseInventoryTransactionGL.mockResolvedValue(null)

    await expect(service.voidInventoryTransaction('user-1', 'company-1', 'txn-5')).rejects.toThrow(
      new BadRequestException('Inventory GL reversal failed: original journal entry not found or accounting period is closed'),
    )
  })
})
