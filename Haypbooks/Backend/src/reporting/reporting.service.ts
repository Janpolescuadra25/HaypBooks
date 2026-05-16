import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { ReportingRepository } from './reporting.repository'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class ReportingService {
    constructor(private readonly repo: ReportingRepository, private readonly prisma: PrismaService) { }

    private async getWorkspaceId(companyId: string) {
        const company = await this.prisma.company.findUnique({ where: { id: companyId }, select: { workspaceId: true } })
        if (!company) throw new NotFoundException('Company not found')
        return company.workspaceId
    }

    private async assertAccess(userId: string, companyId: string) {
        const m = await this.prisma.workspaceUser.findFirst({
            where: { status: 'ACTIVE', userId, workspace: { companies: { some: { id: companyId } } } },
        })
        if (!m) throw new ForbiddenException('Access denied')
    }

    // ─── Financial Statements ─────────────────────────────────────────────────

    async getProfitAndLoss(userId: string, companyId: string, opts: { from?: string; to?: string }) {
        await this.assertAccess(userId, companyId)
        const now = new Date()
        const from = opts.from ? new Date(opts.from) : new Date(now.getFullYear(), 0, 1) // YTD start
        const to = opts.to ? new Date(opts.to) : now
        if (opts.from && Number.isNaN(from.getTime())) throw new BadRequestException('Invalid from date')
        if (opts.to && Number.isNaN(to.getTime())) throw new BadRequestException('Invalid to date')
        if (from > to) throw new BadRequestException('from date must be before to date')

        return this._calculateProfitAndLoss(companyId, from, to)
    }

    async getBalanceSheet(userId: string, companyId: string, opts: { asOf?: string }) {
        await this.assertAccess(userId, companyId)
        const asOf = opts.asOf ? new Date(opts.asOf) : new Date()
        if (opts.asOf && Number.isNaN(asOf.getTime())) throw new BadRequestException('Invalid asOf date')
        return this._buildBalanceSheet(companyId, asOf)
    }

    async getCashFlow(userId: string, companyId: string, opts: { from?: string; to?: string }) {
        await this.assertAccess(userId, companyId)
        const now = new Date()
        const from = opts.from ? new Date(opts.from) : new Date(now.getFullYear(), 0, 1)
        const to = opts.to ? new Date(opts.to) : now
        if (opts.from && Number.isNaN(from.getTime())) throw new BadRequestException('Invalid from date')
        if (opts.to && Number.isNaN(to.getTime())) throw new BadRequestException('Invalid to date')
        if (from > to) throw new BadRequestException('from date must be before to date')

        const pnl = await this._calculateProfitAndLoss(companyId, from, to)
        const openingAsOf = new Date(from)
        openingAsOf.setDate(openingAsOf.getDate() - 1)

        const openingSheet = await this._buildBalanceSheet(companyId, openingAsOf)
        const closingSheet = await this._buildBalanceSheet(companyId, to)

        const openingMap = new Map<string, any>()
        const openingAccounts = [
            ...openingSheet.sections.assets.accounts,
            ...openingSheet.sections.liabilities.accounts,
            ...openingSheet.sections.equity.accounts,
        ]
        for (const account of openingAccounts) {
            openingMap.set(account.accountId, account)
        }

        const closingAccounts = [
            ...closingSheet.sections.assets.accounts,
            ...closingSheet.sections.liabilities.accounts,
            ...closingSheet.sections.equity.accounts,
        ]

        const operating: any[] = []
        const investing: any[] = []
        const financing: any[] = []
        let openingCash = 0
        let closingCash = 0

        const classify = (accountType: string, accountSubtype?: string) => {
            const subtype = accountSubtype?.toUpperCase() ?? ''
            if (subtype.includes('CASH') || subtype.includes('CASH_EQUIVALENT')) return 'CASH'
            if (accountType === 'EQUITY') return 'FINANCING'
            if (accountType === 'LIABILITY') {
                if (subtype.includes('CURRENT')) return 'OPERATING'
                if (subtype.includes('LONG') || subtype.includes('NON_CURRENT') || subtype.includes('NONCURRENT') || subtype.includes('FIXED')) return 'FINANCING'
                return 'OPERATING'
            }
            if (accountType === 'ASSET') {
                if (subtype.includes('FIXED') || subtype.includes('LONG') || subtype.includes('NON_CURRENT') || subtype.includes('NONCURRENT')) return 'INVESTING'
                return 'OPERATING'
            }
            return 'OPERATING'
        }

        for (const closing of closingAccounts) {
            const opening = openingMap.get(closing.accountId)
            const openingBalance = opening ? opening.balance : 0
            const change = this._roundMoney(closing.balance - openingBalance)
            const section = classify(closing.accountType, closing.accountSubtype)

            if (section === 'CASH') {
                if (closing.accountType === 'ASSET') {
                    openingCash = this._roundMoney(openingCash + openingBalance)
                    closingCash = this._roundMoney(closingCash + closing.balance)
                }
                continue
            }

            const item = {
                accountId: closing.accountId,
                accountCode: closing.accountCode,
                accountName: closing.accountName,
                change,
            }

            if (section === 'INVESTING') investing.push(item)
            else if (section === 'FINANCING') financing.push(item)
            else operating.push(item)
        }

        const totalOperating = this._roundMoney(pnl.netIncome + operating.reduce((sum, row) => sum + row.change, 0))
        const totalInvesting = this._roundMoney(investing.reduce((sum, row) => sum + row.change, 0))
        const totalFinancing = this._roundMoney(financing.reduce((sum, row) => sum + row.change, 0))
        const netCashFlow = this._roundMoney(totalOperating + totalInvesting + totalFinancing)
        const cashChangeVariance = this._roundMoney(netCashFlow - this._roundMoney(closingCash - openingCash))

        return {
            companyId,
            from,
            to,
            generatedAt: new Date(),
            sections: {
                operating: {
                    description: 'Operating cash flow from current assets, current liabilities, and net income',
                    items: operating.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
                    total: totalOperating,
                },
                investing: {
                    description: 'Investing cash flow from non-current asset changes',
                    items: investing.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
                    total: totalInvesting,
                },
                financing: {
                    description: 'Financing cash flow from equity and long-term liability changes',
                    items: financing.sort((a, b) => a.accountCode.localeCompare(b.accountCode)),
                    total: totalFinancing,
                },
            },
            netCashFlow,
            openingCash,
            closingCash,
            cashChangeVariance,
        }
    }

    async getTrialBalance(userId: string, companyId: string, opts: { asOf?: string } = {}) {
        await this.assertAccess(userId, companyId)
        const asOf = opts.asOf ? new Date(opts.asOf) : new Date()
        if (opts.asOf && Number.isNaN(asOf.getTime())) throw new BadRequestException('Invalid asOf date')
        return this._buildTrialBalance(companyId, asOf)
    }

    private _roundMoney(value: number, decimals = 2): number {
        const factor = Math.pow(10, decimals)
        return Math.round((value + Number.EPSILON) * factor) / factor
    }

    private async _getAccountBalances(companyId: string, asOf: Date) {
        const accounts = await this.prisma.account.findMany({
            where: { companyId, deletedAt: null, isActive: true, isHeader: false },
            include: {
                type: { select: { name: true, category: true, normalSide: true } },
                AccountSubType: { select: { name: true } },
                journalLines: {
                    where: { journal: { postingStatus: 'POSTED', deletedAt: null, date: { lte: asOf } } },
                    select: { debit: true, credit: true },
                },
            },
            orderBy: { code: 'asc' },
        })

        return accounts.map((account) => {
            const totalDebit = account.journalLines.reduce((sum, line) => sum + Number(line.debit ?? 0), 0)
            const totalCredit = account.journalLines.reduce((sum, line) => sum + Number(line.credit ?? 0), 0)
            const accountType = account.type?.category ?? 'ASSET'
            const netBalance = this._roundMoney(totalDebit - totalCredit)
            return {
                accountId: account.id,
                accountCode: account.code,
                accountName: account.name,
                accountType,
                accountSubtype: account.AccountSubType?.name ?? undefined,
                totalDebit: this._roundMoney(totalDebit),
                totalCredit: this._roundMoney(totalCredit),
                netBalance,
            }
        })
    }

    private async _getAccountBalancesForPeriod(companyId: string, from: Date, to: Date) {
        const accounts = await this.prisma.account.findMany({
            where: { companyId, deletedAt: null, isActive: true, isHeader: false },
            include: {
                type: { select: { name: true, category: true, normalSide: true } },
                AccountSubType: { select: { name: true } },
                journalLines: {
                    where: { journal: { postingStatus: 'POSTED', deletedAt: null, date: { gte: from, lte: to } } },
                    select: { debit: true, credit: true },
                },
            },
            orderBy: { code: 'asc' },
        })

        return accounts.map((account) => {
            const totalDebit = account.journalLines.reduce((sum, line) => sum + Number(line.debit ?? 0), 0)
            const totalCredit = account.journalLines.reduce((sum, line) => sum + Number(line.credit ?? 0), 0)
            const accountType = account.type?.category ?? 'ASSET'
            const netBalance = this._roundMoney(totalDebit - totalCredit)
            return {
                accountId: account.id,
                accountCode: account.code,
                accountName: account.name,
                accountType,
                accountSubtype: account.AccountSubType?.name ?? undefined,
                totalDebit: this._roundMoney(totalDebit),
                totalCredit: this._roundMoney(totalCredit),
                netBalance,
            }
        })
    }

    private async _calculateProfitAndLoss(companyId: string, from: Date, to: Date) {
        const balances = await this._getAccountBalancesForPeriod(companyId, from, to)
        const revenueRows = balances
            .filter((row) => row.accountType?.toUpperCase().includes('REVENUE'))
            .map((row) => ({
                accountId: row.accountId,
                accountCode: row.accountCode,
                accountName: row.accountName,
                totalDebit: row.totalDebit,
                totalCredit: row.totalCredit,
                netBalance: this._roundMoney(-row.netBalance),
            }))
            .sort((a, b) => a.accountCode.localeCompare(b.accountCode))

        const expenseRows = balances
            .filter((row) => row.accountType?.toUpperCase().includes('EXPENSE'))
            .map((row) => ({
                accountId: row.accountId,
                accountCode: row.accountCode,
                accountName: row.accountName,
                totalDebit: row.totalDebit,
                totalCredit: row.totalCredit,
                netBalance: this._roundMoney(row.netBalance),
            }))
            .sort((a, b) => a.accountCode.localeCompare(b.accountCode))

        const totalRevenue = this._roundMoney(revenueRows.reduce((sum, row) => sum + row.netBalance, 0))
        const totalExpenses = this._roundMoney(expenseRows.reduce((sum, row) => sum + row.netBalance, 0))
        const netIncome = this._roundMoney(totalRevenue - totalExpenses)

        return {
            companyId,
            from,
            to,
            generatedAt: new Date(),
            sections: {
                revenue: { accounts: revenueRows, total: totalRevenue },
                expenses: { accounts: expenseRows, total: totalExpenses },
            },
            totalRevenue,
            totalExpenses,
            netIncome,
        }
    }

    private async _buildTrialBalance(companyId: string, asOf: Date) {
        const accounts = await this._getAccountBalances(companyId, asOf)
        const totals = {
            totalDebit: this._roundMoney(accounts.reduce((sum, account) => sum + account.totalDebit, 0)),
            totalCredit: this._roundMoney(accounts.reduce((sum, account) => sum + account.totalCredit, 0)),
            netBalance: this._roundMoney(accounts.reduce((sum, account) => sum + account.netBalance, 0)),
        }

        return {
            companyId,
            asOf,
            generatedAt: new Date(),
            accounts,
            totals,
        }
    }

    private async _buildBalanceSheet(companyId: string, asOf: Date) {
        const balances = await this._getAccountBalances(companyId, asOf)
        const assets: any[] = []
        const liabilities: any[] = []
        const equity: any[] = []

        for (const row of balances) {
            if (row.accountType === 'ASSET') {
                assets.push({ accountId: row.accountId, accountCode: row.accountCode, accountName: row.accountName, accountType: row.accountType, accountSubtype: row.accountSubtype, balance: row.netBalance })
            } else if (row.accountType === 'LIABILITY') {
                liabilities.push({ accountId: row.accountId, accountCode: row.accountCode, accountName: row.accountName, accountType: row.accountType, accountSubtype: row.accountSubtype, balance: this._roundMoney(-row.netBalance) })
            } else if (row.accountType === 'EQUITY') {
                equity.push({ accountId: row.accountId, accountCode: row.accountCode, accountName: row.accountName, accountType: row.accountType, accountSubtype: row.accountSubtype, balance: this._roundMoney(-row.netBalance) })
            }
        }

        const totalAssets = this._roundMoney(assets.reduce((sum, account) => sum + account.balance, 0))
        const totalLiabilities = this._roundMoney(liabilities.reduce((sum, account) => sum + account.balance, 0))
        const totalEquity = this._roundMoney(equity.reduce((sum, account) => sum + account.balance, 0))
        const isBalanced = Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01

        return {
            companyId,
            asOf,
            generatedAt: new Date(),
            sections: {
                assets: { accounts: assets, total: totalAssets },
                liabilities: { accounts: liabilities, total: totalLiabilities },
                equity: { accounts: equity, total: totalEquity },
            },
            totalAssets,
            totalLiabilities,
            totalEquity,
            isBalanced,
        }
    }

    // ─── Snapshots ───────────────────────────────────────────────────────────

    async saveSnapshot(userId: string, companyId: string, type: string, period: string) {
        await this.assertAccess(userId, companyId)
        const workspaceId = await this.getWorkspaceId(companyId)
        const now = new Date()
        const from = new Date(now.getFullYear(), 0, 1)
        let data: any
        if (type === 'INCOME_STATEMENT') data = await this.repo.getProfitAndLoss(companyId, from, now)
        else if (type === 'BALANCE_SHEET') data = await this.repo.getBalanceSheet(companyId, now)
        else if (type === 'CASH_FLOW') data = await this.repo.getCashFlow(companyId, from, now)
        else throw new BadRequestException(`Unsupported snapshot type: ${type}`)
        return this.repo.saveSnapshot(workspaceId, type, period, data)
    }

    async listSnapshots(userId: string, companyId: string, type?: string) {
        await this.assertAccess(userId, companyId)
        const workspaceId = await this.getWorkspaceId(companyId)
        return this.repo.listSnapshots(workspaceId, type)
    }

    // ─── Budgets ──────────────────────────────────────────────────────────────

    async listBudgets(userId: string, companyId: string) {
        const workspaceId = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        return this.repo.findBudgets(workspaceId)
    }

    async getBudget(userId: string, companyId: string, budgetId: string) {
        const workspaceId = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const b = await this.repo.findBudgetById(workspaceId, budgetId)
        if (!b) throw new NotFoundException('Budget not found')
        return b
    }

    async createBudget(userId: string, companyId: string, data: any) {
        const workspaceId = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        if (!data.name) throw new BadRequestException('name is required')
        if (!data.fiscalYear) throw new BadRequestException('fiscalYear is required')
        return this.repo.createBudget(workspaceId, data)
    }

    async getBudgetVsActual(userId: string, companyId: string, budgetId: string, opts: { from?: string; to?: string }) {
        const workspaceId = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const now = new Date()
        const from = opts.from ? new Date(opts.from) : new Date(now.getFullYear(), 0, 1)
        const to = opts.to ? new Date(opts.to) : now
        const result = await this.repo.getBudgetVsActual(workspaceId, budgetId, from, to)
        if (!result) throw new NotFoundException('Budget not found')
        return result
    }

    // ─── KPI Dashboards ───────────────────────────────────────────────────────

    async listDashboards(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        return this.repo.findDashboards(companyId)
    }

    async createDashboard(userId: string, companyId: string, data: any) {
        const workspaceId = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        if (!data.name) throw new BadRequestException('name is required')
        return this.repo.createDashboard(companyId, workspaceId, { ...data, ownerId: userId })
    }

    // ─── Quick KPIs ───────────────────────────────────────────────────────────

    async getQuickKpis(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        const now = new Date()
        const startOfYear = new Date(now.getFullYear(), 0, 1)

        const [pnl, overdue, unpaidBills] = await Promise.all([
            this.repo.getProfitAndLoss(companyId, startOfYear, now),
            this.prisma.invoice.aggregate({
                where: { companyId, status: { in: ['SENT', 'PARTIAL', 'OVERDUE'] as any }, balance: { gt: 0 }, dueDate: { lt: now }, deletedAt: null },
                _sum: { balance: true }, _count: true,
            }),
            this.prisma.bill.aggregate({
                where: { companyId, status: { in: ['APPROVED'] as any }, balance: { gt: 0 }, dueAt: { lt: now }, deletedAt: null },
                _sum: { balance: true }, _count: true,
            }),
        ])

        return {
            revenue: pnl.totalRevenue,
            expenses: pnl.totalExpenses,
            netIncome: pnl.netIncome,
            overdueReceivables: { amount: Number(overdue._sum.balance ?? 0), count: overdue._count },
            overdueBills: { amount: Number(unpaidBills._sum.balance ?? 0), count: unpaidBills._count },
            generatedAt: now.toISOString(),
        }
    }

    // ─── ESG Metrics ─────────────────────────────────────────────────────────────

    async getEsgMetrics(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        const now = new Date()
        const startOfYear = new Date(now.getFullYear(), 0, 1)
        const workspaceId = await this.getWorkspaceId(companyId)

        const [employeeCount, pnl, customerCount, vendorCount] = await Promise.all([
            this.prisma.employee.count({ where: { companyId, deletedAt: null } }).catch(() => 0),
            this.repo.getProfitAndLoss(companyId, startOfYear, now).catch(() => ({ totalRevenue: 0, totalExpenses: 0, netIncome: 0 })),
            this.prisma.customer.count({ where: { workspaceId, deletedAt: null } }).catch(() => 0),
            this.prisma.contact.count({ where: { workspaceId, deletedAt: null } }).catch(() => 0),
        ])

        const metrics = [
            { category: 'Governance', metric: 'Revenue YTD', value: String(Math.round(pnl.totalRevenue)), unit: 'PHP', trend: pnl.netIncome > 0 ? 'up' : 'down' },
            { category: 'Governance', metric: 'Net Income YTD', value: String(Math.round(pnl.netIncome)), unit: 'PHP', trend: pnl.netIncome > 0 ? 'up' : 'down' },
            { category: 'Social', metric: 'Employee Headcount', value: String(employeeCount), unit: 'FTE', trend: 'stable' },
            { category: 'Social', metric: 'Active Customers', value: String(customerCount), unit: 'accounts', trend: customerCount > 0 ? 'up' : 'stable' },
            { category: 'Social', metric: 'Active Vendors', value: String(vendorCount), unit: 'accounts', trend: vendorCount > 0 ? 'up' : 'stable' },
            { category: 'Governance', metric: 'Expense Ratio', value: pnl.totalRevenue > 0 ? String(Math.round((pnl.totalExpenses / pnl.totalRevenue) * 100)) : '0', unit: '%', trend: pnl.totalRevenue > 0 && pnl.totalExpenses / pnl.totalRevenue < 0.8 ? 'up' : 'stable' },
        ]

        return { metrics, generatedAt: now.toISOString() }
    }
}
