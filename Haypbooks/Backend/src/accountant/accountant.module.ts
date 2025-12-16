import { Module } from '@nestjs/common'
import { AccountantController } from './accountant.controller'
import { AccountantService } from './accountant.service'
import { PrismaRepositoriesModule } from '../repositories/prisma/prisma-repositories.module'

@Module({
  imports: [PrismaRepositoriesModule],
  controllers: [AccountantController],
  providers: [AccountantService],
})
export class AccountantModule {}
