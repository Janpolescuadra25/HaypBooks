import { Controller, Post, Get, Body, Param, UseGuards, Req, Patch } from '@nestjs/common'
import { CompanyService } from './company.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('api/companies')
export class CompaniesController {
  constructor(private readonly svc: CompanyService) {}

  @Post()
  async create(@Body() body: any) {
    return this.svc.createCompany(body)
  }

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

  @Patch(':id/last-accessed')
  @UseGuards(JwtAuthGuard)
  async patchLastAccessed(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.userId
    return this.svc.updateLastAccessed(userId, id)
  }
}
