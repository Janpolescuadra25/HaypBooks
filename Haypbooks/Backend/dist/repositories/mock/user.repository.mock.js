"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockUserRepository = void 0;
const common_1 = require("@nestjs/common");
let MockUserRepository = class MockUserRepository {
    constructor() {
        this.users = [
            {
                id: 'user-demo-1',
                email: 'demo@haypbooks.test',
                name: 'Demo User',
                password: '$2b$10$YourHashedPasswordHere',
                role: 'admin',
                createdAt: new Date(),
                onboardingComplete: false,
                onboardingMode: 'full',
            },
        ];
    }
    async findByEmail(email) {
        const user = this.users.find((u) => u.email === email);
        return user || null;
    }
    async findById(id) {
        const user = this.users.find((u) => u.id === id);
        return user || null;
    }
    async create(data) {
        const user = {
            id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            email: data.email,
            name: data.name,
            password: data.password,
            role: data.role || 'owner',
            createdAt: new Date(),
            onboardingComplete: false,
            onboardingMode: data.onboardingMode || 'full',
        };
        this.users.push(user);
        return user;
    }
    async update(id, data) {
        const index = this.users.findIndex((u) => u.id === id);
        if (index === -1) {
            throw new Error('User not found');
        }
        this.users[index] = { ...this.users[index], ...data };
        return this.users[index];
    }
    async findByResetToken(token) {
        const now = Date.now();
        const user = this.users.find(u => u.resetToken === token && (u.resetTokenExpiry || 0) > now);
        return user || null;
    }
    async delete(id) {
        const index = this.users.findIndex((u) => u.id === id);
        if (index === -1) {
            return false;
        }
        this.users.splice(index, 1);
        return true;
    }
};
exports.MockUserRepository = MockUserRepository;
exports.MockUserRepository = MockUserRepository = __decorate([
    (0, common_1.Injectable)()
], MockUserRepository);
//# sourceMappingURL=user.repository.mock.js.map