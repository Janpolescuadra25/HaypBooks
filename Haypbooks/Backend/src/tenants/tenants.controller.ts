import { Controller, Get, Post, Body, Param, UseGuards, Req, HttpCode, HttpStatus, Query } from '@nestjs/common'
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
   * Create an invite for a user to join a tenant
   * Owner invites accountant to access their tenant
   */
  @Post(':tenantId/invites')
  @UseGuards(JwtAuthGuard)
  async createInvite(
    @Req() req: any,
    @Param('tenantId') workspaceId: string,
    @Body() body: { email: string; roleId?: string }
  ) {
    const userId = req.user?.userId
    return this.tenantsService.createInvite(workspaceId, body.email, userId, body.roleId)
  }

  /**
   * Get pending invites for the current user
   * Shows invitations the user hasn't accepted yet
   */
  @Get('invites/pending')
  @UseGuards(JwtAuthGuard)
  async getPendingInvites(@Req() req: any) {
    const email = req.user?.email
    return this.tenantsService.getPendingInvitesForEmail(email)
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
