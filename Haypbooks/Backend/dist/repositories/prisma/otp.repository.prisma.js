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
exports.PrismaOtpRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
let PrismaOtpRepository = class PrismaOtpRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const created = await this.prisma.otp.create({ data: data });
        return created;
    }
    async findLatestByEmail(email, purpose) {
        const where = { email };
        if (purpose)
            where.purpose = purpose;
        const row = await this.prisma.otp.findFirst({ where, orderBy: { createdAt: 'desc' } });
        return row;
    }
    async incrementAttempts(id) {
        const updated = await this.prisma.otp.update({ where: { id }, data: { attempts: { increment: 1 } } });
        return updated;
    }
    async delete(id) {
        await this.prisma.otp.delete({ where: { id } });
        return true;
    }
    async countRecentByEmail(email, minutes) {
        const since = new Date(Date.now() - minutes * 60 * 1000);
        const count = await this.prisma.otp.count({ where: { email, createdAt: { gte: since } } });
        return count;
    }
};
exports.PrismaOtpRepository = PrismaOtpRepository;
exports.PrismaOtpRepository = PrismaOtpRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaOtpRepository);
//# sourceMappingURL=otp.repository.prisma.js.map