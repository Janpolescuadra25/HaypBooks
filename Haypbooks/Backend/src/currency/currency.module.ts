import { Module } from '@nestjs/common'
import { PrismaRepositoriesModule } from '../repositories/prisma/prisma-repositories.module'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { ExchangeRateService } from './exchange-rate.service'
import { CurrencyController } from './currency.controller'

@Module({
  imports: [PrismaRepositoriesModule],
  controllers: [CurrencyController],
  providers: [ExchangeRateService, PrismaService],
  exports: [ExchangeRateService],
})
export class CurrencyModule {}
