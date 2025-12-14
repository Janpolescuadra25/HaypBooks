import { Injectable } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async createTask(tenantId: string, payload: any) {
    return this.prisma.task.create({ data: { ...payload, tenantId } })
  }

  async listTasks(tenantId: string, opts: any = {}) {
    const where: any = { tenantId }
    if (opts.assigneeId) where.assigneeId = opts.assigneeId
    if (opts.status) where.status = opts.status
    if (opts.priority) where.priority = opts.priority
    return this.prisma.task.findMany({ where, orderBy: { dueDate: 'asc' } })
  }

  async getTask(tenantId: string, id: string) {
    return this.prisma.task.findFirst({ where: { id, tenantId }, include: { comments: true } })
  }

  async updateTask(tenantId: string, id: string, payload: any) {
    // Handle archived flag specially to set archivedAt timestamp
    const data: any = { ...payload }
    if (typeof payload.archived === 'boolean') {
      data.archivedAt = payload.archived ? new Date() : null
      delete data.archived
    }
    return this.prisma.task.updateMany({ where: { id, tenantId }, data })
  }

  async addComment(tenantId: string, taskId: string, userId: string, comment: string) {
    // ensure task belongs to tenant
    const task = await this.prisma.task.findFirst({ where: { id: taskId, tenantId } })
    if (!task) throw new Error('Not found')
    return this.prisma.taskComment.create({ data: { taskId, userId, comment } })
  }

  async markReminderSent(taskId: string) {
    return this.prisma.task.update({ where: { id: taskId }, data: { reminderSent: true } })
  }
}
