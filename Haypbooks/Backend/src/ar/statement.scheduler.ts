import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { MailService } from '../common/mail.service'
import { ArService } from './ar.service'
import { AuditService } from '../audit/audit.service'

@Injectable()
export class StatementScheduler {
  private readonly logger = new Logger(StatementScheduler.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly arService: ArService,
    private readonly auditService: AuditService,
  ) {}

  @Cron('0 2 * * *', {
    name: 'send-scheduled-statements',
    timeZone: 'UTC',
  })
  async handleScheduledStatements() {
    this.logger.log('Starting scheduled statement run...')

    try {
      await this.runDueSchedules()
    } catch (err) {
      this.logger.error(`Scheduled statement run failed: ${err?.message ?? err}`)
      throw err
    }
  }

  private async runDueSchedules() {
    const dueSchedules = await this.prisma.statementSchedule.findMany({
      where: {
        isActive: true,
        nextRunDate: { lte: new Date() },
      },
      include: {
        customer: {
          include: {
            contact: {
              include: {
                contactEmails: true,
              },
            },
          },
        },
        company: {
          include: {
            settings: true,
          },
        },
      },
    })

    if (dueSchedules.length === 0) {
      this.logger.log('No due statement schedules found.')
      return
    }

    let sent = 0
    let failed = 0

    for (const schedule of dueSchedules) {
      try {
        const primaryEmail = schedule.customer.contact?.contactEmails.find((e) => e.isPrimary)?.email
        if (!primaryEmail) {
          this.logger.warn(`No primary email for customer ${schedule.customerId}, skipping.`)
          failed++
          continue
        }

        const settings = schedule.company.settings
        if (!settings?.statementEmailEnabled) {
          this.logger.warn(`Statement emails disabled for company ${schedule.companyId}, skipping.`)
          failed++
          continue
        }

        const now = new Date()
        const data = await this.arService.generateStatementData(
          schedule.companyId,
          schedule.customerId,
          now,
        )

        const html = this.mailService.buildStatementEmailHtml(
          data.customerName,
          schedule.company.name,
          data,
        )
        const text = this.mailService.buildStatementEmailText(
          data.customerName,
          schedule.company.name,
          data,
        )

        await this.mailService.sendEmail(
          primaryEmail,
          `Your Account Statement from ${schedule.company.name}`,
          html,
          text,
        )

        const customerStatement = await this.prisma.customerStatement.create({
          data: {
            workspaceId: schedule.company.workspaceId,
            companyId: schedule.companyId,
            customerId: schedule.customerId,
            periodStart: new Date(now.getFullYear(), now.getMonth(), 1),
            periodEnd: now,
          },
        })

        await this.auditService.log({
          workspaceId: schedule.company.workspaceId,
          companyId: schedule.companyId,
          userId: schedule.createdBy,
          entityType: 'CustomerStatement',
          entityId: customerStatement.id,
          action: 'CREATED',
          newValue: {
            source: 'statement_scheduler',
            statementScheduleId: schedule.id,
            customerName: data.customerName,
            asOf: data.asOf,
            lineCount: data.lines.length,
            totalDue: String(data.totals.net),
          },
        }).catch(() => {})

        const nextRunDate = this.calculateNextRunDate(schedule.frequency, schedule.dayOfMonth)
        await this.prisma.statementSchedule.update({
          where: { id: schedule.id },
          data: {
            lastSentAt: now,
            nextRunDate,
          },
        })

        sent++
        this.logger.log(`Statement sent to ${primaryEmail} for customer ${schedule.customerId}.`)
      } catch (err) {
        failed++
        this.logger.error(`Failed to send statement for schedule ${schedule.id}: ${err?.message ?? err}`)
        this.auditService.log({
          workspaceId: schedule.company.workspaceId,
          companyId: schedule.companyId,
          userId: schedule.createdBy,
          entityType: 'StatementSchedule',
          entityId: schedule.id,
          action: 'ERROR',
          newValue: {
            source: 'statement_scheduler',
            error: err instanceof Error ? err.message : String(err),
          },
        }).catch(() => {})
      }
    }

    this.logger.log(`Scheduled statement run complete. Sent: ${sent}, Failed: ${failed}.`)
  }

  private calculateNextRunDate(frequency: string, dayOfMonth: number): Date {
    const day = Math.min(Math.max(dayOfMonth, 1), 28)
    if (day !== dayOfMonth) {
      this.logger.warn(`dayOfMonth ${dayOfMonth} is out of range, clamped to ${day}`)
    }

    const next = new Date()
    switch (frequency) {
      case 'DAILY':
        next.setDate(next.getDate() + 1)
        break
      case 'WEEKLY':
        next.setDate(next.getDate() + 7)
        break
      case 'MONTHLY':
        next.setMonth(next.getMonth() + 1)
        next.setDate(day)
        break
      case 'QUARTERLY':
        next.setMonth(next.getMonth() + 3)
        next.setDate(day)
        break
      default:
        next.setMonth(next.getMonth() + 1)
        next.setDate(day)
        break
    }
    return next
  }
}
