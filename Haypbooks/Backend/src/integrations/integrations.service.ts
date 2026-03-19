import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { IntegrationsRepository } from './integrations.repository'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class IntegrationsService {
    constructor(private readonly repo: IntegrationsRepository, private readonly prisma: PrismaService) { }

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

    // ─── AI Insights ──────────────────────────────────────────────────────────

    async listInsights(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        return this.repo.findInsights(companyId, {
            insightType: opts.insightType, severity: opts.severity, status: opts.status,
            limit: opts.limit ? parseInt(opts.limit) : 20,
            offset: opts.offset ? parseInt(opts.offset) : 0,
        })
    }

    async getInsight(userId: string, companyId: string, insightId: string) {
        await this.assertAccess(userId, companyId)
        const insight = await this.repo.findInsightById(companyId, insightId)
        if (!insight) throw new NotFoundException('Insight not found')
        return insight
    }

    async dismissInsight(userId: string, companyId: string, insightId: string) {
        await this.assertAccess(userId, companyId)
        const insight = await this.repo.findInsightById(companyId, insightId)
        if (!insight) throw new NotFoundException('Insight not found')
        return this.repo.dismissInsight(insightId)
    }

    async resolveInsight(userId: string, companyId: string, insightId: string, data: { actionTaken: string }) {
        await this.assertAccess(userId, companyId)
        if (!data.actionTaken) throw new BadRequestException('actionTaken is required')
        const insight = await this.repo.findInsightById(companyId, insightId)
        if (!insight) throw new NotFoundException('Insight not found')
        return this.repo.resolveInsight(insightId, data.actionTaken)
    }

    async generateInsights(userId: string, companyId: string) {
        const workspaceId = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        return this.repo.generateInsights(companyId, workspaceId)
    }

    // ─── Audit Logs ───────────────────────────────────────────────────────────

    async listAuditLogs(userId: string, companyId: string, opts: any) {
        const workspaceId = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        return this.repo.findAuditLogs(workspaceId, {
            companyId, tableName: opts.tableName, userId: opts.userId,
            from: opts.from ? new Date(opts.from) : undefined,
            to: opts.to ? new Date(opts.to) : undefined,
            limit: opts.limit ? parseInt(opts.limit) : 50,
            offset: opts.offset ? parseInt(opts.offset) : 0,
        })
    }

    // ─── API Keys ─────────────────────────────────────────────────────────────

    async listApiKeys(userId: string, companyId: string) {
        const workspaceId = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        return this.repo.findApiKeys(workspaceId)
    }

    async createApiKey(userId: string, companyId: string, data: any) {
        const workspaceId = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        if (!data.name) throw new BadRequestException('name is required')
        if (!data.systemType) throw new BadRequestException('systemType is required')
        return this.repo.createApiKey(workspaceId, {
            name: data.name, systemType: data.systemType, ownerId: userId,
            permissions: data.permissions ?? { read: true, write: false },
            expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
            rateLimit: data.rateLimit ? parseInt(data.rateLimit) : 1000,
        })
    }

    async revokeApiKey(userId: string, companyId: string, keyId: string) {
        const workspaceId = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        const key = await this.prisma.apiKey.findFirst({ where: { id: keyId, workspaceId, revokedAt: null } })
        if (!key) throw new NotFoundException('API key not found or already revoked')
        return this.repo.revokeApiKey(workspaceId, keyId)
    }

    // ─── Bank Feed ────────────────────────────────────────────────────────────

    async listBankFeedConnections(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        return this.repo.findBankFeedConnections(companyId)
    }

    async listBankFeedImports(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        return this.repo.findBankFeedImports(companyId, opts.limit ? parseInt(opts.limit) : 20)
    }
}
