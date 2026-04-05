import { Module } from '@nestjs/common'
import { EmailTemplatesService } from './email-templates.service'
import { EmailTemplatesController } from './email-templates.controller'
import { EmailTemplatesRepository } from './email-templates.repository'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Module({
    providers: [EmailTemplatesService, EmailTemplatesRepository, PrismaService],
    controllers: [EmailTemplatesController],
    exports: [EmailTemplatesService],
})
export class EmailTemplatesModule { }
