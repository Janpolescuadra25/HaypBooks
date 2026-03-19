import {
    Controller, Get, Post, Put, Delete, Body, Param, Query,
    UseGuards, Req, HttpCode, HttpStatus,
} from '@nestjs/common'
import { TimeService } from './time.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CompanyAccessGuard } from '../auth/guards/company-access.guard'

@Controller('api/companies/:companyId/time')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class TimeController {
    constructor(private readonly svc: TimeService) { }

    // ─── Time Entries ─────────────────────────────────────────────────────────

    @Get('entries')
    listTimeEntries(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listTimeEntries(req.user.userId, cid, q)
    }

    @Post('entries')
    createTimeEntry(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createTimeEntry(req.user.userId, cid, body)
    }

    @Get('entries/:entryId')
    getTimeEntry(
        @Req() req: any, @Param('companyId') cid: string, @Param('entryId') eid: string,
    ) {
        return this.svc.getTimeEntry(req.user.userId, cid, eid)
    }

    @Put('entries/:entryId')
    updateTimeEntry(
        @Req() req: any, @Param('companyId') cid: string,
        @Param('entryId') eid: string, @Body() body: any,
    ) {
        return this.svc.updateTimeEntry(req.user.userId, cid, eid, body)
    }

    @Delete('entries/:entryId')
    deleteTimeEntry(
        @Req() req: any, @Param('companyId') cid: string, @Param('entryId') eid: string,
    ) {
        return this.svc.deleteTimeEntry(req.user.userId, cid, eid)
    }

    // ─── Timesheets ───────────────────────────────────────────────────────────

    @Get('timesheets')
    listTimesheets(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listTimesheets(req.user.userId, cid, q)
    }

    @Post('timesheets')
    createTimesheet(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createTimesheet(req.user.userId, cid, body)
    }

    @Get('timesheets/:timesheetId')
    getTimesheet(
        @Req() req: any, @Param('companyId') cid: string, @Param('timesheetId') tid: string,
    ) {
        return this.svc.getTimesheet(req.user.userId, cid, tid)
    }

    @Post('timesheets/:timesheetId/approve')
    @HttpCode(HttpStatus.OK)
    approveTimesheet(
        @Req() req: any, @Param('companyId') cid: string, @Param('timesheetId') tid: string,
    ) {
        return this.svc.approveTimesheet(req.user.userId, cid, tid)
    }

    @Post('timesheets/:timesheetId/reject')
    @HttpCode(HttpStatus.OK)
    rejectTimesheet(
        @Req() req: any, @Param('companyId') cid: string,
        @Param('timesheetId') tid: string, @Body() body: any,
    ) {
        return this.svc.rejectTimesheet(req.user.userId, cid, tid, body)
    }

    // ─── Timer ────────────────────────────────────────────────────────────────

    @Post('timer/start')
    @HttpCode(HttpStatus.OK)
    startTimer(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.startTimer(req.user.userId, cid, body)
    }

    @Post('timer/stop')
    @HttpCode(HttpStatus.OK)
    stopTimer(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.stopTimer(req.user.userId, cid)
    }

    @Get('timer/sessions')
    getTimerSessions(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.getTimerSessions(req.user.userId, cid)
    }

    // ─── Reports ──────────────────────────────────────────────────────────────

    @Get('billable')
    getBillableSummary(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.getBillableSummary(req.user.userId, cid, q)
    }

    @Get('utilization')
    getUtilization(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.getUtilization(req.user.userId, cid, q)
    }
}

// ─── Flat routes: /api/companies/:companyId/time-entries ──────────────────────

@Controller('api/companies/:companyId/time-entries')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class TimeEntriesController {
    constructor(private readonly svc: TimeService) { }

    @Get()
    list(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listTimeEntries(req.user.userId, cid, q)
    }

    @Post()
    create(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createTimeEntry(req.user.userId, cid, body)
    }

    @Put(':entryId')
    update(
        @Req() req: any, @Param('companyId') cid: string,
        @Param('entryId') eid: string, @Body() body: any,
    ) {
        return this.svc.updateTimeEntry(req.user.userId, cid, eid, body)
    }

    @Delete(':entryId')
    remove(@Req() req: any, @Param('companyId') cid: string, @Param('entryId') eid: string) {
        return this.svc.deleteTimeEntry(req.user.userId, cid, eid)
    }
}

// ─── Flat routes: /api/companies/:companyId/timesheets ────────────────────────

@Controller('api/companies/:companyId/timesheets')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class TimesheetsController {
    constructor(private readonly svc: TimeService) { }

    @Get()
    list(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listTimesheets(req.user.userId, cid, q)
    }

    @Post()
    create(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createTimesheet(req.user.userId, cid, body)
    }

    @Post(':timesheetId/approve')
    @HttpCode(HttpStatus.OK)
    approve(@Req() req: any, @Param('companyId') cid: string, @Param('timesheetId') tid: string) {
        return this.svc.approveTimesheet(req.user.userId, cid, tid)
    }

    @Post(':timesheetId/reject')
    @HttpCode(HttpStatus.OK)
    reject(
        @Req() req: any, @Param('companyId') cid: string,
        @Param('timesheetId') tid: string, @Body() body: any,
    ) {
        return this.svc.rejectTimesheet(req.user.userId, cid, tid, body)
    }
}
