"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrismaRepositoriesModule = exports.ONBOARDING_REPOSITORY = exports.OTP_REPOSITORY = exports.SESSION_REPOSITORY = exports.USER_REPOSITORY = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("./prisma.service");
const user_repository_prisma_1 = require("./user.repository.prisma");
const session_repository_prisma_1 = require("./session.repository.prisma");
const otp_repository_prisma_1 = require("./otp.repository.prisma");
exports.USER_REPOSITORY = 'USER_REPOSITORY';
exports.SESSION_REPOSITORY = 'SESSION_REPOSITORY';
exports.OTP_REPOSITORY = 'OTP_REPOSITORY';
exports.ONBOARDING_REPOSITORY = 'ONBOARDING_REPOSITORY';
let PrismaRepositoriesModule = class PrismaRepositoriesModule {
};
exports.PrismaRepositoriesModule = PrismaRepositoriesModule;
exports.PrismaRepositoriesModule = PrismaRepositoriesModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            prisma_service_1.PrismaService,
            { provide: exports.USER_REPOSITORY, useClass: user_repository_prisma_1.PrismaUserRepository },
            { provide: exports.SESSION_REPOSITORY, useClass: session_repository_prisma_1.PrismaSessionRepository },
            { provide: exports.OTP_REPOSITORY, useClass: otp_repository_prisma_1.PrismaOtpRepository },
            { provide: exports.ONBOARDING_REPOSITORY, useClass: (require('./onboarding.repository.prisma').PrismaOnboardingRepository) },
        ],
        exports: [exports.USER_REPOSITORY, exports.SESSION_REPOSITORY, exports.OTP_REPOSITORY, exports.ONBOARDING_REPOSITORY, prisma_service_1.PrismaService],
    })
], PrismaRepositoriesModule);
//# sourceMappingURL=prisma-repositories.module.js.map