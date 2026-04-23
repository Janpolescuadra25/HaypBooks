import { Module } from '@nestjs/common'
import { ExpensesController } from './expenses.controller'
import { ExpensesService } from './expenses.service'
import { ApModule } from '../ap/ap.module'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Module({
  imports: [ApModule],
  controllers: [ExpensesController],
  providers: [ExpensesService, PrismaService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
