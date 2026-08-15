import { Module } from '@nestjs/common'
import { PracticeHubService } from './practice-hub.service'
import { PracticeHubController } from './practice-hub.controller'
import { PracticeInvitePublicController } from './practice-invite-public.controller'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { MailService } from '../common/mail.service'

@Module({
  providers: [PracticeHubService, PrismaService, MailService],
  controllers: [PracticeHubController, PracticeInvitePublicController],
  exports: [PracticeHubService],
})
export class PracticeHubModule {}
