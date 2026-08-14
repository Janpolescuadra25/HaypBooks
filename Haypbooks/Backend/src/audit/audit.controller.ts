import { Controller, Get, Query, Param, UseGuards, Res } from '@nestjs/common'
import { Response } from 'express'
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
    @Query('entityId') entityId?: string,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('search') search?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const parsedPage = page ? parseInt(page, 10) : NaN
    const parsedLimit = limit ? parseInt(limit, 10) : 50
    const parsedSkip = skip ? parseInt(skip, 10) : NaN
    const parsedTake = take ? parseInt(take, 10) : NaN

    const pageNumber = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1
    const limitValue = Math.min(Number.isFinite(parsedLimit) ? parsedLimit : 50, 100)
    const skipValue = Number.isFinite(parsedPage)
      ? (pageNumber - 1) * limitValue
      : Number.isFinite(parsedSkip)
        ? parsedSkip
        : 0
    const takeValue = Number.isFinite(parsedTake) ? Math.min(parsedTake, 100) : limitValue

    const result = await this.auditService.getCompanyLogs(companyId, {
      entityType,
      entityId,
      action,
      userId,
      search,
      startDate: from ? new Date(from) : startDate ? new Date(startDate) : undefined,
      endDate: to ? new Date(to) : endDate ? new Date(endDate) : undefined,
      skip: skipValue,
      take: takeValue,
    })

    return {
      data: result.items,
      total: result.total,
      page: pageNumber,
      limit: limitValue,
      totalPages: Math.max(1, Math.ceil(result.total / limitValue)),
    }
  }

  @Get('audit-logs/export')
  async exportAuditLogs(
    @Param('companyId') companyId: string,
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('action') action?: string,
    @Query('userId') userId?: string,
    @Query('search') search?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Res() res?: Response,
  ) {
    const parsedPage = page ? parseInt(page, 10) : NaN
    const parsedLimit = limit ? parseInt(limit, 10) : 50
    const parsedSkip = skip ? parseInt(skip, 10) : NaN
    const parsedTake = take ? parseInt(take, 10) : NaN

    const pageNumber = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1
    const limitValue = Number.isFinite(parsedLimit) ? Math.min(parsedLimit, 100) : 50
    const skipValue = Number.isFinite(parsedPage)
      ? (pageNumber - 1) * limitValue
      : Number.isFinite(parsedSkip)
        ? parsedSkip
        : undefined
    const takeValue = Number.isFinite(parsedTake) ? Math.min(parsedTake, 100) : limitValue

    if (!res) {
      throw new Error('Response object is required')
    }

    const result = await this.auditService.getCompanyLogs(companyId, {
      entityType,
      entityId,
      action,
      userId,
      search,
      startDate: from ? new Date(from) : startDate ? new Date(startDate) : undefined,
      endDate: to ? new Date(to) : endDate ? new Date(endDate) : undefined,
      skip: skipValue,
      take: takeValue,
    })

    const headers = ['Timestamp', 'User', 'Entity Type', 'Entity ID', 'Action', 'Field Name', 'Old Value', 'New Value', 'Source Document']
    const rows = result.items.flatMap((log) => {
      const sourceDocument = log.recordId ? `${log.tableName} ${log.recordId}` : log.tableName
      if (Array.isArray(log.lines) && log.lines.length > 0) {
        return log.lines.map((line) => [
          log.createdAt.toISOString(),
          log.user?.name ?? log.user?.email ?? 'System',
          log.tableName,
          log.recordId ?? '',
          log.action,
          line.fieldName,
          line.oldValue ?? '',
          line.newValue ?? '',
          sourceDocument,
        ])
      }
      return [[
        log.createdAt.toISOString(),
        log.user?.name ?? log.user?.email ?? 'System',
        log.tableName,
        log.recordId ?? '',
        log.action,
        '',
        '',
        '',
        sourceDocument,
      ]]
    })

    const escapeValue = (value: string | number | null | undefined) => {
      if (value === null || value === undefined) return ''
      const text = String(value)
      if (text.includes(',') || text.includes('"') || text.includes('\n')) {
        return `"${text.replace(/"/g, '""')}"`
      }
      return text
    }

    const csv = [headers.join(','), ...rows.map((row) => row.map(escapeValue).join(','))].join('\r\n')
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename=audit-log-export.csv')
    res.send(csv)
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
