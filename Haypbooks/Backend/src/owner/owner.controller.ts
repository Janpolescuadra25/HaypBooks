import { Body, Controller, Get, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { SystemRoleGuard } from '../auth/guards/system-role.guard'
import { SystemRoles } from '../auth/decorators/system-roles.decorator'
import { OwnerService } from './owner.service'

@UseGuards(JwtAuthGuard)
@Controller('api/owner')
export class OwnerController {
  constructor(
    private readonly ownerService: OwnerService,
  ) {}

  @Get('health')
  @UseGuards(SystemRoleGuard)
  @SystemRoles('SUPER_ADMIN')
  async health() {
    return this.ownerService.getHealth()
  }

  @Get('storage/usage')
  @UseGuards(SystemRoleGuard)
  @SystemRoles('SUPER_ADMIN')
  async getPlatformStorageUsage() {
    return this.ownerService.getPlatformStorageUsage()
  }

  @Get('storage/usage/:companyId')
  @UseGuards(SystemRoleGuard)
  @SystemRoles('SUPER_ADMIN')
  async getCompanyStorageUsage(@Param('companyId') companyId: string) {
    return this.ownerService.getCompanyStorageUsage(companyId)
  }

  @Get('users')
  @UseGuards(SystemRoleGuard)
  @SystemRoles('SUPER_ADMIN')
  async getUsers(
    @Query('query') query?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.ownerService.getUsers(query, page, limit)
  }

  @Patch('users/:userId/status')
  @UseGuards(SystemRoleGuard)
  @SystemRoles('SUPER_ADMIN')
  async setUserSuspendStatus(
    @Param('userId') userId: string,
    @Body() body: { suspend: boolean },
    @Req() req: any,
  ) {
    return this.ownerService.setUserSuspendStatus(userId, body.suspend, req)
  }

  @Get('metrics/plan-distribution')
  @UseGuards(SystemRoleGuard)
  @SystemRoles('SUPER_ADMIN')
  async getPlanDistribution() {
    return this.ownerService.getPlanDistribution()
  }

  @Post('metrics/snapshot')
  @UseGuards(SystemRoleGuard)
  @SystemRoles('SUPER_ADMIN')
  async recordMetricsSnapshot() {
    return this.ownerService.recordMetricsSnapshot()
  }

  @Get('metrics/history')
  @UseGuards(SystemRoleGuard)
  @SystemRoles('SUPER_ADMIN')
  async getMetricsHistory(@Query('days') days?: string) {
    return this.ownerService.getMetricsHistory(days)
  }

  @Put('storage/limits/:companyId')
  @UseGuards(SystemRoleGuard)
  @SystemRoles('SUPER_ADMIN')
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
