import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CompanyAccessGuard } from '../auth/guards/company-access.guard'
import { ExpensesService } from './expenses.service'
import { ApService } from '../ap/ap.service'

@Controller('api/companies/:companyId')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService, private readonly apService: ApService) {}

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

  @Get('expenses/reimbursements')
  listReimbursements(@Req() req: any, @Param('companyId') companyId: string, @Query() query: any) {
    return this.expensesService.listReimbursements(req.user.userId, companyId, query)
  }

  @Post('expenses/reimbursements')
  createReimbursement(@Req() req: any, @Param('companyId') companyId: string, @Body() body: any) {
    return this.expensesService.createReimbursement(req.user.userId, companyId, body)
  }

  @Get('expenses/reimbursements/:id')
  getReimbursement(@Req() req: any, @Param('companyId') companyId: string, @Param('id') id: string) {
    return this.expensesService.getReimbursement(req.user.userId, companyId, id)
  }

  @Post('expenses/reimbursements/:id')
  updateReimbursement(@Req() req: any, @Param('companyId') companyId: string, @Param('id') id: string, @Body() body: any) {
    return this.expensesService.updateReimbursement(req.user.userId, companyId, id, body)
  }

  @Get('expenses')
  listExpenseReports(@Req() req: any, @Param('companyId') companyId: string, @Query() query: any) {
    return this.expensesService.listExpenseReports(req.user.userId, companyId, query)
  }

  @Post('expenses')
  createExpenseReport(@Req() req: any, @Param('companyId') companyId: string, @Body() body: any) {
    return this.expensesService.createExpenseReport(req.user.userId, companyId, body)
  }

  @Get('expenses/:id')
  getExpenseReport(@Req() req: any, @Param('companyId') companyId: string, @Param('id') id: string) {
    return this.expensesService.getExpenseReport(req.user.userId, companyId, id)
  }

  @Post('expenses/:id/submit')
  submitExpenseReport(@Req() req: any, @Param('companyId') companyId: string, @Param('id') id: string) {
    return this.expensesService.submitExpenseReport(req.user.userId, companyId, id)
  }

  @Delete('expenses/reimbursements/:id')
  deleteReimbursement(@Req() req: any, @Param('companyId') companyId: string, @Param('id') id: string) {
    return this.expensesService.deleteReimbursement(req.user.userId, companyId, id)
  }

  @Delete('per-diem/:id')
  deletePerDiem(@Req() req: any, @Param('companyId') companyId: string, @Param('id') id: string) {
    return this.apService.deletePerDiem(req.user.userId, companyId, id)
  }

  @Post('expenses/:id/approve')
  @HttpCode(HttpStatus.OK)
  approveExpenseReport(@Req() req: any, @Param('companyId') companyId: string, @Param('id') id: string) {
    return this.expensesService.approveExpenseReport(req.user.userId, companyId, id)
  }

  @Post('expenses/:id/reimburse')
  @HttpCode(HttpStatus.OK)
  reimburseExpenseReport(@Req() req: any, @Param('companyId') companyId: string, @Param('id') id: string, @Body() body: any) {
    return this.expensesService.reimburseExpenseReport(req.user.userId, companyId, id, body)
  }

  @Post('expenses/:id/void')
  @HttpCode(HttpStatus.OK)
  voidExpenseClaim(@Req() req: any, @Param('companyId') companyId: string, @Param('id') id: string) {
    return this.expensesService.voidExpenseClaim(req.user.userId, companyId, id)
  }

  @Patch('expenses/:expenseId')
  updateExpenseReport(@Req() req: any, @Param('companyId') companyId: string, @Param('expenseId') expenseId: string, @Body() body: any) {
    return this.expensesService.updateExpenseReport(req.user.userId, companyId, expenseId, body)
  }
}
