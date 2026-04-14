import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { InventoryRepository } from './inventory.repository'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class InventoryService {
    constructor(private readonly repo: InventoryRepository, private readonly prisma: PrismaService) { }

    private async getWorkspaceId(companyId: string) {
        const company = await this.prisma.company.findUnique({ where: { id: companyId }, select: { workspaceId: true } })
        if (!company) throw new NotFoundException('Company not found')
        return company.workspaceId
    }

    private async assertAccess(userId: string, companyId: string) {
        const m = await this.prisma.workspaceUser.findFirst({
            where: { status: 'ACTIVE', userId, workspace: { companies: { some: { id: companyId } } } },
        })
        if (!m) throw new ForbiddenException('Access denied')
    }

    // ─── Items ────────────────────────────────────────────────────────────────

    async listItems(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        return this.repo.findItems(companyId, {
            search: opts.search,
            type: opts.type,
            status: opts.status,
            category: opts.category,
            sort: opts.sort,
            order: opts.order,
            limit: opts.limit ? parseInt(opts.limit) : 50,
            offset: opts.offset ? parseInt(opts.offset) : 0,
        })
    }

    async getItem(userId: string, companyId: string, itemId: string) {
        await this.assertAccess(userId, companyId)
        const item = await this.repo.findItemDetail(companyId, itemId)
        if (!item) throw new NotFoundException('Item not found')

        const soldAgg = await this.prisma.invoiceLine.aggregate({
            where: { itemId, companyId, invoice: { status: { not: 'VOID' } } },
            _sum: { quantity: true, totalPrice: true },
        })

        const quoteAgg = await this.prisma.quoteLine.aggregate({
            where: { itemId, companyId, quote: { status: { notIn: ['REJECTED', 'EXPIRED', 'CONVERTED'] } } },
            _sum: { quantity: true },
        })

        const priceListItemCount = await this.prisma.priceListItem.count({ where: { itemId } })
        const priceListEntryCount = await this.prisma.priceListEntry.count({ where: { itemId } })

        const activity = await this.prisma.auditLog.findMany({
            where: { companyId, tableName: 'Item', recordId: itemId },
            orderBy: { createdAt: 'desc' },
            take: 50,
        })

        const stockQty = item.trackingType && item.trackingType !== 'NONE'
            ? item.stockLevels.reduce((sum, level) => sum + Number(level.quantity), 0)
            : null

        const recentInvoices = item.InvoiceLine?.map(line => ({
            id: line.invoice.id,
            number: line.invoice.invoiceNumber,
            date: line.invoice.date,
            status: line.invoice.status,
            quantity: Number(line.quantity),
            total: Number(line.totalPrice),
        })) ?? []

        const recentQuotes = item.quoteLines?.map(line => ({
            id: line.quote.id,
            number: line.quote.quoteNumber,
            date: line.quote.issuedAt,
            status: line.quote.status,
            quantity: Number(line.quantity),
            total: Number(line.amount),
        })) ?? []

        return {
            ...item,
            soldCount: Number(soldAgg._sum.quantity ?? 0),
            revenueGenerated: Number(soldAgg._sum.totalPrice ?? 0),
            quotedCount: Number(quoteAgg._sum?.quantity ?? 0),
            inStock: stockQty,
            usedInPriceLists: priceListItemCount + priceListEntryCount,
            recentInvoices,
            recentQuotes,
            activity,
        }
    }

    async createItem(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.name) throw new BadRequestException('name is required')
        if (!data.type) throw new BadRequestException('type is required')

        const item = await this.repo.createItem(companyId, {
            ...data,
            salesPrice: data.salesPrice != null ? Number(data.salesPrice) : undefined,
            purchaseCost: data.purchaseCost != null ? Number(data.purchaseCost) : undefined,
            status: data.status ?? 'ACTIVE',
            category: data.category ?? null,
            unit: data.unit ?? null,
        })

        const workspaceId = await this.getWorkspaceId(companyId)
        await this.prisma.auditLog.create({
            data: {
                workspaceId,
                companyId,
                userId,
                action: 'CREATE',
                tableName: 'Item',
                recordId: item.id,
                changes: {
                    name: item.name,
                    sku: item.sku,
                    type: item.type,
                    category: item.category,
                    status: item.status,
                    unit: item.unit,
                },
            },
        })

        return item
    }

    async updateItem(userId: string, companyId: string, itemId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const item = await this.repo.findItemById(companyId, itemId)
        if (!item) throw new NotFoundException('Item not found')

        const updated = await this.repo.updateItem(companyId, itemId, {
            ...data,
            salesPrice: data.salesPrice != null ? Number(data.salesPrice) : undefined,
            purchaseCost: data.purchaseCost != null ? Number(data.purchaseCost) : undefined,
            status: data.status,
            category: data.category,
            unit: data.unit,
            trackingType: data.type === 'INVENTORY' ? data.trackingType ?? 'NONE' : 'NONE',
        })

        const workspaceId = await this.getWorkspaceId(companyId)
        await this.prisma.auditLog.create({
            data: {
                workspaceId,
                companyId,
                userId,
                action: 'UPDATE',
                tableName: 'Item',
                recordId: itemId,
                changes: data,
            },
        })

        return updated
    }

    async deleteItem(userId: string, companyId: string, itemId: string) {
        await this.assertAccess(userId, companyId)
        const item = await this.repo.findItemById(companyId, itemId)
        if (!item) throw new NotFoundException('Item not found')

        const activeInvoiceCount = await this.prisma.invoiceLine.count({
            where: { itemId, companyId, invoice: { status: { not: 'VOID' } } },
        })
        const activeQuoteCount = await this.prisma.quoteLine.count({
            where: { itemId, companyId, quote: { status: { notIn: ['REJECTED', 'EXPIRED', 'CONVERTED'] } } },
        })
        if (activeInvoiceCount > 0 || activeQuoteCount > 0) {
            const details: string[] = []
            if (activeInvoiceCount > 0) details.push(`${activeInvoiceCount} invoice line${activeInvoiceCount === 1 ? '' : 's'}`)
            if (activeQuoteCount > 0) details.push(`${activeQuoteCount} quote line${activeQuoteCount === 1 ? '' : 's'}`)
            throw new BadRequestException(`Cannot delete item: referenced by ${details.join(' and ')}`)
        }

        const result = await this.repo.softDeleteItem(itemId, userId)
        const workspaceId = await this.getWorkspaceId(companyId)
        await this.prisma.auditLog.create({
            data: {
                workspaceId,
                companyId,
                userId,
                action: 'DELETE',
                tableName: 'Item',
                recordId: itemId,
                changes: { name: item.name, sku: item.sku, type: item.type },
            },
        })
        return result
    }

    async batchDeleteItems(userId: string, companyId: string, ids: string[]) {
        await this.assertAccess(userId, companyId)
        const deleted: string[] = []
        const skipped: Array<{ id: string; reason: string }> = []

        for (const id of ids) {
            const item = await this.repo.findItemById(companyId, id)
            if (!item) {
                skipped.push({ id, reason: 'Item not found or already deleted' })
                continue
            }

            const invoiceCount = await this.prisma.invoiceLine.count({
                where: { itemId: id, companyId, invoice: { status: { not: 'VOID' } } },
            })
            const quoteCount = await this.prisma.quoteLine.count({
                where: { itemId: id, companyId, quote: { status: { notIn: ['REJECTED', 'EXPIRED', 'CONVERTED'] } } },
            })

            if (invoiceCount > 0 || quoteCount > 0) {
                const parts: string[] = []
                if (invoiceCount > 0) parts.push(`${invoiceCount} invoice line${invoiceCount === 1 ? '' : 's'}`)
                if (quoteCount > 0) parts.push(`${quoteCount} quote line${quoteCount === 1 ? '' : 's'}`)
                skipped.push({ id, reason: `Referenced by ${parts.join(' and ')}` })
                continue
            }

            await this.repo.softDeleteItem(id, userId)
            deleted.push(id)
        }

        return { deleted, skipped }
    }

    async batchUpdateItemStatus(userId: string, companyId: string, ids: string[], status: 'ACTIVE' | 'INACTIVE') {
        await this.assertAccess(userId, companyId)
        if (status !== 'ACTIVE' && status !== 'INACTIVE') throw new BadRequestException('Invalid status')
        const updated = await this.repo.batchUpdateItemStatus(companyId, ids, status)
        return { updated }
    }

    async exportItems(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        const rows = await this.repo.exportItems(companyId, {
            search: opts.search,
            type: opts.type,
            status: opts.status,
            category: opts.category,
            sort: opts.sort,
            order: opts.order,
        })

        const escape = (value: string | number | null | undefined) => {
            if (value === null || value === undefined) return ''
            const str = String(value)
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`
            }
            return str
        }

        const header = ['Name', 'SKU', 'Type', 'Category', 'Sales Price', 'Purchase Price', 'Unit', 'Status', 'Stock Qty', 'Created Date']
        const body = rows.map(row => {
            const stockQty = row.stockLevels?.reduce((sum, level) => sum + Number(level.quantity), 0) ?? 0
            return [
                escape(row.name),
                escape(row.sku),
                escape(row.type),
                escape(row.category),
                escape(row.salesPrice != null ? Number(row.salesPrice).toFixed(2) : ''),
                escape(row.purchaseCost != null ? Number(row.purchaseCost).toFixed(2) : ''),
                escape(row.unit),
                escape(row.status),
                escape(stockQty),
                escape(row.createdAt.toISOString()),
            ].join(',')
        })
        return [header.join(','), ...body].join('\n')
    }

    async listItemCategories(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        return this.repo.findCategories(companyId)
    }

    // ─── Stock ────────────────────────────────────────────────────────────────

    async getStockSummary(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        return this.repo.getStockSummary(companyId)
    }

    async listLocations(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        return this.repo.findLocations(companyId)
    }

    async createLocation(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.name) throw new BadRequestException('name is required')
        return this.repo.createLocation(companyId, data)
    }

    async updateLocation(userId: string, companyId: string, id: string, data: any) {
        await this.assertAccess(userId, companyId)
        const existing = await this.prisma.stockLocation.findFirst({ where: { id, companyId } })
        if (!existing) throw new NotFoundException('Location not found')
        return this.repo.updateLocation(id, { name: data.name, description: data.description, isDefault: data.isDefault })
    }

    async deleteLocation(userId: string, companyId: string, id: string) {
        await this.assertAccess(userId, companyId)
        const existing = await this.prisma.stockLocation.findFirst({ where: { id, companyId } })
        if (!existing) throw new NotFoundException('Location not found')
        return this.repo.deleteLocation(id)
    }

    // ─── Inventory Transactions ───────────────────────────────────────────────

    async listTransactions(userId: string, companyId: string, opts: any) {
        const workspaceId = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        return this.repo.findTransactions(workspaceId, companyId, { type: opts.type, limit: opts.limit ? parseInt(opts.limit) : 50, offset: opts.offset ? parseInt(opts.offset) : 0 })
    }

    async createTransaction(userId: string, companyId: string, data: any) {
        const workspaceId = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        if (!data.type) throw new BadRequestException('type is required')
        if (!data.lines?.length) throw new BadRequestException('At least one line is required')
        return this.repo.createInventoryTransaction(workspaceId, companyId, {
            type: data.type, reference: data.reference,
            lines: data.lines.map((l: any) => ({ ...l, qty: Number(l.qty), unitCost: l.unitCost ? Number(l.unitCost) : undefined })),
        })
    }

    // ─── Fixed Assets ─────────────────────────────────────────────────────────

    async listFixedAssets(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        return this.repo.findFixedAssets(companyId, { status: opts.status })
    }

    async getFixedAsset(userId: string, companyId: string, assetId: string) {
        await this.assertAccess(userId, companyId)
        const a = await this.repo.findFixedAssetById(companyId, assetId)
        if (!a) throw new NotFoundException('Fixed asset not found')
        return a
    }

    async createFixedAsset(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.name) throw new BadRequestException('name is required')
        if (!data.acquisitionDate) throw new BadRequestException('acquisitionDate is required')
        if (!data.cost) throw new BadRequestException('cost is required')
        return this.repo.createFixedAsset(companyId, {
            ...data, cost: Number(data.cost), acquisitionDate: new Date(data.acquisitionDate),
            salvageValue: data.salvageValue ? Number(data.salvageValue) : undefined,
        })
    }

    async runDepreciation(userId: string, companyId: string, assetId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.periodStart || !data.periodEnd) throw new BadRequestException('periodStart and periodEnd are required')
        const result = await this.repo.runDepreciation(companyId, assetId, new Date(data.periodStart), new Date(data.periodEnd))
        if (!result) throw new NotFoundException('Asset not found or fully depreciated')
        return result
    }

    async disposeFixedAsset(userId: string, companyId: string, assetId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.disposalDate) throw new BadRequestException('disposalDate is required')
        if (!data.method) throw new BadRequestException('method is required (SALE, SCRAPPED, DONATED)')
        const result = await this.repo.disposeFixedAsset(companyId, assetId, {
            disposalDate: new Date(data.disposalDate), method: data.method, proceeds: data.proceeds ? Number(data.proceeds) : undefined,
        })
        if (!result) throw new NotFoundException('Asset not found')
        return result
    }

    async getDepreciationSchedule(userId: string, companyId: string, assetId: string) {
        await this.assertAccess(userId, companyId)
        const schedule = await this.repo.getDepreciationSchedule(companyId, assetId)
        if (!schedule) throw new NotFoundException('Asset not found')
        return schedule
    }

    async updateFixedAsset(userId: string, companyId: string, assetId: string, data: any) {
        await this.assertAccess(userId, companyId)
        const existing = await this.prisma.fixedAsset.findFirst({ where: { id: assetId, companyId } })
        if (!existing) throw new NotFoundException('Asset not found')
        return this.prisma.fixedAsset.update({
            where: { id: assetId },
            data: {
                name: data.name,
                description: data.description,
                categoryId: data.categoryId,
                salvageValue: data.salvageValue != null ? Number(data.salvageValue) : undefined,
                usefulLifeMonths: data.usefulLifeMonths ? Number(data.usefulLifeMonths) : undefined,
                depreciationMethod: data.depreciationMethod,
            },
        })
    }

    // ─── Asset Categories ─────────────────────────────────────────────────────

    async listAssetCategories(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        return this.prisma.fixedAssetCategory.findMany({ where: { companyId }, orderBy: { name: 'asc' } })
    }

    async createAssetCategory(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.name) throw new BadRequestException('name is required')
        return this.prisma.fixedAssetCategory.create({
            data: {
                companyId, name: data.name, description: data.description,
                defaultUsefulLifeMonths: data.defaultUsefulLifeMonths ? Number(data.defaultUsefulLifeMonths) : undefined,
                defaultDepreciationMethod: data.defaultDepreciationMethod ?? 'STRAIGHT_LINE',
                isActive: data.isActive ?? true,
            },
        })
    }

    async updateAssetCategory(userId: string, companyId: string, id: string, data: any) {
        await this.assertAccess(userId, companyId)
        const existing = await this.prisma.fixedAssetCategory.findFirst({ where: { id, companyId } })
        if (!existing) throw new NotFoundException('Category not found')
        return this.prisma.fixedAssetCategory.update({ where: { id }, data })
    }

    async deleteAssetCategory(userId: string, companyId: string, id: string) {
        await this.assertAccess(userId, companyId)
        const existing = await this.prisma.fixedAssetCategory.findFirst({ where: { id, companyId } })
        if (!existing) throw new NotFoundException('Category not found')
        const assetCount = await this.prisma.fixedAsset.count({ where: { categoryId: id } })
        if (assetCount > 0) throw new BadRequestException(`Cannot delete: ${assetCount} assets use this category`)
        return this.prisma.fixedAssetCategory.delete({ where: { id } })
    }

    // ─── Units of Measure ─────────────────────────────────────────────────────

    async listUnitsOfMeasure(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        return this.prisma.unitOfMeasure.findMany({ where: { companyId }, orderBy: { name: 'asc' } })
    }

    async createUnitOfMeasure(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.name) throw new BadRequestException('name is required')
        if (!data.abbreviation) throw new BadRequestException('abbreviation is required')
        return this.prisma.unitOfMeasure.create({
            data: { companyId, name: data.name, abbreviation: data.abbreviation, isActive: data.isActive ?? true },
        })
    }

    async updateUnitOfMeasure(userId: string, companyId: string, id: string, data: any) {
        await this.assertAccess(userId, companyId)
        const existing = await this.prisma.unitOfMeasure.findFirst({ where: { id, companyId } })
        if (!existing) throw new NotFoundException('Unit of measure not found')
        return this.prisma.unitOfMeasure.update({ where: { id }, data })
    }

    // ─── Bin Locations ────────────────────────────────────────────────────────

    async listBinLocations(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        return this.prisma.binLocation.findMany({
            where: { warehouseId: opts.warehouseId ?? undefined },
            orderBy: { name: 'asc' },
        })
    }

    async createBinLocation(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.name) throw new BadRequestException('name is required')
        if (!data.warehouseId) throw new BadRequestException('warehouseId is required')
        return this.prisma.binLocation.create({
            data: { warehouseId: data.warehouseId, name: data.name, code: data.code, isActive: data.isActive ?? true },
        })
    }

    // ─── Physical Counts (Stock Counts) ───────────────────────────────────────

    async listPhysicalCounts(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        return this.prisma.stockCount.findMany({
            where: { companyId, ...(opts.status ? { status: opts.status } : {}) },
            include: { lines: true },
            orderBy: { countDate: 'desc' },
        })
    }

    async createPhysicalCount(userId: string, companyId: string, data: any) {
        const workspaceId = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        if (!data.warehouseId) throw new BadRequestException('warehouseId is required')
        if (!data.countDate) throw new BadRequestException('countDate is required')
        return this.prisma.stockCount.create({
            data: {
                workspaceId,
                companyId,
                warehouseId: data.warehouseId,
                countDate: new Date(data.countDate),
                status: data.status ?? 'OPEN',
            },
        })
    }

    async getPhysicalCount(userId: string, companyId: string, countId: string) {
        await this.assertAccess(userId, companyId)
        const count = await this.prisma.stockCount.findFirst({ where: { id: countId, companyId }, include: { lines: true } })
        if (!count) throw new NotFoundException('Physical count not found')
        return count
    }

    // ─── Reorder Rules ───────────────────────────────────────────────────────

    async listReorderRules(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        return this.prisma.reorderRule.findMany({
            where: { companyId, ...(opts.itemId ? { itemId: opts.itemId } : {}) },
        })
    }

    async createReorderRule(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.itemId) throw new BadRequestException('itemId is required')
        if (data.reorderPoint === undefined) throw new BadRequestException('reorderPoint is required')
        if (data.reorderQty === undefined) throw new BadRequestException('reorderQty is required')
        return this.prisma.reorderRule.create({
            data: {
                companyId,
                itemId: data.itemId,
                warehouseId: data.warehouseId,
                reorderPoint: Number(data.reorderPoint),
                reorderQty: Number(data.reorderQty),
                safetyStockLevel: data.safetyStockLevel ? Number(data.safetyStockLevel) : undefined,
                maxStockLevel: data.maxStockLevel ? Number(data.maxStockLevel) : undefined,
                leadTimeDays: data.leadTimeDays ? Number(data.leadTimeDays) : undefined,
                preferredVendorId: data.preferredVendorId,
                isActive: data.isActive ?? true,
            },
        })
    }

    async updateReorderRule(userId: string, companyId: string, id: string, data: any) {
        await this.assertAccess(userId, companyId)
        const existing = await this.prisma.reorderRule.findFirst({ where: { id, companyId } })
        if (!existing) throw new NotFoundException('Reorder rule not found')
        return this.prisma.reorderRule.update({ where: { id }, data })
    }

    // ─── Backorders ───────────────────────────────────────────────────────────

    async listBackorders(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        return this.prisma.backOrder.findMany({
            where: { companyId, ...(opts.itemId ? { itemId: opts.itemId } : {}), ...(opts.status ? { status: opts.status } : {}) },
            orderBy: { createdAt: 'desc' },
        })
    }

    // ─── Lot / Serial Numbers ──────────────────────────────────────────────────

    async listLotSerial(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        return this.prisma.lotSerialNumber.findMany({
            where: { companyId, ...(opts.itemId ? { itemId: opts.itemId } : {}), ...(opts.status ? { status: opts.status } : {}) },
            orderBy: { createdAt: 'desc' },
        })
    }

    async createLotSerial(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.itemId) throw new BadRequestException('itemId is required')
        if (!data.type) throw new BadRequestException('type (LOT or SERIAL) is required')
        if (!data.lotNumber && !data.serialNumber) throw new BadRequestException('lotNumber or serialNumber is required')
        return this.prisma.lotSerialNumber.create({
            data: {
                companyId,
                itemId: data.itemId,
                type: data.type,
                lotNumber: data.lotNumber,
                serialNumber: data.serialNumber,
                expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
                quantity: data.quantity ? Number(data.quantity) : undefined,
                status: data.status ?? 'available',
            },
        })
    }

    async getItemActivity(userId: string, companyId: string, itemId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        const limit = opts.limit ? parseInt(opts.limit) : 20
        const offset = opts.offset ? parseInt(opts.offset) : 0
        const where: any = { tableName: 'Item', recordId: itemId, companyId }
        const [logs, total] = await Promise.all([
            this.prisma.auditLog.findMany({ where, include: { user: { select: { id: true, name: true, email: true } } }, orderBy: { createdAt: 'desc' }, take: limit, skip: offset }),
            this.prisma.auditLog.count({ where }),
        ])
        return { data: logs, total }
    }
}
