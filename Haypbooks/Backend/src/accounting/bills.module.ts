import { Module } from '@nestjs/common'
import { BillsService } from './bills.service'
import { BillsController } from './bills.controller'
import { PrismaRepositoriesModule } from '../repositories/prisma/prisma-repositories.module'

@Module({
  imports: [PrismaRepositoriesModule],
  providers: [BillsService],
  controllers: [BillsController],
  exports: [BillsService],
})
export class BillsModule {}
