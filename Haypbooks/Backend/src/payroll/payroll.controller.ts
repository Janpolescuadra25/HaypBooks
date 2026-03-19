import {
    Controller, Get, Post, Put, Delete, Patch, Body, Param, Query,
    UseGuards, Req, HttpCode, HttpStatus,
} from '@nestjs/common'
import { PayrollService } from './payroll.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CompanyAccessGuard } from '../auth/guards/company-access.guard'

@Controller('api/companies/:companyId/payroll')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class PayrollController {
    constructor(private readonly svc: PayrollService) { }

    // ─── Payroll Summary ──────────────────────────────────────────────────────

    @Get('summary')
    getSummary(
        @Req() req: any, @Param('companyId') cid: string,
        @Query('year') year: string,
    ) {
        return this.svc.getPayrollSummary(req.user.userId, cid, parseInt(year))
    }

    // ─── Employees ────────────────────────────────────────────────────────────

    @Get('employees')
    listEmployees(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listEmployees(req.user.userId, cid, q)
    }

    @Post('employees')
    createEmployee(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createEmployee(req.user.userId, cid, body)
    }

    @Get('employees/:employeeId')
    getEmployee(@Req() req: any, @Param('companyId') cid: string, @Param('employeeId') eid: string) {
        return this.svc.getEmployee(req.user.userId, cid, eid)
    }

    @Put('employees/:employeeId')
    updateEmployee(
        @Req() req: any, @Param('companyId') cid: string,
        @Param('employeeId') eid: string, @Body() body: any,
    ) {
        return this.svc.updateEmployee(req.user.userId, cid, eid, body)
    }

    @Post('employees/:employeeId/terminate')
    @HttpCode(HttpStatus.OK)
    terminateEmployee(
        @Req() req: any, @Param('companyId') cid: string,
        @Param('employeeId') eid: string, @Body() body: { terminationDate: string },
    ) {
        return this.svc.terminateEmployee(req.user.userId, cid, eid, body)
    }

    // ─── Payroll Runs ─────────────────────────────────────────────────────────

    @Get('runs')
    listRuns(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listPayrollRuns(req.user.userId, cid, q)
    }

    @Post('runs')
    createRun(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createPayrollRun(req.user.userId, cid, body)
    }

    @Get('runs/:runId')
    getRun(@Req() req: any, @Param('companyId') cid: string, @Param('runId') rid: string) {
        return this.svc.getPayrollRun(req.user.userId, cid, rid)
    }

    @Post('runs/:runId/process')
    @HttpCode(HttpStatus.OK)
    processRun(@Req() req: any, @Param('companyId') cid: string, @Param('runId') rid: string) {
        return this.svc.processPayrollRun(req.user.userId, cid, rid)
    }

    @Post('runs/:runId/post')
    @HttpCode(HttpStatus.OK)
    postRun(@Req() req: any, @Param('companyId') cid: string, @Param('runId') rid: string) {
        return this.svc.postPayrollRun(req.user.userId, cid, rid)
    }

    @Post('runs/:runId/void')
    @HttpCode(HttpStatus.OK)
    voidRun(@Req() req: any, @Param('companyId') cid: string, @Param('runId') rid: string) {
        return this.svc.voidPayrollRun(req.user.userId, cid, rid)
    }

    // ─── Paychecks ────────────────────────────────────────────────────────────

    @Get('paychecks')
    listPaychecks(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listPaychecks(req.user.userId, cid, q)
    }

    @Get('paychecks/:paycheckId')
    getPaycheck(
        @Req() req: any, @Param('companyId') cid: string,
        @Param('paycheckId') pid: string,
    ) {
        return this.svc.getPaycheck(req.user.userId, cid, pid)
    }

    // ─── Employee Loans ───────────────────────────────────────────────────────

    @Get('loans')
    listLoans(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listLoans(req.user.userId, cid, q)
    }

    @Post('loans')
    createLoan(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createLoan(req.user.userId, cid, body)
    }

    // ─── Salary Structures ────────────────────────────────────────────────────

    @Get('salary-structures')
    listSalaryStructures(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.listSalaryStructures(req.user.userId, cid)
    }

    @Post('salary-structures')
    createSalaryStructure(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createSalaryStructure(req.user.userId, cid, body)
    }

    @Put('salary-structures/:id')
    updateSalaryStructure(
        @Req() req: any, @Param('companyId') cid: string,
        @Param('id') id: string, @Body() body: any,
    ) {
        return this.svc.updateSalaryStructure(req.user.userId, cid, id, body)
    }

    // ─── Benefit Plans ────────────────────────────────────────────────────────

    @Get('benefit-plans')
    listBenefitPlans(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.listBenefitPlans(req.user.userId, cid)
    }

    @Post('benefit-plans')
    createBenefitPlan(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createBenefitPlan(req.user.userId, cid, body)
    }

    @Put('benefit-plans/:id')
    updateBenefitPlan(
        @Req() req: any, @Param('companyId') cid: string,
        @Param('id') id: string, @Body() body: any,
    ) {
        return this.svc.updateBenefitPlan(req.user.userId, cid, id, body)
    }

    // ─── Deductions ───────────────────────────────────────────────────────────

    @Get('deductions')
    listDeductions(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listDeductions(req.user.userId, cid, q)
    }

    @Post('deductions')
    createDeduction(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createDeduction(req.user.userId, cid, body)
    }

    // ─── Leave Requests ───────────────────────────────────────────────────────

    @Get('leave-requests')
    listLeaveRequests(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listLeaveRequests(req.user.userId, cid, q)
    }

    @Post('leave-requests')
    createLeaveRequest(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createLeaveRequest(req.user.userId, cid, body)
    }

    @Patch('leave-requests/:id/approve')
    @HttpCode(HttpStatus.OK)
    approveLeaveRequest(
        @Req() req: any, @Param('companyId') cid: string, @Param('id') id: string,
    ) {
        return this.svc.approveLeaveRequest(req.user.userId, cid, id)
    }

    @Patch('leave-requests/:id/reject')
    @HttpCode(HttpStatus.OK)
    rejectLeaveRequest(
        @Req() req: any, @Param('companyId') cid: string, @Param('id') id: string,
    ) {
        return this.svc.rejectLeaveRequest(req.user.userId, cid, id)
    }

    // ─── Leave Balances ───────────────────────────────────────────────────────

    @Get('leave-balances')
    listLeaveBalances(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listLeaveBalances(req.user.userId, cid, q)
    }

    // ─── Government Contributions ─────────────────────────────────────────────

    @Get('government-contributions')
    listGovernmentContributions(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listGovernmentContributions(req.user.userId, cid, q)
    }

    @Post('government-contributions')
    createGovernmentContribution(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createGovernmentContribution(req.user.userId, cid, body)
    }

    // ─── Shift Schedules ──────────────────────────────────────────────────────

    @Get('shift-schedules')
    listShiftSchedules(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listShiftSchedules(req.user.userId, cid, q)
    }

    @Post('shift-schedules')
    createShiftSchedule(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createShiftSchedule(req.user.userId, cid, body)
    }

    // ─── Allowances ───────────────────────────────────────────────────────────

    @Get('allowances')
    listAllowances(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.listAllowances(req.user.userId, cid)
    }

    @Post('allowances')
    createAllowance(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createAllowance(req.user.userId, cid, body)
    }

    @Put('allowances/:id')
    updateAllowance(@Req() req: any, @Param('companyId') cid: string, @Param('id') id: string, @Body() body: any) {
        return this.svc.updateAllowance(req.user.userId, cid, id, body)
    }

    @Delete('allowances/:id')
    deleteAllowance(@Req() req: any, @Param('companyId') cid: string, @Param('id') id: string) {
        return this.svc.deleteAllowance(req.user.userId, cid, id)
    }
}
