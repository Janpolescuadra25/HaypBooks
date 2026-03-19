import { Module } from '@nestjs/common'
import { PrismaService } from '../repositories/prisma/prisma.service'
import { FinancialServicesController } from './financial-services.controller'
import { FinancialServicesService } from './financial-services.service'

@Module({
    providers: [FinancialServicesService, PrismaService],
    controllers: [FinancialServicesController],
    exports: [FinancialServicesService],
})
export class FinancialServicesModule { }
