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
exports.InvoicesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../repositories/prisma/prisma.service");
const company_utils_1 = require("../common/company-utils");
let InvoicesService = class InvoicesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createInvoice(companyId, payload) {
        const tenantId = payload.tenantId || companyId;
        await (0, company_utils_1.assertCompanyBelongsToTenant)(this.prisma, companyId, tenantId);
        const invoice = await this.prisma.invoice.create({
            data: {
                tenantId,
                companyId,
                customerId: payload.customerId,
                invoiceNumber: payload.invoiceNumber,
                date: new Date(payload.date),
                dueDate: payload.dueDate ? new Date(payload.dueDate) : null,
                totalAmount: payload.totalAmount,
                balance: payload.totalAmount,
                status: payload.status || 'DRAFT'
            }
        });
        for (const line of payload.lines || []) {
            await this.prisma.invoiceLine.create({
                data: {
                    companyId,
                    invoiceId: invoice.id,
                    description: line.description,
                    quantity: line.quantity || 1,
                    unitPrice: line.unitPrice || line.rate || 0,
                    totalPrice: line.totalPrice || line.amount || 0,
                    tenantId: tenantId
                }
            });
        }
        return invoice;
    }
    async getInvoice(id) {
        return this.prisma.invoice.findUnique({ where: { id }, include: { lines: true } });
    }
};
exports.InvoicesService = InvoicesService;
exports.InvoicesService = InvoicesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], InvoicesService);
//# sourceMappingURL=invoices.service.js.map