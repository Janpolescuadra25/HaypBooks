import { Injectable } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { resolveAccount, createAndPostJE, SYSTEM_ACCOUNTS } from '../shared/gl-integration'

@Injectable()
export class AccountingRepository {
    constructor(private readonly prisma: PrismaService) { }

    // ─── Chart of Accounts ───────────────────────────────────────────────────

    async countAccounts(companyId: string, includeInactive = false, includeDeleted = false) {
        return this.prisma.account.count({
            where: {
                companyId,
                ...(includeInactive ? {} : { isActive: true }),
                ...(includeDeleted ? {} : { deletedAt: null }),
            },
        })
    }

    async countJournalEntries(companyId: string, status?: 'DRAFT' | 'POSTED' | 'VOIDED') {
        return this.prisma.journalEntry.count({
            where: {
                companyId,
                deletedAt: null,
                ...(status ? { postingStatus: status } : {}),
            },
        })
    }

    async findAccounts(companyId: string, opts: { includeInactive?: boolean; includeDeleted?: boolean } = {}) {
        return this.prisma.account.findMany({
            where: {
                companyId,
                ...(opts.includeInactive ? {} : { isActive: true }),
                ...(opts.includeDeleted ? {} : { deletedAt: null }),
            },
            include: {
                type: { select: { id: true, name: true, category: true, normalSide: true } },
                AccountSubType: { select: { id: true, name: true } },
                parent: { select: { id: true, code: true, name: true } },
                children: { select: { id: true, code: true, name: true, balance: true, isActive: true } },
            },
            orderBy: [{ code: 'asc' }],
        })
    }

    async findAccountById(companyId: string, accountId: string) {
        return this.prisma.account.findFirst({
            where: { id: accountId, companyId, deletedAt: null },
            include: {
                type: { select: { id: true, name: true, category: true, normalSide: true } },
                AccountSubType: { select: { id: true, name: true } },
                parent: { select: { id: true, code: true, name: true } },
                children: { select: { id: true, code: true, name: true, balance: true, isActive: true } },
            },
        })
    }

    async createAccount(data: {
        companyId: string
        code: string
        name: string
        typeId: number
        parentId?: string
        currency?: string
        normalSide?: string
        isHeader?: boolean
        liquidityType?: string
        specialType?: string
        cashFlowType?: string
        accountSubTypeId?: number
    }) {
        return this.prisma.account.create({
            data: {
                companyId: data.companyId,
                code: data.code,
                name: data.name,
                typeId: data.typeId,
                parentId: data.parentId ?? null,
                currency: data.currency ?? 'PHP',
                normalSide: data.normalSide as any ?? null,
                isHeader: data.isHeader ?? false,
                liquidityType: data.liquidityType as any ?? null,
                specialType: data.specialType as any ?? 'NONE',
                cashFlowType: data.cashFlowType ?? null,
                accountSubTypeId: data.accountSubTypeId ?? null,
            },
        })
    }

    async updateAccount(companyId: string, accountId: string, data: any) {
        return this.prisma.account.update({
            where: { id: accountId },
            data: {
                name: data.name,
                code: data.code,
                parentId: data.parentId,
                isActive: data.isActive,
                isHeader: data.isHeader,
                liquidityType: data.liquidityType,
                specialType: data.specialType,
                cashFlowType: data.cashFlowType,
            } as any,
        })
    }

    async softDeleteAccount(companyId: string, accountId: string, deletedBy: string) {
        // Verify account belongs to company
        const acct = await this.prisma.account.findFirst({ where: { id: accountId, companyId, deletedAt: null } })
        if (!acct) return null
        return this.prisma.account.update({
            where: { id: accountId },
            data: { deletedAt: new Date(), deletedBy, isActive: false, isActiveForEntry: false },
        })
    }

    async findAccountLedger(companyId: string, accountId: string, opts: { from?: Date; to?: Date; limit?: number; offset?: number }) {
        return this.prisma.journalEntryLine.findMany({
            where: {
                companyId,
                accountId,
                journal: {
                    postingStatus: 'POSTED',
                    deletedAt: null,
                    ...(opts.from || opts.to ? {
                        date: {
                            ...(opts.from ? { gte: opts.from } : {}),
                            ...(opts.to ? { lte: opts.to } : {}),
                        },
                    } : {}),
                },
            },
            include: {
                journal: { select: { id: true, entryNumber: true, date: true, description: true, postingStatus: true } },
            },
            orderBy: { journal: { date: 'asc' } },
            take: opts.limit ?? 100,
            skip: opts.offset ?? 0,
        })
    }

    async findAccountTypes() {
        return this.prisma.accountType.findMany({
            orderBy: [{ category: 'asc' }, { name: 'asc' }],
        })
    }

    // ─── Journal Entries ──────────────────────────────────────────────────────

    async findJournalEntries(companyId: string, opts: {
        status?: string
        from?: Date
        to?: Date
        limit?: number
        offset?: number
    }) {
        return this.prisma.journalEntry.findMany({
            where: {
                companyId,
                deletedAt: null,
                ...(opts.status ? { postingStatus: opts.status as any } : {}),
                ...(opts.from || opts.to ? {
                    date: {
                        ...(opts.from ? { gte: opts.from } : {}),
                        ...(opts.to ? { lte: opts.to } : {}),
                    },
                } : {}),
            },
            include: {
                lines: {
                    include: { account: { select: { id: true, code: true, name: true } } },
                },
                createdBy: { select: { id: true, name: true, email: true } },
            },
            orderBy: { date: 'desc' },
            take: opts.limit ?? 50,
            skip: opts.offset ?? 0,
        })
    }

    async findJournalEntryById(companyId: string, jeId: string) {
        return this.prisma.journalEntry.findFirst({
            where: { id: jeId, companyId, deletedAt: null },
            include: {
                lines: {
                    include: { account: { select: { id: true, code: true, name: true, typeId: true } } },
                },
                createdBy: { select: { id: true, name: true, email: true } },
                updatedBy: { select: { id: true, name: true, email: true } },
            },
        })
    }

    async createJournalEntry(data: {
        workspaceId: string
        companyId: string
        date: Date
        description?: string
        currency?: string
        createdById: string
        lines: Array<{ accountId: string; debit: number; credit: number; description?: string }>
    }) {
        // Validate double-entry: sum of debits === sum of credits
        const totalDebits = data.lines.reduce((s, l) => s + (l.debit ?? 0), 0)
        const totalCredits = data.lines.reduce((s, l) => s + (l.credit ?? 0), 0)
        if (Math.abs(totalDebits - totalCredits) > 0.001) {
            throw new Error(`Journal entry is not balanced: debits ${totalDebits} ≠ credits ${totalCredits}`)
        }

        return this.prisma.journalEntry.create({
            data: {
                workspaceId: data.workspaceId,
                companyId: data.companyId,
                date: data.date,
                description: data.description,
                currency: data.currency ?? 'PHP',
                postingStatus: 'DRAFT',
                createdById: data.createdById,
                lines: {
                    create: data.lines.map(l => ({
                        companyId: data.companyId,
                        workspaceId: data.workspaceId,
                        accountId: l.accountId,
                        debit: l.debit ?? 0,
                        credit: l.credit ?? 0,
                        description: l.description,
                    })),
                },
            },
            include: { lines: true },
        })
    }

    async updateJournalEntry(companyId: string, jeId: string, data: {
        date?: Date
        description?: string
        currency?: string
        updatedById: string
        lines?: Array<{ accountId: string; debit: number; credit: number; description?: string }>
    }) {
        const je = await this.prisma.journalEntry.findFirst({ where: { id: jeId, companyId, deletedAt: null } })
        if (!je) return null
        if (je.postingStatus !== 'DRAFT') throw new Error('Only DRAFT journal entries can be edited')

        if (data.lines) {
            const totalDebits = data.lines.reduce((s, l) => s + (l.debit ?? 0), 0)
            const totalCredits = data.lines.reduce((s, l) => s + (l.credit ?? 0), 0)
            if (Math.abs(totalDebits - totalCredits) > 0.001) {
                throw new Error(`Journal entry is not balanced: debits ${totalDebits} ≠ credits ${totalCredits}`)
            }
        }

        return this.prisma.$transaction(async (tx) => {
            if (data.lines) {
                await tx.journalEntryLine.deleteMany({ where: { journalId: jeId } })
            }
            return tx.journalEntry.update({
                where: { id: jeId },
                data: {
                    date: data.date,
                    description: data.description,
                    currency: data.currency,
                    updatedById: data.updatedById,
                    version: { increment: 1 },
                    ...(data.lines ? {
                        lines: {
                            create: data.lines.map(l => ({
                                companyId,
                                workspaceId: je.workspaceId,
                                accountId: l.accountId,
                                debit: l.debit ?? 0,
                                credit: l.credit ?? 0,
                                description: l.description,
                            })),
                        },
                    } : {}),
                } as any,
                include: { lines: true },
            })
        })
    }

    async postJournalEntry(companyId: string, jeId: string, approvedById: string) {
        const je = await this.prisma.journalEntry.findFirst({
            where: { id: jeId, companyId, deletedAt: null },
            include: { lines: true },
        })
        if (!je) return null
        if (je.postingStatus === 'POSTED') throw new Error('Journal entry is already posted')
        if (je.postingStatus === 'VOIDED') throw new Error('Cannot post a voided journal entry')

        // Generate entry number if missing
        const entryNumber = je.entryNumber ?? `JE-${Date.now()}`

        return this.prisma.$transaction(async (tx) => {
            // Update balances on each account
            for (const line of je.lines) {
                const acct = await tx.account.findUnique({ where: { id: line.accountId } })
                if (!acct) continue
                const normalSide = (acct.normalSide as string) ?? 'DEBIT'
                const balanceDelta = normalSide === 'DEBIT'
                    ? Number(line.debit) - Number(line.credit)
                    : Number(line.credit) - Number(line.debit)
                await tx.account.update({
                    where: { id: line.accountId },
                    data: { balance: { increment: balanceDelta } },
                })
            }

            return tx.journalEntry.update({
                where: { id: jeId },
                data: {
                    postingStatus: 'POSTED',
                    entryNumber,
                    approvedById,
                    approvedAt: new Date(),
                },
                include: { lines: { include: { account: { select: { id: true, code: true, name: true } } } } },
            })
        })
    }

    async voidJournalEntry(companyId: string, jeId: string, voidedById: string, reason: string) {
        const je = await this.prisma.journalEntry.findFirst({
            where: { id: jeId, companyId, deletedAt: null },
            include: { lines: true },
        })
        if (!je) return null
        if (je.postingStatus === 'VOIDED') throw new Error('Journal entry is already void')
        if (je.postingStatus === 'DRAFT') {
            // Simply soft-delete draft entries
            return this.prisma.journalEntry.update({ where: { id: jeId }, data: { deletedAt: new Date() } })
        }

        // For POSTED entries: create a reversing entry and mark original as VOID
        return this.prisma.$transaction(async (tx) => {
            // Reverse balances
            for (const line of je.lines) {
                const acct = await tx.account.findUnique({ where: { id: line.accountId } })
                if (!acct) continue
                const normalSide = (acct.normalSide as string) ?? 'DEBIT'
                const balanceDelta = normalSide === 'DEBIT'
                    ? Number(line.debit) - Number(line.credit)
                    : Number(line.credit) - Number(line.debit)
                await tx.account.update({
                    where: { id: line.accountId },
                    data: { balance: { decrement: balanceDelta } },
                })
            }

            await tx.journalEntry.update({ where: { id: jeId }, data: { postingStatus: 'VOIDED' } })

            // Create reversal entry
            return tx.journalEntry.create({
                data: {
                    workspaceId: je.workspaceId,
                    companyId,
                    date: new Date(),
                    description: `VOID of ${je.entryNumber ?? jeId}: ${reason}`,
                    currency: je.currency,
                    postingStatus: 'POSTED',
                    createdById: voidedById,
                    lines: {
                        create: je.lines.map(l => ({
                            companyId,
                            workspaceId: je.workspaceId,
                            accountId: l.accountId,
                            debit: Number(l.credit),
                            credit: Number(l.debit),
                        })),
                    },
                },
                include: { lines: true },
            })
        })
    }

    // ─── Accounting Periods ───────────────────────────────────────────────────

    async findPeriods(companyId: string) {
        // AccountingPeriod belongs to a Workspace, not directly to a Company.
        // Resolve the workspaceId first.
        const company = await this.prisma.company.findUnique({ where: { id: companyId }, select: { workspaceId: true } })
        if (!company) return []
        return this.prisma.accountingPeriod.findMany({
            where: { workspaceId: company.workspaceId },
            orderBy: { startDate: 'desc' },
        })
    }

    async createPeriod(data: { companyId: string; workspaceId: string; name: string; startDate: Date; endDate: Date }) {
        return this.prisma.accountingPeriod.create({
            data: {
                companyId: data.companyId,
                workspaceId: data.workspaceId,
                name: data.name,
                startDate: data.startDate,
                endDate: data.endDate,
                isClosed: false,
                isLocked: false,
            } as any,
        })
    }

    async closePeriod(companyId: string, periodId: string, closedById?: string) {
        const period = await this.prisma.accountingPeriod.findFirst({
            where: { id: periodId, workspace: { companies: { some: { id: companyId } } } },
        })
        if (!period) return null

        return this.prisma.$transaction(async (tx) => {
            // Fetch all revenue & expense accounts with non-zero balances
            const revenueAccounts = await tx.account.findMany({
                where: { companyId, isActive: true, deletedAt: null, type: { category: { in: ['REVENUE', 'CONTRA_REVENUE'] } }, NOT: { balance: 0 } },
                include: { type: { select: { normalSide: true } } },
            })
            const expenseAccounts = await tx.account.findMany({
                where: { companyId, isActive: true, deletedAt: null, type: { category: { in: ['EXPENSE', 'CONTRA_EXPENSE'] } }, NOT: { balance: 0 } },
                include: { type: { select: { normalSide: true } } },
            })

            const incomeSummary    = await resolveAccount(tx, companyId, SYSTEM_ACCOUNTS.INCOME_SUMMARY)
            const retainedEarnings = await resolveAccount(tx, companyId, SYSTEM_ACCOUNTS.RETAINED_EARNINGS)

            const userId = closedById ?? 'system'
            const periodEnd = (period as any).endDate ?? new Date()

            // 1. Close revenue accounts → Income Summary
            if (revenueAccounts.length > 0) {
                const revLines: Array<{ accountId: string; debit: number; credit: number; description?: string }> = []
                let revTotal = 0
                for (const acct of revenueAccounts) {
                    const bal = Number(acct.balance)
                    revTotal += bal
                    // Revenue has credit-normal balance; to close, debit the revenue account
                    revLines.push({ accountId: acct.id, debit: bal, credit: 0, description: `Close ${acct.code} ${acct.name}` })
                }
                revLines.push({ accountId: incomeSummary.id, debit: 0, credit: revTotal, description: 'Revenue to Income Summary' })
                await createAndPostJE(tx, {
                    workspaceId: (period as any).workspaceId,
                    companyId,
                    date: periodEnd,
                    description: `Closing entry – Revenue (${(period as any).name})`,
                    createdById: userId,
                    lines: revLines,
                })
            }

            // 2. Close expense accounts → Income Summary
            if (expenseAccounts.length > 0) {
                const expLines: Array<{ accountId: string; debit: number; credit: number; description?: string }> = []
                let expTotal = 0
                for (const acct of expenseAccounts) {
                    const bal = Number(acct.balance)
                    expTotal += bal
                    // Expense has debit-normal balance; to close, credit the expense account
                    expLines.push({ accountId: acct.id, debit: 0, credit: bal, description: `Close ${acct.code} ${acct.name}` })
                }
                expLines.push({ accountId: incomeSummary.id, debit: expTotal, credit: 0, description: 'Expenses to Income Summary' })
                await createAndPostJE(tx, {
                    workspaceId: (period as any).workspaceId,
                    companyId,
                    date: periodEnd,
                    description: `Closing entry – Expenses (${(period as any).name})`,
                    createdById: userId,
                    lines: expLines,
                })
            }

            // 3. Close Income Summary → Retained Earnings
            const updatedIS = await tx.account.findUnique({ where: { id: incomeSummary.id } })
            const isBal = Number(updatedIS?.balance ?? 0)
            if (Math.abs(isBal) > 0.001) {
                const isDebitNormal = isBal > 0 // net income → credit retained earnings
                await createAndPostJE(tx, {
                    workspaceId: (period as any).workspaceId,
                    companyId,
                    date: periodEnd,
                    description: `Closing entry – Net Income to Retained Earnings (${(period as any).name})`,
                    createdById: userId,
                    lines: [
                        {
                            accountId: incomeSummary.id,
                            debit: isDebitNormal ? 0 : Math.abs(isBal),
                            credit: isDebitNormal ? isBal : 0,
                            description: 'Close Income Summary',
                        },
                        {
                            accountId: retainedEarnings.id,
                            debit: isDebitNormal ? isBal : 0,
                            credit: isDebitNormal ? 0 : Math.abs(isBal),
                            description: 'To Retained Earnings',
                        },
                    ],
                })
            }

            return tx.accountingPeriod.update({
                where: { id: periodId },
                data: { status: 'CLOSED', closedAt: new Date(), isClosed: true } as any,
            })
        })
    }

    async reopenPeriod(companyId: string, periodId: string) {
        return this.prisma.accountingPeriod.update({
            where: { id: periodId },
            data: { status: 'OPEN', closedAt: null } as any,
        })
    }

    // ─── Trial Balance ────────────────────────────────────────────────────────

    async getTrialBalance(companyId: string, asOf?: Date) {
        const accounts = await this.prisma.account.findMany({
            where: { companyId, isActive: true, deletedAt: null, isHeader: false },
            include: { type: { select: { name: true, category: true, normalSide: true } } },
            orderBy: { code: 'asc' },
        })

        // If asOf is provided, calculate balances from posted JE lines up to that date
        // instead of using the current account.balance snapshot
        if (asOf) {
            const lines = await this.prisma.journalEntryLine.groupBy({
                by: ['accountId'],
                where: {
                    companyId,
                    journal: { postingStatus: 'POSTED', deletedAt: null, date: { lte: asOf } },
                },
                _sum: { debit: true, credit: true },
            })

            const balanceMap = new Map<string, { debit: number; credit: number }>()
            for (const row of lines) {
                balanceMap.set(row.accountId, {
                    debit: Number(row._sum.debit ?? 0),
                    credit: Number(row._sum.credit ?? 0),
                })
            }

            return accounts.map(a => {
                const sums = balanceMap.get(a.id) ?? { debit: 0, credit: 0 }
                const ns = a.normalSide ?? (a.type as any)?.normalSide ?? 'DEBIT'
                const balance = ns === 'DEBIT'
                    ? sums.debit - sums.credit
                    : sums.credit - sums.debit
                return {
                    accountId: a.id,
                    code: a.code,
                    name: a.name,
                    type: (a.type as any)?.name,
                    category: (a.type as any)?.category,
                    normalSide: ns,
                    balance,
                    debit: ns === 'DEBIT' ? Math.max(0, balance) : 0,
                    credit: ns === 'CREDIT' ? Math.max(0, balance) : 0,
                }
            })
        }

        // Default: use current balance snapshot
        return accounts.map(a => {
            const ns = a.normalSide ?? (a.type as any)?.normalSide ?? 'DEBIT'
            return {
                accountId: a.id,
                code: a.code,
                name: a.name,
                type: (a.type as any)?.name,
                category: (a.type as any)?.category,
                normalSide: ns,
                balance: a.balance,
                debit: ns === 'DEBIT' ? a.balance : 0,
                credit: ns === 'CREDIT' ? a.balance : 0,
            }
        })
    }
}
