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
        /*
         * Permit test-only endpoints only when one of these is true:
         *  - NODE_ENV === 'test' (explicit test run)
         *  - ALLOW_TEST_ENDPOINTS=true AND (running in development OR running in CI OR a token is present)
         * This prevents enabling the endpoints in production by accident when ALLOW_TEST_ENDPOINTS
         * is set to true on a live server.
         */
        if (nodeEnv === 'test')
            return;
        // A secret token (ALLOW_TEST_ENDPOINTS_TOKEN) will always allow access when present
        if (hasToken)
            return;
        // ALLOW_TEST_ENDPOINTS must be true and the process should be running in development or CI
        if (allowFlag && (nodeEnv === 'development' || isCI))
            return;
        throw new common_1.ForbiddenException('Test endpoints disabled; enable only in development/CI or set NODE_ENV=test or provide ALLOW_TEST_ENDPOINTS_TOKEN');
    }
    async latestOtp(email, phone, purpose) {
        this.ensureEnabled();
        const where = {};
        if (email)
            where.email = email;
        if (phone)
            where.phone = phone;
        if (purpose) {
            // Map incoming purpose strings to allowed enum values
            if (purpose === 'VERIFY_PHONE')
                where.purpose = 'MFA';
            else
                where.purpose = purpose;
        }
        if (!email && !phone)
            return null;
        const row = await this.prisma.otp.findFirst({ where, orderBy: { createdAt: 'desc' } });
        return row || null;
    }
    // Return 201 Created for test helper creation convenience
    async createOtp(body) {
        this.ensureEnabled();
        if (!body || (!body.email && !body.phone))
            return { error: 'missing email or phone' };
        const code = body.otp || String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
        const ttl = body.ttlMinutes || 5;
        const expiresAt = new Date(Date.now() + ttl * 60 * 1000);
        // Map free-form purpose values to allowed OtpPurpose
        let purpose = 'RESET';
        if (body.purpose === 'VERIFY_EMAIL')
            purpose = 'VERIFY_EMAIL';
        else if (body.purpose === 'MFA')
            purpose = 'MFA';
        else if (body.purpose === 'VERIFY_PHONE')
            purpose = 'MFA'; // treat phone verification as MFA in DB
        const created = await this.prisma.otp.create({ data: { email: body.email || null, phone: body.phone || null, otpCode: code, purpose, expiresAt } });
        return { otp: created.otpCode };
    }
    async createOtps(body) {
        this.ensureEnabled();
        if (!body || !body.phones || !Array.isArray(body.phones) || body.phones.length === 0)
            return { error: 'missing phones' };
        const ttl = body.ttlMinutes || 5;
        const expiresAt = new Date(Date.now() + ttl * 60 * 1000);
        let purpose = 'RESET';
        if (body.purpose === 'VERIFY_EMAIL')
            purpose = 'VERIFY_EMAIL';
        else if (body.purpose === 'MFA')
            purpose = 'MFA';
        else if (body.purpose === 'VERIFY_PHONE')
            purpose = 'MFA';
        const results = {};
        for (const p of body.phones) {
            const code = body.otp || String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
            const created = await this.prisma.otp.create({ data: { phone: p, otpCode: code, purpose, expiresAt, email: null } });
            results[p] = created.otpCode;
        }
        return { otps: results };
    }
    async getUser(email) {
        this.ensureEnabled();
        const user = await this.prisma.user.findUnique({ where: { email } });
        return user || null;
    }
    async listUsers() {
        this.ensureEnabled();
        // return a safe, small list of user fields for test inspection
        const rows = await this.prisma.user.findMany({ select: { id: true, email: true, name: true, isEmailVerified: true, onboardingComplete: true, createdAt: true }, orderBy: { createdAt: 'desc' }, take: 200 });
        return rows;
    }
    async createUser(body) {
        this.ensureEnabled();
        const hash = await bcrypt.hash(body.password, 10);
        const created = await this.prisma.user.create({ data: { email: body.email, password: hash, name: body.name || 'Test User', phone: body.phone || null, isEmailVerified: !!body.isEmailVerified, isAccountant: !!body.isAccountant, role: body.role } });
        return { id: created.id, email: created.email };
    }
    async setTrial(body) {
        this.ensureEnabled();
        if (!body || !body.trialEndsAt)
            return { error: 'missing trialEndsAt' };
        // Prefer identifying by id, fallback to email
        let where = {};
        if (body.id)
            where = { id: body.id };
        else if (body.email)
            where = { email: body.email };
        else
            return { error: 'missing id or email' };
        const updated = await this.prisma.user.update({ where, data: { trialEndsAt: body.trialEndsAt, trialStartedAt: new Date().toISOString() } });
        return { id: updated.id, trialEndsAt: updated.trialEndsAt };
    }
    async updateUser(body) {
        this.ensureEnabled();
        if (!body || !body.data)
            return { error: 'missing data' };
        let where = {};
        if (body.id)
            where = { id: body.id };
        else if (body.email)
            where = { email: body.email };
        else
            return { error: 'missing id or email' };
        const allowed = ['isAccountant', 'role', 'preferredHub', 'name'];
        const toUpdate = {};
        for (const k of allowed)
            if (body.data[k] !== undefined)
                toUpdate[k] = body.data[k];
        if (Object.keys(toUpdate).length === 0)
            return { error: 'no allowed fields to update' };
        const updated = await this.prisma.user.update({ where, data: toUpdate });
        return { id: updated.id, ...toUpdate };
    }
    async listSessions(email) {
        this.ensureEnabled();
        if (!email)
            return [];
        // join user->session and return session rows
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
    __param(1, (0, common_1.Query)('phone')),
    __param(2, (0, common_1.Query)('purpose')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], TestController.prototype, "latestOtp", null);
__decorate([
    (0, common_1.Post)('create-otp')
    // Return 201 Created for test helper creation convenience
    ,
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TestController.prototype, "createOtp", null);
__decorate([
    (0, common_1.Post)('create-otps'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TestController.prototype, "createOtps", null);
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
    (0, common_1.Post)('set-trial'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TestController.prototype, "setTrial", null);
__decorate([
    (0, common_1.Post)('update-user'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], TestController.prototype, "updateUser", null);
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
