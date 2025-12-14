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
exports.ChartOfAccountsRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../repositories/prisma/prisma.service");
let ChartOfAccountsRepository = class ChartOfAccountsRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(companyId, payload) {
        const data = { companyId, ...payload };
        return this.prisma.account.create({ data });
    }
    async listForCompany(companyId) {
        return this.prisma.account.findMany({ where: { tenantId: companyId } });
    }
    async findById(id) {
        return this.prisma.account.findUnique({ where: { id } });
    }
};
exports.ChartOfAccountsRepository = ChartOfAccountsRepository;
exports.ChartOfAccountsRepository = ChartOfAccountsRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChartOfAccountsRepository);
//# sourceMappingURL=chart-of-accounts.repository.prisma.js.map