import { Module } from '@nestjs/common'
import { TimeController, TimeEntriesController, TimesheetsController } from './time.controller'
import { TimeService } from './time.service'
import { TimeRepository } from './time.repository'

@Module({
    controllers: [TimeController, TimeEntriesController, TimesheetsController],
    providers: [TimeService, TimeRepository],
    exports: [TimeService],
})
export class TimeModule { }
