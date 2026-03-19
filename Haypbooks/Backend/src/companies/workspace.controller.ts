import { Controller, Get, Req, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { CompanyService } from './company.service'

/**
 * Workspace-level endpoints.
 * These are scoped to the authenticated user's workspace, not a specific company.
 */
@Controller('api/workspace')
export class WorkspaceController {
  constructor(private readonly svc: CompanyService) {}

  /**
   * GET /api/workspace/capabilities
   *
   * Returns the feature-flag capabilities for the current user's workspace.
   * The frontend uses this to show or hide sections of the navigation that
   * point to features that are not yet enabled for the workspace.
   */
  @Get('capabilities')
  @UseGuards(JwtAuthGuard)
  async getCapabilities(@Req() req: any) {
    const userId = req.user?.userId
    return this.svc.getWorkspaceCapabilities(userId)
  }
}
