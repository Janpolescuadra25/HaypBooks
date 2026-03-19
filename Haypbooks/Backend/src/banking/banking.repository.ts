import { Injectable } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class BankingRepository {
    constructor(private readonly prisma: PrismaService) { }

    // ─── Bank Accounts ────────────────────────────────────────────────────────

    async findBankAccounts(workspaceId: string) {
        return this.prisma.bankAccount.findMany({
            where: { workspaceId, deletedAt: null },
            include: {
                _count: { select: { transactions: true } },
            },
            orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
        })
    }

    async findBankAccountById(workspaceId: string, bankAccountId: string) {
        return this.prisma.bankAccount.findFirst({
            where: { id: bankAccountId, workspaceId, deletedAt: null },
        })
    }

    async createBankAccount(workspaceId: string, data: {
        name: string; institution?: string; accountNumber?: string
        routingNumber?: string; swiftCode?: string; iban?: string; isDefault?: boolean
    }) {
        // If new account is set as default, unset others first
        if (data.isDefault) {
            await this.prisma.bankAccount.updateMany({ where: { workspaceId, isDefault: true }, data: { isDefault: false } })
        }
        return this.prisma.bankAccount.create({
            data: { workspaceId, ...data, isDefault: data.isDefault ?? false },
        })
    }

    async updateBankAccount(workspaceId: string, bankAccountId: string, data: any) {
        if (data.isDefault) {
            await this.prisma.bankAccount.updateMany({ where: { workspaceId, isDefault: true }, data: { isDefault: false } })
        }
        return this.prisma.bankAccount.update({ where: { id: bankAccountId }, data })
    }

    async softDeleteBankAccount(bankAccountId: string) {
        return this.prisma.bankAccount.update({ where: { id: bankAccountId }, data: { deletedAt: new Date() } })
    }

    // ─── Bank Transactions ────────────────────────────────────────────────────

    async findTransactions(workspaceId: string, bankAccountId: string, opts: {
        from?: Date; to?: Date; limit?: number; offset?: number
    } = {}) {
        return this.prisma.bankTransaction.findMany({
            where: {
                workspaceId, bankAccountId,
                ...(opts.from || opts.to ? {
                    date: {
                        ...(opts.from ? { gte: opts.from } : {}),
                        ...(opts.to ? { lte: opts.to } : {}),
                    },
                } : {}),
            },
            include: {
                BankReconciliationLine: { select: { id: true, matched: true, matchType: true } },
            },
            orderBy: { date: 'desc' },
            take: opts.limit ?? 100,
            skip: opts.offset ?? 0,
        })
    }

    async importTransactions(workspaceId: string, bankAccountId: string, transactions: Array<{
        date: Date; description: string; amount: number
    }>) {
        const created = await this.prisma.$transaction(
            transactions.map((t) =>
                this.prisma.bankTransaction.create({
                    data: { workspaceId, bankAccountId, date: t.date, description: t.description, amount: t.amount },
                })
            )
        )
        return { count: created.length, transactions: created }
    }

    async createTransaction(workspaceId: string, bankAccountId: string, data: {
        date: Date; description: string; amount: number; category?: string; memo?: string
    }) {
        return this.prisma.bankTransaction.create({
            data: {
                workspaceId, bankAccountId,
                date: data.date, description: data.description, amount: data.amount,
                category: data.category, memo: data.memo, status: 'PENDING',
            },
            include: { BankReconciliationLine: { select: { id: true, matched: true, matchType: true } } },
        })
    }

    async updateTransaction(workspaceId: string, bankTransactionId: string, data: {
        category?: string; memo?: string; status?: string
    }) {
        return this.prisma.bankTransaction.update({
            where: { id: bankTransactionId },
            data: {
                ...(data.category !== undefined ? { category: data.category, status: 'CATEGORIZED' as any } : {}),
                ...(data.memo !== undefined ? { memo: data.memo } : {}),
                ...(data.status !== undefined ? { status: data.status as any } : {}),
            },
            include: { BankReconciliationLine: { select: { id: true, matched: true, matchType: true } } },
        })
    }

    async splitTransaction(workspaceId: string, bankTransactionId: string, splits: Array<{
        accountCode: string; description: string; amount: number
    }>) {
        return this.prisma.$transaction(async (tx) => {
            await tx.bankTransactionSplit.deleteMany({ where: { bankTransactionId } })
            await tx.bankTransactionSplit.createMany({
                data: splits.map(s => ({
                    workspaceId, bankTransactionId,
                    accountCode: s.accountCode, description: s.description, amount: s.amount,
                })),
            })
            return tx.bankTransaction.update({
                where: { id: bankTransactionId },
                data: { status: 'SPLIT' },
                include: {
                    splits: true,
                    BankReconciliationLine: { select: { id: true, matched: true, matchType: true } },
                },
            })
        })
    }

    async createTransfer(workspaceId: string, data: {
        fromBankAccountId: string; toBankAccountId: string; amount: number; date: Date; memo?: string
    }) {
        return this.prisma.$transaction(async (tx) => {
            const from = await tx.bankTransaction.create({
                data: {
                    workspaceId, bankAccountId: data.fromBankAccountId,
                    date: data.date, description: `Transfer to account`,
                    amount: -Math.abs(data.amount), status: 'PENDING',
                },
            })
            const to = await tx.bankTransaction.create({
                data: {
                    workspaceId, bankAccountId: data.toBankAccountId,
                    date: data.date, description: `Transfer from account`,
                    amount: Math.abs(data.amount), status: 'PENDING',
                },
            })
            return tx.bankTransfer.create({
                data: {
                    workspaceId,
                    fromBankAccountId: data.fromBankAccountId,
                    toBankAccountId: data.toBankAccountId,
                    amount: data.amount,
                    date: data.date,
                    memo: data.memo,
                    fromTransactionId: from.id,
                    toTransactionId: to.id,
                },
            })
        })
    }

    // ─── Bank Reconciliation ──────────────────────────────────────────────────

    async findReconciliations(workspaceId: string, bankAccountId: string) {
        return this.prisma.bankReconciliation.findMany({
            where: { workspaceId, bankAccountId },
            include: {
                _count: { select: { BankReconciliationLine: true } },
            },
            orderBy: { statementDate: 'desc' },
        })
    }

    async findReconciliationById(workspaceId: string, reconId: string) {
        return this.prisma.bankReconciliation.findFirst({
            where: { id: reconId, workspaceId },
            include: {
                BankReconciliationLine: {
                    include: {
                        bankTransaction: true,
                        journalEntryLine: { include: { journal: { select: { id: true, entryNumber: true, date: true } } } },
                    },
                },
                bankAccount: { select: { id: true, name: true, institution: true } },
            },
        })
    }

    async createReconciliation(workspaceId: string, data: {
        bankAccountId: string; statementDate: Date; closingBalance: number
    }) {
        return this.prisma.bankReconciliation.create({
            data: {
                workspaceId, bankAccountId: data.bankAccountId,
                statementDate: data.statementDate, closingBalance: data.closingBalance,
                status: 'DRAFT',
            },
        })
    }

    async matchTransactionToJournalLine(workspaceId: string, reconId: string, data: {
        bankTransactionId: string; journalEntryLineId?: string; matchType?: string
    }) {
        // Check if a line already exists for this transaction in this reconciliation
        const existing = await this.prisma.bankReconciliationLine.findFirst({
            where: { bankReconciliationId: reconId, bankTransactionId: data.bankTransactionId },
        })
        if (existing) {
            return this.prisma.bankReconciliationLine.update({
                where: { id: existing.id },
                data: { matched: true, journalEntryLineId: data.journalEntryLineId ?? null, matchType: data.matchType ?? 'MANUAL' },
            })
        }
        return this.prisma.bankReconciliationLine.create({
            data: {
                workspaceId, bankReconciliationId: reconId,
                bankTransactionId: data.bankTransactionId,
                journalEntryLineId: data.journalEntryLineId ?? null,
                matched: true, matchType: data.matchType ?? 'MANUAL',
            },
        })
    }

    async unmatchTransaction(workspaceId: string, reconId: string, bankTransactionId: string) {
        return this.prisma.bankReconciliationLine.deleteMany({
            where: { bankReconciliationId: reconId, bankTransactionId },
        })
    }

    async completeReconciliation(workspaceId: string, reconId: string) {
        return this.prisma.bankReconciliation.update({
            where: { id: reconId },
            data: { status: 'COMPLETED' },
        })
    }

    // ─── Bank Deposits ────────────────────────────────────────────────────────

    async findDeposits(companyId: string, opts: { bankAccountId?: string; from?: Date; to?: Date; limit?: number; offset?: number } = {}) {
        return this.prisma.bankDeposit.findMany({
            where: {
                companyId,
                ...(opts.bankAccountId ? { bankAccountId: opts.bankAccountId } : {}),
                ...(opts.from || opts.to ? {
                    depositDate: {
                        ...(opts.from ? { gte: opts.from } : {}),
                        ...(opts.to ? { lte: opts.to } : {}),
                    },
                } : {}),
            },
            include: {
                bankAccount: { select: { id: true, name: true } },
                lines: {
                    include: { paymentReceived: { include: { customer: { include: { contact: { select: { displayName: true } } } } } } },
                },
            },
            orderBy: { depositDate: 'desc' },
            take: opts.limit ?? 50,
            skip: opts.offset ?? 0,
        })
    }

    async findDepositById(companyId: string, depositId: string) {
        return this.prisma.bankDeposit.findFirst({
            where: { id: depositId, companyId },
            include: {
                bankAccount: true,
                lines: {
                    include: { paymentReceived: { include: { customer: { include: { contact: true } } } } },
                },
                journalEntry: { select: { id: true, entryNumber: true } },
            },
        })
    }

    async createDeposit(data: {
        workspaceId: string; companyId: string; bankAccountId: string
        depositDate: Date; currency?: string; referenceNumber?: string
        paymentIds: string[]
    }) {
        // Get payments to calculate total
        const payments = await this.prisma.paymentReceived.findMany({
            where: { id: { in: data.paymentIds }, companyId: data.companyId },
            select: { id: true, amount: true },
        })
        const totalAmount = payments.reduce((s, p) => s + Number(p.amount), 0)

        return this.prisma.$transaction(async (tx) => {
            const deposit = await tx.bankDeposit.create({
                data: {
                    workspaceId: data.workspaceId, companyId: data.companyId,
                    bankAccountId: data.bankAccountId, depositDate: data.depositDate,
                    totalAmount, currency: data.currency ?? 'PHP',
                    referenceNumber: data.referenceNumber ?? null, status: 'DRAFT',
                    lines: {
                        create: payments.map((p) => ({ paymentReceivedId: p.id, amount: p.amount })),
                    },
                },
                include: { lines: true },
            })
            // Mark payments as deposited
            await tx.paymentReceived.updateMany({ where: { id: { in: data.paymentIds } }, data: { isDeposited: true } })
            return deposit
        })
    }

    async postDeposit(companyId: string, depositId: string) {
        const deposit = await this.prisma.bankDeposit.findFirst({ where: { id: depositId, companyId } })
        if (!deposit) return null
        return this.prisma.bankDeposit.update({ where: { id: depositId }, data: { status: 'POSTED' } })
    }

    async voidDeposit(companyId: string, depositId: string) {
        const deposit = await this.prisma.bankDeposit.findFirst({ where: { id: depositId, companyId }, include: { lines: true } })
        if (!deposit) return null
        return this.prisma.$transaction(async (tx) => {
            const paymentIds = deposit.lines.map((l) => l.paymentReceivedId)
            await tx.paymentReceived.updateMany({ where: { id: { in: paymentIds } }, data: { isDeposited: false } })
            return tx.bankDeposit.update({ where: { id: depositId }, data: { status: 'VOID' } })
        })
    }

    // ─── Undeposited Funds ────────────────────────────────────────────────────

    async findUndepositedPayments(companyId: string) {
        return this.prisma.paymentReceived.findMany({
            where: { companyId, isDeposited: false, deletedAt: null },
            include: { customer: { include: { contact: { select: { displayName: true } } } } },
            orderBy: { paymentDate: 'asc' },
        })
    }

    // ─── Cash Position Summary ────────────────────────────────────────────────

    async getCashPosition(workspaceId: string) {
        const accounts = await this.prisma.bankAccount.findMany({
            where: { workspaceId, deletedAt: null },
            select: { id: true, name: true, institution: true, isDefault: true },
        })
        // Get last transaction date and balance via aggregation for each account
        const result = await Promise.all(accounts.map(async (acct) => {
            const lastTxn = await this.prisma.bankTransaction.findFirst({
                where: { bankAccountId: acct.id }, orderBy: { date: 'desc' }, select: { date: true, amount: true },
            })
            const total = await this.prisma.bankTransaction.aggregate({
                where: { bankAccountId: acct.id }, _sum: { amount: true },
            })
            return { ...acct, balance: total._sum.amount ?? 0, lastActivityDate: lastTxn?.date ?? null }
        }))
        const totalBalance = result.reduce((s, a) => s + Number(a.balance), 0)
        return { accounts: result, totalBalance }
    }
}
