import { Module } from '@nestjs/common'
import { PayrollService } from './payroll.service'
import { PayrollController } from './payroll.controller'
import { PayrollRepository } from './payroll.repository'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { SubLedgerService } from '../shared/sub-ledger.service'

@Module({
    providers: [PayrollService, PayrollRepository, PrismaService, SubLedgerService],
    controllers: [PayrollController],
    exports: [PayrollService],
})
export class PayrollModule { }
