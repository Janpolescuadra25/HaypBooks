import { Controller, Get, Param, Req, UnauthorizedException, NotFoundException, UseGuards, Post, Body, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PracticeHubService } from './practice-hub.service'
import { CreatePracticeInviteDto } from './dto/create-practice-invite.dto'
import { AcceptPracticeInviteDto } from './dto/accept-practice-invite.dto'

@UseGuards(JwtAuthGuard)
@Controller('api/practice-hub')
export class PracticeHubController {
  constructor(private readonly service: PracticeHubService) {}

  private extractWorkspaceId(req: any): string {
    const wsId = req.user?.workspaceId || req.user?.tenantId
    if (!wsId) throw new UnauthorizedException('No workspace context')
    return wsId
  }

  /** GET /api/practice-hub/dashboard — combined stats, activity, deadlines */
  @Get('dashboard')
  async getDashboard(@Req() req: any) {
    const wsId = this.extractWorkspaceId(req)
    const practice = await this.service.findPracticeByWorkspace(wsId)
    if (!practice) throw new NotFoundException('No practice found for this workspace')

    const [stats, activity, deadlines] = await Promise.all([
      this.service.getDashboardStats(practice.id),
      this.service.getRecentActivity(practice.id),
      this.service.getUpcomingDeadlines(practice.id),
    ])

    return { stats, activity, deadlines, practiceName: practice.name }
  }

  /** GET /api/practice-hub/stats */
  @Get('stats')
  async getStats(@Req() req: any) {
    const wsId = this.extractWorkspaceId(req)
    const practice = await this.service.findPracticeByWorkspace(wsId)
    if (!practice) throw new NotFoundException('No practice found')
    return this.service.getDashboardStats(practice.id)
  }

  /** GET /api/practice-hub/activity */
  @Get('activity')
  async getActivity(@Req() req: any) {
    const wsId = this.extractWorkspaceId(req)
    const practice = await this.service.findPracticeByWorkspace(wsId)
    if (!practice) throw new NotFoundException('No practice found')
    return this.service.getRecentActivity(practice.id)
  }

  /** GET /api/practice-hub/deadlines */
  @Get('deadlines')
  async getDeadlines(@Req() req: any) {
    const wsId = this.extractWorkspaceId(req)
    const practice = await this.service.findPracticeByWorkspace(wsId)
    if (!practice) throw new NotFoundException('No practice found')
    return this.service.getUpcomingDeadlines(practice.id)
  }

  /** GET /api/practice-hub/clients */
  @Get('clients')
  async getClients(@Req() req: any) {
    const wsId = this.extractWorkspaceId(req)
    const practice = await this.service.findPracticeByWorkspace(wsId)
    if (!practice) throw new NotFoundException('No practice found')
    return this.service.getClientList(practice.id)
  }

  /** POST /api/practice-hub/invites */
  @Post('invites')
  async createInvite(@Req() req: any, @Body() body: CreatePracticeInviteDto) {
    const userId = req.user?.userId
    return this.service.createInvite(userId, body)
  }

  /** GET /api/practice-hub/invites */
  @Get('invites')
  async listInvites(@Req() req: any) {
    const userId = req.user?.userId
    return this.service.getInvites(userId)
  }

  /** POST /api/practice-hub/invites/:code/accept */
  @Post('invites/:code/accept')
  async acceptInvite(@Req() req: any, @Param('code') code: string, @Body() body: AcceptPracticeInviteDto) {
    const userId = req.user?.userId
    return this.service.acceptInvite(userId, code, body.companyId)
  }
}
