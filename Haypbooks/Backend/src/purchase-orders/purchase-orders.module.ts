import { Module } from '@nestjs/common'
import { PurchaseOrdersService } from './purchase-orders.service'
import { PurchaseOrdersController } from './purchase-orders.controller'
import { PrismaRepositoriesModule } from '../repositories/prisma/prisma-repositories.module'
import { InventoryModule } from '../inventory/inventory.module'
import { JournalService } from '../accounting/journal.service'

@Module({
  imports: [PrismaRepositoriesModule, InventoryModule],
  providers: [PurchaseOrdersService, JournalService],
  controllers: [PurchaseOrdersController],
  exports: [PurchaseOrdersService],
})
export class PurchaseOrdersModule {}
