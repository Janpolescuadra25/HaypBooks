import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { AccountingService } from './accounting.service'

@Controller('api/accounting')
export class CoaTemplatesController {
  constructor(private readonly svc: AccountingService) {}

  @Get('coa-templates')
  async listTemplates(@Query('industry') industry?: string) {
    return this.svc.listCoaTemplates(industry)
  }

  @Post('coa-templates')
  async saveTemplates(@Body() templates: any[]) {
    return this.svc.saveCoaTemplates(templates)
  }
}
