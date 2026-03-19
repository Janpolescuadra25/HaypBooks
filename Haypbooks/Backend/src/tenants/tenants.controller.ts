import { Controller, Get, Post, Body, Param, UseGuards, Req, HttpCode, HttpStatus, Query } from '@nestjs/common'
import { CreateInviteDto } from './dto/create-invite.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { TenantsService } from './tenants.service'

@Controller('api/tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  /**
   * Get list of tenants (clients) that the current user has access to
   * For accountants: returns all client tenants they're invited to
   * For owners: returns their own tenant
   */
  @Get()
  @UseGuards(JwtAuthGuard)
  async listTenants(@Req() req: any) {
    const userId = req.user?.userId
    return this.tenantsService.listTenantsForUser(userId)
  }

  /**
   * Get list of clients for accountant hub
   * Returns tenants with companies count and last accessed info
   */
  @Get('clients')
  @UseGuards(JwtAuthGuard)
  async listClients(@Req() req: any) {
    const userId = req.user?.userId
    return this.tenantsService.listClientsForAccountant(userId)
  }

  /**
   * Create a Practice under the authenticated user's owned workspace.
   * POST /api/tenants/practices  { name: string, servicesOffered?: string }
   */
  @Post('practices')
  @UseGuards(JwtAuthGuard)
  async createPractice(
    @Req() req: any,
    @Body() body: { name: string; servicesOffered?: string },
  ) {
    const userId = req.user?.userId
    return this.tenantsService.createPractice(userId, body.name, body.servicesOffered)
  }

  /**
   * Create an invite for a user to join a tenant
   * Owner invites accountant to access their tenant
   */
  @Post(':tenantId/invites')
  @UseGuards(JwtAuthGuard)
  async createInvite(
    @Req() req: any,
    @Param('tenantId') workspaceId: string,
    @Body() dto: CreateInviteDto,
  ) {
    const userId = req.user?.userId
    return this.tenantsService.createInvite(workspaceId, dto.email ?? null, userId, dto.roleId, dto.roleName, dto.isLinkInvite ?? false, dto.contactName, dto.message)
  }

  /**
   * Get pending invites for the current user
   * Shows invitations the user hasn't accepted yet (and any accepted/declined invite history)
   */
  @Get('invites/pending')
  @UseGuards(JwtAuthGuard)
  async getPendingInvites(@Req() req: any) {
    const email = req.user?.email
    return this.tenantsService.getPendingInvitesForEmail(email)
  }

  /**
   * Decline a pending invite for the current user
   */
  @Post('invites/:inviteId/decline')
  @UseGuards(JwtAuthGuard)
  async declineInvite(@Req() req: any, @Param('inviteId') inviteId: string) {
    const email = req.user?.email
    return this.tenantsService.declineInviteForEmail(email, inviteId)
  }

  @Post(':tenantId/invites/:inviteId/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelInvite(@Req() req: any, @Param('tenantId') tenantId: string, @Param('inviteId') inviteId: string) {
    const userId = req.user?.userId
    return this.tenantsService.cancelInviteByOwner(tenantId, userId, inviteId)
  }

  /**
   * Get details of a specific tenant
   */
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getTenant(@Req() req: any, @Param('id') id: string) {
    const userId = req.user?.userId
    return this.tenantsService.getTenantForUser(id, userId)
  }

  /**
   * Update last accessed time for a tenant
   * Called when accountant switches to a client
   */
  @Post(':tenantId/access')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async updateLastAccessed(
    @Req() req: any,
    @Param('tenantId') workspaceId: string
  ) {
    const userId = req.user?.userId
    return this.tenantsService.updateLastAccessed(workspaceId, userId)
  }
}
