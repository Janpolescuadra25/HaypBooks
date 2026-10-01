import { Module } from '@nestjs/common'
import { SalesController } from './sales.controller'
import { SalesService } from './sales.service'
import { ArModule } from '../ar/ar.module'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Module({
  imports: [ArModule],
  controllers: [SalesController],
  providers: [SalesService, PrismaService],
  exports: [SalesService],
})
export class SalesModule {}
