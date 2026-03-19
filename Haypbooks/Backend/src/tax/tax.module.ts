import { Module } from '@nestjs/common'
import { TaxService } from './tax.service'
import { TaxController } from './tax.controller'
import { TaxRepository } from './tax.repository'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Module({
    providers: [TaxService, TaxRepository, PrismaService],
    controllers: [TaxController],
    exports: [TaxService],
})
export class TaxModule { }
