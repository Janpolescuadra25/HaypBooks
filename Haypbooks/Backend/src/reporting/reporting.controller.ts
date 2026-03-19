import {
    Controller, Get, Post, Body, Param, Query,
    UseGuards, Req, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ReportingService } from './reporting.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CompanyAccessGuard } from '../auth/guards/company-access.guard'

@Controller('api/companies/:companyId/reports')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class ReportingController {
    constructor(private readonly svc: ReportingService) { }

    // ─── Quick KPIs ───────────────────────────────────────────────────────────

    @Get('kpis')
    getQuickKpis(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.getQuickKpis(req.user.userId, cid)
    }

    // ─── Financial Statements ─────────────────────────────────────────────────

    @Get('profit-and-loss')
    getProfitAndLoss(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        return this.svc.getProfitAndLoss(req.user.userId, cid, { from, to })
    }

    @Get('balance-sheet')
    getBalanceSheet(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Query('asOf') asOf?: string,
    ) {
        return this.svc.getBalanceSheet(req.user.userId, cid, { asOf })
    }

    @Get('cash-flow')
    getCashFlow(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        return this.svc.getCashFlow(req.user.userId, cid, { from, to })
    }

    @Get('trial-balance')
    getTrialBalance(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.getTrialBalance(req.user.userId, cid)
    }

    // ─── Snapshots ────────────────────────────────────────────────────────────

    @Get('snapshots')
    listSnapshots(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Query('type') type?: string,
    ) {
        return this.svc.listSnapshots(req.user.userId, cid, type)
    }

    @Post('snapshots')
    @HttpCode(HttpStatus.OK)
    saveSnapshot(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Body() body: { type: string; period: string },
    ) {
        return this.svc.saveSnapshot(req.user.userId, cid, body.type, body.period)
    }

    // ─── Budgets ──────────────────────────────────────────────────────────────

    @Get('budgets')
    listBudgets(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.listBudgets(req.user.userId, cid)
    }

    @Post('budgets')
    createBudget(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createBudget(req.user.userId, cid, body)
    }

    @Get('budgets/:budgetId')
    getBudget(@Req() req: any, @Param('companyId') cid: string, @Param('budgetId') bid: string) {
        return this.svc.getBudget(req.user.userId, cid, bid)
    }

    @Get('budgets/:budgetId/vs-actual')
    getBudgetVsActual(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Param('budgetId') bid: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        return this.svc.getBudgetVsActual(req.user.userId, cid, bid, { from, to })
    }

    // ─── KPI Dashboards ───────────────────────────────────────────────────────

    @Get('dashboards')
    listDashboards(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.listDashboards(req.user.userId, cid)
    }

    @Post('dashboards')
    createDashboard(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createDashboard(req.user.userId, cid, body)
    }

    // ─── ESG Reporting ────────────────────────────────────────────────────────

    @Get('esg')
    getEsgMetrics(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.getEsgMetrics(req.user.userId, cid)
    }
}
