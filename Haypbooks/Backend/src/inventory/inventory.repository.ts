import { Injectable } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class InventoryRepository {
    constructor(private readonly prisma: PrismaService) { }

    // ─── Items ────────────────────────────────────────────────────────────────

    async findItems(companyId: string, opts: { search?: string; type?: string; limit?: number; offset?: number } = {}) {
        return this.prisma.item.findMany({
            where: {
                companyId, deletedAt: null,
                ...(opts.type ? { type: opts.type } : {}),
                ...(opts.search ? { OR: [{ name: { contains: opts.search, mode: 'insensitive' } }, { sku: { contains: opts.search, mode: 'insensitive' } }] } : {}),
            },
            include: {
                stockLevels: { include: { stockLocation: { select: { id: true, name: true } } } },
            },
            orderBy: { name: 'asc' },
            take: opts.limit ?? 50,
            skip: opts.offset ?? 0,
        })
    }

    async findItemById(companyId: string, itemId: string) {
        return this.prisma.item.findFirst({
            where: { id: itemId, companyId, deletedAt: null },
            include: {
                stockLevels: { include: { stockLocation: true } },
                costLayers: { orderBy: { createdAt: 'desc' }, take: 5 },
            },
        })
    }

    async createItem(companyId: string, data: {
        name: string; type: string; sku?: string; salesPrice?: number; purchaseCost?: number
        trackingType?: string; costMethod?: string; inventoryAssetAccountId?: string; cogsAccountId?: string
    }) {
        return this.prisma.item.create({
            data: {
                companyId, name: data.name, type: data.type, sku: data.sku ?? null,
                salesPrice: data.salesPrice ?? null, purchaseCost: data.purchaseCost ?? null,
                standardCost: data.purchaseCost ?? null,
                trackingType: data.trackingType ?? 'NONE', costMethod: data.costMethod ?? 'FIFO',
                inventoryAssetAccountId: data.inventoryAssetAccountId ?? null,
                cogsAccountId: data.cogsAccountId ?? null,
            },
        })
    }

    async updateItem(companyId: string, itemId: string, data: any) {
        return this.prisma.item.update({ where: { id: itemId }, data })
    }

    async softDeleteItem(itemId: string, deletedBy: string) {
        return this.prisma.item.update({ where: { id: itemId }, data: { deletedAt: new Date(), deletedBy } })
    }

    // ─── Stock Levels ─────────────────────────────────────────────────────────

    async getStockSummary(companyId: string) {
        const levels = await this.prisma.stockLevel.findMany({
            where: { companyId, item: { deletedAt: null } },
            include: {
                item: { select: { id: true, name: true, sku: true, type: true, salesPrice: true } },
                stockLocation: { select: { id: true, name: true } },
            },
        })
        const items = levels.reduce((acc: Record<string, any>, l) => {
            const key = l.itemId
            if (!acc[key]) { acc[key] = { ...l.item, totalQty: 0, reservedQty: 0, locations: [] } }
            acc[key].totalQty += Number(l.quantity)
            acc[key].reservedQty += Number(l.reserved)
            acc[key].locations.push({ location: l.stockLocation, qty: l.quantity, reserved: l.reserved })
            return acc
        }, {})
        return Object.values(items)
    }

    // ─── Stock Locations ──────────────────────────────────────────────────────

    async findLocations(companyId: string) {
        return this.prisma.stockLocation.findMany({ where: { companyId }, orderBy: { name: 'asc' } })
    }

    async createLocation(companyId: string, data: { name: string; description?: string; isDefault?: boolean }) {
        return this.prisma.stockLocation.create({ data: { companyId, ...data } })
    }

    async updateLocation(id: string, data: { name?: string; description?: string; isDefault?: boolean }) {
        return this.prisma.stockLocation.update({ where: { id }, data })
    }

    async deleteLocation(id: string) {
        return this.prisma.stockLocation.delete({ where: { id } })
    }

    // ─── Inventory Transactions ───────────────────────────────────────────────

    async findTransactions(workspaceId: string, companyId: string, opts: { type?: string; limit?: number; offset?: number } = {}) {
        return this.prisma.inventoryTransaction.findMany({
            where: {
                workspaceId, companyId, deletedAt: null,
                ...(opts.type ? { type: opts.type } : {}),
            },
            include: {
                lines: { include: { item: { select: { id: true, name: true, sku: true } }, stockLocation: { select: { id: true, name: true } } } },
            },
            orderBy: { createdAt: 'desc' },
            take: opts.limit ?? 50,
            skip: opts.offset ?? 0,
        })
    }

    async createInventoryTransaction(workspaceId: string, companyId: string, data: {
        type: string; reference?: string
        lines: Array<{ itemId: string; qty: number; unitCost?: number; stockLocationId?: string; lineType?: string }>
    }) {
        const txNumber = `INV-${Date.now()}`
        return this.prisma.$transaction(async (tx) => {
            const txn = await tx.inventoryTransaction.create({
                data: {
                    workspaceId, companyId, type: data.type, reference: data.reference ?? null,
                    transactionNumber: txNumber, postingStatus: 'DRAFT',
                    lines: {
                        create: data.lines.map((l) => ({
                            workspaceId, itemId: l.itemId, qty: l.qty, unitCost: l.unitCost ?? null,
                            stockLocationId: l.stockLocationId ?? null, lineType: l.lineType ?? null,
                        })),
                    },
                },
                include: { lines: true },
            })

            // Update stock levels
            for (const line of data.lines) {
                if (!line.stockLocationId) continue
                const existing = await tx.stockLevel.findUnique({
                    where: { companyId_itemId_stockLocationId: { companyId, itemId: line.itemId, stockLocationId: line.stockLocationId } },
                })
                const delta = data.type === 'SHIPMENT' ? -line.qty : line.qty
                if (existing) {
                    await tx.stockLevel.update({
                        where: { id: existing.id },
                        data: { quantity: { increment: delta } },
                    })
                } else {
                    await tx.stockLevel.create({
                        data: { companyId, itemId: line.itemId, stockLocationId: line.stockLocationId, quantity: delta, reserved: 0 },
                    })
                }
            }
            return txn
        })
    }

    // ─── Fixed Assets ─────────────────────────────────────────────────────────

    async findFixedAssets(companyId: string, opts: { status?: string } = {}) {
        return this.prisma.fixedAsset.findMany({
            where: {
                companyId, deletedAt: null,
                ...(opts.status ? { status: opts.status as any } : {}),
            },
            include: {
                category: { select: { id: true, name: true } },
                _count: { select: { depreciations: true } },
            },
            orderBy: { acquisitionDate: 'desc' },
        })
    }

    async findFixedAssetById(companyId: string, assetId: string) {
        return this.prisma.fixedAsset.findFirst({
            where: { id: assetId, companyId, deletedAt: null },
            include: {
                category: true,
                depreciations: { orderBy: { periodStart: 'desc' }, take: 24 },
                disposals: { orderBy: { disposalDate: 'desc' } },
            },
        })
    }

    async createFixedAsset(companyId: string, data: {
        name: string; acquisitionDate: Date; cost: number; categoryId?: string
        salvageValue?: number; usefulLifeMonths?: number; depreciationMethod?: string
        assetAccountId?: string; accumulatedDepreciationId?: string; depreciationExpenseAccountId?: string
    }) {
        return this.prisma.fixedAsset.create({
            data: {
                companyId, name: data.name, acquisitionDate: data.acquisitionDate, cost: data.cost,
                categoryId: data.categoryId ?? null, salvageValue: data.salvageValue ?? null,
                usefulLifeMonths: data.usefulLifeMonths ?? null,
                depreciationMethod: (data.depreciationMethod ?? 'STRAIGHT_LINE') as any,
                status: 'ACTIVE', assetAccountId: data.assetAccountId ?? null,
                accumulatedDepreciationId: data.accumulatedDepreciationId ?? null,
                depreciationExpenseAccountId: data.depreciationExpenseAccountId ?? null,
            },
        })
    }

    async runDepreciation(companyId: string, assetId: string, periodStart: Date, periodEnd: Date) {
        const asset = await this.prisma.fixedAsset.findFirst({ where: { id: assetId, companyId, deletedAt: null } })
        if (!asset) return null

        const depreciableBase = Number(asset.cost) - Number(asset.salvageValue ?? 0)
        const monthlyDepreciation = asset.usefulLifeMonths
            ? depreciableBase / asset.usefulLifeMonths
            : 0

        // Get already depreciated total
        const totalDepreciated = await this.prisma.fixedAssetDepreciation.aggregate({
            where: { assetId }, _sum: { amount: true },
        })
        const alreadyDepreciated = Number(totalDepreciated._sum.amount ?? 0)
        const remaining = depreciableBase - alreadyDepreciated
        const amount = Math.min(monthlyDepreciation, remaining)

        if (amount <= 0) return { message: 'Asset is fully depreciated', assetId }

        return this.prisma.fixedAssetDepreciation.create({
            data: { companyId, assetId, periodStart, periodEnd, amount },
        })
    }

    async disposeFixedAsset(companyId: string, assetId: string, data: {
        disposalDate: Date; method: string; proceeds?: number
    }) {
        const asset = await this.prisma.fixedAsset.findFirst({ where: { id: assetId, companyId } })
        if (!asset) return null

        const totalDepreciated = await this.prisma.fixedAssetDepreciation.aggregate({
            where: { assetId }, _sum: { amount: true },
        })
        const accumulated = Number(totalDepreciated._sum.amount ?? 0)
        const bookValue = Number(asset.cost) - accumulated
        const gainLoss = (data.proceeds ?? 0) - bookValue

        return this.prisma.$transaction(async (tx) => {
            const disposal = await tx.assetDisposal.create({
                data: {
                    companyId, assetId, disposalDate: data.disposalDate,
                    method: data.method as any, proceeds: data.proceeds ?? null, gainLoss, description: `Disposed: ${data.method}`,
                },
            })
            await tx.fixedAsset.update({ where: { id: assetId }, data: { status: 'DISPOSED', deletedAt: new Date() } })
            return { disposal, gainLoss }
        })
    }

    // ─── Asset Depreciation Schedule ─────────────────────────────────────────

    async getDepreciationSchedule(companyId: string, assetId: string) {
        const asset = await this.prisma.fixedAsset.findFirst({ where: { id: assetId, companyId } })
        if (!asset) return null

        const existing = await this.prisma.fixedAssetDepreciation.findMany({
            where: { assetId }, orderBy: { periodStart: 'asc' },
        })
        const depreciableBase = Number(asset.cost) - Number(asset.salvageValue ?? 0)
        const monthlyAmt = asset.usefulLifeMonths ? depreciableBase / asset.usefulLifeMonths : 0

        return {
            assetId, name: asset.name, cost: asset.cost, salvageValue: asset.salvageValue,
            usefulLifeMonths: asset.usefulLifeMonths, depreciationMethod: asset.depreciationMethod,
            monthlyDepreciation: monthlyAmt, depreciableBase,
            posted: existing, totalDepreciated: existing.reduce((s, d) => s + Number(d.amount), 0),
        }
    }
}
