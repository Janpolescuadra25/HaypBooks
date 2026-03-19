import { Injectable } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'
import crypto from 'crypto'

@Injectable()
export class IntegrationsRepository {
    constructor(private readonly prisma: PrismaService) { }

    // ─── AI Insights ──────────────────────────────────────────────────────────

    async findInsights(companyId: string, opts: {
        insightType?: string; severity?: string; status?: string; limit?: number; offset?: number
    } = {}) {
        return this.prisma.aiInsight.findMany({
            where: {
                companyId,
                status: { not: 'ARCHIVED' as any },
                ...(opts.insightType ? { insightType: opts.insightType as any } : {}),
                ...(opts.severity ? { severity: opts.severity as any } : {}),
                ...(opts.status ? { status: opts.status as any } : {}),
            },
            orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
            take: opts.limit ?? 20,
            skip: opts.offset ?? 0,
        })
    }

    async findInsightById(companyId: string, insightId: string) {
        return this.prisma.aiInsight.findFirst({
            where: { id: insightId, companyId },
            include: { comments: { orderBy: { createdAt: 'asc' } }, metrics: true, attachments: true },
        })
    }

    async dismissInsight(insightId: string) {
        return this.prisma.aiInsight.update({
            where: { id: insightId },
            data: { status: 'DISMISSED' as any, dismissedAt: new Date() },
        })
    }

    async resolveInsight(insightId: string, actionTaken: string) {
        return this.prisma.aiInsight.update({
            where: { id: insightId },
            data: { status: 'RESOLVED' as any, resolvedAt: new Date(), actionTaken },
        })
    }

    async generateInsights(companyId: string, workspaceId: string) {
        // Generate rule-based insights from live data
        const now = new Date()
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        const insights: any[] = []

        // Insight 1: Overdue invoices > 30 days
        const overdueInvoices = await this.prisma.invoice.aggregate({
            where: { companyId, dueDate: { lt: thirtyDaysAgo }, balance: { gt: 0 }, deletedAt: null },
            _sum: { balance: true }, _count: true,
        })
        if (overdueInvoices._count > 0) {
            insights.push({
                workspaceId, companyId, insightType: 'CASH_FLOW' as any, severity: 'HIGH' as any,
                confidence: 0.95, status: 'ACTIVE' as any, title: 'Overdue Invoices Detected',
                description: `${overdueInvoices._count} invoices totaling ${overdueInvoices._sum.balance} are overdue by more than 30 days.`,
                data: { count: overdueInvoices._count, amount: overdueInvoices._sum.balance },
                recommendations: ['Send payment reminders', 'Review credit terms', 'Consider factoring receivables'],
            })
        }

        // Insight 2: High overdue bills
        const overdueBills = await this.prisma.bill.aggregate({
            where: { companyId, dueAt: { lt: now }, balance: { gt: 0 }, deletedAt: null },
            _sum: { balance: true }, _count: true,
        })
        if (overdueBills._count > 0) {
            insights.push({
                workspaceId, companyId, insightType: 'COST_SAVINGS' as any, severity: 'MEDIUM' as any,
                confidence: 0.90, status: 'ACTIVE' as any, title: 'Overdue Bills Require Attention',
                description: `${overdueBills._count} overdue bills totaling ${overdueBills._sum.balance} may incur late fees.`,
                data: { count: overdueBills._count, amount: overdueBills._sum.balance },
                recommendations: ['Prioritize payment to avoid penalties', 'Review cash position'],
            })
        }

        // Insight 3: Undeposited funds
        const undepositedCount = await this.prisma.paymentReceived.count({
            where: { companyId, isDeposited: false, deletedAt: null },
        })
        if (undepositedCount > 5) {
            insights.push({
                workspaceId, companyId, insightType: 'CASH_FLOW' as any, severity: 'LOW' as any,
                confidence: 0.85, status: 'ACTIVE' as any, title: 'Funds Awaiting Deposit',
                description: `${undepositedCount} payments have not been deposited yet.`,
                data: { count: undepositedCount },
                recommendations: ['Create a bank deposit to clear undeposited funds'],
            })
        }

        if (!insights.length) {
            return { generated: 0, message: 'No new insights at this time' }
        }
        await this.prisma.aiInsight.createMany({ data: insights })
        return { generated: insights.length, insights }
    }

    // ─── Audit Logs ───────────────────────────────────────────────────────────

    async findAuditLogs(workspaceId: string, opts: {
        companyId?: string; tableName?: string; userId?: string; from?: Date; to?: Date; limit?: number; offset?: number
    } = {}) {
        return this.prisma.auditLog.findMany({
            where: {
                workspaceId,
                ...(opts.companyId ? { companyId: opts.companyId } : {}),
                ...(opts.tableName ? { tableName: opts.tableName } : {}),
                ...(opts.userId ? { userId: opts.userId } : {}),
                ...(opts.from || opts.to ? { createdAt: { ...(opts.from ? { gte: opts.from } : {}), ...(opts.to ? { lte: opts.to } : {}) } } : {}),
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                lines: { where: { isSensitive: false } },
            },
            orderBy: { createdAt: 'desc' },
            take: opts.limit ?? 50,
            skip: opts.offset ?? 0,
        })
    }

    // ─── API Keys ─────────────────────────────────────────────────────────────

    async findApiKeys(workspaceId: string) {
        return this.prisma.apiKey.findMany({
            where: { workspaceId, revokedAt: null },
            include: { owner: { select: { id: true, name: true, email: true } } },
            orderBy: { createdAt: 'desc' },
        })
    }

    async createApiKey(workspaceId: string, data: {
        name: string; systemType: string; ownerId: string
        permissions: Record<string, boolean>; expiresAt?: Date; rateLimit?: number
    }) {
        const rawKey = `hpb_${crypto.randomBytes(32).toString('hex')}`
        return this.prisma.apiKey.create({
            data: {
                workspaceId, key: rawKey, name: data.name, systemType: data.systemType,
                ownerId: data.ownerId, permissions: data.permissions,
                expiresAt: data.expiresAt ?? null, rateLimit: data.rateLimit ?? 1000,
            },
            select: {
                id: true, name: true, key: true, systemType: true, permissions: true,
                expiresAt: true, rateLimit: true, createdAt: true,
            },
        })
    }

    async revokeApiKey(workspaceId: string, keyId: string) {
        return this.prisma.apiKey.update({
            where: { id: keyId },
            data: { revokedAt: new Date() },
        })
    }

    // ─── Bank Feed Integration ────────────────────────────────────────────────

    async findBankFeedConnections(companyId: string) {
        return this.prisma.bankFeedConnection.findMany({
            where: { companyId },
            include: {
                accounts: { include: { bankAccount: { select: { id: true, name: true } } } },
                imports: { orderBy: { startedAt: 'desc' }, take: 3 },
            },
            orderBy: { createdAt: 'desc' },
        })
    }

    async findBankFeedImports(companyId: string, limit = 20) {
        return this.prisma.bankFeedImport.findMany({
            where: { companyId },
            include: { connection: { select: { id: true, provider: true } } },
            orderBy: { startedAt: 'desc' },
            take: limit,
        })
    }
}
