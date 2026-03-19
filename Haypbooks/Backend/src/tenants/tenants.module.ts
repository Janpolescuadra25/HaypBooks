import { Module } from '@nestjs/common'
import { TenantsController } from './tenants.controller'
import { TenantsService } from './tenants.service'
import { PrismaRepositoriesModule } from '../repositories/prisma/prisma-repositories.module'
import { MailService } from '../common/mail.service'

@Module({
  imports: [PrismaRepositoriesModule],
  controllers: [TenantsController],
  providers: [TenantsService, MailService],
  exports: [TenantsService],
})
export class TenantsModule {}
