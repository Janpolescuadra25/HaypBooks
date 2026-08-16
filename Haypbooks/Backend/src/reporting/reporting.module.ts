import { Module } from '@nestjs/common'
import { AccountingModule } from '../accounting/accounting.module'
import { CurrencyModule } from '../currency/currency.module'
import { ReportingService } from './reporting.service'
import { ReportingController } from './reporting.controller'
import { ReportingRepository } from './reporting.repository'
import { LedgerHealthService } from './ledger-health.service'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Module({
    imports: [AccountingModule, CurrencyModule],
    providers: [ReportingService, ReportingRepository, LedgerHealthService, PrismaService],
    controllers: [ReportingController],
    exports: [ReportingService],
})
export class ReportingModule { }
