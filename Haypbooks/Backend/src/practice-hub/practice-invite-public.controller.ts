import { Controller, Get, Param, NotFoundException, BadRequestException } from '@nestjs/common'
import { PracticeHubService } from './practice-hub.service'

@Controller('api/public/practice-invites')
export class PracticeInvitePublicController {
  constructor(private readonly service: PracticeHubService) {}

  @Get(':code')
  async validateInvite(@Param('code') code: string) {
    const invite = await this.service.getInviteByCode(code)
    return {
      practiceName: invite.practice.name,
      companyName: invite.companyName,
      engagementName: invite.engagementName,
      engagementType: invite.engagementType,
      startDate: invite.startDate.toISOString(),
      email: invite.email,
    }
  }
}
