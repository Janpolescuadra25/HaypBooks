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
exports.PrismaAuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const prisma_repositories_module_1 = require("../repositories/prisma/prisma-repositories.module");
let PrismaAuthService = class PrismaAuthService {
    constructor(userRepo, sessionRepo, otpRepo, jwtService) {
        this.userRepo = userRepo;
        this.sessionRepo = sessionRepo;
        this.otpRepo = otpRepo;
        this.jwtService = jwtService;
    }
    async signup(email, password, name) {
        const existing = await this.userRepo.findByEmail(email);
        if (existing)
            throw new common_1.ConflictException('Email already registered');
        const hashed = await bcrypt.hash(password, 10);
        const user = await this.userRepo.create({ email, password: hashed, name, isEmailVerified: false });
        const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role });
        return { token, user };
    }
    async login(email, password, ipAddress, userAgent) {
        const user = await this.userRepo.findByEmail(email);
        if (!user)
            throw new common_1.UnauthorizedException();
        const ok = await bcrypt.compare(password, user.password);
        if (!ok)
            throw new common_1.UnauthorizedException();
        const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role }, { expiresIn: '15m' });
        const refreshToken = this.jwtService.sign({ sub: user.id }, { expiresIn: '7d' });
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await this.sessionRepo.create({ userId: user.id, refreshToken, expiresAt, ipAddress, userAgent, lastUsedAt: new Date() });
        return { token, refreshToken, user };
    }
    async refresh(refreshToken) {
        const session = await this.sessionRepo.findByRefreshToken(refreshToken);
        if (!session)
            return null;
        if ((new Date(session.expiresAt)).getTime() < Date.now() || session.revoked) {
            return null;
        }
        const user = await this.userRepo.findById(session.userId);
        if (!user)
            return null;
        const token = this.jwtService.sign({ sub: user.id, email: user.email, role: user.role }, { expiresIn: '15m' });
        const newRefresh = this.jwtService.sign({ sub: user.id }, { expiresIn: '7d' });
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        try {
            await this.sessionRepo.delete(session.id);
        }
        catch { }
        await this.sessionRepo.create({ userId: user.id, refreshToken: newRefresh, expiresAt, ipAddress: session.ipAddress, userAgent: session.userAgent, lastUsedAt: new Date() });
        return { token, refreshToken: newRefresh, user };
    }
    async startOtp(email, otpCode, ttlMinutes = 5, purpose = 'RESET') {
        const code = otpCode || String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
        const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);
        const created = await this.otpRepo.create({ email, otpCode: code, expiresAt, purpose });
        return created;
    }
    async verifyOtp(email, otpCode, consume = false) {
        const row = await this.otpRepo.findLatestByEmail(email);
        if (!row)
            return false;
        const expiryTs = typeof row.expiresAt === 'number' ? row.expiresAt : (row.expiresAt instanceof Date ? row.expiresAt.getTime() : Number(row.expiresAt));
        if (expiryTs < Date.now())
            return false;
        if (row.attempts >= 5)
            return false;
        if (row.otpCode !== otpCode) {
            await this.otpRepo.incrementAttempts(row.id);
            return false;
        }
        try {
            if (consume || row.purpose === 'VERIFY_EMAIL' || row.purpose === 'VERIFY') {
                await this.otpRepo.delete(row.id);
            }
        }
        catch (e) { }
        try {
            if (row.purpose === 'VERIFY_EMAIL' || row.purpose === 'VERIFY') {
                const user = await this.userRepo.findByEmail(email);
                if (user)
                    await this.userRepo.update(user.id, { isEmailVerified: true });
            }
        }
        catch (e) {
        }
        return true;
    }
};
exports.PrismaAuthService = PrismaAuthService;
exports.PrismaAuthService = PrismaAuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(prisma_repositories_module_1.USER_REPOSITORY)),
    __param(1, (0, common_1.Inject)(prisma_repositories_module_1.SESSION_REPOSITORY)),
    __param(2, (0, common_1.Inject)(prisma_repositories_module_1.OTP_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object, Object, jwt_1.JwtService])
], PrismaAuthService);
//# sourceMappingURL=prisma-auth.service.js.map