import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CompanyAccessGuard } from '../auth/guards/company-access.guard'
import { BankingService } from './banking.service'

@Controller('api/companies/:companyId/bank-accounts')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class CompanyBankAccountsController {
  constructor(private readonly bankingService: BankingService) {}

  @Get()
  async list(@Req() req: any, @Param('companyId') companyId: string) {
    return this.bankingService.listBankAccounts(req.user.userId, companyId)
  }

  @Post()
  async create(@Req() req: any, @Param('companyId') companyId: string, @Body() body: any) {
    const payload = {
      name: body.name,
      accountNumber: body.accountNumber,
      currency: body.currency,
      currentBalance: Number(body.currentBalance ?? 0),
      institution: body.institution ?? '',
      isDefault: body.isDefault ?? false,
    }
    return this.bankingService.createBankAccount(req.user.userId, companyId, payload)
  }
}
