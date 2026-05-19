import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common'
import { AuditService } from './audit.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CompanyAccessGuard } from '../auth/guards/company-access.guard'

@Controller('api/companies/:companyId')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('audit-logs')
  async getCompanyAuditLogs(
    @Param('companyId') companyId: string,
    @Query('entityType') entityType?: string,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const parsedSkip = skip ? parseInt(skip, 10) : 0
    const parsedTake = Math.min(take ? parseInt(take, 10) : 50, 100)
    const skipValue = Number.isNaN(parsedSkip) ? 0 : parsedSkip
    const takeValue = Number.isNaN(parsedTake) ? 50 : parsedTake

    return this.auditService.getCompanyLogs(companyId, {
      entityType,
      action,
      userId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      skip: skipValue,
      take: takeValue,
    })
  }

  @Get('audit-logs/:entityType/:entityId')
  async getEntityHistory(
    @Param('companyId') companyId: string,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditService.getEntityHistory(companyId, entityType, entityId)
  }
}
