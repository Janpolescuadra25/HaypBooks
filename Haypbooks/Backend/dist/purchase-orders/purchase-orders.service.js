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
exports.PurchaseOrdersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../repositories/prisma/prisma.service");
const inventory_service_1 = require("../inventory/inventory.service");
const company_utils_1 = require("../common/company-utils");
let PurchaseOrdersService = class PurchaseOrdersService {
    constructor(prisma, inventory) {
        this.prisma = prisma;
        this.inventory = inventory;
    }
    async createPurchaseOrder(tenantId, payload) {
        if (!payload.vendorId)
            throw new common_1.BadRequestException('vendorId required');
        await (0, company_utils_1.assertCompanyBelongsToTenant)(this.prisma, payload.companyId, tenantId);
        const po = await this.prisma.purchaseOrder.create({ data: { tenantId, companyId: payload.companyId || null, vendorId: payload.vendorId, poNumber: payload.poNumber || null, status: payload.status || 'OPEN', total: payload.total || 0 } });
        for (const l of payload.lines || []) {
            await this.prisma.purchaseOrderLine.create({ data: { companyId: payload.companyId || null, purchaseOrder: { connect: { id: po.id } }, item: l.itemId ? { connect: { id: l.itemId } } : undefined, description: l.description || null, quantity: l.quantity || 0, rate: l.rate || 0, amount: l.amount || 0, tenant: { connect: { id: tenantId } } } });
        }
        return po;
    }
    async receivePurchaseOrder(tenantId, purchaseOrderId, payload) {
        const po = await this.prisma.purchaseOrder.findUnique({ where: { id: purchaseOrderId }, include: { lines: true } });
        if (!po)
            throw new common_1.NotFoundException('Purchase Order not found');
        if (!po.lines || po.lines.length === 0)
            throw new common_1.BadRequestException('PO has no lines');
        const defaultLoc = await this.prisma.stockLocation.findFirst({ where: { tenantId, isDefault: true } });
        const stockLocationId = payload.stockLocationId || defaultLoc?.id;
        if (!stockLocationId)
            throw new common_1.BadRequestException('No stock location provided and no default exists');
        const invPayload = { companyId: po.companyId, transactionNumber: payload.transactionNumber || `PO-RECEIPT-${po.poNumber || po.id}`, lines: [] };
        for (const l of po.lines) {
            const qty = Number(l.quantity);
            if (qty <= 0)
                continue;
            invPayload.lines.push({ itemId: l.itemId, stockLocationId, qty, unitCost: Number(l.rate || 0) });
        }
        const invTx = await this.inventory.receiveStock(tenantId, invPayload);
        await this.prisma.purchaseOrder.update({ where: { id: purchaseOrderId }, data: { status: 'RECEIVED', receivedAt: new Date(), inventoryTransactionId: invTx.id } });
        return invTx;
    }
};
exports.PurchaseOrdersService = PurchaseOrdersService;
exports.PurchaseOrdersService = PurchaseOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, inventory_service_1.InventoryService])
], PurchaseOrdersService);
//# sourceMappingURL=purchase-orders.service.js.map