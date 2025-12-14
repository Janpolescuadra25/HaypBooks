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
exports.PrismaSessionRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
let PrismaSessionRepository = class PrismaSessionRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        const created = await this.prisma.session.create({ data: data });
        return created;
    }
    async findByRefreshToken(token) {
        const s = await this.prisma.session.findUnique({ where: { refreshToken: token } });
        if (!s || s.revoked)
            return null;
        return s;
    }
    async findByUserId(userId, includeRevoked = false) {
        const rows = await this.prisma.session.findMany({ where: { userId, ...(includeRevoked ? {} : { revoked: false }) } });
        return rows;
    }
    async delete(id) {
        await this.prisma.session.delete({ where: { id } });
        return true;
    }
    async deleteByUserId(userId) {
        const res = await this.prisma.session.deleteMany({ where: { userId } });
        return res.count;
    }
};
exports.PrismaSessionRepository = PrismaSessionRepository;
exports.PrismaSessionRepository = PrismaSessionRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaSessionRepository);
//# sourceMappingURL=session.repository.prisma.js.map