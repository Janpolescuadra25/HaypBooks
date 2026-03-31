import { Module } from '@nestjs/common'
import { BankingService } from './banking.service'
import { BankingController } from './banking.controller'
import { CompanyBankAccountsController } from './company-bank-accounts.controller'
import { BankingRepository } from './banking.repository'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Module({
    providers: [BankingService, BankingRepository, PrismaService],
    controllers: [BankingController, CompanyBankAccountsController],
    exports: [BankingService],
})
export class BankingModule { }
