import { Controller, Get, Post, Body, Query } from '@nestjs/common'
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
}
