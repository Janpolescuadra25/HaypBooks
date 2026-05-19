import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { AuditService } from '../audit/audit.service'

@Injectable()
export class RecurringExpenseScheduler {
  private readonly logger = new Logger(RecurringExpenseScheduler.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  @Cron('0 2 * * *', {
    name: 'generate-recurring-expenses',
    timeZone: 'UTC',
  })
  async generateRecurringExpenses() {
    this.logger.log('Starting recurring expense generation...')

    const now = new Date()
    let generated = 0
    let errors = 0

    try {
      const due = await this.prisma.recurringExpense.findMany({
        where: {
          status: 'ACTIVE',
          nextExecutionDate: { lte: now },
        },
      })

      this.logger.log(`Found ${due.length} recurring expenses due for generation`)

      for (const recurring of due) {
        try {
          if (recurring.endDate && recurring.endDate < now) {
            await this.prisma.recurringExpense.update({
              where: { id: recurring.id },
              data: { status: 'COMPLETED' },
            })
            this.logger.log(`Recurring expense ${recurring.id} ended (endDate reached)`)
            continue
          }

          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const existingGeneration = await this.prisma.expenseClaim.findFirst({
            where: {
              recurringExpenseId: recurring.id,
              fromDate: { gte: today },
            },
          })
          if (existingGeneration) {
            this.logger.log(`Skipping ${recurring.id} — already generated today`)
            continue
          }

          const company = await this.prisma.company.findUnique({
            where: { id: recurring.companyId },
            select: { workspaceId: true },
          })
          if (!company?.workspaceId) {
            throw new Error(`Workspace not found for company ${recurring.companyId}`)
          }

          const employee = await this.prisma.employee.findFirst({
            where: { companyId: recurring.companyId, deletedAt: null },
          })
          if (!employee) {
            throw new Error(`No active employee found for company ${recurring.companyId}`)
          }

          const expenseClaim = await this.prisma.expenseClaim.create({
            data: {
              workspaceId: company.workspaceId,
              companyId: recurring.companyId,
              employeeId: employee.id,
              description: recurring.description,
              notes: recurring.memo ? `[Auto-generated] ${recurring.memo}` : '[Auto-generated from recurring expense]',
              fromDate: now,
              toDate: now,
              totalAmount: recurring.amount,
              submittedAt: null,
              approvedAt: null,
              reimbursedAt: null,
              recurringExpenseId: recurring.id,
            },
          })

          const nextDate = this.calculateNextDate(
            recurring.nextExecutionDate ?? now,
            recurring.frequency,
            recurring.interval,
          )

          await this.prisma.recurringExpense.update({
            where: { id: recurring.id },
            data: {
              lastExecutionDate: now,
              nextExecutionDate: nextDate,
            },
          })

          this.auditService.log({
            workspaceId: company.workspaceId,
            companyId: recurring.companyId,
            userId: recurring.createdBy,
            entityType: 'ExpenseClaim',
            entityId: expenseClaim.id,
            action: 'CREATED',
            newValue: {
              source: 'recurring_expense',
              recurringExpenseId: recurring.id,
              amount: String(recurring.amount),
              description: recurring.description,
            },
          }).catch(() => {})

          generated++
        } catch (err) {
          errors++
          this.logger.error(`Failed to generate expense from recurring ${recurring.id}:`, err)
        }
      }
    } catch (err) {
      this.logger.error('Recurring expense generation failed:', err)
    }

    this.logger.log(`Recurring expense generation complete: ${generated} generated, ${errors} errors`)
    return { generated, errors }
  }

  private calculateNextDate(from: Date, frequency: string, interval: number): Date {
    const next = new Date(from)
    switch (frequency) {
      case 'WEEKLY':
        next.setDate(next.getDate() + (7 * interval))
        break
      case 'BIWEEKLY':
        next.setDate(next.getDate() + (14 * interval))
        break
      case 'MONTHLY':
        next.setMonth(next.getMonth() + interval)
        break
      case 'QUARTERLY':
        next.setMonth(next.getMonth() + (3 * interval))
        break
      case 'YEARLY':
        next.setFullYear(next.getFullYear() + interval)
        break
      default:
        next.setMonth(next.getMonth() + interval)
    }
    return next
  }
}
