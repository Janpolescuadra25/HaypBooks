import { Module } from '@nestjs/common'
import { BankingService } from './banking.service'
import { BankingController } from './banking.controller'
import { CompanyBankAccountsController } from './company-bank-accounts.controller'
import { BankingRepository } from './banking.repository'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { SubLedgerService } from '../shared/sub-ledger.service'
import { CurrencyModule } from '../currency/currency.module'

@Module({
    imports: [CurrencyModule],
    providers: [BankingService, BankingRepository, PrismaService, SubLedgerService],
    controllers: [BankingController, CompanyBankAccountsController],
    exports: [BankingService],
})
export class BankingModule { }
