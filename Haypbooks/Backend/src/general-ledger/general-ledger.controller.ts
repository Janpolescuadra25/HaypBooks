import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common'
import { GeneralLedgerService } from './general-ledger.service'
import { GlQueryDto } from './dto/gl-query.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CompanyAccessGuard } from '../auth/guards/company-access.guard'

@Controller('api/companies/:companyId/general-ledger')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class GeneralLedgerController {
    constructor(private readonly svc: GeneralLedgerService) { }

    /**
     * GET /api/companies/:companyId/general-ledger
     *
     * Returns all posted GL lines with optional filters.
     * When ?accountId= is supplied, also returns opening/closing balance,
     * netChange, totalDebits/Credits, and a runningBalance on each line.
     */
    @Get()
    async getGlEntries(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Query() query: GlQueryDto,
    ) {
        return this.svc.getGlEntries(req.user.userId, companyId, query)
    }

    /**
     * GET /api/companies/:companyId/general-ledger/summary
     *
     * Returns aggregate totals (totalDebits, totalCredits, netChange, entryCount)
     * for the current filter selection — useful for report headers.
     */
    @Get('summary')
    async getGlSummary(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Query() query: GlQueryDto,
    ) {
        return this.svc.getGlSummary(req.user.userId, companyId, query)
    }

    /**
     * GET /api/companies/:companyId/general-ledger/account-list
     *
     * Returns all active accounts with id, code, name, type.category
     * for use in the account filter dropdown on the GL page.
     */
    @Get('account-list')
    async getAccountList(
        @Req() req: any,
        @Param('companyId') companyId: string,
    ) {
        return this.svc.getAccountList(req.user.userId, companyId)
    }
}
