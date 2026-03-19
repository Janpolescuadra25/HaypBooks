import {
    Controller, Get, Post, Put, Patch, Body, Param, Query,
    UseGuards, Req, HttpCode, HttpStatus,
} from '@nestjs/common'
import { TaxService } from './tax.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CompanyAccessGuard } from '../auth/guards/company-access.guard'

@Controller(['api/companies/:companyId/tax', 'api/companies/:companyId/taxes'])
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class TaxController {
    constructor(private readonly svc: TaxService) { }

    // ─── Tax Summary ──────────────────────────────────────────────────────────

    @Get('summary')
    getTaxSummary(
        @Req() req: any, @Param('companyId') cid: string,
        @Query('from') from?: string, @Query('to') to?: string,
    ) {
        return this.svc.getTaxSummary(req.user.userId, cid, { from, to })
    }

    // ─── Tax Codes ────────────────────────────────────────────────────────────

    @Get('codes')
    listTaxCodes(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.listTaxCodes(req.user.userId, cid)
    }

    @Post('codes')
    createTaxCode(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createTaxCode(req.user.userId, cid, body)
    }

    // ─── Tax Rates ────────────────────────────────────────────────────────────

    @Get('rates')
    listTaxRates(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.listTaxRates(req.user.userId, cid)
    }

    @Post('rates')
    createTaxRate(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createTaxRate(req.user.userId, cid, body)
    }

    // ─── VAT Returns ──────────────────────────────────────────────────────────

    @Get('vat-returns')
    listVatReturns(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listVatReturns(req.user.userId, cid, q)
    }

    @Post('vat-returns')
    createVatReturn(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createVatReturn(req.user.userId, cid, body)
    }

    @Get('vat-returns/:returnId')
    getVatReturn(@Req() req: any, @Param('companyId') cid: string, @Param('returnId') rid: string) {
        return this.svc.getVatReturn(req.user.userId, cid, rid)
    }

    @Post('vat-returns/:returnId/file')
    @HttpCode(HttpStatus.OK)
    fileVatReturn(@Req() req: any, @Param('companyId') cid: string, @Param('returnId') rid: string) {
        return this.svc.fileVatReturn(req.user.userId, cid, rid)
    }

    // ─── Withholding Tax ──────────────────────────────────────────────────────

    @Get('withholding')
    listWithholding(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.listWithholdingTaxes(req.user.userId, cid)
    }

    @Post('withholding')
    createWithholding(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createWithholdingTax(req.user.userId, cid, body)
    }

    @Put('withholding/:id')
    updateWithholding(
        @Req() req: any, @Param('companyId') cid: string,
        @Param('id') id: string, @Body() body: any,
    ) {
        return this.svc.updateWithholdingTax(req.user.userId, cid, id, body)
    }

    // ─── Form 2307 ────────────────────────────────────────────────────────────

    @Get('form-2307')
    listForm2307s(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listForm2307s(req.user.userId, cid, q)
    }

    @Post('form-2307')
    createForm2307(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createForm2307(req.user.userId, cid, body)
    }

    @Get('form-2307/:formId')
    getForm2307(@Req() req: any, @Param('companyId') cid: string, @Param('formId') fid: string) {
        return this.svc.getForm2307(req.user.userId, cid, fid)
    }

    @Patch('form-2307/:formId/status')
    updateForm2307Status(
        @Req() req: any, @Param('companyId') cid: string,
        @Param('formId') fid: string, @Body() body: { status: string },
    ) {
        return this.svc.updateForm2307Status(req.user.userId, cid, fid, body.status)
    }

    // ─── Alphalist ────────────────────────────────────────────────────────────

    @Get('alphalist')
    getAlphalist(
        @Req() req: any, @Param('companyId') cid: string,
        @Query('taxYear') taxYear: string,
    ) {
        return this.svc.getAlphalist(req.user.userId, cid, parseInt(taxYear))
    }

    @Post('alphalist/generate')
    @HttpCode(HttpStatus.OK)
    generateAlphalist(
        @Req() req: any, @Param('companyId') cid: string,
        @Body() body: { taxYear: number },
    ) {
        return this.svc.generateAlphalist(req.user.userId, cid, body.taxYear)
    }

    // ─── BIR Forms ────────────────────────────────────────────────────────────

    @Get('bir-forms')
    listBirForms(
        @Req() req: any, @Param('companyId') cid: string,
        @Query('taxYear') taxYear?: string, @Query('formType') formType?: string,
    ) {
        return this.svc.listBirForms(req.user.userId, cid, { taxYear: taxYear ? parseInt(taxYear) : undefined, formType })
    }

    @Post('bir-forms')
    generateBirForm(
        @Req() req: any, @Param('companyId') cid: string,
        @Body() body: { formType: string; taxYear: number; period?: string },
    ) {
        return this.svc.generateBirForm(req.user.userId, cid, body)
    }

    @Get('bir-forms/:formType')
    getBirForm(
        @Req() req: any, @Param('companyId') cid: string,
        @Param('formType') formType: string,
        @Query('taxYear') taxYear?: string, @Query('period') period?: string,
    ) {
        return this.svc.getBirFormData(req.user.userId, cid, formType, {
            taxYear: taxYear ? parseInt(taxYear) : undefined,
            period,
        })
    }

    // ─── Percentage Tax ───────────────────────────────────────────────────────

    @Get('percentage-tax')
    listPercentageTax(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.listPercentageTax(req.user.userId, cid, q)
    }

    @Post('percentage-tax')
    createPercentageTax(@Req() req: any, @Param('companyId') cid: string, @Body() body: any) {
        return this.svc.createPercentageTax(req.user.userId, cid, body)
    }

    @Put('percentage-tax/:id')
    updatePercentageTax(
        @Req() req: any, @Param('companyId') cid: string,
        @Param('id') id: string, @Body() body: any,
    ) {
        return this.svc.updatePercentageTax(req.user.userId, cid, id, body)
    }

    // ─── Tax Calendar ─────────────────────────────────────────────────────────

    @Get('calendar')
    getTaxCalendar(
        @Req() req: any, @Param('companyId') cid: string,
        @Query('taxYear') taxYear?: string,
    ) {
        return this.svc.getTaxCalendar(req.user.userId, cid, taxYear ? parseInt(taxYear) : new Date().getFullYear())
    }

    // ─── Filing Batch ─────────────────────────────────────────────────────────

    @Get('filing-batch')
    getFilingBatch(
        @Req() req: any, @Param('companyId') cid: string,
        @Query('period') period?: string,
    ) {
        return this.svc.getFilingBatch(req.user.userId, cid, period)
    }

    // ─── Sales Output Tax ─────────────────────────────────────────────────────

    @Get('zero-rated-exempt')
    getZeroRatedExempt(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.getZeroRatedExempt(req.user.userId, cid, q)
    }

    @Get('output-tax-ledger')
    getOutputTaxLedger(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.getOutputTaxLedger(req.user.userId, cid, q)
    }

    // ─── Purchase Input Tax ───────────────────────────────────────────────────

    @Get('creditable-withholding')
    getCreditableWithholding(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.getCreditableWithholding(req.user.userId, cid, q)
    }

    @Get('reconciliation')
    getTaxReconciliation(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.getTaxReconciliation(req.user.userId, cid, q)
    }

    @Get('expanded-withholding')
    getExpandedWithholding(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.getExpandedWithholding(req.user.userId, cid, q)
    }

    // ─── Corporate Tax ────────────────────────────────────────────────────────

    @Get('income-tax')
    getIncomeTax(@Req() req: any, @Param('companyId') cid: string, @Query('taxYear') taxYear?: string) {
        return this.svc.getIncomeTax(req.user.userId, cid, taxYear ? parseInt(taxYear) : undefined)
    }

    @Get('deferred-tax')
    getDeferredTax(@Req() req: any, @Param('companyId') cid: string, @Query('period') period?: string) {
        return this.svc.getDeferredTaxItems(req.user.userId, cid, period)
    }

    @Get('transfer-pricing')
    getTransferPricing(@Req() req: any, @Param('companyId') cid: string, @Query('fiscalYear') fiscalYear?: string) {
        return this.svc.getTransferPricingDocuments(req.user.userId, cid, fiscalYear ? parseInt(fiscalYear) : undefined)
    }

    @Get('multi-jurisdiction')
    getMultiJurisdiction(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.getMultiJurisdiction(req.user.userId, cid, q)
    }

    // ─── Year-End ─────────────────────────────────────────────────────────────

    @Get('year-end/adjustments')
    getYearEndAdjustments(@Req() req: any, @Param('companyId') cid: string, @Query('period') period?: string) {
        return this.svc.getYearEndAdjustments(req.user.userId, cid, period)
    }

    @Get('year-end/closing-entries')
    getYearEndClosingEntries(@Req() req: any, @Param('companyId') cid: string, @Query('period') period?: string) {
        return this.svc.getYearEndClosingEntries(req.user.userId, cid, period)
    }

    @Get('year-end/annual-summary')
    getAnnualTaxSummary(@Req() req: any, @Param('companyId') cid: string, @Query('taxYear') taxYear?: string) {
        return this.svc.getAnnualTaxSummary(req.user.userId, cid, taxYear ? parseInt(taxYear) : undefined)
    }

    // ─── Tax Reporting (extended) ─────────────────────────────────────────────

    @Get('liability')
    getTaxLiability(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.getTaxLiability(req.user.userId, cid, q)
    }

    @Get('audit-trail')
    getTaxAuditTrail(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.getTaxAuditTrail(req.user.userId, cid, q)
    }

    // ─── Filing & Payments (extended) ─────────────────────────────────────────

    @Get('remittances')
    getRemittances(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.getRemittances(req.user.userId, cid, q)
    }

    @Get('filing-history')
    getFilingHistory(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.getFilingHistory(req.user.userId, cid, q)
    }

    @Get('e-filing')
    getEFiling(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.getEFiling(req.user.userId, cid, q)
    }

    @Get('payments')
    getTaxPayments(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.getTaxPaymentsExtended(req.user.userId, cid, q)
    }

    @Get('tax-returns')
    getTaxReturns(@Req() req: any, @Param('companyId') cid: string, @Query() q: any) {
        return this.svc.getTaxReturns(req.user.userId, cid, q)
    }

    // ─── Tax Setup (extended) ─────────────────────────────────────────────────

    @Get('agencies')
    getTaxAgencies(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.getTaxAgencies(req.user.userId, cid)
    }

    @Get('jurisdictions')
    getTaxJurisdictions(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.getTaxJurisdictions(req.user.userId, cid)
    }

    @Get('exemptions')
    getTaxExemptions(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.getTaxExemptions(req.user.userId, cid)
    }

    @Get('withholding-setup')
    getWithholdingSetup(@Req() req: any, @Param('companyId') cid: string) {
        return this.svc.getWithholdingSetup(req.user.userId, cid)
    }
}

