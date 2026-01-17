import { Module } from '@nestjs/common'
import { TenantsController } from './tenants.controller'
import { TenantsService } from './tenants.service'
import { PrismaRepositoriesModule } from '../repositories/prisma/prisma-repositories.module'

@Module({
  imports: [PrismaRepositoriesModule],
  controllers: [TenantsController],
  providers: [TenantsService],
  exports: [TenantsService],
})
export class TenantsModule {}
