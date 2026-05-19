import { Controller, Get, Query, Param, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { AuditService } from './audit.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CompanyAccessGuard } from '../auth/guards/company-access.guard'

@Controller('api/companies/:companyId')
@UseGuards(JwtAuthGuard, CompanyAccessGuard)
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('audit-logs')
  @HttpCode(HttpStatus.OK)
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
    return this.auditService.getCompanyLogs(companyId, {
      entityType,
      action,
      userId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      skip: skip ? parseInt(skip, 10) : undefined,
      take: take ? parseInt(take, 10) : undefined,
    })
  }

  @Get('audit-logs/:entityType/:entityId')
  @HttpCode(HttpStatus.OK)
  async getEntityHistory(
    @Param('companyId') companyId: string,
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditService.getEntityHistory(companyId, entityType, entityId)
  }
}
