import { Injectable, NotFoundException } from '@nestjs/common'
import { TimeRepository } from './time.repository'

@Injectable()
export class TimeService {
    constructor(private readonly repo: TimeRepository) { }

    // ─── Time Entries ─────────────────────────────────────────────────────────

    async listTimeEntries(userId: string, companyId: string, query: any = {}) {
        return this.repo.findTimeEntries(companyId, {
            userId: query.userId,
            projectId: query.projectId,
            from: query.from ? new Date(query.from) : undefined,
            to: query.to ? new Date(query.to) : undefined,
            billable: query.billable !== undefined ? query.billable === 'true' : undefined,
            limit: query.limit ? parseInt(query.limit) : undefined,
            offset: query.offset ? parseInt(query.offset) : undefined,
        })
    }

    async createTimeEntry(userId: string, companyId: string, body: any) {
        return this.repo.createTimeEntry(companyId, userId, {
            date: body.date ? new Date(body.date) : new Date(),
            hours: body.hours,
            description: body.description,
            projectId: body.projectId,
            billable: body.billable,
            rate: body.rate,
            taskId: body.taskId,
        })
    }

    async getTimeEntry(userId: string, companyId: string, entryId: string) {
        const entry = await this.repo.findTimeEntryById(companyId, entryId)
        if (!entry) throw new NotFoundException('Time entry not found')
        return entry
    }

    async updateTimeEntry(userId: string, companyId: string, entryId: string, body: any) {
        await this.getTimeEntry(userId, companyId, entryId)
        return this.repo.updateTimeEntry(companyId, entryId, body)
    }

    async deleteTimeEntry(userId: string, companyId: string, entryId: string) {
        await this.getTimeEntry(userId, companyId, entryId)
        return this.repo.deleteTimeEntry(companyId, entryId)
    }

    // ─── Timesheets ───────────────────────────────────────────────────────────

    async listTimesheets(userId: string, companyId: string, query: any = {}) {
        return this.repo.findTimesheets(companyId, {
            userId: query.userId,
            status: query.status,
            limit: query.limit ? parseInt(query.limit) : undefined,
        })
    }

    async createTimesheet(userId: string, companyId: string, body: any) {
        return this.repo.createTimesheet(companyId, userId, {
            startDate: new Date(body.startDate),
            endDate: new Date(body.endDate),
            entryIds: body.entryIds,
        })
    }

    async getTimesheet(userId: string, companyId: string, timesheetId: string) {
        const ts = await this.repo.findTimesheetById(companyId, timesheetId)
        if (!ts) throw new NotFoundException('Timesheet not found')
        return ts
    }

    async approveTimesheet(userId: string, companyId: string, timesheetId: string) {
        await this.getTimesheet(userId, companyId, timesheetId)
        return this.repo.approveTimesheet(companyId, timesheetId, userId)
    }

    async rejectTimesheet(userId: string, companyId: string, timesheetId: string, body: any) {
        await this.getTimesheet(userId, companyId, timesheetId)
        return this.repo.rejectTimesheet(companyId, timesheetId, body.reason)
    }

    // ─── Timer ────────────────────────────────────────────────────────────────

    async startTimer(userId: string, companyId: string, body: any) {
        return this.repo.startTimer(companyId, userId, body)
    }

    async stopTimer(userId: string, companyId: string) {
        return this.repo.stopTimer(companyId, userId)
    }

    async getTimerSessions(userId: string, companyId: string) {
        return this.repo.getTimerSessions(companyId, userId)
    }

    // ─── Reports ──────────────────────────────────────────────────────────────

    async getBillableSummary(userId: string, companyId: string, query: any = {}) {
        return this.repo.getBillableSummary(companyId, {
            from: query.from ? new Date(query.from) : undefined,
            to: query.to ? new Date(query.to) : undefined,
        })
    }

    async getUtilization(userId: string, companyId: string, query: any = {}) {
        return this.repo.getUtilization(companyId, {
            from: query.from ? new Date(query.from) : undefined,
            to: query.to ? new Date(query.to) : undefined,
        })
    }
}
