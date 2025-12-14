"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../repositories/prisma/prisma.service");
const journal_service_1 = require("../accounting/journal.service");
const company_utils_1 = require("../common/company-utils");
let InventoryService = class InventoryService {
    constructor(prisma, journal) {
        this.prisma = prisma;
        this.journal = journal;
    }
    async createItem(tenantId, payload) {
        if (!payload.name)
            throw new common_1.BadRequestException('name is required');
        return this.prisma.item.create({ data: { tenantId, sku: payload.sku, name: payload.name, type: payload.type || 'INVENTORY' } });
    }
    async getItem(id) {
        const item = await this.prisma.item.findUnique({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Item not found');
        return item;
    }
    async listItems(tenantId, filter) {
        return this.prisma.item.findMany({ where: { tenantId, ...(filter || {}) } });
    }
    async createStockLocation(tenantId, payload) {
        if (!payload.name)
            throw new common_1.BadRequestException('name is required');
        await (0, company_utils_1.assertCompanyBelongsToTenant)(this.prisma, payload.companyId, tenantId);
        return this.prisma.stockLocation.create({ data: { tenantId, companyId: payload.companyId || null, name: payload.name, description: payload.description || null, isDefault: !!payload.isDefault } });
    }
    async getStockLevel(tenantId, itemId, stockLocationId) {
        return this.prisma.stockLevel.findUnique({ where: { tenantId_itemId_stockLocationId: { tenantId, itemId, stockLocationId } } });
    }
    async ensureStockLevel(tx, tenantId, itemId, stockLocationId, companyId) {
        let sl = await tx.stockLevel.findUnique({ where: { tenantId_itemId_stockLocationId: { tenantId, itemId, stockLocationId } } });
        if (!sl) {
            if (companyId)
                await (0, company_utils_1.assertCompanyBelongsToTenant)(this.prisma, companyId, tenantId);
            sl = await tx.stockLevel.create({ data: { tenantId, companyId: companyId || null, itemId, stockLocationId, quantity: 0, reserved: 0 } });
        }
        return sl;
    }
    async receiveStock(tenantId, payload) {
        if (!payload.lines || payload.lines.length === 0)
            throw new common_1.BadRequestException('lines required');
        await (0, company_utils_1.assertCompanyBelongsToTenant)(this.prisma, payload.companyId, tenantId);
        return this.prisma.$transaction(async (tx) => {
            const txRecord = await tx.inventoryTransaction.create({ data: { tenantId, companyId: payload.companyId || null, transactionNumber: payload.transactionNumber || null, type: 'RECEIPT', reference: payload.reference || null } });
            for (const l of payload.lines) {
                const itemId = l.itemId;
                const stockLocationId = l.stockLocationId;
                const qty = Number(l.qty);
                if (!itemId || !stockLocationId || qty <= 0)
                    throw new common_1.BadRequestException('invalid line');
                const txLine = await tx.inventoryTransactionLine.create({ data: { tenantId, companyId: payload.companyId || null, transactionId: txRecord.id, itemId, stockLocationId, qty, unitCost: l.unitCost || null, lineType: 'RECEIPT_LINE' } });
                const sl = await this.ensureStockLevel(tx, tenantId, itemId, stockLocationId, payload.companyId || null);
                await tx.inventoryCostLayer.create({ data: { tenantId, companyId: payload.companyId || null, itemId, inventoryTxLineId: txLine.id, quantity: qty, remainingQty: qty, unitCost: l.unitCost || 0 } });
                await tx.stockLevel.update({ where: { id: sl.id }, data: { quantity: { increment: qty } } });
            }
            const jLines = [];
            for (const l of payload.lines) {
                const item = await tx.item.findUnique({ where: { id: l.itemId } });
                const unitCost = Number(l.unitCost || 0);
                const amount = unitCost * Number(l.qty);
                if (item?.inventoryAssetAccountId) {
                    jLines.push({ accountId: item.inventoryAssetAccountId, debitAmount: amount });
                    const suspenseAcc = await tx.account.findFirst({ where: { tenantId, code: 'INV-SUSPENSE' } });
                    if (suspenseAcc) {
                        jLines.push({ accountId: suspenseAcc.id, creditAmount: amount });
                    }
                }
            }
            if (jLines.length > 0) {
                await this.journal.createEntry(payload.companyId || tenantId, { date: new Date().toISOString(), description: `Inventory receipt ${txRecord.transactionNumber || txRecord.id}`, lines: jLines });
            }
            return txRecord;
        });
    }
    async shipStock(tenantId, payload) {
        if (!payload.lines || payload.lines.length === 0)
            throw new common_1.BadRequestException('lines required');
        await (0, company_utils_1.assertCompanyBelongsToTenant)(this.prisma, payload.companyId, tenantId);
        return this.prisma.$transaction(async (tx) => {
            const txRecord = await tx.inventoryTransaction.create({ data: { tenantId, companyId: payload.companyId || null, transactionNumber: payload.transactionNumber || null, type: 'SHIPMENT', reference: payload.reference || null } });
            for (const l of payload.lines) {
                const itemId = l.itemId;
                const stockLocationId = l.stockLocationId;
                const qty = Number(l.qty);
                if (!itemId || !stockLocationId || qty <= 0)
                    throw new common_1.BadRequestException('invalid line');
                const sl = await tx.stockLevel.findUnique({ where: { tenantId_itemId_stockLocationId: { tenantId, itemId, stockLocationId } } });
                if (!sl || sl.quantity.toNumber() < qty)
                    throw new common_1.BadRequestException('insufficient stock');
                const txLine = await tx.inventoryTransactionLine.create({ data: { tenantId, companyId: payload.companyId || null, transactionId: txRecord.id, itemId, stockLocationId, qty, lineType: 'SHIPMENT_LINE' } });
                await tx.stockLevel.update({ where: { id: sl.id }, data: { quantity: { decrement: qty } } });
                let remaining = qty;
                let totalCogs = 0;
                const costLayers = await tx.inventoryCostLayer.findMany({ where: { tenantId, itemId, remainingQty: { gt: 0 } }, orderBy: { createdAt: 'asc' } });
                for (const layer of costLayers) {
                    if (remaining <= 0)
                        break;
                    const available = Number(layer.remainingQty);
                    const consume = Math.min(available, remaining);
                    const cogsPart = consume * Number(layer.unitCost);
                    totalCogs += cogsPart;
                    await tx.inventoryCostLayer.update({ where: { id: layer.id }, data: { remainingQty: { decrement: consume } } });
                    remaining -= consume;
                }
                const itemRow = await tx.item.findUnique({ where: { id: itemId } });
                if (itemRow?.cogsAccountId && itemRow?.inventoryAssetAccountId) {
                    await this.journal.createEntry(payload.companyId || tenantId, { date: new Date().toISOString(), description: `COGS for shipment ${txRecord.transactionNumber || txRecord.id}`, lines: [{ accountId: itemRow.cogsAccountId, debitAmount: totalCogs }, { accountId: itemRow.inventoryAssetAccountId, creditAmount: totalCogs }] });
                }
            }
            return txRecord;
        });
    }
    async transferStock(tenantId, payload) {
        if (!payload.lines || payload.lines.length === 0)
            throw new common_1.BadRequestException('lines required');
        if (!payload.fromLocationId || !payload.toLocationId)
            throw new common_1.BadRequestException('from/to required');
        await (0, company_utils_1.assertCompanyBelongsToTenant)(this.prisma, payload.companyId, tenantId);
        return this.prisma.$transaction(async (tx) => {
            const txRecord = await tx.inventoryTransaction.create({ data: { tenantId, companyId: payload.companyId || null, transactionNumber: payload.transactionNumber || null, type: 'TRANSFER', reference: payload.reference || null } });
            for (const l of payload.lines) {
                const itemId = l.itemId;
                const qty = Number(l.qty);
                if (!itemId || qty <= 0)
                    throw new common_1.BadRequestException('invalid line');
                const slFrom = await tx.stockLevel.findUnique({ where: { tenantId_itemId_stockLocationId: { tenantId, itemId, stockLocationId: payload.fromLocationId } } });
                if (!slFrom || slFrom.quantity.toNumber() < qty)
                    throw new common_1.BadRequestException('insufficient stock at source');
                const slTo = await this.ensureStockLevel(tx, tenantId, itemId, payload.toLocationId, payload.companyId || null);
                await tx.inventoryTransactionLine.create({ data: { tenantId, companyId: payload.companyId || null, transactionId: txRecord.id, itemId, stockLocationId: payload.fromLocationId, qty: qty * -1, lineType: 'TRANSFER_LINE' } });
                await tx.inventoryTransactionLine.create({ data: { tenantId, companyId: payload.companyId || null, transactionId: txRecord.id, itemId, stockLocationId: payload.toLocationId, qty: qty, lineType: 'TRANSFER_LINE' } });
                await tx.stockLevel.update({ where: { id: slFrom.id }, data: { quantity: { decrement: qty } } });
                await tx.stockLevel.update({ where: { id: slTo.id }, data: { quantity: { increment: qty } } });
            }
            return txRecord;
        });
    }
    async adjustStock(tenantId, payload) {
        if (!payload.lines || payload.lines.length === 0)
            throw new common_1.BadRequestException('lines required');
        await (0, company_utils_1.assertCompanyBelongsToTenant)(this.prisma, payload.companyId, tenantId);
        return this.prisma.$transaction(async (tx) => {
            const txRecord = await tx.inventoryTransaction.create({ data: { tenantId, companyId: payload.companyId || null, transactionNumber: payload.transactionNumber || null, type: 'ADJUSTMENT', reference: payload.reference || null } });
            for (const l of payload.lines) {
                const itemId = l.itemId;
                const stockLocationId = l.stockLocationId;
                const qty = Number(l.qty);
                if (!itemId || !stockLocationId || qty === 0)
                    throw new common_1.BadRequestException('invalid line');
                await tx.inventoryTransactionLine.create({ data: { tenantId, companyId: payload.companyId || null, transactionId: txRecord.id, itemId, stockLocationId, qty, lineType: 'ADJUSTMENT_LINE' } });
                const sl = await this.ensureStockLevel(tx, tenantId, itemId, stockLocationId, payload.companyId || null);
                if (qty > 0)
                    await tx.stockLevel.update({ where: { id: sl.id }, data: { quantity: { increment: qty } } });
                else
                    await tx.stockLevel.update({ where: { id: sl.id }, data: { quantity: { decrement: Math.abs(qty) } } });
            }
            return txRecord;
        });
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, journal_service_1.JournalService])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map