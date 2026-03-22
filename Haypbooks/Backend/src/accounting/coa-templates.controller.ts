import { Controller, Get, Post, Body, Query, Req, BadRequestException, UseGuards } from '@nestjs/common'
import { AccountingService } from './accounting.service'
import { CoaTemplate } from './coa-templates'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('api/accounting')
export class CoaTemplatesController {
  constructor(private readonly svc: AccountingService) {}

  @Get('coa-templates')
  async listTemplates(@Query('industry') industry?: string) {
    return this.svc.listCoaTemplates(industry)
  }

  @Post('coa-templates')
  async saveTemplates(@Body() templates: CoaTemplate[]) {
    return this.svc.saveCoaTemplates(templates)
  }

  @UseGuards(JwtAuthGuard)
  @Get('close-workflow')
  async getCloseWorkflow(@Req() req: any, @Query('companyId') companyId: string) {
    if (!companyId) {
      throw new BadRequestException('companyId query parameter is required')
    }
    if (!req || !req.user || !req.user.userId) {
      throw new BadRequestException('Unauthorized request')
    }
    return this.svc.getCloseWorkflow(req.user.userId, companyId)
  }

  @UseGuards(JwtAuthGuard)
  @Post('close-workflow/run')
  async runCloseWorkflow(@Req() req: any, @Body() body: { companyId: string; stepId: string }) {
    if (!body?.companyId || !body?.stepId) {
      throw new BadRequestException('companyId and stepId are required')
    }
    if (!req || !req.user || !req.user.userId) {
      throw new BadRequestException('Unauthorized request')
    }
    await this.svc.assertCompanyAccessPublic(req.user.userId, body.companyId)
    return this.svc.getCloseWorkflow(req.user.userId, body.companyId)
  }

  @UseGuards(JwtAuthGuard)
  @Post('close-workflow/complete')
  async completeCloseWorkflow(@Req() req: any, @Body() body: { companyId: string }) {
    if (!body?.companyId) {
      throw new BadRequestException('companyId is required')
    }
    if (!req || !req.user || !req.user.userId) {
      throw new BadRequestException('Unauthorized request')
    }
    await this.svc.assertCompanyAccessPublic(req.user.userId, body.companyId)
    return this.svc.completeCloseWorkflow(req.user.userId, body.companyId)
  }
}
