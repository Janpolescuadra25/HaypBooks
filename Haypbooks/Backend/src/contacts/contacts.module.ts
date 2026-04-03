import { Module } from '@nestjs/common'
import { ContactsService } from './contacts.service'
import { ContactsRepository } from './contacts.repository'
import { ContactsController } from './contacts.controller'
import { PrismaService } from '../repositories/prisma/prisma.service'

@Module({
  providers: [ContactsService, ContactsRepository, PrismaService],
  controllers: [ContactsController],
  exports: [ContactsService],
})
export class ContactsModule {}
