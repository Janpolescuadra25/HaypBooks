import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { InventoryService } from '../inventory/inventory.service'
import { assertCompanyBelongsToTenant } from '../common/company-utils'

@Injectable()
export class PurchaseOrdersService {
  constructor(private readonly prisma: PrismaService, private readonly inventory: InventoryService) {}

  async createPurchaseOrder(tenantId: string, payload: any) {
    if (!payload.vendorId) throw new BadRequestException('vendorId required')
    await assertCompanyBelongsToTenant(this.prisma as any, payload.companyId, tenantId)
    const po = await this.prisma.purchaseOrder.create({ data: { tenantId, companyId: payload.companyId || null, vendorId: payload.vendorId, poNumber: payload.poNumber || null, status: payload.status || 'OPEN', total: payload.total || 0 } })
    for (const l of payload.lines || []) {
      await this.prisma.purchaseOrderLine.create({ data: { companyId: payload.companyId || null, purchaseOrder: { connect: { id: po.id } }, item: l.itemId ? { connect: { id: l.itemId } } : undefined, description: l.description || null, quantity: l.quantity || 0, rate: l.rate || 0, amount: l.amount || 0, tenant: { connect: { id: tenantId } } } })
    }
    return po
  }

  async receivePurchaseOrder(tenantId: string, purchaseOrderId: string, payload: any) {
    // Create inventory transaction lines based on PO lines
    const po = await this.prisma.purchaseOrder.findUnique({ where: { id: purchaseOrderId }, include: { lines: true } })
    if (!po) throw new NotFoundException('Purchase Order not found')
    if (!po.lines || po.lines.length === 0) throw new BadRequestException('PO has no lines')

    // find default stock location
    const defaultLoc = await this.prisma.stockLocation.findFirst({ where: { tenantId, isDefault: true } })
    const stockLocationId = payload.stockLocationId || defaultLoc?.id
    if (!stockLocationId) throw new BadRequestException('No stock location provided and no default exists')

    const invPayload: any = { companyId: po.companyId, transactionNumber: payload.transactionNumber || `PO-RECEIPT-${po.poNumber || po.id}`, lines: [] }
    for (const l of po.lines) {
      const qty = Number(l.quantity)
      if (qty <= 0) continue
      invPayload.lines.push({ itemId: l.itemId, stockLocationId, qty, unitCost: Number(l.rate || 0) })
    }

    const invTx = await this.inventory.receiveStock(tenantId, invPayload)

    // Update PO
    await this.prisma.purchaseOrder.update({ where: { id: purchaseOrderId }, data: { status: 'RECEIVED', receivedAt: new Date(), inventoryTransactionId: invTx.id } })

    return invTx
  }
}
