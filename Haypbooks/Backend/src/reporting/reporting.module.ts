import { Module } from '@nestjs/common'
import { ReportingService } from './reporting.service'
import { ReportingController } from './reporting.controller'
import { ReportingRepository } from './reporting.repository'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Module({
    providers: [ReportingService, ReportingRepository, PrismaService],
    controllers: [ReportingController],
    exports: [ReportingService],
})
export class ReportingModule { }
