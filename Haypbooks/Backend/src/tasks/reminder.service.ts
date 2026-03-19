import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { MailService } from '../common/mail.service'

@Injectable()
export class ReminderService implements OnModuleInit, OnModuleDestroy {
  private timer: NodeJS.Timeout | null = null
  private readonly logger = new Logger(ReminderService.name)
  constructor(private readonly prisma: PrismaService, private readonly mailService: MailService) {}

  async checkReminders() {
    const now = new Date()
    const tasks = await this.prisma.task.findMany({
      where: { remindAt: { lte: now }, reminderSent: false },
      include: {
        creator: { select: { email: true } },
        assignee: { select: { user: { select: { email: true } } } },
      },
    })
    for (const t of tasks) {
      try {
        // send email reminder
        const subject = `Reminder: ${t.title}`
        const link = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/tasks/${t.id}`
        const html = `<p>You asked to be reminded about the task <strong>${t.title}</strong>.</p><p><a href="${link}">View task</a></p>`
        const text = `You asked to be reminded about the task ${t.title}. View: ${link}`
        const recipientEmail = (t as any).assignee?.user?.email || t.creator?.email || ''
        if (recipientEmail) {
          await this.mailService.sendEmail(recipientEmail, subject, html, text)
          this.logger.log(`Reminder sent for task ${t.id}`)
        }
        await this.prisma.task.update({ where: { id: t.id }, data: { reminderSent: true } })
      } catch (e) {
        this.logger.error('Failed to send reminder or mark sent', e as any)
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
