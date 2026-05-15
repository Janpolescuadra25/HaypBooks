import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { ApService } from '../ap/ap.service'
import { AttachmentsService } from '../attachments/attachments.service'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { SubLedgerService } from '../shared/sub-ledger.service'
import { ExpensePolicyService } from './expense-policy.service'

@Injectable()
export class ExpensesService {
  constructor(
    private readonly apService: ApService,
    private readonly prisma: PrismaService,
    private readonly attachmentsService: AttachmentsService,
    private readonly subLedgerService: SubLedgerService,
    private readonly expensePolicyService: ExpensePolicyService,
  ) {}

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
      fromDate: record.fromDate?.toISOString(),
      toDate: record.toDate?.toISOString(),
      advancePayment: Number(record.advancePayment ?? 0),
    }))
  }

  async getReimbursement(userId: string, companyId: string, reimbursementId: string) {
    await this.assertAccess(userId, companyId)
    const record = await this.prisma.expenseClaim.findFirst({ where: { id: reimbursementId, companyId }, include: { employee: { select: { id: true, firstName: true, lastName: true } }, lines: true } })
    if (!record) throw new NotFoundException('Reimbursement not found')
    return {
      ...record,
      totalAmount: Number(record.totalAmount ?? 0),
      employeeName: record.employee ? `${record.employee.firstName} ${record.employee.lastName}`.trim() : '',
      submittedAt: record.submittedAt?.toISOString(),
      approvedAt: record.approvedAt?.toISOString(),
      reimbursedAt: record.reimbursedAt?.toISOString(),
      fromDate: record.fromDate?.toISOString(),
      toDate: record.toDate?.toISOString(),
      advancePayment: Number(record.advancePayment ?? 0),
    }
  }

  async createReimbursement(userId: string, companyId: string, data: any) {
    await this.assertAccess(userId, companyId)
    const workspaceId = await this.getWorkspaceId(companyId)
    if (!data.employeeId) throw new BadRequestException('employeeId is required')
    const lines = Array.isArray(data.lines) ? data.lines : []
    if (!lines.length) throw new BadRequestException('At least one reimbursement line is required')
    const totalAmount = lines.reduce((sum: number, item: any) => sum + Number(item.amount ?? 0), 0)
    const validationLines = lines.map((line: any) => ({
      category: line.category ?? null,
      amount: Number(line.amount ?? 0),
      receiptUrl: line.receiptUrl ?? null,
      date: line.date ? new Date(line.date) : new Date(),
    }))
    const validationMode = data.status === 'APPROVED' || data.status === 'PAID' ? 'approve' : 'create'
    const policyViolations = await this.expensePolicyService.validateExpenseAgainstPolicy(companyId, {
      lines: validationLines,
      submittedAt: new Date(),
    }, validationMode)
    if (policyViolations.length) {
      throw new BadRequestException(policyViolations)
    }

    const record = await this.prisma.expenseClaim.create({
      data: {
        workspaceId,
        companyId,
        employeeId: data.employeeId,
        departmentId: data.departmentId ?? null,
        reimbursementMethod: data.paymentMethod,
        status: data.status ?? 'DRAFT',
        description: data.description ?? null,
        businessPurpose: data.businessPurpose ?? null,
        notes: data.notes ?? null,
        internalNotes: data.internalNotes ?? null,
        fromDate: data.fromDate ? new Date(data.fromDate) : null,
        toDate: data.toDate ? new Date(data.toDate) : null,
        advancePayment: data.advancePayment != null ? Number(data.advancePayment) : null,
        totalAmount,
        submittedAt: ['SUBMITTED', 'APPROVED', 'PAID'].includes(data.status) ? new Date() : null,
        approvedAt: ['APPROVED', 'PAID'].includes(data.status) ? new Date() : null,
        reimbursedAt: data.status === 'PAID' ? new Date() : null,
        lines: {
          create: lines.map((line: any) => ({
            date: line.date ? new Date(line.date) : new Date(),
            category: line.category ?? null,
            description: line.description ?? '',
            merchant: line.vendor ?? line.merchant ?? null,
            amount: Number(line.amount ?? 0),
            accountId: line.accountId ?? null,
            receiptUrl: line.receiptUrl ?? null,
            receiptName: line.receiptName ?? null,
            subCategoryId: line.subCategoryId ?? null,
          })),
        },
      },
      include: { lines: true },
    })

    const attachments = Array.isArray(data.attachments) ? data.attachments : []
    if (attachments.length) {
      await Promise.all(
        attachments.map((attachment: any) =>
          this.attachmentsService.create({
            workspaceId,
            entityType: 'expenseClaim',
            entityId: record.id,
            fileUrl: attachment.fileUrl,
            fileName: attachment.fileName || attachment.fileName || null,
            mimeType: attachment.mimeType ?? null,
            fileSize: attachment.fileSize ?? null,
            uploadedById: userId,
          }),
        ),
      )
    }

    return record
  }

  async createExpenseReport(userId: string, companyId: string, data: any) {
    return this.createReimbursement(userId, companyId, { ...data, status: data.status ?? 'DRAFT' })
  }

  async submitExpenseReport(userId: string, companyId: string, expenseId: string) {
    await this.assertAccess(userId, companyId)
    const record = await this.prisma.expenseClaim.findFirst({ where: { id: expenseId, companyId }, include: { lines: true } })
    if (!record) throw new NotFoundException('Expense report not found')
    if (record.status !== 'DRAFT' && record.status !== 'REJECTED') {
      throw new BadRequestException('Only draft or rejected reports can be submitted')
    }

    const validationLines = (record.lines as any[]).map((line) => ({
      category: line.category ?? null,
      amount: Number(line.amount ?? 0),
      receiptUrl: line.receiptUrl ?? null,
      date: line.date ? new Date(line.date) : new Date(),
    }))
    const policyViolations = await this.expensePolicyService.validateExpenseAgainstPolicy(companyId, {
      lines: validationLines,
      submittedAt: new Date(),
    }, 'create')
    if (policyViolations.length) {
      throw new BadRequestException(policyViolations)
    }

    return this.prisma.expenseClaim.update({
      where: { id: expenseId },
      data: { status: 'SUBMITTED', submittedAt: new Date() },
    })
  }

  async approveExpenseReport(userId: string, companyId: string, expenseId: string) {
    await this.assertAccess(userId, companyId)
    const record = await this.prisma.expenseClaim.findFirst({ where: { id: expenseId, companyId }, include: { lines: true } })
    if (!record) throw new NotFoundException('Expense report not found')
    if (record.status !== 'SUBMITTED') {
      throw new BadRequestException('Only submitted reports can be approved')
    }

    const validationLines = (record.lines as any[]).map((line) => ({
      category: line.category ?? null,
      amount: Number(line.amount ?? 0),
      receiptUrl: line.receiptUrl ?? null,
      date: line.date ? new Date(line.date) : new Date(),
    }))
    const policyViolations = await this.expensePolicyService.validateExpenseAgainstPolicy(companyId, {
      lines: validationLines,
      submittedAt: record.submittedAt ? new Date(record.submittedAt) : new Date(),
    }, 'approve')
    if (policyViolations.length) {
      throw new BadRequestException(policyViolations)
    }

    const workspaceId = (record as any).workspaceId
    const updated = workspaceId
      ? await this.prisma.$transaction(async (tx) => {
          const updatedRecord = await tx.expenseClaim.update({
            where: { id: expenseId },
            data: { status: 'APPROVED', approvedAt: new Date() },
          })
          await this.subLedgerService.postExpenseClaimToGL(
            {
              companyId,
              workspaceId,
              expenseClaimId: expenseId,
              lines: (record.lines as any[]).map((l) => ({ accountId: l.accountId ?? null, amount: Number(l.amount ?? 0) })),
              totalAmount: Number(record.totalAmount ?? 0),
              employeeId: record.employeeId ?? null,
            },
            tx,
          )
          return updatedRecord
        })
      : await this.prisma.expenseClaim.update({
          where: { id: expenseId },
          data: { status: 'APPROVED', approvedAt: new Date() },
        })

    await this.prisma.auditLog.create({
      data: { workspaceId: workspaceId ?? null, companyId, userId, action: 'UPDATE', tableName: 'ExpenseClaim', recordId: expenseId, changes: { status: 'APPROVED', approvedAt: new Date().toISOString() } },
    }).catch(() => { /* non-critical */ })

    return updated
  }

  async reimburseExpenseReport(userId: string, companyId: string, expenseId: string, data: any) {
    await this.assertAccess(userId, companyId)
    const record = await this.prisma.expenseClaim.findFirst({ where: { id: expenseId, companyId } })
    if (!record) throw new NotFoundException('Expense report not found')
    if (record.status !== 'APPROVED') {
      throw new BadRequestException('Only approved reports can be reimbursed')
    }

    const workspaceId = (record as any).workspaceId
    const updated = workspaceId
      ? await this.prisma.$transaction(async (tx) => {
          const updatedRecord = await tx.expenseClaim.update({
            where: { id: expenseId },
            data: {
              status: 'PAID',
              reimbursedAt: new Date(),
              reimbursementMethod: data?.method ?? record.reimbursementMethod,
            },
          })
          await this.subLedgerService.postExpenseReimbursementToGL(
            {
              companyId,
              workspaceId,
              expenseClaimId: expenseId,
              amount: Number(record.totalAmount ?? 0),
              bankAccountId: data?.bankAccountId ?? null,
            },
            tx,
          )
          return updatedRecord
        })
      : await this.prisma.expenseClaim.update({
          where: { id: expenseId },
          data: {
            status: 'PAID',
            reimbursedAt: new Date(),
            reimbursementMethod: data?.method ?? record.reimbursementMethod,
          },
        })

    await this.prisma.auditLog.create({
      data: { workspaceId: workspaceId ?? null, companyId, userId, action: 'UPDATE', tableName: 'ExpenseClaim', recordId: expenseId, changes: { status: 'PAID', reimbursedAt: new Date().toISOString(), reimbursementMethod: data?.method ?? record.reimbursementMethod } },
    }).catch(() => { /* non-critical */ })

    return updated
  }

  async listExpenseReports(userId: string, companyId: string, query: any) {
    return this.listReimbursements(userId, companyId, query)
  }

  async getExpenseReport(userId: string, companyId: string, expenseId: string) {
    return this.getReimbursement(userId, companyId, expenseId)
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
          departmentId: data.departmentId ?? record.departmentId,
          reimbursementMethod: data.paymentMethod ?? record.reimbursementMethod,
          description: data.description ?? record.description,
          businessPurpose: data.businessPurpose ?? record.businessPurpose,
          notes: data.notes ?? record.notes,
          internalNotes: data.internalNotes ?? record.internalNotes,
          fromDate: data.fromDate ? new Date(data.fromDate) : record.fromDate,
          toDate: data.toDate ? new Date(data.toDate) : record.toDate,
          advancePayment: data.advancePayment != null ? Number(data.advancePayment) : record.advancePayment,
          totalAmount,
          status: data.status ?? record.status,
          submittedAt: data.status === 'SUBMITTED' ? new Date() : record.submittedAt,
          approvedAt: data.status === 'APPROVED' ? new Date() : record.approvedAt,
          reimbursedAt: data.status === 'PAID' ? new Date() : record.reimbursedAt,
          ...(lines ? {
            lines: {
              create: lines.map((line: any) => ({
                date: line.date ? new Date(line.date) : new Date(),
                category: line.category ?? null,
                description: line.description ?? '',
                merchant: line.vendor ?? line.merchant ?? null,
                amount: Number(line.amount ?? 0),
                accountId: line.accountId ?? null,
                receiptUrl: line.receiptUrl ?? null,
                receiptName: line.receiptName ?? null,
                subCategoryId: line.subCategoryId ?? null,
              })),
            },
          } : {}),
        },
        include: { lines: true },
      })
    })
  }

  async deleteReimbursement(userId: string, companyId: string, id: string) {
    await this.assertAccess(userId, companyId)
    const record = await this.prisma.expenseClaim.findUnique({ where: { id } })
    if (!record || record.companyId !== companyId) throw new NotFoundException('Reimbursement not found')
    if (!['DRAFT', 'REJECTED'].includes(record.status)) {
      throw new BadRequestException('Only draft or rejected reimbursements can be deleted')
    }
    return this.prisma.expenseClaim.delete({ where: { id } })
  }

  async updateExpenseReport(userId: string, companyId: string, expenseId: string, data: any) {
    await this.assertAccess(userId, companyId)
    const record = await this.prisma.expenseClaim.findFirst({ where: { id: expenseId, companyId } })
    if (!record) throw new NotFoundException('Expense report not found')
    if (!['DRAFT', 'SUBMITTED', 'REJECTED'].includes(record.status)) {
      throw new BadRequestException('Only draft, submitted, or rejected reports can be updated')
    }
    const lines = Array.isArray(data.lines) ? data.lines : null
    const totalAmount = lines ? lines.reduce((sum: number, item: any) => sum + Number(item.amount ?? 0), 0) : Number(record.totalAmount)
    return this.prisma.$transaction(async (tx) => {
      if (lines) {
        await tx.expenseClaimLine.deleteMany({ where: { expenseClaimId: expenseId } })
      }
      const updateData: any = {
        employeeId: data.employeeId ?? record.employeeId,
        departmentId: data.departmentId ?? record.departmentId,
        reimbursementMethod: data.paymentMethod ?? record.reimbursementMethod,
        description: data.description ?? record.description,
        businessPurpose: data.businessPurpose ?? record.businessPurpose,
        notes: data.notes ?? record.notes,
        internalNotes: data.internalNotes ?? record.internalNotes,
        fromDate: data.fromDate ? new Date(data.fromDate) : record.fromDate,
        toDate: data.toDate ? new Date(data.toDate) : record.toDate,
        advancePayment: data.advancePayment != null ? Number(data.advancePayment) : record.advancePayment,
        totalAmount,
        status: data.status ?? record.status,
        submittedAt: data.status === 'SUBMITTED' ? new Date() : record.submittedAt,
        approvedAt: data.status === 'APPROVED' ? new Date() : record.approvedAt,
        reimbursedAt: data.status === 'PAID' ? new Date() : record.reimbursedAt,
      }

      if (lines) {
        updateData.lines = {
          create: lines.map((line: any) => ({
            date: line.date ? new Date(line.date) : new Date(),
            category: line.category ?? null,
            description: line.description ?? '',
            merchant: line.vendor ?? line.merchant ?? null,
            amount: Number(line.amount ?? 0),
            accountId: line.accountId ?? null,
            receiptUrl: line.receiptUrl ?? null,
            receiptName: line.receiptName ?? null,
            subCategoryId: line.subCategoryId ?? null,
          })),
        }
      }

      return tx.expenseClaim.update({ where: { id: expenseId }, data: updateData, include: { lines: true } })
    })
  }
}
