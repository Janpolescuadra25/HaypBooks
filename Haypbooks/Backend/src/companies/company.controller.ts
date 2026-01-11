import { Controller, Post, Get, Body, Param, UseGuards, Req, Patch, Query, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common'
import { CompanyService } from './company.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'

@Controller('api/companies')
export class CompaniesController {
  constructor(private readonly svc: CompanyService) {}

  // Require authentication for company creation so we can attach the creating user
  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: any, @Body() body: any) {
    const userId = req.user?.userId
    
    // Support creating additional companies under existing tenant
    if (body.tenantId) {
      return this.svc.createCompanyUnderTenant(body.tenantId, {
        name: body.name,
        currency: body.currency,
        business: body.business,
      })
    }
    
    // If caller didn't include a user association, attach the creating user as the owner
    if (!body.users && userId) {
      body = { ...(body || {}), users: { create: [{ userId, role: 'owner', isOwner: true, joinedAt: new Date(), status: 'ACTIVE' }] } }
    }
    return this.svc.createCompany(body)
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async list(@Req() req: any, @Query('filter') filter?: string) {
    const userId = req.user?.userId
    const email = req.user?.email
    return this.svc.listCompaniesForUser(userId, filter, email)
  }

  @Get('recent')
  @UseGuards(JwtAuthGuard)
  async recent(@Req() req: any, @Query('limit') limit?: string) {
    const userId = req.user?.userId
    const l = limit ? parseInt(limit, 10) : 10
    return this.svc.listRecentForUser(userId, l)
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async get(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.userId
    const company = await this.svc.getCompanyForUser(userId, id)
    if (!company) {
      throw new NotFoundException()
    }
    return company
  }

  @Patch(':id/last-accessed')
  @UseGuards(JwtAuthGuard)
  async patchLastAccessed(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.userId
    return this.svc.updateLastAccessed(userId, id)
  }

  @Post('invites/:inviteId/accept')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async acceptInvite(@Req() req: any, @Param('inviteId') inviteId: string, @Body() body: { setIsAccountant?: boolean } = {}) {
    const userId = req.user?.userId
    return this.svc.acceptInvite(userId, inviteId, !!body.setIsAccountant)
  }
}
