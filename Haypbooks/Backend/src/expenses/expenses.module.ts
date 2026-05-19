import { Module } from '@nestjs/common'
import { ExpensesController } from './expenses.controller'
import { ExpensesService } from './expenses.service'
import { ExpensePolicyService } from './expense-policy.service'
import { ExpenseStatusTransitionGuard } from './expense-status-transition.guard'
import { ApModule } from '../ap/ap.module'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { AttachmentsModule } from '../attachments/attachments.module'
import { AuditModule } from '../audit/audit.module'
import { SubLedgerService } from '../shared/sub-ledger.service'

@Module({
  imports: [ApModule, AttachmentsModule, AuditModule],
  controllers: [ExpensesController],
  providers: [ExpensesService, ExpensePolicyService, ExpenseStatusTransitionGuard, PrismaService, SubLedgerService],
  exports: [ExpensesService],
})
export class ExpensesModule {}
