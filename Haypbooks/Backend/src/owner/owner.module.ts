import { Module } from '@nestjs/common'
import { OwnerController } from './owner.controller'
import { OwnerService } from './owner.service'
import { PrismaRepositoriesModule } from '../repositories/prisma/prisma-repositories.module'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Module({
  imports: [PrismaRepositoriesModule],
  controllers: [OwnerController],
  providers: [OwnerService, PrismaService],
  exports: [OwnerService],
})
export class OwnerModule {}
