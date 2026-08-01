import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class ReportingRepository {
    constructor(private readonly prisma: PrismaService) { }

    // ─── Profit & Loss (Income Statement) ────────────────────────────────────

    async getProfitAndLoss(companyId: string, from: Date, to: Date) {
        // Get all revenue and expense accounts with their posted journal totals in range
        const accounts = await this.prisma.account.findMany({
            where: {
                companyId,
                isActive: true,
                deletedAt: null,
                isHeader: false,
                type: { category: { in: ['REVENUE', 'EXPENSE', 'CONTRA_REVENUE', 'CONTRA_EXPENSE'] as any } },
            },
            include: {
                type: { select: { category: true, name: true, normalSide: true } },
                journalLines: {
                    where: {
                        journal: { postingStatus: 'POSTED', deletedAt: null, date: { gte: from, lte: to } },
                    },
                    select: { debit: true, credit: true },
                },
            },
            orderBy: { code: 'asc' },
        })

        const revenue: any[] = []
        const expenses: any[] = []
        let totalRevenue = 0
        let totalExpenses = 0

        for (const acct of accounts) {
            const debit = acct.journalLines.reduce((s, l) => s + Number(l.debit), 0)
            const credit = acct.journalLines.reduce((s, l) => s + Number(l.credit), 0)
            const category = (acct.type as any).category as string
            // Revenue: credit-normal, net = credit - debit
            // Expense: debit-normal, net = debit - credit
            const net = category.includes('REVENUE') ? credit - debit : debit - credit
            const row = { accountId: acct.id, code: acct.code, name: acct.name, category, net }

            if (category.includes('REVENUE')) { revenue.push(row); totalRevenue += net }
            else { expenses.push(row); totalExpenses += net }
        }

        return {
            from: from.toISOString(), to: to.toISOString(),
            revenue, totalRevenue,
            expenses, totalExpenses,
            netIncome: totalRevenue - totalExpenses,
            generatedAt: new Date().toISOString(),
        }
    }

    // ─── Balance Sheet ─────────────────────────────────────────────────────────

    async getBalanceSheet(companyId: string, asOf: Date) {
        const accounts = await this.prisma.account.findMany({
            where: {
                companyId, isActive: true, deletedAt: null, isHeader: false,
                type: { category: { in: ['ASSET', 'LIABILITY', 'EQUITY', 'CONTRA_ASSET', 'TEMPORARY_EQUITY'] as any } },
            },
            include: {
                type: { select: { category: true, name: true, normalSide: true } },
                journalLines: {
                    where: { journal: { postingStatus: 'POSTED', deletedAt: null, date: { lte: asOf } } },
                    select: { debit: true, credit: true },
                },
            },
            orderBy: { code: 'asc' },
        })

        const assets: any[] = []
        const liabilities: any[] = []
        const equity: any[] = []
        let totalAssets = 0, totalLiabilities = 0, totalEquity = 0

        for (const acct of accounts) {
            const debit = acct.journalLines.reduce((s, l) => s + Number(l.debit), 0)
            const credit = acct.journalLines.reduce((s, l) => s + Number(l.credit), 0)
            const category = (acct.type as any).category as string
            const normalSide = acct.normalSide ?? (acct.type as any).normalSide ?? 'DEBIT'
            const net = normalSide === 'DEBIT' ? debit - credit : credit - debit
            const row = { accountId: acct.id, code: acct.code, name: acct.name, category, balance: net, liquidityType: acct.liquidityType }

            if (category.includes('ASSET')) { assets.push(row); totalAssets += net }
            else if (category.includes('LIABILITY')) { liabilities.push(row); totalLiabilities += net }
            else { equity.push(row); totalEquity += net }
        }

        const isBalanced = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01
        return {
            asOf: asOf.toISOString(),
            assets: { current: assets.filter(a => a.liquidityType === 'CURRENT'), nonCurrent: assets.filter(a => a.liquidityType !== 'CURRENT'), total: totalAssets },
            liabilities: { current: liabilities.filter(l => l.liquidityType === 'CURRENT'), nonCurrent: liabilities.filter(l => l.liquidityType !== 'CURRENT'), total: totalLiabilities },
            equity: { items: equity, total: totalEquity },
            isBalanced, generatedAt: new Date().toISOString(),
        }
    }

    // ─── Cash Flow Statement (Indirect Method) ────────────────────────────────

    async getCashFlow(companyId: string, from: Date, to: Date) {
        // Operating: Net income +/- changes in working capital
        const pnl = await this.getProfitAndLoss(companyId, from, to)

        // Get movement in AR, AP, and Cash accounts
        const cashAccounts = await this.prisma.account.findMany({
            where: { companyId, type: { category: 'ASSET' as any }, cashFlowType: { not: null }, deletedAt: null },
            include: {
                journalLines: {
                    where: { journal: { postingStatus: 'POSTED', deletedAt: null, date: { gte: from, lte: to } } },
                    select: { debit: true, credit: true },
                },
                cashFlowCategory: { select: { section: true, name: true } },
            },
        })

        const operating: any[] = []
        const investing: any[] = []
        const financing: any[] = []

        for (const acct of cashAccounts) {
            const debit = acct.journalLines.reduce((s, l) => s + Number(l.debit), 0)
            const credit = acct.journalLines.reduce((s, l) => s + Number(l.credit), 0)
            const net = debit - credit
            const section = (acct.cashFlowCategory as any)?.section ?? acct.cashFlowType
            const row = { accountId: acct.id, code: acct.code, name: acct.name, net }
            if (section === 'OPERATING') operating.push(row)
            else if (section === 'INVESTING') investing.push(row)
            else if (section === 'FINANCING') financing.push(row)
        }

        const totalOperating = pnl.netIncome + operating.reduce((s, r) => s + r.net, 0)
        const totalInvesting = investing.reduce((s, r) => s + r.net, 0)
        const totalFinancing = financing.reduce((s, r) => s + r.net, 0)

        return {
            from: from.toISOString(), to: to.toISOString(), method: 'INDIRECT',
            operating: { startingNetIncome: pnl.netIncome, adjustments: operating, total: totalOperating },
            investing: { items: investing, total: totalInvesting },
            financing: { items: financing, total: totalFinancing },
            netCashChange: totalOperating + totalInvesting + totalFinancing,
            generatedAt: new Date().toISOString(),
        }
    }

    // ─── Trial Balance ─────────────────────────────────────────────────────────
    // (Delegates to Account model balance field which is updated on JE post)

    async getTrialBalance(companyId: string) {
        const accounts = await this.prisma.account.findMany({
            where: { companyId, isActive: true, deletedAt: null, isHeader: false },
            include: { type: { select: { category: true, name: true, normalSide: true } } },
            orderBy: { code: 'asc' },
        })
        const rows = accounts.map(a => {
            const normalSide = a.normalSide ?? (a.type as any)?.normalSide ?? 'DEBIT'
            return {
                accountId: a.id, code: a.code, name: a.name,
                type: (a.type as any)?.name, category: (a.type as any)?.category,
                debit: normalSide === 'DEBIT' && Number(a.balance) > 0 ? a.balance : 0,
                credit: normalSide === 'CREDIT' && Number(a.balance) > 0 ? a.balance : 0,
                balance: a.balance,
            }
        })
        const totalDebits = rows.reduce((s, r) => s + Number(r.debit), 0)
        const totalCredits = rows.reduce((s, r) => s + Number(r.credit), 0)
        return { rows, totalDebits, totalCredits, balanced: Math.abs(totalDebits - totalCredits) < 0.01, generatedAt: new Date().toISOString() }
    }

    // ─── Budgets ──────────────────────────────────────────────────────────────

    async findBudgets(workspaceId: string) {
        return this.prisma.budget.findMany({
            where: { workspaceId },
            include: { _count: { select: { lines: true } } },
            orderBy: [{ fiscalYear: 'desc' }, { createdAt: 'desc' }],
        })
    }

    async findBudgetById(workspaceId: string, budgetId: string) {
        return this.prisma.budget.findFirst({
            where: { id: budgetId, workspaceId },
            include: { lines: { include: { account: { select: { id: true, code: true, name: true } } } } },
        })
    }

    async createBudget(workspaceId: string, data: { name: string; fiscalYear: number; lines: any[] }) {
        const totalAmount = data.lines.reduce((s: number, l: any) => s + Number(l.amount ?? 0), 0)
        return this.prisma.budget.create({
            data: {
                workspaceId, name: data.name, fiscalYear: data.fiscalYear, totalAmount, status: 'DRAFT',
                lines: {
                    create: data.lines.map((l: any) => ({
                        workspaceId, accountId: l.accountId ?? null, classId: l.classId ?? null,
                        month: l.month ?? null, amount: l.amount ?? 0,
                    })),
                },
            },
            include: { lines: true },
        })
    }

    async updateBudget(workspaceId: string, budgetId: string, data: { name?: string; status?: string; fiscalYear?: number }, companyId: string, userId: string) {
        const updateData: any = { ...data }
        const budget = await this.prisma.budget.update({
            where: { id: budgetId },
            data: updateData,
        })
        await this.prisma.auditLog.create({
            data: {
                workspaceId,
                companyId,
                userId,
                action: 'BUDGET_UPDATED',
                tableName: 'Budget',
                recordId: budgetId,
                changes: updateData,
            },
        })
        return budget
    }

    async deleteBudget(workspaceId: string, budgetId: string, companyId: string, userId: string) {
        const budget = await this.prisma.budget.delete({
            where: { id: budgetId },
        })
        await this.prisma.auditLog.create({
            data: {
                workspaceId,
                companyId,
                userId,
                action: 'BUDGET_DELETED',
                tableName: 'Budget',
                recordId: budgetId,
                changes: {},
            },
        })
        return budget
    }

    async findBudgetLineById(lineId: string, budgetId: string, workspaceId: string) {
        return this.prisma.budgetLine.findFirst({
            where: { id: lineId, budgetId, budget: { workspaceId } },
        })
    }

    async addBudgetLine(workspaceId: string, budgetId: string, data: { accountId: string; classId: string; month: number; amount: number }, companyId: string, userId: string) {
        return this.prisma.$transaction(async (tx) => {
            const line = await tx.budgetLine.create({
                data: {
                    workspaceId,
                    budgetId,
                    accountId: data.accountId,
                    classId: data.classId,
                    month: data.month,
                    amount: data.amount,
                },
            })
            const { _sum } = await tx.budgetLine.aggregate({
                where: { budgetId },
                _sum: { amount: true },
            })
            await tx.budget.update({
                where: { id: budgetId },
                data: { totalAmount: Number(_sum.amount ?? 0) },
            })
            await tx.auditLog.create({
                data: {
                    workspaceId,
                    companyId,
                    userId,
                    action: 'BUDGET_LINE_ADDED',
                    tableName: 'BudgetLine',
                    recordId: line.id,
                    changes: data,
                },
            })
            return line
        })
    }

    async updateBudgetLine(lineId: string, workspaceId: string, budgetId: string, data: { accountId?: string; classId?: string; month?: number; amount?: number }, companyId: string, userId: string) {
        return this.prisma.$transaction(async (tx) => {
            const line = await tx.budgetLine.update({
                where: { id: lineId },
                data,
            })
            const { _sum } = await tx.budgetLine.aggregate({
                where: { budgetId },
                _sum: { amount: true },
            })
            await tx.budget.update({
                where: { id: budgetId },
                data: { totalAmount: Number(_sum.amount ?? 0) },
            })
            await tx.auditLog.create({
                data: {
                    workspaceId,
                    companyId,
                    userId,
                    action: 'BUDGET_LINE_UPDATED',
                    tableName: 'BudgetLine',
                    recordId: lineId,
                    changes: data,
                },
            })
            return line
        })
    }

    async deleteBudgetLine(lineId: string, workspaceId: string, budgetId: string, companyId: string, userId: string) {
        return this.prisma.$transaction(async (tx) => {
            await tx.budgetLine.delete({
                where: { id: lineId },
            })
            const { _sum } = await tx.budgetLine.aggregate({
                where: { budgetId },
                _sum: { amount: true },
            })
            await tx.budget.update({
                where: { id: budgetId },
                data: { totalAmount: Number(_sum.amount ?? 0) },
            })
            await tx.auditLog.create({
                data: {
                    workspaceId,
                    companyId,
                    userId,
                    action: 'BUDGET_LINE_DELETED',
                    tableName: 'BudgetLine',
                    recordId: lineId,
                    changes: {},
                },
            })
        })
    }

    async copyBudget(workspaceId: string, budgetId: string, newFiscalYear: number, companyId: string, userId: string) {
        return this.prisma.$transaction(async (tx) => {
            const source = await tx.budget.findFirst({
                where: { id: budgetId, workspaceId },
                include: { lines: true },
            })
            if (!source) throw new BadRequestException('Budget not found')
            const newBudget = await tx.budget.create({
                data: {
                    name: `${source.name} (${newFiscalYear})`,
                    scenario: source.scenario,
                    status: 'DRAFT',
                    fiscalYear: newFiscalYear,
                    totalAmount: source.totalAmount,
                    workspaceId,
                    lines: {
                        create: source.lines.map(line => ({
                            workspaceId,
                            accountId: line.accountId,
                            classId: line.classId,
                            month: line.month,
                            amount: line.amount,
                        })),
                    },
                },
                include: { lines: true },
            })
            await tx.auditLog.create({
                data: {
                    workspaceId,
                    companyId,
                    userId,
                    action: 'BUDGET_COPIED',
                    tableName: 'Budget',
                    recordId: newBudget.id,
                    changes: { sourceBudgetId: budgetId, newFiscalYear },
                },
            })
            return newBudget
        })
    }

    async getBudgetVsActual(workspaceId: string, budgetId: string, from: Date, to: Date) {
        const budget = await this.prisma.budget.findFirst({
            where: { id: budgetId, workspaceId },
            include: {
                lines: {
                    include: {
                        account: {
                            include: {
                                journalLines: {
                                    where: { journal: { postingStatus: 'POSTED', deletedAt: null, date: { gte: from, lte: to } } },
                                    select: { debit: true, credit: true },
                                },
                            },
                        },
                    },
                },
            },
        })
        if (!budget) return null

        const rows = budget.lines.map((line) => {
            const actual = line.account
                ? line.account.journalLines.reduce((s, l) => s + Number(l.debit) - Number(l.credit), 0)
                : 0
            const budgeted = Number(line.amount)
            const variance = actual - budgeted
            return {
                accountId: line.accountId, accountCode: line.account?.code, accountName: line.account?.name,
                month: line.month, budgeted, actual, variance, variancePct: budgeted !== 0 ? (variance / budgeted) * 100 : 0,
            }
        })
        return { budget: { id: budget.id, name: budget.name, fiscalYear: budget.fiscalYear }, rows, from: from.toISOString(), to: to.toISOString() }
    }

    // ─── KPI Dashboards ───────────────────────────────────────────────────────

    async findDashboards(companyId: string) {
        return this.prisma.kpiDashboard.findMany({
            where: { companyId },
            include: { widgets: { orderBy: { position: 'asc' } } },
        })
    }

    async createDashboard(companyId: string, workspaceId: string, data: { name: string; ownerId: string; widgets?: any[] }) {
        return this.prisma.kpiDashboard.create({
            data: {
                companyId, workspaceId, name: data.name, ownerId: data.ownerId,
                ...(data.widgets?.length ? {
                    widgets: { create: data.widgets.map((w, i) => ({ type: w.type, title: w.title, config: w.config ?? {}, position: i, size: w.size ?? 'MEDIUM' })) },
                } : {}),
            },
            include: { widgets: true },
        })
    }

    // ─── Snapshot / Save ──────────────────────────────────────────────────────

    async saveSnapshot(workspaceId: string, type: string, period: string, data: any) {
        return this.prisma.financialStatementSnapshot.create({
            data: { workspaceId, type, period, data },
        })
    }

    async listSnapshots(workspaceId: string, type?: string) {
        return this.prisma.financialStatementSnapshot.findMany({
            where: { workspaceId, ...(type ? { type } : {}) },
            orderBy: { generatedAt: 'desc' },
            take: 50,
        })
    }
}
