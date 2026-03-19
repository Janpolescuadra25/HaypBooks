import { Module } from '@nestjs/common'
import { ProjectsController, ChangeOrdersController, ProjectRetainersController, ProjectBillingController, ResourceAllocationController } from './projects.controller'
import { ProjectsService } from './projects.service'
import { ProjectsRepository } from './projects.repository'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Module({
    controllers: [ProjectsController, ChangeOrdersController, ProjectRetainersController, ProjectBillingController, ResourceAllocationController],
    providers: [ProjectsService, ProjectsRepository, PrismaService],
    exports: [ProjectsService],
})
export class ProjectsModule { }
