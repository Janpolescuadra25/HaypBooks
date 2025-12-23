import { Module } from '@nestjs/common'
import { CompanyService } from './company.service'
import { CompaniesController } from './company.controller'
import { CompanyRepository } from './company.repository.prisma'
import { PrismaRepositoriesModule } from '../repositories/prisma/prisma-repositories.module'

@Module({
  imports: [PrismaRepositoriesModule],
  providers: [CompanyService, CompanyRepository],
  controllers: [CompaniesController],
  exports: [CompanyService],
})
export class CompaniesModule {}
