import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CompanyService } from '../companies/company.service'

@Controller('api/owner')
export class OwnerController {
  constructor(private readonly svc: CompanyService) {}

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  async getDashboard(@Req() req: any) {
    return this.svc.getOwnerDashboard(req.user?.userId)
  }

  @Get('cash-position')
  @UseGuards(JwtAuthGuard)
  async getCashPosition(@Req() req: any) {
    return this.svc.getOwnerCashPosition(req.user?.userId)
  }

  @Get('financial-summary')
  @UseGuards(JwtAuthGuard)
  async getFinancialSummary(@Req() req: any) {
    return this.svc.getOwnerFinancialSummary(req.user?.userId)
  }
}
