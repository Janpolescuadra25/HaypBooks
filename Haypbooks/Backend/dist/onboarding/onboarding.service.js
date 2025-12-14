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
exports.OnboardingService = void 0;
const common_1 = require("@nestjs/common");
const mock_repositories_module_1 = require("../repositories/mock/mock-repositories.module");
let OnboardingService = class OnboardingService {
    constructor(onboardingRepository, userRepository) {
        this.onboardingRepository = onboardingRepository;
        this.userRepository = userRepository;
    }
    async saveStep(userId, step, data) {
        await this.onboardingRepository.save(userId, step, data);
        return { success: true };
    }
    async loadProgress(userId) {
        const steps = await this.onboardingRepository.load(userId);
        return steps;
    }
    async complete(userId, onboardingType = 'full') {
        await this.onboardingRepository.markComplete(userId);
        await this.userRepository.update(userId, { onboardingComplete: true, onboardingMode: onboardingType });
        return { success: true };
    }
    async isComplete(userId) {
        return this.onboardingRepository.isComplete(userId);
    }
};
exports.OnboardingService = OnboardingService;
exports.OnboardingService = OnboardingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(mock_repositories_module_1.ONBOARDING_REPOSITORY)),
    __param(1, (0, common_1.Inject)(mock_repositories_module_1.USER_REPOSITORY)),
    __metadata("design:paramtypes", [Object, Object])
], OnboardingService);
//# sourceMappingURL=onboarding.service.js.map