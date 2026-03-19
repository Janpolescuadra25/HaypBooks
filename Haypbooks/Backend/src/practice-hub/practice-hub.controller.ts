import { Controller, Get, Param, Req, UnauthorizedException, NotFoundException, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { PracticeHubService } from './practice-hub.service'

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
}
