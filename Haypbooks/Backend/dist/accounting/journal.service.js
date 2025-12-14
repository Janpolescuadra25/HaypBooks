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
exports.JournalService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../repositories/prisma/prisma.service");
const company_utils_1 = require("../common/company-utils");
let JournalService = class JournalService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createEntry(companyId, payload) {
        const totalDebit = payload.lines.reduce((s, l) => s + Number(l.debitAmount || 0), 0);
        const totalCredit = payload.lines.reduce((s, l) => s + Number(l.creditAmount || 0), 0);
        if (Math.abs(totalDebit - totalCredit) > 0.000001)
            throw new Error('Journal entry not balanced');
        const tenantId = payload.tenantId || companyId;
        await (0, company_utils_1.assertCompanyBelongsToTenant)(this.prisma, companyId, tenantId);
        const entry = await this.prisma.journalEntry.create({ data: { tenantId, companyId, date: new Date(payload.date), description: payload.description } });
        for (const l of payload.lines) {
            await this.prisma.journalEntryLine.create({ data: { journalId: entry.id, companyId, accountId: l.accountId, debit: l.debitAmount || 0, credit: l.creditAmount || 0, tenantId: tenantId } });
        }
        return entry;
    }
};
exports.JournalService = JournalService;
exports.JournalService = JournalService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], JournalService);
//# sourceMappingURL=journal.service.js.map