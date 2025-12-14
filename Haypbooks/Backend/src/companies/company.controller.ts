import { Controller, Post, Get, Body, Param } from '@nestjs/common'
import { CompanyService } from './company.service'

@Controller('api/companies')
export class CompaniesController {
  constructor(private readonly svc: CompanyService) {}

  @Post()
  async create(@Body() body: any) {
    return this.svc.createCompany(body)
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.svc.getCompany(id)
  }
}
