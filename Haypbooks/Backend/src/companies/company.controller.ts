import { Controller, Post, Get, Body, Param, Req, UseGuards } from '@nestjs/common'
import { CompanyService } from './company.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('api/companies')
export class CompaniesController {
  constructor(private readonly svc: CompanyService) {}

  @Post()
  async create(@Body() body: any) {
    return this.svc.createCompany(body)
  }

  // List companies accessible to the current user
  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@Req() req: any) {
    const userId = req.user?.userId
    return this.svc.listCompaniesForUser(userId)
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.svc.getCompany(id)
  }
}
