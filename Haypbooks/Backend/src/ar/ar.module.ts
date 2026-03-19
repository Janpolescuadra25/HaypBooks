import { Module } from '@nestjs/common'
import { ArService } from './ar.service'
import { ArController } from './ar.controller'
import { ArRepository } from './ar.repository'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { SubLedgerService } from '../shared/sub-ledger.service'

@Module({
    providers: [ArService, ArRepository, PrismaService, SubLedgerService],
    controllers: [ArController],
    exports: [ArService],
})
export class ArModule { }
