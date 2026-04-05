import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { EmailTemplatesRepository } from './email-templates.repository'

@Injectable()
export class EmailTemplatesService {
    constructor(
        private readonly repo: EmailTemplatesRepository,
        private readonly prisma: PrismaService,
    ) { }

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

    async listTemplates(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        return this.repo.findAll(companyId)
    }

    async getTemplate(userId: string, companyId: string, templateId: string) {
        await this.assertAccess(userId, companyId)
        const tpl = await this.repo.findById(companyId, templateId)
        if (!tpl) throw new NotFoundException('Email template not found')
        return tpl
    }

    async createTemplate(userId: string, companyId: string, body: any) {
        await this.assertAccess(userId, companyId)
        if (!body.name) throw new BadRequestException('name is required')
        if (!body.subject) throw new BadRequestException('subject is required')
        if (!body.body) throw new BadRequestException('body is required')

        const tpl = await this.repo.create(companyId, {
            name: String(body.name).slice(0, 120),
            subject: String(body.subject).slice(0, 255),
            body: String(body.body),
            tone: body.tone ?? 'professional',
            cc: body.cc ?? null,
            isDefault: Boolean(body.isDefault),
        })

        if (tpl.isDefault) {
            await this.repo.clearDefault(companyId, tpl.id)
        }

        return tpl
    }

    async updateTemplate(userId: string, companyId: string, templateId: string, body: any) {
        await this.assertAccess(userId, companyId)
        const existing = await this.repo.findById(companyId, templateId)
        if (!existing) throw new NotFoundException('Email template not found')

        const updated = await this.repo.update(templateId, {
            ...(body.name !== undefined && { name: String(body.name).slice(0, 120) }),
            ...(body.subject !== undefined && { subject: String(body.subject).slice(0, 255) }),
            ...(body.body !== undefined && { body: String(body.body) }),
            ...(body.tone !== undefined && { tone: body.tone }),
            ...(body.cc !== undefined && { cc: body.cc }),
            ...(body.isDefault !== undefined && { isDefault: Boolean(body.isDefault) }),
        })

        if (updated.isDefault) {
            await this.repo.clearDefault(companyId, templateId)
        }

        return updated
    }

    async deleteTemplate(userId: string, companyId: string, templateId: string) {
        await this.assertAccess(userId, companyId)
        const existing = await this.repo.findById(companyId, templateId)
        if (!existing) throw new NotFoundException('Email template not found')
        await this.repo.delete(templateId)
        return { success: true }
    }
}
