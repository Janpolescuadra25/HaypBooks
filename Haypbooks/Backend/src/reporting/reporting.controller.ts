import {
    Controller, Get, Post, Put, Patch, Delete, Body, Param, Query,
    UseGuards, Req, HttpCode, HttpStatus, BadRequestException, UsePipes, ValidationPipe, Res,
} from '@nestjs/common'
import { Response } from 'express'
import { ReportingService } from './reporting.service'
import { LedgerHealthService } from './ledger-health.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CompanyAccessGuard } from '../auth/guards/company-access.guard'
import { CreateBudgetDto, UpdateBudgetDto } from './dto/create-budget.dto'

@Controller(['api/reporting', 'api/companies/:companyId/reporting'])
@UseGuards(JwtAuthGuard)
export class ReportingController {
    constructor(
        private readonly svc: ReportingService,
        private readonly ledgerHealthService: LedgerHealthService,
    ) { }

    // ─── Quick KPIs ───────────────────────────────────────────────────────────

    @Get('kpis')
    getQuickKpis(@Req() req: any, @Query('companyId') cid: string) {
        if (!cid) throw new BadRequestException('companyId query parameter is required')
        return this.svc.getQuickKpis(req.user.userId, cid)
    }

    // ─── Financial Statements ─────────────────────────────────────────────────

    @Get('profit-and-loss')
    getProfitAndLoss(
        @Req() req: any,
        @Query('companyId') cid: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
        @Query('displayCurrency') displayCurrency?: string,
    ) {
        if (!cid) throw new BadRequestException('companyId query parameter is required')
        return this.svc.getProfitAndLoss(req.user.userId, cid, { from, to, displayCurrency })
    }

    @Get('balance-sheet')
    getBalanceSheet(
        @Req() req: any,
        @Query('companyId') cid: string,
        @Query('asOf') asOf?: string,
        @Query('displayCurrency') displayCurrency?: string,
    ) {
        if (!cid) throw new BadRequestException('companyId query parameter is required')
        return this.svc.getBalanceSheet(req.user.userId, cid, { asOf, displayCurrency })
    }

    @Get('cash-flow')
    getCashFlow(
        @Req() req: any,
        @Query('companyId') cid: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
        @Query('displayCurrency') displayCurrency?: string,
    ) {
        if (!cid) throw new BadRequestException('companyId query parameter is required')
        return this.svc.getCashFlow(req.user.userId, cid, { from, to, displayCurrency })
    }

    @Get('trial-balance')
    getTrialBalance(
        @Req() req: any,
        @Query('companyId') cid: string,
        @Query('asOf') asOf?: string,
        @Query('displayCurrency') displayCurrency?: string,
    ) {
        if (!cid) throw new BadRequestException('companyId query parameter is required')
        return this.svc.getTrialBalance(req.user.userId, cid, { asOf, displayCurrency })
    }

    @Get('ledger-health')
    async getLedgerHealth(
        @Req() req: any,
        @Query('companyId') companyId: string,
    ) {
        if (!companyId) throw new BadRequestException('companyId query parameter is required')
        return this.ledgerHealthService.checkLedgerHealth(req.user.userId, companyId)
    }

    // ─── Snapshots ────────────────────────────────────────────────────────────

    @Get('snapshots')
    listSnapshots(
        @Req() req: any,
        @Query('companyId') cid: string,
        @Query('type') type?: string,
    ) {
        if (!cid) throw new BadRequestException('companyId query parameter is required')
        return this.svc.listSnapshots(req.user.userId, cid, type)
    }

    @Post('snapshots')
    @HttpCode(HttpStatus.OK)
    saveSnapshot(
        @Req() req: any,
        @Query('companyId') cid: string,
        @Body() body: { type: string; period: string },
    ) {
        if (!cid) throw new BadRequestException('companyId query parameter is required')
        return this.svc.saveSnapshot(req.user.userId, cid, body.type, body.period)
    }

    // ─── Budgets ──────────────────────────────────────────────────────────────

    @Get('budgets')
    listBudgets(@Req() req: any, @Query('companyId') cid: string) {
        if (!cid) throw new BadRequestException('companyId query parameter is required')
        return this.svc.listBudgets(req.user.userId, cid)
    }

    @Post('budgets')
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    createBudget(@Req() req: any, @Query('companyId') cid: string, @Body() dto: CreateBudgetDto) {
        if (!cid) throw new BadRequestException('companyId query parameter is required')
        return this.svc.createBudget(req.user.userId, cid, dto)
    }

    @Get('budgets/:budgetId')
    getBudget(@Req() req: any, @Query('companyId') cid: string, @Param('budgetId') bid: string) {
        if (!cid) throw new BadRequestException('companyId query parameter is required')
        return this.svc.getBudget(req.user.userId, cid, bid)
    }

    @Get('budgets/:budgetId/vs-actual')
    getBudgetVsActual(
        @Req() req: any,
        @Query('companyId') cid: string,
        @Param('budgetId') bid: string,
        @Query('from') from?: string,
        @Query('to') to?: string,
    ) {
        if (!cid) throw new BadRequestException('companyId query parameter is required')
        return this.svc.getBudgetVsActual(req.user.userId, cid, bid, { from, to })
    }

    @Get('budgets/:budgetId/vs-actual/csv')
    @UseGuards(JwtAuthGuard, CompanyAccessGuard)
    async exportBudgetVsActualCsv(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('budgetId') budgetId: string,
        @Res() res: Response,
    ) {
        const data = await this.svc.getBudgetVsActual(req.user.userId, companyId, budgetId, {})
        const csv = this.svc.formatBudgetVsActualCsv(data)
        const filename = `budget-vs-actual-${String(data.budget.name).replace(/[^a-zA-Z0-9-_]/g, '-')}-${data.budget.fiscalYear}.csv`
        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
        res.send(csv)
    }

    @Get('budgets/:budgetId/vs-actual/pdf')
    @UseGuards(JwtAuthGuard, CompanyAccessGuard)
    async exportBudgetVsActualPdf(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('budgetId') budgetId: string,
        @Res() res: Response,
    ) {
        const data = await this.svc.getBudgetVsActual(req.user.userId, companyId, budgetId, {})
        const pdfBuffer = await this.svc.generateBudgetVsActualPdf(data)
        const filename = `budget-vs-actual-${String(data.budget.name).replace(/[^a-zA-Z0-9-_]/g, '-')}-${data.budget.fiscalYear}.pdf`
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
        res.send(pdfBuffer)
    }

    // ─── Budget CRUD ──────────────────────────────────────────────────────────

    @Patch('budgets/:budgetId')
    @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
    updateBudget(@Req() req: any, @Query('companyId') cid: string, @Param('budgetId') budgetId: string, @Body() dto: UpdateBudgetDto) {
        if (!cid) throw new BadRequestException('companyId query parameter is required')
        return this.svc.updateBudget(req.user.userId, cid, budgetId, { name: dto.name, fiscalYear: dto.fiscalYear })
    }

    @Delete('budgets/:budgetId')
    deleteBudget(@Req() req: any, @Query('companyId') cid: string, @Param('budgetId') budgetId: string) {
        if (!cid) throw new BadRequestException('companyId query parameter is required')
        return this.svc.deleteBudget(req.user.userId, cid, budgetId)
    }

    @Post('budgets/:budgetId/lines')
    addBudgetLine(@Req() req: any, @Query('companyId') cid: string, @Param('budgetId') budgetId: string, @Body() body: { accountId: string; classId: string; month: number; amount: number }) {
        if (!cid) throw new BadRequestException('companyId query parameter is required')
        return this.svc.addBudgetLine(req.user.userId, cid, budgetId, body)
    }

    @Patch('budgets/:budgetId/lines/:lineId')
    updateBudgetLine(@Req() req: any, @Query('companyId') cid: string, @Param('budgetId') budgetId: string, @Param('lineId') lineId: string, @Body() body: { accountId?: string; classId?: string; month?: number; amount?: number }) {
        if (!cid) throw new BadRequestException('companyId query parameter is required')
        return this.svc.updateBudgetLine(req.user.userId, cid, budgetId, lineId, body)
    }

    @Delete('budgets/:budgetId/lines/:lineId')
    deleteBudgetLine(@Req() req: any, @Query('companyId') cid: string, @Param('budgetId') budgetId: string, @Param('lineId') lineId: string) {
        if (!cid) throw new BadRequestException('companyId query parameter is required')
        return this.svc.deleteBudgetLine(req.user.userId, cid, budgetId, lineId)
    }

    @Post('budgets/:budgetId/copy')
    copyBudget(@Req() req: any, @Query('companyId') cid: string, @Param('budgetId') budgetId: string, @Body() body: { fiscalYear: number }) {
        if (!cid) throw new BadRequestException('companyId query parameter is required')
        return this.svc.copyBudget(req.user.userId, cid, budgetId, body.fiscalYear)
    }

    // ─── KPI Dashboards ───────────────────────────────────────────────────────

    @Get('dashboards')
    listDashboards(@Req() req: any, @Query('companyId') cid: string) {
        if (!cid) throw new BadRequestException('companyId query parameter is required')
        return this.svc.listDashboards(req.user.userId, cid)
    }

    @Post('dashboards')
    createDashboard(@Req() req: any, @Query('companyId') cid: string, @Body() body: any) {
        if (!cid) throw new BadRequestException('companyId query parameter is required')
        return this.svc.createDashboard(req.user.userId, cid, body)
    }

    // ─── ESG Reporting ────────────────────────────────────────────────────────

    @Get('esg')
    getEsgMetrics(@Req() req: any, @Query('companyId') cid: string) {
        if (!cid) throw new BadRequestException('companyId query parameter is required')
        return this.svc.getEsgMetrics(req.user.userId, cid)
    }
}
