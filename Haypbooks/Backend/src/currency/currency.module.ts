import { Module } from '@nestjs/common'
import { PrismaRepositoriesModule } from '../repositories/prisma/prisma-repositories.module'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { ExchangeRateService } from './exchange-rate.service'

@Module({
  imports: [PrismaRepositoriesModule],
  providers: [ExchangeRateService, PrismaService],
  exports: [ExchangeRateService],
})
export class CurrencyModule {}
