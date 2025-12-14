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
var ReminderService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReminderService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../repositories/prisma/prisma.service");
let ReminderService = ReminderService_1 = class ReminderService {
    constructor(prisma) {
        this.prisma = prisma;
        this.timer = null;
        this.logger = new common_1.Logger(ReminderService_1.name);
    }
    async checkReminders() {
        const now = new Date();
        const tasks = await this.prisma.task.findMany({ where: { remindAt: { lte: now }, reminderSent: false } });
        for (const t of tasks) {
            try {
                this.logger.log(`Reminder for task ${t.id} (${t.title})`);
                await this.prisma.task.update({ where: { id: t.id }, data: { reminderSent: true } });
            }
            catch (e) {
                this.logger.error('Failed to mark reminder sent', e);
            }
        }
    }
    onModuleInit() {
        this.timer = setInterval(() => { void this.checkReminders(); }, 60 * 1000);
    }
    onModuleDestroy() {
        if (this.timer)
            clearInterval(this.timer);
    }
};
exports.ReminderService = ReminderService;
exports.ReminderService = ReminderService = ReminderService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReminderService);
//# sourceMappingURL=reminder.service.js.map