import { Module } from '@nestjs/common'
import { PracticeController } from './practice.controller'
import { PracticeService } from './practice.service'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Module({
  imports: [],
  controllers: [PracticeController],
  providers: [PracticeService, PrismaService],
  exports: [PracticeService],
})
export class PracticeModule {}
