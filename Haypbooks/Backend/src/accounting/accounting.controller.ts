import {
    Controller, Get, Post, Put, Delete, Patch, Body, Param, Query,
    UseGuards, Req, HttpCode, HttpStatus,
} from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { AccountingService } from './accounting.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CompanyAccessGuard } from '../auth/guards/company-access.guard'

@Controller('api/companies/:companyId/accounting')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class AccountingController {
    constructor(private readonly svc: AccountingService) { }

    // ─── Account Types (reference data, no companyId needed) ─────────────────

    @Get('account-types')
    async listAccountTypes() {
        return this.svc.listAccountTypes()
    }

    // ─── Chart of Accounts ───────────────────────────────────────────────────

    @Get('accounts')
    async listAccounts(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Query('includeInactive') includeInactive?: string,
    ) {
        return this.svc.listAccounts(req.user.userId, companyId, {
            includeInactive: includeInactive === 'true',
        })
    }

    @Post('accounts')
    async createAccount(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: any,
    ) {
        return this.svc.createAccount(req.user.userId, companyId, body)
    }

    @HttpCode(HttpStatus.OK)
    @Post('accounts/seed-default')
    async seedDefaultAccounts(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: { force?: boolean; industry?: string } = {},
    ) {
        await this.svc.assertCompanyAccessPublic(req.user.userId, companyId)
        await this.svc.assertCompanyOwner(req.user.userId, companyId)
        return this.svc.seedDefaultAccounts(companyId, undefined, { force: body.force, industry: body.industry })
    }

    @Get('coa-templates')
    async listCoaTemplates(
        @Req() req: any,
        @Param('companyId') companyId: string,
    ) {
        return this.svc.listCoaTemplates(req.user.userId, companyId)
    }

    @Get('accounts/audit-log')
    @SkipThrottle()
    async getAccountAuditLog(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Query('accountId') accountId?: string,
        @Query('action') action?: string,
        @Query('range') range: string = '7d',
    ) {
        return this.svc.getAccountAuditLog(req.user.userId, companyId, {
            accountId,
            action,
            range,
        })
    }

    @Get('accounts/:accountId')
    async getAccount(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('accountId') accountId: string,
    ) {
        return this.svc.getAccount(req.user.userId, companyId, accountId)
    }

    @Get('accounts/:accountId/ledger')
    async getAccountLedger(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('accountId') accountId: string,
        @Query() query: any,
    ) {
        return this.svc.getAccountLedger(req.user.userId, companyId, accountId, query)
    }

    // ─── Journal Entries ──────────────────────────────────────────────────────

    @Get('journal-entries/audit-log')
    @SkipThrottle()
    async getJournalEntriesAuditLog(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Query('entryId') entryId?: string,
        @Query('action') action?: string,
        @Query('range') range: string = '30d',
    ) {
        return this.svc.getJournalEntriesAuditLog(req.user.userId, companyId, { entryId, action, range })
    }

    @Get('journal-entries')
    async listJournalEntries(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Query() query: any,
    ) {
        return this.svc.listJournalEntries(req.user.userId, companyId, query)
    }

    @Post('journal-entries')
    async createJournalEntry(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: any,
    ) {
        return this.svc.createJournalEntry(req.user.userId, companyId, body)
    }

    @Get('journal-entries/:jeId')
    async getJournalEntry(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('jeId') jeId: string,
    ) {
        return this.svc.getJournalEntry(req.user.userId, companyId, jeId)
    }

    @Get('journal-entries/:jeId/activity')
    async getJournalEntryActivity(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('jeId') jeId: string,
    ) {
        return this.svc.getJournalEntryActivity(req.user.userId, companyId, jeId)
    }

    @Put('journal-entries/:jeId')
    async updateJournalEntry(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('jeId') jeId: string,
        @Body() body: any,
    ) {
        return this.svc.updateJournalEntry(req.user.userId, companyId, jeId, body)
    }

    @Post('journal-entries/:jeId/post')
    @HttpCode(HttpStatus.OK)
    async postJournalEntry(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('jeId') jeId: string,
    ) {
        return this.svc.postJournalEntry(req.user.userId, companyId, jeId)
    }

    @Post('journal-entries/:jeId/void')
    @HttpCode(HttpStatus.OK)
    async voidJournalEntry(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('jeId') jeId: string,
        @Body() body: { reason?: string },
    ) {
        return this.svc.voidJournalEntry(req.user.userId, companyId, jeId, body.reason ?? 'Voided by user')
    }

    @Delete('journal-entries/:jeId')
    @HttpCode(HttpStatus.OK)
    async deleteJournalEntry(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('jeId') jeId: string,
    ) {
        return this.svc.deleteJournalEntry(req.user.userId, companyId, jeId)
    }

    // ─── Trial Balance ────────────────────────────────────────────────────────

    @Get('trial-balance')
    async getTrialBalance(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Query('asOf') asOf?: string,
    ) {
        return this.svc.getTrialBalance(req.user.userId, companyId, asOf)
    }

    // ─── Accounting Periods ───────────────────────────────────────────────────

    @Get('periods')
    async listPeriods(
        @Req() req: any,
        @Param('companyId') companyId: string,
    ) {
        return this.svc.listPeriods(req.user.userId, companyId)
    }

    @Post('periods')
    async createPeriod(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: any,
    ) {
        return this.svc.createPeriod(req.user.userId, companyId, body)
    }

    @Post('periods/:periodId/close')
    @HttpCode(HttpStatus.OK)
    async closePeriod(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('periodId') periodId: string,
    ) {
        return this.svc.closePeriod(req.user.userId, companyId, periodId)
    }

    @Post('periods/:periodId/reopen')
    @HttpCode(HttpStatus.OK)
    async reopenPeriod(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('periodId') periodId: string,
    ) {
        return this.svc.reopenPeriod(req.user.userId, companyId, periodId)
    }

    // ─── Multi-Currency Revaluation ──────────────────────────────────────────

    @Get('period-close/multi-currency-revaluation')
    getMultiCurrencyRevaluation(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Query() q: any,
    ) {
        return this.svc.getMultiCurrencyRevaluation(req.user.userId, companyId, q)
    }
}
