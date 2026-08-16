import { Module } from '@nestjs/common'
import { ZypraController } from './zypra.controller'
import { ZypraService } from './zypra.service'

@Module({
  controllers: [ZypraController],
  providers: [ZypraService],
  exports: [ZypraService],
})
export class ZypraModule {}
