import { Injectable } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Injectable()
export class TimeRepository {
    constructor(private readonly prisma: PrismaService) { }

    // ─── Time Entries ─────────────────────────────────────────────────────────

    async findTimeEntries(companyId: string, opts: {
        userId?: string; projectId?: string; from?: Date; to?: Date
        billable?: boolean; limit?: number; offset?: number
    } = {}) {
        return (this.prisma as any).timeEntry.findMany({
            where: {
                companyId,
                ...(opts.userId ? { userId: opts.userId } : {}),
                ...(opts.projectId ? { projectId: opts.projectId } : {}),
                ...(opts.from || opts.to ? { date: { ...(opts.from ? { gte: opts.from } : {}), ...(opts.to ? { lte: opts.to } : {}) } } : {}),
                ...(opts.billable !== undefined ? { billable: opts.billable } : {}),
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                project: { select: { id: true, name: true, code: true } },
            },
            orderBy: { date: 'desc' },
            take: opts.limit ?? 50,
            skip: opts.offset ?? 0,
        }).catch(() => [])
    }

    async findTimeEntryById(companyId: string, entryId: string) {
        return (this.prisma as any).timeEntry.findFirst({
            where: { id: entryId, companyId },
            include: {
                user: { select: { id: true, name: true } },
                project: { select: { id: true, name: true } },
            },
        }).catch(() => null)
    }

    async createTimeEntry(companyId: string, userId: string, data: {
        date: Date; hours: number; description?: string; projectId?: string
        billable?: boolean; rate?: number; taskId?: string
    }) {
        return (this.prisma as any).timeEntry.create({
            data: {
                companyId, userId,
                date: data.date,
                hours: data.hours,
                description: data.description ?? null,
                projectId: data.projectId ?? null,
                billable: data.billable ?? false,
                rate: data.rate ?? null,
                amount: data.rate ? data.hours * data.rate : null,
                taskId: data.taskId ?? null,
            },
        })
    }

    async updateTimeEntry(companyId: string, entryId: string, data: any) {
        return (this.prisma as any).timeEntry.update({
            where: { id: entryId },
            data: { ...data, updatedAt: new Date() },
        })
    }

    async deleteTimeEntry(companyId: string, entryId: string) {
        return (this.prisma as any).timeEntry.delete({ where: { id: entryId } })
    }

    // ─── Timesheets ───────────────────────────────────────────────────────────

    async findTimesheets(companyId: string, opts: {
        userId?: string; status?: string; limit?: number; offset?: number
    } = {}) {
        return (this.prisma as any).timesheet.findMany({
            where: {
                companyId,
                ...(opts.userId ? { userId: opts.userId } : {}),
                ...(opts.status ? { status: opts.status } : {}),
            },
            include: {
                user: { select: { id: true, name: true } },
                _count: { select: { entries: true } },
            },
            orderBy: { startDate: 'desc' },
            take: opts.limit ?? 50,
            skip: opts.offset ?? 0,
        }).catch(() => [])
    }

    async findTimesheetById(companyId: string, timesheetId: string) {
        return (this.prisma as any).timesheet.findFirst({
            where: { id: timesheetId, companyId },
            include: {
                user: { select: { id: true, name: true } },
                entries: {
                    include: { project: { select: { id: true, name: true } } },
                    orderBy: { date: 'asc' },
                },
            },
        }).catch(() => null)
    }

    async createTimesheet(companyId: string, userId: string, data: {
        startDate: Date; endDate: Date; entryIds?: string[]
    }) {
        return (this.prisma as any).timesheet.create({
            data: {
                companyId, userId,
                startDate: data.startDate,
                endDate: data.endDate,
                status: 'DRAFT',
                totalHours: 0,
                ...(data.entryIds?.length ? {
                    entries: { connect: data.entryIds.map(id => ({ id })) },
                } : {}),
            },
        })
    }

    async approveTimesheet(companyId: string, timesheetId: string, approverId: string) {
        return (this.prisma as any).timesheet.update({
            where: { id: timesheetId },
            data: { status: 'APPROVED', approvedById: approverId, approvedAt: new Date() },
        })
    }

    async rejectTimesheet(companyId: string, timesheetId: string, reason?: string) {
        return (this.prisma as any).timesheet.update({
            where: { id: timesheetId },
            data: { status: 'REJECTED', rejectionReason: reason ?? null },
        })
    }

    // ─── Timer Sessions ───────────────────────────────────────────────────────

    async startTimer(companyId: string, userId: string, data: {
        projectId?: string; taskId?: string; description?: string
    }) {
        // Stop any running timer first
        await (this.prisma as any).timerSession.updateMany({
            where: { companyId, userId, endTime: null },
            data: { endTime: new Date(), status: 'STOPPED' },
        }).catch(() => null)

        return (this.prisma as any).timerSession.create({
            data: {
                companyId, userId,
                startTime: new Date(),
                projectId: data.projectId ?? null,
                taskId: data.taskId ?? null,
                description: data.description ?? null,
                status: 'RUNNING',
            },
        })
    }

    async stopTimer(companyId: string, userId: string) {
        const session = await (this.prisma as any).timerSession.findFirst({
            where: { companyId, userId, endTime: null, status: 'RUNNING' },
        }).catch(() => null)

        if (!session) return { stopped: false }

        const endTime = new Date()
        const hours = (endTime.getTime() - new Date(session.startTime).getTime()) / 3600000

        await (this.prisma as any).timerSession.update({
            where: { id: session.id },
            data: { endTime, status: 'STOPPED', durationHours: hours },
        })

        // Auto-create a time entry from the session
        const entry = await this.createTimeEntry(companyId, userId, {
            date: endTime,
            hours: Math.round(hours * 100) / 100,
            description: session.description,
            projectId: session.projectId,
            taskId: session.taskId,
            billable: false,
        }).catch(() => null)

        return { stopped: true, session, entry, hours: Math.round(hours * 100) / 100 }
    }

    async getTimerSessions(companyId: string, userId: string) {
        return (this.prisma as any).timerSession.findMany({
            where: { companyId, userId },
            orderBy: { startTime: 'desc' },
            take: 20,
        }).catch(() => [])
    }

    // ─── Billable Summary ─────────────────────────────────────────────────────

    async getBillableSummary(companyId: string, opts: { from?: Date; to?: Date } = {}) {
        const entries = await (this.prisma as any).timeEntry.findMany({
            where: {
                companyId, billable: true,
                ...(opts.from || opts.to ? { date: { ...(opts.from ? { gte: opts.from } : {}), ...(opts.to ? { lte: opts.to } : {}) } } : {}),
            },
            select: { hours: true, amount: true, projectId: true, project: { select: { id: true, name: true } } },
        }).catch(() => [])

        const totalHours = (entries as any[]).reduce((s: number, e: any) => s + Number(e.hours ?? 0), 0)
        const totalAmount = (entries as any[]).reduce((s: number, e: any) => s + Number(e.amount ?? 0), 0)

        const byProject: Record<string, any> = {}
        for (const e of entries as any[]) {
            const pid = e.projectId ?? 'unassigned'
            if (!byProject[pid]) byProject[pid] = { project: e.project, hours: 0, amount: 0 }
            byProject[pid].hours += Number(e.hours ?? 0)
            byProject[pid].amount += Number(e.amount ?? 0)
        }

        return { totalHours, totalAmount, byProject: Object.values(byProject) }
    }

    // ─── Utilization ──────────────────────────────────────────────────────────

    async getUtilization(companyId: string, opts: { from?: Date; to?: Date } = {}) {
        const entries = await (this.prisma as any).timeEntry.groupBy({
            by: ['userId'],
            where: {
                companyId,
                ...(opts.from || opts.to ? { date: { ...(opts.from ? { gte: opts.from } : {}), ...(opts.to ? { lte: opts.to } : {}) } } : {}),
            },
            _sum: { hours: true },
        }).catch(() => [])

        return { utilization: entries }
    }
}
