import { Injectable } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class ProjectsRepository {
    constructor(private readonly prisma: PrismaService) { }

    // ─── Projects ─────────────────────────────────────────────────────────────

    async findProjects(companyId: string, opts: { status?: string; search?: string; limit?: number; offset?: number } = {}) {
        return (this.prisma as any).project.findMany({
            where: {
                companyId,
                deletedAt: null,
                ...(opts.status ? { status: opts.status } : {}),
                ...(opts.search ? { OR: [{ name: { contains: opts.search, mode: 'insensitive' } }, { code: { contains: opts.search, mode: 'insensitive' } }] } : {}),
            },
            include: {
                _count: { select: { tasks: true, timeEntries: true } },
                customer: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
            take: opts.limit ?? 50,
            skip: opts.offset ?? 0,
        }).catch(() => [])
    }

    async findProjectById(companyId: string, projectId: string) {
        return (this.prisma as any).project.findFirst({
            where: { id: projectId, companyId, deletedAt: null },
            include: {
                customer: { select: { id: true, name: true } },
                milestones: { orderBy: { dueDate: 'asc' } },
                budget: true,
                tasks: { where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, take: 20 },
                _count: { select: { tasks: true, timeEntries: true } },
            },
        }).catch(() => null)
    }

    async createProject(companyId: string, data: {
        name: string; code?: string; description?: string; customerId?: string
        startDate?: Date; endDate?: Date; status?: string; currency?: string
    }) {
        return (this.prisma as any).project.create({
            data: {
                companyId,
                name: data.name,
                code: data.code ?? null,
                description: data.description ?? null,
                customerId: data.customerId ?? null,
                startDate: data.startDate ?? null,
                endDate: data.endDate ?? null,
                status: data.status ?? 'ACTIVE',
                currency: data.currency ?? 'PHP',
            },
        })
    }

    async updateProject(companyId: string, projectId: string, data: any) {
        return (this.prisma as any).project.update({
            where: { id: projectId },
            data: { ...data, updatedAt: new Date() },
        })
    }

    async deleteProject(companyId: string, projectId: string) {
        return (this.prisma as any).project.update({
            where: { id: projectId },
            data: { deletedAt: new Date(), status: 'ARCHIVED' },
        })
    }

    // ─── Milestones ───────────────────────────────────────────────────────────

    async findMilestones(companyId: string, projectId: string) {
        return (this.prisma as any).projectMilestone.findMany({
            where: { projectId, project: { companyId } },
            orderBy: { dueDate: 'asc' },
        }).catch(() => [])
    }

    async createMilestone(companyId: string, projectId: string, data: {
        name: string; dueDate?: Date; amount?: number
    }) {
        return (this.prisma as any).projectMilestone.create({
            data: {
                projectId,
                name: data.name,
                dueDate: data.dueDate ?? null,
                amount: data.amount ?? null,
                status: 'PENDING',
            },
        })
    }

    async updateMilestone(milestoneId: string, data: any) {
        return (this.prisma as any).projectMilestone.update({
            where: { id: milestoneId },
            data,
        })
    }

    // ─── Project Budget ───────────────────────────────────────────────────────

    async getProjectBudget(companyId: string, projectId: string) {
        return (this.prisma as any).projectBudget.findFirst({
            where: { projectId, project: { companyId } },
        }).catch(() => null)
    }

    async upsertProjectBudget(companyId: string, projectId: string, data: {
        budgetedAmount?: number; laborBudget?: number; expenseBudget?: number
    }) {
        return (this.prisma as any).projectBudget.upsert({
            where: { projectId },
            create: { projectId, ...data },
            update: { ...data },
        }).catch(async () => {
            // If model doesn't support upsert, update the project directly
            return (this.prisma as any).project.update({ where: { id: projectId }, data })
        })
    }

    // ─── Project Tasks ────────────────────────────────────────────────────────

    async findProjectTasks(companyId: string, projectId: string, opts: any = {}) {
        return (this.prisma as any).task.findMany({
            where: { projectId, companyId, deletedAt: null, ...(opts.status ? { status: opts.status } : {}) },
            orderBy: { createdAt: 'desc' },
            take: opts.limit ?? 50,
            skip: opts.offset ?? 0,
        }).catch(() => [])
    }

    async createProjectTask(companyId: string, projectId: string, data: {
        title: string; description?: string; assigneeId?: string; dueDate?: Date; status?: string
    }) {
        return (this.prisma as any).task.create({
            data: {
                companyId, projectId,
                title: data.title,
                description: data.description ?? null,
                assigneeId: data.assigneeId ?? null,
                dueDate: data.dueDate ?? null,
                status: data.status ?? 'TODO',
            },
        })
    }

    // ─── Project Time Entries ─────────────────────────────────────────────────

    async findProjectTimeEntries(companyId: string, projectId: string, opts: any = {}) {
        return (this.prisma as any).timeEntry.findMany({
            where: { projectId, companyId, ...(opts.userId ? { userId: opts.userId } : {}) },
            include: { user: { select: { id: true, name: true, email: true } } },
            orderBy: { date: 'desc' },
            take: opts.limit ?? 50,
        }).catch(() => [])
    }

    async createProjectTimeEntry(companyId: string, projectId: string, userId: string, data: {
        date: Date; hours: number; description?: string; billable?: boolean; rate?: number
    }) {
        return (this.prisma as any).timeEntry.create({
            data: {
                companyId, projectId, userId,
                date: data.date,
                hours: data.hours,
                description: data.description ?? null,
                billable: data.billable ?? false,
                rate: data.rate ?? null,
                amount: data.rate ? data.hours * data.rate : null,
            },
        })
    }

    // ─── Project Expenses ─────────────────────────────────────────────────────

    async findProjectExpenses(companyId: string, projectId: string) {
        return (this.prisma as any).projectExpense.findMany({
            where: { projectId, project: { companyId } },
            orderBy: { date: 'desc' },
        }).catch(() => [])
    }

    async createProjectExpense(companyId: string, projectId: string, data: {
        date: Date; description: string; amount: number; category?: string; billable?: boolean
    }) {
        return (this.prisma as any).projectExpense.create({
            data: { projectId, date: data.date, description: data.description, amount: data.amount, category: data.category ?? null, billable: data.billable ?? false },
        })
    }

    // ─── Project Profitability ────────────────────────────────────────────────

    async getProjectProfitability(companyId: string, projectId: string) {
        const [project, timeEntries, expenses] = await Promise.all([
            this.findProjectById(companyId, projectId),
            this.findProjectTimeEntries(companyId, projectId, {}),
            this.findProjectExpenses(companyId, projectId),
        ])
        if (!project) return null

        const laborCost = (timeEntries as any[]).reduce((s: number, t: any) => s + Number(t.amount ?? 0), 0)
        const expenseCost = (expenses as any[]).reduce((s: number, e: any) => s + Number(e.amount ?? 0), 0)
        const totalBilled = Number((project as any).totalBilled ?? 0)
        const totalCost = laborCost + expenseCost
        const grossProfit = totalBilled - totalCost
        const margin = totalBilled > 0 ? (grossProfit / totalBilled) * 100 : 0

        return {
            projectId, totalBilled, laborCost, expenseCost, totalCost,
            grossProfit, margin: Math.round(margin * 100) / 100,
        }
    }

    // ─── Work In Progress (WIP) ───────────────────────────────────────────────

    async getWip(companyId: string) {
        const projects = await (this.prisma as any).project.findMany({
            where: { companyId, status: 'ACTIVE', deletedAt: null },
            include: {
                customer: { select: { id: true, name: true } },
                budget: true,
            },
        }).catch(() => [])
        return projects
    }

    // ─── Change Orders ────────────────────────────────────────────────────────

    async findChangeOrders(companyId: string, opts: { projectId?: string } = {}) {
        return (this.prisma as any).changeOrder.findMany({
            where: { companyId, ...(opts.projectId ? { projectId: opts.projectId } : {}) },
            include: { project: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
        }).catch(() => [])
    }

    async createChangeOrder(companyId: string, data: {
        projectId: string; title: string; description?: string; amount?: number; status?: string
    }) {
        return (this.prisma as any).changeOrder.create({
            data: {
                companyId,
                projectId: data.projectId,
                title: data.title,
                description: data.description ?? null,
                amount: data.amount ?? null,
                status: data.status ?? 'PENDING',
            },
        })
    }
}
