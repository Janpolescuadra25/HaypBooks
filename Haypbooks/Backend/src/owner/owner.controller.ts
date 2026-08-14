import { Body, Controller, Get, Param, Patch, Put, Query, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CompanyService } from '../companies/company.service'
import { OwnerService } from './owner.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('Owner')
@Controller('api/owner')
export class OwnerController {
  constructor(
    private readonly ownerService: OwnerService,
    private readonly companyService: CompanyService,
  ) {}

  @Get('health')
  async health() {
    return this.ownerService.getHealth()
  }

  @Get('dashboard')
  async getDashboard(@Req() req: any) {
    return this.companyService.getOwnerDashboard(req.user?.userId)
  }

  @Get('cash-position')
  async getCashPosition(@Req() req: any) {
    return this.companyService.getOwnerCashPosition(req.user?.userId)
  }

  @Get('financial-summary')
  async getFinancialSummary(@Req() req: any) {
    return this.companyService.getOwnerFinancialSummary(req.user?.userId)
  }

  @Get('storage/usage')
  async getPlatformStorageUsage() {
    return this.ownerService.getPlatformStorageUsage()
  }

  @Get('storage/usage/:companyId')
  async getCompanyStorageUsage(@Param('companyId') companyId: string) {
    return this.ownerService.getCompanyStorageUsage(companyId)
  }

  @Get('users')
  async getUsers(
    @Query('query') query?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ownerService.getUsers(query, page, limit)
  }

  @Patch('users/:userId/status')
  async setUserSuspendStatus(
    @Param('userId') userId: string,
    @Body() body: { suspend: boolean },
    @Req() req: any,
  ) {
    return this.ownerService.setUserSuspendStatus(userId, body.suspend, req)
  }

  @Put('storage/limits/:companyId')
  async setStorageLimit(
    @Param('companyId') companyId: string,
    @Body() body: { overrideMb: number | null },
    @Req() req: any,
  ) {
    return this.ownerService.setStorageLimit(
      companyId,
      body.overrideMb,
      req.user?.userId,
    )
  }
}
