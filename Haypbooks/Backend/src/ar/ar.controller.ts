import {
    Controller, Get, Post, Put, Delete, Patch, Body, Param, Query,
    UseGuards, Req, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ArService } from './ar.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CompanyAccessGuard } from '../auth/guards/company-access.guard'

@Controller('api/companies/:companyId/ar')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class ArController {
    constructor(private readonly svc: ArService) { }

    // ─── Customers ────────────────────────────────────────────────────────────

    @Get('customers')
    listCustomers(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Query() query: any,
    ) {
        return this.svc.listCustomers(req.user.userId, companyId, query)
    }

    @Post('customers')
    createCustomer(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: any,
    ) {
        return this.svc.createCustomer(req.user.userId, companyId, body)
    }

    @Get('customers/:contactId')
    getCustomer(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('contactId') contactId: string,
    ) {
        return this.svc.getCustomer(req.user.userId, companyId, contactId)
    }

    @Put('customers/:contactId')
    updateCustomer(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('contactId') contactId: string,
        @Body() body: any,
    ) {
        return this.svc.updateCustomer(req.user.userId, companyId, contactId, body)
    }

    @Delete('customers/:contactId')
    deleteCustomer(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('contactId') contactId: string,
    ) {
        return this.svc.deleteCustomer(req.user.userId, companyId, contactId)
    }

    // ─── Quotes ───────────────────────────────────────────────────────────────

    @Get('quotes')
    listQuotes(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Query() query: any,
    ) {
        return this.svc.listQuotes(req.user.userId, companyId, query)
    }

    @Post('quotes')
    createQuote(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: any,
    ) {
        return this.svc.createQuote(req.user.userId, companyId, body)
    }

    @Get('quotes/:quoteId')
    getQuote(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('quoteId') quoteId: string,
    ) {
        return this.svc.getQuote(req.user.userId, companyId, quoteId)
    }

    @Patch('quotes/:quoteId/status')
    updateQuoteStatus(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('quoteId') quoteId: string,
        @Body() body: { status: string },
    ) {
        return this.svc.updateQuoteStatus(req.user.userId, companyId, quoteId, body.status)
    }

    @Post('quotes/:quoteId/convert')
    @HttpCode(HttpStatus.OK)
    convertQuote(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('quoteId') quoteId: string,
    ) {
        return this.svc.convertToInvoice(req.user.userId, companyId, quoteId)
    }

    // ─── Invoices ─────────────────────────────────────────────────────────────

    @Get('invoices')
    listInvoices(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Query() query: any,
    ) {
        return this.svc.listInvoices(req.user.userId, companyId, query)
    }

    @Post('invoices')
    createInvoice(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: any,
    ) {
        return this.svc.createInvoice(req.user.userId, companyId, body)
    }

    @Get('invoices/:invoiceId')
    getInvoice(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('invoiceId') invoiceId: string,
    ) {
        return this.svc.getInvoice(req.user.userId, companyId, invoiceId)
    }

    @Put('invoices/:invoiceId')
    updateInvoice(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('invoiceId') invoiceId: string,
        @Body() body: any,
    ) {
        return this.svc.updateInvoice(req.user.userId, companyId, invoiceId, body)
    }

    @Post('invoices/:invoiceId/send')
    @HttpCode(HttpStatus.OK)
    sendInvoice(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('invoiceId') invoiceId: string,
    ) {
        return this.svc.sendInvoice(req.user.userId, companyId, invoiceId)
    }

    @Post('invoices/:invoiceId/void')
    @HttpCode(HttpStatus.OK)
    voidInvoice(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('invoiceId') invoiceId: string,
    ) {
        return this.svc.voidInvoice(req.user.userId, companyId, invoiceId)
    }

    // ─── Payments ─────────────────────────────────────────────────────────────

    @Get('payments')
    listPayments(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Query() query: any,
    ) {
        return this.svc.listPayments(req.user.userId, companyId, query)
    }

    @Post('payments')
    recordPayment(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Body() body: any,
    ) {
        return this.svc.recordPayment(req.user.userId, companyId, body)
    }

    @Get('payments/:paymentId')
    getPayment(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('paymentId') paymentId: string,
    ) {
        return this.svc.getPayment(req.user.userId, companyId, paymentId)
    }

    @Post('payments/:paymentId/apply')
    @HttpCode(HttpStatus.OK)
    applyPayment(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('paymentId') paymentId: string,
        @Body() body: { allocations: Array<{ invoiceId: string; amount: number }> },
    ) {
        return this.svc.applyPaymentToInvoices(req.user.userId, companyId, paymentId, body.allocations)
    }

    @Post('payments/:paymentId/void')
    @HttpCode(HttpStatus.OK)
    voidPayment(
        @Req() req: any,
        @Param('companyId') companyId: string,
        @Param('paymentId') paymentId: string,
    ) {
        return this.svc.voidPayment(req.user.userId, companyId, paymentId)
    }

    // ─── AR Aging Report ──────────────────────────────────────────────────────

    @Get('reports/aging')
    getArAging(
        @Req() req: any,
        @Param('companyId') companyId: string,
    ) {
        return this.svc.getArAging(req.user.userId, companyId)
    }
}
