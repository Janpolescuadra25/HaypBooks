import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common'
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

  // ─── Payments (Sales facade) ─────────────────────────────────────────────

  @Get('payments')
  async listPayments(@Req() req: any, @Param('companyId') companyId: string, @Query() query: any) {
    return this.salesService.listPayments(req.user.userId, companyId, query)
  }

  @Post('payments')
  async recordPayment(@Req() req: any, @Param('companyId') companyId: string, @Body() body: any) {
    return this.salesService.recordPayment(req.user.userId, companyId, body)
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
