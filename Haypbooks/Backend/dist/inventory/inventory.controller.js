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
exports.InventoryController = void 0;
const common_1 = require("@nestjs/common");
const inventory_service_1 = require("./inventory.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let InventoryController = class InventoryController {
    constructor(service) {
        this.service = service;
    }
    async createItem(req, payload) {
        const tenantId = payload.tenantId || req.user?.tenantId;
        return this.service.createItem(tenantId, payload);
    }
    async getItem(id) {
        return this.service.getItem(id);
    }
    async listItems(req, query) {
        const tenantId = query.tenantId || req.user?.tenantId;
        return this.service.listItems(tenantId, query);
    }
    async createLocation(req, payload) {
        const tenantId = payload.tenantId || req.user?.tenantId;
        return this.service.createStockLocation(tenantId, payload);
    }
    async receive(req, payload) {
        const tenantId = payload.tenantId || req.user?.tenantId;
        return this.service.receiveStock(tenantId, payload);
    }
    async ship(req, payload) {
        const tenantId = payload.tenantId || req.user?.tenantId;
        return this.service.shipStock(tenantId, payload);
    }
    async transfer(req, payload) {
        const tenantId = payload.tenantId || req.user?.tenantId;
        return this.service.transferStock(tenantId, payload);
    }
    async adjust(req, payload) {
        const tenantId = payload.tenantId || req.user?.tenantId;
        return this.service.adjustStock(tenantId, payload);
    }
};
exports.InventoryController = InventoryController;
__decorate([
    (0, common_1.Post)('items'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createItem", null);
__decorate([
    (0, common_1.Get)('items/:id'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "getItem", null);
__decorate([
    (0, common_1.Get)('items'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "listItems", null);
__decorate([
    (0, common_1.Post)('locations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "createLocation", null);
__decorate([
    (0, common_1.Post)('receive'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "receive", null);
__decorate([
    (0, common_1.Post)('ship'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "ship", null);
__decorate([
    (0, common_1.Post)('transfer'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "transfer", null);
__decorate([
    (0, common_1.Post)('adjust'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InventoryController.prototype, "adjust", null);
exports.InventoryController = InventoryController = __decorate([
    (0, common_1.Controller)('api/inventory'),
    __metadata("design:paramtypes", [inventory_service_1.InventoryService])
], InventoryController);
//# sourceMappingURL=inventory.controller.js.map