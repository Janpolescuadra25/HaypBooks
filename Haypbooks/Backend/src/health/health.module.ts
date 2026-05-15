import { Module } from '@nestjs/common'
import { HealthController } from './health.controller'
import { PrismaRepositoriesModule } from '../repositories/prisma/prisma-repositories.module'

@Module({
  imports: [PrismaRepositoriesModule],
  controllers: [HealthController],
})
export class HealthModule {}
