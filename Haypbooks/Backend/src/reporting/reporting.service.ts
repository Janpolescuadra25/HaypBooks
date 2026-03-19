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
        if (from > to) throw new BadRequestException('from date must be before to date')
        return this.repo.getProfitAndLoss(companyId, from, to)
    }

    async getBalanceSheet(userId: string, companyId: string, opts: { asOf?: string }) {
        await this.assertAccess(userId, companyId)
        const asOf = opts.asOf ? new Date(opts.asOf) : new Date()
        return this.repo.getBalanceSheet(companyId, asOf)
    }

    async getCashFlow(userId: string, companyId: string, opts: { from?: string; to?: string }) {
        await this.assertAccess(userId, companyId)
        const now = new Date()
        const from = opts.from ? new Date(opts.from) : new Date(now.getFullYear(), 0, 1)
        const to = opts.to ? new Date(opts.to) : now
        if (from > to) throw new BadRequestException('from date must be before to date')
        return this.repo.getCashFlow(companyId, from, to)
    }

    async getTrialBalance(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        return this.repo.getTrialBalance(companyId)
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
