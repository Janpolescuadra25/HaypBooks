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
exports.BillsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../repositories/prisma/prisma.service");
const company_utils_1 = require("../common/company-utils");
let BillsService = class BillsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createBill(tenantId, payload) {
        await (0, company_utils_1.assertCompanyBelongsToTenant)(this.prisma, payload.companyId, tenantId);
        if (!payload.vendorId) {
            throw new common_1.BadRequestException('vendorId is required');
        }
        const bill = await this.prisma.$transaction(async (tx) => {
            const newBill = await tx.bill.create({
                data: {
                    tenantId,
                    companyId: payload.companyId,
                    vendorId: payload.vendorId,
                    billNumber: payload.billNumber,
                    status: payload.status || 'DRAFT',
                    total: payload.totalAmount || 0,
                    balance: payload.totalAmount || 0,
                    issuedAt: payload.date ? new Date(payload.date) : new Date(),
                    dueAt: payload.dueDate ? new Date(payload.dueDate) : null,
                    description: payload.description || null
                }
            });
            for (const line of payload.lines || []) {
                await tx.billLine.create({
                    data: {
                        companyId: payload.companyId,
                        bill: { connect: { id: newBill.id } },
                        accountId: line.accountId,
                        itemId: line.itemId,
                        description: line.description,
                        quantity: line.quantity || 1,
                        rate: line.unitPrice || line.rate || 0,
                        amount: line.totalPrice || line.amount || 0,
                        taxCodeId: line.taxCodeId || null,
                        tenant: { connect: { id: tenantId } }
                    }
                });
            }
            return newBill;
        });
        return bill;
    }
    async getBill(id) {
        const bill = await this.prisma.bill.findUnique({
            where: { id },
            include: { lines: true, payments: true }
        });
        if (!bill) {
            throw new common_1.NotFoundException(`Bill with id ${id} not found`);
        }
        return bill;
    }
    async listBills(tenantId, filter) {
        return this.prisma.bill.findMany({
            where: { tenantId, ...filter },
            include: { lines: true, payments: true },
            orderBy: { issuedAt: 'desc' }
        });
    }
    async applyPayment(tenantId, billId, amount, payload) {
        await (0, company_utils_1.assertCompanyBelongsToTenant)(this.prisma, payload.companyId, tenantId);
        const bill = await this.prisma.bill.findUnique({ where: { id: billId } });
        if (!bill) {
            throw new common_1.NotFoundException(`Bill with id ${billId} not found`);
        }
        if (bill.balance.toNumber() < amount) {
            throw new common_1.BadRequestException(`Payment amount ${amount} exceeds bill balance ${bill.balance}`);
        }
        const result = await this.prisma.$transaction(async (tx) => {
            const payment = await tx.billPayment.create({
                data: {
                    tenantId,
                    billId,
                    companyId: payload.companyId,
                    amount,
                    paymentDate: payload.paymentDate ? new Date(payload.paymentDate) : new Date(),
                    method: payload.paymentMethod || 'CHECK',
                    referenceNumber: payload.referenceNumber || null,
                    bankAccountId: payload.bankAccountId || null,
                    vendorPaymentMethodId: payload.vendorPaymentMethodId || null
                }
            });
            const newBalance = bill.balance.toNumber() - amount;
            const newStatus = newBalance === 0 ? 'PAID' : bill.status;
            await tx.bill.update({
                where: { id: billId },
                data: {
                    balance: newBalance,
                    status: newStatus
                }
            });
            return payment;
        });
        return result;
    }
};
exports.BillsService = BillsService;
exports.BillsService = BillsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], BillsService);
//# sourceMappingURL=bills.service.js.map