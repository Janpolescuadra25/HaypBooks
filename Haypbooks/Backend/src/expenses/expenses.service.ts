import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { ApService } from '../ap/ap.service'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class ExpensesService {
  constructor(private readonly apService: ApService, private readonly prisma: PrismaService) {}

  private async getWorkspaceId(companyId: string) {
    const company = await this.prisma.company.findUnique({ where: { id: companyId }, select: { workspaceId: true } })
    if (!company) throw new NotFoundException('Company not found')
    return company.workspaceId
  }

  private async assertAccess(userId: string, companyId: string) {
    const member = await this.prisma.workspaceUser.findFirst({
      where: {
        status: 'ACTIVE',
        userId,
        workspace: { companies: { some: { id: companyId } } },
      },
    })
    if (!member) throw new ForbiddenException('Access denied')
  }

  async listVendors(userId: string, companyId: string, query: any) {
    return this.apService.listVendors(userId, companyId, query)
  }

  async createVendor(userId: string, companyId: string, data: any) {
    return this.apService.createVendor(userId, companyId, data)
  }

  async listBills(userId: string, companyId: string, query: any) {
    return this.apService.listBills(userId, companyId, query)
  }

  async createBill(userId: string, companyId: string, data: any) {
    return this.apService.createBill(userId, companyId, data)
  }

  async listBillPayments(userId: string, companyId: string, query: any) {
    return this.apService.listBillPayments(userId, companyId, query)
  }

  async recordBillPayment(userId: string, companyId: string, data: any) {
    return this.apService.recordBillPayment(userId, companyId, data)
  }

  async listReimbursements(userId: string, companyId: string, query: any) {
    await this.assertAccess(userId, companyId)
    const where: any = { companyId }
    if (query?.status) where.status = query.status
    const reimbursements = await this.prisma.expenseClaim.findMany({
      where,
      include: { employee: { select: { id: true, firstName: true, lastName: true } }, lines: true },
      orderBy: { submittedAt: 'desc' },
      take: query?.limit ? parseInt(query.limit, 10) : 100,
      skip: query?.offset ? parseInt(query.offset, 10) : 0,
    })
    return reimbursements.map((record) => ({
      ...record,
      totalAmount: Number(record.totalAmount ?? 0),
      employeeName: record.employee ? `${record.employee.firstName} ${record.employee.lastName}`.trim() : '',
      submittedAt: record.submittedAt?.toISOString(),
      approvedAt: record.approvedAt?.toISOString(),
      reimbursedAt: record.reimbursedAt?.toISOString(),
    }))
  }

  async getReimbursement(userId: string, companyId: string, reimbursementId: string) {
    await this.assertAccess(userId, companyId)
    const record = await this.prisma.expenseClaim.findFirst({
      where: { id: reimbursementId, companyId },
      include: { employee: { select: { id: true, firstName: true, lastName: true } }, lines: true },
    })
    if (!record) throw new NotFoundException('Reimbursement not found')
    return {
      ...record,
      totalAmount: Number(record.totalAmount ?? 0),
      employeeName: record.employee ? `${record.employee.firstName} ${record.employee.lastName}`.trim() : '',
      submittedAt: record.submittedAt?.toISOString(),
      approvedAt: record.approvedAt?.toISOString(),
      reimbursedAt: record.reimbursedAt?.toISOString(),
    }
  }

  async createReimbursement(userId: string, companyId: string, data: any) {
    await this.assertAccess(userId, companyId)
    const workspaceId = await this.getWorkspaceId(companyId)
    const lines = Array.isArray(data.lines) ? data.lines : []
    if (!lines.length) throw new BadRequestException('At least one reimbursement line is required')
    const totalAmount = lines.reduce((sum: number, item: any) => sum + Number(item.amount ?? 0), 0)
    return this.prisma.expenseClaim.create({
      data: {
        workspaceId,
        companyId,
        employeeId: data.employeeId,
        reimbursementMethod: data.paymentMethod,
        status: data.status ?? 'DRAFT',
        description: data.description ?? null,
        totalAmount,
        submittedAt: data.status === 'SUBMITTED' ? new Date() : null,
        approvedAt: data.status === 'APPROVED' ? new Date() : null,
        reimbursedAt: data.status === 'PAID' ? new Date() : null,
        lines: {
          create: lines.map((line: any) => ({
            date: line.date ? new Date(line.date) : new Date(),
            description: line.description ?? '',
            amount: Number(line.amount ?? 0),
            accountId: line.accountId ?? null,
            merchant: line.category ?? null,
            subCategoryId: line.subCategoryId ?? null,
          })),
        },
      },
      include: { lines: true },
    })
  }

  async updateReimbursement(userId: string, companyId: string, reimbursementId: string, data: any) {
    await this.assertAccess(userId, companyId)
    const record = await this.prisma.expenseClaim.findFirst({ where: { id: reimbursementId, companyId } })
    if (!record) throw new NotFoundException('Reimbursement not found')
    if (!['DRAFT', 'REJECTED'].includes(record.status)) {
      throw new BadRequestException('Only draft or rejected reimbursements can be updated')
    }
    const lines = Array.isArray(data.lines) ? data.lines : null
    const totalAmount = lines ? lines.reduce((sum: number, item: any) => sum + Number(item.amount ?? 0), 0) : Number(record.totalAmount)
    return this.prisma.$transaction(async (tx) => {
      if (lines) {
        await tx.expenseClaimLine.deleteMany({ where: { expenseClaimId: reimbursementId } })
      }
      return tx.expenseClaim.update({
        where: { id: reimbursementId },
        data: {
          employeeId: data.employeeId ?? record.employeeId,
          reimbursementMethod: data.paymentMethod ?? record.reimbursementMethod,
          description: data.description ?? record.description,
          totalAmount,
          status: data.status ?? record.status,
          submittedAt: data.status === 'SUBMITTED' ? new Date() : record.submittedAt,
          approvedAt: data.status === 'APPROVED' ? new Date() : record.approvedAt,
          reimbursedAt: data.status === 'PAID' ? new Date() : record.reimbursedAt,
          ...(lines ? {
            lines: {
              create: lines.map((line: any) => ({
                date: line.date ? new Date(line.date) : new Date(),
                description: line.description ?? '',
                amount: Number(line.amount ?? 0),
                accountId: line.accountId ?? null,
                merchant: line.category ?? null,
                subCategoryId: line.subCategoryId ?? null,
              })),
            },
          } : {}),
        },
        include: { lines: true },
      })
    })
  }

  async updateExpenseReport(userId: string, companyId: string, expenseId: string, data: any) {
    await this.assertAccess(userId, companyId)
    const record = await this.prisma.expenseClaim.findFirst({ where: { id: expenseId, companyId } })
    if (!record) throw new NotFoundException('Expense report not found')
    if (!['DRAFT', 'SUBMITTED', 'REJECTED'].includes(record.status)) {
      throw new BadRequestException('Only draft, submitted, or rejected reports can be updated')
    }
    const updateData: any = {}
    if (data.status) {
      updateData.status = data.status
      if (data.status === 'REJECTED') updateData.approvedAt = null
      if (data.status === 'APPROVED') updateData.approvedAt = new Date()
    }
    return this.prisma.expenseClaim.update({ where: { id: expenseId }, data: updateData })
  }
}
