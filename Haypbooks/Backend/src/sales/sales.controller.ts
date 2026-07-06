import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CompanyAccessGuard } from '../auth/guards/company-access.guard'
import { SalesService } from './sales.service'

@Controller('api/companies/:companyId')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get('customers')
  async listCustomers(@Req() req: any, @Param('companyId') companyId: string, @Query() query: any) {
    return this.salesService.listCustomers(req.user.userId, companyId, query)
  }

  @Post('customers')
  async createCustomer(@Req() req: any, @Param('companyId') companyId: string, @Body() body: any) {
    return this.salesService.createCustomer(req.user.userId, companyId, body)
  }

  @Get('customers/:contactId')
  async getCustomer(@Req() req: any, @Param('companyId') companyId: string, @Param('contactId') contactId: string) {
    return this.salesService.getCustomer(req.user.userId, companyId, contactId)
  }

  @Put('customers/:contactId')
  async updateCustomer(@Req() req: any, @Param('companyId') companyId: string, @Param('contactId') contactId: string, @Body() body: any) {
    return this.salesService.updateCustomer(req.user.userId, companyId, contactId, body)
  }

  @Delete('customers/:contactId')
  async deleteCustomer(@Req() req: any, @Param('companyId') companyId: string, @Param('contactId') contactId: string) {
    return this.salesService.deleteCustomer(req.user.userId, companyId, contactId)
  }

  @Get('payment-terms')
  async listPaymentTerms(@Req() req: any, @Param('companyId') companyId: string) {
    return this.salesService.listPaymentTerms(req.user.userId, companyId)
  }

  @Get('subscriptions')
  async listSubscriptions(@Req() req: any, @Param('companyId') companyId: string, @Query() query: any) {
    return this.salesService.listSubscriptions(req.user.userId, companyId, query)
  }

  @Get('revenue-recognition')
  async listRevenueRecognition(@Req() req: any, @Param('companyId') companyId: string, @Query() query: any) {
    return this.salesService.listRevenueRecognition(req.user.userId, companyId, query)
  }

  @Post('revenue-recognition')
  async createRevenueRecognition(@Req() req: any, @Param('companyId') companyId: string, @Body() body: any) {
    return this.salesService.createRevenueRecognition(req.user.userId, companyId, body)
  }

  @Post('revenue-recognition/:id/recognize')
  @HttpCode(HttpStatus.OK)
  async recognizeRevenue(
    @Req() req: any,
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.salesService.recognizeRevenue(req.user.userId, companyId, id, body)
  }

  @Get('deferred-revenue')
  async listDeferredRevenue(@Req() req: any, @Param('companyId') companyId: string, @Query() query: any) {
    return this.salesService.listDeferredRevenue(req.user.userId, companyId, query)
  }

  @Post('deferred-revenue')
  async createDeferredRevenue(@Req() req: any, @Param('companyId') companyId: string, @Body() body: any) {
    return this.salesService.createDeferredRevenue(req.user.userId, companyId, body)
  }

  @Post('deferred-revenue/:id/recognize')
  @HttpCode(HttpStatus.OK)
  async recognizeDeferredRevenue(
    @Req() req: any,
    @Param('companyId') companyId: string,
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.salesService.recognizeDeferredRevenue(req.user.userId, companyId, id, body)
  }

  @Get('payment-links')
  async listPaymentLinks(@Req() req: any, @Param('companyId') companyId: string, @Query() query: any) {
    return this.salesService.listPaymentLinks(req.user.userId, companyId, query)
  }

  @Post('payment-links')
  async createPaymentLink(@Req() req: any, @Param('companyId') companyId: string, @Body() body: any) {
    return this.salesService.createPaymentLink(req.user.userId, companyId, body)
  }

  // ─── Invoices (Sales facade) ────────────────────────────────────────────

  @Get('invoices')
  async listInvoices(@Req() req: any, @Param('companyId') companyId: string, @Query() query: any) {
    return this.salesService.listInvoices(req.user.userId, companyId, query)
  }

  @Post('invoices')
  async createInvoice(@Req() req: any, @Param('companyId') companyId: string, @Body() body: any) {
    return this.salesService.createInvoice(req.user.userId, companyId, body)
  }

  @Get('invoices/:invoiceId')
  async getInvoice(@Req() req: any, @Param('companyId') companyId: string, @Param('invoiceId') invoiceId: string) {
    return this.salesService.getInvoice(req.user.userId, companyId, invoiceId)
  }

  @Put('invoices/:invoiceId')
  async updateInvoice(@Req() req: any, @Param('companyId') companyId: string, @Param('invoiceId') invoiceId: string, @Body() body: any) {
    return this.salesService.updateInvoice(req.user.userId, companyId, invoiceId, body)
  }

  @Post('invoices/:invoiceId/send')
  @HttpCode(HttpStatus.OK)
  async sendInvoice(
    @Req() req: any,
    @Param('companyId') companyId: string,
    @Param('invoiceId') invoiceId: string,
    @Body() body: { subject?: string; body?: string },
  ) {
    return this.salesService.sendInvoice(req.user.userId, companyId, invoiceId, body)
  }

  @Post('invoices/:invoiceId/void')
  @HttpCode(HttpStatus.OK)
  async voidInvoice(
    @Req() req: any,
    @Param('companyId') companyId: string,
    @Param('invoiceId') invoiceId: string,
    @Body() body: { reason?: string },
  ) {
    return this.salesService.voidInvoice(req.user.userId, companyId, invoiceId, body)
  }

  // ─── Quotes (Sales facade) ────────────────────────────────────────────────

  @Get('quotes')
  async listQuotes(@Req() req: any, @Param('companyId') companyId: string, @Query() query: any) {
    return this.salesService.listQuotes(req.user.userId, companyId, query)
  }

  @Post('quotes')
  async createQuote(@Req() req: any, @Param('companyId') companyId: string, @Body() body: any) {
    return this.salesService.createQuote(req.user.userId, companyId, body)
  }

  @Get('quotes/:quoteId')
  async getQuote(@Req() req: any, @Param('companyId') companyId: string, @Param('quoteId') quoteId: string) {
    return this.salesService.getQuote(req.user.userId, companyId, quoteId)
  }

  @Post('quotes/:quoteId/convert')
  @HttpCode(HttpStatus.OK)
  async convertQuote(@Req() req: any, @Param('companyId') companyId: string, @Param('quoteId') quoteId: string) {
    return this.salesService.convertQuoteToInvoice(req.user.userId, companyId, quoteId)
  }

  // ─── Payments (Sales facade) ─────────────────────────────────────────────

  @Get('payments')
  async listPayments(@Req() req: any, @Param('companyId') companyId: string, @Query() query: any) {
    return this.salesService.listPayments(req.user.userId, companyId, query)
  }

  @Post('payments')
  async recordPayment(@Req() req: any, @Param('companyId') companyId: string, @Body() body: any) {
    return this.salesService.recordPayment(req.user.userId, companyId, body)
  }

  @Put('payments/:paymentId')
  async updatePayment(
    @Req() req: any,
    @Param('companyId') companyId: string,
    @Param('paymentId') paymentId: string,
    @Body() body: any,
  ) {
    return this.salesService.updatePayment(req.user.userId, companyId, paymentId, body)
  }

  @Get('payments/:paymentId')
  async getPayment(@Req() req: any, @Param('companyId') companyId: string, @Param('paymentId') paymentId: string) {
    return this.salesService.getPayment(req.user.userId, companyId, paymentId)
  }

  @Post('payments/:paymentId/void')
  async voidPayment(@Req() req: any, @Param('companyId') companyId: string, @Param('paymentId') paymentId: string) {
    return this.salesService.voidPayment(req.user.userId, companyId, paymentId)
  }
}
