import { Module } from '@nestjs/common'
import { ApService } from './ap.service'
import { ApController } from './ap.controller'
import { ApRepository } from './ap.repository'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { AuditModule } from '../audit/audit.module'
import { SubLedgerService } from '../shared/sub-ledger.service'

@Module({
    imports: [AuditModule],
    providers: [ApService, ApRepository, PrismaService, SubLedgerService],
    controllers: [ApController],
    exports: [ApService],
})
export class ApModule { }
