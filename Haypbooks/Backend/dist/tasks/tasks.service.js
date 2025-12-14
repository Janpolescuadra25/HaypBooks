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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../repositories/prisma/prisma.service");
let TasksService = class TasksService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createTask(tenantId, payload) {
        return this.prisma.task.create({ data: { ...payload, tenantId } });
    }
    async listTasks(tenantId, opts = {}) {
        const where = { tenantId };
        if (opts.assigneeId)
            where.assigneeId = opts.assigneeId;
        if (opts.status)
            where.status = opts.status;
        if (opts.priority)
            where.priority = opts.priority;
        return this.prisma.task.findMany({ where, orderBy: { dueDate: 'asc' } });
    }
    async getTask(tenantId, id) {
        return this.prisma.task.findFirst({ where: { id, tenantId }, include: { comments: true } });
    }
    async updateTask(tenantId, id, payload) {
        return this.prisma.task.updateMany({ where: { id, tenantId }, data: payload });
    }
    async addComment(tenantId, taskId, userId, comment) {
        const task = await this.prisma.task.findFirst({ where: { id: taskId, tenantId } });
        if (!task)
            throw new Error('Not found');
        return this.prisma.taskComment.create({ data: { taskId, userId, comment } });
    }
    async markReminderSent(taskId) {
        return this.prisma.task.update({ where: { id: taskId }, data: { reminderSent: true } });
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TasksService);
//# sourceMappingURL=tasks.service.js.map