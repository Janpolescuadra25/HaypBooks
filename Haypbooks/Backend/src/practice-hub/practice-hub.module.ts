import { Module } from '@nestjs/common'
import { PracticeHubService } from './practice-hub.service'
import { PracticeHubController } from './practice-hub.controller'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Module({
  providers: [PracticeHubService, PrismaService],
  controllers: [PracticeHubController],
  exports: [PracticeHubService],
})
export class PracticeHubModule {}
