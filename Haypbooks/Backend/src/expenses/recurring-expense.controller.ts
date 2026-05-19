import { Controller, Get, Post, Patch, Body, Param, Query, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CompanyAccessGuard } from '../auth/guards/company-access.guard'
import { RecurringExpenseService } from './recurring-expense.service'

@Controller('api/companies/:companyId')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class RecurringExpenseController {
  constructor(private readonly recurringExpenseService: RecurringExpenseService) {}

  @Get('recurring-expenses')
  listRecurringExpenses(
    @Req() req: any,
    @Param('companyId') companyId: string,
    @Query('status') status?: string,
    @Query('vendorId') vendorId?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    return this.recurringExpenseService.list(companyId, {
      status,
      vendorId,
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    })
  }

  @Get('recurring-expenses/:id')
  getRecurringExpense(@Req() req: any, @Param('companyId') companyId: string, @Param('id') id: string) {
    return this.recurringExpenseService.getById(companyId, id)
  }

  @Post('recurring-expenses')
  createRecurringExpense(@Req() req: any, @Param('companyId') companyId: string, @Body() body: any) {
    return this.recurringExpenseService.create(req.user.userId, companyId, body)
  }

  @Patch('recurring-expenses/:id')
  updateRecurringExpense(@Req() req: any, @Param('companyId') companyId: string, @Param('id') id: string, @Body() body: any) {
    return this.recurringExpenseService.update(companyId, id, req.user.userId, body)
  }

  @Post('recurring-expenses/:id/cancel')
  cancelRecurringExpense(@Req() req: any, @Param('companyId') companyId: string, @Param('id') id: string) {
    return this.recurringExpenseService.cancel(companyId, id, req.user.userId)
  }
}
