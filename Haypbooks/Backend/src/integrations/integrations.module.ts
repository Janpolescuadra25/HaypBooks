import { Module } from '@nestjs/common'
import { IntegrationsService } from './integrations.service'
import { IntegrationsController } from './integrations.controller'
import { IntegrationsRepository } from './integrations.repository'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Module({
    providers: [IntegrationsService, IntegrationsRepository, PrismaService],
    controllers: [IntegrationsController],
    exports: [IntegrationsService],
})
export class IntegrationsModule { }
