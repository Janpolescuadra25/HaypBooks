"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const onboarding_module_1 = require("./onboarding/onboarding.module");
const test_controller_1 = require("./test/test.controller");
const health_controller_1 = require("./health/health.controller");
const bills_module_1 = require("./accounting/bills.module");
const purchase_orders_module_1 = require("./purchase-orders/purchase-orders.module");
const inventory_module_1 = require("./inventory/inventory.module");
const mock_repositories_module_1 = require("./repositories/mock/mock-repositories.module");
const prisma_repositories_module_1 = require("./repositories/prisma/prisma-repositories.module");
const payroll_module_1 = require("./payroll/payroll.module");
const RepositoriesModule = (process.env.USE_MOCK_REPOS === 'true') ? mock_repositories_module_1.MockRepositoriesModule : prisma_repositories_module_1.PrismaRepositoriesModule;
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            RepositoriesModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            onboarding_module_1.OnboardingModule,
            bills_module_1.BillsModule,
            purchase_orders_module_1.PurchaseOrdersModule,
            inventory_module_1.InventoryModule,
            payroll_module_1.PayrollModule,
        ],
        controllers: [test_controller_1.TestController, health_controller_1.HealthController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map