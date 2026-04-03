import { Module } from '@nestjs/common'
import { GeneralLedgerService } from './general-ledger.service'
import { GeneralLedgerRepository } from './general-ledger.repository'
import { GeneralLedgerController } from './general-ledger.controller'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Module({
    providers: [GeneralLedgerService, GeneralLedgerRepository, PrismaService],
    controllers: [GeneralLedgerController],
    exports: [GeneralLedgerService],
})
export class GeneralLedgerModule { }
