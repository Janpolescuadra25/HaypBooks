"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestController = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../repositories/prisma/prisma.service");
let TestController = class TestController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    ensureEnabled() {
        const allowFlag = process.env.ALLOW_TEST_ENDPOINTS === 'true';
        const nodeEnv = process.env.NODE_ENV;
        const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
        const hasToken = !!process.env.ALLOW_TEST_ENDPOINTS_TOKEN;
        if (nodeEnv === 'test')
            return;
        if (hasToken)
            return;
        if (allowFlag && (nodeEnv === 'development' || isCI))
            return;
        throw new common_1.ForbiddenException('Test endpoints disabled; enable only in development/CI or set NODE_ENV=test or provide ALLOW_TEST_ENDPOINTS_TOKEN');
    }
    async latestOtp(email, purpose) {
        this.ensureEnabled();
        const where = { email };
        if (purpose)
            where.purpose = purpose;
        const row = await this.prisma.otp.findFirst({ where, orderBy: { createdAt: 'desc' } });
        return row || null;
    }
    async getUser(email) {
        this.ensureEnabled();
        const user = await this.prisma.user.findUnique({ where: { email } });
        return user || null;
    }
    async listUsers() {
        this.ensureEnabled();
        const rows = await this.prisma.user.findMany({ select: { id: true, email: true, name: true, isEmailVerified: true, onboardingComplete: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 200 });
        return rows;
    }
    async createUser(body) {
        this.ensureEnabled();
        const hash = await bcrypt.hash(body.password, 10);
        const created = await this.prisma.user.create({ data: { email: body.email, password: hash, name: body.name || 'Test User', isEmailVerified: !!body.isEmailVerified } });
        return { id: created.id, email: created.email };
    }
    async listSessions(email) {
        this.ensureEnabled();
        if (!email)
            return [];
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user)
            return [];
        const sessions = await this.prisma.session.findMany({ where: { userId: user.id }, orderBy: { createdAt: 'desc' } });
        return sessions;
    }
};
exports.TestController = TestController;
__decorate([
    (0, common_1.Get)('otp/latest'),
    __param(0, (0, common_1.Query)('email')),
    __param(1, (0, common_1.Query)('purpose')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], TestController.prototype, "latestOtp", null);
__decorate([
    (0, common_1.Get)('user'),
    __param(0, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestController.prototype, "getUser", null);
__decorate([
    (0, common_1.Get)('users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], TestController.prototype, "listUsers", null);
__decorate([
    (0, common_1.Post)('create-user'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TestController.prototype, "createUser", null);
__decorate([
    (0, common_1.Get)('sessions'),
    __param(0, (0, common_1.Query)('email')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], TestController.prototype, "listSessions", null);
exports.TestController = TestController = __decorate([
    (0, common_1.Controller)('api/test'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TestController);
//# sourceMappingURL=test.controller.js.map