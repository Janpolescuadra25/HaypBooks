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
exports.OnboardingController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const onboarding_service_1 = require("./onboarding.service");
const onboarding_dto_1 = require("./dto/onboarding.dto");
let OnboardingController = class OnboardingController {
    constructor(onboardingService) {
        this.onboardingService = onboardingService;
    }
    async saveStep(req, saveStepDto) {
        const userId = req.user.userId;
        return this.onboardingService.saveStep(userId, saveStepDto.step, saveStepDto.data);
    }
    async loadProgress(req) {
        const userId = req.user.userId;
        const steps = await this.onboardingService.loadProgress(userId);
        return { steps };
    }
    async complete(req, res, body) {
        const userId = req.user.userId;
        const type = body?.type || 'full';
        await this.onboardingService.complete(userId, type);
        res.cookie('onboardingComplete', 'true', {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.cookie('onboardingMode', type, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return { success: true };
    }
};
exports.OnboardingController = OnboardingController;
__decorate([
    (0, common_1.Post)('save'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, onboarding_dto_1.SaveStepDto]),
    __metadata("design:returntype", Promise)
], OnboardingController.prototype, "saveStep", null);
__decorate([
    (0, common_1.Get)('save'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OnboardingController.prototype, "loadProgress", null);
__decorate([
    (0, common_1.Post)('complete'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object]),
    __metadata("design:returntype", Promise)
], OnboardingController.prototype, "complete", null);
exports.OnboardingController = OnboardingController = __decorate([
    (0, common_1.Controller)('api/onboarding'),
    __metadata("design:paramtypes", [onboarding_service_1.OnboardingService])
], OnboardingController);
//# sourceMappingURL=onboarding.controller.js.map