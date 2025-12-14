import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class ReminderService implements OnModuleInit, OnModuleDestroy {
  private timer: NodeJS.Timeout | null = null
  private readonly logger = new Logger(ReminderService.name)
  constructor(private readonly prisma: PrismaService) {}

  async checkReminders() {
    const now = new Date()
    const tasks = await this.prisma.task.findMany({ where: { remindAt: { lte: now }, reminderSent: false } })
    for (const t of tasks) {
      try {
        // TODO: Hook into real mailer. For now, just log and mark as sent.
        this.logger.log(`Reminder for task ${t.id} (${t.title})`)
        await this.prisma.task.update({ where: { id: t.id }, data: { reminderSent: true } })
      } catch (e) {
        this.logger.error('Failed to mark reminder sent', e as any)
      }
    }
  }

  onModuleInit() {
    // Run every minute
    this.timer = setInterval(() => { void this.checkReminders() }, 60 * 1000)
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer)
  }
}
