import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { AuditService } from '../audit/audit.service'

@Injectable()
export class RecurringExpenseService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
  ) {}

  async create(companyId: string, userId: string, data: {
    vendorId?: string;
    description: string;
    memo?: string;
    amount: number;
    currency?: string;
    expenseAccountId?: string;
    frequency: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
    interval?: number;
    startDate: string;
    endDate?: string;
  }) {
    const nextDate = this.calculateNextExecutionDate(new Date(data.startDate), data.frequency, data.interval || 1)

    return this.prisma.recurringExpense.create({
      data: {
        companyId,
        vendorId: data.vendorId,
        description: data.description,
        memo: data.memo,
        amount: data.amount,
        currency: data.currency || 'USD',
        expenseAccountId: data.expenseAccountId,
        frequency: data.frequency,
        interval: data.interval || 1,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        nextExecutionDate: nextDate,
        createdBy: userId,
      },
      include: {
        vendor: { select: { contactId: true, contact: { select: { displayName: true } } } },
        creator: { select: { id: true, name: true } },
      },
    })
  }

  async update(companyId: string, id: string, userId: string, data: Partial<{
    vendorId?: string;
    description: string;
    memo?: string;
    amount: number;
    currency: string;
    expenseAccountId?: string;
    frequency: string;
    interval: number;
    startDate: string;
    endDate?: string;
    status: string;
  }>) {
    const existing = await this.prisma.recurringExpense.findFirst({
      where: { id, companyId },
    })
    if (!existing) throw new NotFoundException('Recurring expense not found')
    if (['CANCELLED', 'COMPLETED'].includes(existing.status)) {
      throw new BadRequestException(`Cannot update a ${existing.status} recurring expense`)
    }

    const updateData: any = { ...data }
    if (data.startDate) updateData.startDate = new Date(data.startDate)
    if (data.endDate) updateData.endDate = new Date(data.endDate)
    if (data.frequency) {
      updateData.nextExecutionDate = this.calculateNextExecutionDate(
        new Date(),
        data.frequency,
        data.interval || existing.interval,
      )
    }

    const updated = await this.prisma.recurringExpense.update({
      where: { id },
      data: updateData,
      include: {
        vendor: { select: { contactId: true, contact: { select: { displayName: true } } } },
      },
    })

    const workspaceId = await this.getWorkspaceId(companyId)
    this.auditService.log({
      workspaceId,
      companyId,
      userId,
      entityType: 'RecurringExpense',
      entityId: id,
      action: 'UPDATED',
      oldValue: { status: existing.status, amount: String(existing.amount) },
      newValue: { status: updated.status, amount: String(updated.amount) },
    }).catch(() => {})

    return updated
  }

  async cancel(companyId: string, id: string, userId: string) {
    const existing = await this.prisma.recurringExpense.findFirst({
      where: { id, companyId, status: 'ACTIVE' },
    })
    if (!existing) throw new NotFoundException('Active recurring expense not found')

    const updated = await this.prisma.recurringExpense.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })

    const workspaceId = await this.getWorkspaceId(companyId)
    this.auditService.log({
      workspaceId,
      companyId,
      userId,
      entityType: 'RecurringExpense',
      entityId: id,
      action: 'CANCELLED',
      oldValue: { status: existing.status },
      newValue: { status: 'CANCELLED' },
    }).catch(() => {})

    return updated
  }

  async list(companyId: string, filters?: {
    status?: string;
    vendorId?: string;
    skip?: number;
    take?: number;
  }) {
    const where: any = { companyId }
    if (filters?.status) where.status = filters.status
    if (filters?.vendorId) where.vendorId = filters.vendorId

    const [items, total] = await Promise.all([
      this.prisma.recurringExpense.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          vendor: { select: { contactId: true, contact: { select: { displayName: true } } } },
        },
        skip: filters?.skip || 0,
        take: Math.min(filters?.take || 50, 100),
      }),
      this.prisma.recurringExpense.count({ where }),
    ])

    return { items, total }
  }

  async getById(companyId: string, id: string) {
    const item = await this.prisma.recurringExpense.findFirst({
      where: { id, companyId },
      include: {
        vendor: { select: { contactId: true, contact: { select: { displayName: true } } } },
        creator: { select: { id: true, name: true } },
        generatedExpenses: {
          orderBy: { submittedAt: 'desc' },
          take: 10,
        },
      },
    })
    if (!item) throw new NotFoundException('Recurring expense not found')
    return item
  }

  private async getWorkspaceId(companyId: string) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId }, select: { workspaceId: true } })
    if (!company) throw new NotFoundException('Company not found')
    return company.workspaceId
  }

  private calculateNextExecutionDate(from: Date, frequency: string, interval: number): Date {
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
