import { Controller, Get, Post, Body, Param, Query, Req, UseGuards } from '@nestjs/common'
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

  // ─── Invoices (Sales facade) ────────────────────────────────────────────

  @Get('invoices')
  async listInvoices(@Req() req: any, @Param('companyId') companyId: string, @Query() query: any) {
    return this.salesService.listInvoices(req.user.userId, companyId, query)
  }

  @Post('invoices')
  async createInvoice(@Req() req: any, @Param('companyId') companyId: string, @Body() body: any) {
    return this.salesService.createInvoice(req.user.userId, companyId, body)
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

  @Post('payments/:paymentId/void')
  async voidPayment(@Req() req: any, @Param('companyId') companyId: string, @Param('paymentId') paymentId: string) {
    return this.salesService.voidPayment(req.user.userId, companyId, paymentId)
  }
}
