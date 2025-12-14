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
exports.PrismaOnboardingRepository = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
let PrismaOnboardingRepository = class PrismaOnboardingRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async save(userId, step, data) {
        const existing = await this.prisma.onboardingStep.findFirst({ where: { userId, step } });
        if (existing) {
            await this.prisma.onboardingStep.update({ where: { id: existing.id }, data: { data } });
        }
        else {
            await this.prisma.onboardingStep.create({ data: { userId, step, data } });
        }
    }
    async load(userId) {
        const rows = await this.prisma.onboardingStep.findMany({ where: { userId } });
        const result = {};
        for (const r of rows)
            result[r.step] = r.data;
        return result;
    }
    async markComplete(userId) {
        await this.prisma.user.update({ where: { id: userId }, data: { onboardingComplete: true } });
    }
    async isComplete(userId) {
        const u = await this.prisma.user.findUnique({ where: { id: userId } });
        return !!(u?.onboardingComplete);
    }
};
exports.PrismaOnboardingRepository = PrismaOnboardingRepository;
exports.PrismaOnboardingRepository = PrismaOnboardingRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaOnboardingRepository);
//# sourceMappingURL=onboarding.repository.prisma.js.map