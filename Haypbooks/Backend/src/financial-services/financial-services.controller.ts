import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CompanyAccessGuard } from '../auth/guards/company-access.guard'
import { FinancialServicesService } from './financial-services.service'

@UseGuards(JwtAuthGuard, CompanyAccessGuard)
@Controller('api/companies/:companyId/financial-services')
export class FinancialServicesController {
    constructor(private readonly svc: FinancialServicesService) { }

    // GET /api/companies/:companyId/financial-services/revenue-forecast
    @Get('revenue-forecast')
    getRevenueForecast(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Query() q: any,
    ) {
        return this.svc.getRevenueForecast(req.user.userId, cid, q)
    }

    // GET /api/companies/:companyId/financial-services/cash-flow
    @Get('cash-flow')
    getCashFlow(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Query() q: any,
    ) {
        return this.svc.getCashFlow(req.user.userId, cid, q)
    }

    // GET /api/companies/:companyId/financial-services/loans
    @Get('loans')
    getLoans(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Query() q: any,
    ) {
        return this.svc.getLoans(req.user.userId, cid, q)
    }

    // GET /api/companies/:companyId/financial-services/credit-lines
    @Get('credit-lines')
    getCreditLines(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Query() q: any,
    ) {
        return this.svc.getCreditLines(req.user.userId, cid, q)
    }

    // GET /api/companies/:companyId/financial-services/investments
    @Get('investments')
    getInvestments(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Query() q: any,
    ) {
        return this.svc.getInvestments(req.user.userId, cid, q)
    }

    // GET /api/companies/:companyId/financial-services/bank-accounts
    @Get('bank-accounts')
    getBankAccounts(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Query() q: any,
    ) {
        return this.svc.getBankAccounts(req.user.userId, cid, q)
    }

    // GET /api/companies/:companyId/financial-services/transactions
    @Get('transactions')
    getTransactions(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Query() q: any,
    ) {
        return this.svc.getTransactions(req.user.userId, cid, q)
    }

    // GET /api/companies/:companyId/financial-services/checking-account
    @Get('checking-account')
    getCheckingAccount(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Query() q: any,
    ) {
        return this.svc.getCheckingAccount(req.user.userId, cid, q)
    }

    // GET /api/companies/:companyId/financial-services/savings-accounts
    @Get('savings-accounts')
    getSavingsAccounts(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Query() q: any,
    ) {
        return this.svc.getSavingsAccounts(req.user.userId, cid, q)
    }

    // GET /api/companies/:companyId/financial-services/merchant-services
    @Get('merchant-services')
    getMerchantServices(
        @Req() req: any,
        @Param('companyId') cid: string,
    ) {
        return this.svc.getMerchantServices(req.user.userId, cid)
    }

    // GET /api/companies/:companyId/financial-services/cash-runway
    @Get('cash-runway')
    getCashRunway(
        @Req() req: any,
        @Param('companyId') cid: string,
        @Query() q: any,
    ) {
        return this.svc.getCashRunway(req.user.userId, cid, q)
    }

    // GET /api/companies/:companyId/financial-services/credit-score
    @Get('credit-score')
    getCreditScore(
        @Req() req: any,
        @Param('companyId') cid: string,
    ) {
        return this.svc.getCreditScore(req.user.userId, cid)
    }
}
