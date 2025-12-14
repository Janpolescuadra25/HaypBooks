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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const prisma_auth_service_1 = require("./prisma-auth.service");
const schemas_1 = require("./schemas");
const prisma_repositories_module_1 = require("../repositories/prisma/prisma-repositories.module");
const jwt_auth_guard_1 = require("./guards/jwt-auth.guard");
const auth_dto_1 = require("./dto/auth.dto");
let AuthController = class AuthController {
    constructor(authService, userRepository, sessionRepo, otpRepo) {
        this.authService = authService;
        this.userRepository = userRepository;
        this.sessionRepo = sessionRepo;
        this.otpRepo = otpRepo;
    }
    async login(loginDto, req, res) {
        const ua = req.headers['user-agent'] || '';
        const result = await this.authService.login(loginDto.email, loginDto.password, req.ip || req.connection?.remoteAddress, String(ua));
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        };
        res.cookie('token', result.token, { ...cookieOptions, maxAge: 1000 * 60 * 15 });
        if (result.refreshToken) {
            res.cookie('refreshToken', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
        }
        res.cookie('email', result.user.email, cookieOptions);
        res.cookie('userId', result.user.id, cookieOptions);
        res.cookie('role', result.user.role, cookieOptions);
        if (result.user.onboardingComplete) {
            res.cookie('onboardingComplete', 'true', cookieOptions);
            if (result.user.onboardingMode)
                res.cookie('onboardingMode', result.user.onboardingMode, cookieOptions);
        }
        else {
            res.clearCookie('onboardingComplete');
        }
        return result;
    }
    async signup(signupDto, res) {
        const result = await this.authService.signup(signupDto.email, signupDto.password, signupDto.name);
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        };
        res.cookie('token', result.token, cookieOptions);
        res.cookie('email', result.user.email, cookieOptions);
        res.cookie('userId', result.user.id, cookieOptions);
        res.cookie('role', result.user.role, cookieOptions);
        if (result.user.onboardingMode)
            res.cookie('onboardingMode', result.user.onboardingMode, cookieOptions);
        try {
            const created = await this.authService.startOtp(result.user.email, undefined, 5, 'VERIFY_EMAIL');
            console.log(`Verification OTP for ${result.user.email}: ${created.otpCode}`);
            if (process.env.NODE_ENV !== 'production') {
                result._devOtp = created.otpCode;
            }
        }
        catch (e) {
        }
        return result;
    }
    async sendVerification(body) {
        const { email } = body;
        try {
            const created = await this.authService.startOtp(email, undefined, 5, 'VERIFY_EMAIL');
            console.log(`Verification OTP for ${email}: ${created.otpCode}`);
            if (process.env.NODE_ENV !== 'production')
                return { success: true, otp: created.otpCode };
        }
        catch (e) {
        }
        return { success: true };
    }
    async logout(req, res) {
        const refreshToken = req.cookies?.refreshToken;
        if (refreshToken) {
            try {
                const session = await this.sessionRepo.findByRefreshToken(refreshToken);
                if (session)
                    await this.sessionRepo.delete(session.id);
            }
            catch (e) {
            }
        }
        res.clearCookie('token');
        res.clearCookie('refreshToken');
        res.clearCookie('email');
        res.clearCookie('userId');
        res.clearCookie('role');
        res.clearCookie('onboardingComplete');
        return { success: true };
    }
    async listSessions(req) {
        const userId = req.user?.userId;
        if (!userId)
            return [];
        const includeRevoked = req.query?.includeRevoked === 'true';
        const sessions = await this.sessionRepo.findByUserId(userId, includeRevoked);
        return sessions;
    }
    async revokeSession(req, body) {
        const userId = req.user?.userId;
        if (!userId)
            throw new common_1.UnauthorizedException();
        const { sessionId, refreshToken } = body;
        if (sessionId) {
            const sessions = await this.sessionRepo.findByUserId(userId);
            const match = sessions.find((s) => s.id === sessionId);
            if (!match)
                throw new common_1.UnauthorizedException();
            await this.sessionRepo.delete(sessionId);
            return { success: true };
        }
        if (refreshToken) {
            const session = await this.sessionRepo.findByRefreshToken(refreshToken);
            if (!session || session.userId !== userId)
                throw new common_1.UnauthorizedException();
            await this.sessionRepo.delete(session.id);
            return { success: true };
        }
        throw new common_1.NotFoundException('sessionId or refreshToken required');
    }
    async revokeAllSessions(req) {
        const userId = req.user?.userId;
        if (!userId)
            throw new common_1.UnauthorizedException();
        const count = await this.sessionRepo.deleteByUserId(userId);
        return { success: true, deleted: count };
    }
    async refresh(req, res) {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken)
            throw new common_1.UnauthorizedException();
        const result = await this.authService.refresh(refreshToken);
        if (!result)
            throw new common_1.UnauthorizedException();
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        };
        res.cookie('token', result.token, { ...cookieOptions, maxAge: 1000 * 60 * 15 });
        res.cookie('refreshToken', result.refreshToken, cookieOptions);
        return { token: result.token, user: result.user };
    }
    async forgotPassword(body) {
        const parsed = schemas_1.ForgotPasswordSchema.safeParse(body);
        if (!parsed.success)
            return { success: true };
        const { email } = parsed.data;
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            return { success: true };
        }
        try {
            const recent = await this.otpRepo.countRecentByEmail(email, 60);
            if (recent >= 5) {
                console.log(`Rate limit hit for forgot-password: ${email}`);
                return { success: true };
            }
        }
        catch (e) {
        }
        try {
            const created = await this.authService.startOtp(email, undefined, 5);
            console.log(`Password reset OTP for ${email}: ${created.otpCode} (expires ${created.expiresAt})`);
            if (process.env.NODE_ENV !== 'production') {
                return { success: true, otp: created.otpCode };
            }
        }
        catch (e) {
            console.log('Failed to create OTP for forgot-password', e?.message || e);
        }
        return { success: true };
    }
    async verifyOtp(body) {
        const parsed = schemas_1.VerifyOtpSchema.safeParse(body);
        if (!parsed.success)
            return { success: false };
        const ok = await this.authService.verifyOtp(parsed.data.email, parsed.data.otpCode);
        return { success: ok };
    }
    async resetPassword(body) {
        const parsed = schemas_1.ResetPasswordSchema.safeParse(body);
        if (!parsed.success)
            throw new common_1.NotFoundException('Invalid reset payload');
        const { email, otpCode, password, token } = parsed.data;
        if (!token && (!email || !otpCode))
            throw new common_1.NotFoundException('Missing token or email/otp');
        const user = await this.userRepository.findByEmail(email);
        if (!user)
            return { success: true };
        const valid = await this.authService.verifyOtp(email, otpCode, true);
        if (!valid)
            throw new common_1.NotFoundException('OTP invalid or expired');
        const hashed = await require('bcrypt').hash(password, 10);
        await this.userRepository.update(user.id, { password: hashed });
        return { success: true };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.LoginDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('signup'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.SignupDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "signup", null);
__decorate([
    (0, common_1.Post)('send-verification'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "sendVerification", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('sessions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "listSessions", null);
__decorate([
    (0, common_1.Post)('sessions/revoke'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "revokeSession", null);
__decorate([
    (0, common_1.Post)('sessions/revoke-all'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "revokeAllSessions", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('verify-otp'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.VerifyOtpDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyOtp", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auth_dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('api/auth'),
    __param(1, (0, common_1.Inject)(prisma_repositories_module_1.USER_REPOSITORY)),
    __param(2, (0, common_1.Inject)(prisma_repositories_module_1.SESSION_REPOSITORY)),
    __param(3, (0, common_1.Inject)(prisma_repositories_module_1.OTP_REPOSITORY)),
    __metadata("design:paramtypes", [prisma_auth_service_1.PrismaAuthService, Object, Object, Object])
], AuthController);
//# sourceMappingURL=auth.controller.js.map