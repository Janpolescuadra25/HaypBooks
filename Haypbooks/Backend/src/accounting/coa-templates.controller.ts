import { Controller, Get, Post, Body, Query, Req, BadRequestException } from '@nestjs/common'
import { AccountingService } from './accounting.service'
import { CoaTemplate } from './coa-templates'

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

  @Get('close-workflow')
  async getCloseWorkflow(@Query('companyId') companyId?: string, @Req() req?: any) {
    if (!companyId) {
      throw new BadRequestException('companyId query parameter is required')
    }
    return this.svc.getCloseWorkflow(req.user.userId, companyId)
  }

  @Post('close-workflow/run')
  async runCloseWorkflow(@Body() body: { companyId: string; stepId: string }, @Req() req?: any) {
    if (!body?.companyId || !body?.stepId) {
      throw new BadRequestException('companyId and stepId are required')
    }
    await this.svc.assertCompanyAccess(req.user.userId, body.companyId)
    // step run behavior can be extended; for now we simply refresh workflow state.
    return this.svc.getCloseWorkflow(req.user.userId, body.companyId)
  }
}
