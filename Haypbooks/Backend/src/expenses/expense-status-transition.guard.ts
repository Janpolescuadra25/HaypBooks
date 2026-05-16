import { Injectable, BadRequestException } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { SubLedgerService } from '../shared/sub-ledger.service'

type PrismaTransactionClient = Prisma.TransactionClient

@Injectable()
export class ExpenseStatusTransitionGuard {
  constructor(private readonly subLedgerService: SubLedgerService) {}

  assertValidTransition(oldStatus: string, newStatus: string) {
    const clean = (value: string) => String(value ?? '').toUpperCase()
    const oldNorm = clean(oldStatus)
    const newNorm = clean(newStatus)
    if (oldNorm === newNorm) return

    const ordered = ['DRAFT', 'SUBMITTED', 'APPROVED', 'PAID']
    const oldIndex = ordered.indexOf(oldNorm)
    const newIndex = ordered.indexOf(newNorm)

    if (oldNorm === 'PAID' && newNorm !== 'PAID') {
      throw new BadRequestException('Cannot change status after a report has been paid')
    }

    if (oldIndex >= 0 && newIndex >= 0 && newIndex < oldIndex) {
      throw new BadRequestException('Invalid status transition')
    }

    if (oldNorm === 'REJECTED' && !['REJECTED', 'DRAFT', 'SUBMITTED', 'APPROVED'].includes(newNorm)) {
      throw new BadRequestException('Invalid status transition')
    }
  }

  async handleTransitionToApproved(expenseClaimId: string, companyId: string, workspaceId: string, tx: PrismaTransactionClient) {
    const claim = await tx.expenseClaim.findUnique({ where: { id: expenseClaimId }, include: { lines: true } })
    if (!claim) throw new BadRequestException('Expense claim not found for status transition')

    await this.subLedgerService.postExpenseClaimToGL(
      {
        companyId,
        workspaceId,
        expenseClaimId,
        lines: (claim.lines ?? []).map((line: any) => ({ accountId: line.accountId ?? null, amount: Number(line.amount ?? 0) })),
        totalAmount: Number(claim.totalAmount ?? 0),
        employeeId: claim.employeeId ?? null,
      },
      tx,
    )
  }

  async handleTransitionToPaid(expenseClaimId: string, companyId: string, workspaceId: string, tx: PrismaTransactionClient) {
    const claim = await tx.expenseClaim.findUnique({ where: { id: expenseClaimId } })
    if (!claim) throw new BadRequestException('Expense claim not found for status transition')

    await this.subLedgerService.postExpenseReimbursementToGL(
      {
        companyId,
        workspaceId,
        expenseClaimId,
        amount: Number(claim.totalAmount ?? 0),
      },
      tx,
    )
  }
}
