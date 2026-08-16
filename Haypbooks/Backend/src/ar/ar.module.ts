import { Module } from '@nestjs/common'
import { ArService } from './ar.service'
import { ArController } from './ar.controller'
import { ArRepository } from './ar.repository'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { SubLedgerService } from '../shared/sub-ledger.service'
import { MailService } from '../common/mail.service'
import { AuditService } from '../audit/audit.service'
import { StatementScheduler } from './statement.scheduler'
import { CurrencyModule } from '../currency/currency.module'

@Module({
    imports: [CurrencyModule],
    providers: [ArService, ArRepository, PrismaService, SubLedgerService, MailService, StatementScheduler, AuditService],
    controllers: [ArController],
    exports: [ArService],
})
export class ArModule { }
