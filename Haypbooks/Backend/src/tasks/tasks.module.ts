import { Module } from '@nestjs/common'
import { TasksService } from './tasks.service'
import { TasksController } from './tasks.controller'
import { PrismaRepositoriesModule } from '../repositories/prisma/prisma-repositories.module'
import { ReminderService } from './reminder.service'

@Module({
  imports: [PrismaRepositoriesModule],
  providers: [TasksService, ReminderService],
  controllers: [TasksController],
  exports: [TasksService],
})
export class TasksModule {}
