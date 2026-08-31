import { Module } from '@nestjs/common'
import { InventoryService } from './inventory.service'
import { InventoryController } from './inventory.controller'
import { InventoryRepository } from './inventory.repository'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { SubLedgerService } from '../shared/sub-ledger.service'

@Module({
    providers: [InventoryService, InventoryRepository, PrismaService, SubLedgerService],
    controllers: [InventoryController],
    exports: [InventoryService],
})
export class InventoryModule { }
