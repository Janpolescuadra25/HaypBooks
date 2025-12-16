import { Module } from '@nestjs/common'
import { AccountantController } from './accountant.controller'
import { AccountantService } from './accountant.service'

@Module({
  controllers: [AccountantController],
  providers: [AccountantService],
})
export class AccountantModule {}
