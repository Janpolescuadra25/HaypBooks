import {
  Controller, Post, Get, Body, Param, UseGuards, Req,
  Patch, Query, HttpCode, HttpStatus, NotFoundException,
  Put, Delete,
} from '@nestjs/common'
import { CompanyService } from './company.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CreateCompanyDto } from './dto/create-company.dto'
import { UpdateCompanyDto } from './dto/update-company.dto'
import { CompanyGrantAccessDto, CompanySendInviteDto } from './dto/company-access.dto'

@Controller('api/companies')
export class CompaniesController {
  constructor(private readonly svc: CompanyService) { }

  // ─── Create ───────────────────────────────────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Req() req: any, @Body() body: CreateCompanyDto) {
    const userId = req.user?.userId
    const payload: any = body
    // Resolve workspaceId: use explicit value, fall back to the user's owned workspace
    let resolvedWorkspaceId: string | undefined = body.workspaceId || (body as any).tenantId
    if (!resolvedWorkspaceId && userId) {
      const ownedWs = await this.svc.getOwnedWorkspaceId(userId)
      resolvedWorkspaceId = ownedWs ?? undefined
    }
    if (resolvedWorkspaceId) {
      return this.svc.createCompanyUnderTenant(resolvedWorkspaceId, {
        name: body.name,
        currency: body.currency,
        business: body.business,
      })
    }
    if (!payload.users && userId) {
      payload.users = { create: [{ userId, role: 'owner', isOwner: true, joinedAt: new Date(), status: 'ACTIVE' }] }
    }
    return this.svc.createCompany(payload)
  }

  // ─── List ─────────────────────────────────────────────────────────────────

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

  /**
   * Convenience endpoint used by the frontend to fetch the "current" company.
   * Returns the first item from the recent list or null when none exists.
   * Kept separate from `/companies/recent` so the hook fallback continues to work
   * even if the caller doesn't care about the full array.
   */
  @Get('current')
  @UseGuards(JwtAuthGuard)
  async current(@Req() req: any) {
    const userId = req.user?.userId
    const list = await this.svc.listRecentForUser(userId, 1)
    // return the full company record (the same shape as the recent list uses)
    if (Array.isArray(list) && list.length > 0) {
      return list[0]
    }
    return null
  }

  // ─── Single company CRUD ──────────────────────────────────────────────────

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async get(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.userId
    const company = await this.svc.getCompanyForUser(userId, id)
    if (!company) throw new NotFoundException()
    return company
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Req() req: any, @Param('id') id: string, @Body() body: UpdateCompanyDto) {
    const userId = req.user?.userId
    return this.svc.updateCompany(userId, id, body)
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async archive(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.userId
    return this.svc.archiveCompany(userId, id)
  }

  @Patch(':id/last-accessed')
  @UseGuards(JwtAuthGuard)
  async patchLastAccessed(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.userId
    return this.svc.updateLastAccessed(userId, id)
  }

  // ─── Settings ─────────────────────────────────────────────────────────────

  @Get(':id/settings')
  @UseGuards(JwtAuthGuard)
  async getSettings(@Req() req: any, @Param('id') id: string) {
    return this.svc.getSettings(req.user?.userId, id)
  }

  @Put(':id/settings')
  @UseGuards(JwtAuthGuard)
  async updateSettings(@Req() req: any, @Param('id') id: string, @Body() body: any) {
    return this.svc.updateSettings(req.user?.userId, id, body)
  }

  // ─── Company users ────────────────────────────────────────────────────────

  @Get(':id/users')
  @UseGuards(JwtAuthGuard)
  async listUsers(@Req() req: any, @Param('id') id: string) {
    return this.svc.listCompanyUsers(req.user?.userId, id)
  }

  @Post(':id/users')
  @UseGuards(JwtAuthGuard)
  async grantAccess(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: CompanyGrantAccessDto,
  ) {
    return this.svc.grantCompanyAccess(req.user?.userId, id, body.userId, body.roleId)
  }

  @Delete(':id/users/:targetUserId')
  @UseGuards(JwtAuthGuard)
  async revokeAccess(
    @Req() req: any,
    @Param('id') id: string,
    @Param('targetUserId') targetUserId: string,
  ) {
    return this.svc.revokeCompanyAccess(req.user?.userId, id, targetUserId)
  }

  @Patch(':id/users/:targetUserId/role')
  @UseGuards(JwtAuthGuard)
  async updateUserRole(
    @Req() req: any,
    @Param('id') id: string,
    @Param('targetUserId') targetUserId: string,
    @Body() body: { roleId: string },
  ) {
    return this.svc.updateUserRole(req.user?.userId, id, targetUserId, body.roleId)
  }

  // ─── Invites ──────────────────────────────────────────────────────────────

  @Get(':id/invites')
  @UseGuards(JwtAuthGuard)
  async listInvites(@Req() req: any, @Param('id') id: string) {
    return this.svc.listInvites(req.user?.userId, id)
  }

  @Post(':id/invites')
  @UseGuards(JwtAuthGuard)
  async sendInvite(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: CompanySendInviteDto,
  ) {
    return this.svc.sendInvite(req.user?.userId, id, body.email, body.roleId)
  }

  @Delete(':id/invites/:inviteId')
  @UseGuards(JwtAuthGuard)
  async cancelInvite(
    @Req() req: any,
    @Param('id') id: string,
    @Param('inviteId') inviteId: string,
  ) {
    return this.svc.cancelInvite(req.user?.userId, id, inviteId)
  }

  // ─── Roles ────────────────────────────────────────────────────────────────

  @Get(':id/roles')
  @UseGuards(JwtAuthGuard)
  async listRoles(@Req() req: any, @Param('id') id: string) {
    return this.svc.listRoles(req.user?.userId, id)
  }

  // ─── Invite accept (cross-company, no :id needed) ─────────────────────────

  @Post('invites/:inviteId/accept')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async acceptInvite(
    @Req() req: any,
    @Param('inviteId') inviteId: string,
    @Body() body: { setIsAccountant?: boolean } = {},
  ) {
    const userId = req.user?.userId
    return this.svc.acceptInvite(userId, inviteId, !!body.setIsAccountant)
  }

  // ─── Dashboard ─────────────────────────────────────────────────────────────

  @Get(':id/dashboard/summary')
  @UseGuards(JwtAuthGuard)
  async getDashboardSummary(@Req() req: any, @Param('id') id: string) {
    return this.svc.getDashboardSummary(req.user?.userId, id)
  }

  @Get(':id/dashboard/cash-position')
  @UseGuards(JwtAuthGuard)
  async getCashPosition(@Req() req: any, @Param('id') id: string) {
    return this.svc.getCashPosition(req.user?.userId, id)
  }

  @Get(':id/dashboard/receivables')
  @UseGuards(JwtAuthGuard)
  async getReceivables(@Req() req: any, @Param('id') id: string) {
    return this.svc.getReceivablesSummary(req.user?.userId, id)
  }

  @Get(':id/dashboard/payables')
  @UseGuards(JwtAuthGuard)
  async getPayables(@Req() req: any, @Param('id') id: string) {
    return this.svc.getPayablesSummary(req.user?.userId, id)
  }

  @Get(':id/dashboard/recent-transactions')
  @UseGuards(JwtAuthGuard)
  async getRecentTransactions(@Req() req: any, @Param('id') id: string) {
    return this.svc.getRecentTransactions(req.user?.userId, id)
  }

  @Get(':id/dashboard/upcoming')
  @UseGuards(JwtAuthGuard)
  async getUpcomingItems(@Req() req: any, @Param('id') id: string) {
    return this.svc.getUpcomingItems(req.user?.userId, id)
  }

  // ─── Business Health ───────────────────────────────────────────────────────

  @Get(':id/health/metrics')
  @UseGuards(JwtAuthGuard)
  async getHealthMetrics(@Req() req: any, @Param('id') id: string) {
    return this.svc.getHealthMetrics(req.user?.userId, id)
  }

  @Get(':id/health/liquidity')
  @UseGuards(JwtAuthGuard)
  async getLiquidity(@Req() req: any, @Param('id') id: string) {
    return this.svc.getLiquidityRatios(req.user?.userId, id)
  }

  @Get(':id/health/profitability')
  @UseGuards(JwtAuthGuard)
  async getProfitability(@Req() req: any, @Param('id') id: string) {
    return this.svc.getProfitabilityMetrics(req.user?.userId, id)
  }

  @Get(':id/health/trends')
  @UseGuards(JwtAuthGuard)
  async getHealthTrends(@Req() req: any, @Param('id') id: string) {
    return this.svc.getHealthTrends(req.user?.userId, id)
  }

  // ─── Overdue Items ─────────────────────────────────────────────────────────

  @Get(':id/overdue/all')
  @UseGuards(JwtAuthGuard)
  async getOverdueAll(@Req() req: any, @Param('id') id: string) {
    return this.svc.getOverdueItems(req.user?.userId, id)
  }

  @Get(':id/overdue/invoices')
  @UseGuards(JwtAuthGuard)
  async getOverdueInvoices(@Req() req: any, @Param('id') id: string) {
    return this.svc.getOverdueItems(req.user?.userId, id, 'invoices')
  }

  @Get(':id/overdue/bills')
  @UseGuards(JwtAuthGuard)
  async getOverdueBills(@Req() req: any, @Param('id') id: string) {
    return this.svc.getOverdueItems(req.user?.userId, id, 'bills')
  }
}




