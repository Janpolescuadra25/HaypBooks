import { Module } from '@nestjs/common'
import { PrismaRepositoriesModule } from '../repositories/prisma/prisma-repositories.module'
import { PayrollService } from './payroll.service'
import { PayrollController } from './payroll.controller'
import { JournalService } from '../accounting/journal.service'

@Module({
  imports: [PrismaRepositoriesModule],
  controllers: [PayrollController],
  providers: [PayrollService, JournalService],
  exports: [PayrollService]
})
export class PayrollModule {}
