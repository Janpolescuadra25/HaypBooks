"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockRepositoriesModule = exports.ONBOARDING_REPOSITORY = exports.USER_REPOSITORY = void 0;
const common_1 = require("@nestjs/common");
const user_repository_mock_1 = require("./user.repository.mock");
const onboarding_repository_mock_1 = require("./onboarding.repository.mock");
exports.USER_REPOSITORY = 'USER_REPOSITORY';
exports.ONBOARDING_REPOSITORY = 'ONBOARDING_REPOSITORY';
let MockRepositoriesModule = class MockRepositoriesModule {
};
exports.MockRepositoriesModule = MockRepositoriesModule;
exports.MockRepositoriesModule = MockRepositoriesModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [
            {
                provide: exports.USER_REPOSITORY,
                useClass: user_repository_mock_1.MockUserRepository,
            },
            {
                provide: exports.ONBOARDING_REPOSITORY,
                useClass: onboarding_repository_mock_1.MockOnboardingRepository,
            },
        ],
        exports: [exports.USER_REPOSITORY, exports.ONBOARDING_REPOSITORY],
    })
], MockRepositoriesModule);
//# sourceMappingURL=mock-repositories.module.js.map