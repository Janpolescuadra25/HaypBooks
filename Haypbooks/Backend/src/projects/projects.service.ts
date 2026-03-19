import { Injectable, NotFoundException } from '@nestjs/common'
import { ProjectsRepository } from './projects.repository'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class ProjectsService {
    constructor(private readonly repo: ProjectsRepository, private readonly prisma: PrismaService) { }

    // ─── Projects CRUD ────────────────────────────────────────────────────────

    async listProjects(userId: string, companyId: string, query: any = {}) {
        return this.repo.findProjects(companyId, {
            status: query.status,
            search: query.search,
            limit: query.limit ? parseInt(query.limit) : undefined,
            offset: query.offset ? parseInt(query.offset) : undefined,
        })
    }

    async createProject(userId: string, companyId: string, body: any) {
        return this.repo.createProject(companyId, {
            name: body.name,
            code: body.code,
            description: body.description,
            customerId: body.customerId,
            startDate: body.startDate ? new Date(body.startDate) : undefined,
            endDate: body.endDate ? new Date(body.endDate) : undefined,
            status: body.status,
            currency: body.currency,
        })
    }

    async getProject(userId: string, companyId: string, projectId: string) {
        const project = await this.repo.findProjectById(companyId, projectId)
        if (!project) throw new NotFoundException('Project not found')
        return project
    }

    async updateProject(userId: string, companyId: string, projectId: string, body: any) {
        await this.getProject(userId, companyId, projectId)
        return this.repo.updateProject(companyId, projectId, body)
    }

    async deleteProject(userId: string, companyId: string, projectId: string) {
        await this.getProject(userId, companyId, projectId)
        return this.repo.deleteProject(companyId, projectId)
    }

    // ─── Milestones ───────────────────────────────────────────────────────────

    async listMilestones(userId: string, companyId: string, projectId: string) {
        return this.repo.findMilestones(companyId, projectId)
    }

    async createMilestone(userId: string, companyId: string, projectId: string, body: any) {
        return this.repo.createMilestone(companyId, projectId, {
            name: body.name,
            dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
            amount: body.amount,
        })
    }

    async updateMilestone(userId: string, companyId: string, projectId: string, milestoneId: string, body: any) {
        return this.repo.updateMilestone(milestoneId, body)
    }

    // ─── Budget ───────────────────────────────────────────────────────────────

    async getProjectBudget(userId: string, companyId: string, projectId: string) {
        return this.repo.getProjectBudget(companyId, projectId)
    }

    async updateProjectBudget(userId: string, companyId: string, projectId: string, body: any) {
        return this.repo.upsertProjectBudget(companyId, projectId, body)
    }

    // ─── Tasks ────────────────────────────────────────────────────────────────

    async listProjectTasks(userId: string, companyId: string, projectId: string, query: any = {}) {
        return this.repo.findProjectTasks(companyId, projectId, query)
    }

    async createProjectTask(userId: string, companyId: string, projectId: string, body: any) {
        return this.repo.createProjectTask(companyId, projectId, {
            title: body.title,
            description: body.description,
            assigneeId: body.assigneeId,
            dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
            status: body.status,
        })
    }

    // ─── Time Entries ─────────────────────────────────────────────────────────

    async listProjectTimeEntries(userId: string, companyId: string, projectId: string, query: any = {}) {
        return this.repo.findProjectTimeEntries(companyId, projectId, query)
    }

    async createProjectTimeEntry(userId: string, companyId: string, projectId: string, body: any) {
        return this.repo.createProjectTimeEntry(companyId, projectId, userId, {
            date: body.date ? new Date(body.date) : new Date(),
            hours: body.hours,
            description: body.description,
            billable: body.billable,
            rate: body.rate,
        })
    }

    // ─── Expenses ─────────────────────────────────────────────────────────────

    async listProjectExpenses(userId: string, companyId: string, projectId: string) {
        return this.repo.findProjectExpenses(companyId, projectId)
    }

    async createProjectExpense(userId: string, companyId: string, projectId: string, body: any) {
        return this.repo.createProjectExpense(companyId, projectId, {
            date: body.date ? new Date(body.date) : new Date(),
            description: body.description,
            amount: body.amount,
            category: body.category,
            billable: body.billable,
        })
    }

    // ─── Profitability & WIP ──────────────────────────────────────────────────

    async getProjectProfitability(userId: string, companyId: string, projectId: string) {
        return this.repo.getProjectProfitability(companyId, projectId)
    }

    async getWip(userId: string, companyId: string) {
        return this.repo.getWip(companyId)
    }

    // ─── Change Orders ────────────────────────────────────────────────────────

    async listChangeOrders(userId: string, companyId: string, query: any = {}) {
        return this.repo.findChangeOrders(companyId, { projectId: query.projectId })
    }

    async createChangeOrder(userId: string, companyId: string, body: any) {
        return this.repo.createChangeOrder(companyId, body)
    }

    // ─── Retainers ────────────────────────────────────────────────────────────

    async listRetainers(userId: string, companyId: string, projectId: string) {
        return this.prisma.projectRetainer.findMany({
            where: { companyId, projectId },
            orderBy: { receivedDate: 'desc' },
        })
    }

    async createRetainer(userId: string, companyId: string, projectId: string, data: any) {
        if (!data.customerId) throw new Error('customerId is required')
        if (!data.amount) throw new Error('amount is required')
        if (!data.receivedDate) throw new Error('receivedDate is required')
        return this.prisma.projectRetainer.create({
            data: {
                companyId,
                projectId,
                customerId: data.customerId,
                amount: Number(data.amount),
                remainingAmount: Number(data.remainingAmount ?? data.amount),
                usedAmount: Number(data.usedAmount ?? 0),
                receivedDate: new Date(data.receivedDate),
                status: data.status ?? 'OPEN',
                notes: data.notes,
            },
        })
    }

    // ─── Flat Retainers (company-wide without projectId) ─────────────────────

    private async getOrCreateDefaultProject(companyId: string): Promise<string> {
        let project = await this.prisma.project.findFirst({ where: { companyId }, orderBy: { createdAt: 'asc' } })
        if (!project) {
            const company = await this.prisma.company.findUnique({ where: { id: companyId }, select: { workspaceId: true } })
            if (!company) throw new NotFoundException('Company not found')
            project = await this.prisma.project.create({
                data: { companyId, workspaceId: company.workspaceId, name: 'General', status: 'ACTIVE' },
            })
        }
        return project.id
    }

    async listAllRetainers(userId: string, companyId: string) {
        return this.prisma.projectRetainer.findMany({
            where: { companyId },
            include: { project: { select: { name: true } } },
            orderBy: { receivedDate: 'desc' },
        })
    }

    async createFlatRetainer(userId: string, companyId: string, data: any) {
        const projectId = data.projectId ?? await this.getOrCreateDefaultProject(companyId)
        return this.prisma.projectRetainer.create({
            data: {
                companyId,
                projectId,
                customerId: data.clientName ?? data.customerId ?? 'Unknown',
                amount: Number(data.monthlyAmount ?? data.amount ?? 0),
                remainingAmount: Number(data.monthlyAmount ?? data.amount ?? 0),
                usedAmount: 0,
                receivedDate: new Date(data.startDate ?? data.receivedDate ?? Date.now()),
                status: data.status ?? 'OPEN',
                notes: data.projectName ? `Project: ${data.projectName}` : (data.notes ?? null),
            },
        })
    }

    async updateFlatRetainer(userId: string, companyId: string, id: string, data: any) {
        const existing = await this.prisma.projectRetainer.findFirst({ where: { id, companyId } })
        if (!existing) throw new NotFoundException('Retainer not found')
        return this.prisma.projectRetainer.update({
            where: { id },
            data: {
                ...(data.clientName && { customerId: data.clientName }),
                ...(data.monthlyAmount != null && { amount: Number(data.monthlyAmount) }),
                ...(data.amount != null && { amount: Number(data.amount) }),
                ...(data.status && { status: data.status }),
                ...(data.notes !== undefined && { notes: data.notes }),
                ...(data.startDate && { receivedDate: new Date(data.startDate) }),
            },
        })
    }

    async deleteFlatRetainer(userId: string, companyId: string, id: string) {
        const existing = await this.prisma.projectRetainer.findFirst({ where: { id, companyId } })
        if (!existing) throw new NotFoundException('Retainer not found')
        return this.prisma.projectRetainer.delete({ where: { id } })
    }

    // ─── Resource Plans (stored as ProjectTasks with priority='RESOURCE_PLAN') ─

    async listResourcePlans(userId: string, companyId: string) {
        const projects = await this.prisma.project.findMany({ where: { companyId }, select: { id: true, name: true } })
        const projectIds = projects.map(p => p.id)
        if (!projectIds.length) return []
        const tasks = await this.prisma.projectTask.findMany({
            where: { projectId: { in: projectIds }, priority: 'RESOURCE_PLAN' },
            include: { project: { select: { name: true } } },
            orderBy: { createdAt: 'desc' },
        })
        return tasks.map(t => {
            let extra: any = {}
            try { extra = JSON.parse(t.description ?? '{}') } catch { /* empty */ }
            return {
                id: t.id,
                resourceName: t.assignedToId ?? extra.resourceName ?? 'Unassigned',
                projectName: t.project.name,
                role: t.name,
                hoursPerWeek: extra.hoursPerWeek ?? 40,
                startDate: extra.startDate ?? '',
                endDate: t.dueDate ? t.dueDate.toISOString().split('T')[0] : '',
            }
        })
    }

    async createResourcePlan(userId: string, companyId: string, data: any) {
        const projectId = await this.getOrCreateDefaultProject(companyId)
        return this.prisma.projectTask.create({
            data: {
                projectId,
                name: data.role ?? 'Resource',
                assignedToId: data.resourceName,
                description: JSON.stringify({
                    resourceName: data.resourceName,
                    projectName: data.projectName,
                    hoursPerWeek: data.hoursPerWeek ?? 40,
                    startDate: data.startDate,
                }),
                priority: 'RESOURCE_PLAN',
                status: 'TODO',
                dueDate: data.endDate ? new Date(data.endDate) : undefined,
            },
        })
    }

    async updateResourcePlan(userId: string, companyId: string, id: string, data: any) {
        const projects = await this.prisma.project.findMany({ where: { companyId }, select: { id: true } })
        const projectIds = projects.map(p => p.id)
        const existing = await this.prisma.projectTask.findFirst({ where: { id, projectId: { in: projectIds }, priority: 'RESOURCE_PLAN' } })
        if (!existing) throw new NotFoundException('Resource plan not found')
        let existingExtra: any = {}
        try { existingExtra = JSON.parse(existing.description ?? '{}') } catch { /* empty */ }
        return this.prisma.projectTask.update({
            where: { id },
            data: {
                name: data.role ?? existing.name,
                assignedToId: data.resourceName ?? existing.assignedToId,
                description: JSON.stringify({ ...existingExtra, resourceName: data.resourceName, projectName: data.projectName, hoursPerWeek: data.hoursPerWeek, startDate: data.startDate }),
                dueDate: data.endDate ? new Date(data.endDate) : existing.dueDate,
            },
        })
    }

    async deleteResourcePlan(userId: string, companyId: string, id: string) {
        const projects = await this.prisma.project.findMany({ where: { companyId }, select: { id: true } })
        const projectIds = projects.map(p => p.id)
        const existing = await this.prisma.projectTask.findFirst({ where: { id, projectId: { in: projectIds }, priority: 'RESOURCE_PLAN' } })
        if (!existing) throw new NotFoundException('Resource plan not found')
        return this.prisma.projectTask.delete({ where: { id } })
    }

    // ─── Billing ───────────────────────────────────────────────────────────────

    async listBilling(userId: string, companyId: string, projectId: string) {
        return this.prisma.projectBilling.findMany({
            where: { companyId, projectId },
            orderBy: { billingDate: 'desc' },
        })
    }

    async createBilling(userId: string, companyId: string, projectId: string, data: any) {
        if (!data.billingDate) throw new Error('billingDate is required')
        if (!data.billingType) throw new Error('billingType is required')
        if (!data.amount) throw new Error('amount is required')
        return this.prisma.projectBilling.create({
            data: {
                companyId,
                projectId,
                billingDate: new Date(data.billingDate),
                billingType: data.billingType,
                amount: Number(data.amount),
                percentage: data.percentage ? Number(data.percentage) : undefined,
                milestoneId: data.milestoneId,
                status: data.status ?? 'PENDING',
                notes: data.notes,
            },
        })
    }

    // ─── Resource Allocation ────────────────────────────────────────────────────

    async listResourceAllocations(userId: string, companyId: string, projectId: string) {
        return this.prisma.resourceAllocation.findMany({
            where: { projectId },
        })
    }

    async createResourceAllocation(userId: string, companyId: string, projectId: string, data: any) {
        if (!data.userId) throw new Error('userId is required')
        if (!data.startDate) throw new Error('startDate is required')
        if (!data.endDate) throw new Error('endDate is required')
        return this.prisma.resourceAllocation.create({
            data: {
                projectId,
                userId: data.userId,
                hoursAlloc: Number(data.hoursAlloc ?? 0),
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
            },
        })
    }
}
