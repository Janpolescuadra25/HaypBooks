import { Module } from '@nestjs/common'
import { InventoryService } from './inventory.service'
import { InventoryController } from './inventory.controller'
import { PrismaRepositoriesModule } from '../repositories/prisma/prisma-repositories.module'
import { JournalService } from '../accounting/journal.service'

@Module({
  imports: [PrismaRepositoriesModule],
  providers: [InventoryService, JournalService],
  controllers: [InventoryController],
  exports: [InventoryService],
})
export class InventoryModule {}
