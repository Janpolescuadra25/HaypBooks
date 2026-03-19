import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class OrganizationService {
    constructor(private readonly prisma: PrismaService) { }

    private async assertAccess(userId: string, companyId: string) {
        const m = await this.prisma.workspaceUser.findFirst({
            where: { status: 'ACTIVE', userId, workspace: { companies: { some: { id: companyId } } } },
        })
        if (!m) throw new ForbiddenException('Access denied')
    }

    private async getWorkspaceId(companyId: string) {
        const company = await this.prisma.company.findUnique({ where: { id: companyId }, select: { workspaceId: true } })
        if (!company) throw new NotFoundException('Company not found')
        return company.workspaceId
    }

    // ─── Legal Entities ───────────────────────────────────────────────────────

    async listLegalEntities(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        return this.prisma.legalEntity.findMany({ where: { companyId }, orderBy: { name: 'asc' } })
    }

    async createLegalEntity(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.name) throw new BadRequestException('name is required')
        return this.prisma.legalEntity.create({
            data: {
                companyId,
                name: data.name,
                legalName: data.legalName,
                entityType: data.entityType ?? 'SUBSIDIARY',
                taxId: data.taxId,
                registrationNo: data.registrationNo,
                jurisdiction: data.jurisdiction,
                currency: data.currency ?? 'PHP',
                isActive: data.isActive ?? true,
            },
        })
    }

    async updateLegalEntity(userId: string, companyId: string, id: string, data: any) {
        await this.assertAccess(userId, companyId)
        const existing = await this.prisma.legalEntity.findFirst({ where: { id, companyId } })
        if (!existing) throw new NotFoundException('Legal entity not found')
        return this.prisma.legalEntity.update({ where: { id }, data })
    }

    async deleteLegalEntity(userId: string, companyId: string, id: string) {
        await this.assertAccess(userId, companyId)
        const existing = await this.prisma.legalEntity.findFirst({ where: { id, companyId } })
        if (!existing) throw new NotFoundException('Legal entity not found')
        return this.prisma.legalEntity.delete({ where: { id } })
    }

    // ─── Consolidation Groups ─────────────────────────────────────────────────

    async listConsolidationGroups(userId: string, companyId: string) {
        const workspaceId = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        return this.prisma.consolidationGroup.findMany({
            where: { workspaceId },
            include: { members: true },
            orderBy: { name: 'asc' },
        })
    }

    async createConsolidationGroup(userId: string, companyId: string, data: any) {
        const workspaceId = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        if (!data.name) throw new BadRequestException('name is required')
        return this.prisma.consolidationGroup.create({
            data: { workspaceId, name: data.name, baseCurrency: data.baseCurrency ?? 'USD' },
        })
    }

    // ─── Intercompany Transactions ────────────────────────────────────────────

    async listIntercompanyTransactions(userId: string, companyId: string, opts: any) {
        await this.assertAccess(userId, companyId)
        return this.prisma.intercompanyTransaction.findMany({
            where: {
                OR: [{ fromCompanyId: companyId }, { toCompanyId: companyId }],
                ...(opts.status ? { status: opts.status } : {}),
            },
            orderBy: { transactionDate: 'desc' },
            take: opts.limit ? parseInt(opts.limit) : 50,
            skip: opts.offset ? parseInt(opts.offset) : 0,
        })
    }

    async createIntercompanyTransaction(userId: string, companyId: string, data: any) {
        const workspaceId = await this.getWorkspaceId(companyId)
        await this.assertAccess(userId, companyId)
        if (!data.toCompanyId) throw new BadRequestException('toCompanyId is required')
        if (!data.amount) throw new BadRequestException('amount is required')
        if (!data.transactionDate) throw new BadRequestException('transactionDate is required')
        return this.prisma.intercompanyTransaction.create({
            data: {
                workspaceId,
                fromCompanyId: companyId,
                toCompanyId: data.toCompanyId,
                amount: Number(data.amount),
                currency: data.currency ?? 'USD',
                transactionDate: new Date(data.transactionDate),
                description: data.description,
            },
        })
    }

    // ─── Departments ──────────────────────────────────────────────────────────
    // NOTE: Department model exists in schema but may not be in the generated
    // Prisma client yet. Use dynamic access with catch() for resilience.

    async listDepartments(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        return (this.prisma as any).department?.findMany({ where: { companyId }, orderBy: { name: 'asc' } }) ?? []
    }

    async createDepartment(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.name) throw new BadRequestException('name is required')
        return (this.prisma as any).department?.create({
            data: { companyId, name: data.name, code: data.code, description: data.description, managerId: data.managerId, parentId: data.parentId, isActive: data.isActive ?? true },
        })
    }

    async updateDepartment(userId: string, companyId: string, id: string, data: any) {
        await this.assertAccess(userId, companyId)
        const existing = await ((this.prisma as any).department?.findFirst({ where: { id, companyId } })) ?? null
        if (!existing) throw new NotFoundException('Department not found')
        return (this.prisma as any).department?.update({ where: { id }, data })
    }

    async deleteDepartment(userId: string, companyId: string, id: string) {
        await this.assertAccess(userId, companyId)
        const existing = await ((this.prisma as any).department?.findFirst({ where: { id, companyId } })) ?? null
        if (!existing) throw new NotFoundException('Department not found')
        return (this.prisma as any).department?.delete({ where: { id } })
    }

    // ─── Locations & Divisions ────────────────────────────────────────────────

    async listLocations(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        return this.prisma.location.findMany({ where: { companyId }, orderBy: { name: 'asc' } })
    }

    async createLocation(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.name) throw new BadRequestException('name is required')
        return this.prisma.location.create({
            data: { companyId, name: data.name, address: data.address, isActive: data.isActive ?? true },
        })
    }

    async updateLocation(userId: string, companyId: string, id: string, data: any) {
        await this.assertAccess(userId, companyId)
        const existing = await this.prisma.location.findFirst({ where: { id, companyId } })
        if (!existing) throw new NotFoundException('Location not found')
        return this.prisma.location.update({ where: { id }, data: { name: data.name, address: data.address, isActive: data.isActive } })
    }

    async deleteLocation(userId: string, companyId: string, id: string) {
        await this.assertAccess(userId, companyId)
        const existing = await this.prisma.location.findFirst({ where: { id, companyId } })
        if (!existing) throw new NotFoundException('Location not found')
        return this.prisma.location.delete({ where: { id } })
    }

    // ─── Filing Calendar ──────────────────────────────────────────────────────

    async listFilingCalendars(userId: string, companyId: string) {
        await this.assertAccess(userId, companyId)
        return this.prisma.filingCalendar.findMany({ where: { companyId }, orderBy: { title: 'asc' } })
    }

    async createFilingCalendar(userId: string, companyId: string, data: any) {
        await this.assertAccess(userId, companyId)
        if (!data.title) throw new BadRequestException('title is required')
        if (!data.filingType) throw new BadRequestException('filingType is required')
        if (!data.frequency) throw new BadRequestException('frequency is required')
        return this.prisma.filingCalendar.create({
            data: { companyId, title: data.title, filingType: data.filingType, frequency: data.frequency, dueDay: data.dueDay ? Number(data.dueDay) : null, dueMonth: data.dueMonth ? Number(data.dueMonth) : null, agencyId: data.agencyId, formType: data.formType, notes: data.notes, isActive: data.isActive ?? true },
        })
    }

    async updateFilingCalendar(userId: string, companyId: string, id: string, data: any) {
        await this.assertAccess(userId, companyId)
        const existing = await this.prisma.filingCalendar.findFirst({ where: { id, companyId } })
        if (!existing) throw new NotFoundException('Filing calendar not found')
        return this.prisma.filingCalendar.update({ where: { id }, data })
    }

    async deleteFilingCalendar(userId: string, companyId: string, id: string) {
        await this.assertAccess(userId, companyId)
        const existing = await this.prisma.filingCalendar.findFirst({ where: { id, companyId } })
        if (!existing) throw new NotFoundException('Filing calendar not found')
        return this.prisma.filingCalendar.delete({ where: { id } })
    }
}
