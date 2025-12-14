"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockOnboardingRepository = void 0;
const common_1 = require("@nestjs/common");
let MockOnboardingRepository = class MockOnboardingRepository {
    constructor() {
        this.store = {};
    }
    async save(userId, step, data) {
        if (!this.store[userId]) {
            this.store[userId] = { steps: {}, complete: false };
        }
        this.store[userId].steps[step] = data;
    }
    async load(userId) {
        return this.store[userId]?.steps || {};
    }
    async markComplete(userId) {
        if (!this.store[userId]) {
            this.store[userId] = { steps: {}, complete: false };
        }
        this.store[userId].complete = true;
    }
    async isComplete(userId) {
        return this.store[userId]?.complete || false;
    }
};
exports.MockOnboardingRepository = MockOnboardingRepository;
exports.MockOnboardingRepository = MockOnboardingRepository = __decorate([
    (0, common_1.Injectable)()
], MockOnboardingRepository);
//# sourceMappingURL=onboarding.repository.mock.js.map