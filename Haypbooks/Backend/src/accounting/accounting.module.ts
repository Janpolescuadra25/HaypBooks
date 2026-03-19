import { Module } from '@nestjs/common'
import { AccountingService } from './accounting.service'
import { AccountingController } from './accounting.controller'
import { CoaTemplatesController } from './coa-templates.controller'
import { AccountingRepository } from './accounting.repository'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Module({
    providers: [AccountingService, AccountingRepository, PrismaService],
    controllers: [AccountingController, CoaTemplatesController],
    exports: [AccountingService],
})
export class AccountingModule { }
