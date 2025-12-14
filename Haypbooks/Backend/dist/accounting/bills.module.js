"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillsModule = void 0;
const common_1 = require("@nestjs/common");
const bills_service_1 = require("./bills.service");
const bills_controller_1 = require("./bills.controller");
const prisma_repositories_module_1 = require("../repositories/prisma/prisma-repositories.module");
let BillsModule = class BillsModule {
};
exports.BillsModule = BillsModule;
exports.BillsModule = BillsModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_repositories_module_1.PrismaRepositoriesModule],
        providers: [bills_service_1.BillsService],
        controllers: [bills_controller_1.BillsController],
        exports: [bills_service_1.BillsService],
    })
], BillsModule);
//# sourceMappingURL=bills.module.js.map