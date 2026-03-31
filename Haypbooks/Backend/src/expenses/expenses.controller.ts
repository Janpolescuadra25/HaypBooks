import { Controller, Get, Post, Body, Param, Query, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CompanyAccessGuard } from '../auth/guards/company-access.guard'
import { ExpensesService } from './expenses.service'

@Controller('api/companies/:companyId')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get('vendors')
  listVendors(@Req() req: any, @Param('companyId') companyId: string, @Query() query: any) {
    return this.expensesService.listVendors(req.user.userId, companyId, query)
  }

  @Post('vendors')
  createVendor(@Req() req: any, @Param('companyId') companyId: string, @Body() body: any) {
    return this.expensesService.createVendor(req.user.userId, companyId, body)
  }

  @Get('bills')
  listBills(@Req() req: any, @Param('companyId') companyId: string, @Query() query: any) {
    return this.expensesService.listBills(req.user.userId, companyId, query)
  }

  @Post('bills')
  createBill(@Req() req: any, @Param('companyId') companyId: string, @Body() body: any) {
    return this.expensesService.createBill(req.user.userId, companyId, body)
  }

  @Get('bill-payments')
  listBillPayments(@Req() req: any, @Param('companyId') companyId: string, @Query() query: any) {
    return this.expensesService.listBillPayments(req.user.userId, companyId, query)
  }

  @Post('bill-payments')
  recordBillPayment(@Req() req: any, @Param('companyId') companyId: string, @Body() body: any) {
    return this.expensesService.recordBillPayment(req.user.userId, companyId, body)
  }
}
