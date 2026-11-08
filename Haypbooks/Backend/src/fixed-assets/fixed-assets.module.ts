import { Module } from '@nestjs/common'
import { AuditModule } from '../audit/audit.module'
import { PrismaRepositoriesModule } from '../repositories/prisma/prisma-repositories.module'
import { FixedAssetsController } from './fixed-assets.controller'
import { FixedAssetsService } from './fixed-assets.service'

@Module({
  imports: [PrismaRepositoriesModule, AuditModule],
  controllers: [FixedAssetsController],
  providers: [FixedAssetsService],
  exports: [FixedAssetsService],
})
export class FixedAssetsModule {}
