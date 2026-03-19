import { Module } from '@nestjs/common'
import { PayrollService } from './payroll.service'
import { PayrollController } from './payroll.controller'
import { PayrollRepository } from './payroll.repository'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Module({
    providers: [PayrollService, PayrollRepository, PrismaService],
    controllers: [PayrollController],
    exports: [PayrollService],
})
export class PayrollModule { }
