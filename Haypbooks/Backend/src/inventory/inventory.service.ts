import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { JournalService } from '../accounting/journal.service'
import { assertCompanyBelongsToTenant } from '../common/company-utils'

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService, private readonly journal: JournalService) {}

  async createItem(tenantId: string, payload: any) {
    const workspaceId = tenantId

    if (!payload.name) throw new BadRequestException('name is required')
    return this.prisma.item.create({ data: { workspaceId, sku: payload.sku, name: payload.name, type: payload.type || 'INVENTORY' } as any })
  }

  async getItem(id: string) {
    const item = await this.prisma.item.findUnique({ where: { id } })
    if (!item) throw new NotFoundException('Item not found')
    return item
  }

  async listItems(tenantId: string, filter?: any) {
    const workspaceId = tenantId

    return this.prisma.item.findMany({ where: { workspaceId, ...(filter || {}) } })
  }

  async createStockLocation(tenantId: string, payload: any) {
    const workspaceId = tenantId

    if (!payload.name) throw new BadRequestException('name is required')
    await assertCompanyBelongsToTenant(this.prisma, payload.companyId, tenantId)
    return this.prisma.stockLocation.create({ data: { workspaceId, companyId: payload.companyId || null, name: payload.name, description: payload.description || null, isDefault: !!payload.isDefault } as any })
  }

  async getStockLevel(tenantId: string, itemId: string, stockLocationId: string) {
    const workspaceId = tenantId

    return this.prisma.stockLevel.findUnique({ where: { companyId_itemId_stockLocationId: { workspaceId, itemId, stockLocationId } } } as any)
  }

  async ensureStockLevel(tx, workspaceId: string, itemId: string, stockLocationId: string, companyId?: string | null) {
    // returns the stockLevel record, creating it if missing
    let sl = await tx.stockLevel.findUnique({ where: { companyId_itemId_stockLocationId: { workspaceId, itemId, stockLocationId } } } as any)
    if (!sl) {
    if (companyId) await assertCompanyBelongsToTenant(this.prisma, companyId, workspaceId)
      sl = await tx.stockLevel.create({ data: { workspaceId, companyId: companyId || null, itemId, stockLocationId, quantity: 0, reserved: 0 } as any })
    }
    return sl
  }

  async receiveStock(tenantId: string, payload: any) {
    const workspaceId = tenantId
    // payload: { transactionNumber?, lines: [ { itemId, stockLocationId, qty, unitCost } ], companyId }
    if (!payload.lines || payload.lines.length === 0) throw new BadRequestException('lines required')
    // Debug: log companyId for failing tests where company lookup unexpectedly fails
    // Remove after troubleshooting
    if (payload.companyId) console.debug('receiveStock companyId:', payload.companyId)
    await assertCompanyBelongsToTenant(this.prisma, payload.companyId, tenantId)
    return this.prisma.$transaction(async (tx) => {
      const txRecord = await tx.inventoryTransaction.create({ data: { workspaceId, companyId: payload.companyId || null, transactionNumber: payload.transactionNumber || null, type: 'RECEIPT', reference: payload.reference || null } as any })
      for (const l of payload.lines) {
        const itemId = l.itemId
        const stockLocationId = l.stockLocationId
        const qty = Number(l.qty)
        if (!itemId || !stockLocationId || qty <= 0) throw new BadRequestException('invalid line')

        const txLine = await tx.inventoryTransactionLine.create({ data: { workspaceId, companyId: payload.companyId || null, transactionId: txRecord.id, itemId, stockLocationId, qty, unitCost: l.unitCost || null, lineType: 'RECEIPT_LINE' } as any })

        const sl = await this.ensureStockLevel(tx, tenantId, itemId, stockLocationId, payload.companyId || null)
        // create a cost layer for the received qty
        await tx.inventoryCostLayer.create({ data: { workspaceId, companyId: payload.companyId || null, itemId, inventoryTxLineId: txLine.id, quantity: qty, remainingQty: qty, unitCost: l.unitCost || 0 } as any })
        await tx.stockLevel.update({ where: { id: sl.id }, data: { quantity: { increment: qty } } as any })
      }
      // Create journal entries per item aggregated
      // Aggregate debits by account
      const jLines = [] as any[]
      for (const l of payload.lines) {
        const item = await tx.item.findUnique({ where: { id: l.itemId } })
        const unitCost = Number(l.unitCost || 0)
        const amount = unitCost * Number(l.qty)
        if (item?.inventoryAssetAccountId) {
          jLines.push({ accountId: item.inventoryAssetAccountId, debitAmount: amount })
          // offset: if company provided, use AP account as a default offset if exists; otherwise skip entry
          // For now we will credit a 'inventorySuspense' placeholder account if exists
          const suspenseAcc = await tx.account.findFirst({ where: { code: 'INV-SUSPENSE' } })
          if (suspenseAcc) {
            jLines.push({ accountId: suspenseAcc.id, creditAmount: amount })
          }
        }
      }
      if (jLines.length > 0) {
          await this.journal.createEntry(payload.companyId || null, { tenantId, date: new Date().toISOString(), description: `Inventory receipt ${txRecord.transactionNumber || txRecord.id}`, lines: jLines } as any)
      }
      return txRecord
    })
  }

  async shipStock(tenantId: string, payload: any) {
    const workspaceId = tenantId
    // payload: { transactionNumber?, lines: [ { itemId, stockLocationId, qty } ], companyId }
    if (!payload.lines || payload.lines.length === 0) throw new BadRequestException('lines required')
    await assertCompanyBelongsToTenant(this.prisma, payload.companyId, tenantId)
    return this.prisma.$transaction(async (tx) => {
      const txRecord = await tx.inventoryTransaction.create({ data: { workspaceId, companyId: payload.companyId || null, transactionNumber: payload.transactionNumber || null, type: 'SHIPMENT', reference: payload.reference || null } })
      for (const l of payload.lines) {
        const itemId = l.itemId
        const stockLocationId = l.stockLocationId
        const qty = Number(l.qty)
        if (!itemId || !stockLocationId || qty <= 0) throw new BadRequestException('invalid line')

        const sl = await tx.stockLevel.findUnique({ where: { companyId_itemId_stockLocationId: { companyId: payload.companyId || null, itemId, stockLocationId } } } as any)
        if (!sl || sl.quantity.toNumber() < qty) throw new BadRequestException('insufficient stock')

        const txLine = await tx.inventoryTransactionLine.create({ data: { workspaceId, companyId: payload.companyId || null, transactionId: txRecord.id, itemId, stockLocationId, qty, lineType: 'SHIPMENT_LINE' } })

        await tx.stockLevel.update({ where: { id: sl.id }, data: { quantity: { decrement: qty } } as any })
        // consume cost layers FIFO to compute COGS
        let remaining = qty
        let totalCogs = 0
        const costLayers = await tx.inventoryCostLayer.findMany({ where: { itemId, remainingQty: { gt: 0 } }, orderBy: { createdAt: 'asc' } })
        for (const layer of costLayers) {
          if (remaining <= 0) break
          const available = Number(layer.remainingQty)
          const consume = Math.min(available, remaining)
          const cogsPart = consume * Number(layer.unitCost)
          totalCogs += cogsPart
          // decrement layer.remainingQty
          await tx.inventoryCostLayer.update({ where: { id: layer.id }, data: { remainingQty: { decrement: consume } as any } as any })
          remaining -= consume
        }
        // create journal entry for COGS if item has mapping
        const itemRow = await tx.item.findUnique({ where: { id: itemId } })
        if (itemRow?.cogsAccountId && itemRow?.inventoryAssetAccountId) {
          // debit COGS, credit inventory asset
          await this.journal.createEntry(payload.companyId || null, { tenantId, date: new Date().toISOString(), description: `COGS for shipment ${txRecord.transactionNumber || txRecord.id}`, lines: [ { accountId: itemRow.cogsAccountId, debitAmount: totalCogs }, { accountId: itemRow.inventoryAssetAccountId, creditAmount: totalCogs } ] } as any)
        }
      }
      return txRecord
    })
  }

  async transferStock(tenantId: string, payload: any) {
    const workspaceId = tenantId
    // payload: { transactionNumber?, fromLocationId, toLocationId, lines: [ { itemId, qty } ], companyId }
    if (!payload.lines || payload.lines.length === 0) throw new BadRequestException('lines required')
    if (!payload.fromLocationId || !payload.toLocationId) throw new BadRequestException('from/to required')
    await assertCompanyBelongsToTenant(this.prisma, payload.companyId, tenantId)
    return this.prisma.$transaction(async (tx) => {
      const txRecord = await tx.inventoryTransaction.create({ data: { workspaceId, companyId: payload.companyId || null, transactionNumber: payload.transactionNumber || null, type: 'TRANSFER', reference: payload.reference || null } })
      for (const l of payload.lines) {
        const itemId = l.itemId
        const qty = Number(l.qty)
        if (!itemId || qty <= 0) throw new BadRequestException('invalid line')

        const slFrom = await tx.stockLevel.findUnique({ where: { companyId_itemId_stockLocationId: { companyId: payload.companyId || null, itemId, stockLocationId: payload.fromLocationId } } } as any)
        if (!slFrom || slFrom.quantity.toNumber() < qty) throw new BadRequestException('insufficient stock at source')

        const slTo = await this.ensureStockLevel(tx, tenantId, itemId, payload.toLocationId, payload.companyId || null)
        await tx.inventoryTransactionLine.create({ data: { workspaceId, companyId: payload.companyId || null, transactionId: txRecord.id, itemId, stockLocationId: payload.fromLocationId, qty: qty * -1, lineType: 'TRANSFER_LINE' } })
        await tx.inventoryTransactionLine.create({ data: { workspaceId, companyId: payload.companyId || null, transactionId: txRecord.id, itemId, stockLocationId: payload.toLocationId, qty: qty, lineType: 'TRANSFER_LINE' } })

        await tx.stockLevel.update({ where: { id: slFrom.id }, data: { quantity: { decrement: qty } } as any })
        await tx.stockLevel.update({ where: { id: slTo.id }, data: { quantity: { increment: qty } } as any })
      }
      return txRecord
    })
  }

  async adjustStock(tenantId: string, payload: any) {
    const workspaceId = tenantId
    // payload: { transactionNumber?, lines: [ { itemId, stockLocationId, qty } ] }
    if (!payload.lines || payload.lines.length === 0) throw new BadRequestException('lines required')
    await assertCompanyBelongsToTenant(this.prisma, payload.companyId, tenantId)
    return this.prisma.$transaction(async (tx) => {
      const txRecord = await tx.inventoryTransaction.create({ data: { workspaceId, companyId: payload.companyId || null, transactionNumber: payload.transactionNumber || null, type: 'ADJUSTMENT', reference: payload.reference || null } })
      for (const l of payload.lines) {
        const itemId = l.itemId
        const stockLocationId = l.stockLocationId
        const qty = Number(l.qty)
        if (!itemId || !stockLocationId || qty === 0) throw new BadRequestException('invalid line')

        await tx.inventoryTransactionLine.create({ data: { workspaceId, companyId: payload.companyId || null, transactionId: txRecord.id, itemId, stockLocationId, qty, lineType: 'ADJUSTMENT_LINE' } })

        const sl = await this.ensureStockLevel(tx, tenantId, itemId, stockLocationId, payload.companyId || null)
        if (qty > 0) await tx.stockLevel.update({ where: { id: sl.id }, data: { quantity: { increment: qty } } as any })
        else await tx.stockLevel.update({ where: { id: sl.id }, data: { quantity: { decrement: Math.abs(qty) } } as any })
      }
      return txRecord
    })
  }
}
